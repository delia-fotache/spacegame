import { SHIPS, LEVELS, SHOP_GEARS } from './config.js';
import { canPlayLevel } from './state.js';

export function createUI({ progress, run, actions }) {
    let shopReturnScreen = 'menu';
    const gearOrder = ['magnet', 'shield', 'nova', 'repair', 'slow', 'rapid', 'double'];
    const shortNames = { magnet: 'Magnet', shield: 'Scut', nova: 'Supernova', repair: 'Reparație', slow: 'Timp lent', rapid: 'Foc rapid', double: 'Puncte x2' };
    document.getElementById('gearHotbar').innerHTML = gearOrder.map((id, index) => {
        const gear = SHOP_GEARS.find(item => item.id === id);
        return `<button type="button" class="gear-slot" id="slot-${id}" data-action="useGear" data-value="${id}" title="${gear.name}: ${gear.desc}">
            <span class="gear-key">${index + 1}</span><span class="gear-icon">${gear.icon}</span>
            <span class="gear-name-mini">${shortNames[id]}</span><span class="gear-count" id="count-${id}">0</span>
        </button>`;
    }).join('');

    function showToast(msg) {
        const toast = document.getElementById('toastMsg');
        toast.textContent = msg;
        toast.style.opacity = '1';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }

    // Actualizare Interfață Meniu
    function updateMenuUI() {
        document.getElementById('menuHighScore').textContent = progress.highScore;
        document.getElementById('menuTotalStars').textContent = progress.totalStarsCollected + ' ⭐';
        const lvl = LEVELS[progress.currentLevelIndex] || LEVELS[0];
        document.getElementById('menuCurrLevel').textContent = lvl.isInfinite ? 'Infinit ♾️' : ('Nivel ' + lvl.num);
        renderShipSelector();
    }

    function renderShipSelector() {
        const container = document.getElementById('shipSelectorGrid');
        container.innerHTML = '';
        SHIPS.forEach((ship, idx) => {
            const btn = document.createElement('button');
            btn.className = 'ship-btn' + (idx === progress.selectedShipIndex ? ' selected' : '');
            const graphic = ship.image
                ? `<img class="ship-image" src="${ship.image}" alt="" draggable="false">`
                : `<span class="ship-emoji">${ship.emoji}</span>`;
            btn.innerHTML = `${graphic}<span class="ship-name">${ship.name}</span>`;
            btn.addEventListener('click', () => {
                actions.selectShip(idx);
                renderShipSelector();
            });
            container.appendChild(btn);
        });
    }

    // Modal Nivele
    function openLevelModal() {
        document.getElementById('levelModalSubtitle').textContent = run.debugMode
            ? 'Mod debug activ: toate cele 10 niveluri și Modul Infinit ♾️ sunt disponibile.'
            : 'Termină Nivelul 5 pentru a debloca Modul Infinit ♾️ și Nivelele 6 - 10!';
        renderLevelList();
        document.getElementById('mainMenuModal').classList.add('hidden');
        document.getElementById('levelModal').classList.remove('hidden');
    }

    function closeLevelModal() {
        document.getElementById('levelModal').classList.add('hidden');
        document.getElementById('mainMenuModal').classList.remove('hidden');
        updateMenuUI();
    }

    function renderLevelList() {
        const list = document.getElementById('levelListContainer');
        list.innerHTML = '';
        LEVELS.forEach((lvl, idx) => {
            const playable = canPlayLevel(progress, idx, run.debugMode);
            const isSelected = idx === progress.currentLevelIndex;
            const row = document.createElement('div');
            row.className = 'item-row' + (isSelected ? ' current-lvl' : '') + (!playable ? ' locked-lvl' : '');

            const desc = lvl.isInfinite
                ? 'Fără limită de scor! Depășește-ți recordul!'
                : lvl.num === 10 ? `Învinge bossul! Trage cu Spațiu sau butonul FOC | +${lvl.reward} ⭐`
                : `Țintă: ${lvl.target} puncte, apoi învinge bossul | Recompensă: +${lvl.reward} ⭐`;

            const titlePrefix = lvl.isInfinite ? '♾️ ' : `Nivelul ${lvl.num}: `;

            row.innerHTML = `
                <div class="item-info">
                    <h4>${titlePrefix}${lvl.name}</h4>
                    <p>${desc}</p>
                </div>
            `;

            const actBtn = document.createElement('button');
            actBtn.className = 'small-action-btn';
            if (!playable) {
                actBtn.textContent = '🔒 Blocat';
                actBtn.style.background = '#334155';
                actBtn.style.color = '#94a3b8';
                actBtn.disabled = true;
            } else {
                actBtn.textContent = isSelected ? '✅ Selectat' : 'Joacă 🚀';
                actBtn.style.background = isSelected ? '#0284c7' : '#2563eb';
                actBtn.style.color = '#fff';
                actBtn.addEventListener('click', () => {
                    if (!actions.selectLevel(idx)) return;
                    closeLevelModal();
                    actions.startSelectedLevel();
                });
            }
            row.appendChild(actBtn);
            list.appendChild(row);
        });
    }

    // Modal Magazin Gear
    function openShopModal(fromScreen) {
        shopReturnScreen = fromScreen || 'menu';
        document.getElementById('mainMenuModal').classList.add('hidden');
        document.getElementById('victoryModal').classList.add('hidden');
        document.getElementById('gameOverModal').classList.add('hidden');
        renderShopList();
        document.getElementById('shopModal').classList.remove('hidden');
    }

    function closeShopModal() {
        document.getElementById('shopModal').classList.add('hidden');
        if (shopReturnScreen === 'victory') {
            document.getElementById('victoryModal').classList.remove('hidden');
        } else if (shopReturnScreen === 'gameover') {
            document.getElementById('gameOverModal').classList.remove('hidden');
        } else {
            document.getElementById('mainMenuModal').classList.remove('hidden');
        }
        updateMenuUI();
        updateGearHotbarUI();
    }

    function renderShopList() {
        document.getElementById('shopStarsBalance').textContent = progress.totalStarsCollected + ' ⭐';
        const list = document.getElementById('shopListContainer');
        list.innerHTML = '';

        SHOP_GEARS.forEach(g => {
            const count = progress.gearInventory[g.id] || 0;
            const canAfford = progress.totalStarsCollected >= g.cost;
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <div class="item-info">
                    <h4>${g.icon} ${g.name} <span style="color:#38bdf8; font-size:12px;">(În inventar: ${count})</span></h4>
                    <p>${g.desc}</p>
                </div>
            `;
            const buyBtn = document.createElement('button');
            buyBtn.className = 'small-action-btn';
            buyBtn.textContent = `Cumpără (${g.cost} ⭐)`;
            buyBtn.style.background = canAfford ? '#eab308' : '#334155';
            buyBtn.style.color = canAfford ? '#0f172a' : '#94a3b8';
            buyBtn.addEventListener('click', () => {
                if (actions.buyGear(g.id)) renderShopList();
            });
            row.appendChild(buyBtn);
            list.appendChild(row);
        });
    }

    // Modal Resetare Progres
    function openResetModal() {
        document.getElementById('mainMenuModal').classList.add('hidden');
        document.getElementById('resetModal').classList.remove('hidden');
    }

    function closeResetModal() {
        document.getElementById('resetModal').classList.add('hidden');
        document.getElementById('mainMenuModal').classList.remove('hidden');
    }

    function updateGearHotbarUI() {
        gearOrder.forEach(id => {
            const countEl = document.getElementById('count-' + id);
            const slotEl = document.getElementById('slot-' + id);
            const qty = progress.gearInventory[id] || 0;
            if (countEl) countEl.textContent = qty;
            if (slotEl) {
                slotEl.classList.toggle('empty', qty <= 0);
                const isBuffActive =
                    (id === 'magnet' && run.activeBuffs.magnet > 0) ||
                    (id === 'shield' && run.activeBuffs.shield > 0) ||
                    (id === 'nova' && run.activeBuffs.turbo > 0) ||
                    run.activeBuffs[id] > 0;
                slotEl.classList.toggle('active-buff', isBuffActive);
            }
        });
    }

    function updateHUD() {
        const lvl = LEVELS[progress.currentLevelIndex] || LEVELS[0];
        document.getElementById('hudLives').textContent = '❤️'.repeat(Math.max(0, run.lives)) + '🖤'.repeat(Math.max(0, 3 - run.lives));
        document.getElementById('hudLevelName').textContent = lvl.isInfinite ? '♾️ Mod Infinit' : `Nivelul ${lvl.num}: ${lvl.name}`;
        document.getElementById('hudStars').textContent = progress.totalStarsCollected;

        const fill = document.getElementById('hudProgressFill');
        const text = document.getElementById('hudProgressText');
        if (run.boss) {
            fill.style.width = (run.boss.hp / run.boss.maxHp * 100) + '%';
            text.textContent = `BOSS: ${run.boss.hp} / ${run.boss.maxHp} PV — SPAȚIU / FOC`;
        } else if (lvl.isInfinite) {
            fill.style.width = '100%';
            text.textContent = `SCOR INFINIT: ${run.score} (Record: ${progress.highScore})`;
        } else {
            const pct = Math.min(100, Math.floor((run.score / lvl.target) * 100));
            fill.style.width = pct + '%';
            text.textContent = `PROGRES NIVEL: ${run.score} / ${lvl.target} (${pct}%)`;
        }
    }

    function renderVictory() {
        const lvl = LEVELS[progress.currentLevelIndex];
        const { reward, unlockedLevel, unlockedInfinite } = run.victory;
        let unlockNote = '';
        if (unlockedInfinite) {
            unlockNote = '<br><strong style="color:#38bdf8;">🔓 Ai deblocat MODUL INFINIT ♾️ și Campania Avansată (Nivelele 6 - 10)!</strong>';
        } else if (unlockedLevel) {
            unlockNote = `<br><strong style="color:#38bdf8;">🔓 Nivelul ${unlockedLevel} a fost deblocat!</strong>`;
        } else if (run.debugMode) {
            unlockNote = '<br><strong style="color:#facc15;">🐞 Mod debug: progresul nivelurilor rămâne neschimbat.</strong>';
        }

        document.getElementById('victoryTitle').textContent =
            lvl.num === 10 ? '👑 AI CUCERIT APOCALIPSA COSMICĂ!' : `NIVELUL ${lvl.num} COMPLETAT!`;
        document.getElementById('victorySubtitle').innerHTML =
            `Scor obținut: <strong>${run.score}p</strong><br>Recompensă nivel: <strong style="color:#facc15;">+${reward} ⭐ Stele Monede</strong>${unlockNote}`;

        const nextBtn = document.getElementById('btnNextLevel');
        if (progress.currentLevelIndex < 9) {
            nextBtn.style.display = 'flex';
            nextBtn.textContent = `Mergi la Nivelul ${lvl.num + 1} ⏭️`;
        } else if (progress.currentLevelIndex === 9) {
            nextBtn.style.display = 'flex';
            nextBtn.textContent = 'Joacă Modul Infinit ♾️';
        } else {
            nextBtn.style.display = 'none';
        }

        document.getElementById('victoryModal').classList.remove('hidden');
    }

    function confirmResetProgress() {
        actions.resetProgress();
        closeResetModal();
        updateMenuUI();
        updateGearHotbarUI();
        showToast('Progresul a fost resetat complet!');
    }

    function renderScreen() {
        const debugToggle = document.getElementById('btnDebugMode');
        debugToggle.textContent = run.debugMode ? '🐞 MOD DEBUG: ACTIV' : '🐞 MOD DEBUG: OPRIT';
        debugToggle.setAttribute('aria-pressed', String(run.debugMode));
        document.getElementById('hudDebugBadge').classList.toggle('hidden', !run.debugMode);
        for (const overlay of document.querySelectorAll('.overlay')) {
            overlay.classList.add('hidden');
        }
        const inGame = run.mode !== 'MENU' && run.mode !== 'DIFFICULTY';
        document.getElementById('btnShoot').classList.toggle('hidden', run.mode !== 'PLAYING' || !run.boss);
        document.getElementById('hud').style.display = inGame ? 'flex' : 'none';
        document.getElementById('gearHotbar').style.display = inGame && !run.player.destroyed ? 'flex' : 'none';
        document.getElementById('btnPauseGame').disabled = run.player.destroyed;

        if (run.mode === 'MENU') {
            document.getElementById('mainMenuModal').classList.remove('hidden');
            updateMenuUI();
        } else if (run.mode === 'DIFFICULTY') {
            document.getElementById('difficultyModal').classList.remove('hidden');
            document.querySelector('#difficultyModal [data-value="easy"]').focus();
        } else if (run.mode === 'PAUSED') {
            const lvl = LEVELS[progress.currentLevelIndex] || LEVELS[0];
            const lvlTitle = lvl.isInfinite ? 'Modul Infinit ♾️' : `Nivelul ${lvl.num}: ${lvl.name}`;
            document.getElementById('pauseStatsText').innerHTML =
                `<span style="color:#38bdf8; font-weight:700;">${lvlTitle}</span><br>` +
                `Scor curent: <strong>${run.score}p</strong> | Stele adunate acum: <strong style="color:#facc15;">+${run.runStarsEarned} ⭐</strong>`;
            document.getElementById('pauseModal').classList.remove('hidden');
        } else if (run.mode === 'VICTORY') {
            renderVictory();
        } else if (run.mode === 'GAMEOVER') {
            document.getElementById('gameOverStats').innerHTML =
                `Scorul tău: <strong>${run.score} puncte</strong><br> Stele în portofel: <strong style="color:#facc15;">${progress.totalStarsCollected} ⭐</strong>`;
            document.getElementById('gameOverModal').classList.remove('hidden');
        }
    }

    const handlers = {
        ...actions, openLevelModal, closeLevelModal, openShopModal, closeShopModal,
        openResetModal, closeResetModal, confirmResetProgress,
    };
    for (const element of document.querySelectorAll('[data-action]')) {
        element.addEventListener('click', () => {
            handlers[element.dataset.action](element.dataset.value);
        });
    }

    return { showToast, updateMenuUI, updateHUD, updateGearHotbarUI, renderScreen };
}
