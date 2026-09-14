# Death in the Kremlin

A hot-seat social-deduction party game for 4–6 players, passed around a single
device. Everyone is a member of the Politburo; some are secretly Deviants,
Factious elements, or outright Traitors. Spy on your comrades, send anonymous
messages, vote, and accuse — survive until you command a majority.

This is a **mobile web port** (HTML5 Canvas + vanilla JavaScript, no build
step, no dependencies) of the original Python/Pygame prototype, which is kept
for reference in [`original-pygame/`](original-pygame/). Pygame is a desktop
library, so it can't run on a phone; this port reproduces the same game 1:1
— data model, phases, and hand-drawn portrait/icon art — directly in a
`<canvas>` so it plays in any mobile browser with a proper on-screen keyboard
for name entry and touch-friendly controls.

## Play it

Just open `index.html` in a browser, or serve the folder with any static file
server, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000 on your phone (same network) or desktop
```

No build step, no npm install — it's plain HTML/CSS/JS.

The game is designed landscape (it's meant to be laid on a table and passed
around). On a phone held in portrait it shows a "rotate your phone" prompt.

## Solo mode (play against bots)

To test or tweak the game alone, use the **🎮 Solo — moi + des bots** button
on the setup screen: it marks every player but the first as a bot and
prefills their names. You can also toggle any individual player between
🧑 human and 🤖 bot with the small button next to their name field, and mix
humans and bots freely (e.g. 2 humans + 2 bots).

Bots play every phase on their own — character pick, espionage, anonymous
messages, votes, and accusations — with simple but coherent heuristics (they
target players whose secrets they've uncovered, always counter-accuse when
they can, occasionally leak intel or send voting instructions). Each bot
decision fires about 650ms after it becomes their turn, so you can follow
along on screen; taps are ignored while a bot is "thinking" to avoid racing
its scheduled move. The turn-taking logic lives in
[`js/bots.js`](js/bots.js).

## Project structure

```
index.html          entry point, canvas + DOM overlay for name inputs
css/style.css        mobile-first styling, rotate prompt
js/colors.js         palette & shared constants
js/portraits.js      canvas ports of the 6 hand-drawn character portraits
js/spyicons.js       canvas ports of the 6 espionage method icons
js/game.js           game data model & rules (Player, Game, phases, scoring)
js/ui.js             button/panel/carousel drawing + touch hit-testing
js/screens.js        one draw function per game phase
js/bots.js           bot AI: decisions + auto-play scheduling for solo mode
js/main.js           render loop, touch input, responsive scaling
original-pygame/     the original desktop Pygame prototype (reference only)
```

## How the game works

- **Setup**: 4–6 players enter names and each picks a unique character.
- **Secret dossier**: each player privately learns their secret allegiance —
  Deviant, Factious, or Traitor (higher levels need more clues to expose).
- Each round:
  1. **Espionage** — every player secretly picks a target and a spying
     method; methods can't be reused against the same target.
  2. **Anonymous message** — send a voting instruction or leak a secret you
     know, anonymously, to one other player.
  3. **Public vote** — everyone votes; a majority (>50% of the living)
     elects a winner and ends the game immediately.
  4. **Accusations** — anyone who has fully uncovered another player's
     secret may publicly accuse them; the accused can counter-accuse if they
     know the accuser's secret, and whoever holds the lower level is purged.
- The game ends when one player remains or someone wins a majority vote.

## The cast

Six Soviet animals, drawn entirely with Canvas 2D primitives — no image
assets:

| Character | Who they are |
| --- | --- |
| Marshal | a hound in a peaked cap, chest full of ribbons |
| KGB Director | a grey wolf in a trench coat and fedora |
| Youth President | an eager fox in pioneer uniform and pilotka |
| Head Marxologist | a bespectacled ape with a scholar's beard |
| Happiness Minister | a beaming rabbit in a red-starred ushanka |
| Red Veteran | an old walrus in a papakha, tusks and medals |

## Notes on the port

The palette, the screen layouts and the six spy-method icons are direct
translations of the Pygame drawing calls into the Canvas 2D API. Two things
deliberately differ from the original prototype:

- **The portraits were redrawn.** The Pygame versions were flat colour
  fills; the web ones use gradients, outlines, eye highlights and a shared
  bust construction so the cast reads as one set with consistent lighting.
  The original's Lysenkoism Prof. (a heron) was replaced by the Happiness
  Minister (a rabbit in a chapka).
- **Name entry uses real `<input>` elements** overlaid on the canvas, so
  mobile browsers show a proper keyboard instead of the Pygame version's
  hand-rolled text cursor.

The canvas keeps a 900×680 logical coordinate system but its backing store
is sized to the device pixel ratio, so the art stays sharp on phone screens.
