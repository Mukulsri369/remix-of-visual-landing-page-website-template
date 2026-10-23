# Scroll-driven product experience

Five user-supplied films in `public/films/` retain their existing 1280×720 H.264 encoding, all 24 source frames per second, three-frame keyframe interval, no B-frames, no audio and fast-start metadata. The media files were not recompressed or downscaled in this optimisation.

## Delivery and decoding

The active film streams directly from its MP4 URL. It no longer waits for a complete Blob download. There is one active scrubber, with an optional next-film metadata preload after 65% progress. Save-Data and slow connection hints disable that preload. Unmounted videos release their source and decoder and cancel unfinished requests; leaving the experience unmounts its videos. Only nearby posters mount, with the first poster preloaded in HTML.

`video-scrubber.ts` maps progress to distinct source frames and allows one decode at a time. Seek completion waits for `requestVideoFrameCallback` to confirm presentation before scheduling the newest target. Old targets and duplicate frames are discarded, rather than queued. A bounded seek-completion fallback handles browsers that omit frame callbacks for paused video; after two missed callbacks it switches to a one-frame fallback instead of imposing that timeout on every seek. This follows the [video frame callback specification](https://wicg.github.io/video-rvfc/).

`Hero.tsx` uses a critically damped spring for forward/reverse easing. The CSS scroll rate is 0.7 relative to the previous pacing: the effective travel distance is divided by 0.7, making video movement per scroll pixel 30% slower on desktop and mobile, including the final chapter. The critically damped response uses frequency 14, reaching 99% of a stationary target in roughly 475ms with no oscillation. Full clip endpoints remain reachable; the duration, source quality and decode scheduler are unchanged. Native passive scroll events wake an animation loop that stops after settling, offscreen and in hidden tabs. Geometry is cached and refreshed on layout resize/font loading. Film mapping uses the stable stage height, avoiding address-bar resize jumps on phones. Reduced motion and the explicit still-mode control retain posters without video requests. No scroll gestures are intercepted.

## Startup and account flow

The contact/account module (including Firebase and dialog/toast dependencies) loads when the form approaches the viewport or a storefront CTA is selected. The parent retains the selected plan while the chunk loads, and the contact anchor exists before loading.

Measured production bundle: initial JavaScript 169.65 KB / 54.42 KB gzip, compared with the previous 985.83 KB / 268.85 KB gzip. The account chunk remains approximately 820 KB / 216 KB gzip, but is outside initial loading. Build hashes and exact sizes may change slightly with subsequent edits.

In a local production test with MP4 responses throttled to 256 KiB/s (~2 Mbps), the first 1280px video frame was presented 546ms after the video element mounted, after 65,536 video bytes had been sent. The former Blob path required the complete 4,021,864-byte first film. This is a controlled local measurement, not a guarantee of real-world page-load time. Browser checks cover 390×844 and desktop viewports; actual iOS/Android hardware still needs device testing.

## Validation and hosting

Motion tests require Node 22.6+ (validated with Node 24). Run `npm run test:motion`, `npx tsc --noEmit -p tsconfig.app.json`, and `npm run build`. The motion tests cover refresh-rate independence, coalescing under slow decoding, reversals, frame-presentation backpressure, missing callbacks and cleanup.

The production host/CDN must serve MP4 byte ranges with HTTP 206, a valid Content-Range, and Content-Type video/mp4. Check the actual deployment with `npm run check:media -- https://your-deployment.example`; without an argument it checks localhost:3000. Do not replace the MP4 response with an SPA HTML fallback. Cache media at the CDN and preserve validators (ETag/Last-Modified); use versioned filenames before applying immutable caching. This repository does not assume a particular hosting provider.

Live sign-in, account creation, payments and enquiry delivery are not submitted during visual QA. The SWC compiler remains pinned to 1.12.11 for the local Windows runtime.
