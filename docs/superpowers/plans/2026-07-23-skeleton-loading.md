# Skeleton Loading Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every route shows a skeleton placeholder that mimics its real layout while its images load, then reveals the fully-loaded page all at once instead of images popping in individually.

**Architecture:** A `useImagesLoaded` hook tracks every `<img>` inside a page's content container and resolves once all have loaded or errored (with a safety timeout). `AppShell` uses this hook to gate rendering: the real page content is always mounted (so images actually fetch) but hidden via CSS until resolved, while a page-specific skeleton (built from shared `.skel-block`/`.skel-line` primitives, reusing the real section class names for layout) is shown in its place. `App()` keys its rendered page by path so navigating between two pages of the *same* component type (e.g. prev/next project) still re-triggers the gate.

**Tech Stack:** React 18 + TypeScript, Vite, plain CSS (no CSS-in-JS, no test framework currently in this repo).

## Global Constraints

- Design spec: `docs/superpowers/specs/2026-07-23-skeleton-loading-design.md` — read before starting if anything below is ambiguous.
- Site theme is **light**: background `#fafcff`, text/ink `#08243e` (see `src/styles.css:3`). Skeleton colors must suit a light background, not a dark one.
- No test runner is configured in this repo (`package.json` has no jest/vitest/testing-library). Do not add one — verification is `npm run build` (runs `tsc -b && vite build`, catches type errors) plus the manual dev-server check described in each task. This is the established pattern for this codebase (zero existing tests).
- No changes to existing page component logic, data arrays, or routing behavior — purely additive.
- Reuse existing CSS class names on skeleton wrapper elements wherever the design spec's per-page composition lists them, so skeletons inherit real layout/responsive rules instead of duplicating them.

---

### Task 1: Skeleton primitives CSS + page-content fade CSS

**Files:**
- Modify: `src/styles.css` (append new rules; add near the end of the file)

**Interfaces:**
- Produces: CSS classes `.skel-block`, `.skel-line`, `.skel-line-heading`, `.skel-line-short`, `.page-skeleton`, `.page-content`, `.page-content-visible` — all later tasks rely on these exact class names.

- [ ] **Step 1: Append skeleton + fade CSS**

Add to the end of `src/styles.css`:

```css
/* Skeleton loading gate */
.page-skeleton { width: 100%; }
.page-content { display: none; }
.page-content-visible { display: block; animation: page-fade-in .4s ease; }
@keyframes page-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.skel-block, .skel-line {
  position: relative;
  overflow: hidden;
  background: rgba(8, 36, 62, 0.07);
  border-radius: 10px;
}
.skel-line {
  height: 14px;
  border-radius: 6px;
  width: 100%;
  margin: 8px 0;
}
.skel-line-heading { height: 30px; width: 55%; border-radius: 8px; }
.skel-line-short { width: 40%; }
.skel-block::after,
.skel-line::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(8, 36, 62, 0.10), transparent);
  animation: skel-shimmer 1.4s ease-in-out infinite;
}
@keyframes skel-shimmer {
  100% { transform: translateX(100%); }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds with no errors (CSS-only change, nothing can type-error, but confirms the project still builds cleanly before further changes).

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: add skeleton loader CSS primitives"
```

---

### Task 2: `useImagesLoaded` hook

**Files:**
- Create: `src/useImagesLoaded.ts`

**Interfaces:**
- Produces: `useImagesLoaded(containerRef: React.RefObject<HTMLElement | null>): boolean` — later tasks (Task 3) call this with a ref to the content wrapper div and use the returned boolean to toggle skeleton/content visibility.

- [ ] **Step 1: Write the hook**

```typescript
import { useEffect, useState, type RefObject } from 'react'

const SAFETY_TIMEOUT_MS = 6000

export function useImagesLoaded(containerRef: RefObject<HTMLElement | null>): boolean {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const container = containerRef.current
    if (!container) return

    const images = Array.from(container.querySelectorAll('img'))
    if (images.length === 0) {
      setLoaded(true)
      return
    }

    let remaining = images.length
    let cancelled = false

    const resolveOne = () => {
      if (cancelled) return
      remaining -= 1
      if (remaining <= 0) setLoaded(true)
    }

    images.forEach((img) => {
      if (img.complete) {
        resolveOne()
      } else {
        img.addEventListener('load', resolveOne)
        img.addEventListener('error', resolveOne)
      }
    })

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setLoaded(true)
    }, SAFETY_TIMEOUT_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      images.forEach((img) => {
        img.removeEventListener('load', resolveOne)
        img.removeEventListener('error', resolveOne)
      })
    }
  }, [containerRef])

  return loaded
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds — `useImagesLoaded` isn't imported anywhere yet, but `tsc` will still check the file compiles standalone (no unused-export errors since it's exported).

- [ ] **Step 3: Commit**

```bash
git add src/useImagesLoaded.ts
git commit -m "feat: add useImagesLoaded hook for skeleton loading gate"
```

---

### Task 3: Wire the loading gate into `AppShell` with a temporary generic skeleton

This task proves the end-to-end mechanism (hide content, show skeleton, swap on image load, re-trigger per route) before any page-specific skeleton exists. Every page will temporarily show the same generic placeholder; Tasks 4–10 replace it per page.

**Files:**
- Create: `src/Skeletons.tsx`
- Modify: `src/App.tsx:231-237` (the `AppShell` function)
- Modify: `src/App.tsx:637-650` (the `App` function's route switch)
- Modify: every page component that currently renders `<AppShell>` directly, to pass a `skeleton` prop (Task 3 passes `<GenericSkeleton />` everywhere; later tasks change the prop value per page)

**Interfaces:**
- Consumes: `useImagesLoaded` from Task 2 (`src/useImagesLoaded.ts`).
- Produces: `AppShell({ children, skeleton }: { children: React.ReactNode; skeleton: React.ReactNode })` — every page component (`LandingPage`, `WorkPage`, `AboutPage`, `TeamPage`, `NonprofitsPage`, `StudentsPage`, `ProjectDetailPage`, `NotFoundPage`) must pass a `skeleton` prop when calling `AppShell`. Also produces `GenericSkeleton` from `src/Skeletons.tsx`, used as the placeholder until Tasks 4–10 land.

- [ ] **Step 1: Create `src/Skeletons.tsx` with the generic placeholder**

```tsx
export function GenericSkeleton() {
  return <div className="skel-generic" style={{ padding: '96px 24px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
    <div className="skel-line skel-line-heading" style={{ width: 240 }} />
    <div className="skel-line" style={{ width: 360 }} />
    <div className="skel-block" style={{ width: '100%', maxWidth: 960, height: 320 }} />
  </div>
}
```

- [ ] **Step 2: Update `AppShell` to gate on image load**

In `src/App.tsx`, add `useRef` is already imported (line 2: `import { useEffect, useRef, useState } from 'react'`). Add an import for the hook near the top of the file, alongside the existing `LandingAbduction` import:

```typescript
import { LandingAbduction } from './LandingAbduction'
import { useImagesLoaded } from './useImagesLoaded'
```

Replace the existing `AppShell` function (`src/App.tsx:231-237`):

```typescript
function AppShell({ children, skeleton }: { children: React.ReactNode; skeleton: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const loaded = useImagesLoaded(contentRef)
  return <main id="top">
    <Header />
    {!loaded && <div className="page-skeleton" aria-hidden="true">{skeleton}</div>}
    <div className={`page-content${loaded ? ' page-content-visible' : ''}`} ref={contentRef}>{children}</div>
    <Footer />
  </main>
}
```

- [ ] **Step 3: Pass `skeleton` prop from every page component**

Every call site of `<AppShell>` in `src/App.tsx` needs a `skeleton` prop. Import `GenericSkeleton` and update each:

```typescript
import { GenericSkeleton } from './Skeletons'
```

Update these call sites (search for `<AppShell>` in `src/App.tsx` — there are 8: `LandingPage`, `WorkPage`, `AboutPage`, `TeamPage`, `NonprofitsPage`, `StudentsPage`, `ProjectDetailPage`, `NotFoundPage`). For each, change `<AppShell>` to `<AppShell skeleton={<GenericSkeleton />}>`. For example, in `LandingPage` (`src/App.tsx:244`):

```typescript
  return <AppShell skeleton={<GenericSkeleton />}>
```

Do this for all 8 occurrences — `NotFoundPage` included, even though it has no images (the hook resolves instantly for zero images, so its skeleton will never actually be visible, but the prop is still required by the type).

- [ ] **Step 4: Force remount on every route change**

Same-type pages (e.g. `ProjectDetailPage` navigated via prev/next) don't remount by default, so the gate wouldn't re-trigger. Fix by keying the rendered page on the normalized path.

Replace the `App` function (`src/App.tsx:637-650`):

```typescript
function App() {
  const path = usePath()
  const normalizedPath = path.replace(/\/$/, '') || '/'
  const project = projects.find(item => normalizedPath === `/work/${item.slug}`)

  let page: React.ReactNode
  if (normalizedPath === '/') page = <LandingPage />
  else if (normalizedPath === '/about') page = <AboutPage />
  else if (normalizedPath === '/team') page = <TeamPage />
  else if (normalizedPath === '/work') page = <WorkPage />
  else if (normalizedPath === '/nonprofits') page = <NonprofitsPage />
  else if (normalizedPath === '/students') page = <StudentsPage />
  else if (project) page = <ProjectDetailPage project={project} />
  else page = <NotFoundPage />

  return <div key={normalizedPath}>{page}</div>
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

- [ ] **Step 6: Manual verification in dev server**

Run: `npm run dev`, open the printed local URL in a browser.
1. Open DevTools → Network tab → set throttling to "Slow 3G" (so the skeleton is visible long enough to see).
2. Load `/`. Expected: the generic skeleton (heading bar + text line + big block) appears immediately, header/footer are visible, then after images finish loading the skeleton disappears and the real landing page fades in.
3. Navigate to `/work/mending-kids`, then click "Next Project" to go to `/work/wags-walks`. Expected: the skeleton reappears on each navigation (proves the `key={normalizedPath}` remount works even between same-component-type pages).
4. Check the browser console: expected no errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/Skeletons.tsx
git commit -m "feat: wire skeleton loading gate into AppShell"
```

---

### Task 4: Landing page skeleton

**Files:**
- Modify: `src/Skeletons.tsx` (add `LandingSkeleton`)
- Modify: `src/App.tsx` (swap `LandingPage`'s `AppShell` skeleton prop from `<GenericSkeleton />` to `<LandingSkeleton />`)

**Interfaces:**
- Produces: `LandingSkeleton` component, exported from `src/Skeletons.tsx`.

- [ ] **Step 1: Add `LandingSkeleton` to `src/Skeletons.tsx`**

Mirrors `LandingPage`'s structure (`src/App.tsx:239-287`): hero, two photo-carousel rows, about block, bottom strip, 3 project cards, partner grid, cta.

```tsx
export function LandingSkeleton() {
  return <div className="landing-page">
    <section className="landing-hero">
      <div className="landing-hero-copy">
        <div className="skel-line skel-line-heading" style={{ width: 180, margin: '0 auto 16px' }} />
        <div className="skel-line skel-line-heading" style={{ width: 280, margin: '0 auto 16px' }} />
        <div className="skel-line" style={{ width: 420, margin: '0 auto' }} />
        <div className="skel-block" style={{ width: 180, height: 44, margin: '24px auto 0' }} />
      </div>
    </section>

    <section className="landing-gallery">
      <div className="landing-photo-rows">
        <div className="landing-carousel"><div className="skel-block" style={{ width: '100%', height: 140 }} /></div>
        <div className="landing-carousel"><div className="skel-block" style={{ width: '100%', height: 140 }} /></div>
      </div>
      <div className="landing-about">
        <div>
          <div className="skel-line skel-line-heading" style={{ width: 200 }} />
          <div className="skel-line" />
          <div className="skel-line skel-line-short" />
        </div>
        <div className="skel-block" style={{ width: 140, height: 40 }} />
      </div>
      <div className="landing-carousel landing-bottom-strip"><div className="skel-block" style={{ width: '100%', height: 140 }} /></div>
    </section>

    <section className="landing-projects">
      <div className="landing-section-intro">
        <div className="skel-line skel-line-heading" style={{ width: 160 }} />
        <div className="skel-line" />
      </div>
      <div className="landing-project-list">
        {[0, 1, 2].map(index => <div className="landing-project" key={index}>
          <div className="skel-block" style={{ width: '100%', height: 200 }} />
          <div>
            <div className="skel-line skel-line-heading" style={{ width: '70%' }} />
            <div className="skel-line skel-line-short" />
            <div className="skel-line" />
          </div>
        </div>)}
      </div>
    </section>

    <section className="landing-network">
      <div className="landing-section-intro">
        <div className="skel-line skel-line-heading" style={{ width: 180 }} />
        <div className="skel-line" />
      </div>
      <div className="landing-partners">
        {Array.from({ length: 12 }, (_, index) => <div className="skel-block" key={index} style={{ width: 90, height: 50 }} />)}
      </div>
    </section>

    <section className="landing-cta">
      <div className="skel-line skel-line-heading" style={{ width: 200, margin: '0 auto 24px' }} />
      <div className="cta-actions">
        <div className="skel-block" style={{ width: 150, height: 40 }} />
        <div className="skel-block" style={{ width: 150, height: 40 }} />
      </div>
    </section>
  </div>
}
```

- [ ] **Step 2: Swap the skeleton prop for `LandingPage`**

In `src/App.tsx`, update the `LandingPage` function's `AppShell` call (currently `<AppShell skeleton={<GenericSkeleton />}>` from Task 3):

```typescript
  return <AppShell skeleton={<LandingSkeleton />}>
```

Update the import at the top of `src/App.tsx` to include the new component:

```typescript
import { GenericSkeleton, LandingSkeleton } from './Skeletons'
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, throttle network to "Slow 3G" in DevTools, load `/`.
Expected: skeleton now visually echoes the landing page's actual layout (hero block, two carousel-shaped bars, about section with two-column shape, 3 card-shaped blocks in a row, small logo-sized blocks in a grid, two button blocks at the bottom) rather than the generic placeholder. After load, real content fades in matching that layout.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/Skeletons.tsx
git commit -m "feat: add landing page skeleton"
```

---

### Task 5: Work page skeleton

**Files:**
- Modify: `src/Skeletons.tsx` (add `WorkSkeleton`)
- Modify: `src/App.tsx` (swap `WorkPage`'s skeleton prop)

**Interfaces:**
- Produces: `WorkSkeleton` component, exported from `src/Skeletons.tsx`.

- [ ] **Step 1: Add `WorkSkeleton`**

Mirrors `WorkPage` (`src/App.tsx:334-373`): intro, 3 featured project rows, "more projects" list (13 rows, from `moreProjects.length`).

```tsx
export function WorkSkeleton() {
  return <div className="work-page">
    <section className="work-content">
      <header className="work-intro">
        <div className="skel-line skel-line-heading" style={{ width: 160, margin: '0 auto 16px' }} />
        <div className="skel-line" style={{ margin: '0 auto', width: '70%' }} />
      </header>
      <div className="work-featured-list">
        {[0, 1, 2].map(index => <div className="work-featured-project" key={index}>
          <div className="work-featured-image"><div className="skel-block" style={{ width: '100%', height: 220 }} /></div>
          <div className="work-featured-copy">
            <div>
              <div className="skel-line skel-line-heading" style={{ width: '60%' }} />
              <div className="skel-line skel-line-short" />
            </div>
            <div className="skel-line" />
          </div>
        </div>)}
      </div>
      <section className="work-more-projects">
        <div className="skel-line skel-line-heading" style={{ width: 160 }} />
        <div className="work-more-list">
          {Array.from({ length: 13 }, (_, index) => <div className="work-more-row work-more-row-static" key={index}>
            <div className="skel-line skel-line-short" />
            <div className="skel-line" />
          </div>)}
        </div>
      </section>
    </section>
  </div>
}
```

- [ ] **Step 2: Swap the skeleton prop for `WorkPage`**

In `src/App.tsx`, update the `WorkPage` function's `AppShell` call:

```typescript
  return <AppShell skeleton={<WorkSkeleton />}>
```

Update the import:

```typescript
import { GenericSkeleton, LandingSkeleton, WorkSkeleton } from './Skeletons'
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, throttle to "Slow 3G", load `/work`.
Expected: skeleton shows an intro block, 3 image+text rows matching the featured projects layout, and a list of thin rows matching the "more projects" list, before fading into real content.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/Skeletons.tsx
git commit -m "feat: add work page skeleton"
```

---

### Task 6: About page skeleton

**Files:**
- Modify: `src/Skeletons.tsx` (add `AboutSkeleton`)
- Modify: `src/App.tsx` (swap `AboutPage`'s skeleton prop)

**Interfaces:**
- Produces: `AboutSkeleton` component, exported from `src/Skeletons.tsx`.

- [ ] **Step 1: Add `AboutSkeleton`**

Mirrors `AboutPage` (`src/App.tsx:409-428`): 3 alternating story blocks.

```tsx
export function AboutSkeleton() {
  return <div className="about-page">
    <section className="about-story">
      <div className="skel-line skel-line-heading" style={{ width: 200, margin: '0 auto 32px' }} />
      <div className="about-story-list">
        {[0, 1, 2].map(index => <article className={index % 2 ? 'reverse' : ''} key={index}>
          <div>
            <div className="skel-line" />
            <div className="skel-line" />
            <div className="skel-line skel-line-short" />
          </div>
          <div className="skel-block" style={{ width: '100%', height: 260 }} />
        </article>)}
      </div>
    </section>
    <div className="about-actions">
      <div className="skel-block" style={{ width: 150, height: 40 }} />
      <div className="skel-block" style={{ width: 150, height: 40 }} />
    </div>
  </div>
}
```

- [ ] **Step 2: Swap the skeleton prop for `AboutPage`**

```typescript
  return <AppShell skeleton={<AboutSkeleton />}>
```

Update the import:

```typescript
import { GenericSkeleton, LandingSkeleton, WorkSkeleton, AboutSkeleton } from './Skeletons'
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, throttle to "Slow 3G", load `/about`.
Expected: skeleton shows a heading, then 3 alternating text/image-block rows, before fading into real content.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/Skeletons.tsx
git commit -m "feat: add about page skeleton"
```

---

### Task 7: Team page skeleton

**Files:**
- Modify: `src/Skeletons.tsx` (add `TeamSkeleton`)
- Modify: `src/App.tsx` (swap `TeamPage`'s skeleton prop)

**Interfaces:**
- Produces: `TeamSkeleton` component, exported from `src/Skeletons.tsx`. Needs `boardMembers.length` (8) and `generalMembers.length` (26) and `alumniMembers.length` (67) — these are already defined as arrays in `src/App.tsx:375-407`; the skeleton hard-codes matching counts rather than importing the arrays, to keep the skeleton independent of the real data shape.

- [ ] **Step 1: Add `TeamSkeleton`**

Mirrors `TeamPage` (`src/App.tsx:438-463`): board grid (8), members grid (26), join section, alumni list (67).

```tsx
function SkelTeamMember() {
  return <article className="team-member">
    <div className="skel-block" style={{ width: '100%', aspectRatio: '1 / 1' }} />
    <div className="skel-line skel-line-short" style={{ margin: '12px auto 4px' }} />
    <div className="skel-line skel-line-short" style={{ margin: '0 auto' }} />
  </article>
}

export function TeamSkeleton() {
  return <div className="team-page">
    <section className="team-content">
      <div className="skel-line skel-line-heading" style={{ width: 240, margin: '0 auto 16px' }} />
      <div className="skel-line" style={{ margin: '0 auto 32px', width: '60%' }} />
      <div className="skel-line skel-line-heading" style={{ width: 140 }} />
      <div className="team-grid">{Array.from({ length: 8 }, (_, index) => <SkelTeamMember key={index} />)}</div>
      <div className="skel-line skel-line-heading" style={{ width: 140 }} />
      <div className="team-grid">{Array.from({ length: 26 }, (_, index) => <SkelTeamMember key={index} />)}</div>
      <section className="team-join">
        <div>
          <div className="skel-line skel-line-heading" style={{ width: 140 }} />
          <div className="skel-line" />
          <div className="skel-block" style={{ width: 180, height: 40 }} />
        </div>
        <div className="skel-block" style={{ width: '100%', height: 220 }} />
      </section>
      <section className="team-alumni">
        <div className="skel-line skel-line-heading" style={{ width: 140 }} />
        <ul aria-hidden="true">{Array.from({ length: 67 }, (_, index) => <li key={index}><div className="skel-line skel-line-short" /></li>)}</ul>
      </section>
    </section>
  </div>
}
```

- [ ] **Step 2: Swap the skeleton prop for `TeamPage`**

```typescript
  return <AppShell skeleton={<TeamSkeleton />}>
```

Update the import:

```typescript
import { GenericSkeleton, LandingSkeleton, WorkSkeleton, AboutSkeleton, TeamSkeleton } from './Skeletons'
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, throttle to "Slow 3G", load `/team`.
Expected: skeleton shows two member grids (small square placeholders with two text lines each), a join section, and an alumni list, before fading into real content. Since this page has ~35 portrait images, the skeleton should stay visible noticeably longer than lighter pages — confirm it doesn't flash/flicker and holds steady until all portraits resolve.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/Skeletons.tsx
git commit -m "feat: add team page skeleton"
```

---

### Task 8: Nonprofits page skeleton

**Files:**
- Modify: `src/Skeletons.tsx` (add `NonprofitsSkeleton`)
- Modify: `src/App.tsx` (swap `NonprofitsPage`'s skeleton prop)

**Interfaces:**
- Produces: `NonprofitsSkeleton` component, exported from `src/Skeletons.tsx`.

- [ ] **Step 1: Add `NonprofitsSkeleton`**

Mirrors `NonprofitsPage` (`src/App.tsx:465-503`): hero, 3-item criteria grid, 4-step timeline, 2 testimonials, partner grid (reuses the same `.landing-partners` shape as `NetworkSection`), cta.

```tsx
export function NonprofitsSkeleton() {
  return <div className="nonprofits-page">
    <section className="split-hero section-shell">
      <div className="skel-line skel-line-heading" style={{ width: 220 }} />
      <div>
        <div className="skel-line" />
        <div className="skel-line" />
        <div className="skel-line skel-line-short" />
        <div className="skel-block" style={{ width: 150, height: 40, marginTop: 16 }} />
      </div>
      <div className="skel-block" style={{ width: '100%', height: 260 }} />
    </section>
    <section className="looking-for section-shell">
      <div className="skel-line skel-line-heading" style={{ width: 180 }} />
      <div className="criteria-grid">
        {[0, 1, 2].map(index => <article key={index}>
          <div className="skel-block" style={{ width: '100%', height: 140 }} />
          <div className="skel-line skel-line-heading" style={{ width: '60%' }} />
          <div className="skel-line" />
        </article>)}
      </div>
    </section>
    <section className="process section-shell">
      <div className="skel-line skel-line-heading" style={{ width: 200 }} />
      <div className="timeline">
        {[0, 1, 2, 3].map(index => <article key={index}>
          <div className="skel-block" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          <div className="skel-line skel-line-short" />
          <div className="skel-line" />
        </article>)}
      </div>
    </section>
    <section className="testimonials section-shell">
      <div className="skel-line skel-line-heading" style={{ width: 220 }} />
      <div className="testimonial-stack">
        {[0, 1].map(index => <blockquote key={index}>
          <div className="skel-line" />
          <div className="skel-line" />
          <div className="skel-line skel-line-short" />
        </blockquote>)}
      </div>
    </section>
    <section className="landing-network">
      <div className="landing-section-intro">
        <div className="skel-line skel-line-heading" style={{ width: 180 }} />
        <div className="skel-line" />
      </div>
      <div className="landing-partners">
        {Array.from({ length: 12 }, (_, index) => <div className="skel-block" key={index} style={{ width: 90, height: 50 }} />)}
      </div>
    </section>
    <section className="nonprofit-cta">
      <div className="skel-line skel-line-heading" style={{ width: 200, margin: '0 auto 24px' }} />
      <div>
        <div className="skel-block" style={{ width: 150, height: 40 }} />
        <div className="skel-block" style={{ width: 150, height: 40 }} />
        <div className="skel-block" style={{ width: 150, height: 40 }} />
      </div>
    </section>
  </div>
}
```

- [ ] **Step 2: Swap the skeleton prop for `NonprofitsPage`**

```typescript
  return <AppShell skeleton={<NonprofitsSkeleton />}>
```

Update the import:

```typescript
import { GenericSkeleton, LandingSkeleton, WorkSkeleton, AboutSkeleton, TeamSkeleton, NonprofitsSkeleton } from './Skeletons'
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, throttle to "Slow 3G", load `/nonprofits`.
Expected: skeleton shows hero, 3-card grid, 4-step timeline, 2 testimonial blocks, a logo grid, and 3 cta buttons, before fading into real content.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/Skeletons.tsx
git commit -m "feat: add nonprofits page skeleton"
```

---

### Task 9: Students page skeleton

**Files:**
- Modify: `src/Skeletons.tsx` (add `StudentsSkeleton`)
- Modify: `src/App.tsx` (swap `StudentsPage`'s skeleton prop)

**Interfaces:**
- Produces: `StudentsSkeleton` component, exported from `src/Skeletons.tsx`. Hard-codes counts matching `events` (6 items) and `reflections` (5 items) from `src/App.tsx:506-527`.

- [ ] **Step 1: Add `StudentsSkeleton`**

Mirrors `StudentsPage` (`src/App.tsx:505-556`): hero, event list (6 rows), reflections grid (5 alternating rows).

```tsx
export function StudentsSkeleton() {
  return <div className="students-page">
    <section className="page-hero">
      <div className="skel-line skel-line-heading" style={{ width: 160, margin: '0 auto' }} />
    </section>
    <section className="students section-shell">
      <div className="skel-line skel-line-heading" style={{ width: 200, margin: '0 auto' }} />
      <div className="skel-line skel-line-short" style={{ margin: '16px auto' }} />
      <div className="skel-line" style={{ margin: '0 auto 32px', width: '70%' }} />
      <div className="event-list">
        {Array.from({ length: 6 }, (_, index) => <article key={index}>
          <div className="skel-line skel-line-short" />
          <div className="skel-line skel-line-short" />
        </article>)}
      </div>
    </section>
    <section className="reflections section-shell">
      <div className="skel-line skel-line-heading" style={{ width: 140 }} />
      <div className="skel-line skel-line-short" />
      <div className="reflection-grid">
        {Array.from({ length: 5 }, (_, index) => <article className={index % 2 ? 'reverse' : ''} key={index}>
          <div>
            <div className="skel-line" />
            <div className="skel-line" />
            <div className="skel-line skel-line-short" />
          </div>
          <div className="skel-block" style={{ width: '100%', height: 200 }} />
        </article>)}
      </div>
    </section>
  </div>
}
```

- [ ] **Step 2: Swap the skeleton prop for `StudentsPage`**

```typescript
  return <AppShell skeleton={<StudentsSkeleton />}>
```

Update the import:

```typescript
import { GenericSkeleton, LandingSkeleton, WorkSkeleton, AboutSkeleton, TeamSkeleton, NonprofitsSkeleton, StudentsSkeleton } from './Skeletons'
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, throttle to "Slow 3G", load `/students`.
Expected: skeleton shows hero, an event-list of 6 rows, and a 5-row alternating reflections grid, before fading into real content.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/Skeletons.tsx
git commit -m "feat: add students page skeleton"
```

---

### Task 10: Project detail page skeleton

**Files:**
- Modify: `src/Skeletons.tsx` (add `ProjectDetailSkeleton`)
- Modify: `src/App.tsx` (swap `ProjectDetailPage`'s skeleton prop)

**Interfaces:**
- Produces: `ProjectDetailSkeleton` component, exported from `src/Skeletons.tsx`. Unlike other skeletons, this one is used for all three projects (`mending-kids`, `wags-walks`, `crjw`) — it must be generic enough to not depend on `project`-specific data (e.g. `project.solutions.length` varies: 3 for Mending Kids/CRJW-esque, 4 for Wags & Walks; the skeleton hard-codes 4 solution slots as a reasonable upper-bound approximation, and only `project.testimonial`/`project.metrics` presence varies, which the skeleton doesn't need to know about since it's not reading real data at all).

- [ ] **Step 1: Add `ProjectDetailSkeleton`**

Mirrors `ProjectDetailPage` (`src/App.tsx:558-631`): hero/laptop image, meta block, background/problem/solution text sections, solution grid, metrics grid, testimonial, team images, nav.

```tsx
export function ProjectDetailSkeleton() {
  return <div>
    <section className="figma-detail-hero">
      <div className="figma-detail-gradient">
        <div className="skel-line skel-line-heading" style={{ width: 260, margin: '0 auto 24px' }} />
        <div className="figma-laptop"><div className="skel-block" style={{ width: '100%', height: 320 }} /></div>
      </div>
    </section>
    <section className="figma-case-study">
      <div className="figma-case-inner">
        <div className="figma-meta">
          <div className="skel-line skel-line-short" />
          <div className="skel-line" />
          <div>
            <div className="skel-line skel-line-short" />
            <ul>{[0, 1, 2].map(index => <li key={index}><div className="skel-line skel-line-short" /></li>)}</ul>
          </div>
        </div>
        <section className="figma-copy-block">
          <div className="skel-line skel-line-heading" style={{ width: 220 }} />
          <div className="skel-line" />
          <div className="skel-line" />
        </section>
        <section className="figma-problem">
          <div className="skel-line skel-line-heading" style={{ width: 180 }} />
          <div className="skel-line" />
          <div className="skel-line skel-line-short" />
        </section>
        <section className="figma-problem figma-solution">
          <div className="skel-line skel-line-heading" style={{ width: 180 }} />
          <div className="skel-line" />
        </section>
        <section className="figma-copy-block figma-features">
          <div className="skel-line skel-line-heading" style={{ width: 180 }} />
          <div className="figma-solution-grid">
            {Array.from({ length: 4 }, (_, index) => <article key={index}>
              <div className="skel-line skel-line-heading" style={{ width: '50%' }} />
              <div className="skel-line" />
            </article>)}
          </div>
        </section>
        <section className="figma-impact">
          <div className="skel-line skel-line-heading" style={{ width: 220 }} />
          <div className="metric-grid">
            {[0, 1, 2].map(index => <article key={index}>
              <div className="skel-line skel-line-heading" style={{ width: 80, margin: '0 auto' }} />
              <div className="skel-line skel-line-short" style={{ margin: '0 auto' }} />
            </article>)}
          </div>
          <div className="figma-testimonial">
            <div className="skel-line skel-line-heading" style={{ width: 180 }} />
            <div className="skel-line" />
          </div>
        </section>
        <section className="figma-team">
          <div className="skel-line skel-line-heading" style={{ width: 140 }} />
          <div className="skel-block" style={{ width: '48%', height: 200, display: 'inline-block', marginRight: '2%' }} />
          <div className="skel-block" style={{ width: '48%', height: 200, display: 'inline-block' }} />
        </section>
      </div>
    </section>
  </div>
}
```

- [ ] **Step 2: Swap the skeleton prop for `ProjectDetailPage`**

```typescript
  return <AppShell skeleton={<ProjectDetailSkeleton />}>
```

Update the import:

```typescript
import { GenericSkeleton, LandingSkeleton, WorkSkeleton, AboutSkeleton, TeamSkeleton, NonprofitsSkeleton, StudentsSkeleton, ProjectDetailSkeleton } from './Skeletons'
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, throttle to "Slow 3G", load `/work/mending-kids`, `/work/wags-walks`, and `/work/crjw` in turn.
Expected: each shows the skeleton matching the detail page layout, then fades into that project's real content. Confirm navigating between projects via "Previous/Next Project" re-triggers the skeleton each time (this was wired in Task 3's `key={normalizedPath}` change — this task just confirms it still works with a real skeleton instead of the generic one).

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/Skeletons.tsx
git commit -m "feat: add project detail page skeleton"
```

---

### Task 11: Remove now-unused `GenericSkeleton` and full regression pass

By this point every page that used the temporary `GenericSkeleton` (Task 3) has been swapped to its own skeleton (Tasks 4–10). `NotFoundPage` is the only remaining user (added in Task 3, never swapped since it's a trivial page with no images — the hook resolves instantly for it, so keeping `GenericSkeleton` there is fine and simplest). Confirm this and do a full manual pass across the whole site.

**Files:**
- Modify: `src/Skeletons.tsx` (no code change expected — verify `GenericSkeleton` is still needed by `NotFoundPage`)
- Modify: `src/App.tsx` (no code change expected — verify import list is accurate)

**Interfaces:**
- Consumes: all skeleton components from Tasks 3–10.
- Produces: nothing new — this is a verification-only task.

- [ ] **Step 1: Confirm `GenericSkeleton` is still referenced**

Run: `grep -n "GenericSkeleton" src/App.tsx`
Expected: exactly one usage, in `NotFoundPage`'s `<AppShell skeleton={<GenericSkeleton />}>` call. If any other page still references it, that page's Task (4–10) was not completed correctly — go back and fix it.

- [ ] **Step 2: Run a TypeScript/lint-level check for unused exports**

Run: `npm run build`
Expected: succeeds with no errors or warnings about unused code.

- [ ] **Step 3: Full manual regression pass**

Run: `npm run dev`, open the browser with DevTools Network throttling set to "Slow 3G".

For each of these routes, confirm (a) the skeleton shown matches that page's real layout shape, (b) header and footer are visible throughout, (c) the skeleton disappears and real content fades in together (not piecemeal), (d) no console errors:
- `/`
- `/about`
- `/work`
- `/work/mending-kids`
- `/work/wags-walks`
- `/work/crjw`
- `/team`
- `/nonprofits`
- `/students`
- a nonexistent route, e.g. `/nope` (should show `NotFoundPage` — no visible skeleton flash since it has no images, real content should appear immediately)

Then repeat the same pass with Network throttling turned **off** (fast connection): confirm the skeleton either doesn't flash at all or flashes for at most a single frame — it should not feel like an artificial delay was added to a fast load.

- [ ] **Step 4: Commit (only if Step 1 or 3 required a fix)**

If everything already matched, there's nothing to commit — this task is verification-only. If a fix was needed:

```bash
git add src/App.tsx src/Skeletons.tsx
git commit -m "fix: correct skeleton wiring found during regression pass"
```
