# devtools

**[itsbohara.github.io/devtools](https://itsbohara.github.io/devtools)**

Free developer tools, organised by what you're actually trying to do.

Most lists file tools under vendor categories — "CDN", "IaaS", "Tunneling". That's not how the
question arrives. Mid-task you think *"I need to expose localhost"*, and then you go hunting through
ninety sections. This index is organised around that sentence instead.

Every entry carries a note saying why it's the pick or what the catch is. That note is the point; the
list length isn't.

## How this repo works

`data/` is the source of truth — a taxonomy of needs plus one YAML file per tool. Astro reads it at
build time and emits static HTML: one page per need, plus a page for tools that serve several needs.
CI validates the data on every PR and deploys on every push to `main`.

```
data/needs.yml        the task taxonomy
data/tools/*.yml      one file per tool
src/schema/           Zod validation, shared by the hook, CI and the build
src/lib/load.ts       reads and validates the data
src/pages/            index, /need/<slug>, /tool/<slug>
```

Adding a tool means adding one file in `data/tools/`. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Pricing labels

| Label | Means |
|---|---|
| **Free** | Free forever, no paid tier gating the useful part |
| **Free tier** | Genuinely usable free tier, paid plans above it |
| **Open source** | Free if you run it yourself |
| **Trial only** | Time-limited — shown as a warning, not a recommendation |

## Freshness

Each entry shows when it was last verified, and anything unverified for over a year says so plainly.

There's no nightly link-checker, deliberately. A `200 OK` proves a URL resolves; it proves nothing
about whether the free tier still exists, which is the rot that actually matters. So the dates are
honest about their own age rather than automated into a promise this repo can't keep.

Spotted something stale?
[Open an issue](https://github.com/itsbohara/devtools/issues/new?template=add-tool.yml).

## Local development

```bash
pnpm install
pnpm dev        # http://localhost:4321/devtools
pnpm test
pnpm validate
```
