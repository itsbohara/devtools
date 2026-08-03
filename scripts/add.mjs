import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const [url] = process.argv.slice(2);

if (!url) {
  console.error('usage: pnpm add-tool <url>');
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(url);
} catch {
  console.error(`✗ "${url}" is not a valid URL — include the https:// prefix`);
  process.exit(1);
}

const slug = [parsed.hostname.replace(/^www\./, ''), parsed.pathname]
  .join('-')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const file = join('data', 'tools', `${slug}.yml`);

if (existsSync(file)) {
  console.error(`✗ ${file} already exists`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

mkdirSync(join('data', 'tools'), { recursive: true });
writeFileSync(
  file,
  `name: TODO
url: ${url}
needs: [TODO]        # slugs from data/needs.yml
pricing: TODO        # free | freemium | oss-selfhost | trial
note: TODO           # why this is the pick, or what the catch is
verified: ${today}
`,
);

console.log(`→ ${file}`);
spawnSync(process.env.EDITOR ?? 'vi', [file], { stdio: 'inherit' });
