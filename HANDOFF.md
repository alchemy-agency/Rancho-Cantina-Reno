# Handoff: Rancho Cantina Reno website (read this first)

Last updated 2026-10-06. Written for whoever (or whichever Claude account) picks this up.

## Where things are
- Repo `alchemy-agency/Rancho-Cantina-Reno` (private). Work branch: `claude/rancho-reno-website-concepts-os0t8r`.
  It is 13+ commits ahead of `main`. `main` has only Concepts A and B, has NOT been merged, and no PR is open.
- **Final draft = `concepts/concept-c`** (Vite 8, vanilla JS, GSAP, Lenis, Three.js; MapLibre GL vendored in
  `public/vendor`). Concepts A and B are reference only; the client chose B on white with pieces of A.
- Live preview: https://rancho-reno-concept-c.vercel.app. Vercel team `team_JkKUqcinLE2W1fwKKNfpb99y`, project
  `rancho-reno-concept-c` = `prj_2csUmKfnX8Mkr2HCWmccVBIaipa6` (root dir `concepts/concept-c`, toolbar env var set,
  no login wall). Production deploys have been made from the branch with the Vercel API
  (create_deployment, gitSource ref = branch, the commit sha, target production), not by merging to main.
  A and B: `prj_EL8NOeROlKiehx8xmWyXDwworcc2`, `prj_jZDhG4Nn3pHjHWyk3PyaJb0hKIBe` (they deploy from main).
- `concepts/README.md` explains each section of Concept C and which client note produced it.

## Build, run, check
`cd concepts/concept-c && npm ci && npm run build` (output `dist/`), `npm run preview`. No test suite: checks were
Playwright scripts against a preview server (not in the repo). Headless Chromium has no H.264, so the film falls
back to the WebM, which is expected. To test https sites in that browser, trust the session's proxy CA once:
`certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n ccr-agent-proxy -i /root/.ccr/agent-proxy-ca.crt`.
Never use `pkill -f` in this sandbox (it kills the shell).

## Rules the client set (keep them)
"Mex-Western" (never Tex-Mex or "a Mexican restaurant"); no California or "Californio" (use Vaquero/Rancho);
"Opening this winter"; no prices; no Lafayette footage or branding; no sticky bottom Reserve bar; hide the Vercel
toolbar; keep the line-art drawings exactly as approved (only their cropped edges were restored); Lafayette and
Danville links stay out of the footer for now.

## Open items
1. **Go live on SiteGround (blocked).** The sandbox network policy closes the tunnel to the SiteGround SSH host,
   so nothing has been uploaded. The owner must allow the host under the cloud environment's Network access, or
   upload the zip by hand. Ready: `concepts/concept-c/deploy/siteground/.htaccess` (tested on Apache),
   `npm run deploy:siteground` (rsync over SSH; set `SG_HOST`, `SG_USER`, `SG_PATH`, optional `SG_KEY`, `SG_PORT`,
   `DRY_RUN=1`). SiteGround uses SSH KEY login on port 18765; the key passphrase is what the owner called the
   "password". Credentials are never in the repo: ask the owner again. Look at the target before writing
   (`ranchocantinareno.com` showed SiteGround's "Under construction" page; its IP differed from the account host's,
   so confirm which account owns it). Site must sit on a domain or subdomain ROOT (URLs are root-relative).
   After upload: turn on HTTPS Enforce in Site Tools, check the interactive map goes live, and note SiteGround's
   NGINX Direct Delivery can bypass `.htaccess` for static files (MapLibre is served as `.js` for this reason).
2. **Owner editing.** The owner asked about an Elementor-like builder. Elementor only edits its own WordPress
   pages (and its free version has no theme builder, popups, forms or custom CSS), so it cannot edit this page.
   Recommended instead: the small PHP editor in `concepts/concept-c/editor-prototype/` (read its README, it has
   things to fix first). Waiting on the owner's yes.
3. **From the client:** the original family photo (the current one is enlarged from a screenshot); short official
   rules for the $500 giveaway; an email service to connect the footer and pop-up sign-up forms (both are
   front-end only); how the cut-off note about the building frame being "redundant with..." ended; whether the
   statement and Visit sections should stay white or return to A's dark look; whether the map's "727" or the
   site's 700 Riverside Drive is the right number.
4. Concepts A and B still have the cropped drawings; only Concept C was re-traced.
5. Merge to `main` or open a PR only if the owner asks.

## Working with this owner
Be wary of session usage: no big multi-agent workflows unless the owner opts in (at most 2-3 agents). Do not
create PRs unless asked. Push only to the work branch. Commit trailers follow the session's attribution reminder.
