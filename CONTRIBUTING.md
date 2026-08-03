# Contributing

## Adding a tool is one file

Create `data/tools/<slug>.yml`. Nothing else needs touching — the pages, search index and sitemap all
regenerate from it.

```yaml
name: Koboyo Icons
url: https://koboyo.com/icons
needs: [free-icons]
pricing: free
note: Very large icon set, free to use with no attribution required
verified: 2026-08-03
```

`needs` are slugs from [`data/needs.yml`](data/needs.yml). A tool can serve several:
`needs: [static-site-hosting, object-storage]`.

Or run `pnpm add-tool https://example.com` and it scaffolds the file for you.

**Using Claude Code?** This repo ships an `add-tool` skill at
[`.claude/skills/add-tool/SKILL.md`](.claude/skills/add-tool/SKILL.md). Say *"add https://example.com"*
and it will research the live page, tell you what it could and couldn't verify, ask what the page
can't answer, and validate the entry before committing. It will not invent free-tier numbers, and it
stops for you to confirm the note — read it even if you don't use Claude Code, since it spells out
the standard every entry is held to.

## The `note` is the whole point

It is the one thing this index has that a bigger list doesn't. Write the reason you'd pick this, or
the thing that will bite someone.

| | |
|---|---|
| ❌ | `note: A great tool, highly recommended` |
| ❌ | `note: Free icon library` |
| ✅ | `note: Free tier resets monthly and needs no card` |
| ✅ | `note: cloudflared tunnels need no signup at all` |
| ✅ | `note: Still in countless docker-compose files, but unmaintained — reach for Mailpit in new setups` |

## Picking `pricing`

| Value | Means |
|---|---|
| `free` | Free forever. No paid tier gates the useful part. |
| `freemium` | Genuinely usable free tier, paid plans exist above it. |
| `oss-selfhost` | Open source. Free if you run it yourself. |
| `trial` | **Time-limited only.** A warning badge, not a recommendation. |

`trial` is the honest choice when a free tier has quietly become a trial. Demoting an entry to
`trial` is more useful than deleting it — it records the change instead of hiding it.

## Adding a new need

Needs live in [`data/needs.yml`](data/needs.yml) and the bar is deliberately high: a *recurring*
task, not a one-off. If the taxonomy grows to ninety entries it becomes the category list this site
exists to replace.

```yaml
- slug: localhost-tunnel                  # the URL. frozen once published.
  question: "I need to expose localhost"  # display copy. change freely.
  h1: "Expose localhost to the internet"  # display copy. change freely.
  group: networking
  aliases: [ngrok alternative, share local server]   # search terms only, never routes
```

Only `slug` is permanent, because it is a live URL. Everything else is copy and can be reworded any
time without breaking a link.

Every need must have at least one tool — validation rejects a need that would render an empty page.

## Checking your work

```bash
pnpm install
pnpm validate     # schema + referential integrity
pnpm test
```

`pnpm install` also registers a pre-commit hook that runs `pnpm validate`, so a typo'd need slug is
caught before you push. If validation fails it names the file and the field.

## What gets declined

Not to be precious about it — the curation *is* the value here, so a few things are out:

- **Bulk imports from other lists.** A hundred entries nobody has used is worse than ten that have
  been. This is the one rule that matters most.
- **Tools you haven't used.** The `note` can't be honest otherwise.
- **Affiliate or referral links.**
- **Paid tools with no usable free offering.** A 14-day trial is `trial`, not a free tier — and if
  that's all there is, it probably doesn't belong.
