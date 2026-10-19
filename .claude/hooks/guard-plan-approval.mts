// PreToolUse hook: only a human may approve a test plan. Blocks any Claude or subagent tool call
// that would leave stlc/<feature>/02-test-plan.md with `status: approved`: setting it, or changing
// a plan that is already approved (an agent may set it back to draft for re-approval). A person
// approves by editing the file in their editor, which is not a tool call.
// Exit 2 blocks the call; Claude sees stderr as the reason.
import { existsSync, readFileSync } from 'node:fs';

export interface HookInput {
  tool_name?: string;
  tool_input?: {
    file_path?: string;
    content?: string;
    old_string?: string;
    new_string?: string;
    replace_all?: boolean;
    edits?: { old_string: string; new_string: string; replace_all?: boolean }[];
    command?: string;
  };
}

const PLAN_FILE = /[\\/]stlc[\\/][^\\/]+[\\/]02-test-plan\.md$/;
const APPROVED = /^status:\s*approved\b/m;

const applyEdit = (text: string, from: string, to: string, all = false) => (all ? text.split(from).join(to) : text.replace(from, () => to));

/** Returns the reason to block, or undefined to let the normal permission flow decide. */
export function decide(input: HookInput, read: (path: string) => string | undefined): string | undefined {
  const tool = input.tool_name ?? '';
  const args = input.tool_input ?? {};
  const reason = (file: string) =>
    `Blocked: only a human approves a test plan. ${file} would end up with "status: approved". ` +
    'Leave it as draft and ask the user to review the plan and set status: approved in their editor.';

  if (tool === 'Bash' || tool === 'PowerShell') {
    const cmd = args.command ?? '';
    return /02-test-plan/.test(cmd) && /approved/i.test(cmd) ? reason('stlc/<feature>/02-test-plan.md') : undefined;
  }

  const file = args.file_path ?? '';
  if (!PLAN_FILE.test(file)) return undefined;
  const current = read(file) ?? '';

  let after: string;
  if (tool === 'Write') after = args.content ?? '';
  else if (tool === 'Edit') after = applyEdit(current, args.old_string ?? '', args.new_string ?? '', args.replace_all);
  else if (tool === 'MultiEdit') after = (args.edits ?? []).reduce((t, e) => applyEdit(t, e.old_string, e.new_string, e.replace_all), current);
  else return undefined;

  return after !== current && APPROVED.test(after) ? reason(file) : undefined;
}

if (import.meta.main) {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}') as HookInput;
  const blocked = decide(input, (path) => (existsSync(path) ? readFileSync(path, 'utf8') : undefined));
  if (blocked) {
    process.stderr.write(blocked);
    process.exit(2);
  }
}
