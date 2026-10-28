import { createSavedState, createRunState, createInputState } from './state.js';
import { loadSavedData, saveData } from './storage.js';
import { createGame } from './game.js';
import { createRenderer } from './renderer.js';
import { createUI } from './ui.js';
import { bindInput } from './input.js';
import { playSound } from './audio.js';

const canvas = document.getElementById('gameCanvas');
const progress = createSavedState();
const run = createRunState();
const input = createInputState();
const viewport = { width: 800, height: 600 };

loadSavedData(progress);

// This is the only place that connects gameplay to storage, audio, and the DOM.
const game = createGame({ progress, run, input, viewport, notify });
const ui = createUI({
    progress,
    run,
    actions: { ...game, restartFromPause: game.startSelectedLevel },
});
const renderer = createRenderer({ canvas, progress, run });

function notify(type, value) {
    switch (type) {
        case 'save': saveData(progress); break;
        case 'sound': playSound(value); break;
        case 'toast': ui.showToast(value); break;
        case 'hud': ui.updateHUD(); break;
        case 'hotbar': ui.updateGearHotbarUI(); break;
        case 'screen': ui.renderScreen(); break;
    }
}

function resizeCanvas() {
    canvas.width = viewport.width = Math.max(320, window.innerWidth || 800);
    canvas.height = viewport.height = Math.max(480, window.innerHeight || 600);
    game.initBackgroundSpace();
}

function gameLoop() {
    game.updateGame();
    game.updateEffects();
    renderer.renderScene();
    requestAnimationFrame(gameLoop);
}

bindInput({ canvas, input, run, actions: game });
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
ui.renderScreen();
ui.updateGearHotbarUI();
requestAnimationFrame(gameLoop);
