# Rancho Cantina Reno: website concepts

## Concept C: final draft

`concepts/concept-c` is the direction the client chose: **Concept B on a white page, with Concept A's best frames brought over**. It deploys to the Vercel project `rancho-reno-concept-c`.

| Section | Source | Client notes applied |
|---|---|---|
| Header | B | B's labels kept (Menu, Dishes, Cantina / Heritage, Visit, Reserve a Table). Transparent over the film, white band once you scroll; the small wordmark waits until the large one has left. |
| Hero | A | Full-bleed brand film, the large RANCHO CANTINA / RENO wordmark, "Wood-fired Mex-Western cooking on the banks of the Truckee River. Opening this winter." |
| Statement | A | Copy left, roping cowboy right, on white. "almond wood, mesquite, and iron". |
| Building | B | "...steps from the water. Riverfront patio, a full bar, and an open-fire parrilla at the heart of the kitchen." |
| From the fire to the table | B | Each dish name now hangs under its own arch and moves with it. Names corrected to what is on each plate (Carne Asada, Whole Fish, Taco Trio, BBQ Oysters, Mexican Chicken Wings, Vaquero Platter). The scroll ends square on the last plate. |
| Menu | B | "Menu highlights"; the Executive Chef line is removed. |
| Cantina | B | "Tequila, mezcal, and a river view." |
| Rancho, noun + Heritage | B | Unchanged copy apart from "almond wood"; the definition now introduces the Heritage trail. The roping cowboy leads the statement, so the buckaroo stop wears the hat and "today" is a Truckee trout. |
| Family | B | "Rancho Cantina is a family restaurant first, built on ranching roots and family recipes." New photo: the Rancho Cantina menu, chips and guacamole, hearth behind (`family-rancho-*.webp`, cropped from the client's notes; swap for the original file). |
| Visit | A | A's layout and copy; "Riverfront patio. Full bar. Free street parking on Jones and connecting streets." |
| Footer | B | New Club Rancho copy; Lafayette and Danville link removed; placeholder credit line removed. |

The two exploratory concepts below are kept for reference.

---

Two single-page concept sites for the new Reno location (700 Riverside Drive, Powning District, on the Truckee River). Both are static Vite builds with GSAP ScrollTrigger, Lenis smooth scroll, and a lazy-loaded Three.js scene, deployed to Vercel as separate projects.

| | Concept A: Ember | Concept B: High Desert |
|---|---|---|
| Mood | After dark. Charcoal, bone, fire. Carbone / Nobu / Los Mochis energy. | Daylight. Paper, sagebrush green, charcoal ink. Gjelina / Puesto editorial warmth, elevated. |
| Hero | Full-screen brand film, wordmark and copy centred over it, Reserve front and centre. | Brand film in a printed paper frame below the header, tagline centred, "Where fire, food, and community meet." |
| Signature 3D | The client's bucking-bronc ink sketch extruded into cast iron and lit by embers, rotating with scroll. | Dish photographs cut into rancho arches and hung in space; the camera walks the table as you scroll. |
| Ink | Bronc reveal beside the statement, vaquero over the Story photo. | A pinned heritage trail drawn in ink (vaquero, wagon, bronc, hat). |
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
- Photography: Rancho Cantina Lafayette and Danville shoots from the agency Drive for food, drink and interiors. The Reno building itself is the client's real exterior photograph (`reno-exterior-*.webp`), used in Concept A's Story and Visit sections and Concept B's plate. All concept art and AI renders of the building have been removed.
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
cd concepts/concept-c   # or concept-a, concept-b
npm install
npm run dev
```

Build with `npm run build`; output is `dist/`. Each concept has its own `vercel.json` (framework: vite).
