export function createBoss(viewport, level = 10) {
    const hp = level === 10 ? 420 : 48 + level * 30;
    return { x: viewport.width / 2, y: -80, entering: true, radius: 48, hp, maxHp: hp,
        level, age: 0, cooldown: 90, flash: 0,
        moveSpeed: 0.007 + level * 0.0012,
        bulletSpeed: 1.5 + level * 0.19,
        volleyDelay: 155 - level * 6,
        volleySize: level <= 3 ? 1 : level <= 6 ? 2 : 3 };
}

export function fireWeapon(run, ship) {
    if (run.mode !== 'PLAYING' || !run.boss || run.shotCooldown > 0) return;
    const weapons = {
        classic: { color: '#cbd5e1', radius: 6, damage: 12, speed: 10, delay: 14 },
        fire: { color: '#fb923c', radius: 9, damage: 18, speed: 8, delay: 21 },
        crystal: { color: '#e879f9', radius: 8, damage: 15, speed: 11, delay: 17 },
        ufo: { color: '#4ade80', radius: 4, damage: 8, speed: 16, delay: 9 },
    };
    const weapon = weapons[ship.id] || weapons.classic;
    run.shots.push({ ...weapon, kind: ship.id, x: run.player.x, y: run.player.y - 28 });
    run.shotCooldown = run.activeBuffs.rapid > 0 ? Math.ceil(weapon.delay / 2) : weapon.delay;
}

export function updateBoss(run, viewport, onHit, onVictory) {
    const boss = run.boss;
    if (!boss) return;
    if (boss.entering) {
        boss.x = viewport.width / 2;
        boss.y = Math.min(150, boss.y + 2.5);
        if (boss.y === 150) boss.entering = false;
    } else {
        boss.age++;
        boss.x = viewport.width / 2 + Math.sin(boss.age * boss.moveSpeed) * Math.max(0, viewport.width / 2 - 65);
        boss.y = 150 + Math.sin(boss.age * 0.027) * 16;
    }
    boss.flash = Math.max(0, boss.flash - 1);
    run.shotCooldown = Math.max(0, run.shotCooldown - 1);
    for (let i = run.shots.length - 1; i >= 0; i--) {
        const shot = run.shots[i];
        shot.y -= shot.speed;
        if (Math.hypot(shot.x - boss.x, shot.y - boss.y) < boss.radius + shot.radius) {
            boss.hp = Math.max(0, boss.hp - shot.damage);
            boss.flash = 5;
            run.shots.splice(i, 1);
            onHit(shot);
            if (boss.hp === 0) { onVictory(); return; }
        } else if (shot.y < -30) run.shots.splice(i, 1);
    }
    if (boss.entering) return;
    // Aimed volleys become more frequent below half health; at most six hostile shots.
    if (--boss.cooldown <= 0) {
        boss.cooldown = boss.hp < boss.maxHp / 2 ? Math.round(boss.volleyDelay * 0.7) : boss.volleyDelay;
        const angle = Math.atan2(run.player.y - boss.y, run.player.x - boss.x);
        const spreads = boss.volleySize === 1 ? [0] : boss.volleySize === 2 ? [-0.14, 0.14] : [-0.26, 0, 0.26];
        for (const spread of spreads) {
            if (run.meteors.length >= 6) break;
            run.meteors.push({ x: boss.x, y: boss.y + 30, vx: Math.cos(angle + spread) * boss.bulletSpeed,
                vy: Math.sin(angle + spread) * boss.bulletSpeed, radius: 10, angle: 0, rotSpeed: 0.04, style: 'boss' });
        }
    }
}

export function drawBossBattle(ctx, run) {
    if (!run.boss) return;
    const boss = run.boss;
    if (boss.hp > 0) {
        ctx.save();
        ctx.translate(boss.x, boss.y);
        ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 24;
        ctx.fillStyle = boss.flash ? '#fff' : '#7f1d1d';
        ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 48); ctx.lineTo(-60, -26);
        ctx.lineTo(-24, -14); ctx.lineTo(0, -42); ctx.lineTo(24, -14);
        ctx.lineTo(60, -26); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    for (const shot of run.shots) {
        ctx.save(); ctx.translate(shot.x, shot.y);
        ctx.fillStyle = shot.color; ctx.strokeStyle = shot.color; ctx.shadowColor = shot.color; ctx.shadowBlur = 12;
        if (shot.kind === 'ufo') {
            ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, -14); ctx.stroke();
        } else if (shot.kind === 'fire') {
            ctx.beginPath(); ctx.arc(0, 0, shot.radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(0, -2, 4, 0, Math.PI * 2); ctx.fill();
        } else if (shot.kind === 'classic') {
            ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(3, -9);
            ctx.lineTo(7, -2); ctx.lineTo(4, 7); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1; ctx.stroke();
        } else {
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(shot.radius, 1);
            ctx.lineTo(0, 8); ctx.lineTo(-shot.radius, 1); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();
    }
}
