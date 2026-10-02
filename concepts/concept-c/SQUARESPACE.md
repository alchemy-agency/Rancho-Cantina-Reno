# Putting Concept C on Squarespace: research and plan

Researched October 2, 2026. Every claim is labelled by how we know it:

- **Docs**: Squarespace Help Center, read directly.
- **Tested**: run in this repo on that date.
- **Community**: forum or blog reports, not Squarespace itself.
- **Inference**: judgment, to be proven in the spike below.

We have no Squarespace account in this session, so nothing here was tried inside Squarespace's editor. Section "One-day spike" is how to close that gap.

## Bottom line

**Yes, Concept C can be served from Squarespace 7.1, but only as a hybrid, and "design intact" and "easy to edit" pull against each other.** The design depends on GSAP ScrollTrigger pinning, Lenis smooth scroll, a Three.js scene, a MapLibre map, SVG-masked ink drawings, a 19 MB film and two licensed fonts. Squarespace 7.1 has nowhere to upload script, stylesheet, SVG or video files, so the code and most of those assets have to live somewhere else (Vercel, which already hosts the site) and be wired in with code injection.

That leaves two ways to build it:

| Build | Design | Client editing |
|---|---|---|
| **Lift and shift**: paste the page's HTML into Code Blocks | Intact, guaranteed | Raw HTML only. Not "easily editable". |
| **Hybrid**: native Squarespace blocks for the content, our CSS and JavaScript layered on top | Intact **if the spike passes** (needs proving) | Text, menu, hours, photos, buttons and signup are native. Animations, the 3D scene, the map and the drawings stay with the agency. |

**Recommendation:** go live now on the Vercel build (it is finished, approved and fast), then decide editability with the client. For this particular design, a content-editing layer on top of the existing code gives the client what they actually change (hours, menu, specials, photos) with zero design risk. If the client still wants the site inside their Squarespace account, run the one-day spike first, then do the hybrid in stages (highest-churn content first).

## What we found about the setup today

- **ranchocantina.com** (Lafayette and Danville) **is on Squarespace** (`server: Squarespace`). That is where "easily editable Squarespace" came from.
- **ranchocantinareno.com is not.** It resolves to Duda's hosting (`multiscreensite.com`, and its page data identifies a Duda site) and shows a placeholder: "Summer 2026", the hours listed as current, "dine-in reservations available", plus a Contact Us form for feedback, partnerships and job applications. Going live means moving that domain's DNS, and it means deciding what happens to that contact form (Concept C has only an email address).

## Squarespace facts that shape the build

| # | Fact | Source | What it means for Concept C |
|---|---|---|---|
| 1 | Developer Mode and custom templates exist only on **7.0**. On 7.1 you cannot create or modify a custom template. | Docs: [Developer Platform FAQ](https://support.squarespace.com/hc/en-us/articles/206545717) | No template-level build. Code comes in through code injection, Code Blocks and the CSS editor. |
| 2 | **Code injection** and **JavaScript or iframes in Code Blocks** need the **Core, Plus or Advanced** plan (not Basic). Per-page injection is available. | Docs: [code injection](https://support.squarespace.com/hc/en-us/articles/205815908-Using-Code-Injection), [custom code](https://support.squarespace.com/hc/en-us/articles/205815928-Add-custom-code-to-your-site) | Minimum plan is Core (about $23/month billed annually, $36 monthly, per 2026 price roundups; confirm on squarespace.com). Check which plan the client's existing site is on. |
| 3 | A Code Block is limited to **400 KB**. Code in them **may not display while logged in**; use "Preview in Safe Mode". Custom scripts can interfere with site editing, and Safe Mode turns them off. | Docs: [Code blocks](https://support.squarespace.com/hc/en-us/articles/206543167-Code-blocks), code injection article | The 3D chunk (508 KB) and the map library cannot be pasted in. Our scripts must not run while the client is editing (see guard below). |
| 4 | **Custom Files** (CSS editor) accept only `.jpg .png .gif .ttf .otf .webp .woff`. | Docs: [Add custom CSS](https://support.squarespace.com/hc/en-us/articles/206545567-Add-custom-CSS-to-your-site) | Of the 50 files in `public/`, only the 23 `.webp` photos fit. JavaScript, CSS, the 9 SVG drawings, the 3 video files, the `.mjs` map library and the `.woff2` fonts cannot be uploaded there. |
| 5 | Squarespace states "We don't support CORS requests". | Docs: custom code article | Anything the page loads cross-origin that needs CORS has to come from a host that sends it. |
| 6 | **Cross-origin CSS `mask-image` is blocked without a CORS header.** Browser error: "...has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header...". | **Tested** | The wordmark, flourish and ink drawings are SVG masks, so the asset host must send `Access-Control-Allow-Origin` (a few lines in `vercel.json`). Squarespace cannot be that host. |
| 7 | Both **MapLibre 6.11** (ES module plus module worker) and **MapLibre 5.24** (classic script) **load and run from another origin** when the host sends CORS headers. | **Tested** | The live map is not a blocker. |
| 8 | **Background video**: 60 seconds maximum, loops, **no sound**; sources are an upload, YouTube or Vimeo (Vimeo needs a paid plan). | Docs: [background videos](https://support.squarespace.com/hc/en-us/articles/218562738-Add-background-videos-to-page-sections) | The hero film has a sound toggle, so it must be a custom `<video>` in a Code Block with the file hosted elsewhere. |
| 9 | **Fonts**: upload `.otf .ttf .woff .woff2` in Site styles, one style per file; Squarespace reminds you to hold the licence. Custom Adobe Fonts kits are **not supported on 7.1**. | Docs: [Uploading custom fonts](https://support.squarespace.com/hc/en-us/articles/40181698210701-Uploading-custom-fonts), [fonts](https://support.squarespace.com/hc/en-us/articles/206545327-Changing-fonts) | Orpheus Pro and Adobe Garamond Pro would be uploaded as separate files, so the **client must hold a web-embedding licence** (Orpheus Pro is on [Adobe Fonts](https://fonts.adobe.com/fonts/orpheus), which is a different licence from the files in the Drive folder). Confirm before launch on any platform. |
| 10 | Native pieces that map to our sections: **Menu block** (Basic and up), **Promotional pop-up** (Core and up; newsletter action; timing rules), **Newsletter and Form blocks**. | Docs: [Menu blocks](https://support.squarespace.com/hc/en-us/articles/206544087-Menu-blocks), [pop-up](https://support.squarespace.com/hc/en-us/articles/115008375848-Add-a-promotional-pop-up) | Menu highlights, the giveaway and the waitlist can all be client-editable. |
| 11 | Skip scripts while editing with `document.body.classList.contains('sqs-edit-mode')` or `window.frameElement !== null`. | Community: [Beatriz Caraballo](https://www.beatrizcaraballo.com/blog/stop-code-working-edit-mode-live-site-squarespace) | Required so the client's editor is not hijacked by smooth scroll and pinning. |
| 12 | Community reports point to serving scripts from an external host (GitHub with jsDelivr, or any CDN), because the asset library takes no `.js` or `.json`. | Community: [forum thread](https://forum.squarespace.com/topic/261614-is-squarespace-capable-of-hosting-raw-javascript-or-plain-text/) | Our Vercel project becomes the asset host. Two systems to keep alive, but only one holds content. |

Payload for reference (production build): JavaScript 144 KB, plus 14 KB for the map, plus 508 KB for the 3D scene (about 190 KB gzipped in total); CSS 36 KB; fonts 720 KB; photos 2.2 MB; ink SVGs 596 KB; film 19 MB across three encodings; map library 1.2 MB.

## Options compared

| | Design intact | Client can edit | Time to live (rough) | Risk |
|---|---|---|---|---|
| **A. Vercel as built**, agency edits via Git | 100% | No (agency turnaround) | Same day once DNS access exists | Low |
| **B. Vercel plus a content layer** (Git-based or headless CMS for text, hours, menu, photos) | 100% | Yes: content, not layout | 1 to 2 weeks | Low to medium |
| **C. Squarespace hybrid** (native blocks plus our code layer) | About 95 to 100% after the spike | Most copy, photos, menu, hours, signup | 3 to 5 weeks after a passed spike | **High**: depends on Squarespace's DOM and updates |
| **D. Squarespace native only**, no custom JavaScript | Materially simpler: no 3D arches, no pinned trail, Google Maps instead of ours | Everything | 1 to 2 weeks | Low |
| **E. Lift and shift into Code Blocks** | 100% | HTML only | Days | Medium: Squarespace's global CSS can restyle our markup |

Time estimates are mine, not measured. The unknowns in C are the heritage trail inside Fluid Engine, mobile layouts, and how the editor behaves with our scripts.

## If we build the Squarespace hybrid

**Structure**

- Squarespace owns the page: sections, content and navigation, built in Fluid Engine with native blocks.
- Vercel (or another CDN) owns `rancho.css`, `rancho.js`, the film, the SVG drawings, fonts and the map library, served with `Access-Control-Allow-Origin` and long cache headers.
- Code injection loads them (sketch, not yet run in Squarespace):

```html
<!-- Settings > Advanced > Code Injection > Header -->
<link rel="preconnect" href="https://assets.example" crossorigin>
<link rel="stylesheet" href="https://assets.example/rancho.css">

<!-- Footer: skip everything inside the Squarespace editor -->
<script>
  if (!document.body.classList.contains('sqs-edit-mode') && window.self === window.top) {
    var s = document.createElement('script'); s.type = 'module'
    s.src = 'https://assets.example/rancho.js'; document.head.appendChild(s)
  }
</script>
```

- Target sections by **anchor IDs we set** (`#hero`, `#menu`, `#trail`, `#visit`), not by Squarespace's generated class names, which can change when Squarespace updates 7.1. **Inference.**

**Section by section**

| Section | Built from | Client edits | Stays with the agency |
|---|---|---|---|
| Header | Native header restyled by CSS, with scroll behaviour from a small script | Navigation links | Transparent-to-white change |
| Hero | Section with Text and Button blocks over the poster image | Subline, button labels and links | The film and sound toggle (Code Block `<video>`), the wordmark |
| Statement | Text blocks | The words | The drawing's reveal |
| Building | Image and Text blocks | Photo, caption, text | Parallax |
| From the fire to the table (3D) | Image or Gallery blocks hold the six photos and names; our script reads them | **Photos and dish names** | The Three.js scene (Code Block canvas) |
| Menu highlights | Native **Menu block**, restyled with CSS | Every dish and description | Layout styling |
| Cantina | Image blocks with captions | Photos and captions | Tilt effect |
| Heritage trail | Text blocks plus SVG drawings in one section; script wraps them into the pinned horizontal pan | The four texts | Drawings, pinning |
| Family | Image and Text blocks | Everything | none |
| Visit, hours, parking list | Text and Button blocks | Address, hours, the three parking facts | none |
| Parking map | Code Block plus MapLibre plus hosted GeoJSON | The sentences around it | Lines, lot, landmarks (data in `src/pmap-data.js`) |
| Waitlist and giveaway | Native Newsletter block and Promotional pop-up (Core and up) | Copy, image, timing, where signups go | Styling |
| Footer | Native footer with a Newsletter block | Everything | none |

**What will not be pixel-identical (expect to discuss):** pop-up and newsletter form styling is limited to what Squarespace exposes; the custom scrollbar and Lenis smooth scroll may be dropped if they fight Squarespace's own scroll handling; mobile layouts are re-expressed in Fluid Engine's separate mobile editor.

## One-day spike (do this before committing to C)

Use a Squarespace 7.1 Fluid Engine site on a **Core or higher plan** (code injection will not work on Basic). Pass or fail each:

1. Header and footer injection loading CSS and JS from the Vercel host, with the edit-mode guard; the editor stays usable.
2. GSAP ScrollTrigger **pin plus horizontal pan** works in a Fluid Engine section on desktop and phone.
3. Lenis does not conflict with Squarespace's header, anchors or scroll restoration (if it does, drop it).
4. The Three.js canvas and the MapLibre map render in Code Blocks (and the 400 KB limit is respected).
5. SVG masks and fonts load from the CORS-enabled host; the uploaded font appears correctly in Site styles.
6. The `<video>` hero plays muted, with the poster, and the sound toggle works on iOS and Android.
7. The native Menu block restyles to our menu card; a Newsletter block and the Promotional pop-up restyle acceptably.
8. Mobile: no horizontal scroll, no layout shift, a sensible Lighthouse score against the current Vercel build.

If 2 or 3 fail, choose between a simplified heritage trail and option B. Everything else has a workaround.

## Go-live checklist (any path)

1. **DNS access** to `ranchocantinareno.com` (registrar or Duda). Lower the TTL ahead of the cutover and keep the Duda placeholder up until then.
2. Decide the contact form, partnerships and **job applications** that the Duda placeholder has today.
3. Wire the **waitlist and Club Rancho** forms to the real list (Squarespace newsletter, Mailchimp or Klaviyo); today they are placeholders.
4. Confirm the **font licence** for web use.
5. Make `og:image` and canonical URLs absolute on the real domain; add analytics and the Meta pixel; submit the sitemap.
6. Replace the placeholder hours and "Summer 2026" in Google Business Profile and any listings so nothing says open or reservable.
7. Check the real phone, social handles, and the Dorinda's Chocolates pin position with the client (see `concepts/README.md`).
8. Test matrix: iOS Safari, Android Chrome, desktop Chrome, Safari, Firefox, with and without Data Saver.

## Questions for Dan and the client

1. What does the client actually need to change themselves, and how often? Hours, specials, menu, photos, events, jobs?
2. Is "Squarespace" a requirement (single login and bill, tie-in to the Lafayette and Danville site), or a means to editability?
3. Who holds the registrar and DNS for `ranchocantinareno.com`, and what plan is their Squarespace account on?
4. Are they willing to accept option D's simpler design if that is what Squarespace-only editing costs?

## Next steps we can take

- **Now:** point the domain at the Vercel build (option A) so the banners can go up.
- **Prep that helps every path:** add CORS and cache headers to `vercel.json`, and split the build into `rancho.css` and `rancho.js` assets.
- **Spike:** needs a Squarespace trial or staging site on Core or higher.
