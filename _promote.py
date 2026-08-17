"""
Promote heading levels safely inside a page's content region.

The previous attempt used a placeholder swap whose regex ate the opening angle
bracket. This one only ever rewrites the digit inside an otherwise intact tag,
and works shallowest-first so a level promoted in one pass is not caught again
by the next.

Regions holding markup as *text* -- script, textarea, template, and anything
HTML-escaped -- are left alone.
"""
import re

PROTECT = [
    r'<script[\s\S]*?</script>',
    r'<textarea[\s\S]*?</textarea>',
    r'<template[\s\S]*?</template>',
    r'<!--[\s\S]*?-->',
]

def _mask(c):
    """Replace protected regions with same-length filler so offsets hold."""
    masked = c
    for pat in PROTECT:
        masked = re.sub(pat, lambda m: '\x01' * len(m.group(0)), masked, flags=re.I)
    return masked

def promote(path, start=None, end=None, levels=(3, 4, 5), dry=False):
    """Shift the given levels up by one (h3->h2, h4->h3, ...) between markers."""
    c = open(path, encoding='utf-8').read()
    s = c.find(start) if start else 0
    if start and s == -1:
        return 0, 'start marker not found'
    e = c.find(end, s + 1) if end else len(c)
    if end and e == -1:
        e = len(c)
    region, before, after = c[s:e], c[:s], c[e:]
    masked = _mask(region)

    edits = []          # (offset, oldlen, new)
    for lv in sorted(levels):                       # shallowest first
        for m in re.finditer(rf'<h{lv}(?=[\s>/])', masked):
            edits.append((m.start(), len(m.group(0)), f'<h{lv-1}'))
        for m in re.finditer(rf'</h{lv}>', masked):
            edits.append((m.start(), len(m.group(0)), f'</h{lv-1}>'))
        # re-mask so the next level's pass does not see what we just wrote
        for off, ln, new in edits[-0:]:
            pass
        masked = _blank(masked, [(o, l) for o, l, _ in edits])

    if not edits:
        return 0, 'nothing to promote'
    out = region
    for off, ln, new in sorted(edits, key=lambda x: -x[0]):
        out = out[:off] + new + out[off + ln:]
    if not dry:
        open(path, 'w', encoding='utf-8').write(before + out + after)
    return len(edits), 'ok'

def _blank(s, spans):
    b = list(s)
    for off, ln in spans:
        for i in range(off, min(off + ln, len(b))):
            b[i] = '\x01'
    return ''.join(b)
