# DESIGN.md

## Identity

- Name: bram
- Role: web developer
- Location: Banjarmasin, Indonesia
- Current: working with red.dev, student in 12th grade, learning Nuxt.js, Next.js, and Laravel.
- Voice: direct, dry, a little playful. Linux, anime, and manga are part of the person, not a costume.

## Source of truth

All content comes from the public profiles at github.com/bramikoko and codeberg.org/bramikoko, checked 2026-10-19.

- Email: punyanyaibra@gmail.com
- GitHub: github.com/bramikoko
- Codeberg: codeberg.org/bramikoko
- WhatsApp: +62 857-0563-7498 (wa.me/6285705637498)
- Instagram: instagram.com/bramikoko
- Reddit: reddit.com/user/bramikoko
- Avatar: the public GitHub avatar

No invented projects, statistics, testimonials, clients, or availability claims.

## Design Read

Reading this as: personal developer portfolio for a Linux-minded web developer, in a brutalist editorial specimen style, dial ENERGY 3 / RHYTHM 3 / MOTION 3.

## Palette

Light:

- paper #F2F0E9
- ink #0A0A0A
- muted #5F5F57
- lime #C6FF00
- line #0A0A0A

Dark:

- paper #0A0A0A
- ink #F2F0E9
- muted #A3A39A
- lime #C6FF00
- line #F2F0E9

Rules: lime never carries small text on paper. It is used as a surface with ink text, as a border, or as a cursor accent. Every pairing is checked with the WCAG formula.

Why: paper and ink give the typography room. One lime accent marks action and selection. No gradients, no glow, no glass.

## Typography

- Comfortaa 300 to 700: display and body. Why: the rounded geometric letterforms make the brutalist grid feel personal instead of borrowed. Display sizes use tight tracking and short leading.
- Space Mono 400 and 700: metadata, labels, navigation, and technical detail. Why: the rigid mono contrasts with Comfortaa's roundness and gives technical information a separate voice.
- Fluid type scale, with the hero name reaching 22vw and section titles reaching 9vw.
- No all-caps tracking as decoration. Labels are lowercase mono with index numbers.

## Composition

- 12-column desktop grid, 4-column mobile grid, hard 1px rules, no radius.
- Sections vary: full-bleed hero, ticker, asymmetric about block, sticky visual work preview with a details sheet, collapsible stack index, oversized lime contact block, and a draggable all-projects modal.
- Identity motif: editorial specimen marks, index numbers, city coordinates, crop marks, and a live Banjarmasin clock.
- One focal point per screen. Whitespace separates, never fills.

## Icons

- Lucide for UI actions only: menu, close, sun, moon, copy, check, arrows, map pin, clock.
- simple-icons for brand marks only: GitHub, Codeberg, Instagram, Reddit, WhatsApp, and the stack logos.
- Why: brand recognition comes from brand marks. UI clarity comes from a consistent action set. No decorative sparkles.

## Motion

- GSAP 3.15 with ScrollTrigger, SplitText, and useGSAP.
- Preloader: short type reveal, skipped under reduced motion.
- Hero: character reveal, magnetic call to action, custom cursor on fine pointers, pointer tilt on the ID card, and a grayscale-to-color avatar reveal on hover.
- Stack: collapsible numbered groups of icon tiles with a tools, groups, and learning strip; tile order is dealt fresh each visit with a reshuffle control, and each tile opens a keyboard-accessible detail popover with a one-line note and the official site.
- Scroll: section reveals, word reveal in the manifesto, a marquee that reacts to scroll velocity, project preview crossfades, a terminal cursor, a rotating open-slot plus, a stack tile reshuffle, and a draggable all-projects modal.
- Purpose: direct attention, show hierarchy, reward exploration. No motion that hides content or blocks input.
- Reduced motion: all content visible, no preloader delay, no cursor follower, no marquee translation, no scroll-jacking. Controls still work.

## Theme

Light paper is the default. A working dark mode ships with localStorage persistence and an inline pre-paint script. Both modes are verified.

## Anti-slop limits

- No gradients, glass, glow, soft shadows, pill shapes, bento grid, fake terminal hero, fake screenshots, fake testimonials, invented metrics, generic CTAs, or em dashes.
- No dead navigation. Every link goes to a real section, repository, profile, or mailto.
- No fabricated project content. The work section lists two real repositories and one clearly labeled open slot, and the all-projects modal indexes the same repositories in full. Project previews are generated from the project entry itself, so a new repository only needs a new line in the data file.

## Accessibility

- WCAG AA contrast for text, and 3:1 for UI boundaries and focus.
- Keyboard reachable, visible focus, Escape closes the mobile menu and stack popovers, focus returns to the trigger.
- 44px targets for primary controls, at least 28px for inline tech buttons.
- Copy email feedback is announced with aria-live.
