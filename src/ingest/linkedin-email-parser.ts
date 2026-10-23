import { canonicalizeJobUrl } from '../domain/linkedin-url.ts';

// Turns the plain-text body of a LinkedIn job email into structured jobs (PLAN.md FR-03).
// Two body formats exist (verified against the owner's emails, 2026-10-23):
//   digest           jobalerts-noreply: "Your job alert for <saved search>", then job blocks
//   recommendations  jobs-noreply: "Expand your search", then titled sections of job blocks
// A job block is title / company / location, optional insight lines, then "View job: <url>".
// Blocks are separated by dashed lines; section headings and footers sit next to bare links.
// If any block can't be read, the whole email is unrecognized (FR-12): a format change then
// shows up on /runs instead of silently losing jobs.

export interface AlertEmail {
  sender: string;
  subject: string;
  plainText: string;
}

export type EmailFormat = 'digest' | 'recommendations';

export interface ParsedJob {
  linkedinJobId: string;
  title: string;
  company: string;
  location: string; // '' when the email has no location line
  url: string; // canonical, without query parameters
  activelyHiring: boolean;
  easyApply: boolean;
}

export interface ParsedEmail {
  format: EmailFormat;
  savedSearch: string | null;
  jobs: ParsedJob[];
}

export interface UnrecognizedEmail {
  unrecognized: string;
}

export type ParseResult = ParsedEmail | UnrecognizedEmail;

const DIGEST_HEADER = /^Your job alert for(?:\s+(.*))?$/;
const DIGEST_COUNT_LINE = /^(?:\d+\+? )?new jobs? match(?:es)? your preferences\.?$/i;
const RECOMMENDATIONS_HEADER = 'Expand your search';

const VIEW_JOB = /^View job:\s*(\S+)$/;
const SEPARATOR = /^-{10,}$/;
const HAS_LINK = /https?:\/\//;

const ACTIVELY_HIRING = 'This company is actively hiring';
const EASY_APPLY = 'Apply with resume & profile';
// Every line LinkedIn has been seen adding under the location. Only the two flags above are stored,
// but all of them must be told apart from the location when the location line is missing.
const INSIGHT_LINE =
  /^(?:This company is actively hiring|Apply with resume & profile|Fast growing|Top applicant|\d+ connections?|\d+ company alum(?:s|ni)?)$/i;

export function parseAlertEmail(email: AlertEmail): ParseResult {
  if (!isLinkedInSender(email.sender)) return unrecognized('sender is not a linkedin.com address');

  const lines = email.plainText
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim());
  const first = lines.findIndex((line) => line !== '');
  const header = lines[first] ?? '';

  let format: EmailFormat;
  let savedSearch: string | null;
  let bodyStart: number;
  const digestHeader = DIGEST_HEADER.exec(header);
  if (digestHeader) {
    format = 'digest';
    savedSearch = digestHeader[1] ?? '';
    if (savedSearch === '') return unrecognized('digest without a saved search name');
    if (!DIGEST_COUNT_LINE.test(lines[first + 1] ?? '')) return unrecognized('digest without a job count line');
    bodyStart = first + 2;
  } else if (header === RECOMMENDATIONS_HEADER) {
    format = 'recommendations';
    savedSearch = null;
    bodyStart = first + 1;
  } else {
    return unrecognized('unknown email format');
  }

  const jobs: ParsedJob[] = [];
  const seen = new Set<string>();
  let block: string[] = [];
  let blockNumber = 0;
  for (const line of lines.slice(bodyStart)) {
    const viewJob = VIEW_JOB.exec(line);
    if (viewJob) {
      blockNumber += 1;
      const job = parseBlock(block, viewJob[1] ?? '');
      if (typeof job === 'string') return unrecognized(`job ${String(blockNumber)}: ${job}`);
      // The same job can appear in two sections of one email; it is still one sighting.
      if (!seen.has(job.linkedinJobId)) {
        seen.add(job.linkedinJobId);
        jobs.push(job);
      }
      block = [];
    } else if (SEPARATOR.test(line) || HAS_LINK.test(line)) {
      block = [];
    } else if (line !== '') {
      block.push(line);
    }
  }

  if (jobs.length === 0) return unrecognized('no jobs found');
  return { format, savedSearch, jobs };
}

function parseBlock(lines: readonly string[], href: string): ParsedJob | string {
  const link = canonicalizeJobUrl(href);
  if (link === null) return 'link is not a LinkedIn job link';

  const [title, company, ...rest] = lines;
  if (title === undefined || company === undefined) return 'missing title or company';

  const [maybeLocation] = rest;
  const location = maybeLocation === undefined || INSIGHT_LINE.test(maybeLocation) ? '' : maybeLocation;

  return {
    linkedinJobId: link.jobId,
    title,
    company,
    location,
    url: link.url,
    activelyHiring: rest.includes(ACTIVELY_HIRING),
    easyApply: rest.includes(EASY_APPLY),
  };
}

function isLinkedInSender(sender: string): boolean {
  // Accepts a bare address or a display-name form like "LinkedIn <jobalerts-noreply@linkedin.com>".
  const address = /<([^<>]+)>\s*$/.exec(sender)?.[1] ?? sender;
  return /^[^@\s]+@linkedin\.com$/i.test(address.trim());
}

function unrecognized(reason: string): UnrecognizedEmail {
  return { unrecognized: reason };
}
