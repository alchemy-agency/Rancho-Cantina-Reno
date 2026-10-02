# Rancho Cantina Reno: website concepts

## Concept C: final draft

`concepts/concept-c` is the direction the client chose: **Concept B on a white page, with Concept A's best frames brought over**. It deploys to the Vercel project `rancho-reno-concept-c`.

Each section has one job, and each idea has one home, so the page reads as one unfolding story: opening = promise; building = atmosphere; menu = what you'll eat; cantina = when you'll gather; heritage = where the influences came from; family = who's behind it. Fire and parrilla words live in the Statement; the river lives in the Building headline (elsewhere only the street name "Riverside Drive" appears); ranch roots and family recipes live in the Family section.

| Section | Source | What it says / does |
|---|---|---|
| Header | B | Menu, Dishes, Cantina / Heritage, Visit, **Join the Waitlist**. Transparent over the film, white band once you scroll. |
| Hero | A | Full-bleed brand film, large RANCHO CANTINA / RENO wordmark. "Mex-Western cooking, opening in Reno this winter." Buttons: **Join the Grand Opening Waitlist**, See the Menu. |
| Statement | A | "Wood-fired cooking. Rooted in tradition. Timeless West." and the one sentence about the parrilla: "almond wood, mesquite, and iron." |
| Building | B | Atmosphere: "Brick, timber, and the Truckee out front." A covered patio, warm lights at dusk, room for long evenings. Links to Directions and parking. |
| From the fire to the table | B | Each dish name hangs under its own arch (Carne Asada, Whole Fish, Taco Trio, BBQ Oysters, Mexican Chicken Wings, Vaquero Platter). |
| Menu highlights | B | Eleven dishes in one pattern: what it is and how it is cooked, then what is in it or served with it, one sentence each. BBQ Oysters uses the client's wording ("Fresh oysters flame-grilled over an open fire..."). |
| Cantina | B | "Gather for happy hour, Taco Tuesdays, and Sunday brunch." |
| Heritage | B | One line above the illustrations, "Rancho's story runs from the open range to Reno.", then the vaquero, the ranch table, the buckaroo and the rancho today. The "Rancho, noun" definition section was removed. |
| Family | B | "Family owned. Family run." Who is behind it: the recipes and the Vaquero spice rub come from the family's ranching roots. |
| Visit | A | "Find us in Reno's Powning District." Address, "Next door to Hub Coffee Roasters and Dorinda's Chocolates", the three parking facts, and the hours under a **Coming soon / Planned hours** headline. |
| Footer | B | Club Rancho signup. |

### Waitlist, not reservations

Reservations are not open, so there is no "Reserve a Table" anywhere. Every call to action (`.js-waitlist`) opens one email form (`#waitlistModal`) that says "Reservations are not open yet" and signs the guest up. It is a placeholder like the Club Rancho form: wire both to the real list (Squarespace form or newsletter block, Mailchimp, Klaviyo) at launch. The hours block is headed "Coming soon: planned hours" so it cannot be read as "open now".

### Parking map

The map under the Visit section matches the client's own parking map. The rules it follows:

- **Free street parking** is a yellow line on Jones, Vine, Winter and Washington Streets.
- **The public lot** (90+ spots, Jones Street between Keystone Avenue and Vine Street) is a blue area with a "P" label, never a line, so the two cannot be confused. The key and the three parking lines in the Visit text use the same swatches.
- **Riverside Drive has no street parking** and none is shown. Every yellow line is trimmed to end at least 15 m from Riverside Drive's centerline (measured against the OpenStreetMap road in the tiles), which removes the ends that used to run into the Riverside Drive junction.
- **Hub Coffee Roasters and Dorinda's Chocolates** (both 727 Riverside Drive, next door) are marked as landmarks: ink badges on tinted building footprints.

Data lives in `src/pmap-data.js` (`PARKING`, `LOT`, `LANDMARKS`, `PIN`). The interactive map (`src/pmap-live.js`, MapLibre on OpenFreeMap tiles) draws from it, and the drawn fallback in `index.html` (`.pmap__svg`) is the same geometry projected into a 1120 x 760 frame. If you change `PARKING`, regenerate the `<g class="pm-parking">` paths from the same coordinates (frame: lon -119.826021 to -119.819499, lat 39.520469 to 39.523905).

Landmark names choose the first free side of their badge (right, lower right, upper right, below, above, left) so they never cover the pin, its address card, the lot label or each other; where none fits only the badge shows and a tap reveals the name.

One thing to confirm with the client: Hub Coffee is mapped in OpenStreetMap, but Dorinda's Chocolates (727 Riverside Dr., Ste. E) is not, so its badge sits on the north end of the same row of buildings, beside Jones Street, as on the client's map. If it is actually in a neighbouring building, change its `at` and `footprint` in `LANDMARKS`.

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

## Reserve CTA (Concepts A and B)

Concept C has no reservation button: reservations are not open, so its calls to action join the grand opening waitlist (see above).

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
