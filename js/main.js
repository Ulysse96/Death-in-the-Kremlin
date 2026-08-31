// ── Main loop, input handling, responsive canvas & DOM name-input overlay ──

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const stage = document.getElementById("stage");
const overlay = document.getElementById("dom-overlay");

let game = new Game();
const ui = new UI(ctx);

const DRAWS = {
  [Phase.SETUP_PLAYERS]: draw_setup_players,
  [Phase.SETUP_CHARS]: draw_setup_chars,
  [Phase.SECRET_DEAL]: draw_secret_deal,
  [Phase.ROUND_START]: draw_round_start,
  [Phase.SPY_CHOOSE]: draw_spy_choose,
  [Phase.SPY_METHOD]: draw_spy_method,
  [Phase.SPY_RESULT]: draw_spy_result,
  [Phase.BRIBE_CHOOSE]: draw_bribe_choose,
  [Phase.VOTE]: draw_vote,
  [Phase.VOTE_RESULT]: draw_vote_result,
  [Phase.ACCUSE_CHOOSE]: draw_accuse_choose,
  [Phase.ACCUSE_RESPOND]: draw_accuse_respond,
  [Phase.ACCUSE_OUTCOME]: draw_accuse_outcome,
  [Phase.GAME_OVER]: draw_game_over,
};

// ── Responsive scaling ──────────────────────────────────────────────────
let currentScale = 1;
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  // The game's layout is landscape (900×680). On a narrow, tall viewport
  // (a phone held in portrait) ask the player to rotate rather than
  // rendering a tiny, unreadable canvas.
  const isPhonePortrait = vh > vw && vw < 820;
  document.body.classList.toggle("portrait-lock", isPhonePortrait);
  if (isPhonePortrait) return;

  const sw = stage.clientWidth, sh = stage.clientHeight;
  const scale = Math.min(sw / W, sh / H);
  canvas.style.width = Math.floor(W * scale) + "px";
  canvas.style.height = Math.floor(H * scale) + "px";
  requestAnimationFrame(layoutOverlay);
}
function layoutOverlay() {
  const r = canvas.getBoundingClientRect();
  overlay.style.left = r.left + "px";
  overlay.style.top = r.top + "px";
  overlay.style.width = r.width + "px";
  overlay.style.height = r.height + "px";
  currentScale = r.width / W;
  syncNameInputs();
}
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);

// ── Pointer input ────────────────────────────────────────────────────────
function toLogical(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return { x: (clientX - r.left) * (W / r.width), y: (clientY - r.top) * (H / r.height) };
}
canvas.addEventListener("pointermove", (e) => {
  const { x, y } = toLogical(e.clientX, e.clientY);
  ui.pointer.x = x; ui.pointer.y = y;
});
canvas.addEventListener("click", (e) => {
  const { x, y } = toLogical(e.clientX, e.clientY);
  handleTap(x, y);
  scheduleBotIfNeeded();
});

// ── Bot turn scheduling ──────────────────────────────────────────────────
// Whenever the active player for the current phase is a bot, auto-play
// their decision after a short, visible pause instead of waiting for a tap.
let botTimer = null;
function scheduleBotIfNeeded() {
  if (botTimer) { clearTimeout(botTimer); botTimer = null; }
  const actor = botActorFor(game);
  if (actor && actor.isBot) {
    botTimer = setTimeout(() => {
      botTimer = null;
      performBotAction(game);
      scheduleBotIfNeeded();
    }, BOT_DELAY_MS);
  }
}

// ── Name-entry DOM overlay (native mobile keyboard for the setup screen) ──
const nameInputs = [];
function syncNameInputs() {
  const need = game.phase === Phase.SETUP_PLAYERS ? game.num_players : 0;
  while (nameInputs.length < need) {
    const idx = nameInputs.length;
    const el = document.createElement("input");
    el.type = "text";
    el.className = "field";
    el.maxLength = 14;
    el.placeholder = `Comrade ${idx + 1}`;
    el.addEventListener("input", () => { game.setup_names[idx] = el.value; });
    overlay.appendChild(el);
    nameInputs.push(el);
  }
  while (nameInputs.length > need) {
    overlay.removeChild(nameInputs.pop());
  }
  for (let i = 0; i < need; i++) {
    const r = nameFieldRect(game, i);
    const el = nameInputs[i];
    el.style.left = (r.x * currentScale) + "px";
    el.style.top = (r.y * currentScale) + "px";
    el.style.width = (r.w * currentScale) + "px";
    el.style.height = (r.h * currentScale) + "px";
    el.style.fontSize = Math.max(10, 16 * currentScale) + "px";
    if (document.activeElement !== el) el.value = game.setup_names[i] || "";
  }
}

// ── Per-phase tap handling (mirrors the pygame main() event switch) ───────
function handleTap(x, y) {
  const g = game;
  // Ignore taps while a bot is deciding, to avoid racing its scheduled action.
  const actor = botActorFor(g);
  if (actor && actor.isBot) return;
  const hit = (label) => ui.hit(x, y, label);

  if (g.phase === Phase.SETUP_PLAYERS) {
    for (const n of [4, 5, 6]) {
      if (hit(String(n)) && g.num_players !== n) {
        g.num_players = n;
        while (g.setup_names.length < n) g.setup_names.push("");
        while (g.setup_bots.length < n) g.setup_bots.push(false);
        syncNameInputs();
      }
    }
    for (let i = 0; i < g.num_players; i++) {
      if (hit(`bot_toggle_${i}`)) {
        g.setup_bots[i] = !g.setup_bots[i];
        if (g.setup_bots[i] && !(g.setup_names[i] || "").trim()) g.setup_names[i] = `Bot ${i + 1}`;
      }
    }
    if (hit("🎮 Solo — moi + des bots")) {
      if (g.num_players < 4) { g.num_players = 4; while (g.setup_names.length < 4) g.setup_names.push(""); while (g.setup_bots.length < 4) g.setup_bots.push(false); }
      for (let i = 0; i < g.num_players; i++) {
        g.setup_bots[i] = i !== 0;
        if (!(g.setup_names[i] || "").trim()) g.setup_names[i] = i === 0 ? "Moi" : `Bot ${i + 1}`;
      }
      syncNameInputs();
    }
    const all_named = Array.from({ length: g.num_players }, (_, i) => (g.setup_names[i] || "").trim()).every(Boolean);
    if (hit("Continue →") && all_named) {
      g.players = Array.from({ length: g.num_players }, (_, i) => {
        const pl = new Player((g.setup_names[i] || "").trim() || `P${i + 1}`);
        pl.isBot = !!g.setup_bots[i];
        return pl;
      });
      g.phase = Phase.SETUP_CHARS; g.current_player_idx = 0;
      syncNameInputs();
    }

  } else if (g.phase === Phase.SETUP_CHARS) {
    const taken = new Set();
    for (let i = 0; i < g.current_player_idx; i++) if (g.setup_chars[i]) taken.add(g.setup_chars[i]);
    for (const char of CHARACTERS) {
      if (!taken.has(char) && hit(char)) g.setup_chars[g.current_player_idx] = char;
    }
    if (hit("Confirm →") && g.setup_chars[g.current_player_idx]) {
      g.players[g.current_player_idx].character = g.setup_chars[g.current_player_idx];
      g.current_player_idx += 1;
      if (g.current_player_idx >= g.num_players) {
        assign_secrets(g.players); assign_clue_maps(g.players);
        g.current_player_idx = 0; g.secret_seen = false;
        g.phase = Phase.SECRET_DEAL;
      }
    }

  } else if (g.phase === Phase.SECRET_DEAL) {
    if (hit("Reveal my secret dossier")) g.secret_seen = true;
    if (hit("Understood — pass the device")) {
      g.current_player_idx += 1; g.secret_seen = false;
      if (g.current_player_idx >= g.players.length) g.phase = Phase.ROUND_START;
    }

  } else if (g.phase === Phase.ROUND_START) {
    if (hit("Begin Round →")) {
      g.current_player_idx = 0; g.spy_target = null; g.spy_result = null;
      clear_carousels(); g.phase = Phase.SPY_CHOOSE;
    }

  } else if (g.phase === Phase.SPY_CHOOSE) {
    const p = g.current_player();
    const targets = g.alive_players.filter(t => t !== p);
    const car = get_carousel("spy_choose", targets);
    if (carousel_hit(ui, x, y, car)) { /* consumed */ }
    else if (hit("Spy on this player →")) {
      g.spy_target = car.current(); reset_carousel("spy_choose");
      g.phase = Phase.SPY_METHOD;
    }

  } else if (g.phase === Phase.SPY_METHOD) {
    const p = g.current_player(), t = g.spy_target;
    if (hit("← Back")) {
      g.spy_target = null; g.phase = Phase.SPY_CHOOSE;
    } else {
      for (let i = 0; i < SPY_OPTIONS.length; i++) {
        const opt = SPY_OPTIONS[i];
        if (hit(opt) && p.can_spy_with(t.name, i)) {
          const was = p.has_discovered(t.name);
          p.record_spy(t, i);
          const cl = p.clue_map[i];
          if (p.has_discovered(t.name) && !was) {
            const lvl = p.known_secrets[t.name];
            g.spy_result = { result: "secret", target: t.name, secret_level: lvl };
          } else if (cl && cl <= t.secret_level) {
            g.spy_result = { result: "clue", target: t.name };
          } else {
            g.spy_result = { result: "nothing", target: t.name };
          }
          g.phase = Phase.SPY_RESULT; break;
        }
      }
    }

  } else if (g.phase === Phase.SPY_RESULT) {
    if (hit("Continue →")) {
      const alive = g.alive_players, cur = g.current_player();
      const idx = alive.indexOf(cur) + 1;
      if (idx >= alive.length) {
        g.pending_bribe_idx = 0; g.bribe_mode = ""; g._bribe_action = "";
        g.bribe_recipient = null; g.bribe_target = null;
        for (const p of g.players) p.bribe_inbox = [];
        clear_carousels(); g.phase = Phase.BRIBE_CHOOSE;
      } else {
        g.current_player_idx = idx; g.spy_target = null; g.spy_result = null;
        reset_carousel("spy_choose"); g.phase = Phase.SPY_CHOOSE;
      }
    }

  } else if (g.phase === Phase.BRIBE_CHOOSE) {
    const alive = g.alive_players;
    if (g.pending_bribe_idx >= alive.length) {
      g.pending_vote_idx = 0; g.votes = {}; clear_carousels(); g.phase = Phase.VOTE;
    } else {
      const p = alive[g.pending_bribe_idx];
      const others = alive.filter(t => t !== p);

      const adv_bribe = () => {
        g.pending_bribe_idx += 1; g.bribe_recipient = null;
        g.bribe_target = null; g.bribe_mode = ""; g._bribe_action = "";
        for (const k of ["bribe_rec", "bribe_vtgt", "bribe_stgt"]) reset_carousel(k);
        if (g.pending_bribe_idx >= g.alive_players.length) {
          g.pending_vote_idx = 0; g.votes = {}; g.phase = Phase.VOTE;
        }
      };

      const mode = g.bribe_mode;
      if (mode === "") {
        if (hit("Send a voting instruction")) { g._bribe_action = "vote"; g.bribe_mode = "pick_rec"; reset_carousel("bribe_rec"); }
        else if (hit("Share a discovered secret")) { g._bribe_action = "secret"; g.bribe_mode = "pick_rec"; reset_carousel("bribe_rec"); }
        else if (hit("Skip (do nothing)")) adv_bribe();

      } else if (mode === "pick_rec") {
        const rec_car = get_carousel("bribe_rec", others, g.bribe_recipient);
        if (!carousel_hit(ui, x, y, rec_car)) {
          if (hit("Send to this player →")) {
            g.bribe_recipient = rec_car.current();
            g.bribe_mode = g._bribe_action;
            reset_carousel("bribe_vtgt"); reset_carousel("bribe_stgt");
          } else if (hit("← Back")) {
            g.bribe_mode = ""; g._bribe_action = "";
          }
        }

      } else if (mode === "vote") {
        const v_car = get_carousel("bribe_vtgt", alive, g.bribe_target);
        if (!carousel_hit(ui, x, y, v_car)) {
          const item = v_car.current();
          if (hit("Send instruction →") && item) {
            g.bribe_target = item;
            do_bribe(p, g.bribe_recipient, g.bribe_target, "vote"); adv_bribe();
          } else if (hit("← Back")) {
            g.bribe_mode = "pick_rec"; g.bribe_target = null; reset_carousel("bribe_vtgt");
          }
        }

      } else if (mode === "secret") {
        const known_targets = alive.filter(t => t !== p && p.has_discovered(t.name));
        if (known_targets.length) {
          const s_car = get_carousel("bribe_stgt", known_targets, g.bribe_target);
          if (!carousel_hit(ui, x, y, s_car)) {
            const item = s_car.current();
            if (hit("Share secret →") && item) {
              g.bribe_target = item;
              do_bribe(p, g.bribe_recipient, g.bribe_target, "secret"); adv_bribe();
            }
          }
        }
        if (hit("← Back")) {
          g.bribe_mode = "pick_rec"; g.bribe_target = null; reset_carousel("bribe_stgt");
        }
      }
    }

  } else if (g.phase === Phase.VOTE) {
    const alive = g.alive_players;
    if (g.pending_vote_idx >= alive.length) {
      g.winner_candidate = g.check_winner(); g.phase = Phase.VOTE_RESULT;
    } else {
      const voter = alive[g.pending_vote_idx];
      const car = get_carousel("vote", alive);
      carousel_hit(ui, x, y, car);
      const item = car.current();
      if (hit("Vote for this player") || hit("✔ Vote for this player")) {
        if (item) g.votes[voter.name] = item.name;
      }
      if (hit("Confirm vote →") && (voter.name in g.votes)) {
        g.pending_vote_idx += 1; reset_carousel("vote");
        if (g.pending_vote_idx >= alive.length) {
          g.winner_candidate = g.check_winner(); g.phase = Phase.VOTE_RESULT;
        }
      }
    }

  } else if (g.phase === Phase.VOTE_RESULT) {
    if (hit("Proceed to Accusations →")) {
      const w = g.check_winner();
      if (w) { g.winner = w; g.phase = Phase.GAME_OVER; }
      else { g.pending_accuse_idx = 0; g.accuse_target = null; reset_carousel("accuse"); g.phase = Phase.ACCUSE_CHOOSE; }
    }

  } else if (g.phase === Phase.ACCUSE_CHOOSE) {
    const alive = g.alive_players;
    if (g.pending_accuse_idx < alive.length) {
      const p = alive[g.pending_accuse_idx];
      const accusable = alive.filter(t => t !== p && p.has_discovered(t.name));
      if (accusable.length) {
        const car = get_carousel("accuse", accusable, g.accuse_target);
        carousel_hit(ui, x, y, car);
        const item = car.current();
        if (hit("Select to accuse") || hit("✔ Accuse this player")) g.accuse_target = item;
        if (hit("Accuse →") && g.accuse_target) {
          const lvl = p.known_secrets[g.accuse_target.name];
          g.current_accusation = [p, g.accuse_target, lvl];
          g.pending_accuse_idx += 1; g.accuse_target = null;
          reset_carousel("accuse"); g.phase = Phase.ACCUSE_RESPOND;
        }
      }
      if (hit("Pass (no accusation)")) {
        g.pending_accuse_idx += 1; g.accuse_target = null; reset_carousel("accuse");
        if (g.pending_accuse_idx >= alive.length) end_round(g);
      }
    }

  } else if (g.phase === Phase.ACCUSE_RESPOND) {
    const [accuser, accused, acc_level] = g.current_accusation;
    const can_counter = accuser.name in accused.known_secrets;
    if (hit("Counter-accuse →") && can_counter) {
      const cl = accused.known_secrets[accuser.name];
      let lines;
      if (acc_level === cl) {
        lines = [`${accuser.name} accused ${accused.name}`, `${accused.name} counter-accuses!`, "Same level — both survive."];
      } else if (cl > acc_level) {
        accuser.alive = false;
        lines = [`${accuser.name} accused ${accused.name}`, `${accused.name} counter-accuses!`, `${accuser.name} — PURGED.`];
      } else {
        accused.alive = false;
        lines = [`${accuser.name} accused ${accused.name}`, `${accused.name} counter-accuses!`, `${accused.name} — PURGED.`];
      }
      g.accuse_outcome = { lines }; g.phase = Phase.ACCUSE_OUTCOME;
    } else if (hit("Accept fate") || hit("Accept (do not counter)")) {
      accused.alive = false;
      g.accuse_outcome = { lines: [`${accuser.name} accused ${accused.name}`, `${accused.name} accepts — PURGED.`] };
      g.phase = Phase.ACCUSE_OUTCOME;
    }

  } else if (g.phase === Phase.ACCUSE_OUTCOME) {
    if (hit("Continue →")) {
      const alive = g.alive_players;
      if (g.pending_accuse_idx >= alive.length) end_round(g);
      else g.phase = Phase.ACCUSE_CHOOSE;
    }

  } else if (g.phase === Phase.GAME_OVER) {
    if (hit("★  Play Again  ★")) {
      game = new Game(); clear_carousels(); ui.buttons = [];
    }
  }
}

// ── Main render loop ────────────────────────────────────────────────────
function loop() {
  ui.clear();
  const fn = DRAWS[game.phase];
  if (fn) fn(ui, game);
  syncNameInputs();
  requestAnimationFrame(loop);
}

resize();
requestAnimationFrame(loop);
