// ── Bot AI: lets 1 human play solo against auto-played comrades ────────────
//
// Bots make their decisions programmatically instead of via taps, but every
// state change they trigger is the exact same mutation the human tap-path
// (main.js handleTap) performs for that phase — see the phase-by-phase
// comments below. main.js schedules a call to performBotAction() whenever
// botActorFor() says the current phase's active player is a bot.

const BOT_DELAY_MS = 650;

// Returns the Player whose decision the current phase is waiting on, or
// null if the phase has no single "whose turn is it" actor (shared/reveal
// screens like ROUND_START or GAME_OVER always wait for a human tap).
function botActorFor(g) {
  switch (g.phase) {
    case Phase.SETUP_CHARS:
      return g.players[g.current_player_idx] || null;
    case Phase.SECRET_DEAL:
      return g.players[g.current_player_idx] || null;
    case Phase.SPY_CHOOSE:
    case Phase.SPY_METHOD:
    case Phase.SPY_RESULT:
      return g.current_player();
    case Phase.BRIBE_CHOOSE: {
      const alive = g.alive_players;
      return g.pending_bribe_idx < alive.length ? alive[g.pending_bribe_idx] : null;
    }
    case Phase.VOTE: {
      const alive = g.alive_players;
      return g.pending_vote_idx < alive.length ? alive[g.pending_vote_idx] : null;
    }
    case Phase.ACCUSE_CHOOSE: {
      const alive = g.alive_players;
      return g.pending_accuse_idx < alive.length ? alive[g.pending_accuse_idx] : null;
    }
    case Phase.ACCUSE_RESPOND:
      return g.current_accusation ? g.current_accusation[1] : null;
    default:
      return null;
  }
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Performs exactly one bot decision for the current phase. Mirrors the
// corresponding branch of handleTap() in main.js, but chooses its target
// programmatically instead of reading a tapped button/carousel position.
function performBotAction(g) {
  const bot = botActorFor(g);
  if (!bot || !bot.isBot) return;

  if (g.phase === Phase.SETUP_CHARS) {
    const taken = new Set();
    for (let i = 0; i < g.current_player_idx; i++) if (g.setup_chars[i]) taken.add(g.setup_chars[i]);
    const avail = CHARACTERS.filter(c => !taken.has(c));
    const pick = pickRandom(avail);
    g.setup_chars[g.current_player_idx] = pick;
    g.players[g.current_player_idx].character = pick;
    g.current_player_idx += 1;
    if (g.current_player_idx >= g.num_players) {
      assign_secrets(g.players); assign_clue_maps(g.players);
      g.current_player_idx = 0; g.secret_seen = false;
      g.phase = Phase.SECRET_DEAL;
    }

  } else if (g.phase === Phase.SECRET_DEAL) {
    g.current_player_idx += 1; g.secret_seen = false;
    if (g.current_player_idx >= g.players.length) g.phase = Phase.ROUND_START;

  } else if (g.phase === Phase.SPY_CHOOSE) {
    const p = g.current_player();
    const targets = g.alive_players.filter(t => t !== p);
    const options = [];
    for (const t of targets) for (let i = 0; i < SPY_OPTIONS.length; i++) if (p.can_spy_with(t.name, i)) options.push([t, i]);
    const [t, i] = options.length ? pickRandom(options) : [targets[0], 0];
    g.spy_target = t;
    const was = p.has_discovered(t.name);
    p.record_spy(t, i);
    const cl = p.clue_map[i];
    if (p.has_discovered(t.name) && !was) {
      g.spy_result = { result: "secret", target: t.name, secret_level: p.known_secrets[t.name] };
    } else if (cl && cl <= t.secret_level) {
      g.spy_result = { result: "clue", target: t.name };
    } else {
      g.spy_result = { result: "nothing", target: t.name };
    }
    g.phase = Phase.SPY_RESULT;

  } else if (g.phase === Phase.SPY_RESULT) {
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

  } else if (g.phase === Phase.BRIBE_CHOOSE) {
    const alive = g.alive_players;
    const p = alive[g.pending_bribe_idx];
    const others = alive.filter(t => t !== p);
    const known_targets = alive.filter(t => t !== p && p.has_discovered(t.name));

    const advBribe = () => {
      g.pending_bribe_idx += 1; g.bribe_recipient = null;
      g.bribe_target = null; g.bribe_mode = ""; g._bribe_action = "";
      for (const k of ["bribe_rec", "bribe_vtgt", "bribe_stgt"]) reset_carousel(k);
      if (g.pending_bribe_idx >= g.alive_players.length) {
        g.pending_vote_idx = 0; g.votes = {}; g.phase = Phase.VOTE;
      }
    };

    const roll = Math.random();
    if (known_targets.length && roll < 0.35) {
      do_bribe(p, pickRandom(others), pickRandom(known_targets), "secret");
    } else if (roll < 0.7) {
      do_bribe(p, pickRandom(others), pickRandom(alive), "vote");
    } // else: skip, do nothing
    advBribe();

  } else if (g.phase === Phase.VOTE) {
    const alive = g.alive_players;
    const p = alive[g.pending_vote_idx];
    const candidates = alive.filter(t => t !== p);
    const suspects = candidates
      .filter(t => p.has_discovered(t.name))
      .sort((a, b) => p.known_secrets[b.name] - p.known_secrets[a.name]);
    const target = (suspects.length && Math.random() < 0.7) ? suspects[0] : pickRandom(candidates);
    g.votes[p.name] = target.name;
    g.pending_vote_idx += 1;
    if (g.pending_vote_idx >= alive.length) {
      g.winner_candidate = g.check_winner(); g.phase = Phase.VOTE_RESULT;
    }

  } else if (g.phase === Phase.ACCUSE_CHOOSE) {
    const alive = g.alive_players;
    const p = alive[g.pending_accuse_idx];
    const accusable = alive.filter(t => t !== p && p.has_discovered(t.name));
    if (accusable.length && Math.random() < 0.6) {
      const target = accusable.slice().sort((a, b) => p.known_secrets[b.name] - p.known_secrets[a.name])[0];
      const lvl = p.known_secrets[target.name];
      g.current_accusation = [p, target, lvl];
      g.pending_accuse_idx += 1; g.accuse_target = null;
      reset_carousel("accuse"); g.phase = Phase.ACCUSE_RESPOND;
    } else {
      g.pending_accuse_idx += 1; g.accuse_target = null; reset_carousel("accuse");
      if (g.pending_accuse_idx >= alive.length) end_round(g);
    }

  } else if (g.phase === Phase.ACCUSE_RESPOND) {
    const [accuser, accused, acc_level] = g.current_accusation;
    const can_counter = accuser.name in accused.known_secrets;
    if (can_counter) {
      // Countering is never worse than accepting (worst case is the same
      // outcome — the accused is purged), so a rational bot always counters.
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
    } else {
      accused.alive = false;
      g.accuse_outcome = { lines: [`${accuser.name} accused ${accused.name}`, `${accused.name} accepts — PURGED.`] };
      g.phase = Phase.ACCUSE_OUTCOME;
    }
  }
}
