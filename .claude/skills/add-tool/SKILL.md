---
name: add-tool
description: Use when adding a developer tool to this index, or triaging a tool suggestion — researches the live product page, verifies what is actually true, asks what the page cannot answer, then writes a validated data/tools/*.yml entry. Triggers on "add <url>", "add this tool", "should we add X", "triage the tool issues".
---

# Adding a tool to the index

## The one rule

**The `note` is the product. Volume is not.**

Anyone can list 400 tools. This index is worth using because each entry says *why it is the pick* or
*what the catch is*, and because someone actually used it. A confidently-worded note invented from
training data is worse than no entry — it makes the whole index untrustworthy, which is the exact
failure this repo exists to avoid.

So: research first, ask rather than guess, and never state a limit you have not seen.

## Step 1 — Research the live page

Fetch the product page, and its pricing page if there is one. Do not skip this even for a tool you
think you know; free tiers change quietly and that change is the whole point of the `verified` date.

Then report findings in three explicit buckets, so the human can see what is grounded:

```
CONFIRMED ON PAGE
  - Free tier exists, no card required at signup
  - MIT licensed
UNCLEAR / NOT STATED
  - Whether the free tier expires
  - Request limits (pricing page lists none)
CANNOT VERIFY FROM PAGE
  - Whether it is still actively maintained
```

If the page is unreachable, say so and stop. Do not fall back on what you remember.

**Never invent numbers.** No "500 builds/month", no "10GB free", no "resets monthly" unless that
string is on the page you just read. A vague-but-true note beats a specific-but-stale one.

## Step 2 — Classify

Read `data/needs.yml` for the current taxonomy — never work from a remembered list, the slugs change.

Pick every need the tool genuinely serves. A tool serving 2+ needs gets its own `/tool/` page, so
this is a real decision, not a formality. Do not pad: "Cloudflare technically does DNS" is only
worth listing if someone would come here looking for it.

Then pick `pricing`, honestly:

| Value | Means |
|---|---|
| `free` | Free forever. No paid tier gates the useful part. |
| `oss-selfhost` | Open source. Free if you run it yourself. |
| `freemium` | Genuinely usable free tier, paid plans above it. |
| `trial` | **Time-limited only.** Renders as a warning badge, not a recommendation. |

If a tool that used to be `freemium` now only offers a trial, **demote it to `trial` rather than
deleting it.** That demotion is the honest record of the rot other lists hide.

## Step 3 — Ask what the page cannot tell you

This is the part a script cannot do. Ask only questions the research did not already answer, and
prefer concrete ones. Good questions:

- **"Have you actually used this?"** If no, say plainly that the entry should wait. This is a gate,
  not a formality — an unused tool cannot get an honest note.
- **"What made you keep it, or what bit you?"** The answer usually *is* the note.
- **"Did the free tier ask for a card?"** Never on the page, always worth knowing.
- **"Which of these needs did you reach for it for?"** — when several plausibly fit.
- **"Is this better than `<existing entry>` for that need, or just different?"** — stops the index
  becoming an undifferentiated pile.

Ask one at a time. Skip any the human already answered.

## Step 4 — Draft, then STOP

Propose the complete entry:

```yaml
name: Koboyo Icons
url: https://koboyo.com/icons
needs: [free-icons]
pricing: free
note: Large icon set, free with no attribution required
verified: <today, YYYY-MM-DD>
```

Judge the note against these before showing it:

| | |
|---|---|
| ❌ | `A great tool, highly recommended` — says nothing |
| ❌ | `Free icon library` — restates the need |
| ❌ | `Free tier gives 500 builds/month` — invented number |
| ✅ | `Free tier resets monthly, no card required` |
| ✅ | `cloudflared tunnels need no signup at all` |
| ✅ | `Still in countless docker-compose files, but unmaintained — reach for Mailpit in new setups` |

**HARD GATE: ask the human to confirm or rewrite the note before writing any file.** Their wording
beats yours — they used the tool. Do not proceed on silence.

## Step 5 — Write, validate, commit

```bash
pnpm add-tool <url>   # scaffolds data/tools/<slug>.yml, or just write the file directly
pnpm validate         # schema + referential integrity
```

`pnpm validate` is the authority on correctness — it checks required fields, the `pricing` enum, and
that every `needs` slug exists in `data/needs.yml`. If it fails it names the file and field. Fix and
re-run; never hand-wave a validation error.

Commit with a plain message. **No `Co-Authored-By` trailer and no "Generated with" line** — this
repo's owner does not want tooling attribution in the history.

```bash
git add data/tools/<slug>.yml
git commit -m "data: add <Tool Name> for <need>"
```

The pre-commit hook runs `pnpm validate` again, so a bad entry cannot land.

## Triaging tool suggestions from issues

Issues filed via `add-tool.yml` are the best input available — the submitter ticked a box confirming
they used the tool, and answered "what's the catch" in their own words.

```bash
gh issue list --label tool-suggestion
gh issue view <n>
```

Still run Step 1 (the URL may be dead or the free tier gone since filing). **Reuse the submitter's
"what's the catch" as the note** where it is usable — it has a real source, which yours does not.
Rewrite only for length or clarity, not voice.

Close the issue referencing the commit, and thank them.

## Adding a new need

Only when the tool serves a task the taxonomy genuinely lacks — and the bar is deliberately high: a
*recurring* task, not a one-off. If `data/needs.yml` grows to ninety entries it becomes the vendor
category list this site exists to replace. Prefer fitting the tool to an existing need.

If it is warranted:

```yaml
- slug: localhost-tunnel                  # the URL. FROZEN once published.
  question: "I need to expose localhost"  # display copy. safe to reword later.
  h1: "Expose localhost to the internet"  # display copy. safe to reword later.
  group: networking
  aliases: [ngrok alternative, share local server]   # search terms only, never routes
```

`slug` is permanent because it is a live URL and carries whatever SEO the page has earned. Everything
else is copy. Phrase `question` as the sentence in a developer's head mid-task, and put the words
people would actually *search* into `aliases`.

Every need must have at least one tool — validation rejects one that would render an empty page.

## Decline these, and say why

Be warm about it, but do not bend. The curation *is* the value:

- **Bulk adds.** "Add these 12 icon sites" — decline the batch. Ten used tools beat a hundred
  unused ones. Offer to do them one at a time, properly.
- **Tools the human hasn't used.** The note cannot be honest. Suggest filing an issue as a reminder
  instead.
- **Affiliate or referral links.** Always the bare canonical URL.
- **Paid tools with no usable free offering.** A 14-day trial is `trial` — and if that is all there
  is, it probably does not belong here at all.
