<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
session_set_cookie_params(['lifetime' => 0, 'path' => '/admin/', 'httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
session_start();
header('X-Frame-Options: DENY'); header('Cache-Control: no-store'); header('X-Robots-Tag: noindex');
$cfg = require __DIR__ . '/config.php';
$msg = ''; $err = '';

// --- brute-force throttle: 5 failures per IP per 15 minutes
$ip = $_SERVER['REMOTE_ADDR'] ?? '?'; $af = DATA . '/attempts.json';
$att = is_file($af) ? (json_decode((string)file_get_contents($af), true) ?: []) : [];
$att[$ip] = array_values(array_filter($att[$ip] ?? [], fn($t) => $t > time() - 900));

if (($_POST['do'] ?? '') === 'login') {
    if (count($att[$ip]) >= 5) { $err = 'Too many attempts. Try again in 15 minutes.'; }
    elseif (password_verify((string)($_POST['password'] ?? ''), $cfg['hash'])) { session_regenerate_id(true); $_SESSION['ok'] = true; $_SESSION['csrf'] = bin2hex(random_bytes(16)); $att[$ip] = []; }
    else { $att[$ip][] = time(); $err = 'Wrong password.'; usleep(600000); }
    atomic_write($af, json_encode($att));
}
if (empty($_SESSION['ok'])) { ?>
<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rancho Cantina: sign in</title>
<style>body{font:16px/1.5 system-ui,sans-serif;background:#f6f1e8;display:grid;place-items:center;min-height:100vh;margin:0}form{background:#fff;padding:2rem;border:1px solid #d9cfbd;width:min(22rem,90vw)}input,button{font:inherit;padding:.6rem;width:100%;box-sizing:border-box;margin-top:.5rem}button{background:#b4421d;color:#fff;border:0;cursor:pointer}.e{color:#a00}</style>
<form method="post"><h1 style="font-size:1.3rem;margin:0 0 .5rem">Rancho Cantina: edit site</h1><label>Password<input type="password" name="password" autofocus required></label><input type="hidden" name="do" value="login"><?php if ($err) echo '<p class="e">' . htmlspecialchars($err) . '</p>'; ?><button>Sign in</button></form>
<?php exit; }

// --- authenticated actions (CSRF-checked)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['do'] ?? '') !== 'login') {
    if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) { http_response_code(403); exit('Bad request token. Reload the page.'); }
    try {
        switch ($_POST['do'] ?? '') {
            case 'save': save_content(sanitize($_POST)); $msg = 'Saved. The live site is updated.'; break;
            case 'photo': $r = replace_photo((string)($_POST['slot'] ?? ''), $_FILES['photo'] ?? []); if ($r) { $err = $r; } else { bake(); $msg = 'Photo replaced.'; } break;
            case 'reset': copy(ROOT . '/content.default.json', ROOT . '/content.json'); bake(); $msg = 'Restored the original text.'; break;
            case 'logout': session_destroy(); header('Location: ./'); exit;
        }
    } catch (Throwable $t) { $err = 'Something went wrong: ' . $t->getMessage(); }
}
$c = load_content();
$J = json_encode($c, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE);
$csrf = htmlspecialchars($_SESSION['csrf']);
?><!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rancho Cantina: edit site</title>
<style>
body{font:16px/1.5 system-ui,sans-serif;background:#f6f1e8;margin:0;color:#2b2118}main{max-width:52rem;margin:0 auto;padding:1rem}
h1{font-size:1.4rem}h2{font-size:1.1rem;margin:2rem 0 .5rem;border-bottom:2px solid #b4421d;padding-bottom:.25rem}
fieldset,.card{background:#fff;border:1px solid #d9cfbd;padding:.8rem;margin:.6rem 0}label{display:block;font-size:.85rem;color:#665}
input[type=text],textarea,select{font:inherit;width:100%;box-sizing:border-box;padding:.45rem;border:1px solid #bbb}textarea{min-height:3.2rem}
.row{display:grid;grid-template-columns:1fr 1fr auto;gap:.5rem;align-items:end;margin:.4rem 0}.btn,button{font:inherit;padding:.45rem .8rem;border:1px solid #b4421d;background:#fff;color:#b4421d;cursor:pointer}
.pri{background:#b4421d;color:#fff}.bar{position:sticky;bottom:0;background:#f6f1e8;padding:.7rem 0;border-top:1px solid #d9cfbd}.ok{background:#e3f2dc;padding:.6rem}.er{background:#fbe0dc;padding:.6rem}
.gh{display:flex;gap:.5rem;align-items:end}.gh>div{flex:1}.item{display:grid;grid-template-columns:1fr 2fr auto;gap:.5rem;margin:.4rem 0;align-items:start}
</style>
<main>
<h1>Edit the Rancho Cantina website</h1>
<p><a href="/" target="_blank">View the live site</a></p>
<?php if ($msg) echo '<p class="ok">' . htmlspecialchars($msg) . '</p>'; if ($err) echo '<p class="er">' . htmlspecialchars($err) . '</p>'; ?>
<form method="post" id="f"><input type="hidden" name="do" value="save"><input type="hidden" name="csrf" value="<?= $csrf ?>">
<h2>Announcement</h2>
<div class="card"><label><input type="checkbox" name="ann_on" id="ann_on"> Show a short announcement on the home page</label>
<label>Text (max 140 characters)<input type="text" name="ann_text" id="ann_text" maxlength="140"></label></div>
<h2>Email sign-up pop-up</h2>
<div class="card"><label><input type="checkbox" name="giveaway" id="giveaway"> Show the "Win $500 in Rancho tacos" pop-up to new visitors</label></div>
<h2>Hours</h2><div id="hours"></div><button type="button" data-act="add-hour">+ Add a line</button>
<h2>Menu</h2><div id="menu"></div><button type="button" data-act="add-group">+ Add a section</button>
<div class="bar"><button class="btn pri">Save and publish</button></div>
</form>
<h2>Photos</h2>
<?php foreach (SLOTS as $k => [$label, $files]) { $f = array_key_first($files); ?>
<form method="post" enctype="multipart/form-data" class="card" style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap"><input type="hidden" name="do" value="photo"><input type="hidden" name="csrf" value="<?= $csrf ?>"><input type="hidden" name="slot" value="<?= $k ?>">
<img src="/img/<?= $f ?>?v=<?= filemtime(ROOT . '/img/' . $f) ?>" width="120" alt=""><div style="flex:1;min-width:12rem"><strong><?= htmlspecialchars($label) ?></strong><br><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required></div><button class="btn">Replace photo</button></form>
<?php } ?>
<h2>Other</h2>
<form method="post" style="display:inline"><input type="hidden" name="csrf" value="<?= $csrf ?>"><button name="do" value="reset" onclick="return confirm('Put all text back to the original?')">Restore original text</button> <button name="do" value="logout">Sign out</button></form>
</main>
<script>
const D = <?= $J ?>; let n = 0; const $ = (s, r = document) => r.querySelector(s); const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mv = '<button type="button" data-act="up" title="Move up">&uarr;</button><button type="button" data-act="down" title="Move down">&darr;</button><button type="button" data-act="del" title="Remove">&times;</button>';
const hourRow = (r = {}) => { const i = ++n; return `<div class="row card" data-row><div><label>Day or label<input type="text" name="hours[${i}][label]" value="${esc(r.label)}"></label></div><div><label>Hours<input type="text" name="hours[${i}][time]" value="${esc(r.time)}"></label><label><input type="checkbox" name="hours[${i}][extra]" ${r.extra ? 'checked' : ''}> Show as a smaller extra line</label></div><div>${mv}</div></div>`; };
const itemRow = (g, it = {}) => { const i = ++n; return `<div class="item" data-row><input type="text" name="menu[${g}][items][${i}][name]" placeholder="Dish name" value="${esc(it.name)}"><textarea name="menu[${g}][items][${i}][desc]" placeholder="Description">${esc(it.desc)}</textarea><div>${mv}</div></div>`; };
const groupRow = (g = {name: '', items: []}) => { const i = ++n; return `<fieldset data-row data-group="${i}"><div class="gh"><div><label>Section name<input type="text" name="menu[${i}][name]" value="${esc(g.name)}"></label></div>${mv}</div><div class="items">${(g.items || []).map((it) => itemRow(i, it)).join('')}</div><button type="button" data-act="add-item">+ Add a dish</button></fieldset>`; };
$('#hours').innerHTML = D.hours.map(hourRow).join(''); $('#menu').innerHTML = D.menu.map(groupRow).join('');
$('#ann_on').checked = !!D.announcement.on; $('#ann_text').value = D.announcement.text || ''; $('#giveaway').checked = !!D.giveaway;
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, row = b.closest('[data-row]');
  if (a === 'del' && confirm('Remove this?')) row.remove();
  if (a === 'up' && row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling);
  if (a === 'down' && row.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling, row);
  if (a === 'add-hour') $('#hours').insertAdjacentHTML('beforeend', hourRow());
  if (a === 'add-group') $('#menu').insertAdjacentHTML('beforeend', groupRow());
  if (a === 'add-item') { const g = b.closest('[data-group]'); $('.items', g).insertAdjacentHTML('beforeend', itemRow(g.dataset.group)); }
});
</script>
