// UserPromptSubmit hook: asks Jev (TypeSafe) which agent-skills skills fit the
// prompt and hands the picks to Claude as additional context for this turn.
// It never blocks a prompt: on any failure it reports why and lets the turn run.
import { appendFileSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { noul, type NoulQuestion, TypeSafeClient } from '@typesafe-ai/sdk';

const PLUGIN_ID = 'agent-skills@addy-agent-skills';
const SKILL_PREFIX = 'agent-skills:';
// using-agent-skills is the plugin's own skill router; Jev replaces it.
const EXCLUDED_SKILLS = new Set(['using-agent-skills']);
const THRESHOLD = 0.5; // minimum probability of yes for a skill to be picked
const MAX_PICKS = 3;
const MAX_PROMPT_CHARS = 12_000; // keeps state + longest question well under Jev's 32k-token limit
const REPOSITORY =
  'A Playwright + TypeScript end-to-end test suite (page objects, fixtures, axe-core accessibility scans, performance budgets, Artillery load tests) for the 36 practice labs on the live Stagecraft Labs site, each lab mapped to a JIRA story.';

interface HookInput {
  prompt?: string;
  cwd?: string;
}

interface Skill {
  name: string;
  description: string;
}

const input = JSON.parse(readFileSync(0, 'utf8') || '{}') as HookInput;
const prompt = input.prompt?.trim() ?? '';
const projectDir = process.env['CLAUDE_PROJECT_DIR'] ?? input.cwd ?? process.cwd();
const logFile = join(projectDir, '.claude', 'jev-routing.log');

function log(entry: Record<string, unknown>): void {
  try {
    appendFileSync(logFile, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
  } catch {
    // Logging is best-effort.
  }
}

function emit(systemMessage: string, additionalContext?: string): void {
  process.stdout.write(
    JSON.stringify({
      systemMessage,
      ...(additionalContext && {
        hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext },
      }),
    }),
  );
}

function loadSkills(): Skill[] {
  const configDir = process.env['CLAUDE_CONFIG_DIR'] ?? join(homedir(), '.claude');
  const installed = JSON.parse(readFileSync(join(configDir, 'plugins', 'installed_plugins.json'), 'utf8')) as {
    plugins: Record<string, { installPath: string }[]>;
  };
  const installPath = installed.plugins[PLUGIN_ID]?.[0]?.installPath;
  if (!installPath) throw new Error(`plugin ${PLUGIN_ID} is not installed`);

  const skillsDir = join(installPath, 'skills');
  const skills: Skill[] = [];
  for (const dir of readdirSync(skillsDir)) {
    let text: string;
    try {
      text = readFileSync(join(skillsDir, dir, 'SKILL.md'), 'utf8');
    } catch {
      continue;
    }
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
    const field = (key: string) =>
      new RegExp(`^${key}:\\s*(.+)$`, 'm')
        .exec(frontmatter)?.[1]
        ?.trim()
        .replace(/^(['"])(.*)\1$/, '$2');
    const name = field('name');
    const description = field('description');
    if (name && description && !EXCLUDED_SKILLS.has(name)) skills.push({ name, description });
  }
  if (skills.length === 0) throw new Error(`no skills found in ${skillsDir}`);
  return skills;
}

async function main(): Promise<void> {
  // Slash commands already name what to run.
  if (!prompt || prompt.startsWith('/')) return;

  try {
    process.loadEnvFile(join(projectDir, '.env'));
  } catch {
    // No .env file; the key may come from the environment instead.
  }
  if (!process.env['TYPESAFE_API_KEY']?.trim()) {
    emit('Jev skill routing skipped: TYPESAFE_API_KEY is not set (see .env.example).');
    return;
  }

  const started = performance.now();
  try {
    const skills = loadSkills();
    const questions: Record<string, NoulQuestion> = {};
    for (const { name, description } of skills) {
      questions[name] = noul(`Should Claude Code load the "${name}" skill before handling \`user_prompt\`? What the skill covers: ${description}`, {
        true: 'The prompt asks for work this skill is written for, so following the skill would shape how the work is done.',
        false: 'The prompt is about something else, or the skill would be only tangentially relevant.',
      });
    }

    const client = new TypeSafeClient({ logLevel: 'off', timeout: 8_000, retry: { maxRetries: 1 } });
    const { model, answers, usage } = await client.systemOne({
      state: { user_prompt: prompt.slice(0, MAX_PROMPT_CHARS), repository: REPOSITORY },
      questions,
    });

    const ranked = Object.entries(answers)
      .map(([name, answer]) => ({ name, p: answer.noul }))
      .sort((a, b) => b.p - a.p);
    const picks = ranked.filter(({ p }) => p >= THRESHOLD).slice(0, MAX_PICKS);

    log({
      prompt: prompt.slice(0, 300),
      picks: picks.map(({ name }) => name),
      probabilities: Object.fromEntries(ranked.map(({ name, p }) => [name, Math.round(p * 1000) / 1000])),
      model,
      input_tokens: usage.input_tokens,
      ms: Math.round(performance.now() - started),
    });

    if (picks.length === 0) {
      emit(
        'Jev → no agent-skills skill',
        '<jev_skill_routing>\nJev (TypeSafe) found no agent-skills skill that fits this prompt. Do not load an agent-skills skill unless the user asks for one.\n</jev_skill_routing>',
      );
      return;
    }

    const list = picks.map(({ name, p }) => `- ${SKILL_PREFIX}${name} (p=${p.toFixed(2)})`).join('\n');
    emit(
      `Jev → ${picks.map(({ name }) => name).join(', ')}`,
      `<jev_skill_routing>\nJev (TypeSafe) picked these agent-skills skills for this prompt, most relevant first:\n${list}\nLoad each one with the Skill tool before starting the work, and follow it. Do not load other agent-skills skills unless the user asks for one.\n</jev_skill_routing>`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log({ prompt: prompt.slice(0, 300), error: message, ms: Math.round(performance.now() - started) });
    emit(`Jev skill routing failed: ${message}`);
  }
}

await main();
