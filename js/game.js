import { SHIPS, LEVELS, SHOP_GEARS } from './config.js';
import { createSavedState, isLevelUnlocked, canPlayLevel } from './state.js';
import { createBoss, fireWeapon, updateBoss } from './boss.js';

export function createGame({ progress, run, input, viewport, notify = () => {} }) {
    function useGear(id) {
        if (run.mode !== 'PLAYING' || !SHOP_GEARS.some(gear => gear.id === id)) return;
        if ((progress.gearInventory[id] || 0) <= 0) {
            notify('toast', 'Nu mai ai acest Gear în inventar! Cumpără din Shop 🛒');
            return;
        }

        if (id === 'rapid' && !run.boss) {
            notify('toast', 'Foc Rapid poate fi folosit când apare bossul.');
            return;
        }
        if (['slow', 'rapid', 'double'].includes(id)) {
            progress.gearInventory[id]--;
            run.activeBuffs[id] = id === 'slow' ? 480 : 600;
            notify('sound', 'gear');
            notify('toast', SHOP_GEARS.find(gear => gear.id === id).name + ' activat!');
        } else if (id === 'magnet') {
            progress.gearInventory.magnet--;
            run.activeBuffs.magnet = 480; // 8 secunde la 60fps
            notify('sound', 'gear');
            notify('toast', '🧲 Magnet Cosmic Activat (8s)!');
        } else if (id === 'shield') {
            progress.gearInventory.shield--;
            run.activeBuffs.shield = 480; // 8 secunde
            notify('sound', 'gear');
            notify('toast', '🛡️ Scut Energetic Activat (8s)!');
        } else if (id === 'nova') {
            progress.gearInventory.nova--;
            run.activeBuffs.turbo = 360; // 6 secunde
            notify('sound', 'gear');
            // Distruge toți meteoriții de pe ecran
            let bonus = 0;
            run.meteors.forEach(m => {
                createParticles(m.x, m.y, '#f97316', 14);
                bonus += 10;
            });
            run.meteors = [];
            if (bonus > 0) {
                addScore(bonus);
                addFloatingText(run.player.x, run.player.y - 30, `⚡ SUPERNOVA +${bonus}p!`, '#facc15');
            } else {
                notify('toast', '⚡ Turbo & Supernova Activate!');
            }
        } else if (id === 'repair') {
            if (run.lives >= 3) {
                notify('toast', 'Ai deja numărul maxim de 3 vieți ❤️!');
                return;
            }
            progress.gearInventory.repair--;
            run.lives = Math.min(3, run.lives + 1);
            notify('toast', 'Kit de reparație folosit: +1 viață!');
            notify('sound', 'gear');
            createParticles(run.player.x, run.player.y, '#ef4444', 18);
            addFloatingText(run.player.x, run.player.y - 25, '+1 VIAȚĂ ❤️', '#f87171');
            notify('hud');
        }

        notify('save');
        notify('hotbar');
    }

    function startSelectedLevel(difficulty) {
        if (!canPlayLevel(progress, progress.currentLevelIndex, run.debugMode)) return;
        if (LEVELS[progress.currentLevelIndex].isInfinite) {
            if (!['easy', 'medium', 'hard'].includes(difficulty)) {
                run.mode = 'DIFFICULTY';
                notify('screen');
                return;
            }
            run.infiniteDifficulty = difficulty;
        }
        run.score = 0;
        run.lives = 3;
        run.frameCount = 0;
        run.runStarsEarned = 0;
        run.collectibles = [];
        run.meteors = [];
        run.boss = LEVELS[progress.currentLevelIndex].num === 10 ? createBoss(viewport, 10) : null;
        run.shots = [];
        run.shotCooldown = 0;
        input.firing = false;
        run.particles = [];
        run.floatingTexts = [];
        run.shipExplosion = null;
        run.activeBuffs = { magnet: 0, shield: 0, turbo: 0, slow: 0, rapid: 0, double: 0 };

        run.player.x = viewport.width / 2;
        run.player.y = viewport.height * 0.72;
        input.targetX = null;
        input.targetY = null;
        run.player.invulnerableTimer = 60;
        run.player.destroyed = false;

        run.mode = 'PLAYING';
        run.victory = null;
        notify('screen');
        notify('hud');
        notify('hotbar');
    }

    function addScore(pts) {
        if (run.activeBuffs.double > 0) pts *= 2;
        run.score += pts;
        if (run.score > progress.highScore) {
            progress.highScore = run.score;
        }
        const lvl = LEVELS[progress.currentLevelIndex] || LEVELS[0];
        notify('hud');
        if (!lvl.isInfinite && !run.boss && run.score >= lvl.target && run.mode === 'PLAYING') {
            run.boss = createBoss(viewport, lvl.num);
            run.meteors = [];
            run.collectibles = [];
            run.shots = [];
            run.shotCooldown = 0;
            run.player.y = Math.max(run.player.y, viewport.height * 0.72);
            run.player.invulnerableTimer = Math.max(120, run.player.invulnerableTimer);
            input.targetX = null;
            input.targetY = null;
            notify('toast', 'A apărut bossul! Ține apăsat SPAȚIU sau FOC pentru a trage.');
            notify('screen');
            notify('hud');
        }
    }

    function goToNextLevel() {
        const nextIndex = progress.currentLevelIndex < 9
            ? progress.currentLevelIndex + 1
            : 10; // Modul Infinit
        if (selectLevel(nextIndex)) startSelectedLevel();
    }

    function initBackgroundSpace() {
        run.bgStars = [];
        const count = Math.floor((viewport.width * viewport.height) / 9000);
        for (let i = 0; i < count; i++) {
            run.bgStars.push({
                x: Math.random() * viewport.width,
                y: Math.random() * viewport.height,
                size: Math.random() * 2.2 + 0.6,
                speed: Math.random() * 1.4 + 0.3,
                alpha: Math.random() * 0.7 + 0.3
            });
        }
    }

    function createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4.5 + 1;
            run.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3.5 + 1.5,
                color,
                alpha: 1
            });
        }
    }

    function addFloatingText(x, y, text, color) {
        run.floatingTexts.push({ x, y, text, color, alpha: 1, vy: -1.4 });
    }

    // Spawning Obiecte & Meteoriți
    function spawnEntities() {
        const lvl = LEVELS[progress.currentLevelIndex] || LEVELS[0];

        // Stele și Inimi
        if (run.frameCount % 42 === 0) {
            const rand = Math.random();
            let type = 'gold';
            if (rand < 0.05 && run.lives < 3) {
                type = 'heart';
            } else if (rand < 0.05 + lvl.blueChance) {
                type = 'blue';
            }
            run.collectibles.push({
                x: Math.random() * (viewport.width - 50) + 25,
                y: -25,
                radius: type === 'blue' ? 17 : 14,
                speed: Math.random() * 1.8 + 2.2,
                type,
                angle: 0
            });
        }

        // Meteoriți în funcție de dificultatea nivelului
        if (run.boss) return;
        const dynamicSpawnRate = lvl.isInfinite
            ? Math.max(13, lvl.spawnRate - Math.floor(run.score / 250))
            : lvl.spawnRate;

        const meteorLimit = lvl.num === 10 ? 6 : Infinity;
        if (run.frameCount % dynamicSpawnRate === 0 && run.meteors.length < meteorLimit) {
            const isApocalypse = lvl.style === 'apocalypse';
            const isChaos = lvl.style === 'chaos';
            const isComet = lvl.style === 'comet';

            let radius = Math.random() * 14 + 16;
            if (isChaos) radius = Math.random() * 26 + 12;
            if (isApocalypse) radius = Math.random() * 24 + 20;

            const startX = Math.random() * (viewport.width - 40) + 20;
            let vx = (Math.random() - 0.5) * 1.8;
            let vy = lvl.meteorSpeed + Math.random() * 1.8;
            if (lvl.isInfinite) vy += Math.min(4, run.score / 500);

            // La nivelul 8 și 10 meteoriții își orientează traiectoria spre poziția navei
            if (isComet || isApocalypse) {
                const dx = run.player.x - startX;
                const dy = Math.max(150, run.player.y);
                vx = (dx / dy) * (vy * 0.65);
            }

            // Ease players into the early levels, including the random speed boost.
            const speedScale = lvl.isInfinite
                ? { easy: 0.45, medium: 0.85, hard: 1.4 }[run.infiniteDifficulty]
                : lvl.num === 10 ? 0.69 : Math.min(1, 0.65 + (lvl.num - 1) * 0.05);
            vx *= speedScale;
            vy *= speedScale;

            run.meteors.push({
                x: startX,
                y: -radius - 10,
                radius,
                vx,
                vy,
                angle: 0,
                rotSpeed: (Math.random() - 0.5) * 0.08,
                style: lvl.style
            });
        }
    }

    // Update Logică Joc
    function updateGame() {
        if (run.mode !== 'PLAYING') return;
        const bossAtFrameStart = run.boss;
        run.frameCount++;
        for (const id of ['slow', 'rapid', 'double']) {
            if (run.activeBuffs[id] > 0 && --run.activeBuffs[id] === 0) notify('hotbar');
        }

        // Scădere timere buff-uri
        if (run.activeBuffs.magnet > 0) {
            run.activeBuffs.magnet--;
            if (run.activeBuffs.magnet === 0) notify('hotbar');
        }
        if (run.activeBuffs.shield > 0) {
            run.activeBuffs.shield--;
            if (run.activeBuffs.shield === 0) notify('hotbar');
        }
        if (run.activeBuffs.turbo > 0) {
            run.activeBuffs.turbo--;
            if (run.activeBuffs.turbo === 0) notify('hotbar');
        }
        if (run.player.invulnerableTimer > 0) run.player.invulnerableTimer--;

        const currentSpeed = run.activeBuffs.turbo > 0 ? run.player.baseSpeed * 1.55 : run.player.baseSpeed;

        // Mișcare din tastatură
        let moveX = 0;
        let moveY = 0;
        if (input.keys['arrowleft'] || input.keys['a']) moveX -= 1;
        if (input.keys['arrowright'] || input.keys['d']) moveX += 1;
        if (input.keys['arrowup'] || input.keys['w']) moveY -= 1;
        if (input.keys['arrowdown'] || input.keys['s']) moveY += 1;

        if (moveX !== 0 || moveY !== 0) {
            input.targetX = null;
            input.targetY = null;
            const len = Math.hypot(moveX, moveY);
            run.player.x += (moveX / len) * currentSpeed;
            run.player.y += (moveY / len) * currentSpeed;
        } else if (input.targetX !== null && input.targetY !== null) {
            const dx = input.targetX - run.player.x;
            const dy = input.targetY - run.player.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 4) {
                const step = Math.min(dist, currentSpeed * 1.35);
                run.player.x += (dx / dist) * step;
                run.player.y += (dy / dist) * step;
            }
        }

        // Limitare navă în ecran
        run.player.x = Math.max(run.player.radius, Math.min(viewport.width - run.player.radius, run.player.x));
        run.player.y = Math.max(run.player.radius + 50, Math.min(viewport.height - run.player.radius - 70, run.player.y));

        spawnEntities();
        if (run.boss) {
            updateBoss(run, viewport, shot => {
                createParticles(shot.x, shot.y, shot.color, 5);
                notify('hud');
            }, () => {
                createParticles(run.boss.x, run.boss.y, '#fb923c', 65);
                run.meteors = [];
                run.shots = [];
                if (LEVELS[progress.currentLevelIndex].num === 10) addScore(3000);
                triggerLevelVictory();
            });
            if (run.mode !== 'PLAYING') return;
            if (input.keys[' '] || input.firing) shoot();
            if (run.player.y < run.boss.y + 100) run.player.y = run.boss.y + 100;
        }

        // Colectabile
        for (let i = run.collectibles.length - 1; i >= 0; i--) {
            const c = run.collectibles[i];
            c.angle += 0.05;

            // Efect Magnet Cosmic
            if (run.activeBuffs.magnet > 0 && (c.type === 'gold' || c.type === 'blue')) {
                const dx = run.player.x - c.x;
                const dy = run.player.y - c.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 1) {
                    c.x += (dx / dist) * 8.5;
                    c.y += (dy / dist) * 8.5;
                }
            } else {
                c.y += c.speed;
            }

            // Coliziune cu nava
            const dist = Math.hypot(run.player.x - c.x, run.player.y - c.y);
            if (dist < run.player.radius + c.radius) {
                if (c.type === 'gold') {
                    progress.totalStarsCollected += 1;
                    run.runStarsEarned += 1;
                    addScore(10);
                    notify('sound', 'star');
                    createParticles(c.x, c.y, '#facc15', 10);
                    addFloatingText(c.x, c.y, '+10p | +1 ⭐', '#facc15');
                } else if (c.type === 'blue') {
                    progress.totalStarsCollected += 5;
                    run.runStarsEarned += 5;
                    addScore(50);
                    notify('sound', 'bluestar');
                    createParticles(c.x, c.y, '#38bdf8', 16);
                    addFloatingText(c.x, c.y, '+50p | +5 ⭐', '#38bdf8');
                } else if (c.type === 'heart') {
                    run.lives = Math.min(3, run.lives + 1);
                    notify('sound', 'gear');
                    createParticles(c.x, c.y, '#f43f5e', 14);
                    addFloatingText(c.x, c.y, '+1 VIAȚĂ ❤️', '#f43f5e');
                }
                notify('save');
                notify('hud');
                run.collectibles.splice(i, 1);
                // The boss transition clears the arrays being iterated.
                // Continue the new battle on the next animation frame.
                if (run.boss !== bossAtFrameStart) return;
                continue;
            }

            if (c.y > viewport.height + 40) {
                run.collectibles.splice(i, 1);
            }
        }

        // Meteoriți
        for (let i = run.meteors.length - 1; i >= 0; i--) {
            const m = run.meteors[i];
            const timeScale = run.activeBuffs.slow > 0 ? 0.5 : 1;
            m.x += m.vx * timeScale;
            m.y += m.vy * timeScale;
            m.angle += m.rotSpeed;

            const dist = Math.hypot(run.player.x - m.x, run.player.y - m.y);
            const hitRadius = run.activeBuffs.shield > 0 ? run.player.radius + 12 : run.player.radius * 0.82;

            if (dist < hitRadius + m.radius) {
                if (run.activeBuffs.shield > 0) {
                    createParticles(m.x, m.y, '#38bdf8', 14);
                    addScore(15);
                    notify('sound', 'star');
                    addFloatingText(m.x, m.y, '🛡️ +15p', '#38bdf8');
                    run.meteors.splice(i, 1);
                    if (run.boss !== bossAtFrameStart) return;
                    continue;
                } else if (run.player.invulnerableTimer <= 0) {
                    run.lives--;
                    run.meteors.splice(i, 1);
                    notify('hud');
                    if (run.lives <= 0) {
                        destroyShip();
                        return;
                    }
                    run.player.invulnerableTimer = 75;
                    notify('sound', 'hit');
                    createParticles(run.player.x, run.player.y, '#ef4444', 22);
                    addFloatingText(run.player.x, run.player.y - 20, '-1 ❤️', '#ef4444');
                    continue;
                }
            }

            if (m.y > viewport.height + 60 || m.x < -60 || m.x > viewport.width + 60) {
                run.meteors.splice(i, 1);
            }
        }
    }

    function showMainMenu() {
        run.mode = 'MENU';
        run.shipExplosion = null;
        notify('screen');
    }

    function pauseGame() {
        if (run.mode !== 'PLAYING') return;
        run.mode = 'PAUSED';
        input.targetX = null;
        input.targetY = null;
        notify('screen');
    }

    function resumeGame() {
        if (run.mode !== 'PAUSED') return;
        run.mode = 'PLAYING';
        notify('screen');
    }

    function togglePauseGame() {
        if (run.mode === 'PLAYING') pauseGame();
        else if (run.mode === 'PAUSED') resumeGame();
    }

    function exitToMenuFromPause() {
        notify('save');
        showMainMenu();
    }

    function triggerLevelVictory() {
        run.mode = 'VICTORY';
        notify('sound', 'win');
        const lvl = LEVELS[progress.currentLevelIndex];
        const reward = lvl.reward || 0;
        progress.totalStarsCollected += reward;
        run.victory = { reward, unlockedLevel: null, unlockedInfinite: false };

        if (!run.debugMode) {
            if (lvl.num === 5) {
                run.victory.unlockedInfinite = !progress.infiniteUnlocked || progress.maxUnlockedLevel < 6;
                progress.infiniteUnlocked = true;
                if (progress.maxUnlockedLevel < 6) progress.maxUnlockedLevel = 6;
            } else if (lvl.num < 10 && lvl.num >= progress.maxUnlockedLevel) {
                progress.maxUnlockedLevel = lvl.num + 1;
                run.victory.unlockedLevel = progress.maxUnlockedLevel;
            }
        }

        notify('save');
        notify('hud');
        notify('screen');
    }

    function destroyShip() {
        if (run.player.destroyed) return;
        run.player.destroyed = true;
        run.player.invulnerableTimer = 0;
        run.mode = 'EXPLODING';
        input.targetX = null;
        input.targetY = null;

        const { x, y } = run.player;
        const duration = 54;
        run.shipExplosion = { x, y, frame: 0, duration };
        const ship = SHIPS[progress.selectedShipIndex] || SHIPS[0];
        const colors = ['#fff7cc', '#facc15', '#f97316', '#ef4444', ship.primary];
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 1.5;
            run.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 4 + 1.5,
                color: colors[i % colors.length],
                alpha: 1,
                fade: 1 / duration,
            });
        }

        notify('sound', 'explosion');
        notify('save');
        notify('screen');
    }

    function selectShip(index) {
        if (!Number.isInteger(index) || !SHIPS[index]) return false;
        progress.selectedShipIndex = index;
        notify('save');
        return true;
    }

    function selectLevel(index) {
        if (!canPlayLevel(progress, index, run.debugMode)) return false;
        progress.currentLevelIndex = index;
        notify('save');
        return true;
    }

    function toggleDebugMode() {
        if (run.mode !== 'MENU') return;
        run.debugMode = !run.debugMode;
        if (!run.debugMode && !isLevelUnlocked(progress, progress.currentLevelIndex)) {
            progress.currentLevelIndex = 0;
            notify('save');
        }
        notify('screen');
    }

    function buyGear(id) {
        const gear = SHOP_GEARS.find(gear => gear.id === id);
        if (!gear) return false;
        if (progress.totalStarsCollected < gear.cost) {
            notify('toast', 'Nu ai suficiente stele ⭐!');
            return false;
        }
        progress.totalStarsCollected -= gear.cost;
        progress.gearInventory[id] = (progress.gearInventory[id] || 0) + 1;
        notify('sound', 'gear');
        notify('save');
        notify('hotbar');
        return true;
    }

    function resetProgress() {
        Object.assign(progress, createSavedState());
        notify('save');
    }

    // These animations also run in menus and while paused, as in the original.
    function updateEffects() {
        for (const star of run.bgStars) {
            star.y += run.mode === 'PLAYING'
                ? star.speed * (run.activeBuffs.turbo > 0 ? 2.2 : 1)
                : star.speed * 0.4;
            if (star.y > viewport.height) {
                star.y = 0;
                star.x = Math.random() * viewport.width;
            }
        }
        for (let i = run.particles.length - 1; i >= 0; i--) {
            const particle = run.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.alpha -= particle.fade ?? 0.028;
            if (particle.alpha <= 0) run.particles.splice(i, 1);
        }
        for (let i = run.floatingTexts.length - 1; i >= 0; i--) {
            const text = run.floatingTexts[i];
            text.y += text.vy;
            text.alpha -= 0.022;
            if (text.alpha <= 0) run.floatingTexts.splice(i, 1);
        }

        // Let the destruction finish before the game-over card covers it.
        if (run.mode === 'EXPLODING' && run.shipExplosion) {
            run.shipExplosion.frame++;
            if (run.shipExplosion.frame >= run.shipExplosion.duration) {
                run.shipExplosion = null;
                run.mode = 'GAMEOVER';
                notify('screen');
            }
        }
    }

    function shoot() {
        fireWeapon(run, SHIPS[progress.selectedShipIndex] || SHIPS[0]);
    }

    return {
        shoot,
        startSelectedLevel, showMainMenu, togglePauseGame, resumeGame,
        exitToMenuFromPause, goToNextLevel, useGear, selectShip, selectLevel,
        buyGear, resetProgress, toggleDebugMode, initBackgroundSpace, updateGame, updateEffects,
    };
}
