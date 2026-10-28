import { SHIPS, LEVELS, SHOP_GEARS } from './config.js';
import { isLevelUnlocked } from './state.js';

export function saveData(progress, storage) {
    try {
        storage ??= globalThis.localStorage;
        storage.setItem('sc_v3_highscore', String(progress.highScore));
        storage.setItem('sc_v3_stars', String(progress.totalStarsCollected));
        storage.setItem('sc_v3_ship', String(progress.selectedShipIndex));
        storage.setItem('sc_v3_unlocked', String(progress.maxUnlockedLevel));
        storage.setItem('sc_v3_inf', String(progress.infiniteUnlocked));
        storage.setItem('sc_v3_currlvl', String(progress.currentLevelIndex));
        storage.setItem('sc_v3_gears', JSON.stringify(progress.gearInventory));
    } catch (e) {}
}

export function loadSavedData(progress, storage) {
    try {
        storage ??= globalThis.localStorage;
        const sHigh = storage.getItem('sc_v3_highscore');
        const sStars = storage.getItem('sc_v3_stars');
        const sShip = storage.getItem('sc_v3_ship');
        const sUnl = storage.getItem('sc_v3_unlocked');
        const sInf = storage.getItem('sc_v3_inf');
        const sCurr = storage.getItem('sc_v3_currlvl');
        const sGears = storage.getItem('sc_v3_gears');

        if (sHigh !== null) progress.highScore = Math.max(0, parseInt(sHigh, 10) || 0);
        if (sStars !== null) progress.totalStarsCollected = Math.max(0, parseInt(sStars, 10) || 0);
        if (sShip !== null) {
            const idx = parseInt(sShip, 10);
            if (idx >= 0 && idx < SHIPS.length) progress.selectedShipIndex = idx;
        }
        if (sUnl !== null) {
            const u = parseInt(sUnl, 10);
            if (!isNaN(u)) progress.maxUnlockedLevel = Math.max(1, Math.min(10, u));
        }
        if (sInf === 'true' || progress.maxUnlockedLevel >= 6) progress.infiniteUnlocked = true;
        if (sCurr !== null) {
            const c = parseInt(sCurr, 10);
            if (c >= 0 && c < LEVELS.length && isLevelUnlocked(progress, c)) {
                progress.currentLevelIndex = c;
            }
        }
        if (sGears) {
            const g = JSON.parse(sGears);
            if (g && typeof g === 'object') {
                progress.gearInventory = Object.fromEntries(SHOP_GEARS.map(({ id }) =>
                    [id, Math.max(0, parseInt(g[id], 10) || 0)]));
            }
        }
    } catch (e) {}
}
