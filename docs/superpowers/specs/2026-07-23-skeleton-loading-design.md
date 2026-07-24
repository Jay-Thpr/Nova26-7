# Skeleton Loading Gate — Design Spec

## Problem
Currently every page renders its React tree immediately and images pop in individually as they finish downloading, so the site never reads as "loaded" — content and images appear piecemeal. We want each page to show a skeleton placeholder that matches its real layout while its images load, then reveal the fully-loaded page all at once.

## Scope
Applies to every route rendered by `App()` in `src/App.tsx`: `/`, `/about`, `/work`, `/work/:slug` (project detail), `/team`, `/nonprofits`, `/students`. Runs on initial load and on every client-side route change (since `App()` swaps the mounted page component per path).

## Mechanism
1. `AppShell` (src/App.tsx:231) gains a loading gate. Each page component passes its skeleton variant plus its real children into `AppShell`.
2. On mount/route change, `AppShell` renders:
   - The real content, present in the DOM but `visibility: hidden` (so images actually download and layout is measured), wrapped in a ref.
   - The matching skeleton on top, absolutely positioned to overlap the same area, visible by default.
3. A `usePageImagesLoaded(containerRef)` hook scans all `<img>` elements inside the real-content ref after mount:
   - Images already `.complete` count as loaded immediately.
   - Others get `load`/`error` listeners (error also counts as "resolved" so one broken image can't stall the page forever).
   - When every image has resolved, the hook returns `true`.
4. A 6-second safety timeout also flips the loaded state, guarding against a stalled network request. This is a ceiling, not an artificial minimum — pages resolve earlier in the normal case.
5. When `loaded` flips true, the skeleton fades out (opacity transition) and the real content fades in and becomes visible/interactive together — the "appear at once" effect. No skeleton stays engaged; the two are swapped once and not toggled again for the lifetime of that mount.

## Skeleton visual construction
Skeleton components reuse the **same top-level section class names** as the real page markup wherever practical (e.g. `.landing-hero`, `.project-card`, `.work-featured-project`, `.team-grid`, `.criteria-grid`). Inside those containers, real text/images are replaced with two primitives:
- `.skel-block` — a rectangular placeholder (for images, buttons, cards), sized via `aspect-ratio` or explicit height to roughly match its real counterpart.
- `.skel-line` — a short rectangular bar (for headings/paragraph text), with a couple of width variants to suggest heading vs. body copy.

Both use a shared shimmer animation (`@keyframes skel-shimmer`, a horizontal gradient sweep) over a neutral gray base tuned to sit on the site's dark background.

Because the skeleton reuses the real CSS grid/flex container classes, it inherits the same responsive breakpoints automatically — no separate responsive logic to maintain.

### Per-page skeleton composition
- **Landing** (`LandingSkeleton`): hero block (wordmark + heading + text lines + button), 2 photo-carousel skeleton rows, about-text block, bottom photo strip, 3 project cards, partner-logo grid, cta block.
- **Work** (`WorkSkeleton`): intro heading/text, 3 featured-project rows (image block + text lines), "more projects" list rows.
- **About** (`AboutSkeleton`): 3 alternating story blocks (text lines + image block).
- **Team** (`TeamSkeleton`): board-member grid, general-member grid, join section (text + image), alumni list lines.
- **Nonprofits** (`NonprofitsSkeleton`): hero (text + image), 3-item criteria grid, 4-step timeline, 2 testimonial blocks, partner-logo grid, cta block.
- **Students** (`StudentsSkeleton`): hero, event-list rows, reflections grid (alternating text + image).
- **Project detail** (`ProjectDetailSkeleton`): hero/laptop image block, meta block (timeline/stack/team lines), several text-block sections, solution grid, metrics grid, testimonial block, team image row.

## Files touched
- `src/App.tsx` — new skeleton components, `usePageImagesLoaded` hook, `AppShell` loading-gate wiring, each page passes its skeleton variant.
- `src/styles.css` — new `.skel-block`, `.skel-line`, shimmer keyframes, fade-transition classes for the overlay/content swap.

No changes to existing page component logic, data, or routing — purely additive.

## Edge cases
- **Route change while a previous page's images were still loading**: the gate re-initializes per mount; the unmounted page's pending listeners are simply discarded (React unmounts the old tree).
- **Cached images** (`.complete === true` on mount): counted as loaded instantly, so a warm cache reveals the page almost immediately with no visible skeleton flash beyond a frame.
- **Broken image URLs**: `error` events count as resolved so a single 404 doesn't hang the page forever.
- **Pages with zero images** (none currently, but future-proofing): hook resolves immediately since the image count is 0.

## Out of scope
- Pixel-exact skeleton dimensions (skeleton approximates proportions via the real CSS classes, not hand-measured to the pixel).
- Skeleton for non-image async content (there isn't any — all content is static/synchronous, only images are async).
