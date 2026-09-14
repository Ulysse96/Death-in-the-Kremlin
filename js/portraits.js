// ── Canvas drawing primitives ─────────────────────────────────────────────
// _e/_c/_r/_p/_l keep the original pygame-style signatures (spyicons.js uses
// them); the helpers below add the shading vocabulary the portraits need.

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
  ctx.strokeStyle = c; ctx.lineWidth = Math.max(0.6, w);
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.lineCap = "butt";
}

// Gradients: light falls from the upper left, consistently for every portrait.
function _lin(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
function _rad(ctx, x0, y0, r0, x1, y1, r1, stops) {
  const g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
// Ellipse with optional rotation, fill and outline.
function _ell(ctx, cx, cy, rx, ry, fill, opts = {}) {
  const { rot = 0, stroke, lw = 1 } = opts;
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(0.05, Math.abs(rx)), Math.max(0.05, Math.abs(ry)), rot, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(0.4, lw); ctx.stroke(); }
}
function _poly(ctx, pts, fill, opts = {}) {
  const { stroke, lw = 1, open = false } = opts;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (!open) ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(0.4, lw); ctx.stroke(); }
}
function _rr(ctx, x, y, w, h, rad, fill, opts = {}) {
  const { stroke, lw = 1 } = opts;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, rad); else ctx.rect(x, y, w, h);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(0.4, lw); ctx.stroke(); }
}
// Five-pointed star, point up.
function _star5(ctx, cx, cy, r, fill, opts = {}) {
  const pts = [];
  for (let k = 0; k < 5; k++) {
    const a = (-90 + 72 * k) * Math.PI / 180;
    const b = (-90 + 72 * k + 36) * Math.PI / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    pts.push([cx + r * 0.42 * Math.cos(b), cy + r * 0.42 * Math.sin(b)]);
  }
  _poly(ctx, pts, fill, opts);
}

const _INK = "rgba(24,16,12,0.55)";   // soft outline shared by every portrait
const _SHADE = "rgba(30,18,12,0.22)"; // ambient occlusion

// Eye: sclera, iris, pupil, catchlight. `look` shifts the gaze sideways.
function _eye(ctx, x, y, r, iris, opts = {}) {
  const { look = 0, squint = 0 } = opts;
  const ry = r * (1 - squint);
  _ell(ctx, x, y, r, ry, "#f7f4ec", { stroke: _INK, lw: r * 0.16 });
  const gx = x + look * r * 0.3;
  _ell(ctx, gx, y, r * 0.55, Math.min(ry * 0.92, r * 0.55), iris);
  _ell(ctx, gx, y, r * 0.26, Math.min(ry * 0.6, r * 0.26), "#130e0b");
  _ell(ctx, gx - r * 0.2, y - ry * 0.3, r * 0.15, r * 0.15, "rgba(255,255,255,0.92)");
}

// Shoulders + chest of a uniform/coat. Every character shares this silhouette
// so the cast reads as one set.
function _bust(ctx, cx, cy, S, o) {
  const top = cy + 2 * S, bot = cy + 50 * S;
  ctx.beginPath();
  ctx.moveTo(cx - 8 * S, top);
  ctx.quadraticCurveTo(cx - 21 * S, top + 5 * S, cx - 22 * S, top + 18 * S);
  ctx.lineTo(cx - 24 * S, bot);
  ctx.lineTo(cx + 24 * S, bot);
  ctx.lineTo(cx + 22 * S, top + 18 * S);
  ctx.quadraticCurveTo(cx + 21 * S, top + 5 * S, cx + 8 * S, top);
  ctx.closePath();
  ctx.fillStyle = _lin(ctx, cx - 24 * S, top, cx + 24 * S, bot,
    [[0, o.light], [0.42, o.mid], [1, o.dark]]);
  ctx.fill();
  ctx.strokeStyle = _INK; ctx.lineWidth = Math.max(0.5, 0.9 * S); ctx.stroke();
  // shadow cast by the head onto the chest
  ctx.save();
  ctx.clip();
  _ell(ctx, cx, cy + 3 * S, 16 * S, 8 * S, _SHADE);
  ctx.restore();
}

// Shirt wedge + tie showing between the lapels.
function _shirtTie(ctx, cx, cy, S, shirt, tie, tieDark) {
  _poly(ctx, [[cx - 6.5 * S, cy + 3 * S], [cx + 6.5 * S, cy + 3 * S],
              [cx + 5 * S, cy + 24 * S], [cx - 5 * S, cy + 24 * S]],
    _lin(ctx, cx - 6 * S, cy, cx + 6 * S, cy + 24 * S, [[0, "#ffffff"], [1, shirt]]),
    { stroke: _INK, lw: 0.6 * S });
  // knot + blade
  _poly(ctx, [[cx - 3 * S, cy + 5 * S], [cx + 3 * S, cy + 5 * S], [cx + 2.4 * S, cy + 9 * S], [cx - 2.4 * S, cy + 9 * S]], tie);
  _poly(ctx, [[cx - 2.6 * S, cy + 9 * S], [cx + 2.6 * S, cy + 9 * S], [cx + 1.6 * S, cy + 23 * S],
              [cx, cy + 26 * S], [cx - 1.6 * S, cy + 23 * S]],
    _lin(ctx, cx - 2.6 * S, cy + 9 * S, cx + 2.6 * S, cy + 26 * S, [[0, tie], [1, tieDark]]),
    { stroke: _INK, lw: 0.5 * S });
}

// Two lapels folded over the chest.
function _lapels(ctx, cx, cy, S, fill, edge) {
  _poly(ctx, [[cx - 8 * S, cy + 2 * S], [cx - 2 * S, cy + 4 * S], [cx - 7 * S, cy + 22 * S], [cx - 17 * S, cy + 8 * S]],
    fill, { stroke: edge, lw: 0.7 * S });
  _poly(ctx, [[cx + 8 * S, cy + 2 * S], [cx + 2 * S, cy + 4 * S], [cx + 7 * S, cy + 22 * S], [cx + 17 * S, cy + 8 * S]],
    fill, { stroke: edge, lw: 0.7 * S });
}

// Neck showing under the chin.
function _neck(ctx, cx, cy, S, fur, furDark) {
  _rr(ctx, cx - 7 * S, cy - 6 * S, 14 * S, 12 * S, 4 * S,
    _lin(ctx, cx - 7 * S, cy, cx + 7 * S, cy, [[0, furDark], [0.5, fur], [1, furDark]]));
}

// A row of campaign ribbons.
function _ribbons(ctx, x, y, S, cols) {
  cols.forEach((col, i) => {
    const bx = x + i * 5.2 * S;
    _rr(ctx, bx, y, 4.4 * S, 5.5 * S, 0.6 * S,
      _lin(ctx, bx, y, bx + 4.4 * S, y + 5.5 * S, [[0, col[0]], [1, col[1]]]),
      { stroke: _INK, lw: 0.4 * S });
  });
}

// ── Marshal — a hound in a peaked cap ─────────────────────────────────────
function _marshal(ctx, cx, cy, sz) {
  const S = sz / 50;
  const fur = "#c89a68", furL = "#e3bd90", furD = "#8e6740";
  const gold = "#e0bb4a", goldD = "#9d7c1c";
  const olive = "#6f6d3e", oliveL = "#8d8a55", oliveD = "#44421f";

  _bust(ctx, cx, cy, S, { light: oliveL, mid: olive, dark: oliveD });
  // stand collar with gold piping
  _poly(ctx, [[cx - 14 * S, cy + 2 * S], [cx + 14 * S, cy + 2 * S], [cx + 11 * S, cy + 12 * S], [cx - 11 * S, cy + 12 * S]],
    _lin(ctx, cx, cy + 2 * S, cx, cy + 12 * S, [[0, oliveL], [1, olive]]), { stroke: goldD, lw: 0.7 * S });
  _rr(ctx, cx - 10 * S, cy + 4.5 * S, 4 * S, 3.4 * S, 0.8 * S, gold, { stroke: goldD, lw: 0.35 * S });
  _rr(ctx, cx + 6 * S, cy + 4.5 * S, 4 * S, 3.4 * S, 0.8 * S, gold, { stroke: goldD, lw: 0.35 * S });
  // tunic placket + buttons
  _l(ctx, oliveD, cx + 2 * S, cy + 13 * S, cx + 2 * S, cy + 50 * S, 0.9 * S);
  for (let i = 0; i < 3; i++) _c(ctx, gold, cx + 2 * S, cy + 22 * S + i * 10 * S, 1.7 * S);
  // shoulder boards, seated on the shoulder slope
  [-1, 1].forEach(s => {
    const bx = s < 0 ? cx - 18.5 * S : cx + 7.5 * S;
    _rr(ctx, bx, cy + 11 * S, 11 * S, 5 * S, 1.6 * S,
      _lin(ctx, bx, cy + 11 * S, bx + 11 * S, cy + 16 * S, [[0, "#f0d478"], [1, goldD]]), { stroke: _INK, lw: 0.5 * S });
    _l(ctx, "#a81e1e", bx + 1.5 * S, cy + 13.5 * S, bx + 9.5 * S, cy + 13.5 * S, 1 * S);
    _star5(ctx, bx + 5.5 * S, cy + 13.5 * S, 1.8 * S, "#fff4cf");
  });
  // ribbons + order of the red star
  _ribbons(ctx, cx - 19 * S, cy + 21 * S, S, [["#d43c3c", "#8e1414"], ["#e6c34e", "#a07c14"], ["#4f77c4", "#243f7d"]]);
  _c(ctx, goldD, cx - 13 * S, cy + 34 * S, 4.4 * S);
  _star5(ctx, cx - 13 * S, cy + 34 * S, 4 * S, _lin(ctx, cx - 17 * S, cy + 30 * S, cx - 9 * S, cy + 38 * S, [[0, "#ef4a4a"], [1, "#9c1414"]]), { stroke: gold, lw: 0.6 * S });

  _neck(ctx, cx, cy, S, fur, furD);

  // droopy ears behind the head
  [-1, 1].forEach(s => {
    _ell(ctx, cx + s * 18 * S, cy - 9 * S, 6.5 * S, 12 * S,
      _lin(ctx, cx + s * 24 * S, cy - 20 * S, cx + s * 14 * S, cy + 4 * S, [[0, furD], [1, "#6d4e2f"]]),
      { rot: s * 0.18, stroke: _INK, lw: 0.7 * S });
  });

  // head
  _ell(ctx, cx, cy - 14 * S, 17.5 * S, 16 * S,
    _rad(ctx, cx - 7 * S, cy - 22 * S, 2 * S, cx, cy - 14 * S, 22 * S, [[0, furL], [0.55, fur], [1, furD]]),
    { stroke: _INK, lw: 0.9 * S });
  // muzzle
  _ell(ctx, cx, cy - 5 * S, 10.5 * S, 8 * S,
    _rad(ctx, cx - 3 * S, cy - 9 * S, 1 * S, cx, cy - 5 * S, 12 * S, [[0, "#f2d8b4"], [1, "#cfa97a"]]),
    { stroke: _INK, lw: 0.6 * S });
  _ell(ctx, cx, cy - 9.5 * S, 4.2 * S, 3.2 * S, "#2a1d16");            // nose
  _ell(ctx, cx - 1.4 * S, cy - 10.6 * S, 1.3 * S, 0.9 * S, "rgba(255,255,255,0.45)");
  _l(ctx, "#5c422c", cx, cy - 6.5 * S, cx, cy - 3.5 * S, 0.9 * S);      // philtrum
  ctx.beginPath();                                                      // mouth
  ctx.moveTo(cx - 5 * S, cy - 3 * S); ctx.quadraticCurveTo(cx, cy - 0.5 * S, cx + 5 * S, cy - 3 * S);
  ctx.strokeStyle = "#5c422c"; ctx.lineWidth = 0.9 * S; ctx.stroke();

  _eye(ctx, cx - 7 * S, cy - 18 * S, 4 * S, "#5a3a1c", { squint: 0.12 });
  _eye(ctx, cx + 7 * S, cy - 18 * S, 4 * S, "#5a3a1c", { squint: 0.12 });
  // heavy brows
  _poly(ctx, [[cx - 12 * S, cy - 24 * S], [cx - 2.5 * S, cy - 22.5 * S], [cx - 3 * S, cy - 20.5 * S], [cx - 12 * S, cy - 21.5 * S]], furD);
  _poly(ctx, [[cx + 12 * S, cy - 24 * S], [cx + 2.5 * S, cy - 22.5 * S], [cx + 3 * S, cy - 20.5 * S], [cx + 12 * S, cy - 21.5 * S]], furD);

  // peaked cap: visor, band, crown, cockade
  _poly(ctx, [[cx - 25 * S, cy - 25 * S], [cx + 25 * S, cy - 25 * S], [cx + 21 * S, cy - 20 * S], [cx - 21 * S, cy - 20 * S]],
    _lin(ctx, cx, cy - 25 * S, cx, cy - 20 * S, [[0, "#2c2418"], [1, "#0f0c08"]]), { stroke: _INK, lw: 0.6 * S });
  _rr(ctx, cx - 21 * S, cy - 31 * S, 42 * S, 7 * S, 1.6 * S,
    _lin(ctx, cx, cy - 31 * S, cx, cy - 24 * S, [[0, "#a32222"], [1, "#661010"]]), { stroke: _INK, lw: 0.6 * S });
  _ell(ctx, cx, cy - 34 * S, 24 * S, 9.5 * S,
    _lin(ctx, cx - 20 * S, cy - 42 * S, cx + 18 * S, cy - 28 * S, [[0, oliveL], [0.6, olive], [1, oliveD]]),
    { stroke: _INK, lw: 0.8 * S });
  _ell(ctx, cx - 7 * S, cy - 38 * S, 10 * S, 3 * S, "rgba(255,255,255,0.13)");
  _l(ctx, goldD, cx - 20 * S, cy - 23 * S, cx + 20 * S, cy - 23 * S, 1.1 * S);   // chin cord
  _c(ctx, gold, cx, cy - 27.5 * S, 4.2 * S);
  _star5(ctx, cx, cy - 27.5 * S, 3.4 * S, "#d22a2a", { stroke: goldD, lw: 0.4 * S });
}

// ── KGB Director — a grey wolf in a trench coat and fedora ────────────────
function _kgb(ctx, cx, cy, sz) {
  const S = sz / 50;
  const fur = "#8b8f98", furL = "#b3b7bf", furD = "#5c5f68";
  const coat = "#4a4e57", coatL = "#666b75", coatD = "#2b2e35";
  const hat = "#33363d", hatL = "#4c505a", hatD = "#1b1d22";

  _bust(ctx, cx, cy, S, { light: coatL, mid: coat, dark: coatD });
  _shirtTie(ctx, cx, cy, S, "#dfe2e6", "#b02020", "#6d0f0f");
  _lapels(ctx, cx, cy, S, _lin(ctx, cx - 17 * S, cy, cx + 17 * S, cy + 22 * S, [[0, coatL], [1, coatD]]), _INK);
  // party pin
  _c(ctx, "#8e1414", cx - 11 * S, cy + 14 * S, 2.2 * S);
  _c(ctx, "#e6c34e", cx - 11 * S, cy + 14 * S, 0.9 * S);

  _neck(ctx, cx, cy, S, fur, furD);

  // ears, tall enough to clear the hat brim
  [-1, 1].forEach(s => {
    _poly(ctx, [[cx + s * 10 * S, cy - 24 * S], [cx + s * 21 * S, cy - 41 * S], [cx + s * 18 * S, cy - 19 * S]],
      _lin(ctx, cx + s * 10 * S, cy - 41 * S, cx + s * 21 * S, cy - 19 * S, [[0, fur], [1, furD]]),
      { stroke: _INK, lw: 0.7 * S });
    _poly(ctx, [[cx + s * 12.5 * S, cy - 24 * S], [cx + s * 18.5 * S, cy - 36 * S], [cx + s * 16 * S, cy - 22 * S]], "#6d5560");
  });

  // head: longer, narrower muzzle than the marshal's
  _ell(ctx, cx, cy - 14 * S, 16.5 * S, 15.5 * S,
    _rad(ctx, cx - 6 * S, cy - 22 * S, 2 * S, cx, cy - 14 * S, 21 * S, [[0, furL], [0.55, fur], [1, furD]]),
    { stroke: _INK, lw: 0.9 * S });
  // soft cheek shading rather than hard ruffs
  [-1, 1].forEach(s => _ell(ctx, cx + s * 12 * S, cy - 10 * S, 6 * S, 8 * S, "rgba(64,67,74,0.30)", { rot: s * 0.4 }));
  _ell(ctx, cx, cy - 5.5 * S, 10 * S, 6.2 * S,
    _rad(ctx, cx - 2 * S, cy - 8 * S, 1 * S, cx, cy - 5.5 * S, 10 * S, [[0, "#dfe2e7"], [1, "#a3a8b1"]]),
    { stroke: _INK, lw: 0.6 * S });
  _ell(ctx, cx, cy - 9 * S, 3 * S, 2.2 * S, "#25272c");
  _ell(ctx, cx - 1 * S, cy - 9.8 * S, 1 * S, 0.7 * S, "rgba(255,255,255,0.4)");
  _l(ctx, "#4a4d54", cx, cy - 6.8 * S, cx, cy - 4.5 * S, 0.8 * S);
  ctx.beginPath();
  ctx.moveTo(cx - 5 * S, cy - 2.6 * S); ctx.quadraticCurveTo(cx, cy - 4.4 * S, cx + 5 * S, cy - 2.6 * S);
  ctx.strokeStyle = "#4a4d54"; ctx.lineWidth = 0.9 * S; ctx.stroke();   // flat, humourless mouth

  // narrow, suspicious eyes
  _eye(ctx, cx - 7 * S, cy - 18 * S, 3.8 * S, "#b8a63c", { squint: 0.34 });
  _eye(ctx, cx + 7 * S, cy - 18 * S, 3.8 * S, "#b8a63c", { squint: 0.34 });
  _l(ctx, furD, cx - 11.5 * S, cy - 22.5 * S, cx - 3 * S, cy - 21 * S, 1.3 * S);
  _l(ctx, furD, cx + 11.5 * S, cy - 22.5 * S, cx + 3 * S, cy - 21 * S, 1.3 * S);

  // fedora
  _ell(ctx, cx, cy - 26 * S, 25 * S, 6.5 * S,
    _lin(ctx, cx - 25 * S, cy - 30 * S, cx + 25 * S, cy - 22 * S, [[0, hatL], [0.5, hat], [1, hatD]]),
    { stroke: _INK, lw: 0.8 * S });
  ctx.beginPath();                                                        // crown with a pinch
  ctx.moveTo(cx - 15 * S, cy - 27 * S);
  ctx.quadraticCurveTo(cx - 16 * S, cy - 41 * S, cx - 4 * S, cy - 41.5 * S);
  ctx.quadraticCurveTo(cx, cy - 38 * S, cx + 4 * S, cy - 41.5 * S);
  ctx.quadraticCurveTo(cx + 16 * S, cy - 41 * S, cx + 15 * S, cy - 27 * S);
  ctx.closePath();
  ctx.fillStyle = _lin(ctx, cx - 15 * S, cy - 42 * S, cx + 15 * S, cy - 26 * S, [[0, hatL], [0.55, hat], [1, hatD]]);
  ctx.fill(); ctx.strokeStyle = _INK; ctx.lineWidth = 0.8 * S; ctx.stroke();
  _rr(ctx, cx - 15.5 * S, cy - 31 * S, 31 * S, 4.5 * S, 0.8 * S, "#14161a");   // hat band
  _ell(ctx, cx - 7 * S, cy - 37 * S, 6 * S, 2 * S, "rgba(255,255,255,0.10)");
}

// ── Youth President — an eager fox in pioneer uniform ─────────────────────
function _youth(ctx, cx, cy, sz) {
  const S = sz / 50;
  const fur = "#e08a3c", furL = "#f6b268", furD = "#a9591c";
  const shirt = "#3f7a46", shirtL = "#589b5c", shirtD = "#23522c";

  _bust(ctx, cx, cy, S, { light: shirtL, mid: shirt, dark: shirtD });
  // shirt placket + buttons
  _l(ctx, shirtD, cx, cy + 12 * S, cx, cy + 50 * S, 1 * S);
  for (let i = 0; i < 3; i++) _c(ctx, "#d9d6c8", cx, cy + 22 * S + i * 9 * S, 1.3 * S);
  // pocket flaps with buttons
  [-1, 1].forEach(s => {
    const px = s < 0 ? cx - 18 * S : cx + 7 * S;
    _rr(ctx, px, cy + 27 * S, 11 * S, 4 * S, 1 * S, shirtD, { stroke: "rgba(20,40,22,0.6)", lw: 0.4 * S });
    _c(ctx, "#d9d6c8", px + 5.5 * S, cy + 32 * S, 1.1 * S);
  });
  // open collar showing a white shirt, then the pioneer neckerchief over it
  _poly(ctx, [[cx - 9 * S, cy + 2 * S], [cx + 9 * S, cy + 2 * S], [cx + 5 * S, cy + 16 * S], [cx - 5 * S, cy + 16 * S]],
    _lin(ctx, cx, cy + 2 * S, cx, cy + 16 * S, [[0, "#ffffff"], [1, "#ddd8c6"]]), { stroke: _INK, lw: 0.5 * S });
  _poly(ctx, [[cx - 11 * S, cy + 2 * S], [cx - 3 * S, cy + 3 * S], [cx - 6 * S, cy + 11 * S], [cx - 13 * S, cy + 6 * S]],
    _lin(ctx, cx - 13 * S, cy + 2 * S, cx - 3 * S, cy + 11 * S, [[0, "#e65252"], [1, "#a81e1e"]]), { stroke: _INK, lw: 0.5 * S });
  _poly(ctx, [[cx + 11 * S, cy + 2 * S], [cx + 3 * S, cy + 3 * S], [cx + 6 * S, cy + 11 * S], [cx + 13 * S, cy + 6 * S]],
    _lin(ctx, cx + 13 * S, cy + 2 * S, cx + 3 * S, cy + 11 * S, [[0, "#e65252"], [1, "#a81e1e"]]), { stroke: _INK, lw: 0.5 * S });
  _poly(ctx, [[cx - 4 * S, cy + 9 * S], [cx + 4 * S, cy + 9 * S], [cx + 1.6 * S, cy + 26 * S], [cx - 1.6 * S, cy + 26 * S]],
    _lin(ctx, cx - 4 * S, cy + 9 * S, cx + 4 * S, cy + 26 * S, [[0, "#e65252"], [1, "#8e1414"]]), { stroke: _INK, lw: 0.5 * S });
  _rr(ctx, cx - 3 * S, cy + 6.5 * S, 6 * S, 4 * S, 1.2 * S, "#e6c34e", { stroke: "#9d7c1c", lw: 0.4 * S });

  _neck(ctx, cx, cy, S, fur, furD);

  // big pointed ears
  [-1, 1].forEach(s => {
    _poly(ctx, [[cx + s * 6 * S, cy - 26 * S], [cx + s * 15 * S, cy - 44 * S], [cx + s * 17 * S, cy - 22 * S]],
      _lin(ctx, cx + s * 6 * S, cy - 44 * S, cx + s * 17 * S, cy - 22 * S, [[0, furL], [1, furD]]),
      { stroke: _INK, lw: 0.8 * S });
    _poly(ctx, [[cx + s * 9 * S, cy - 25 * S], [cx + s * 14 * S, cy - 38 * S], [cx + s * 14.5 * S, cy - 24 * S]], "#f0a9a0");
  });

  // head + white cheek/muzzle mask
  _ell(ctx, cx, cy - 14 * S, 16 * S, 15 * S,
    _rad(ctx, cx - 6 * S, cy - 21 * S, 2 * S, cx, cy - 14 * S, 20 * S, [[0, furL], [0.55, fur], [1, furD]]),
    { stroke: _INK, lw: 0.9 * S });
  _ell(ctx, cx, cy - 6 * S, 11 * S, 8 * S,
    _rad(ctx, cx - 3 * S, cy - 9 * S, 1 * S, cx, cy - 6 * S, 12 * S, [[0, "#fffdf6"], [1, "#ddd4c4"]]),
    { stroke: _INK, lw: 0.55 * S });
  _ell(ctx, cx, cy - 10 * S, 3 * S, 2.3 * S, "#3a2118");
  _ell(ctx, cx - 1 * S, cy - 10.8 * S, 1 * S, 0.7 * S, "rgba(255,255,255,0.5)");
  ctx.beginPath();                                                       // wide grin
  ctx.moveTo(cx - 5 * S, cy - 5 * S);
  ctx.quadraticCurveTo(cx, cy - 0.5 * S, cx + 5 * S, cy - 5 * S);
  ctx.strokeStyle = "#5b3418"; ctx.lineWidth = 0.9 * S; ctx.stroke();
  // whiskers
  [-1, 1].forEach(s => {
    _l(ctx, "rgba(255,255,255,0.65)", cx + s * 9 * S, cy - 7 * S, cx + s * 20 * S, cy - 9.5 * S, 0.6 * S);
    _l(ctx, "rgba(255,255,255,0.65)", cx + s * 9 * S, cy - 5 * S, cx + s * 20 * S, cy - 4.5 * S, 0.6 * S);
  });

  _eye(ctx, cx - 7 * S, cy - 18 * S, 4.2 * S, "#3f8f4a");
  _eye(ctx, cx + 7 * S, cy - 18 * S, 4.2 * S, "#3f8f4a");

  // pilotka side cap, tilted, seated on the skull
  ctx.save();
  ctx.translate(cx, cy - 25 * S);
  ctx.rotate(-0.1);
  _poly(ctx, [[-21 * S, 2 * S], [-15 * S, -9 * S], [15 * S, -9 * S], [21 * S, 2 * S], [0, 6 * S]],
    _lin(ctx, -21 * S, -9 * S, 21 * S, 6 * S, [[0, shirtL], [0.55, shirt], [1, shirtD]]),
    { stroke: _INK, lw: 0.8 * S });
  _poly(ctx, [[-21 * S, 2 * S], [21 * S, 2 * S], [0, 6 * S]], "rgba(255,255,255,0.10)");
  _star5(ctx, -6 * S, -2 * S, 4 * S, _lin(ctx, -10 * S, -6 * S, -2 * S, 2 * S, [[0, "#ef4a4a"], [1, "#9c1414"]]),
    { stroke: "#f2dc9a", lw: 0.5 * S });
  ctx.restore();
}

// ── Head Marxologist — a bespectacled ape with a beard ────────────────────
function _marxologist(ctx, cx, cy, sz) {
  const S = sz / 50;
  const fur = "#7d5a3a", furL = "#a07c54", furD = "#4f3721";
  const skin = "#d8ac82", skinL = "#f0cda6";
  const suit = "#26315c", suitL = "#3c4a80", suitD = "#131A36";
  const gold = "#e0bb4a";

  _bust(ctx, cx, cy, S, { light: suitL, mid: suit, dark: suitD });
  _shirtTie(ctx, cx, cy, S, "#eceadf", "#c02a2a", "#7a1010");
  _lapels(ctx, cx, cy, S, _lin(ctx, cx - 17 * S, cy, cx + 17 * S, cy + 22 * S, [[0, suitL], [1, suitD]]), _INK);
  // party pin on the lapel
  _c(ctx, "#8e1414", cx + 11 * S, cy + 14 * S, 2.2 * S);
  _c(ctx, gold, cx + 11 * S, cy + 14 * S, 0.9 * S);

  _neck(ctx, cx, cy, S, skin, "#a87c52");

  // ears
  [-1, 1].forEach(s => {
    _ell(ctx, cx + s * 18 * S, cy - 13 * S, 5 * S, 6 * S, furD, { stroke: _INK, lw: 0.7 * S });
    _ell(ctx, cx + s * 18 * S, cy - 13 * S, 2.6 * S, 3.4 * S, "#c08e7e");
  });

  // head + hair cap
  _ell(ctx, cx, cy - 14 * S, 17 * S, 16 * S,
    _rad(ctx, cx - 6 * S, cy - 22 * S, 2 * S, cx, cy - 14 * S, 21 * S, [[0, furL], [0.55, fur], [1, furD]]),
    { stroke: _INK, lw: 0.9 * S });
  // receding scholar's hairline
  ctx.beginPath();
  ctx.moveTo(cx - 17 * S, cy - 16 * S);
  ctx.quadraticCurveTo(cx - 15 * S, cy - 31 * S, cx, cy - 30 * S);
  ctx.quadraticCurveTo(cx + 15 * S, cy - 31 * S, cx + 17 * S, cy - 16 * S);
  ctx.quadraticCurveTo(cx + 12 * S, cy - 24 * S, cx, cy - 23.5 * S);
  ctx.quadraticCurveTo(cx - 12 * S, cy - 24 * S, cx - 17 * S, cy - 16 * S);
  ctx.closePath();
  ctx.fillStyle = _lin(ctx, cx - 17 * S, cy - 31 * S, cx + 17 * S, cy - 16 * S, [[0, "#6b4a2c"], [1, "#35240f"]]);
  ctx.fill();
  // brow ridge + face
  _ell(ctx, cx, cy - 7 * S, 12 * S, 9.5 * S,
    _rad(ctx, cx - 4 * S, cy - 11 * S, 1 * S, cx, cy - 7 * S, 13 * S, [[0, skinL], [1, skin]]),
    { stroke: _INK, lw: 0.6 * S });
  _ell(ctx, cx, cy - 10 * S, 3.4 * S, 2.6 * S, "#8a5a44");
  _ell(ctx, cx - 1.2 * S, cy - 10.8 * S, 1 * S, 0.7 * S, "rgba(255,255,255,0.35)");
  // neat chin beard, leaving the mouth visible
  ctx.beginPath();
  ctx.moveTo(cx - 8 * S, cy - 2 * S);
  ctx.quadraticCurveTo(cx - 7.5 * S, cy + 7 * S, cx, cy + 8.5 * S);
  ctx.quadraticCurveTo(cx + 7.5 * S, cy + 7 * S, cx + 8 * S, cy - 2 * S);
  ctx.quadraticCurveTo(cx, cy + 2.5 * S, cx - 8 * S, cy - 2 * S);
  ctx.closePath();
  ctx.fillStyle = _lin(ctx, cx, cy - 2 * S, cx, cy + 9 * S, [[0, "#6b4a2c"], [1, "#3b2812"]]);
  ctx.fill(); ctx.strokeStyle = _INK; ctx.lineWidth = 0.6 * S; ctx.stroke();
  // trim moustache, then a smiling mouth under it
  _poly(ctx, [[cx - 5.4 * S, cy - 6.6 * S], [cx + 5.4 * S, cy - 6.6 * S], [cx + 4.2 * S, cy - 4.6 * S],
              [cx, cy - 5.4 * S], [cx - 4.2 * S, cy - 4.6 * S]],
    _lin(ctx, cx, cy - 7 * S, cx, cy - 4.4 * S, [[0, "#9a7346"], [1, "#6b4a28"]]), { stroke: "rgba(24,16,12,0.35)", lw: 0.35 * S });
  ctx.beginPath();
  ctx.moveTo(cx - 3.6 * S, cy - 3.4 * S);
  ctx.quadraticCurveTo(cx, cy - 1 * S, cx + 3.6 * S, cy - 3.4 * S);
  ctx.strokeStyle = "#7a5430"; ctx.lineWidth = 0.9 * S; ctx.stroke();

  _eye(ctx, cx - 7.5 * S, cy - 17 * S, 4 * S, "#4d6b3a");
  _eye(ctx, cx + 7.5 * S, cy - 17 * S, 4 * S, "#4d6b3a");
  // round gold spectacles
  _c(ctx, gold, cx - 7.5 * S, cy - 17 * S, 6.4 * S, 1.2 * S);
  _c(ctx, gold, cx + 7.5 * S, cy - 17 * S, 6.4 * S, 1.2 * S);
  _l(ctx, gold, cx - 1.2 * S, cy - 17 * S, cx + 1.2 * S, cy - 17 * S, 1.1 * S);
  _l(ctx, gold, cx - 13.8 * S, cy - 17.5 * S, cx - 17.5 * S, cy - 15 * S, 1 * S);
  _l(ctx, gold, cx + 13.8 * S, cy - 17.5 * S, cx + 17.5 * S, cy - 15 * S, 1 * S);
  _l(ctx, "rgba(255,255,255,0.35)", cx - 10 * S, cy - 20 * S, cx - 5.5 * S, cy - 18 * S, 1.4 * S);
  _l(ctx, "rgba(255,255,255,0.35)", cx + 5 * S, cy - 20 * S, cx + 9.5 * S, cy - 18 * S, 1.4 * S);
}

// ── Happiness Minister — a beaming rabbit in a red-starred ushanka ────────
function _happiness(ctx, cx, cy, sz) {
  const S = sz / 50;
  const fur = "#e4e1d8", furL = "#fbfaf5", furD = "#b3ada0";
  const hat = "#8d8579", hatL = "#b6afa3", hatD = "#5d564b";
  const coat = "#3a5a8c", coatL = "#527bb4", coatD = "#1f3557";

  _bust(ctx, cx, cy, S, { light: coatL, mid: coat, dark: coatD });
  _shirtTie(ctx, cx, cy, S, "#f2f0e6", "#d63a3a", "#8e1414");
  _lapels(ctx, cx, cy, S, _lin(ctx, cx - 17 * S, cy, cx + 17 * S, cy + 22 * S, [[0, coatL], [1, coatD]]), _INK);
  // a cheerful rosette instead of a war medal
  _poly(ctx, [[cx - 13 * S, cy + 17 * S], [cx - 9 * S, cy + 17 * S], [cx - 10 * S, cy + 23 * S], [cx - 12 * S, cy + 23 * S]], "#b02020");
  _c(ctx, "#e0bb4a", cx - 11 * S, cy + 15 * S, 3.2 * S);
  _star5(ctx, cx - 11 * S, cy + 15 * S, 2.7 * S, "#e04a4a", { stroke: "#9d7c1c", lw: 0.35 * S });

  _neck(ctx, cx, cy, S, fur, furD);

  // long ears rising out of the hat
  [-1, 1].forEach(s => {
    _ell(ctx, cx + s * 9 * S, cy - 38 * S, 4.8 * S, 11.5 * S,
      _lin(ctx, cx + s * 9 * S, cy - 49 * S, cx + s * 9 * S, cy - 27 * S, [[0, furL], [1, furD]]),
      { rot: s * 0.16, stroke: _INK, lw: 0.75 * S });
    _ell(ctx, cx + s * 9 * S, cy - 39 * S, 2.3 * S, 8 * S, "#efb9b6", { rot: s * 0.16 });
  });

  // head
  _ell(ctx, cx, cy - 13 * S, 16.5 * S, 15 * S,
    _rad(ctx, cx - 6 * S, cy - 20 * S, 2 * S, cx, cy - 13 * S, 20 * S, [[0, furL], [0.6, fur], [1, furD]]),
    { stroke: _INK, lw: 0.9 * S });
  // cheeks
  _ell(ctx, cx - 11 * S, cy - 7 * S, 5 * S, 4 * S, "rgba(232,140,140,0.5)");
  _ell(ctx, cx + 11 * S, cy - 7 * S, 5 * S, 4 * S, "rgba(232,140,140,0.5)");
  // muzzle: one soft two-lobed pad
  ctx.beginPath();
  ctx.moveTo(cx, cy - 9 * S);
  ctx.bezierCurveTo(cx - 3 * S, cy - 12 * S, cx - 11 * S, cy - 11 * S, cx - 11 * S, cy - 5 * S);
  ctx.bezierCurveTo(cx - 11 * S, cy - 0.5 * S, cx - 4.5 * S, cy + 1 * S, cx, cy - 1.5 * S);
  ctx.bezierCurveTo(cx + 4.5 * S, cy + 1 * S, cx + 11 * S, cy - 0.5 * S, cx + 11 * S, cy - 5 * S);
  ctx.bezierCurveTo(cx + 11 * S, cy - 11 * S, cx + 3 * S, cy - 12 * S, cx, cy - 9 * S);
  ctx.closePath();
  ctx.fillStyle = _rad(ctx, cx - 3 * S, cy - 9 * S, 1 * S, cx, cy - 5 * S, 13 * S, [[0, "#ffffff"], [1, furL]]);
  ctx.fill();
  ctx.strokeStyle = "rgba(24,16,12,0.28)"; ctx.lineWidth = 0.5 * S; ctx.stroke();
  _poly(ctx, [[cx - 2.6 * S, cy - 11 * S], [cx + 2.6 * S, cy - 11 * S], [cx, cy - 8.2 * S]], "#e08a92", { stroke: "#a85a62", lw: 0.4 * S });
  _l(ctx, "#8a7a6c", cx, cy - 8.2 * S, cx, cy - 6 * S, 0.8 * S);
  // beaming smile + buck teeth
  ctx.beginPath();
  ctx.moveTo(cx - 6.5 * S, cy - 6 * S);
  ctx.quadraticCurveTo(cx, cy + 1.5 * S, cx + 6.5 * S, cy - 6 * S);
  ctx.strokeStyle = "#7a6656"; ctx.lineWidth = 1 * S; ctx.stroke();
  _rr(ctx, cx - 3.2 * S, cy - 4.6 * S, 6.4 * S, 5.2 * S, 1.2 * S, "#fffdf4", { stroke: "#b9ad9a", lw: 0.45 * S });
  _l(ctx, "#b9ad9a", cx, cy - 4.4 * S, cx, cy + 0.2 * S, 0.5 * S);
  // happy, wide-open eyes
  _eye(ctx, cx - 7 * S, cy - 17 * S, 4.2 * S, "#3f6ea8");
  _eye(ctx, cx + 7 * S, cy - 17 * S, 4.2 * S, "#3f6ea8");
  // whiskers
  [-1, 1].forEach(s => {
    _l(ctx, "rgba(120,104,88,0.65)", cx + s * 10 * S, cy - 7 * S, cx + s * 17 * S, cy - 9.5 * S, 0.6 * S);
    _l(ctx, "rgba(120,104,88,0.65)", cx + s * 10 * S, cy - 5 * S, cx + s * 17 * S, cy - 5 * S, 0.6 * S);
  });

  // ushanka: ear flaps hanging beside the head, then the fur crown, then the star
  [-1, 1].forEach(s => {
    _rr(ctx, cx + (s < 0 ? -22.5 * S : 14.5 * S), cy - 26 * S, 8 * S, 23 * S, 3.6 * S,
      _lin(ctx, cx + s * 20 * S, cy - 26 * S, cx + s * 14 * S, cy - 3 * S, [[0, hatL], [1, hatD]]),
      { stroke: _INK, lw: 0.75 * S });
  });
  ctx.beginPath();                                                      // crown
  ctx.moveTo(cx - 21 * S, cy - 26 * S);
  ctx.quadraticCurveTo(cx - 22 * S, cy - 40 * S, cx, cy - 40 * S);
  ctx.quadraticCurveTo(cx + 22 * S, cy - 40 * S, cx + 21 * S, cy - 26 * S);
  ctx.closePath();
  ctx.fillStyle = _lin(ctx, cx - 21 * S, cy - 40 * S, cx + 21 * S, cy - 25 * S, [[0, hatL], [0.5, hat], [1, hatD]]);
  ctx.fill(); ctx.strokeStyle = _INK; ctx.lineWidth = 0.9 * S; ctx.stroke();
  // fur texture along the brim
  for (let i = -5; i <= 5; i++) {
    _ell(ctx, cx + i * 4 * S, cy - 26 * S, 2.6 * S, 2.2 * S,
      i % 2 ? "rgba(255,255,255,0.10)" : "rgba(40,32,24,0.10)");
  }
  _rr(ctx, cx - 21.5 * S, cy - 28.5 * S, 43 * S, 5 * S, 2 * S,
    _lin(ctx, cx, cy - 28.5 * S, cx, cy - 23.5 * S, [[0, hatL], [1, hatD]]), { stroke: _INK, lw: 0.6 * S });
  _ell(ctx, cx - 7 * S, cy - 36 * S, 7 * S, 2.4 * S, "rgba(255,255,255,0.14)");
  _c(ctx, "#e0bb4a", cx, cy - 32 * S, 5.4 * S);
  _star5(ctx, cx, cy - 32 * S, 4.6 * S,
    _lin(ctx, cx - 5 * S, cy - 37 * S, cx + 5 * S, cy - 27 * S, [[0, "#ef4a4a"], [1, "#a01616"]]),
    { stroke: "#f2dc9a", lw: 0.5 * S });
}

// ── Red Veteran — an old walrus in a papakha, chest full of medals ────────
function _veteran(ctx, cx, cy, sz) {
  const S = sz / 50;
  const fur = "#c9c2ae", furL = "#e4dfd0", furD = "#8f8878";
  const coat = "#6b503a", coatL = "#8a6a4d", coatD = "#3f2d1e";
  const hat = "#3b2f20", hatL = "#5a4830", hatD = "#221a11";
  const gold = "#e0bb4a", goldD = "#9d7c1c";

  _bust(ctx, cx, cy, S, { light: coatL, mid: coat, dark: coatD });
  // greatcoat lapels + buttons
  _lapels(ctx, cx, cy, S, _lin(ctx, cx - 17 * S, cy, cx + 17 * S, cy + 22 * S, [[0, coatL], [1, coatD]]), _INK);
  _poly(ctx, [[cx - 5 * S, cy + 3 * S], [cx + 5 * S, cy + 3 * S], [cx + 3.5 * S, cy + 12 * S], [cx - 3.5 * S, cy + 12 * S]], "#9c8a6e", { stroke: _INK, lw: 0.5 * S });
  _l(ctx, coatD, cx + 2 * S, cy + 14 * S, cx + 2 * S, cy + 50 * S, 0.9 * S);
  for (let i = 0; i < 3; i++) _c(ctx, gold, cx + 2 * S, cy + 22 * S + i * 10 * S, 1.7 * S);
  // medals: ribbon bar + the order of the red star
  _ribbons(ctx, cx - 19 * S, cy + 19 * S, S, [["#d43c3c", "#8e1414"], ["#e6c34e", "#a07c14"], ["#6aa06a", "#2f5c2f"]]);
  _c(ctx, goldD, cx - 14 * S, cy + 33 * S, 4.6 * S);
  _star5(ctx, cx - 14 * S, cy + 33 * S, 4.2 * S,
    _lin(ctx, cx - 18 * S, cy + 29 * S, cx - 10 * S, cy + 37 * S, [[0, "#ef4a4a"], [1, "#9c1414"]]), { stroke: gold, lw: 0.5 * S });

  _neck(ctx, cx, cy, S, fur, furD);

  // head
  _ell(ctx, cx, cy - 15 * S, 16.5 * S, 15 * S,
    _rad(ctx, cx - 6 * S, cy - 22 * S, 2 * S, cx, cy - 15 * S, 20 * S, [[0, furL], [0.55, fur], [1, furD]]),
    { stroke: _INK, lw: 0.9 * S });
  // heavy brow + wrinkles
  _poly(ctx, [[cx - 13 * S, cy - 23 * S], [cx - 3 * S, cy - 21 * S], [cx - 3.5 * S, cy - 18.5 * S], [cx - 13 * S, cy - 20 * S]], "#efece0");
  _poly(ctx, [[cx + 13 * S, cy - 23 * S], [cx + 3 * S, cy - 21 * S], [cx + 3.5 * S, cy - 18.5 * S], [cx + 13 * S, cy - 20 * S]], "#efece0");
  _l(ctx, "rgba(120,110,92,0.5)", cx - 12 * S, cy - 26 * S, cx - 4 * S, cy - 25.5 * S, 0.7 * S);
  _l(ctx, "rgba(120,110,92,0.5)", cx + 12 * S, cy - 26 * S, cx + 4 * S, cy - 25.5 * S, 0.7 * S);
  _eye(ctx, cx - 7 * S, cy - 17.5 * S, 3.6 * S, "#5b6b4a", { squint: 0.3 });
  _eye(ctx, cx + 7 * S, cy - 17.5 * S, 3.6 * S, "#5b6b4a", { squint: 0.3 });
  // bulbous nose
  _ell(ctx, cx, cy - 10 * S, 4.6 * S, 3.8 * S,
    _rad(ctx, cx - 1 * S, cy - 11.5 * S, 0.5 * S, cx, cy - 10 * S, 5 * S, [[0, "#e8b0a4"], [1, "#c08478"]]),
    { stroke: "rgba(24,16,12,0.35)", lw: 0.5 * S });
  // walrus moustache, kept on the face
  [-1, 1].forEach(s => {
    ctx.beginPath();
    ctx.moveTo(cx + s * 1 * S, cy - 6.5 * S);
    ctx.quadraticCurveTo(cx + s * 13 * S, cy - 6.5 * S, cx + s * 11.5 * S, cy + 2.5 * S);
    ctx.quadraticCurveTo(cx + s * 7 * S, cy - 1 * S, cx + s * 1 * S, cy - 2.5 * S);
    ctx.closePath();
    ctx.fillStyle = _lin(ctx, cx, cy - 7 * S, cx + s * 12 * S, cy + 3 * S, [[0, "#ffffff"], [1, "#c3bdac"]]);
    ctx.fill(); ctx.strokeStyle = _INK; ctx.lineWidth = 0.6 * S; ctx.stroke();
  });
  // tusks, hanging below the moustache
  _poly(ctx, [[cx - 5.4 * S, cy - 2 * S], [cx - 2.8 * S, cy - 2.5 * S], [cx - 3.4 * S, cy + 8 * S]],
    _lin(ctx, cx - 6 * S, cy - 2 * S, cx - 3 * S, cy + 8 * S, [[0, "#fffdf2"], [1, "#d8d0b8"]]),
    { stroke: "rgba(24,16,12,0.4)", lw: 0.5 * S });
  _poly(ctx, [[cx + 5.4 * S, cy - 2 * S], [cx + 2.8 * S, cy - 2.5 * S], [cx + 3.4 * S, cy + 8 * S]],
    _lin(ctx, cx + 6 * S, cy - 2 * S, cx + 3 * S, cy + 8 * S, [[0, "#fffdf2"], [1, "#d8d0b8"]]),
    { stroke: "rgba(24,16,12,0.4)", lw: 0.5 * S });

  // papakha (tall fur hat) with a red star
  ctx.beginPath();
  ctx.moveTo(cx - 19 * S, cy - 27 * S);
  ctx.quadraticCurveTo(cx - 21 * S, cy - 44 * S, cx, cy - 44 * S);
  ctx.quadraticCurveTo(cx + 21 * S, cy - 44 * S, cx + 19 * S, cy - 27 * S);
  ctx.closePath();
  ctx.fillStyle = _lin(ctx, cx - 19 * S, cy - 44 * S, cx + 19 * S, cy - 27 * S, [[0, hatL], [0.5, hat], [1, hatD]]);
  ctx.fill(); ctx.strokeStyle = _INK; ctx.lineWidth = 0.9 * S; ctx.stroke();
  for (let i = -4; i <= 4; i++) {
    _ell(ctx, cx + i * 4.5 * S, cy - 40 * S + Math.abs(i) * 1.2 * S, 2.8 * S, 2.2 * S,
      i % 2 ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.12)");
  }
  _rr(ctx, cx - 20 * S, cy - 29 * S, 40 * S, 5.5 * S, 2 * S,
    _lin(ctx, cx, cy - 29 * S, cx, cy - 23.5 * S, [[0, hatL], [1, hatD]]), { stroke: _INK, lw: 0.6 * S });
  _star5(ctx, cx, cy - 34 * S, 4.6 * S,
    _lin(ctx, cx - 5 * S, cy - 39 * S, cx + 5 * S, cy - 29 * S, [[0, "#ef4a4a"], [1, "#9c1414"]]),
    { stroke: "#f2dc9a", lw: 0.5 * S });
}

const _PORTRAITS = {
  "Marshal": _marshal, "KGB Director": _kgb, "Youth President": _youth,
  "Head Marxologist": _marxologist, "Happiness Minister": _happiness, "Red Veteran": _veteran,
};

// Portraits are cached per (character, size). They are rasterised at the
// device pixel ratio so they stay sharp on phone screens, then blitted back
// at their logical size.
const _PC = {};
const PORTRAIT_DPR = Math.min(3, Math.max(1, (typeof window !== "undefined" && window.devicePixelRatio) || 1));

function drawPortrait(ctx, char, cx, cy, size) {
  const key = char + "_" + size;
  if (!_PC[key]) {
    const s = size * 2;
    const off = document.createElement("canvas");
    off.width = Math.round(s * PORTRAIT_DPR);
    off.height = Math.round(s * PORTRAIT_DPR);
    const octx = off.getContext("2d");
    octx.scale(PORTRAIT_DPR, PORTRAIT_DPR);
    const fn = _PORTRAITS[char];
    if (fn) fn(octx, s / 2, s / 2, size);
    _PC[key] = off;
  }
  ctx.drawImage(_PC[key], cx - size, cy - size, size * 2, size * 2);
}
