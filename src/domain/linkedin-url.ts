// LinkedIn job links from alert emails → job ID + canonical URL (PLAN.md §5.3).
// Query strings carry tracking and one-time login tokens (otpToken, midToken, …), so they are always dropped.

export interface LinkedInJobLink {
  jobId: string;
  url: string;
}

const HOSTS = new Set(['www.linkedin.com', 'linkedin.com']);
const JOB_PATH = /^\/(?:comm\/)?jobs\/view\/(\d{1,20})\/?$/;

export function canonicalizeJobUrl(link: string): LinkedInJobLink | null {
  const parsed = URL.parse(link.trim());
  if (parsed?.protocol !== 'https:' || !HOSTS.has(parsed.hostname)) return null;
  if (parsed.port !== '' || parsed.username !== '' || parsed.password !== '') return null;

  const jobId = JOB_PATH.exec(parsed.pathname)?.[1];
  if (jobId === undefined) return null;

  return { jobId, url: `https://www.linkedin.com/jobs/view/${jobId}/` };
}
