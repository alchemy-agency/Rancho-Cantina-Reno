# Owner editor: prototype (not deployed, not part of the build)

A small password-protected PHP page that lets the restaurant edit the content that changes: an announcement
banner, the $500 sign-up pop-up on/off, opening hours, the menu (sections and dishes: add, reorder, remove) and
four photos. It saves to `content.json` and regenerates a static `index.html` from a template, so visitors still
get a plain fast page. It runs on ordinary PHP hosting (SiteGround); no database, no Node.

Status: working prototype, tested on a local PHP server (login, wrong password, throttle, save, photo replace,
bad upload rejected, request-forgery check, hostile text escaped). Nothing has been installed on any host. The
owner has not yet decided whether to use it.

## Files
- `admin/index.php`, `admin/lib.php`: the editor and the "bake" that rebuilds `index.html`.
- `admin/config.php`: holds the password hash. Empty on purpose: set it first (instructions inside).
- `make_template.py <folder>`: turns a built `dist/index.html` into `index.template.html` (adds marker comments for
  hours, menu, announcement and the pop-up, plus a few lines of CSS for the announcement) and `content.default.json`.
- `test.mjs`: the Playwright checks that were used (expects a PHP server on 127.0.0.1:8187; adjust).

## To try it locally
1. `cd ../ && npm run build`, copy `dist/` to a scratch folder `site/`.
2. `python3 make_template.py site`, then copy `admin/` into `site/admin/`, set `admin/config.php`.
3. `cd site && php -S 127.0.0.1:8187`, open `/admin/`.

## Fix before it goes on a real host
- `admin/data/` (backups, login attempts) sits inside the public folder. SiteGround's static-file front end can
  serve such files and ignore `.htaccess`, so move `DATA` in `lib.php` and `index.php` to a folder ABOVE
  `public_html` (the SSH user's home has room).
- Use a strong real password; the session cookie is already HttpOnly, SameSite=Strict and Secure over HTTPS.
- Re-run `make_template.py` whenever the site's HTML changes, or the editor will overwrite those changes on save.
- If the Vercel copy of the site must stay in sync, it does not run PHP: the editor only applies to the SiteGround copy.
