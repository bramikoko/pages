# bram / portfolio

Personal portfolio for bram, a web developer in Banjarmasin, Indonesia.

The site is a single page built as a brutalist editorial specimen: paper and ink, one lime accent, Comfortaa for display and Space Mono for metadata. Motion is handled with GSAP.

## Stack

- Next.js 16 with the App Router and Turbopack
- React 19 and TypeScript
- Tailwind CSS 4 through `@tailwindcss/turbopack`
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
lib/          profile content, GSAP setup, icon map, theme store
public/       avatar
DESIGN.md     identity, palette, typography, motion, and accessibility notes
```

## Content

Everything on the page comes from the public profiles at github.com/bramikoko and codeberg.org/bramikoko, checked 2026-10-19. The work section lists real repositories: the `libfprint-ft9201` fork and the profile README. The open slot is a contact prompt, not a claim.

There are no fabricated projects, statistics, testimonials, or client claims.

## Design and accessibility

- `DESIGN.md` holds the direction and the reason for each major choice.
- Light paper is the default theme. A dark mode ships with persistence.
- Text meets WCAG AA contrast. Focus states are visible, the mobile menu closes with Escape, and motion respects `prefers-reduced-motion`.
- The marquee is decorative and hidden from assistive technology. The same stack is available as a list in the stack section.
