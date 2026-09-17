# Rancho Cantina Reno: website concepts

Two single-page concept sites for the new Reno location (700 Riverside Drive, Powning District, on the Truckee River). Both are static Vite builds with GSAP ScrollTrigger, Lenis smooth scroll, and a lazy-loaded Three.js scene, deployed to Vercel as separate projects.

| | Concept A: Ember | Concept B: High Desert |
|---|---|---|
| Mood | After dark. Charcoal, bone, fire. Carbone / Nobu / Los Mochis energy. | Daylight. Paper, sagebrush green, charcoal ink. Gjelina / Puesto editorial warmth, elevated. |
| Hero | Full-screen brand film, wordmark and copy centred over it, Reserve front and centre. | Brand film in a printed paper frame below the header, tagline centred, "Where fire, food, and community meet." |
| Signature 3D | The client's bucking-bronc ink sketch extruded into cast iron and lit by embers, rotating with scroll. | Dish photographs cut into rancho arches and hung in space; the camera walks the table as you scroll. |
| Ink | Bronc reveal beside the statement, vaquero over the family photo, the Riverside Drive rendering behind Visit. | Inline glyphs in the definition line, the Riverside Drive rendering as a plate, a pinned heritage trail drawn in ink (vaquero, wagon, bronc, hat). |
| Cutouts | "MEX-WESTERN" giant type filled with fire. | Arch-cut photography, paper-cut shadows. |
| Menu | "Menu Highlights": sticky photograph that swaps as you move through the dish list. | Printed menu card with three groups and a bleeding overhead photograph. |
| Cantina | Pinned horizontal pan of cocktails. | Sagebrush block with a 2+1 grid and pointer tilt. |

## Brand rules applied

- "Mex-Western" positioning, hyphenated. Never Tex-Mex, never "a Mexican restaurant".
- West and Nevada forward: Truckee River, Powning District, Great Basin, buckaroo, sagebrush. No California and no "Californio" anywhere; the client asked for **Vaquero** in its place, so the spice rub and the heritage copy now read Vaquero and Rancho.
- Opening timing reads "this winter" throughout. No prices are shown on either concept; the menu is billed as highlights until the full one is set.
- Reserve a Table is the single primary action: header, hero, visit, and a modal that hands off to OpenTable (placeholder).
- Client fonts: Orpheus Pro (display) and Adobe Garamond Pro (body), from the Drive font folder.
- Wordmark, red flourish, bronc, vaquero, wagon, fish, hat, and skillet are vectorized from the client's own Reno banner and Lafayette menus.

## Placeholders

- Hero film: the real Rancho Cantina brand film, self-hosted from `public/video/`, **cut to start at 22.4s** so it opens on the parrilla and skips the Lafayette building and dining-room establishing shots. Served as `brandfilm-1080.mp4` on desktop, `brandfilm-720.mp4` on phones and Data Saver, and `brandfilm-720.webm` where H.264 is unavailable. Muted and looping over a poster frame pulled from the cut, with a sound toggle. Source is `RC Brand Film_HD.mp4` from the agency Drive. Swap for a Reno parrilla cut when it exists.
- Photography: Rancho Cantina Lafayette and Danville shoots from the agency Drive. Concept A's Story photo is the client's own Reno riverside deck render, standing in until they supply Truckee River imagery.
- Menu: real Lafayette dishes trimmed to a signature set, with prices removed.
- Reservations: modal collects party, date, and time and shows the handoff; wire to the real OpenTable ID at launch.
- Phone number and social handles for Reno are not yet published; the footer links to Instagram and Facebook placeholders and the Lafayette site.

## Scrollbar

Both concepts ship a custom scrollbar matched to their palette: an ember thumb on an ink track for A, a sage thumb on a paper track for B. Squared off to match the page, `scrollbar-width`/`scrollbar-color` for Firefox and `::-webkit-scrollbar` elsewhere.

## Reserve CTA

There is no sticky bottom bar. Reserve a Table appears in the header, in the hero, in the mobile menu sheet, and in the Visit section, and it always opens the same modal.

## Vercel Toolbar

The toolbar only renders for signed-in team members on preview deployments, so clients never see it. To turn it off for the team as well, add `VERCEL_PREVIEW_FEEDBACK_ENABLED=0` to the Preview environment in each project's Environment Variables.

## Run locally

```
cd concepts/concept-a   # or concept-b
npm install
npm run dev
```

Build with `npm run build`; output is `dist/`. Each concept has its own `vercel.json` (framework: vite).
