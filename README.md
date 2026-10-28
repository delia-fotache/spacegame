# SpaceCollector

A canvas game written in plain HTML, CSS, and JavaScript ES modules. No build step or npm dependencies are required.

## Run locally

From this directory, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/>. ES modules require an HTTP server; opening the HTML directly with `file://` will not load the game correctly. `npm run dev` runs the same server if Node.js and npm are installed.

## Files

- `index.html`: canvas, HUD, and menu markup.
- `css/styles.css`: game and menu styles.
- `assets/ships/vulturul-de-foc.svg`: supplied Vulturul de Foc artwork, with its viewBox cropped to remove empty margins. Used in the hangar and during flight.
- `js/main.js`: initialization, module wiring, resizing, and animation loop.
- `js/config.js`: ships, levels, and shop gear definitions.
- `js/state.js`: factories for saved progress, run state, and input state.
- `js/game.js`: gameplay rules, progression, purchases, spawning, collisions, and animation updates.
- `js/renderer.js`: canvas drawing, without changing game state.
- `js/ui.js`: DOM updates, menus, and button listeners. Calls the actions supplied by `main.js`.
- `js/input.js`: keyboard, mouse, and touch listeners.
- `js/storage.js`: loading and saving the existing `sc_v3_*` localStorage format.
- `js/audio.js`: synthesized Web Audio sound effects.

The former `SpaceCollector - Joc Web.html` URL forwards to `index.html`. Existing saves are retained when the game is served from the same origin (scheme, host, and port). Saves from a different origin, including a previous `file://` session, are not automatically transferred.

Gameplay and buff durations retain the original frame-based timing. Decorative stars, particles, and floating text continue animating while paused, as in the original game.

On the final hit, the ship is replaced by a flash, expanding shockwave, and colored debris. Gameplay stops during the 54-frame explosion, then the game-over menu appears. The ship stays hidden until you start another run.

## Debug mode

In the main menu, turn on **🐞 MOD DEBUG**, then open **ALEGE NIVELUL** to play any of the ten campaign levels or Infinite Mode. A yellow DEBUG badge appears during play.

Debug mode bypasses level locks without permanently unlocking levels, including when you win. Scores, stars, gear usage, and level rewards still work normally. Turn it off in the main menu to restore normal level restrictions; a selected locked level falls back to Level 1. Debug mode turns off when you reload the page.
