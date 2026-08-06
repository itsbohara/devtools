import { z } from 'zod';

export const PRICING = ['free', 'freemium', 'oss-selfhost', 'trial'] as const;

const kebabSlug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be lowercase kebab-case');

// Comparing the re-serialised date back to the input is what rejects dates like 2026-02-31, which
// `Date` would otherwise silently roll forward to March 3rd.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
  }, 'must be a real calendar date');

export const needSchema = z.object({
  slug: kebabSlug,
  question: z.string().min(1),
  h1: z.string().min(1),
  group: z.string().min(1),
  aliases: z.array(z.string().min(1)).default([]),
});

export const toolSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
  needs: z.array(kebabSlug).min(1),
  pricing: z.enum(PRICING),
  note: z.string().min(1).max(200),
  verified: isoDate,
  featured: z.boolean().default(false),
});

export type Need = z.infer<typeof needSchema>;
export type Tool = z.infer<typeof toolSchema> & { slug: string };
