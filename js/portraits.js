// ── Canvas drawing primitives (mirrors the pygame _e/_c/_r/_p/_l helpers) ──
function _e(ctx, c, cx, cy, rx, ry, w = 0) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(0.05, Math.abs(rx)), Math.max(0.05, Math.abs(ry)), 0, 0, Math.PI * 2);
  if (w === 0) { ctx.fillStyle = c; ctx.fill(); }
  else { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
}
function _c(ctx, c, cx, cy, r, w = 0) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2);
  if (w === 0) { ctx.fillStyle = c; ctx.fill(); }
  else { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
}
function _r(ctx, c, x, y, w, h, rad = 0) {
  ctx.beginPath();
  if (rad > 0 && ctx.roundRect) ctx.roundRect(x, y, w, h, rad);
  else ctx.rect(x, y, w, h);
  ctx.fillStyle = c; ctx.fill();
}
function _p(ctx, c, pts) {
  if (!pts.length) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = c; ctx.fill();
}
function _l(ctx, c, x1, y1, x2, y2, w = 2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, w);
  ctx.stroke();
}
function _arc(ctx, c, x, y, w, h, a1, a2, lw = 2) {
  // matches pygame.draw.arc(surface, color, rect, start_rad, end_rad, width)
  // pygame angles are counter-clockwise from +x axis with y pointing up-ish
  // canvas arc is clockwise with y pointing down, so we flip the angles.
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  ctx.beginPath();
  ctx.arc(0, 0, 1, -a2, -a1);
  ctx.restore();
  ctx.strokeStyle = c; ctx.lineWidth = lw / Math.max(rx, ry, 0.001);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  ctx.beginPath();
  ctx.arc(0, 0, 1, -a2, -a1);
  ctx.restore();
  ctx.strokeStyle = c; ctx.lineWidth = lw;
  ctx.stroke();
}

// ── Portrait palette ─────────────────────────────────────────────────────
const _T = rgb(210, 170, 120), _BR = rgb(150, 100, 55), _FG = rgb(220, 185, 80), _GR = rgb(180, 175, 165), _WH = rgb(235, 230, 220);
const _DK = rgb(100, 75, 45), _OR = rgb(210, 130, 50), _SG = rgb(80, 80, 90), _SN = rgb(30, 40, 80), _SK = rgb(120, 115, 70);
const _SW = rgb(240, 238, 228), _RA = rgb(180, 20, 20), _GB = rgb(200, 165, 40), _LW = rgb(230, 230, 225), _HG = rgb(40, 80, 40);
const _EB = rgb(20, 15, 10), _NP = rgb(200, 130, 120);

function _marshal(ctx, cx, cy, sz) {
  const S = sz / 50;
  _p(ctx, _SK, [[cx - 16 * S, cy + 4 * S], [cx + 16 * S, cy + 4 * S], [cx + 18 * S, cy + 50 * S], [cx - 18 * S, cy + 50 * S]]);
  [_GB, rgb(200, 50, 50), _GB, rgb(50, 100, 200)].forEach((col, i) => _c(ctx, col, cx - 9 * S + i * 6 * S, cy + 14 * S, 3 * S));
  _r(ctx, _GB, cx - 18 * S, cy + 3 * S, 8 * S, 5 * S, 2); _r(ctx, _GB, cx + 10 * S, cy + 3 * S, 8 * S, 5 * S, 2);
  _e(ctx, _T, cx, cy + 4 * S, 10 * S, 6 * S); _e(ctx, _T, cx, cy - 14 * S, 18 * S, 16 * S);
  _e(ctx, _FG, cx, cy - 6 * S, 10 * S, 7 * S); _e(ctx, rgb(160, 110, 80), cx, cy - 3 * S, 6 * S, 4 * S);
  _e(ctx, _EB, cx, cy - 7 * S, 4 * S, 3 * S);
  _c(ctx, _SW, cx - 8 * S, cy - 18 * S, 4 * S); _c(ctx, _SW, cx + 8 * S, cy - 18 * S, 4 * S);
  _c(ctx, _EB, cx - 8 * S, cy - 18 * S, 2 * S); _c(ctx, _EB, cx + 8 * S, cy - 18 * S, 2 * S);
  _p(ctx, _BR, [[cx - 14 * S, cy - 22 * S], [cx - 22 * S, cy - 10 * S], [cx - 18 * S, cy - 2 * S], [cx - 10 * S, cy - 16 * S]]);
  _p(ctx, _BR, [[cx + 14 * S, cy - 22 * S], [cx + 22 * S, cy - 10 * S], [cx + 18 * S, cy - 2 * S], [cx + 10 * S, cy - 16 * S]]);
  _p(ctx, _SK, [[cx - 20 * S, cy - 26 * S], [cx + 20 * S, cy - 26 * S], [cx + 16 * S, cy - 34 * S], [cx - 16 * S, cy - 34 * S]]);
  _r(ctx, _GB, cx - 22 * S, cy - 28 * S, 44 * S, 4 * S);
  _p(ctx, rgb(90, 85, 55), [[cx - 22 * S, cy - 28 * S], [cx + 22 * S, cy - 28 * S], [cx + 26 * S, cy - 24 * S], [cx - 26 * S, cy - 24 * S]]);
  _c(ctx, _GB, cx, cy - 30 * S, 4 * S);
}

function _kgb(ctx, cx, cy, sz) {
  const S = sz / 50;
  _e(ctx, _SG, cx, cy + 20 * S, 22 * S, 28 * S);
  _p(ctx, rgb(55, 55, 65), [[cx, cy + 4 * S], [cx - 8 * S, cy + 16 * S], [cx - 14 * S, cy - 2 * S]]);
  _p(ctx, rgb(55, 55, 65), [[cx, cy + 4 * S], [cx + 8 * S, cy + 16 * S], [cx + 14 * S, cy - 2 * S]]);
  _p(ctx, _SW, [[cx - 4 * S, cy + 4 * S], [cx + 4 * S, cy + 4 * S], [cx + 3 * S, cy + 22 * S], [cx - 3 * S, cy + 22 * S]]);
  _p(ctx, _RA, [[cx - 2 * S, cy + 8 * S], [cx + 2 * S, cy + 8 * S], [cx + 1 * S, cy + 20 * S], [cx - 1 * S, cy + 20 * S]]);
  _r(ctx, _RA, cx - 24 * S, cy + 10 * S, 10 * S, 7 * S, 2);
  for (let i = 0; i < 3; i++) _c(ctx, _GB, cx, cy + 6 * S + i * 5 * S, 1.5 * S + 1);
  _e(ctx, _T, cx, cy - 14 * S, 22 * S, 20 * S);
  _e(ctx, _FG, cx - 16 * S, cy - 10 * S, 10 * S, 8 * S); _e(ctx, _FG, cx + 16 * S, cy - 10 * S, 10 * S, 8 * S);
  _e(ctx, _NP, cx, cy - 8 * S, 8 * S, 6 * S); _c(ctx, _EB, cx, cy - 8 * S, 3 * S);
  _c(ctx, _SW, cx - 10 * S, cy - 18 * S, 4 * S); _c(ctx, _SW, cx + 10 * S, cy - 18 * S, 4 * S);
  _c(ctx, _EB, cx - 10 * S, cy - 18 * S, 2 * S); _c(ctx, _EB, cx + 10 * S, cy - 18 * S, 2 * S);
  _c(ctx, _T, cx - 18 * S, cy - 28 * S, 6 * S); _c(ctx, _T, cx + 18 * S, cy - 28 * S, 6 * S);
  _c(ctx, _NP, cx - 18 * S, cy - 28 * S, 3 * S); _c(ctx, _NP, cx + 18 * S, cy - 28 * S, 3 * S);
}

function _youth(ctx, cx, cy, sz) {
  const S = sz / 50;
  _p(ctx, rgb(50, 90, 50), [[cx - 14 * S, cy + 4 * S], [cx + 14 * S, cy + 4 * S], [cx + 16 * S, cy + 50 * S], [cx - 16 * S, cy + 50 * S]]);
  _p(ctx, _SW, [[cx - 6 * S, cy + 4 * S], [cx + 6 * S, cy + 4 * S], [cx + 4 * S, cy + 18 * S], [cx - 4 * S, cy + 18 * S]]);
  _e(ctx, _OR, cx, cy - 14 * S, 16 * S, 15 * S);
  _p(ctx, _OR, [[cx - 14 * S, cy - 24 * S], [cx - 8 * S, cy - 38 * S], [cx - 4 * S, cy - 24 * S]]);
  _p(ctx, _OR, [[cx + 14 * S, cy - 24 * S], [cx + 8 * S, cy - 38 * S], [cx + 4 * S, cy - 24 * S]]);
  _p(ctx, _NP, [[cx - 12 * S, cy - 25 * S], [cx - 8 * S, cy - 35 * S], [cx - 5 * S, cy - 25 * S]]);
  _p(ctx, _NP, [[cx + 12 * S, cy - 25 * S], [cx + 8 * S, cy - 35 * S], [cx + 5 * S, cy - 25 * S]]);
  _e(ctx, _WH, cx, cy - 8 * S, 8 * S, 6 * S);
  _p(ctx, _NP, [[cx, cy - 10 * S], [cx - 2 * S, cy - 8 * S], [cx + 2 * S, cy - 8 * S]]);
  _l(ctx, _DK, cx - 8 * S, cy - 8 * S, cx - 22 * S, cy - 10 * S, 1); _l(ctx, _DK, cx + 8 * S, cy - 8 * S, cx + 22 * S, cy - 10 * S, 1);
  _l(ctx, _DK, cx - 8 * S, cy - 6 * S, cx - 22 * S, cy - 6 * S, 1); _l(ctx, _DK, cx + 8 * S, cy - 6 * S, cx + 22 * S, cy - 6 * S, 1);
  _e(ctx, rgb(80, 160, 80), cx - 7 * S, cy - 17 * S, 5 * S, 4 * S); _e(ctx, rgb(80, 160, 80), cx + 7 * S, cy - 17 * S, 5 * S, 4 * S);
  _e(ctx, _EB, cx - 7 * S, cy - 17 * S, 2 * S, 3 * S); _e(ctx, _EB, cx + 7 * S, cy - 17 * S, 2 * S, 3 * S);
  _p(ctx, _HG, [[cx - 20 * S, cy - 26 * S], [cx + 20 * S, cy - 26 * S], [cx + 16 * S, cy - 36 * S], [cx - 16 * S, cy - 36 * S]]);
  _r(ctx, rgb(30, 60, 30), cx - 22 * S, cy - 28 * S, 44 * S, 4 * S);
  _p(ctx, rgb(50, 40, 30), [[cx - 24 * S, cy - 26 * S], [cx + 24 * S, cy - 26 * S], [cx + 26 * S, cy - 23 * S], [cx - 26 * S, cy - 23 * S]]);
  const star = [];
  for (let k = 0; k < 5; k++) {
    const a = (-90 + 72 * k) * Math.PI / 180, b = (-90 + 72 * k + 36) * Math.PI / 180;
    star.push([cx + 5 * S * Math.cos(a), cy - 32 * S + 5 * S * Math.sin(a)]);
    star.push([cx + 2 * S * Math.cos(b), cy - 32 * S + 2 * S * Math.sin(b)]);
  }
  _p(ctx, _RA, star);
}

function _marxologist(ctx, cx, cy, sz) {
  const S = sz / 50;
  _p(ctx, _SN, [[cx - 16 * S, cy + 2 * S], [cx + 16 * S, cy + 2 * S], [cx + 18 * S, cy + 50 * S], [cx - 18 * S, cy + 50 * S]]);
  _p(ctx, _SW, [[cx - 5 * S, cy + 2 * S], [cx + 5 * S, cy + 2 * S], [cx + 4 * S, cy + 22 * S], [cx - 4 * S, cy + 22 * S]]);
  _p(ctx, _RA, [[cx - 2 * S, cy + 4 * S], [cx + 2 * S, cy + 4 * S], [cx, cy + 22 * S]]);
  _p(ctx, rgb(25, 35, 70), [[cx, cy + 2 * S], [cx - 8 * S, cy + 18 * S], [cx - 16 * S, cy + 2 * S]]);
  _p(ctx, rgb(25, 35, 70), [[cx, cy + 2 * S], [cx + 8 * S, cy + 18 * S], [cx + 16 * S, cy + 2 * S]]);
  _e(ctx, _DK, cx, cy - 12 * S, 20 * S, 18 * S); _e(ctx, rgb(80, 55, 30), cx, cy - 22 * S, 18 * S, 6 * S);
  _e(ctx, _T, cx, cy - 4 * S, 14 * S, 10 * S); _e(ctx, rgb(160, 110, 90), cx, cy - 2 * S, 10 * S, 7 * S);
  _l(ctx, rgb(80, 50, 30), cx - 6 * S, cy - 2 * S, cx + 6 * S, cy - 2 * S, Math.max(1, S));
  _c(ctx, rgb(60, 40, 25), cx - 4 * S, cy - 6 * S, 2 * S); _c(ctx, rgb(60, 40, 25), cx + 4 * S, cy - 6 * S, 2 * S);
  _c(ctx, _SW, cx - 8 * S, cy - 16 * S, 5 * S); _c(ctx, _SW, cx + 8 * S, cy - 16 * S, 5 * S);
  _c(ctx, rgb(60, 80, 40), cx - 8 * S, cy - 16 * S, 3 * S); _c(ctx, rgb(60, 80, 40), cx + 8 * S, cy - 16 * S, 3 * S);
  _c(ctx, _EB, cx - 8 * S, cy - 16 * S, 1.5 * S + 1); _c(ctx, _EB, cx + 8 * S, cy - 16 * S, 1.5 * S + 1);
  _c(ctx, _GB, cx - 8 * S, cy - 16 * S, 6 * S, Math.max(1, S)); _c(ctx, _GB, cx + 8 * S, cy - 16 * S, 6 * S, Math.max(1, S));
  _l(ctx, _GB, cx - 2 * S, cy - 16 * S, cx + 2 * S, cy - 16 * S, Math.max(1, S));
  _l(ctx, _GB, cx - 14 * S, cy - 16 * S, cx - 18 * S, cy - 14 * S, Math.max(1, S));
  _l(ctx, _GB, cx + 14 * S, cy - 16 * S, cx + 18 * S, cy - 14 * S, Math.max(1, S));
  _c(ctx, _DK, cx - 20 * S, cy - 14 * S, 5 * S); _c(ctx, _DK, cx + 20 * S, cy - 14 * S, 5 * S);
  _c(ctx, _NP, cx - 20 * S, cy - 14 * S, 2.5 * S + 1); _c(ctx, _NP, cx + 20 * S, cy - 14 * S, 2.5 * S + 1);
}

function _lysenko(ctx, cx, cy, sz) {
  const S = sz / 50;
  _p(ctx, _LW, [[cx - 16 * S, cy + 2 * S], [cx + 16 * S, cy + 2 * S], [cx + 18 * S, cy + 50 * S], [cx - 18 * S, cy + 50 * S]]);
  _p(ctx, rgb(200, 200, 195), [[cx, cy + 2 * S], [cx - 7 * S, cy + 20 * S], [cx - 16 * S, cy + 2 * S]]);
  _p(ctx, rgb(200, 200, 195), [[cx, cy + 2 * S], [cx + 7 * S, cy + 20 * S], [cx + 16 * S, cy + 2 * S]]);
  _r(ctx, rgb(200, 200, 195), cx + 6 * S, cy + 22 * S, 8 * S, 10 * S, 1);
  _l(ctx, _EB, cx + 10 * S, cy + 22 * S, cx + 10 * S, cy + 30 * S, Math.max(1, S));
  _p(ctx, _SW, [[cx - 4 * S, cy + 2 * S], [cx + 4 * S, cy + 2 * S], [cx + 3 * S, cy + 20 * S], [cx - 3 * S, cy + 20 * S]]);
  _p(ctx, rgb(40, 40, 120), [[cx - 2 * S, cy + 4 * S], [cx + 2 * S, cy + 4 * S], [cx, cy + 20 * S]]);
  _e(ctx, rgb(40, 35, 40), cx, cy + 1 * S, 10 * S, 7 * S); _c(ctx, rgb(40, 35, 40), cx, cy - 16 * S, 16 * S);
  _p(ctx, rgb(200, 170, 40), [[cx + 12 * S, cy - 14 * S], [cx + 24 * S, cy - 12 * S], [cx + 12 * S, cy - 10 * S]]);
  _l(ctx, rgb(160, 130, 20), cx + 12 * S, cy - 12 * S, cx + 24 * S, cy - 12 * S, Math.max(1, S));
  _c(ctx, rgb(220, 200, 50), cx - 6 * S, cy - 18 * S, 6 * S); _c(ctx, rgb(220, 200, 50), cx + 6 * S, cy - 18 * S, 6 * S);
  _c(ctx, _EB, cx - 6 * S, cy - 18 * S, 3 * S); _c(ctx, _EB, cx + 6 * S, cy - 18 * S, 3 * S);
  _c(ctx, _SW, cx - 5 * S, cy - 19 * S, 1); _c(ctx, _SW, cx + 5 * S, cy - 19 * S, 1);
  for (let i = 0; i < 3; i++) {
    _p(ctx, rgb(55, 45, 55), [[cx - 4 * S + i * 4 * S, cy - 30 * S], [cx - 6 * S + i * 4 * S, cy - 42 * S], [cx - 2 * S + i * 4 * S, cy - 30 * S]]);
  }
  _p(ctx, rgb(35, 30, 35), [[cx - 16 * S, cy + 2 * S], [cx - 26 * S, cy + 20 * S], [cx - 20 * S, cy + 28 * S], [cx - 12 * S, cy + 14 * S]]);
  _p(ctx, rgb(35, 30, 35), [[cx + 16 * S, cy + 2 * S], [cx + 26 * S, cy + 20 * S], [cx + 20 * S, cy + 28 * S], [cx + 12 * S, cy + 14 * S]]);
}

function _veteran(ctx, cx, cy, sz) {
  const S = sz / 50;
  _p(ctx, rgb(70, 50, 35), [[cx - 15 * S, cy + 4 * S], [cx + 15 * S, cy + 4 * S], [cx + 17 * S, cy + 50 * S], [cx - 17 * S, cy + 50 * S]]);
  _p(ctx, _SW, [[cx - 4 * S, cy + 4 * S], [cx + 4 * S, cy + 4 * S], [cx + 3 * S, cy + 22 * S], [cx - 3 * S, cy + 22 * S]]);
  _r(ctx, _RA, cx - 22 * S, cy + 10 * S, 10 * S, 6 * S, 2);
  _l(ctx, rgb(220, 50, 50), cx - 22 * S, cy + 13 * S, cx - 12 * S, cy + 13 * S, Math.max(1, S));
  _l(ctx, rgb(80, 60, 40), cx - 6 * S, cy + 4 * S, cx - 10 * S, cy + 50 * S, Math.max(1, S * 1.5));
  _l(ctx, rgb(80, 60, 40), cx + 6 * S, cy + 4 * S, cx + 10 * S, cy + 50 * S, Math.max(1, S * 1.5));
  _e(ctx, _WH, cx, cy - 14 * S, 16 * S, 15 * S); _e(ctx, _WH, cx + 4 * S, cy - 6 * S, 12 * S, 7 * S);
  _e(ctx, _NP, cx + 14 * S, cy - 6 * S, 4 * S, 3 * S);
  _p(ctx, _GR, [[cx - 4 * S, cy - 2 * S], [cx + 8 * S, cy - 2 * S], [cx + 6 * S, cy + 12 * S], [cx + 2 * S, cy + 14 * S], [cx - 2 * S, cy + 12 * S]]);
  _l(ctx, _WH, cx + 2 * S, cy + 2 * S, cx + 1 * S, cy + 16 * S, Math.max(1, S * 1.5));
  _p(ctx, _WH, [[cx - 14 * S, cy - 18 * S], [cx - 24 * S, cy - 10 * S], [cx - 22 * S, cy - 2 * S], [cx - 12 * S, cy - 10 * S]]);
  _p(ctx, _WH, [[cx + 14 * S, cy - 18 * S], [cx + 24 * S, cy - 10 * S], [cx + 22 * S, cy - 2 * S], [cx + 12 * S, cy - 10 * S]]);
  _p(ctx, _NP, [[cx - 15 * S, cy - 16 * S], [cx - 22 * S, cy - 10 * S], [cx - 20 * S, cy - 4 * S], [cx - 13 * S, cy - 12 * S]]);
  _l(ctx, _GR, cx - 8 * S, cy - 26 * S, cx - 18 * S, cy - 38 * S, Math.max(2, S * 1.5));
  _l(ctx, _GR, cx - 18 * S, cy - 38 * S, cx - 14 * S, cy - 44 * S, Math.max(2, S * 1.5));
  _l(ctx, _GR, cx + 8 * S, cy - 26 * S, cx + 18 * S, cy - 38 * S, Math.max(2, S * 1.5));
  _l(ctx, _GR, cx + 18 * S, cy - 38 * S, cx + 14 * S, cy - 44 * S, Math.max(2, S * 1.5));
  _e(ctx, _SW, cx - 6 * S, cy - 18 * S, 4 * S, 3 * S); _e(ctx, _SW, cx + 6 * S, cy - 18 * S, 4 * S, 3 * S);
  _c(ctx, rgb(80, 100, 60), cx - 6 * S, cy - 18 * S, 2 * S); _c(ctx, rgb(80, 100, 60), cx + 6 * S, cy - 18 * S, 2 * S);
  _l(ctx, _GR, cx - 10 * S, cy - 22 * S, cx - 14 * S, cy - 20 * S, 1); _l(ctx, _GR, cx + 10 * S, cy - 22 * S, cx + 14 * S, cy - 20 * S, 1);
  _e(ctx, rgb(55, 45, 30), cx - 2 * S, cy - 30 * S, 18 * S, 8 * S);
  _r(ctx, rgb(45, 36, 22), cx - 16 * S, cy - 34 * S, 32 * S, 8 * S, 3);
  _p(ctx, rgb(40, 32, 18), [[cx - 16 * S, cy - 30 * S], [cx + 14 * S, cy - 30 * S], [cx + 18 * S, cy - 26 * S], [cx - 20 * S, cy - 26 * S]]);
}

const _PORTRAITS = {
  "Marshal": _marshal, "KGB Director": _kgb, "Youth President": _youth,
  "Head Marxologist": _marxologist, "Lysenkoism Prof.": _lysenko, "Red Veteran": _veteran,
};

const _PC = {};
function drawPortrait(ctx, char, cx, cy, size) {
  const key = char + "_" + size;
  if (!_PC[key]) {
    const s = size * 2;
    const off = document.createElement("canvas");
    off.width = s; off.height = s;
    const octx = off.getContext("2d");
    const fn = _PORTRAITS[char];
    if (fn) fn(octx, s / 2, s / 2, size);
    _PC[key] = off;
  }
  ctx.drawImage(_PC[key], cx - size, cy - size);
}
