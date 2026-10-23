# Scroll-driven product experience

Five user-supplied films are stored in `public/films/`: headphones, fragrance, watch, sneaker and camera. Each has a poster and detail still derived from the same source.

The films are H.264 at 1280px width, without audio, with a keyframe every three frames, no B-frames and fast-start metadata. The frequent keyframes make reverse and forward seeking responsive; the five files total approximately 34 MB. Original source clips remain untouched.

`Hero.tsx` samples native scroll with requestAnimationFrame. A frame-rate-independent critically damped spring carries motion through short pauses and eases to rest (roughly 350ms to reach 99% of a stationary target). Seeking is serial: both animation frames and seek-completion events consume only the latest eased position, so rapid scroll reversals do not queue stale work. Chapter geometry is cached and refreshed on resize instead of forcing layout on every frame. Neighbouring clips preload decoded data for transitions. It mounts only the current film and its neighbours. Clips are fetched as Blob URLs for reliable seekability and are released on component cleanup. Native scrolling moves through the five chapters. The former range input and category controls have been removed. The only media control switches to still images. No wheel or touch gestures are intercepted.

Reduced motion and the explicit Still mode control show poster images. An unsuccessful film request falls back to its poster. Browsers retain normal native scrolling and keyboard navigation.

The redesigned process and plan comparison preserve the existing plan configuration and prototype registration event. The existing Contact component still handles authentication and submissions. Live account creation, payments and submission delivery were not exercised during visual testing.

Install with `npm ci`; run with `npm run dev`; validate with `npm run build` and `npx tsc --noEmit -p tsconfig.app.json`. The SWC compiler is pinned to 1.12.11 because a later native build could not initialise its cache in the local Windows sandbox. The lockfile records the reproducible dependency graph.
