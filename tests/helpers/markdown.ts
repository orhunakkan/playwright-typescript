import { readFileSync } from 'node:fs';

// Reads the agent's procedure files (agent/*.md) so tests can check the examples and commands in them.

export interface LabeledBlock {
  label: string; // the text after "<!-- contract: " or "<!-- command: "
  lang: string;
  code: string;
}

export function readRepoFile(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8').replace(/\r\n?/g, '\n');
}

/** Every fenced code block that directly follows an `<!-- <kind>: <label> -->` comment. */
export function labeledBlocks(markdown: string, kind: string): LabeledBlock[] {
  const pattern = new RegExp(`<!-- ${kind}: (.+?) -->\\n+\`\`\`(\\w*)\\n([\\s\\S]*?)\\n\`\`\``, 'g');
  return [...markdown.matchAll(pattern)].map(([, label = '', lang = '', code = '']) => ({ label, lang, code }));
}

export interface CurlCall {
  method: string;
  path: string;
  dataFile: string | null; // the file after --data-binary @, if any
}

/** Every curl command in bash code blocks, with `\` line continuations joined. */
export function curlCalls(markdown: string): CurlCall[] {
  const bash = [...markdown.matchAll(/```bash\n([\s\S]*?)\n```/g)].map(([, code = '']) => code.replace(/\\\n\s*/g, ''));
  return bash
    .flatMap((code) => code.split('\n'))
    .filter((line) => line.trimStart().startsWith('curl '))
    .map((line) => {
      const url = /"?(https?:\/\/[^\s"]+)"?/.exec(line)?.[1] ?? '';
      return {
        method: /-X (\w+)/.exec(line)?.[1] ?? 'GET',
        path: url,
        dataFile: /--data-binary @(\S+)/.exec(line)?.[1] ?? null,
      };
    });
}
