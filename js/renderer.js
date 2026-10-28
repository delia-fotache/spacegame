import { SHIPS, LEVELS } from './config.js';
import { drawBossBattle } from './boss.js';

export function createRenderer({ canvas, progress, run }) {
    const ctx = canvas.getContext('2d');
    const shipImages = new Map();
    for (const ship of SHIPS) {
        if (!ship.image) continue;
        const image = new Image();
        image.src = ship.image;
        shipImages.set(ship.id, image);
    }

    function drawStarShape(x, y, spikes, outerR, innerR, color, glowColor) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.moveTo(0, -outerR);
        for (let i = 0; i < spikes; i++) {
            ctx.rotate(Math.PI / spikes);
            ctx.lineTo(0, -innerR);
            ctx.rotate(Math.PI / spikes);
            ctx.lineTo(0, -outerR);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
    }

    function drawSpaceship(x, y) {
        const ship = SHIPS[progress.selectedShipIndex] || SHIPS[0];
        ctx.save();
        ctx.translate(x, y);

        // Efect invulnerabilitate după lovitură
        if (run.player.invulnerableTimer > 0 && Math.floor(run.frameCount / 4) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        // Aura Magnet
        if (run.activeBuffs.magnet > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, run.player.radius + 18 + Math.sin(run.frameCount * 0.15) * 4, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        // Aura Scut
        if (run.activeBuffs.shield > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, run.player.radius + 12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Flacăra propulsorului
        const flameLen = (run.activeBuffs.turbo > 0 ? 26 : 15) + Math.random() * 7;
        ctx.beginPath();
        ctx.moveTo(-8, 16);
        ctx.lineTo(0, 16 + flameLen);
        ctx.lineTo(8, 16);
        ctx.closePath();
        ctx.fillStyle = run.activeBuffs.turbo > 0 ? '#38bdf8' : '#f97316';
        ctx.fill();

        // Corpul Navei
        ctx.shadowColor = ship.glow;
        ctx.shadowBlur = 14;
        ctx.fillStyle = ship.primary;

        const shipImage = shipImages.get(ship.id);
        if (shipImage?.complete && shipImage.naturalWidth > 0) {
            const height = 48;
            const width = height * shipImage.naturalWidth / shipImage.naturalHeight;
            ctx.drawImage(shipImage, -width / 2, -height / 2 - 4, width, height);
        } else if (ship.id === 'ufo') {
            ctx.beginPath();
            ctx.ellipse(0, 4, 24, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = ship.secondary;
            ctx.beginPath();
            ctx.arc(0, -2, 11, Math.PI, 0);
            ctx.fill();
        } else {
            // Siluetă de rachetă/navă de luptă
            ctx.beginPath();
            ctx.moveTo(0, -24);
            ctx.lineTo(19, 16);
            ctx.lineTo(7, 11);
            ctx.lineTo(-7, 11);
            ctx.lineTo(-19, 16);
            ctx.closePath();
            ctx.fill();

            // Hublou
            ctx.fillStyle = '#e0f2fe';
            ctx.beginPath();
            ctx.arc(0, -3, 5.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawShipExplosion() {
        const explosion = run.shipExplosion;
        if (!explosion) return;
        const progress = explosion.frame / explosion.duration;
        const fade = 1 - progress;
        const radius = 22 + progress * 80;

        ctx.save();
        ctx.translate(explosion.x, explosion.y);
        ctx.globalCompositeOperation = 'lighter';
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        glow.addColorStop(0, '#fff7cc');
        glow.addColorStop(0.25, '#facc15');
        glow.addColorStop(0.6, '#f97316');
        glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.globalAlpha = fade * fade;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = fade;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1 + fade * 5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function renderScene() {
        const lvl = LEVELS[progress.currentLevelIndex] || LEVELS[0];

        // Fundal gradient tematic pentru fiecare nivel
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, lvl.bgTop);
        grad.addColorStop(1, lvl.bgBot);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stele de fundal în mișcare
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < run.bgStars.length; i++) {
            const s = run.bgStars[i];
            ctx.globalAlpha = s.alpha;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (run.mode !== 'MENU') {
            // Desenare Colectabile
            run.collectibles.forEach(c => {
                if (c.type === 'gold') {
                    drawStarShape(c.x, c.y, 5, c.radius, c.radius * 0.48, '#facc15', '#fef08a');
                } else if (c.type === 'blue') {
                    drawStarShape(c.x, c.y, 6, c.radius, c.radius * 0.5, '#38bdf8', '#7dd3fc');
                } else if (c.type === 'heart') {
                    ctx.font = '22px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('❤️', c.x, c.y);
                }
            });

            // Desenare Meteoriți
            run.meteors.forEach(m => {
                ctx.save();
                ctx.translate(m.x, m.y);
                ctx.rotate(m.angle);

                let fillCol = '#64748b';
                let strokeCol = '#94a3b8';
                if (m.style === 'fire' || m.style === 'apocalypse') {
                    fillCol = '#991b1b';
                    strokeCol = '#f97316';
                } else if (m.style === 'ice') {
                    fillCol = '#0369a1';
                    strokeCol = '#7dd3fc';
                } else if (m.style === 'comet') {
                    fillCol = '#581c87';
                    strokeCol = '#e879f9';
                }

                ctx.beginPath();
                const sides = 7;
                for (let j = 0; j < sides; j++) {
                    const a = (j / sides) * Math.PI * 2;
                    const r = m.radius * (j % 2 === 0 ? 1 : 0.82);
                    const px = Math.cos(a) * r;
                    const py = Math.sin(a) * r;
                    if (j === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fillStyle = fillCol;
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = strokeCol;
                ctx.stroke();
                ctx.restore();
            });

            drawBossBattle(ctx, run);

            // Desenare Navă
            if (!run.player.destroyed) drawSpaceship(run.player.x, run.player.y);
        }

        drawShipExplosion();

        // Particule
        for (let i = run.particles.length - 1; i >= 0; i--) {
            const p = run.particles[i];
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Texte flotante
        for (let i = run.floatingTexts.length - 1; i >= 0; i--) {
            const ft = run.floatingTexts[i];
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = ft.color;
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    return { renderScene };
}
