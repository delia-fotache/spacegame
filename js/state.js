import { LEVELS } from './config.js';

export function createSavedState() {
    return {
        highScore: 0,
        totalStarsCollected: 0,
        selectedShipIndex: 0,
        maxUnlockedLevel: 1,
        infiniteUnlocked: false,
        currentLevelIndex: 0,
        gearInventory: { magnet: 1, shield: 1, nova: 0, repair: 0, slow: 0, rapid: 0, double: 0 },
    };
}

export function createRunState() {
    return {
        mode: 'MENU',
        debugMode: false,
        infiniteDifficulty: 'medium',
        score: 0,
        lives: 3,
        frameCount: 0,
        runStarsEarned: 0,
        player: {
            x: 200,
            y: 400,
            radius: 22,
            baseSpeed: 4.6,
            invulnerableTimer: 0,
            destroyed: false,
        },
        activeBuffs: { magnet: 0, shield: 0, turbo: 0, slow: 0, rapid: 0, double: 0 },
        bgStars: [],
        collectibles: [],
        meteors: [],
        boss: null,
        shots: [],
        shotCooldown: 0,
        particles: [],
        floatingTexts: [],
        shipExplosion: null,
        victory: null,
    };
}

export function createInputState() {
    return { keys: {}, targetX: null, targetY: null };
}

export function isLevelUnlocked(progress, index) {
    const level = LEVELS[index];
    if (!level) return false;
    return level.isInfinite
        ? progress.infiniteUnlocked
        : level.num <= progress.maxUnlockedLevel;
}

export function canPlayLevel(progress, index, debugMode = false) {
    return Number.isInteger(index) && Boolean(LEVELS[index])
        && (debugMode || isLevelUnlocked(progress, index));
}
