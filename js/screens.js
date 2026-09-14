// ── Screen drawers (mirrors the pygame draw_* functions) ───────────────────

// Layout for the setup-players name fields, shared with main.js (which
// overlays real <input> DOM elements at these coordinates for native
// mobile keyboard support instead of drawing them on the canvas).
function nameFieldRect(g, i) {
  const col_w = 200, cols = 2, sx = W / 2 - col_w - 10;
  const col = i % cols, row = Math.floor(i / cols);
  const x = sx + col * (col_w + 20), y = 196 + row * 58;
  return { x, y, w: 148, h: 32, label: `Player ${i + 1}` };
}

// The small 🤖/🧑 toggle sitting right of each name field.
function botToggleRect(g, i) {
  const r = nameFieldRect(g, i);
  return { x: r.x + r.w + 6, y: r.y, w: 46, h: 32 };
}

function draw_setup_players(ui, g) {
  ui.header("DEATH IN THE KREMLIN", "The Politburo convenes");
  ui.txt("Number of players:", "h3", C_CREAM, W / 2, 90, { cx: true });
  [4, 5, 6].forEach((n, i) => {
    const sel = g.num_players === n;
    ui.btn(String(n), W / 2 - 100 + i * 90, 112, 70, 36, { col: sel ? C_DARK_RED : C_MID, hov: C_CRIMSON });
  });
  ui.txt("Player names:", "h3", C_CREAM, W / 2, 165, { cx: true });
  const ctx = ui.ctx;
  for (let i = 0; i < g.num_players; i++) {
    const r = nameFieldRect(g, i);
    const isBot = !!g.setup_bots[i];
    ui.txt(r.label + (isBot ? "  (bot)" : ""), "small", isBot ? C_GOLD : C_PARCHMENT, r.x, r.y - 18);
    // the editable box itself is a DOM <input> overlay — see main.js syncNameInputs()

    const tr = botToggleRect(g, i);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tr.x, tr.y, tr.w, tr.h, 4); else ctx.rect(tr.x, tr.y, tr.w, tr.h);
    ctx.fillStyle = isBot ? C_DARK_GRN : C_MID; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = isBot ? C_GOLD : C_BORDER; ctx.stroke();
    ui.txt(isBot ? "🤖" : "🧑", "body", C_CREAM, tr.x + tr.w / 2, tr.y + tr.h / 2, { cx: true });
    ui.buttons.push({ label: `bot_toggle_${i}`, rect: { x: tr.x, y: tr.y, w: tr.w, h: tr.h }, disabled: false });
  }
  ui.btn("🎮 Solo — moi + des bots", W / 2 - 160, 402, 320, 40, { col: C_DARK_BLU, hov: C_BLUE });
  const all_named = Array.from({ length: g.num_players }, (_, i) => (g.setup_names[i] || "").trim()).every(Boolean);
  ui.btn("Continue →", W / 2 - 100, H - 70, 200, 44, { col: all_named ? C_CRIMSON : C_MID, dis: !all_named });
}

function draw_setup_chars(ui, g) {
  const current = g.current_player_idx;
  if (current >= g.num_players) return;
  const pname = g.setup_names[current];
  const taken = new Set();
  for (let i = 0; i < current; i++) if (g.setup_chars[i]) taken.add(g.setup_chars[i]);
  ui.header("CHARACTER SELECTION", `${pname}, choose your role`);
  const cw = 265, ch = 130, cols = 3, sx = W / 2 - (cols * cw + (cols - 1) * 8) / 2;
  CHARACTERS.forEach((char, i) => {
    const cx2 = sx + (i % cols) * (cw + 8), cy2 = 88 + Math.floor(i / cols) * (ch + 8);
    const avail = !taken.has(char), sel = g.setup_chars[current] === char;
    const bg = sel ? C_DARK_RED : (avail ? C_PANEL : C_MID);
    const bc = sel ? C_GOLD : (avail ? C_BORDER : rgb(50, 35, 25));
    ui.panel(cx2, cy2, cw, ch, bg, bc);
    drawPortrait(ui.ctx, char, cx2 + 60, cy2 + ch / 2, 52);
    ui.txt(char, "h3", avail ? C_CREAM : C_GREY, cx2 + 120, cy2 + 28, { maxW: cw - 132 });
    if (!avail) ui.txt("(taken)", "small", C_GREY, cx2 + 120, cy2 + 52);
    if (avail) ui.buttons.push({ label: char, rect: { x: cx2, y: cy2, w: cw, h: ch }, disabled: false });
  });
  const chosen = g.setup_chars[current] !== null;
  ui.btn("Confirm →", W / 2 - 110, H - 66, 220, 44, { dis: !chosen });
  ui.txt(`Player ${current + 1} of ${g.num_players}`, "small", C_GREY, W / 2, H - 14, { cx: true });
}

function draw_secret_deal(ui, g) {
  const current = g.current_player_idx, p = g.players[current];
  ui.header("SECRET DOSSIER", "Eyes only — cover the screen");
  ui.txt(`Pass the device to:  ${p.character}  ${p.name}`, "h3", C_GOLD, W / 2, 88, { cx: true });
  ui.divider(110);
  if (!g.secret_seen) {
    drawPortrait(ui.ctx, p.character, W / 2, 320, 110);
    ui.btn("Reveal my secret dossier", W / 2 - 170, 460, 340, 48, { col: C_DARK_RED, hov: C_CRIMSON });
  } else {
    const sc = SECRET_COLORS[p.secret_level], sn = SECRET_NAMES[p.secret_level];
    drawPortrait(ui.ctx, p.character, W / 2 - 220, 310, 110);
    ui.panel(W / 2 - 50, 200, 340, 200, C_PANEL, C_GOLD);
    ui.txt("YOUR SECRET", "small", C_GOLD, W / 2 + 120, 220, { cx: true });
    ui.txt(`Level ${p.secret_level}: ${sn}`, "h2", sc, W / 2 + 120, 260, { cx: true });
    const descs = { 1: "Two clues expose you.", 2: "Three clues expose you.", 3: "Four clues expose you." };
    ui.txt(descs[p.secret_level], "small", C_PARCHMENT, W / 2 + 120, 300, { cx: true });
    ui.btn("Understood — pass the device", W / 2 - 170, 430, 340, 44, { col: C_GREEN, hov: C_DARK_GRN });
  }
  ui.txt(`Comrade ${current + 1} of ${g.players.length}`, "small", C_GREY, W / 2, H - 14, { cx: true });
}

function draw_round_start(ui, g) {
  const alive = g.alive_players;
  ui.header(`ROUND ${g.round}`, `${alive.length} members in session`);
  const bw = 220, bh = 96, cols = Math.min(3, alive.length), sx = W / 2 - (cols * (bw + 10)) / 2 + 5;
  alive.forEach((p, i) => {
    const bx = sx + (i % cols) * (bw + 10), by = 90 + Math.floor(i / cols) * (bh + 10);
    ui.player_badge(p, bx, by, bw, bh);
  });
  const steps_y = 90 + (Math.floor((alive.length - 1) / cols) + 1) * (bh + 10) + 10;
  ["Step 1: Espionage", "Step 2: Anonymous Message", "Step 3: Public Vote", "Step 4: Accusations"].forEach((s, i) => {
    ui.txt(s, "h3", C_GOLD, 80, steps_y + i * 30);
  });
  ui.btn("Begin Round →", W / 2 - 120, H - 70, 240, 48, { col: C_CRIMSON });
}

function draw_spy_choose(ui, g) {
  const p = g.current_player();
  ui.header("STEP 1: ESPIONAGE", `Round ${g.round}`);
  ui.txt(`${p.character}  ${p.name} — choose a target`, "h3", C_CREAM, W / 2, 82, { cx: true });
  const targets = g.alive_players.filter(t => t !== p);
  if (!targets.length) return;
  const car = get_carousel("spy_choose", targets);
  const item = car.current();
  const disc = item ? p.has_discovered(item.name) : false;
  const extra = (disc && item) ? `★ ${SECRET_NAMES[p.known_secrets[item.name]]} known` : null;
  car.draw(ui, W / 2, H / 2 - 20, extra);
  ui.btn("Spy on this player →", W / 2 - 130, H - 70, 260, 46, { col: C_CRIMSON });
  ui.txt(`Your character: ${p.character}`, "small", C_GREY, 20, H - 18);
}

function draw_spy_method(ui, g) {
  const p = g.current_player(), t = g.spy_target;
  ui.header("STEP 1: CHOOSE METHOD", `Spying on ${t.name}`);
  drawPortrait(ui.ctx, p.character, 60, 124, 50);
  ui.txt(p.name, "small", C_PARCHMENT, 60, 182, { cx: true });
  drawPortrait(ui.ctx, t.character, W - 60, 124, 50);
  ui.txt(t.name, "small", C_PARCHMENT, W - 60, 182, { cx: true });
  const bw = 340, bh = 58, sx = (W - bw * 2 - 12) / 2;
  const ctx = ui.ctx;
  SPY_OPTIONS.forEach((opt, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = sx + col * (bw + 12), by = 206 + row * (bh + 8);
    const used = !p.can_spy_with(t.name, i);
    const bg = used ? C_MID : C_PANEL, bc = used ? C_BORDER : C_GOLD;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 5); else ctx.rect(bx, by, bw, bh);
    ctx.fillStyle = bg; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = bc; ctx.stroke();
    const icon = getSpyIcon(i);
    if (used) { ctx.globalAlpha = 80 / 255; ctx.drawImage(icon, bx + 8, by + bh / 2 - 26, 52, 52); ctx.globalAlpha = 1; }
    else ctx.drawImage(icon, bx + 8, by + bh / 2 - 26, 52, 52);
    const tc = used ? C_GREY : C_CREAM;
    ui.txt(opt, "body", tc, bx + 68, by + bh / 2 - 9);
    if (used) ui.txt("(used)", "small", rgb(80, 60, 50), bx + bw - 60, by + bh / 2 - 7);
    if (!used) ui.buttons.push({ label: opt, rect: { x: bx, y: by, w: bw, h: bh }, disabled: false });
  });
  ui.btn("← Back", 30, H - 60, 110, 38, { col: C_MID, hov: C_BORDER });
}

function draw_spy_result(ui, g) {
  const p = g.current_player(), sr = g.spy_result, t = sr ? g.player(sr.target) : null;
  ui.header("ESPIONAGE RESULT", "For your eyes only");
  if (t) drawPortrait(ui.ctx, t.character, W / 2, 240, 105);
  if (t) ui.txt(`${t.character}  ${t.name}`, "h3", C_GOLD, W / 2, 352, { cx: true });
  if (sr) {
    const res = sr.result;
    if (res === "secret") {
      const lvl = sr.secret_level || 1;
      ui.panel(W / 2 - 280, 376, 560, 58, C_DARK_RED, C_GOLD);
      ui.txt(`SECRET UNCOVERED: ${SECRET_NAMES[lvl]}  (Level ${lvl})`, "h3", SECRET_COLORS[lvl], W / 2, 403, { cx: true });
    } else if (res === "clue") {
      ui.panel(W / 2 - 220, 376, 440, 52, C_PANEL, C_GOLD);
      ui.txt("A clue was found.", "h2", C_GOLD, W / 2, 399, { cx: true });
    } else {
      ui.panel(W / 2 - 240, 376, 480, 52, C_PANEL, C_BORDER);
      ui.txt("Nothing of note was found.", "h2", C_GREY, W / 2, 399, { cx: true });
    }
  }
  ui.btn("Continue →", W / 2 - 100, H - 66, 200, 44);
}

function draw_bribe_choose(ui, g) {
  const alive = g.alive_players;
  const p = g.pending_bribe_idx < alive.length ? alive[g.pending_bribe_idx] : alive[0];
  ui.header("STEP 2: ANONYMOUS MESSAGE", `Round ${g.round}`);
  ui.txt(`Pass the device to:  ${p.character}  ${p.name}`, "h3", C_GOLD, W / 2, 82, { cx: true });
  ui.divider(108);

  const mode = g.bribe_mode;

  if (mode === "") {
    ui.txt("Choose your anonymous action:", "h3", C_CREAM, W / 2, 130, { cx: true });
    ui.btn("Send a voting instruction", W / 2 - 210, 200, 420, 52, { col: C_DARK_BLU, hov: C_BLUE });
    const known_targets = alive.filter(t => t !== p && p.has_discovered(t.name));
    ui.btn("Share a discovered secret", W / 2 - 210, 264, 420, 52, {
      col: known_targets.length ? C_DARK_GRN : C_MID,
      hov: known_targets.length ? C_GREEN : C_MID,
      dis: !known_targets.length,
    });
    ui.btn("Skip (do nothing)", W / 2 - 210, 328, 420, 44, { col: C_MID });

  } else if (mode === "pick_rec") {
    const others = alive.filter(t => t !== p);
    const car = get_carousel("bribe_rec", others, g.bribe_recipient);
    const item = car.current();
    const act_lbl = g._bribe_action === "vote" ? "voting instruction" : "secret";
    ui.txt(`Who receives your ${act_lbl}?`, "h3", C_CREAM, W / 2, 126, { cx: true });
    const known_rec = item ? p.has_discovered(item.name) : false;
    const extra = (known_rec && g._bribe_action === "vote") ? `☭ blackmail Lv${p.known_secrets[item.name]}` : null;
    car.draw(ui, W / 2, H / 2 - 10, extra);
    ui.btn("Send to this player →", W / 2 - 130, H - 120, 260, 44, { col: C_GOLD, tcol: C_DARK });
    ui.btn("← Back", 30, H - 60, 110, 38, { col: C_MID });

  } else if (mode === "vote") {
    const rec = g.bribe_recipient;
    ui.txt(`Ask ${rec.name} to vote for whom?`, "h3", C_CREAM, W / 2, 126, { cx: true });
    const car = get_carousel("bribe_vtgt", alive, g.bribe_target);
    const item = car.current();
    car.draw(ui, W / 2, H / 2 - 10);
    const ready = item !== null;
    ui.btn("Send instruction →", W / 2 - 130, H - 120, 260, 44, { col: ready ? C_DARK_BLU : C_MID, hov: C_BLUE, dis: !ready });
    ui.btn("← Back", 30, H - 60, 110, 38, { col: C_MID });

  } else if (mode === "secret") {
    const rec = g.bribe_recipient;
    const known_targets = alive.filter(t => t !== p && p.has_discovered(t.name));
    ui.txt(`Share whose secret with ${rec.name}?`, "h3", C_CREAM, W / 2, 126, { cx: true });
    if (known_targets.length) {
      const car = get_carousel("bribe_stgt", known_targets, g.bribe_target);
      const item = car.current();
      const lvl = item ? (p.known_secrets[item.name] || 0) : 0;
      const extra = lvl ? `Lv${lvl}: ${SECRET_NAMES[lvl] || ""}` : null;
      car.draw(ui, W / 2, H / 2 - 10, extra);
      const ready = item !== null;
      ui.btn("Share secret →", W / 2 - 130, H - 120, 260, 44, { col: ready ? C_DARK_GRN : C_MID, hov: C_GREEN, dis: !ready });
    }
    ui.btn("← Back", 30, H - 60, 110, 38, { col: C_MID });
  }
}

function draw_vote(ui, g) {
  const alive = g.alive_players;
  const p = g.pending_vote_idx < alive.length ? alive[g.pending_vote_idx] : alive[0];
  ui.header("STEP 3: PUBLIC VOTE", `Round ${g.round}`);
  ui.txt(`${p.character}  ${p.name} — cast your vote`, "h3", C_CREAM, W / 2, 82, { cx: true });
  const inbox = p.bribe_inbox;
  let iy = 100;
  for (const msg of inbox) {
    if (msg.type === "vote") {
      const text = `Vote for ${msg.target}` + (msg.blackmail ? "  ⚑ BLACKMAIL" : "");
      const bcol = msg.blackmail ? C_DARK_RED : C_PANEL, bord = msg.blackmail ? C_GOLD : C_BORDER;
      ui.panel(40, iy, W - 80, 32, bcol, bord);
      ui.txt(text, "body", msg.blackmail ? C_GOLD : C_CREAM, W / 2, iy + 8, { cx: true });
    } else {
      const lvl = msg.level || 1;
      const is_self = msg.target === p.name;
      const bcol = is_self ? rgb(100, 8, 8) : C_PANEL;
      const text = is_self
        ? `⚑ THREAT: your secret is known — Lv${lvl}: ${SECRET_NAMES[lvl]}`
        : `Tip: ${msg.target} is Lv${lvl}: ${SECRET_NAMES[lvl]}`;
      ui.panel(40, iy, W - 80, 32, bcol, is_self ? C_GOLD : C_BORDER);
      ui.txt(text, "body", SECRET_COLORS[lvl] || C_GOLD, W / 2, iy + 8, { cx: true });
    }
    iy += 40;
  }
  const car = get_carousel("vote", alive, null);
  const item = car.current();
  car.draw(ui, W / 2, Math.max(iy + 30, 320) + 80);
  const voted = g.votes[p.name];
  const lbl = (item && voted === item.name) ? "✔ Vote for this player" : "Vote for this player";
  const col = (item && voted === item.name) ? C_DARK_GRN : C_CRIMSON;
  ui.btn(lbl, W / 2 - 130, H - 120, 260, 44, { col });
  ui.btn("Confirm vote →", W / 2 - 100, H - 66, 200, 44, { dis: !(p.name in g.votes), col: C_CRIMSON });
}

function draw_vote_result(ui, g) {
  const alive = g.alive_players, tally = g.vote_tally(), total = alive.length;
  ui.header("VOTE RESULTS", `Round ${g.round}`);
  const sorted_t = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const bx = 200, bw_max = 560;
  const ctx = ui.ctx;
  sorted_t.forEach(([name, cnt], i) => {
    const y = 100 + i * 64, pct = cnt / total, majority = pct > 0.5;
    const pl = g.player(name);
    if (pl) drawPortrait(ctx, pl.character, bx - 50, y + 24, 22);
    ui.txt(name, "body", C_CREAM, bx - 12, y + 10, { rx: true });
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, y, bw_max, 40, 4); else ctx.rect(bx, y, bw_max, 40);
    ctx.fillStyle = C_PANEL; ctx.fill();
    const fc = majority ? C_CRIMSON : C_DARK_BLU;
    const fw = Math.max(4, Math.floor(bw_max * pct));
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, y, fw, 40, 4); else ctx.rect(bx, y, fw, 40);
    ctx.fillStyle = fc; ctx.fill();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, y, bw_max, 40, 4); else ctx.rect(bx, y, bw_max, 40);
    ctx.lineWidth = 2; ctx.strokeStyle = majority ? C_GOLD : C_BORDER; ctx.stroke();
    ui.txt(`${cnt} vote${cnt !== 1 ? "s" : ""}`, "small", C_GOLD, bx + fw + 8, y + 12);
    if (majority) ui.txt("★ MAJORITY", "small", C_GOLD, bx + fw + 8, y + 26);
  });
  if (g.winner_candidate) {
    const wp = g.winner_candidate;
    ui.panel(W / 2 - 280, H - 130, 560, 54, C_DARK_RED, C_GOLD);
    ui.txt(`★  ${wp.name} commands a majority!`, "h3", C_GOLD, W / 2, H - 106, { cx: true });
  }
  ui.btn("Proceed to Accusations →", W / 2 - 160, H - 66, 320, 44);
}

function draw_accuse_choose(ui, g) {
  const alive = g.alive_players;
  const p = g.pending_accuse_idx < alive.length ? alive[g.pending_accuse_idx] : alive[0];
  ui.header("STEP 4: ACCUSATIONS", `Round ${g.round}`);
  ui.txt(`${p.character}  ${p.name} — you may accuse one player`, "h3", C_CREAM, W / 2, 82, { cx: true });
  const accusable = alive.filter(t => t !== p && p.has_discovered(t.name));
  if (accusable.length) {
    const car = get_carousel("accuse", accusable, g.accuse_target);
    const item = car.current();
    const lvl = item ? (p.known_secrets[item.name] || 0) : 0;
    const extra = lvl ? `Lv${lvl}: ${SECRET_NAMES[lvl]}` : null;
    car.draw(ui, W / 2, 340, extra);
    const lbl = item === g.accuse_target ? "✔ Accuse this player" : "Select to accuse";
    const bcol = item === g.accuse_target ? C_DARK_RED : C_MID;
    ui.btn(lbl, W / 2 - 130, H - 128, 260, 40, { col: bcol });
    ui.btn("Accuse →", W / 2 - 200, H - 76, 180, 44, { dis: g.accuse_target === null, col: C_CRIMSON });
  } else {
    ui.txt("No targets — no secrets uncovered yet.", "body", C_GREY, W / 2, 340, { cx: true });
  }
  ui.btn("Pass (no accusation)", W / 2 + 10, H - 76, 220, 44, { col: C_MID });
  ui.txt(`Player ${g.pending_accuse_idx + 1} of ${alive.length}`, "small", C_GREY, W / 2, H - 18, { cx: true });
}

function draw_accuse_respond(ui, g) {
  const [accuser, accused, acc_level] = g.current_accusation;
  ui.header("STEP 4: ACCUSATION", `Round ${g.round}`);
  drawPortrait(ui.ctx, accuser.character, W / 4, 220, 80);
  ui.txt(accuser.character, "small", C_PARCHMENT, W / 4, 308, { cx: true });
  ui.txt(accuser.name, "body", C_CREAM, W / 4, 326, { cx: true });
  drawPortrait(ui.ctx, accused.character, 3 * W / 4, 220, 80);
  ui.txt(accused.character, "small", C_PARCHMENT, 3 * W / 4, 308, { cx: true });
  ui.txt(accused.name, "body", C_CREAM, 3 * W / 4, 326, { cx: true });
  ui.panel(W / 2 - 360, 100, 720, 66, C_DARK_RED, C_GOLD);
  ui.txt(`☭  ${accuser.name}  accuses  ${accused.name}`, "h3", C_GOLD, W / 2, 116, { cx: true });
  ui.txt(`Level ${acc_level}: ${SECRET_NAMES[acc_level]}`, "h2", SECRET_COLORS[acc_level], W / 2, 148, { cx: true });
  ui.divider(358);
  ui.txt(`Pass the device to:  ${accused.character}  ${accused.name}`, "h3", C_CREAM, W / 2, 368, { cx: true });
  const can_counter = accuser.name in accused.known_secrets;
  if (can_counter) {
    const cl = accused.known_secrets[accuser.name];
    ui.panel(W / 2 - 260, 394, 520, 46, C_PANEL, C_GOLD);
    ui.txt(`You know their secret — Lv${cl}: ${SECRET_NAMES[cl]}`, "body", SECRET_COLORS[cl], W / 2, 416, { cx: true });
    ui.btn("Counter-accuse →", W / 2 - 220, H - 70, 208, 44, { col: C_CRIMSON });
    ui.btn("Accept (do not counter)", W / 2 + 18, H - 70, 222, 44, { col: C_MID });
  } else {
    ui.txt("You cannot counter — no knowledge of their secret.", "body", C_GREY, W / 2, 400, { cx: true });
    ui.btn("Accept fate", W / 2 - 110, H - 70, 220, 44, { col: C_MID });
  }
}

function draw_accuse_outcome(ui, g) {
  ui.header("ACCUSATION OUTCOME", `Round ${g.round}`);
  const lines = g.accuse_outcome.lines || [];
  let y = 160;
  for (const ln of lines) {
    const col = ln.includes("PURGED") ? C_CRIMSON : (ln.includes("survive") || ln.includes("cancel")) ? C_GOLD : C_CREAM;
    ui.txt(ln, y < 200 ? "h3" : "body", col, W / 2, y, { cx: true });
    y += 44;
  }
  ui.btn("Continue →", W / 2 - 100, H - 70, 200, 44);
}

function draw_game_over(ui, g) {
  const ctx = ui.ctx;
  ctx.fillStyle = C_DARK_RED; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 4; ctx.strokeStyle = C_GOLD; ctx.strokeRect(2, 2, W - 4, H - 4);
  ui.txt("☭", "big", C_GOLD, W / 2, 50, { cx: true });
  if (g.winner) {
    ui.txt("GENERAL SECRETARY ELECTED", "h2", C_GOLD, W / 2, 138, { cx: true });
    drawPortrait(ctx, g.winner.character, W / 2, 238, 90);
    ui.txt(g.winner.character, "h3", C_GOLD, W / 2, 334, { cx: true });
    ui.txt(g.winner.name, "title", C_CREAM, W / 2, 362, { cx: true });
  }
  ui.divider(408);
  ui.txt("Final dossiers:", "h3", C_GOLD, W / 2, 416, { cx: true });
  const bw = 200, bh = 80, sx = W / 2 - (Math.min(3, g.players.length) * (bw + 8)) / 2 + 4;
  g.players.forEach((p, i) => {
    const bx = sx + (i % 3) * (bw + 8), by = 442 + Math.floor(i / 3) * (bh + 8);
    ui.player_badge(p, bx, by, bw, bh, true);
  });
  ui.btn("★  Play Again  ★", W / 2 - 130, H - 60, 260, 46, { col: C_CRIMSON });
}
