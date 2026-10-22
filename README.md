# bram / portfolio

Personal portfolio for bram, a web developer in Banjarmasin, Indonesia.

The site is a single page built as a brutalist editorial specimen: paper and ink, one lime accent, Comfortaa for display and Space Mono for metadata. Motion is handled with GSAP.

## Stack

- Next.js 16 with the App Router and Turbopack
- React 19 and TypeScript
- Tailwind CSS 4 through `@tailwindcss/postcss`
- GSAP 3 with ScrollTrigger, SplitText, and `useGSAP`
- Lucide for interface icons and simple-icons for brand marks
- Bun for installs and scripts

## Scripts

```bash
bun install
bun dev
bun run lint
bun run build
bun run start
```

## Structure

```
app/          routes, layout, metadata, global styles, icon
components/   page sections and interaction primitives
lib/          profile content, live repo feed, GSAP setup, icon map, theme store
public/       avatar
DESIGN.md     identity, palette, typography, motion, and accessibility notes
```

## Likes storage

The like counter keeps its count in Upstash Redis over the REST API when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. That is the path for Vercel, whose function filesystem is read-only. Locally, with no env vars, the route falls back to `.data/likes.json` (gitignored), so development needs no account.

To deploy on Vercel: add the Upstash Redis integration from the Marketplace, connect it to the project, and redeploy. The legacy Vercel KV names `KV_REST_API_URL` and `KV_REST_API_TOKEN` are also accepted.

## Content

Profile copy, the stack, and the social links live in `lib/data.ts` and come from the public profiles at github.com/bramikoko and codeberg.org/bramikoko.

The work section is not hand-maintained. `lib/repos.ts` reads the public GitHub REST API and the Codeberg (Forgejo) API on the server, then the page does the following:

- lists every public repository, newest push first, with language, dates, stars, forks, topics, and the latest commit
- merges recent public GitHub events (pushes, pull requests, issues, releases) into the activity list in the all-repos modal
- keeps the result for one hour through `'use cache'` and `cacheLife("hours")`, so the page stays static and the APIs are not hit per visitor
- shows a per-host error line instead of failing the page when one API is down or rate limited

A `GITHUB_TOKEN` environment variable is optional. It raises the unauthenticated limit of 60 requests per hour and is read on the server only; it is never sent to the browser.

The open slot is a contact prompt, not a claim. There are no fabricated projects, statistics, testimonials, or client claims.

## Design and accessibility

- `DESIGN.md` holds the direction and the reason for each major choice.
- Light paper is the default theme. A dark mode ships with persistence.
- Text meets WCAG AA contrast. Focus states are visible, the mobile menu closes with Escape, and motion respects `prefers-reduced-motion`.
- The marquee is decorative and hidden from assistive technology. The same stack is available as a list in the stack section.
