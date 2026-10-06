<?php
// Shared helpers: validation, atomic writes, and "bake" (regenerate the static index.html from index.template.html).
declare(strict_types=1);

const ROOT = __DIR__ . '/..';
const DATA = __DIR__ . '/data';

// Photo slots the owner may replace: key => [label, [filename => width]]. Aspect ratio is kept from the existing file.
const SLOTS = [
    'building'  => ['Building exterior (hero-adjacent section and Visit background)', ['reno-exterior-720.webp' => 720, 'reno-exterior-1200.webp' => 1200, 'reno-exterior-1536.webp' => 1536]],
    'family'    => ['Family section photo', ['family-rancho-720.webp' => 720, 'family-rancho-1090.webp' => 1090]],
    'margarita' => ['Cantina: Rancho margarita', ['drink-rancho-margarita-720.webp' => 720, 'drink-rancho-margarita-1200.webp' => 1200]],
    'bar'       => ['Cantina: the back bar', ['interior-bar-bottles-2-720.webp' => 720, 'interior-bar-bottles-2-1200.webp' => 1200]],
];

function clean(mixed $v, int $max): string {
    $s = is_string($v) ? $v : '';
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    $s = trim(strip_tags($s));
    return mb_substr($s, 0, $max);
}

function sanitize(array $in): array {
    $out = ['announcement' => ['on' => !empty($in['ann_on']), 'text' => clean($in['ann_text'] ?? '', 140)], 'giveaway' => !empty($in['giveaway']), 'hours' => [], 'menu' => []];
    foreach (($in['hours'] ?? []) as $r) {
        $l = clean($r['label'] ?? '', 60); $t = clean($r['time'] ?? '', 60);
        if ($l !== '' && $t !== '') $out['hours'][] = ['label' => $l, 'time' => $t, 'extra' => !empty($r['extra'])];
    }
    foreach (array_slice(array_values($in['menu'] ?? []), 0, 12) as $gi => $g) {
        $name = clean($g['name'] ?? '', 40); $items = [];
        foreach (array_slice(array_values($g['items'] ?? []), 0, 30) as $it) {
            $n = clean($it['name'] ?? '', 80); $d = clean($it['desc'] ?? '', 300);
            if ($n !== '') $items[] = ['name' => $n, 'desc' => $d];
        }
        if ($name !== '' && $items) $out['menu'][] = ['name' => $name, 'tall' => count($out['menu']) === 0, 'items' => $items];
    }
    return $out;
}

function atomic_write(string $path, string $data): void {
    $tmp = $path . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (file_put_contents($tmp, $data, LOCK_EX) === false || !rename($tmp, $path)) throw new RuntimeException("Could not write $path");
}

function load_content(): array {
    $p = ROOT . '/content.json';
    $raw = is_file($p) ? file_get_contents($p) : file_get_contents(ROOT . '/content.default.json');
    $c = json_decode((string)$raw, true);
    return is_array($c) ? $c : json_decode((string)file_get_contents(ROOT . '/content.default.json'), true);
}

function save_content(array $c): void {
    $p = ROOT . '/content.json';
    if (is_file($p)) { copy($p, DATA . '/backups/content-' . date('Ymd-His') . '.json'); $b = glob(DATA . '/backups/content-*.json') ?: []; rsort($b); foreach (array_slice($b, 20) as $old) @unlink($old); }
    atomic_write($p, json_encode($c, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    bake($c);
}

function bake(?array $c = null): void {
    $c ??= load_content();
    $t = (string)file_get_contents(ROOT . '/index.template.html');
    $e = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    $h = '<dl class="hours">';
    foreach ($c['hours'] as $r) $h .= '<div' . (!empty($r['extra']) ? ' class="hours__extra"' : '') . '><dt>' . $e($r['label']) . '</dt><dd>' . $e($r['time']) . '</dd></div>';
    $t = str_replace('<!--rc:hours--><!--/rc:hours-->', $h . '</dl>', $t);

    $m = '';
    foreach ($c['menu'] as $i => $g) {
        $m .= '<section class="mgroup' . ($i === 0 ? ' mgroup--tall' : '') . '"><h3><span class="wm-flourish wm-flourish--tiny" aria-hidden="true"></span>' . $e($g['name']) . '</h3><dl>';
        foreach ($g['items'] as $it) $m .= '<div><dt>' . $e($it['name']) . '</dt><dd>' . $e($it['desc']) . '</dd></div>';
        $m .= '</dl></section>';
    }
    $t = str_replace('<!--rc:menu--><!--/rc:menu-->', $m, $t);

    $a = (!empty($c['announcement']['on']) && $c['announcement']['text'] !== '') ? '<p class="hero__announce" role="status">' . $e($c['announcement']['text']) . '</p>' : '';
    $t = str_replace('<!--rc:announce--><!--/rc:announce-->', $a, $t);

    $t = !empty($c['giveaway']) ? str_replace(['<!--rc:giveaway-->', '<!--/rc:giveaway-->'], '', $t) : (string)preg_replace('~<!--rc:giveaway-->.*?<!--/rc:giveaway-->~s', '', $t);

    // cache-bust replaceable photos (same filename, new bytes)
    foreach (SLOTS as [, $files]) foreach ($files as $f => $w) {
        $p = ROOT . '/img/' . $f;
        if (is_file($p)) $t = str_replace('/img/' . $f, '/img/' . $f . '?v=' . filemtime($p), $t);
    }
    atomic_write(ROOT . '/index.html', $t);
}

function replace_photo(string $slot, array $file): string {
    if (!isset(SLOTS[$slot])) return 'Unknown photo slot.';
    if (($file['error'] ?? 1) !== UPLOAD_ERR_OK) return 'Upload failed (error ' . (int)($file['error'] ?? -1) . ').';
    if ($file['size'] > 12 * 1024 * 1024) return 'File is over 12 MB.';
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) return 'Please upload a JPG, PNG or WebP photo.';
    $info = getimagesize($file['tmp_name']);
    if (!$info || $info[0] < 1000 || $info[0] * $info[1] > 40_000_000) return 'Photo must be at least 1000 px wide and under 40 megapixels.';
    $src = imagecreatefromstring((string)file_get_contents($file['tmp_name']));
    if (!$src) return 'Could not read that image.';
    $files = SLOTS[$slot][1];
    $big = ROOT . '/img/' . array_key_last($files);
    $ref = getimagesize($big); $ratio = $ref[1] / $ref[0];              // keep the slot's aspect ratio
    $sw = imagesx($src); $sh = imagesy($src);
    $cw = $sw; $ch = (int)round($sw * $ratio);
    if ($ch > $sh) { $ch = $sh; $cw = (int)round($sh / $ratio); }       // cover-crop, centred
    $crop = imagecrop($src, ['x' => intdiv($sw - $cw, 2), 'y' => intdiv($sh - $ch, 2), 'width' => $cw, 'height' => $ch]);
    $bak = DATA . '/img-backup/' . date('Ymd-His') . '-' . $slot; mkdir($bak, 0750, true);
    foreach ($files as $f => $w) {
        $dst = imagescale($crop, $w, -1, IMG_BICUBIC);
        $tmp = ROOT . '/img/' . $f . '.tmp';
        imagewebp($dst, $tmp, 82);
        if (is_file(ROOT . '/img/' . $f)) copy(ROOT . '/img/' . $f, $bak . '/' . $f);
        rename($tmp, ROOT . '/img/' . $f);
    }
    return '';
}
