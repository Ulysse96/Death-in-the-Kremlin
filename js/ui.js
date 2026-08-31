// ── UI helpers (mirrors the pygame UI class) ────────────────────────────────

const FONT_STACK = "Georgia, 'Times New Roman', 'DejaVu Serif', serif";

class UI {
  constructor(ctx) {
    this.ctx = ctx;
    this.fonts = {
      title: `bold 42px ${FONT_STACK}`,
      h2: `bold 28px ${FONT_STACK}`,
      h3: `bold 22px ${FONT_STACK}`,
      body: `18px ${FONT_STACK}`,
      small: `14px ${FONT_STACK}`,
      big: `bold 56px ${FONT_STACK}`,
    };
    this.buttons = [];
    this.pointer = { x: -1, y: -1 };
  }

  clear() {
    const ctx = this.ctx;
    ctx.fillStyle = C_DARK;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgb(22, 15, 11);
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 4) {
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke();
    }
    this.buttons = [];
  }

  panel(x, y, w, h, col = C_PANEL, border = C_BORDER, rad = 6) {
    const ctx = this.ctx;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, rad); else ctx.rect(x, y, w, h);
    ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = border; ctx.stroke();
  }

  txt(text, fkey, col, x, y, opts = {}) {
    const { cx = false, rx = false } = opts;
    const ctx = this.ctx;
    ctx.font = this.fonts[fkey];
    ctx.fillStyle = col;
    if (cx) { ctx.textAlign = "center"; ctx.textBaseline = "middle"; }
    else if (rx) { ctx.textAlign = "right"; ctx.textBaseline = "top"; }
    else { ctx.textAlign = "left"; ctx.textBaseline = "top"; }
    ctx.fillText(String(text), x, y);
  }

  _hover(x, y, w, h) {
    const { x: px, y: py } = this.pointer;
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

  btn(label, x, y, w = 200, h = 40, opts = {}) {
    const { col = C_CRIMSON, hov = C_DARK_RED, tcol = C_CREAM, dis = false, fkey = "body" } = opts;
    const ctx = this.ctx;
    const hovered = !dis && this._hover(x, y, w, h);
    const bg = dis ? C_MID : (hovered ? hov : col);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 5); else ctx.rect(x, y, w, h);
    ctx.fillStyle = bg; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = hovered ? C_GOLD : C_BORDER; ctx.stroke();
    const tc = dis ? C_GREY : tcol;
    this.txt(label, fkey, tc, x + w / 2, y + h / 2, { cx: true });
    this.buttons.push({ label, rect: { x, y, w, h }, disabled: dis });
    return { x, y, w, h };
  }

  header(title, sub = "") {
    const ctx = this.ctx;
    ctx.fillStyle = C_DARK_RED; ctx.fillRect(0, 0, W, 72);
    ctx.fillStyle = C_GOLD; ctx.fillRect(0, 70, W, 2);
    this.txt("★", "h2", C_GOLD, 28, 18);
    this.txt("★", "h2", C_GOLD, W - 28, 18, { rx: true });
    this.txt(title, "h2", C_CREAM, W / 2, 26, { cx: true });
    if (sub) this.txt(sub, "small", C_GOLD, W / 2, 52, { cx: true });
  }

  divider(y, col = C_BORDER) {
    const ctx = this.ctx;
    ctx.strokeStyle = col; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, y + 0.5); ctx.lineTo(W - 40, y + 0.5); ctx.stroke();
  }

  hit(px, py, label) {
    for (const b of this.buttons) {
      if (b.label === label && !b.disabled && this._hover2(px, py, b.rect)) return true;
    }
    return false;
  }
  _hover2(px, py, r) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }

  player_badge(p, x, y, w = 200, h = 80, show_secret = false) {
    const col = p.alive ? C_DARK_GRN : C_MID;
    const border = p.alive ? C_GOLD : C_BORDER;
    this.panel(x, y, w, h, col, border);
    const sz = Math.min(34, h / 2 - 2);
    drawPortrait(this.ctx, p.character, x + sz + 4, y + h / 2, sz);
    const tx = x + sz * 2 + 10;
    this.txt(p.character, "small", C_GOLD, tx, y + 8);
    this.txt((p.isBot ? "🤖 " : "") + p.name, "body", C_CREAM, tx, y + 26);
    if (show_secret && p.secret_level) {
      const sc = SECRET_COLORS[p.secret_level], sn = SECRET_NAMES[p.secret_level];
      this.txt(`Lv${p.secret_level}: ${sn}`, "small", sc, tx, y + 48);
    } else if (!p.alive) {
      this.txt("✖ PURGED", "small", C_CRIMSON, tx, y + 48);
    }
  }
}

// ── Carousel widget ─────────────────────────────────────────────────────────

class Carousel {
  static ARROW_W = 60;
  static CARD_H = 260;

  constructor(items, selected = null) {
    this.items = items;
    this._idx = 0;
    this.selected = selected;
    if (selected) {
      const i = items.indexOf(selected);
      if (i >= 0) this._idx = i;
    }
  }

  current() { return this.items.length ? this.items[this._idx] : null; }
  prev() { this._idx = (this._idx - 1 + this.items.length) % this.items.length; }
  next() { this._idx = (this._idx + 1) % this.items.length; }

  draw(ui, cx, cy, extraInfo = null) {
    if (!this.items.length) return {};
    const ctx = ui.ctx;
    const item = this.current();
    const card_w = 300, ah = 60, CARD_H = Carousel.CARD_H;
    const card_x = cx - card_w / 2, card_y = cy - CARD_H / 2;

    const sel = item === this.selected;
    const bg = sel ? C_DARK_GRN : C_PANEL;
    const bc = sel ? C_GOLD : C_BORDER;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(card_x, card_y, card_w, CARD_H, 10); else ctx.rect(card_x, card_y, card_w, CARD_H);
    ctx.fillStyle = bg; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = bc; ctx.stroke();

    drawPortrait(ctx, item.character, cx, card_y + 100, 80);
    ui.txt(item.character, "h3", C_GOLD, cx, card_y + 188, { cx: true });
    ui.txt(item.name, "h2", C_CREAM, cx, card_y + 212, { cx: true });
    if (extraInfo) ui.txt(extraInfo, "small", C_GOLD, cx, card_y + 238, { cx: true });

    if (this.items.length > 1) {
      const total = this.items.length, dot_r = 5, gap = 14;
      const dot_x = cx - (total - 1) * gap / 2;
      for (let i = 0; i < total; i++) {
        ctx.beginPath();
        ctx.arc(dot_x + i * gap, card_y + CARD_H + 14, dot_r, 0, Math.PI * 2);
        ctx.fillStyle = i === this._idx ? C_GOLD : C_BORDER;
        ctx.fill();
      }
      ui.txt(`${this._idx + 1}/${total}`, "small", C_GREY, cx, card_y + CARD_H + 28, { cx: true });
    }

    let rects = {};
    if (this.items.length > 1) {
      const ax_l = card_x - Carousel.ARROW_W - 8, ax_r = card_x + card_w + 8;
      const ay = cy - ah / 2;
      const left_r = { x: ax_l, y: ay, w: Carousel.ARROW_W, h: ah };
      const right_r = { x: ax_r, y: ay, w: Carousel.ARROW_W, h: ah };
      for (const [r, lbl] of [[left_r, "‹"], [right_r, "›"]]) {
        const hov = ui._hover(r.x, r.y, r.w, r.h);
        const bg2 = hov ? C_BORDER : C_ARROW;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(r.x, r.y, r.w, r.h, 8); else ctx.rect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = bg2; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = hov ? C_GOLD : C_BORDER; ctx.stroke();
        ui.txt(lbl, "title", C_GOLD, r.x + r.w / 2, r.y + r.h / 2, { cx: true });
        ui.buttons.push({ label: lbl + "_carousel", rect: r, disabled: false });
      }
      rects = { left: left_r, right: right_r };
    }
    return rects;
  }
}

function carousel_hit(ui, px, py, carousel) {
  for (const b of ui.buttons) {
    if (ui._hover2(px, py, b.rect)) {
      if (b.label === "‹_carousel") { carousel.prev(); return true; }
      if (b.label === "›_carousel") { carousel.next(); return true; }
    }
  }
  return false;
}

const _carousels = {};
function get_carousel(key, items, selected = null) {
  const existing = _carousels[key];
  const namesMatch = existing && existing.items.length === items.length &&
    existing.items.every((it, i) => it.name === items[i].name);
  if (!existing || !namesMatch) {
    _carousels[key] = new Carousel(items, selected);
  }
  return _carousels[key];
}
function reset_carousel(key) { delete _carousels[key]; }
function clear_carousels() { for (const k of Object.keys(_carousels)) delete _carousels[k]; }
