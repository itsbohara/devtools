import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { needSchema, toolSchema, validateCollection, type Need, type Tool } from '../schema';

// Anchored to the working directory, not `import.meta.url`: Astro bundles this module into
// dist/.prerender/ before running getStaticPaths, so a path relative to the module would resolve
// inside dist/ instead of the repo. Both `astro build` and the scripts run from the project root.
const DEFAULT_DATA_DIR = join(process.cwd(), 'data');

const todayISO = () => new Date().toISOString().slice(0, 10);

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
  const rawNeeds = parseYaml(readFileSync(join(dataDir, 'needs.yml'), 'utf8'));
  const needs = needSchema.array().parse(rawNeeds);

  const toolsDir = join(dataDir, 'tools');
  const tools: Tool[] = readdirSync(toolsDir)
    .filter((file) => file.endsWith('.yml'))
    .map((file) => {
      const raw = parseYaml(readFileSync(join(toolsDir, file), 'utf8'));
      return { ...toolSchema.parse(raw), slug: basename(file, '.yml') };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const errors = validateCollection({ needs, tools, today });
  if (errors.length > 0) {
    throw new Error(`Invalid data:\n${errors.map((error) => `  - ${error}`).join('\n')}`);
  }

  const toolsByNeed = new Map<string, Tool[]>(needs.map((need) => [need.slug, []]));
  for (const tool of tools) {
    for (const needSlug of tool.needs) toolsByNeed.get(needSlug)!.push(tool);
  }

  return { needs, tools, toolsByNeed };
}
