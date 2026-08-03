// Astro's BASE_URL is '/devtools' when served from a project page but '/' on a custom domain.
// Naive template joining (`${base}/need/x`) silently produces '//need/x' in the second case, so
// every internal link goes through here instead.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path = ''): string => {
  const suffix = path.replace(/^\//, '');
  if (!suffix) return base || '/';
  return `${base}/${suffix}`;
};
