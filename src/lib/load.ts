import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { ZodError } from 'zod';
import { needSchema, toolSchema, validateCollection, type Need, type Tool } from '../schema';

// Anchored to the working directory, not `import.meta.url`: Astro bundles this module into
// dist/.prerender/ before running getStaticPaths, so a path relative to the module would resolve
// inside dist/ instead of the repo. Both `astro build` and the scripts run from the project root.
const DEFAULT_DATA_DIR = join(process.cwd(), 'data');

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Turns a Zod failure into one line per bad field, prefixed with the file it came from. A raw Zod
 * dump never names the file, which is the first thing a contributor needs to know.
 */
const describeParseFailure = (relativePath: string, error: unknown): string => {
  const issues = error instanceof ZodError ? error.issues : [];
  if (issues.length === 0) return `${relativePath}: ${(error as Error).message}`;

  return issues
    .map((issue) => {
      const field = issue.path.join('.') || '(root)';
      return `${relativePath} → ${field}: ${issue.message}`;
    })
    .join('\n  - ');
};

export type LoadedData = {
  needs: Need[];
  tools: Tool[];
  toolsByNeed: Map<string, Tool[]>;
};

/**
 * Reads and validates the whole dataset. Throws on any invalid data so that a broken entry fails
 * the build rather than silently rendering a page with a tool missing.
 */
export function loadData({
  dataDir = DEFAULT_DATA_DIR,
  today = todayISO(),
}: { dataDir?: string; today?: string } = {}): LoadedData {
  const errors: string[] = [];

  const rawNeeds = parseYaml(readFileSync(join(dataDir, 'needs.yml'), 'utf8'));
  let needs: Need[] = [];
  try {
    needs = needSchema.array().parse(rawNeeds);
  } catch (error) {
    errors.push(describeParseFailure('data/needs.yml', error));
  }

  const toolsDir = join(dataDir, 'tools');
  const tools: Tool[] = [];
  for (const file of readdirSync(toolsDir).filter((name) => name.endsWith('.yml'))) {
    const raw = parseYaml(readFileSync(join(toolsDir, file), 'utf8'));
    try {
      tools.push({ ...toolSchema.parse(raw), slug: basename(file, '.yml') });
    } catch (error) {
      errors.push(describeParseFailure(`data/tools/${file}`, error));
    }
  }
  tools.sort((a, b) => a.name.localeCompare(b.name));

  errors.push(...validateCollection({ needs, tools, today }));

  if (errors.length > 0) {
    throw new Error(`Invalid data:\n  - ${errors.join('\n  - ')}`);
  }

  const toolsByNeed = new Map<string, Tool[]>(needs.map((need) => [need.slug, []]));
  for (const tool of tools) {
    for (const needSlug of tool.needs) toolsByNeed.get(needSlug)!.push(tool);
  }

  return { needs, tools, toolsByNeed };
}
