export function bindInput({ canvas, input, run, actions }) {
    window.addEventListener('keydown', e => {
        const k = e.key.toLowerCase();
        input.keys[k] = true;
        if (e.code === 'Space' && run.mode === 'PLAYING' && run.boss) e.preventDefault();

        if (e.key === 'Escape' || k === 'p') {
            if (run.mode === 'PLAYING' || run.mode === 'PAUSED') {
                e.preventDefault();
                actions.togglePauseGame();
                return;
            }
        }

        if (run.mode === 'PLAYING') {
            const shortcuts = { '1': 'magnet', '2': 'shield', '3': 'nova', '4': 'repair', '5': 'slow', '6': 'rapid', '7': 'double' };
            const digit = /^(?:Digit|Numpad)([1-7])$/.exec(e.code)?.[1] || e.key;
            const gear = shortcuts[digit];
            if (gear) {
                e.preventDefault();
                if (!e.repeat) actions.useGear(gear);
            }
        }
    });

    window.addEventListener('keyup', e => {
        input.keys[e.key.toLowerCase()] = false;
    });
    const fireButton = document.getElementById('btnShoot');
    fireButton.addEventListener('click', () => actions.shoot());
    fireButton.addEventListener('pointerdown', e => {
        e.preventDefault();
        fireButton.setPointerCapture(e.pointerId);
        input.firing = true;
        actions.shoot();
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        fireButton.addEventListener(event, () => { input.firing = false; });
    }
    window.addEventListener('blur', () => { input.keys = {}; input.firing = false; });

    function handlePointerMove(clientX, clientY) {
        if (run.mode !== 'PLAYING') return;
        input.targetX = clientX;
        input.targetY = clientY;
    }

    canvas.addEventListener('mousedown', e => handlePointerMove(e.clientX, e.clientY));
    canvas.addEventListener('mousemove', e => {
        if (e.buttons === 1) handlePointerMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => {
        input.targetX = null;
        input.targetY = null;
    });

    canvas.addEventListener('touchstart', e => {
        if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
        if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
        input.targetX = null;
        input.targetY = null;
    });
}
