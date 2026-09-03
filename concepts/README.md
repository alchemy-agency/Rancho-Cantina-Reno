# Rancho Cantina Reno: website concepts

Two single-page concept sites for the new Reno location (700 Riverside Drive, Powning District, on the Truckee River). Both are static Vite builds with GSAP ScrollTrigger, Lenis smooth scroll, and a lazy-loaded Three.js scene, deployed to Vercel as separate projects.

| | Concept A: Ember | Concept B: High Desert |
|---|---|---|
| Mood | After dark. Charcoal, bone, fire. Carbone / Nobu / Los Mochis energy. | Daylight. Paper, sagebrush green, charcoal ink. Gjelina / Puesto editorial warmth, elevated. |
| Hero | Full-screen brand film with the Reno wordmark cut over the fire, Reserve front and center. | Full-screen brand film in a printed paper frame, the client's own tagline "Where fire, food, and community meet." |
| Signature 3D | The client's bucking-bronc ink sketch extruded into cast iron and lit by embers, rotating with scroll. | Dish photographs cut into rancho arches and hung in space; the camera walks the table as you scroll. |
| Ink | Bronc reveal beside the statement, vaquero over the family photo, the Riverside Drive rendering behind Visit. | Inline glyphs in the definition line, the Riverside Drive rendering as a plate, a pinned heritage trail drawn in ink (vaquero, wagon, bronc, hat). |
| Cutouts | "MEX WESTERN" giant type filled with fire. | Arch-cut photography, paper-cut shadows. |
| Menu | Sticky photograph that swaps as you move through six real dishes. | Printed menu card with three groups and a bleeding overhead photograph. |
| Cantina | Pinned horizontal pan of cocktails. | Sagebrush block with a 2+1 grid and pointer tilt. |

## Brand rules applied

- "Mex Western" positioning. Never Tex-Mex, never "a Mexican restaurant".
- West and Nevada forward: Truckee River, Powning District, Great Basin, buckaroo, sagebrush, pine nuts. California appears only as a recipe lineage ("Californio spice rub", "family recipes carried east over the Sierra").
- Reserve a Table is the single primary action: header, hero, visit, mobile bottom bar, and a modal that hands off to OpenTable (placeholder).
- Client fonts: Orpheus Pro (display) and Adobe Garamond Pro (body), from the Drive font folder.
- Wordmark, red flourish, bronc, vaquero, wagon, fish, hat, and skillet are vectorized from the client's own Reno banner and Lafayette menus.

## Placeholders

- Hero film: the Rancho Cantina brand film on YouTube (`VdTLtxfNG_o`), muted and looping, with a poster frame underneath and a sound toggle. Swap for a self-hosted MP4 of the Reno parrilla when it exists.
- Photography: Rancho Cantina Lafayette and Danville shoots from the agency Drive.
- Menu: real Lafayette dishes and prices, trimmed to a signature set.
- Reservations: modal collects party, date, and time and shows the handoff; wire to the real OpenTable ID at launch.
- Phone number and social handles for Reno are not yet published; the footer links to Instagram and Facebook placeholders and the Lafayette site.

## Run locally

```
cd concepts/concept-a   # or concept-b
npm install
npm run dev
```

Build with `npm run build`; output is `dist/`. Each concept has its own `vercel.json` (framework: vite).
