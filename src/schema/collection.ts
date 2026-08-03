import type { Need, Tool } from './records';

const duplicates = (values: string[]): string[] => {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes];
};

/**
 * Cross-record rules that a per-record schema cannot express. Returns every problem found rather
 * than throwing on the first, so a contributor fixing a PR sees the whole list in one run.
 */
export function validateCollection({
  needs,
  tools,
  today,
}: {
  needs: Need[];
  tools: Tool[];
  today: string;
}): string[] {
  const errors: string[] = [];

  for (const slug of duplicates(needs.map((need) => need.slug))) {
    errors.push(`duplicate need slug "${slug}" in data/needs.yml — remove one of the entries`);
  }
  for (const slug of duplicates(tools.map((tool) => tool.slug))) {
    errors.push(`duplicate tool slug "${slug}" — two files in data/tools/ resolve to the same name`);
  }

  const knownNeeds = new Set(needs.map((need) => need.slug));
  for (const tool of tools) {
    for (const needSlug of tool.needs) {
      if (!knownNeeds.has(needSlug)) {
        errors.push(
          `tool "${tool.slug}" references unknown need "${needSlug}" — add it to data/needs.yml or fix the typo`,
        );
      }
    }
    // Plain string comparison is correct and timezone-free for zero-padded ISO dates.
    if (tool.verified > today) {
      errors.push(
        `tool "${tool.slug}" has a verified date in the future (${tool.verified}) — set it to today or earlier`,
      );
    }
  }

  const servedNeeds = new Set(tools.flatMap((tool) => tool.needs));
  for (const need of needs) {
    if (!servedNeeds.has(need.slug)) {
      errors.push(
        `need "${need.slug}" has no tools — it would render an empty page, so add a tool or remove the need`,
      );
    }
  }

  return errors;
}
