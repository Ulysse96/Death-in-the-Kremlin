// ── Spy option icons, drawn into 52×52 canvases (mirrors pygame version) ──

function _rOutline(ctx, c, x, y, w, h, lw, rad = 0) {
  ctx.beginPath();
  if (rad > 0 && ctx.roundRect) ctx.roundRect(x, y, w, h, rad);
  else ctx.rect(x, y, w, h);
  ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke();
}
function _pgArc(ctx, c, x, y, w, h, a1, a2, lw = 2) {
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(0.05, rx), Math.max(0.05, ry), 0, a1, a2);
  ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke();
}

function _drawSpyIcon0(ctx) { // Wire the phone
  _r(ctx, rgb(42, 28, 14), 14, 8, 24, 36, 5);
  _r(ctx, rgb(26, 42, 26), 17, 13, 18, 8, 2);
  for (let ix = 0; ix < 3; ix++) _c(ctx, C_GOLD, 22 + ix * 4, 17, 1);
  _c(ctx, rgb(170, 120, 100), 26, 37, 3);
  _pgArc(ctx, C_CRIMSON, 0, 20, 18, 24, Math.PI / 2, Math.PI * 1.5, 2);
  _l(ctx, C_CRIMSON, 0, 20, 14, 20, 2);
  _l(ctx, C_CRIMSON, 0, 44, 14, 44, 2);
  _r(ctx, C_CRIMSON, 0, 27, 10, 8, 2);
  _c(ctx, C_GOLD, 5, 31, 2);
  _l(ctx, C_GOLD, 2, 27, 1, 22, 1);
  _l(ctx, C_GOLD, 8, 27, 9, 22, 1);
}

function _drawSpyIcon1(ctx) { // Search the trash
  _r(ctx, rgb(80, 80, 85), 12, 22, 28, 28, 2);
  _r(ctx, rgb(60, 60, 65), 10, 20, 32, 5, 2);
  _p(ctx, C_CREAM, [[18, 18], [22, 8], [25, 18]]);
  _p(ctx, C_CREAM, [[28, 18], [32, 6], [35, 18]]);
  [10, 13, 16].forEach(y => _l(ctx, rgb(160, 140, 100), 19, y, 21, y, 1));
  [8, 11, 14].forEach(y => _l(ctx, rgb(160, 140, 100), 30, y, 33, y, 1));
  _c(ctx, C_GOLD, 38, 16, 9, 2);
  _c(ctx, rgb(20, 16, 10), 38, 16, 6);
  _l(ctx, C_GOLD, 44, 22, 50, 30, 3);
}

function _drawSpyIcon2(ctx) { // Bribe a subordinate
  _p(ctx, rgb(200, 160, 110), [[10, 30], [10, 44], [20, 48], [28, 44], [30, 30], [24, 28], [20, 36], [16, 28]]);
  _p(ctx, rgb(200, 160, 110), [[42, 30], [42, 44], [32, 48], [24, 44], [22, 30], [28, 28], [32, 36], [36, 28]]);
  _r(ctx, rgb(40, 90, 40), 16, 24, 20, 12, 2);
  _c(ctx, C_GOLD, 26, 30, 4);
  _l(ctx, C_GOLD, 26, 27, 26, 33, 1);
  const star = [];
  for (let k = 0; k < 5; k++) {
    const a = (-90 + 72 * k) * Math.PI / 180, b = (-90 + 72 * k + 36) * Math.PI / 180;
    star.push([26 + 6 * Math.cos(a), 12 + 6 * Math.sin(a)]);
    star.push([26 + 2.5 * Math.cos(b), 12 + 2.5 * Math.sin(b)]);
  }
  _p(ctx, C_CRIMSON, star);
}

function _drawSpyIcon3(ctx) { // Intercept the mail
  _r(ctx, C_CREAM, 6, 16, 40, 28, 3);
  _p(ctx, C_PARCHMENT, [[6, 16], [26, 32], [46, 16]]);
  _rOutline(ctx, C_BORDER, 6, 16, 40, 28, 2, 3);
  _r(ctx, rgb(245, 235, 200), 14, 8, 24, 20, 2);
  _l(ctx, rgb(160, 140, 100), 18, 12, 34, 12, 1);
  _l(ctx, rgb(160, 140, 100), 18, 15, 34, 15, 1);
  _l(ctx, rgb(160, 140, 100), 18, 18, 28, 18, 1);
  _c(ctx, C_CRIMSON, 36, 38, 6);
  _c(ctx, rgb(220, 180, 40), 36, 38, 3);
  _p(ctx, rgb(200, 155, 100), [[44, 30], [52, 26], [54, 34], [50, 38], [44, 36]]);
}

function _drawSpyIcon4(ctx) { // Follow at night
  _c(ctx, C_GOLD, 42, 10, 8);
  _c(ctx, rgb(18, 12, 10), 46, 8, 7);
  _l(ctx, C_BORDER, 0, 46, 52, 46, 1);
  _c(ctx, rgb(60, 50, 40), 12, 28, 5);
  _p(ctx, rgb(60, 50, 40), [[8, 34], [12, 34], [16, 34], [16, 46], [8, 46]]);
  _l(ctx, rgb(60, 50, 40), 8, 34, 6, 42, 2);
  _l(ctx, rgb(60, 50, 40), 16, 34, 18, 42, 2);
  _c(ctx, rgb(100, 85, 70), 36, 26, 5);
  _p(ctx, rgb(100, 85, 70), [[32, 32], [36, 32], [40, 32], [40, 46], [32, 46]]);
  [[20, 48], [24, 46], [28, 48], [32, 46]].forEach(([fx, fy]) => _c(ctx, C_GOLD, fx, fy, 2));
}

function _drawSpyIcon5(ctx) { // Break into the office
  _rOutline(ctx, C_BORDER, 10, 6, 32, 46, 2);
  _r(ctx, rgb(55, 38, 25), 12, 8, 22, 44, 0);
  _rOutline(ctx, C_BORDER, 12, 8, 22, 44, 1);
  _c(ctx, C_GOLD, 32, 30, 4);
  _c(ctx, C_BORDER, 32, 30, 4, 1);
  _l(ctx, rgb(80, 55, 30), 34, 8, 36, 30, 2);
  _p(ctx, C_GREY, [[36, 4], [40, 4], [40, 8], [37, 9]]);
  _l(ctx, C_GREY, 38, 8, 44, 44, 3);
  _l(ctx, rgb(160, 150, 140), 38, 8, 44, 44, 1);
}

const _SPY_ICON_FNS = [_drawSpyIcon0, _drawSpyIcon1, _drawSpyIcon2, _drawSpyIcon3, _drawSpyIcon4, _drawSpyIcon5];
const _SPY_ICON_CACHE = {};

// Rasterised at the device pixel ratio; blit with an explicit 52×52 size.
const SPY_ICON_SIZE = 52;
const SPY_ICON_DPR = Math.min(3, Math.max(1, (typeof window !== "undefined" && window.devicePixelRatio) || 1));

function getSpyIcon(idx) {
  if (!_SPY_ICON_CACHE[idx]) {
    const off = document.createElement("canvas");
    off.width = Math.round(SPY_ICON_SIZE * SPY_ICON_DPR);
    off.height = Math.round(SPY_ICON_SIZE * SPY_ICON_DPR);
    const octx = off.getContext("2d");
    octx.scale(SPY_ICON_DPR, SPY_ICON_DPR);
    _SPY_ICON_FNS[idx](octx);
    _SPY_ICON_CACHE[idx] = off;
  }
  return _SPY_ICON_CACHE[idx];
}
