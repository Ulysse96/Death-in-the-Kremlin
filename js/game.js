// ── Game data (mirrors the Python dataclasses / state machine) ─────────────

const Phase = {
  SETUP_PLAYERS: "SETUP_PLAYERS", SETUP_CHARS: "SETUP_CHARS", SECRET_DEAL: "SECRET_DEAL",
  ROUND_START: "ROUND_START", SPY_CHOOSE: "SPY_CHOOSE", SPY_METHOD: "SPY_METHOD", SPY_RESULT: "SPY_RESULT",
  BRIBE_CHOOSE: "BRIBE_CHOOSE", VOTE: "VOTE", VOTE_RESULT: "VOTE_RESULT",
  ACCUSE_CHOOSE: "ACCUSE_CHOOSE", ACCUSE_RESPOND: "ACCUSE_RESPOND", ACCUSE_OUTCOME: "ACCUSE_OUTCOME",
  GAME_OVER: "GAME_OVER",
};

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function randSample(arr, k) {
  return shuffleInPlace(arr.slice()).slice(0, k);
}

class Player {
  constructor(name) {
    this.name = name;
    this.character = "";
    this.secret_level = 0;
    this.alive = true;
    this.clue_map = {};          // {methodIndex: clueLevel}
    this.clues_found = {};       // {targetName: Set<clueLevel>}
    this.known_secrets = {};     // {targetName: secretLevel}
    this.spy_log = new Set();    // "targetName|methodIndex"
    this.bribe_inbox = [];
  }

  has_discovered(n) { return Object.prototype.hasOwnProperty.call(this.known_secrets, n); }
  can_spy_with(n, i) { return !this.spy_log.has(n + "|" + i); }

  record_spy(target, i) {
    this.spy_log.add(target.name + "|" + i);
    const cl = this.clue_map[i];
    if (cl) {
      if (!this.clues_found[target.name]) this.clues_found[target.name] = new Set();
      this.clues_found[target.name].add(cl);
      const needed = target.secret_level + 1; // Deviant=2, Factious=3, Traitor=4
      if (this.clues_found[target.name].size >= needed) {
        this.known_secrets[target.name] = target.secret_level;
      }
    }
  }
}

class Game {
  constructor() {
    this.players = [];
    this.phase = Phase.SETUP_PLAYERS;
    this.round = 1;
    this.current_player_idx = 0;
    this.votes = {};
    this.current_accusation = null; // [accuser, accused, level]
    this.accuse_outcome = {};
    this.pending_bribe_idx = 0;
    this.pending_vote_idx = 0;
    this.pending_accuse_idx = 0;
    this.spy_target = null;
    this.spy_result = null;
    this.bribe_mode = "";
    this.bribe_recipient = null;
    this.bribe_target = null;
    this._bribe_action = "";
    this.winner = null;
    this.winner_candidate = null;
    this.secret_seen = false;
    this.accuse_target = null;
    // setup state
    this.num_players = 4;
    this.setup_names = ["Beria", "Khrushchev", "Molotov", "Malenkov", "", ""];
    this.setup_chars = [null, null, null, null, null, null];
    this.active_input = -1;
  }

  get alive_players() { return this.players.filter(p => p.alive); }
  current_player() {
    const a = this.alive_players;
    return a.length ? a[this.current_player_idx % a.length] : null;
  }
  player(name) { return this.players.find(p => p.name === name) || null; }
  vote_tally() {
    const t = {};
    for (const v of Object.values(this.votes)) t[v] = (t[v] || 0) + 1;
    return t;
  }
  check_winner() {
    const a = this.alive_players;
    if (a.length === 1) return a[0];
    const total = a.length;
    const t = this.vote_tally();
    for (const [n, cnt] of Object.entries(t)) {
      if (cnt / total > 0.5) {
        const p = this.player(n);
        if (p && p.alive) return p;
      }
    }
    return null;
  }
}

function assign_secrets(players) {
  const n = players.length;
  const traitors = Math.max(1, Math.floor(n / 4));
  const factious = Math.max(1, Math.floor(n / 3));
  const deviants = n - traitors - factious;
  const pool = [];
  for (let i = 0; i < traitors; i++) pool.push(3);
  for (let i = 0; i < factious; i++) pool.push(2);
  for (let i = 0; i < deviants; i++) pool.push(1);
  shuffleInPlace(pool);
  players.forEach((p, i) => { p.secret_level = pool[i]; });
}

function assign_clue_maps(players) {
  for (const p of players) {
    const needed = p.secret_level + 1; // Deviant=2, Factious=3, Traitor=4
    const indices = randSample([0, 1, 2, 3, 4, 5], needed);
    const levels = shuffleInPlace(Array.from({ length: needed }, (_, i) => i + 1));
    p.clue_map = {};
    indices.forEach((idx, i) => { p.clue_map[idx] = levels[i]; });
  }
}

function do_bribe(p, recipient, target, mode) {
  if (mode === "vote") {
    let bl = "";
    if (p.has_discovered(recipient.name)) bl = "Lv" + p.known_secrets[recipient.name];
    recipient.bribe_inbox.push({ type: "vote", target: target.name, blackmail: bl });
  } else if (mode === "secret") {
    const lvl = p.known_secrets[target.name];
    recipient.bribe_inbox.push({ type: "secret", target: target.name, level: lvl });
    if (!recipient.clues_found[target.name]) recipient.clues_found[target.name] = new Set();
    for (let l = 1; l <= target.secret_level + 1; l++) recipient.clues_found[target.name].add(l);
    recipient.known_secrets[target.name] = target.secret_level;
  }
}

function end_round(g) {
  const a = g.alive_players;
  if (a.length <= 1) { g.winner = a[0] || null; g.phase = Phase.GAME_OVER; return; }
  const w = g.check_winner();
  if (w) { g.winner = w; g.phase = Phase.GAME_OVER; return; }
  g.round += 1; g.current_player_idx = 0; g.pending_bribe_idx = 0;
  g.pending_vote_idx = 0; g.pending_accuse_idx = 0; g.votes = {};
  g.spy_target = null; g.spy_result = null; g.bribe_mode = ""; g._bribe_action = "";
  for (const p of g.players) p.bribe_inbox = [];
  g.phase = Phase.ROUND_START;
}
