# Mellon

A pink real estate homepage built with Next.js App Router, TypeScript, vanilla CSS Modules, and a cursor-responsive mascot made from the original transparent logo artwork.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Use `npm run dev -- --port 3010` if port 3000 is occupied. Requires Node.js 20.9 or newer.

## Mascot and cursor

`src/components/MascotScene.tsx` displays the unchanged transparent `public/images/mellon-mascot.png` with two independently moving SVG iris layers. Each iris is a clipped copy of the same source PNG, with manually traced eye sockets and cream shaded SVG eye whites. There are no separate edited eye/body image assets. The original eyes remain visible at rest; the overlays cover them during tracking.

The body stays stationary, sized to fit fully inside the hero and positioned to the right on desktop. Each eye follows the pointer horizontally and vertically from its own screen position, using frame-rate-independent easing. The eye masks cover the original lower iris edges, and shaded iris extensions fill the portions hidden by the cheeks in the source. The eyes return to neutral when the pointer leaves. Touch taps direct the gaze briefly, and “Meet Mellon” demonstrates the eye movement. Rendering stops after settling and pauses when hidden or offscreen. Reduced-motion visitors see the original static artwork, which also remains visible without JavaScript. All animation frames, timers, observers, and listeners are cleaned up on unmount.

The cream cursor ring uses fixed viewport coordinates with no trailing interpolation. Its center replaces the native cursor on desktop, including over buttons. It is hidden on touchscreens, during keyboard navigation, and in reduced-motion mode.

The homepage uses no video, Canvas, WebGL, model downloads, or runtime generation service. The earlier video controller and assets are retained for reference but are not imported or requested by the homepage.

## Landing page

Buy, Sell, About, and contact actions navigate to the corresponding page sections. The main Next.js page includes:

- A property gallery using the identical-build photographs from the supplied flyer, with an illustrative-photo disclosure.
- An open specialist-services grid for pre-foreclosure/delinquency, probate, divorce, and short sales, with one contact action. All descriptions are visible without interaction or JavaScript.
- Keyboard-accessible tabs for the eight supplied development projects.
- Ian's broker information, phone and email contact links.
- External Realtor.com searches for Bakersfield and Shafter.

Below-hero motion uses small, one-time entrance transitions and gallery transitions. There is no pinned property reveal. Content remains visible without JavaScript and with reduced motion. The landing page uses restrained Nunito Sans headings, generous cream space, and an inset blush specialist panel; Archivo Black remains in the hero. The larger mascot still fits fully within the hero.

There is no connected listings API, lead submission, or contact backend. The area-search links open external listings; they are not an embedded feed. Ian has no MLS membership. A future RentCast integration would need an API key, server-side caching, and an application-enforced usage limit: its free tier includes 50 requests per month, with paid overages ([pricing](https://developers.rentcast.io/reference/billing-and-pricing)).

## Assets and source

- `public/images/mellon-mascot.png`: unchanged supplied transparent artwork.
- `src/components/MascotScene.tsx`: original artwork, eye masks, pointer tracking, cursor positioning, and touch/demo behavior.
- `src/components/hero.module.css`: layout, responsive sizing, and all hero styling.
- `src/components/LandingSections.tsx`: page content from the supplied flyers.
- `src/components/PropertyGallery.tsx`, `DevelopmentTabs.tsx`, and `Reveal.tsx`: small interactive components.
- `src/components/landing.module.css`: below-hero layout and motion.
- `public/images/properties/`: supplied identical-build photography.
- `assets/previews/landing/`: current desktop, mobile, tablet, and eye-direction screenshots.
- `reference/`: original reference images, preserved unchanged.

Archivo Black and Nunito Sans are bundled locally through Fontsource.

To regenerate the archived video experiment (not needed to run the website):

```sh
python -m pip install imageio-ffmpeg
python scripts/prepare-mascot-video.py
```

The earlier video experiment (`src/components/video-mascot.ts`, `public/videos/`, `scripts/prepare-mascot-video.py`), pose bank (`public/images/mellon-poses/`, `scripts/extract-mascot-poses.py`) and 3D experiment (`assets/blender/mellon.blend`, `public/models/mellon.glb`, `scripts/blender/`) are retained for reference and are not loaded by the homepage.

## Verify

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

The 7 browser tests use installed Google Chrome and a local server on port 3010. They verify eye tracking in both axes, complete stationary artwork, neutral reset, idle stopping, cursor alignment after resize/scroll, gallery image loading, keyboard navigation and project tabs, visible specialist information, 360–1440 px layouts, touch input, reduced motion, hidden-page pausing, no-JavaScript artwork, and operation without Canvas or WebGL.
