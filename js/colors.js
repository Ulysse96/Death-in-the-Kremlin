// ── Palette ──────────────────────────────────────────────────────────────
const W = 900, H = 680;

function rgb(r, g, b) { return `rgb(${r},${g},${b})`; }
function rgba(r, g, b, a) { return `rgba(${r},${g},${b},${a})`; }

const C_CRIMSON = rgb(180, 20, 20);
const C_DARK_RED = rgb(100, 8, 8);
const C_GOLD = rgb(210, 170, 50);
const C_CREAM = rgb(245, 235, 210);
const C_PARCHMENT = rgb(220, 205, 175);
const C_DARK = rgb(18, 12, 10);
const C_MID = rgb(55, 38, 30);
const C_PANEL = rgb(38, 25, 20);
const C_BORDER = rgb(100, 65, 40);
const C_GREEN = rgb(40, 100, 50);
const C_DARK_GRN = rgb(20, 60, 30);
const C_BLUE = rgb(40, 70, 130);
const C_DARK_BLU = rgb(20, 40, 90);
const C_PURPLE = rgb(80, 30, 100);
const C_GREY = rgb(130, 120, 110);
const C_ARROW = rgb(70, 50, 30);

const CHARACTERS = ["Marshal", "KGB Director", "Youth President", "Head Marxologist", "Lysenkoism Prof.", "Red Veteran"];
const SPY_OPTIONS = ["Wire the phone", "Search the trash cans", "Bribe a subordinate", "Intercept the mail", "Follow at night", "Break into the office"];
const SECRET_NAMES = { 1: "Deviant", 2: "Factious", 3: "Traitor" };
const SECRET_COLORS = { 1: C_GOLD, 2: C_CRIMSON, 3: C_PURPLE };
