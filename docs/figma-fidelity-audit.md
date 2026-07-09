# Nova Figma fidelity audit

Date: 2026-06-25

## Executive finding

The current implementation is not 100% faithful to the Figma Hifi designs.

It builds successfully and the major routes exist, but multiple pages still contain simplified or invented structure, manually approximated visuals, and incomplete Figma content. The largest gaps are the landing page, For Nonprofits page, For Students page, and exact visual fidelity for the project detail pages.

## Verification performed

- Inspected Figma Hifi metadata via MCP.
- Inspected Figma design context and screenshots for:
  - Landing Page: `202:99`
  - Project Page Overview: `345:778`
  - Project Detail - MK: `256:2618`
  - Project Detail - Wags & Walks: `237:1366`
  - Project Detail - CRJW: `237:1863`
  - For NonProfits: `362:316`
  - Student/recruitment content nested under the Wags frame area, including `514:2281`, `514:2580`, `528:*`.
- Inspected app source:
  - `src/App.tsx`
  - `src/styles.css`
  - `public/assets`
- Ran production build:
  - `npm run build` passes.
- Attempted local browser/runtime visual QA:
  - In-app browser runtime failed with `codex/sandbox-state-meta: missing field sandboxPolicy`.
  - Local `curl` to Vite failed with connection code 7 despite Vite reporting ready, likely environment isolation.
  - Therefore visual browser screenshot comparison could not be completed in this environment.

## Build status

Passes:

```bash
npm run build
```

Latest successful output includes:

- CSS bundle: `dist/assets/index-Dh4zi9Rr.css`
- JS bundle: `dist/assets/index-C09Kr7bZ.js`

## Route coverage

| Route | Exists | Figma source | Fidelity status |
|---|---:|---|---|
| `/` | Yes | `202:99` | Not faithful |
| `/work` | Yes | `345:778` | Partially implemented, not faithful |
| `/work/mending-kids` | Yes | `256:2618` | Figma-derived structure added, still not exact |
| `/work/wags-walks` | Yes | `237:1366` | Figma-derived structure added, still not exact |
| `/work/crjw` | Yes | `237:1863` | Figma-derived structure added, still not exact |
| `/nonprofits` | Yes | `362:316` | Not faithful |
| `/students` | Yes | nested Hifi student/recruitment content | Partially implemented, not faithful |

## Global/shared issues

### 1. The nav is not the exact Figma nav

Current code uses a custom text/character logo:

- `src/App.tsx`, `Logo()`
- `src/styles.css`, `.logo`

Figma uses a specific logo component/SVG asset (`imgLogoButton`) and Red Hat Text-style nav labels. The implementation fakes the icon using `✦` and `N`.

### 2. Font stack is incomplete

Current CSS imports:

```css
Instrument Sans
Raleway
Syncopate
```

Figma generated context also uses `Red Hat Text` for nav/component text in several places. That is not imported or used.

### 3. Many Figma assets are missing

Current assets include only a subset:

- hero/texture approximations
- a few project screenshots
- a few team photos
- detail team images
- `star2.png`

Missing or not consistently used:

- exact Figma logo SVGs everywhere
- exact social icons
- exact star/simple/smoothcorner SVGs
- exact ring/planet variants per page
- exact gradient mesh vectors per page
- exact laptop mockup image layers
- exact texture overlays and blend-mode layers

### 4. Visual system is hand-authored, not Figma-translated

`src/styles.css` contains many manually authored gradients, sizes, shadows, and layouts. Some values are inspired by Figma, but they are not a literal conversion of the Figma geometry/layers.

## Landing page `/`

Figma source: `202:99`

### Figma structure visible

- Full-page saturated blue/pink/yellow gradient mesh.
- Pill nav at the top.
- Large white NOVA title with star in O.
- “TECH FOR GOOD” subtitle.
- Work With Us gradient button.
- Two photo-ribbon rows.
- WHO WE ARE card.
- PROJECTS section with three laptop previews.
- OUR NETWORK logo panel.
- INTERESTED CTA.
- Footer.

### Current implementation status

The current landing implementation is hand-authored:

- `src/App.tsx`, `LandingPage()`
- `src/styles.css`, `.hero`, `.photo-ribbon`, `.about`, `.projects`, `.network`, `.cta`

### Gaps

- Background is still a CSS approximation, not the exact Figma gradient mesh/vector/texture composition.
- Decorative stars/rings/planets are incomplete and manually placed.
- Figma image ribbon layout is approximated, not exact.
- WHO WE ARE copy does not exactly match the Figma screenshot:
  - Figma screenshot shows bullet-style copy:
    - “Developers, designers, and innovators who love to solve problems.”
    - “Students dedicated to learning about and supporting under-resourced communities.”
    - “A team that strongly believes in making a difference.”
  - Current code uses a different sentence.
- Project cards use different summaries and layout from Figma.
- Our Network panel is incomplete; many partner logos are rendered as text instead of image assets.
- Footer is simplified and not exact.

Conclusion: landing is not 100%.

## Projects overview `/work`

Figma source: `345:778`

### Figma structure visible

- Pill nav.
- PROJECTS heading.
- Exact description:
  - “Take a look at some of the projects we’ve worked on! Whether they're web development, mobile development, data science, or design, our solutions have been able to serve a wide variety of nonprofits.”
- Three laptop mockups:
  - MENDING KIDS
  - WAGS & WALKS
  - CRJW
- Exact labels/copy:
  - Dashboard
  - Inventory Management
  - Missions
- “...AND MORE!” list with separators and arrow icons.
- Footer.

### Current implementation status

Route exists:

- `src/App.tsx`, `WorkPage()`

### Gaps

- Hero/background is simplified.
- Laptop mockups are CSS approximations, not exact Figma layers.
- Some text differs from Figma:
  - Figma has “AA web-based...” typo. Current project data normalizes/changes some copy.
  - Figma “An external fund allocation platform that auto-imports new donor and donation information, and transforming them into structured, usable data” differs from current summaries.
- Decorative background vectors/stars/planet are incomplete.
- Footer is not exact.
- “...AND MORE!” list is present but not exact in spacing, typography, arrows, or separators.

Conclusion: `/work` is not 100%.

## Project detail pages

Routes:

- `/work/mending-kids`
- `/work/wags-walks`
- `/work/crjw`

Sources:

- MK: `256:2618`
- Wags: `237:1366`
- CRJW: `237:1863`

### Current implementation status

The routes are no longer generic one-screen placeholders. They now render per-project data and sections from `projects[]` in `src/App.tsx`.

Implemented sections:

- project-specific title
- project screenshot/laptop
- timeline
- tech stack
- team members
- nonprofit background
- problem
- solution
- solution cards
- testimonial where present
- team photos
- previous/all/next buttons

### Remaining gaps

These pages are still not exact Figma implementations:

- The hero laptop is recreated with CSS, not exact Figma mockup layer geometry.
- Gradient mesh is approximate CSS, not the exact Figma vector stack.
- Ring/planet/moon/star decorative assets are mostly missing or approximated.
- Section positions and heights are not exact:
  - Figma detail pages are 4570–5040px tall with carefully positioned 880px content columns and large background instances.
  - Current layout uses flexible CSS columns/gaps and will not match pixel-for-pixel.
- MK content is incomplete and partly summarized:
  - Figma includes detailed metrics/impact star cards and multiple bullets.
  - Current implementation compresses metrics into generic solution/testimonial sections.
- Wags content is incomplete:
  - Figma includes full nonprofit background, problem, solution, metrics/testimonial, and team imagery.
  - Current implementation includes a shortened background/problem.
- CRJW content is incomplete:
  - Figma has long nonprofit background/program descriptions and a long problem paragraph.
  - Current implementation shortens both.
- CRJW appears not to have a testimonial in Figma screenshot/context, so omission may be acceptable, but this should be confirmed visually.
- Project previous/next buttons route all to `/work`, not actual previous/next detail routes.
- Footer is the shared simplified app footer, not the exact Figma footer per detail frame.

Conclusion: project detail pages are structurally much better than before, but not 100%.

## For Nonprofits `/nonprofits`

Figma source: `362:316`

### Figma structure visible

- Pill nav.
- FOR NONPROFITS hero with photo.
- What We’re Looking For:
  - Community Impact
  - Technical Need
  - Commitment
- Project Structure:
  - Initial Call
  - User Research
  - Development
  - Handoff
- Client Testimonials with Wags and Mending Kids content blocks.
- Past Partners logo panel.
- Want to Learn More CTA.
- Footer.

### Current implementation status

Route exists:

- `src/App.tsx`, `NonprofitsPage()`

### Gaps

- Content is heavily simplified.
- Testimonial content is invented/generic, not Figma testimonial text.
- Past partners/logo panel reuses shared simplified `NetworkSection`.
- Background/decorative elements do not match Figma.
- Layout and spacing are not exact.
- Page uses generic shared footer instead of exact Figma footer.

Conclusion: `/nonprofits` is not 100%.

## For Students `/students`

Figma source:

- Student content is present inside the Hifi tree under nested nodes:
  - `514:2281` JOIN US!
  - `514:2580` LIGHT THE WAY / FALL 2026 RECRUITMENT
  - `514:2667`, `528:187`, `528:194`, `528:215`, `528:222`, `528:234` recruitment timeline rows
  - `528:245` WHY NOVA? / MEMBER REFLECTIONS
  - reflection sections for Jimin Kim, Katelyn Doanla, Anusha Ladha, Akhilesh Basetty, Lian Elsa Linton

### Current implementation status

Route exists:

- `src/App.tsx`, `StudentsPage()`

### Gaps

- The route implements only a simplified recruitment schedule and one generic reflection paragraph.
- It does not implement the actual member reflection cards/circle photos.
- It does not use exact Figma decorative assets or layout.
- It does not have a clearly mapped top-level Figma page frame; this needs explicit design decision from Figma/user before finalizing.

Conclusion: `/students` is not 100%.

## Asset size / performance issue

`public/assets` is currently about 76MB.

Large image examples:

- `team-1.png`: ~15MB
- `team-2.png`: ~14MB
- `team-4.png`: ~13MB
- `public/assets/figma/details/*`: ~27MB

This is not production-ready. Assets need optimization after fidelity is established.

## Routing issues

### Client-side router only

The app uses a custom `history.pushState` router:

- `src/App.tsx`, `usePath()`, `go()`, `Link()`

This works in Vite dev if fallback is available, but production hosting must be configured to serve `index.html` for deep links such as `/work/mending-kids`.

### Previous/next project buttons

Current detail buttons all link to `/work`, not actual neighboring project pages.

## Runtime QA blocker

Visual browser QA could not be completed in this environment because:

- in-app browser setup failed with MCP runtime metadata error.
- direct `curl` to local Vite failed with connection code 7 despite Vite reporting ready.

This means the current audit is based on source, Figma MCP context/screenshots, and build output, not live browser screenshots.

## Final assessment

Not 100% implemented.

Approximate confidence by area:

- Build correctness: 100%
- Route existence: 100% for known routes
- Landing Figma fidelity: ~45–55%
- Projects overview fidelity: ~55–65%
- Project detail structural coverage: ~65–75%
- Project detail pixel fidelity: ~45–55%
- For Nonprofits fidelity: ~35–45%
- For Students fidelity: ~25–35%
- Asset completeness: ~45–55%

## Recommended next steps

1. Freeze Figma route map:
   - Confirm whether `/students` should be built from nested recruitment content or whether a top-level frame will be added.
2. Replace shared approximate header/footer with exact Figma header/footer components.
3. Convert page-by-page:
   - Landing `202:99`
   - Work `345:778`
   - Nonprofits `362:316`
   - MK `256:2618`
   - Wags `237:1366`
   - CRJW `237:1863`
   - Students nested recruitment nodes
4. Download and use exact assets for each page.
5. Only after visual fidelity is acceptable, optimize images.
6. Re-run browser screenshot comparison once browser/localhost access works.
