import { useCallback, useEffect, useRef, useState } from 'react'

type Phase = 'dormant' | 'approaching' | 'charging' | 'extracting' | 'absorbing' | 'reacting' | 'departing'

type Props = {
  landingPageRef: React.RefObject<HTMLDivElement | null>
  heroUfoRef: React.RefObject<HTMLDivElement | null>
  photoRowsRef: React.RefObject<HTMLDivElement | null>
}

type Point = { x: number; y: number }
type TrackControl = { animation: Animation; rate: number; carousel: HTMLElement }
type TargetSnapshot = { element: HTMLImageElement; opacity: string; transition: string; photoId: string }

const UFO_SIZE = { desktop: 132, mobile: 92 }
const PARTICLES = Array.from({ length: 12 }, (_, index) => ({
  x: 10 + ((index * 37) % 80),
  delay: (index % 5) * 90,
  duration: 760 + (index % 4) * 150,
}))

function wait(ms: number, token: number, tokenRef: React.MutableRefObject<number>) {
  return new Promise<boolean>((resolve) => {
    window.setTimeout(() => resolve(token === tokenRef.current), ms)
  })
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

function visibleRatio(rect: DOMRect, clip: DOMRect) {
  const left = Math.max(rect.left, clip.left, 0)
  const right = Math.min(rect.right, clip.right, window.innerWidth)
  const top = Math.max(rect.top, clip.top, 0)
  const bottom = Math.min(rect.bottom, clip.bottom, window.innerHeight)
  const visible = Math.max(0, right - left) * Math.max(0, bottom - top)
  return rect.width * rect.height ? visible / (rect.width * rect.height) : 0
}

function isRowsVisible(rows: HTMLElement, minimum = .35) {
  const rect = rows.getBoundingClientRect()
  const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0))
  return rect.width > 0 && visibleHeight / Math.min(rect.height, window.innerHeight) >= minimum
}

function chooseTarget(rows: HTMLElement, previousPhoto: string | null) {
  const candidates = Array.from(rows.querySelectorAll<HTMLImageElement>('.landing-photo-track img'))
    .map((element) => {
      const carousel = element.closest<HTMLElement>('.landing-carousel')
      const rect = element.getBoundingClientRect()
      const ratio = carousel ? visibleRatio(rect, carousel.getBoundingClientRect()) : 0
      const center = rect.left + rect.width / 2
      const centered = center > window.innerWidth * .15 && center < window.innerWidth * .85
      const loaded = element.complete && element.naturalWidth > 0 && element.dataset.abductionHidden !== 'true'
      const photoId = element.dataset.photoId ?? element.src
      const repeatPenalty = previousPhoto && photoId === previousPhoto ? 800 : 0
      const rowPenalty = element.closest('[data-strip-id="middle"]') ? 400 : 0
      const widthPenalty = window.innerWidth <= 820 ? Math.max(0, rect.width - window.innerWidth * .85) : 0
      const score = ratio * 1000 + (centered ? 120 : 0) - Math.abs(center - window.innerWidth / 2) * .08 - rowPenalty - widthPenalty - repeatPenalty
      return { element, ratio, score, photoId, loaded }
    })
    .filter(({ ratio, loaded }) => loaded && ratio >= (window.innerWidth <= 820 ? .55 : .6))
    .sort((a, b) => b.score - a.score)

  if (!candidates.length) return null
  if (previousPhoto && candidates[0].photoId === previousPhoto) {
    return candidates.find((candidate) => candidate.photoId !== previousPhoto) ?? candidates[0]
  }
  return candidates[0]
}

function animateElement(element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions, owned: Set<Animation>) {
  const animation = element.animate(keyframes, { fill: 'forwards', ...options })
  owned.add(animation)
  animation.finished.catch(() => undefined).finally(() => owned.delete(animation))
  return animation
}

function setAnimationRate(animation: Animation, rate: number) {
  animation.updatePlaybackRate(rate)
}

function tweenTrackRates(controls: TrackControl[], from: number, to: number, duration: number, pauseAtEnd: boolean) {
  return new Promise<void>((resolve) => {
    const started = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      controls.forEach(({ animation, rate }) => setAnimationRate(animation, rate * (from + (to - from) * eased)))
      if (progress < 1) requestAnimationFrame(tick)
      else {
        if (pauseAtEnd) controls.forEach(({ animation }) => animation.pause())
        resolve()
      }
    }
    requestAnimationFrame(tick)
  })
}

export function LandingAbduction({ landingPageRef, heroUfoRef, photoRowsRef }: Props) {
  const [phase, setPhase] = useState<Phase>('dormant')
  const [ufoPoint, setUfoPoint] = useState<Point>({ x: 0, y: 0 })
  const [beamPoint, setBeamPoint] = useState<Point>({ x: 0, y: 0 })
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const ufoRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const tokenRef = useRef(0)
  const activeRef = useRef(false)
  const autoPlayedRef = useRef(false)
  const previousPhotoRef = useRef<string | null>(null)
  const ownedAnimationsRef = useRef(new Set<Animation>())
  const trackControlsRef = useRef<TrackControl[]>([])
  const targetSnapshotRef = useRef<TargetSnapshot | null>(null)
  const cloneRef = useRef<HTMLImageElement | null>(null)
  const reducedMotionRef = useRef(false)
  const phaseRef = useRef<Phase>('dormant')
  phaseRef.current = phase

  const size = () => window.innerWidth <= 820 ? UFO_SIZE.mobile : UFO_SIZE.desktop

  const collectTracks = useCallback(() => {
    const rows = photoRowsRef.current
    if (!rows) return []
    return Array.from(rows.querySelectorAll<HTMLElement>('.landing-photo-track')).flatMap((track) => {
      const carousel = track.closest<HTMLElement>('.landing-carousel')
      const animation = track.getAnimations().find((item) => item.effect)
      if (!carousel || !animation) return []
      carousel.classList.add('is-abducting')
      animation.play()
      const rate = Math.abs(animation.playbackRate) || 1
      return [{ animation, rate, carousel }]
    })
  }, [photoRowsRef])

  const restoreTarget = useCallback(() => {
    const snapshot = targetSnapshotRef.current
    if (!snapshot) return
    const carousel = snapshot.element.closest<HTMLElement>('.landing-carousel')
    const rect = snapshot.element.getBoundingClientRect()
    const clip = carousel?.getBoundingClientRect()
    const onscreen = clip && rect.right > clip.left && rect.left < clip.right
    if (onscreen) {
      snapshot.element.style.transition = 'opacity .36s ease'
      requestAnimationFrame(() => { snapshot.element.style.opacity = snapshot.opacity })
      window.setTimeout(() => { snapshot.element.style.transition = snapshot.transition }, 380)
    } else {
      snapshot.element.style.opacity = snapshot.opacity
      snapshot.element.style.transition = snapshot.transition
    }
    delete snapshot.element.dataset.abductionHidden
    carousel?.classList.remove('is-recovering')
    targetSnapshotRef.current = null
  }, [])

  const restoreWatchRef = useRef(0)
  const cancelRestoreWatch = useCallback(() => {
    clearTimeout(restoreWatchRef.current)
    restoreWatchRef.current = 0
  }, [])
  const scheduleRestore = useCallback((token: number) => {
    const startedAt = performance.now()
    const check = () => {
      if (token !== tokenRef.current) return
      const snapshot = targetSnapshotRef.current
      if (!snapshot) return
      const carousel = snapshot.element.closest<HTMLElement>('.landing-carousel')
      const rect = snapshot.element.getBoundingClientRect()
      const clip = carousel?.getBoundingClientRect()
      const offscreen = !clip || rect.right <= clip.left || rect.left >= clip.right
      if (offscreen || performance.now() - startedAt > 20000) {
        restoreWatchRef.current = 0
        restoreTarget()
        return
      }
      restoreWatchRef.current = window.setTimeout(check, 150)
    }
    cancelRestoreWatch()
    restoreWatchRef.current = window.setTimeout(check, 150)
  }, [cancelRestoreWatch, restoreTarget])

  const normalizeTracks = useCallback(() => {
    trackControlsRef.current.forEach(({ animation, rate, carousel }) => {
      animation.play()
      setAnimationRate(animation, rate)
      carousel.classList.remove('is-abducting', 'is-recovering')
    })
    trackControlsRef.current = []
  }, [])

  const clearEffects = useCallback(() => {
    ownedAnimationsRef.current.forEach((animation) => animation.cancel())
    ownedAnimationsRef.current.clear()
    cloneRef.current?.remove()
    cloneRef.current = null
    heroUfoRef.current?.classList.remove('is-handed-off')
  }, [heroUfoRef])

  const runSequence = useCallback(async () => {
    const rows = photoRowsRef.current
    const landing = landingPageRef.current
    if (!rows || !landing || activeRef.current) return
    const chosen = chooseTarget(rows, previousPhotoRef.current)
    if (!chosen) return

    activeRef.current = true
    autoPlayedRef.current = true
    previousPhotoRef.current = chosen.photoId
    const token = ++tokenRef.current
    const reduced = reducedMotionRef.current
    const mobile = window.innerWidth <= 820
    const ufoSize = size()

    // Freeze the carousel before measuring anything. Previously the target's
    // position was measured first and the carousel only slowed down afterward,
    // so the photo kept drifting under the beam during the approach — by the
    // time extraction happened it had moved, and the clone would snap into its
    // real (drifted) spot instead of the one the beam had been aimed at. That
    // snap was the "teleport".
    trackControlsRef.current = collectTracks()
    await tweenTrackRates(trackControlsRef.current, 1, 0, reduced ? 1 : 220, true)
    if (token !== tokenRef.current) { normalizeTracks(); return }

    // The layer renders position:absolute inside `landing`, so all points must be
    // expressed relative to landing's box, not the viewport — otherwise they'd
    // desync the instant the page scrolls.
    const origin = landing.getBoundingClientRect()
    const toPageX = (viewportX: number) => viewportX - origin.left
    const toPageY = (viewportY: number) => viewportY - origin.top
    const viewportLeft = toPageX(0)
    const viewportTop = toPageY(0)

    const rectV = chosen.element.getBoundingClientRect()
    const rect = new DOMRect(toPageX(rectV.left), toPageY(rectV.top), rectV.width, rectV.height)
    const hover = {
      x: Math.max(viewportLeft + 12, Math.min(viewportLeft + window.innerWidth - ufoSize - 12, rect.left + rect.width / 2 - ufoSize / 2)),
      y: Math.max(viewportTop + 12, rect.top - (mobile ? 118 : 154)),
    }
    // Launch from wherever the hero UFO is actually rendered right now —
    // including whatever offset its own `landing-ufo-route` wander animation
    // currently has applied — so the handoff looks continuous instead of the
    // ship appearing somewhere unrelated to where the hero graphic just was.
    const heroRectV = heroUfoRef.current?.getBoundingClientRect()
    const heroVisible = heroRectV && heroRectV.bottom > 0 && heroRectV.top < window.innerHeight && heroRectV.right > 0 && heroRectV.left < window.innerWidth
    const start = heroVisible && heroRectV
      ? { x: toPageX(heroRectV.left), y: toPageY(heroRectV.top) }
      : { x: hover.x, y: viewportTop - ufoSize * 1.4 }

    setTargetRect(rect)
    setUfoPoint(start)
    setBeamPoint(start)
    heroUfoRef.current?.classList.add('is-handed-off')
    await nextFrame()
    if (token !== tokenRef.current) return
    if (reduced) {
      setUfoPoint(hover)
      setBeamPoint(hover)
      setPhase('charging')
      await wait(1150, token, tokenRef)
      if (token !== tokenRef.current) return
      setTargetRect(null)
      setPhase('dormant')
      activeRef.current = false
      normalizeTracks()
      return
    }

    setPhase('approaching')
    await nextFrame()
    if (token !== tokenRef.current || !ufoRef.current) return

    const ufo = ufoRef.current
    const dx = hover.x - start.x
    const dy = hover.y - start.y
    // The midpoint keyframe's translate is exactly half of dx/dy — proportional
    // to its offset — so the path itself stays a straight line with no overshoot;
    // only rotation (banking into the turn) varies non-linearly.
    const approach = animateElement(ufo, [
      { transform: 'translate3d(0,0,0) rotate(-8deg)' },
      { transform: `translate3d(${dx * .5}px,${dy * .5}px,0) rotate(-3deg)`, offset: .5 },
      { transform: `translate3d(${dx}px,${dy}px,0) rotate(0deg)` },
    ], { duration: mobile ? 950 : 1400, easing: 'cubic-bezier(.4,0,.2,1)' }, ownedAnimationsRef.current)
    await approach.finished.catch(() => undefined)
    if (token !== tokenRef.current) return
    setBeamPoint(hover)
    setPhase('charging')
    if (!await wait(mobile ? 360 : 580, token, tokenRef)) return

    const currentRectV = chosen.element.getBoundingClientRect()
    const currentRect = new DOMRect(toPageX(currentRectV.left), toPageY(currentRectV.top), currentRectV.width, currentRectV.height)
    setTargetRect(currentRect)
    const clone = chosen.element.cloneNode(true) as HTMLImageElement
    const computed = getComputedStyle(chosen.element)
    clone.className = 'ufo-abduction-clone'
    clone.alt = ''
    clone.setAttribute('aria-hidden', 'true')
    Object.assign(clone.style, {
      left: `${currentRect.left}px`, top: `${currentRect.top}px`, width: `${currentRect.width}px`, height: `${currentRect.height}px`,
      borderRadius: computed.borderRadius, objectFit: computed.objectFit, objectPosition: computed.objectPosition,
    })
    layerRef.current?.appendChild(clone)
    cloneRef.current = clone
    targetSnapshotRef.current = { element: chosen.element, opacity: chosen.element.style.opacity, transition: chosen.element.style.transition, photoId: chosen.photoId }
    chosen.element.dataset.abductionHidden = 'true'
    chosen.element.style.opacity = '0'
    chosen.element.closest('.landing-carousel')?.classList.add('is-recovering')
    setPhase('extracting')

    const cloneCenterX = currentRect.left + currentRect.width / 2
    const cloneCenterY = currentRect.top + currentRect.height / 2
    const destinationX = hover.x + ufoSize / 2
    const destinationY = hover.y + ufoSize * .63
    const liftX = destinationX - cloneCenterX
    const liftY = destinationY - cloneCenterY
    // Translate fractions match their offsets exactly (straight line, no overshoot);
    // Scale, rotation, and opacity ride along as embellishment on top of that line.
    const lift = animateElement(clone, [
      { transform: 'translate3d(0,0,0) rotate(0deg) scale(1)', opacity: 1 },
      { transform: `translate3d(${liftX * .3}px,${liftY * .3}px,0) rotate(${mobile ? 1 : 2}deg) scale(.88)`, opacity: 1, offset: .3 },
      { transform: `translate3d(${liftX * .68}px,${liftY * .68}px,0) rotate(${mobile ? 1 : 2}deg) scale(.56)`, opacity: 1, offset: .68 },
      { transform: `translate3d(${liftX}px,${liftY}px,0) rotate(0deg) scale(.05)`, opacity: 0 },
    ], { duration: mobile ? 1000 : 1400, easing: 'cubic-bezier(.5,0,.2,1)' }, ownedAnimationsRef.current)
    await lift.finished.catch(() => undefined)
    if (token !== tokenRef.current) return
    clone.remove()
    cloneRef.current = null
    setPhase('absorbing')
    if (!await wait(mobile ? 230 : 380, token, tokenRef)) return

    setPhase('reacting')
    const reaction = animateElement(ufo, [
      { transform: `translate3d(${dx}px,${dy}px,0) rotate(0deg)` },
      { transform: `translate3d(${dx}px,${dy + (mobile ? 5 : 8)}px,0) rotate(-2deg)`, offset: .4 },
      { transform: `translate3d(${dx}px,${dy}px,0) rotate(0deg)` },
    ], { duration: mobile ? 340 : 480, easing: 'ease-in-out' }, ownedAnimationsRef.current)
    await reaction.finished.catch(() => undefined)
    if (token !== tokenRef.current) return

    setPhase('departing')
    scheduleRestore(token)
    const exit = {
      x: viewportLeft + window.innerWidth + ufoSize * .7,
      y: Math.max(viewportTop - ufoSize, hover.y - (mobile ? 80 : 140)),
    }
    const exitDx = exit.x - start.x
    const exitDy = exit.y - start.y
    // Translate fractions match offsets (straight line); only rotation is embellished.
    const depart = animateElement(ufo, [
      { transform: `translate3d(${dx}px,${dy}px,0) rotate(0deg)` },
      { transform: `translate3d(${dx + (exitDx - dx) * .5}px,${dy + (exitDy - dy) * .5}px,0) rotate(6deg)`, offset: .5 },
      { transform: `translate3d(${exitDx}px,${exitDy}px,0) rotate(-4deg)` },
    ], { duration: mobile ? 900 : 1300, easing: 'cubic-bezier(.4,0,.2,1)' }, ownedAnimationsRef.current)
    trackControlsRef.current.forEach(({ animation }) => animation.play())
    void tweenTrackRates(trackControlsRef.current, 0, 1, mobile ? 520 : 800, false).then(() => {
      trackControlsRef.current.forEach(({ carousel }) => carousel.classList.remove('is-abducting'))
    })
    await depart.finished.catch(() => undefined)
    if (token !== tokenRef.current) return

    setTargetRect(null)
    setPhase('dormant')
    activeRef.current = false
  }, [collectTracks, heroUfoRef, landingPageRef, normalizeTracks, photoRowsRef, scheduleRestore])

  const abortSequence = useCallback((consume = true) => {
    if (!activeRef.current) return
    ++tokenRef.current
    cancelRestoreWatch()
    clearEffects()
    restoreTarget()
    normalizeTracks()
    setTargetRect(null)
    if (!consume) autoPlayedRef.current = false
    setPhase('dormant')
    activeRef.current = false
  }, [cancelRestoreWatch, clearEffects, normalizeTracks, restoreTarget])

  useEffect(() => {
    const rows = photoRowsRef.current
    if (!rows) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = media.matches
    const onMedia = () => {
      reducedMotionRef.current = media.matches
      if (activeRef.current) abortSequence(true)
    }
    media.addEventListener('change', onMedia)

    let idleTimer = 0
    let pollTimer = 0
    const attempt = () => {
      if (autoPlayedRef.current || activeRef.current) {
        clearInterval(pollTimer)
        pollTimer = 0
        return
      }
      if (document.hidden || !isRowsVisible(rows)) {
        clearInterval(pollTimer)
        pollTimer = 0
        return
      }
      void runSequence()
    }
    const qualify = () => {
      if (activeRef.current && !isRowsVisible(rows, .12)) {
        const hasExtracted = ['extracting', 'absorbing', 'reacting', 'departing'].includes(phaseRef.current)
        abortSequence(hasExtracted)
        return
      }
      clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        attempt()
        if (!autoPlayedRef.current && !pollTimer) pollTimer = window.setInterval(attempt, 400)
      }, 200)
    }
    const observer = new IntersectionObserver(qualify, { threshold: [.2, .35, .6] })
    observer.observe(rows)
    rows.addEventListener('load', qualify, true)
    window.addEventListener('scroll', qualify, { passive: true })
    const onVisibility = () => {
      if (!document.hidden || !activeRef.current) return
      const hasExtracted = ['extracting', 'absorbing', 'reacting', 'departing'].includes(phaseRef.current)
      abortSequence(hasExtracted)
    }
    let currentMobile = window.innerWidth <= 820
    const onResize = () => {
      const nextMobile = window.innerWidth <= 820
      if (activeRef.current && nextMobile !== currentMobile) abortSequence(true)
      currentMobile = nextMobile
      qualify()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)
    qualify()
    return () => {
      observer.disconnect()
      rows.removeEventListener('load', qualify, true)
      window.removeEventListener('scroll', qualify)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      media.removeEventListener('change', onMedia)
      clearTimeout(idleTimer)
      clearInterval(pollTimer)
    }
  }, [abortSequence, photoRowsRef, runSequence])

  useEffect(() => {
    heroUfoRef.current?.classList.toggle('is-handed-off', phase !== 'dormant')
  }, [heroUfoRef, phase])

  useEffect(() => () => {
    ++tokenRef.current
    cancelRestoreWatch()
    clearEffects()
    restoreTarget()
    normalizeTracks()
  }, [cancelRestoreWatch, clearEffects, normalizeTracks, restoreTarget])

  const beamVisible = phase === 'charging' || phase === 'extracting' || phase === 'absorbing'
  const beamTop = beamPoint.y + size() * .6
  const beamHeight = targetRect ? Math.max(70, targetRect.top + targetRect.height * .55 - beamTop) : 0
  const beamWidth = targetRect ? Math.max(104, Math.min(targetRect.width * .72, 270)) : 0
  const beamLeft = targetRect ? targetRect.left + targetRect.width / 2 - beamWidth / 2 : 0

  if (phase === 'dormant') return null
  return <div ref={layerRef} className={`ufo-abduction-layer phase-${phase} is-visible`} aria-hidden="true">
    {targetRect && <div className={`ufo-contact-glow ${beamVisible ? 'is-on' : ''}`} style={{ left: targetRect.left, top: targetRect.top, width: targetRect.width, height: targetRect.height }} />}
    {targetRect && <div className={`ufo-tractor-beam ${beamVisible ? 'is-on' : ''}`} style={{ left: beamLeft, top: beamTop, width: beamWidth, height: beamHeight, '--beam-travel': `${beamHeight}px` } as React.CSSProperties}>
      <span className="ufo-beam-core" />
      <span className="ufo-beam-ring ufo-beam-ring-one" />
      <span className="ufo-beam-ring ufo-beam-ring-two" />
      <span className="ufo-beam-ring ufo-beam-ring-three" />
      {PARTICLES.slice(0, window.innerWidth <= 820 ? 6 : 12).map((particle, index) => <i key={index} style={{ left: `${particle.x}%`, animationDelay: `${particle.delay}ms`, animationDuration: `${particle.duration}ms` }} />)}
    </div>}
    <div
      ref={ufoRef}
      className="ufo-abduction-ship"
      style={{ left: ufoPoint.x, top: ufoPoint.y }}
    >
      <img src="/assets/figma/landing/max-ufo.svg" alt="" />
    </div>
  </div>
}
