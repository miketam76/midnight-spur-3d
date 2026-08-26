// render.js - Midnight Spur (Option B: Full-Scale Imposing Town Standoff, Dynamic Sky & Dust FX)

const snesPalette = {
    skyTop: '#0a0d1a',
    skyUpper: '#2c1820',
    skyMid: '#642818',
    skyHorizon: '#a84c10',
    boardwalk: '#a87848',
    boardwalkPlank: '#78502c',
    streetDirt: '#b87034',
    streetRut: '#884c1c',
    streetDeep: '#6c3810',
    outline: '#000000',
};

// 3-Tier Sky Engine Palettes
const skyTiers = {
    // Tier 1: Midday Frontier Blue (Rounds 1 - 5)
    day: {
        top: '#1b3b6f',
        upper: '#3a699c',
        mid: '#6495c2',
        horizon: '#d4aa7d',
        hasStars: false,
    },
    // Tier 2: Fiery Sunset (Rounds 6 - 12)
    sunset: {
        top: '#241424',
        upper: '#5c1e28',
        mid: '#9e381c',
        horizon: '#e07824',
        hasStars: false,
    },
    // Tier 3: Midnight Starlight (Rounds 13 - 19)
    night: {
        top: '#05070e',
        upper: '#0d1322',
        mid: '#1a182c',
        horizon: '#442220',
        hasStars: true,
    }
};

const fixedStars = [
    { x: 0.12, y: 0.08, size: 2 },
    { x: 0.24, y: 0.16, size: 1 },
    { x: 0.38, y: 0.06, size: 2 },
    { x: 0.49, y: 0.22, size: 1 },
    { x: 0.62, y: 0.11, size: 2 },
    { x: 0.74, y: 0.05, size: 1 },
    { x: 0.85, y: 0.18, size: 2 },
    { x: 0.92, y: 0.09, size: 1 },
    { x: 0.05, y: 0.25, size: 1 },
];

function getSkyForRound(round = 1) {
    if (round <= 5) return skyTiers.day;
    if (round <= 12) return skyTiers.sunset;
    return skyTiers.night;
}

function drawPixel(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
}

// 16-Bit Timer Bar
function drawTimerMeter(ctx, width, progress) {
    const meterWidth = Math.round(width * 0.56);
    const meterHeight = 14;
    const meterX = Math.round((width - meterWidth) / 2);
    const meterY = 16;
    const fillWidth = Math.round(meterWidth * progress);

    drawPixel(ctx, meterX - 5, meterY - 5, meterWidth + 10, meterHeight + 10, snesPalette.outline);
    drawPixel(ctx, meterX - 4, meterY - 4, meterWidth + 8, meterHeight + 8, '#2a1408');
    drawPixel(ctx, meterX - 2, meterY - 2, meterWidth + 4, meterHeight + 4, '#582c12');
    drawPixel(ctx, meterX, meterY, meterWidth, meterHeight, '#100806');

    drawPixel(ctx, meterX - 3, meterY + 4, 2, 2, '#fce0a0');
    drawPixel(ctx, meterX + meterWidth + 1, meterY + 4, 2, 2, '#fce0a0');

    if (fillWidth > 0) {
        drawPixel(ctx, meterX, meterY, fillWidth, 3, '#fff4cc');
        drawPixel(ctx, meterX, meterY + 3, fillWidth, 5, '#e8aa34');
        drawPixel(ctx, meterX, meterY + 8, fillWidth, 4, '#b86c14');
        drawPixel(ctx, meterX, meterY + 12, fillWidth, 2, '#6c3808');
    }
}

// Animated Muzzle Blast & Drifting Smoke
function drawMuzzleBlast(ctx, x, y, facingLeft, flashFrame) {
    const dir = facingLeft ? -1 : 1;

    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    if (flashFrame > 3) {
        drawPixel(ctx, dir * 6, -8, 14 * dir, 16, '#e04810');
        drawPixel(ctx, dir * 8, -6, 10 * dir, 12, '#f87820');
        drawPixel(ctx, dir * 10, -4, 6 * dir, 8, '#fce0a0');
        drawPixel(ctx, dir * 12, -2, 4 * dir, 4, '#ffffff');

        drawPixel(ctx, dir * 24, -6, 3 * dir, 2, '#ffffff');
        drawPixel(ctx, dir * 20, 6, 4 * dir, 2, '#fce0a0');
        drawPixel(ctx, dir * 18, -12, 3 * dir, 2, '#f87820');
    }

    if (flashFrame > 0) {
        const expand = (6 - flashFrame) * 2;
        drawPixel(ctx, dir * (18 + expand), -4 - expand, 8, 8, 'rgba(216, 216, 224, 0.75)');
        drawPixel(ctx, dir * (20 + expand), -2 - expand, 4, 4, 'rgba(255, 255, 255, 0.9)');
        drawPixel(ctx, dir * (12 + expand * 0.8), -10 - expand * 1.5, 10, 8, 'rgba(160, 160, 176, 0.55)');
    }

    ctx.restore();
}

// Wind-blown atmospheric dust particles
function drawDustParticles(ctx, particles, round = 1) {
    if (!particles) return;
    const dustColor = round > 12 ? 'rgba(210, 190, 180, ' : 'rgba(230, 185, 130, ';

    particles.forEach((p) => {
        ctx.fillStyle = `${dustColor}${p.alpha})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size * 2, p.size);
    });
}

// Bushy Dried-Grass / Briar Tumbleweed (~32px)
function drawTumbleweed(ctx, tw) {
    if (!tw || !tw.active) return;

    ctx.save();
    const drawY = tw.currentY !== undefined ? tw.currentY : tw.y;
    ctx.translate(Math.floor(tw.x), Math.floor(drawY));

    // 1. Draw flat ground shadow BEFORE rotating
    drawPixel(ctx, -14, 15, 28, 4, 'rgba(0, 0, 0, 0.35)');

    // 2. Rotate ONLY the spinning tumbleweed branches
    ctx.rotate(tw.rotation || 0);

    const cShadow = '#2d180c';
    const cDeep = '#543015';
    const cMid = '#8c5828';
    const cStraw = '#c98e46';
    const cTip = '#f4cf82';

    // Dense Shadow Core
    drawPixel(ctx, -7, -7, 14, 14, cShadow);
    drawPixel(ctx, -5, -5, 10, 10, cDeep);

    // Tangled outer twigs & briars
    drawPixel(ctx, -12, -8, 2, 16, cDeep);
    drawPixel(ctx, 10, -8, 2, 16, cDeep);
    drawPixel(ctx, -8, -12, 16, 2, cDeep);
    drawPixel(ctx, -8, 10, 16, 2, cDeep);

    drawPixel(ctx, -14, -4, 4, 3, cMid);
    drawPixel(ctx, 10, 1, 4, 3, cMid);
    drawPixel(ctx, -4, -14, 3, 4, cMid);
    drawPixel(ctx, 1, 10, 3, 4, cMid);

    drawPixel(ctx, -11, -11, 4, 4, cDeep);
    drawPixel(ctx, 7, -11, 4, 4, cDeep);
    drawPixel(ctx, -11, 7, 4, 4, cDeep);
    drawPixel(ctx, 7, 7, 4, 4, cDeep);

    // Main sweeping straw strands
    drawPixel(ctx, -9, -5, 18, 2, cStraw);
    drawPixel(ctx, -9, 3, 18, 2, cStraw);
    drawPixel(ctx, -5, -9, 2, 18, cStraw);
    drawPixel(ctx, 3, -9, 2, 18, cStraw);

    drawPixel(ctx, -8, -8, 5, 2, cStraw);
    drawPixel(ctx, -3, -6, 6, 2, cTip);
    drawPixel(ctx, 3, -4, 5, 2, cStraw);

    drawPixel(ctx, -7, 5, 5, 2, cStraw);
    drawPixel(ctx, -2, 3, 6, 2, cTip);
    drawPixel(ctx, 4, 1, 4, 2, cStraw);

    // Looping fibers
    drawPixel(ctx, -6, -8, 2, 5, cTip);
    drawPixel(ctx, -4, -3, 2, 6, cStraw);
    drawPixel(ctx, -2, 3, 2, 5, cDeep);

    drawPixel(ctx, 5, -7, 2, 5, cStraw);
    drawPixel(ctx, 3, -2, 2, 6, cTip);
    drawPixel(ctx, 1, 4, 2, 4, cDeep);

    // Loose fringe tips
    drawPixel(ctx, -15, -7, 3, 2, cTip);
    drawPixel(ctx, -14, 6, 3, 2, cStraw);
    drawPixel(ctx, 12, -6, 3, 2, cTip);
    drawPixel(ctx, 11, 7, 3, 2, cStraw);

    drawPixel(ctx, -7, -15, 2, 3, cTip);
    drawPixel(ctx, 6, -14, 2, 3, cStraw);
    drawPixel(ctx, -6, 12, 2, 3, cStraw);
    drawPixel(ctx, 5, 11, 2, 3, cTip);

    // Light glints
    drawPixel(ctx, -3, -3, 3, 2, cTip);
    drawPixel(ctx, 1, 1, 3, 2, cTip);
    drawPixel(ctx, -1, 0, 2, 2, '#fff0c0');

    ctx.restore();
}

// --- HERO SPRITE: Van Cleef Archetype ---
function drawHeroVanCleef(ctx, x, y, drawArmUp) {
    const skinBase = '#f4b884';
    const skinShadow = '#b86c40';

    // Midnight Black Hat Palette
    const hatLight = '#343844';
    const hatMid = '#1c202a';
    const hatShadow = '#0c1018';

    const darkVest = '#202028';
    const silver = '#d0d0dc';
    const OL = snesPalette.outline;

    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    drawPixel(ctx, -24, 70, 48, 6, 'rgba(0, 0, 0, 0.45)');

    // 1. Hat
    drawPixel(ctx, -32, -26, 4, 6, OL);
    drawPixel(ctx, -30, -24, 2, 4, hatLight);
    drawPixel(ctx, -28, -22, 56, 4, OL);
    drawPixel(ctx, -26, -20, 52, 3, hatLight);
    drawPixel(ctx, -26, -18, 52, 1, hatShadow);
    drawPixel(ctx, 24, -22, 4, 2, hatLight);
    drawPixel(ctx, 26, -26, 4, 6, OL);
    drawPixel(ctx, 26, -24, 2, 4, hatLight);

    drawPixel(ctx, -16, -42, 32, 22, OL);
    drawPixel(ctx, -14, -40, 28, 20, hatMid);
    drawPixel(ctx, -12, -40, 24, 4, hatLight);
    drawPixel(ctx, -6, -42, 12, 4, OL);
    drawPixel(ctx, -4, -40, 8, 3, hatShadow);
    drawPixel(ctx, -14, -36, 4, 14, hatShadow);

    drawPixel(ctx, -14, -24, 28, 4, '#38180c');
    drawPixel(ctx, -14, -22, 28, 1, '#603018');
    drawPixel(ctx, 2, -24, 4, 4, silver);

    // 2. Face & Features
    drawPixel(ctx, -12, -17, 24, 23, OL);
    drawPixel(ctx, -10, -15, 20, 19, skinBase);
    drawPixel(ctx, -10, -3, 20, 5, skinShadow);

    drawPixel(ctx, -11, -15, 4, 12, '#301810');

    drawPixel(ctx, 0, -12, 10, 2, OL);
    drawPixel(ctx, 0, -10, 9, 3, '#ffffff');
    drawPixel(ctx, 3, -10, 4, 3, OL);
    drawPixel(ctx, 4, -10, 2, 2, '#4890d8');

    drawPixel(ctx, 7, -8, 4, 4, OL);
    drawPixel(ctx, 6, -7, 4, 3, skinShadow);
    drawPixel(ctx, -2, -4, 12, 3, '#301810');
    drawPixel(ctx, 2, 0, 6, 3, '#301810');

    // 3. Red Bandana & Dark Vest
    drawPixel(ctx, -16, 6, 32, 34, OL);
    drawPixel(ctx, -14, 8, 28, 30, darkVest);

    drawPixel(ctx, -6, 6, 14, 6, '#b02820');
    drawPixel(ctx, -4, 8, 10, 6, '#c83428');
    drawPixel(ctx, -2, 10, 4, 4, '#f05040');

    drawPixel(ctx, -2, 12, 4, 22, '#14141a');
    drawPixel(ctx, -1, 15, 2, 2, silver);
    drawPixel(ctx, -1, 21, 2, 2, silver);
    drawPixel(ctx, -1, 27, 2, 2, silver);

    drawPixel(ctx, -10, 24, 2, 2, silver);
    drawPixel(ctx, -8, 26, 4, 2, silver);
    drawPixel(ctx, -4, 27, 4, 2, silver);
    drawPixel(ctx, 0, 26, 2, 2, silver);

    drawPixel(ctx, -16, 34, 32, 6, '#482010');
    drawPixel(ctx, -11, 36, 2, 3, '#fce0a0');
    drawPixel(ctx, -7, 36, 2, 3, '#fce0a0');
    drawPixel(ctx, -4, 33, 8, 7, silver);

    // 4. Pants & Boots
    drawPixel(ctx, -14, 40, 12, 28, OL);
    drawPixel(ctx, -12, 42, 8, 24, '#1c1c24');
    drawPixel(ctx, -10, 43, 4, 20, '#2c2c38');
    drawPixel(ctx, 2, 40, 12, 28, OL);
    drawPixel(ctx, 4, 42, 8, 24, '#14141a');

    drawPixel(ctx, -16, 62, 14, 8, OL);
    drawPixel(ctx, -14, 64, 10, 6, '#101014');
    drawPixel(ctx, 2, 62, 14, 8, OL);
    drawPixel(ctx, 4, 64, 10, 6, '#101014');

    drawPixel(ctx, -17, 64, 4, 4, silver);
    drawPixel(ctx, -19, 65, 2, 2, '#ffffff');

    // 5. Weapon
    if (drawArmUp) {
        drawPixel(ctx, 12, 10, 22, 10, OL);
        drawPixel(ctx, 14, 12, 18, 6, darkVest);
        drawPixel(ctx, 32, 11, 8, 7, skinBase);

        drawPixel(ctx, 38, 4, 32, 9, OL);
        drawPixel(ctx, 40, 6, 28, 3, '#d0d0dc');
        drawPixel(ctx, 40, 5, 26, 1, '#ffffff');
        drawPixel(ctx, 68, 3, 3, 3, OL);
        drawPixel(ctx, 38, 7, 8, 5, '#40404c');
        drawPixel(ctx, 32, 10, 8, 8, '#482010');
    } else {
        drawPixel(ctx, 12, 12, 10, 22, OL);
        drawPixel(ctx, 14, 14, 6, 18, darkVest);
        drawPixel(ctx, 13, 30, 8, 8, skinBase);
        drawPixel(ctx, 17, 34, 8, 14, '#381808');
    }

    ctx.restore();
}

// --- SPECIAL BOSS SPRITE: "The Man With No Name" ---
function drawBlondieCowboy(ctx, x, y, drawArmUp) {
    const dir = -1;
    const skinBase = '#f4b884';
    const skinShadow = '#b86c40';
    const hatColor = '#443020';
    const hatLight = '#604430';
    const ponchoGreen = '#3a4e32';
    const ponchoLight = '#4d6842';
    const whiteWeave = '#f4f0e0';
    const denimBlue = '#243a5c';
    const OL = snesPalette.outline;

    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    drawPixel(ctx, -24, 70, 48, 6, 'rgba(0, 0, 0, 0.45)');

    // 1. Hat
    drawPixel(ctx, -30, -22, 60, 4, OL);
    drawPixel(ctx, -28, -20, 56, 3, hatColor);
    drawPixel(ctx, -26, -21, 52, 1, hatLight);

    drawPixel(ctx, -16, -38, 32, 18, OL);
    drawPixel(ctx, -14, -36, 28, 16, hatColor);
    drawPixel(ctx, -14, -36, 28, 2, hatLight);
    drawPixel(ctx, -14, -24, 28, 4, '#241810');

    // 2. Face & Cigarillo
    drawPixel(ctx, -12, -17, 24, 23, OL);
    drawPixel(ctx, -10, -15, 20, 19, skinBase);
    drawPixel(ctx, -10, -3, 20, 5, skinShadow);

    drawPixel(ctx, -8, -4, 16, 6, '#885834');
    drawPixel(ctx, -6, -2, 12, 4, '#583820');

    const eyeX = dir * 4;
    drawPixel(ctx, eyeX - 4, -12, 8, 2, OL);
    drawPixel(ctx, eyeX - 4, -10, 7, 3, '#ffffff');
    drawPixel(ctx, eyeX - 2, -10, 3, 3, OL);
    drawPixel(ctx, eyeX - 2, -10, 1, 1, '#88c870');

    drawPixel(ctx, eyeX - 10, -2, 7, 2, '#382010');
    drawPixel(ctx, eyeX - 12, -2, 2, 2, '#f84820');

    // 3. Serape Poncho
    drawPixel(ctx, -18, 6, 36, 34, OL);
    drawPixel(ctx, -16, 8, 32, 30, ponchoGreen);
    drawPixel(ctx, -16, 8, 10, 30, ponchoLight);

    drawPixel(ctx, -16, 14, 32, 2, whiteWeave);
    drawPixel(ctx, -16, 22, 32, 2, whiteWeave);
    drawPixel(ctx, -12, 16, 4, 6, whiteWeave);
    drawPixel(ctx, -2, 16, 4, 6, whiteWeave);
    drawPixel(ctx, 8, 16, 4, 6, whiteWeave);

    for (let f = -16; f < 16; f += 4) {
        drawPixel(ctx, f, 38, 2, 3, whiteWeave);
    }

    drawPixel(ctx, -16, 35, 32, 6, '#381808');
    drawPixel(ctx, 4, 34, 8, 7, '#fce0a0');

    // 4. Jeans & Boots
    drawPixel(ctx, -14, 40, 12, 28, OL);
    drawPixel(ctx, -12, 42, 8, 24, denimBlue);
    drawPixel(ctx, 2, 40, 12, 28, OL);
    drawPixel(ctx, 4, 42, 8, 24, '#14243c');

    drawPixel(ctx, -16, 62, 14, 8, OL);
    drawPixel(ctx, -14, 64, 10, 6, '#381808');
    drawPixel(ctx, 2, 62, 14, 8, OL);
    drawPixel(ctx, 4, 64, 10, 6, '#381808');
    drawPixel(ctx, 16, 64, 4, 4, '#fce0a0');

    // 5. Weapon
    if (drawArmUp) {
        drawPixel(ctx, dir * 12, 10, 22 * dir, 10, OL);
        drawPixel(ctx, dir * 14, 12, 18 * dir, 6, ponchoGreen);
        drawPixel(ctx, dir * 32, 11, 8 * dir, 7, skinBase);

        drawPixel(ctx, dir * 38, 4, 22 * dir, 9, OL);
        drawPixel(ctx, dir * 40, 6, 18 * dir, 3, '#d0d0dc');
        drawPixel(ctx, dir * 40, 5, 16 * dir, 1, '#ffffff');
        drawPixel(ctx, dir * 38, 7, 7 * dir, 5, '#404048');
        drawPixel(ctx, dir * 33, 10, 7 * dir, 8, '#2a1810');
        drawPixel(ctx, dir * 34, 12, 3 * dir, 4, '#f0f0f8');
    } else {
        drawPixel(ctx, dir * 12, 12, 10 * dir, 22, OL);
        drawPixel(ctx, dir * 14, 14, 6 * dir, 18, ponchoGreen);
        drawPixel(ctx, dir * 13, 30, 8 * dir, 8, skinBase);
        drawPixel(ctx, dir * 17, 34, 8 * dir, 14, '#381808');
    }

    ctx.restore();
}

// --- STANDARD OUTLAW SPRITE ---
function drawHogansCowboy(ctx, x, y, outfit, facingLeft, drawArmUp) {
    const dir = facingLeft ? -1 : 1;
    const bodyColor = outfit.body;
    const hatColor = outfit.hat;
    const accentColor = outfit.accent;
    const skinBase = '#fcb070';
    const skinShadow = '#c86e38';
    const OL = snesPalette.outline;

    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    drawPixel(ctx, -24, 70, 48, 6, 'rgba(0, 0, 0, 0.45)');

    // Hat
    drawPixel(ctx, -30, -22, 60, 4, OL);
    drawPixel(ctx, -28, -20, 56, 3, hatColor);
    drawPixel(ctx, -16, -40, 32, 20, OL);
    drawPixel(ctx, -14, -38, 28, 18, hatColor);
    drawPixel(ctx, -6, -40, 12, 4, OL);

    drawPixel(ctx, -14, -24, 28, 4, accentColor);

    // Head
    drawPixel(ctx, -12, -17, 24, 23, OL);
    drawPixel(ctx, -10, -15, 20, 19, skinBase);
    drawPixel(ctx, -10, -3, 20, 5, skinShadow);

    const eyeX = dir * 4;
    drawPixel(ctx, eyeX - 5, -13, 9, 2, OL);
    drawPixel(ctx, eyeX - 5, -10, 8, 4, '#ffffff');
    drawPixel(ctx, eyeX - 3, -10, 5, 4, OL);
    drawPixel(ctx, eyeX - 9, -4, 18, 4, '#381c0c');

    drawPixel(ctx, -8, 6, 16, 8, accentColor);

    // Torso
    drawPixel(ctx, -16, 6, 32, 34, OL);
    drawPixel(ctx, -14, 8, 28, 30, bodyColor);
    drawPixel(ctx, -2, 10, 4, 24, '#f8f4ec');
    drawPixel(ctx, -16, 34, 32, 6, '#381808');
    drawPixel(ctx, -4, 33, 8, 7, '#fce0a0');

    // Legs
    drawPixel(ctx, -14, 40, 12, 28, OL);
    drawPixel(ctx, -12, 42, 8, 24, '#1c345c');
    drawPixel(ctx, 2, 40, 12, 28, OL);
    drawPixel(ctx, 4, 42, 8, 24, '#10223e');

    drawPixel(ctx, -16, 62, 14, 8, OL);
    drawPixel(ctx, -14, 64, 10, 6, '#381808');
    drawPixel(ctx, 2, 62, 14, 8, OL);
    drawPixel(ctx, 4, 64, 10, 6, '#381808');

    // Arms
    if (drawArmUp) {
        drawPixel(ctx, dir * 12, 10, 22 * dir, 10, OL);
        drawPixel(ctx, dir * 14, 12, 18 * dir, 6, bodyColor);
        drawPixel(ctx, dir * 32, 11, 8 * dir, 7, skinBase);

        drawPixel(ctx, dir * 38, 4, 22 * dir, 9, OL);
        drawPixel(ctx, dir * 40, 6, 18 * dir, 3, '#d0d0dc');
        drawPixel(ctx, dir * 38, 7, 7 * dir, 5, '#5c5c68');
        drawPixel(ctx, dir * 33, 10, 7 * dir, 8, '#582410');
    } else {
        drawPixel(ctx, dir * 12, 12, 10 * dir, 22, OL);
        drawPixel(ctx, dir * 14, 14, 6 * dir, 18, bodyColor);
        drawPixel(ctx, dir * 13, 30, 8 * dir, 8, skinBase);
    }

    ctx.restore();
}

// 16-Bit Fallen Sprite
function drawHogansFallenCowboy(ctx, x, y, outfit, facingLeft, progress) {
    const dir = facingLeft ? -1 : 1;
    const fallDir = facingLeft ? 1 : -1;
    const bodyColor = outfit.body;
    const hatColor = outfit.hat;
    const skinColor = '#fcb070';
    const gunColor = '#e0e0e8';
    const OL = snesPalette.outline;

    const fall = Math.min(1, Math.max(0, progress));

    ctx.save();

    let bodyX = x;
    let bodyY = y;

    if (fall < 0.3) {
        const t = fall / 0.3;
        bodyX = x + t * 8 * fallDir;
        bodyY = y - t * 4;
    } else if (fall < 0.7) {
        const t = (fall - 0.3) / 0.4;
        bodyX = x + 8 * fallDir + t * 14 * fallDir;
        bodyY = y - 4 + t * 24;
    } else {
        bodyX = x + 22 * fallDir;
        bodyY = y + 20;
    }

    drawPixel(ctx, bodyX - 26, y + 68, 52, 6, 'rgba(0, 0, 0, 0.45)');

    const hatX = x + fall * 36 * fallDir;
    const hatY = y - 20 - Math.sin(fall * Math.PI) * 24 + fall * 86;
    drawPixel(ctx, hatX - 14, hatY, 28, 8, OL);
    drawPixel(ctx, hatX - 12, hatY + 2, 24, 4, hatColor);

    const gunX = x + fall * 30 * fallDir;
    const gunY = y + 36 + fall * 32;
    drawPixel(ctx, gunX, gunY, 14 * dir, 6, OL);
    drawPixel(ctx, gunX + 2 * dir, gunY + 2, 10 * dir, 2, gunColor);

    ctx.translate(Math.floor(bodyX), Math.floor(bodyY));

    if (fall < 0.3) {
        drawPixel(ctx, -16, 8, 32, 32, OL);
        drawPixel(ctx, -14, 10, 28, 28, bodyColor);
        drawPixel(ctx, -12, -14, 24, 22, OL);
        drawPixel(ctx, -10, -12, 20, 18, skinColor);
    } else if (fall < 0.7) {
        drawPixel(ctx, -20, 16, 40, 28, OL);
        drawPixel(ctx, -18, 18, 36, 24, bodyColor);
        drawPixel(ctx, -14, 6, 20, 20, OL);
        drawPixel(ctx, -12, 8, 16, 16, skinColor);
    } else {
        const headX = fallDir * 18;
        drawPixel(ctx, -headX - 8, 42, 16, 10, OL);
        drawPixel(ctx, -headX - 6, 44, 12, 6, '#381808');
        drawPixel(ctx, -headX + 2, 38, 22, 12, OL);
        drawPixel(ctx, -headX + 4, 40, 18, 8, '#1c345c');

        drawPixel(ctx, -16, 26, 32, 20, OL);
        drawPixel(ctx, -14, 28, 28, 16, bodyColor);

        drawPixel(ctx, headX - 10, 20, 18, 18, OL);
        drawPixel(ctx, headX - 8, 22, 14, 14, skinColor);
        drawPixel(ctx, headX - 6, 28, 10, 4, '#381c0c');
    }

    ctx.restore();
}

// --- OPTION B: FULL-SCALE 2-STORY PROPORTIONAL WESTERN TOWN ---
function renderHogansBackground(ctx, width, height, round = 1) {
    const skySplit = Math.floor(height * 0.52);
    const sky = getSkyForRound(round);

    // 1. Progressive Sky Gradient
    drawPixel(ctx, 0, 0, width, skySplit * 0.30, sky.top);
    drawPixel(ctx, 0, skySplit * 0.30, width, skySplit * 0.25, sky.upper);
    drawPixel(ctx, 0, skySplit * 0.55, width, skySplit * 0.22, sky.mid);
    drawPixel(ctx, 0, skySplit * 0.77, width, skySplit * 0.23, sky.horizon);

    // Night Sky Twinkling Stars (Tier 3)
    if (sky.hasStars) {
        fixedStars.forEach((star) => {
            drawPixel(ctx, width * star.x, skySplit * star.y, star.size, star.size, '#ffffff');
        });
    }

    const groundY = skySplit - 6;

    // 1. SALOON (2-Story False-Front Architecture)
    const saloonX = 4;
    const saloonW = 164;
    const saloonH = 240;
    const saloonY = groundY - saloonH + 10;

    drawPixel(ctx, saloonX, saloonY, saloonW, saloonH, snesPalette.outline);
    drawPixel(ctx, saloonX + 2, saloonY + 2, saloonW - 4, saloonH - 4, '#7c2814');

    for (let row = saloonY + 4; row < groundY + 6; row += 8) {
        drawPixel(ctx, saloonX + 4, row, saloonW - 8, 1, '#581c0e');
    }

    drawPixel(ctx, saloonX + 8, saloonY - 20, saloonW - 16, 20, snesPalette.outline);
    drawPixel(ctx, saloonX + 10, saloonY - 18, saloonW - 20, 16, '#581c0e');
    drawPixel(ctx, saloonX + 30, saloonY - 30, saloonW - 60, 12, snesPalette.outline);
    drawPixel(ctx, saloonX + 32, saloonY - 28, saloonW - 64, 10, '#7c2814');

    const sSignX = saloonX + 16;
    const sSignY = saloonY + 8;
    const sSignW = 132;
    const sSignH = 26;
    drawPixel(ctx, sSignX - 2, sSignY - 2, sSignW + 4, sSignH + 4, snesPalette.outline);
    drawPixel(ctx, sSignX, sSignY, sSignW, sSignH, '#2a1408');
    drawPixel(ctx, sSignX + 2, sSignY + 2, sSignW - 4, sSignH - 4, '#d89c58');
    drawPixel(ctx, sSignX + 4, sSignY + 4, sSignW - 8, sSignH - 8, '#3a1a0c');

    ctx.fillStyle = '#fce0a0';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("SALOON", sSignX + sSignW / 2, sSignY + 18);

    [saloonX + 16, saloonX + 66, saloonX + 116].forEach((winX) => {
        drawPixel(ctx, winX - 2, saloonY + 46, 32, 34, snesPalette.outline);
        drawPixel(ctx, winX, saloonY + 48, 28, 30, '#100c14');
        drawPixel(ctx, winX + 2, saloonY + 50, 6, 26, '#a82c18');
        drawPixel(ctx, winX + 20, saloonY + 50, 6, 26, '#a82c18');
        drawPixel(ctx, winX + 12, saloonY + 48, 4, 30, '#581c0e');
    });

    drawPixel(ctx, saloonX - 4, saloonY + 98, saloonW + 8, 10, snesPalette.outline);
    drawPixel(ctx, saloonX - 2, saloonY + 100, saloonW + 4, 6, '#582410');
    drawPixel(ctx, saloonX + 6, saloonY + 108, 6, 126, snesPalette.outline);
    drawPixel(ctx, saloonX + 152, saloonY + 108, 6, 126, snesPalette.outline);

    [saloonX + 14, saloonX + 116].forEach((winX) => {
        drawPixel(ctx, winX - 2, saloonY + 124, 34, 40, snesPalette.outline);
        drawPixel(ctx, winX, saloonY + 126, 30, 36, '#100c14');
        drawPixel(ctx, winX + 2, saloonY + 128, 8, 32, '#a82c18');
        drawPixel(ctx, winX + 20, saloonY + 128, 8, 32, '#a82c18');
    });

    const sDoorX = saloonX + 60;
    const sDoorY = saloonY + 122;
    drawPixel(ctx, sDoorX - 4, sDoorY - 4, 44, 114, snesPalette.outline);
    drawPixel(ctx, sDoorX - 2, sDoorY - 2, 40, 112, '#140c0a');
    drawPixel(ctx, sDoorX, sDoorY + 36, 17, 50, '#884414');
    drawPixel(ctx, sDoorX + 19, sDoorY + 36, 17, 50, '#884414');
    drawPixel(ctx, sDoorX + 2, sDoorY + 40, 13, 42, '#58280e');
    drawPixel(ctx, sDoorX + 21, sDoorY + 40, 13, 42, '#58280e');

    // 2. SHERIFF'S OFFICE & JAIL
    const sheriffX = 172;
    const sheriffW = 144;
    const sheriffH = 205;
    const sheriffY = groundY - sheriffH + 8;

    drawPixel(ctx, sheriffX, sheriffY, sheriffW, sheriffH, snesPalette.outline);
    drawPixel(ctx, sheriffX + 2, sheriffY + 2, sheriffW - 4, sheriffH - 4, '#5c3822');

    for (let row = sheriffY + 4; row < groundY + 6; row += 7) {
        drawPixel(ctx, sheriffX + 2, row, sheriffW - 4, 1, '#3a2012');
    }

    drawPixel(ctx, sheriffX - 4, sheriffY - 14, sheriffW + 8, 14, snesPalette.outline);
    drawPixel(ctx, sheriffX - 2, sheriffY - 12, sheriffW + 4, 10, '#3a2012');

    const shSignX = sheriffX + 12;
    const shSignY = sheriffY + 10;
    const shSignW = 120;
    const shSignH = 22;
    drawPixel(ctx, shSignX - 2, shSignY - 2, shSignW + 4, shSignH + 4, snesPalette.outline);
    drawPixel(ctx, shSignX, shSignY, shSignW, shSignH, '#201408');
    drawPixel(ctx, shSignX + 2, shSignY + 2, shSignW - 4, shSignH - 4, '#a87848');

    const starX = shSignX + 12;
    const starY = shSignY + 11;
    drawPixel(ctx, starX - 4, starY - 4, 8, 8, '#fce0a0');

    ctx.fillStyle = '#000000';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText("SHERIFF", shSignX + 68, shSignY + 15);

    drawPixel(ctx, sheriffX + 54, sheriffY + 46, 36, 32, snesPalette.outline);
    drawPixel(ctx, sheriffX + 56, sheriffY + 48, 32, 28, '#181014');
    drawPixel(ctx, sheriffX + 70, sheriffY + 48, 4, 28, '#3a2012');

    [sheriffX + 12, sheriffX + 98].forEach((jailWinX) => {
        const jailWinY = sheriffY + 106;
        drawPixel(ctx, jailWinX - 2, jailWinY - 2, 34, 46, snesPalette.outline);
        drawPixel(ctx, jailWinX, jailWinY, 30, 42, '#181014');
        drawPixel(ctx, jailWinX + 8, jailWinY + 14, 4, 4, '#fcb070');
        drawPixel(ctx, jailWinX + 18, jailWinY + 14, 4, 4, '#fcb070');
        drawPixel(ctx, jailWinX + 6, jailWinY, 3, 42, '#888888');
        drawPixel(ctx, jailWinX + 14, jailWinY, 3, 42, '#888888');
        drawPixel(ctx, jailWinX + 22, jailWinY, 3, 42, '#888888');
    });

    const shDoorX = sheriffX + 54;
    const shDoorY = sheriffY + 104;
    drawPixel(ctx, shDoorX - 2, shDoorY - 2, 36, 101, snesPalette.outline);
    drawPixel(ctx, shDoorX, shDoorY, 32, 99, '#3a2012');
    drawPixel(ctx, shDoorX + 4, shDoorY + 6, 24, 40, '#28140a');
    drawPixel(ctx, shDoorX + 4, shDoorY + 52, 24, 42, '#28140a');
    drawPixel(ctx, shDoorX + 24, shDoorY + 48, 4, 4, '#fce0a0');

    // 3. THE BANK
    const bankX = 320;
    const bankW = 152;
    const bankH = 250;
    const bankY = groundY - bankH + 8;

    drawPixel(ctx, bankX, bankY, bankW, bankH, snesPalette.outline);
    drawPixel(ctx, bankX + 2, bankY + 2, bankW - 4, bankH - 4, '#7c8088');

    for (let r = bankY + 6; r < groundY + 6; r += 14) {
        drawPixel(ctx, bankX + 2, r, bankW - 4, 1, '#50545c');
    }
    for (let c = bankX + 18; c < bankX + bankW; c += 28) {
        drawPixel(ctx, c, bankY + 2, 1, bankH - 4, '#50545c');
    }

    drawPixel(ctx, bankX - 6, bankY - 22, bankW + 12, 22, snesPalette.outline);
    drawPixel(ctx, bankX - 4, bankY - 20, bankW + 8, 18, '#585c64');

    const bSignX = bankX + 18;
    const bSignY = bankY + 12;
    const bSignW = 116;
    const bSignH = 26;
    drawPixel(ctx, bSignX - 2, bSignY - 2, bSignW + 4, bSignH + 4, snesPalette.outline);
    drawPixel(ctx, bSignX, bSignY, bSignW, bSignH, '#1c2024');
    drawPixel(ctx, bSignX + 2, bSignY + 2, bSignW - 4, bSignH - 4, '#fce0a0');

    ctx.fillStyle = '#1c2024';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText("BANK", bSignX + bSignW / 2, bSignY + 18);

    [bankX + 14, bankX + 104].forEach((winX) => {
        drawPixel(ctx, winX - 2, bankY + 54, 34, 40, snesPalette.outline);
        drawPixel(ctx, winX, bankY + 56, 30, 36, '#181c20');
        drawPixel(ctx, winX + 8, bankY + 56, 3, 36, '#888888');
        drawPixel(ctx, winX + 18, bankY + 56, 3, 36, '#888888');
    });

    [bankX + 10, bankX + 108].forEach((winX) => {
        drawPixel(ctx, winX - 2, bankY + 124, 34, 46, snesPalette.outline);
        drawPixel(ctx, winX, bankY + 126, 30, 42, '#181c20');
        drawPixel(ctx, winX + 8, bankY + 126, 3, 42, '#888888');
        drawPixel(ctx, winX + 18, bankY + 126, 3, 42, '#888888');
    });

    const bDoorX = bankX + 52;
    const bDoorY = bankY + 118;
    drawPixel(ctx, bDoorX - 4, bDoorY - 4, 48, 128, snesPalette.outline);
    drawPixel(ctx, bDoorX, bDoorY, 40, 124, '#282c34');
    drawPixel(ctx, bDoorX + 18, bDoorY, 4, 124, '#181c20');
    drawPixel(ctx, bDoorX + 6, bDoorY + 10, 12, 48, '#181c20');
    drawPixel(ctx, bDoorX + 22, bDoorY + 10, 12, 48, '#181c20');

    // 4. GENERAL STORE & DRY GOODS
    const storeX = 476;
    const storeW = 156;
    const storeH = 220;
    const storeY = groundY - storeH + 8;

    drawPixel(ctx, storeX, storeY, storeW, storeH, snesPalette.outline);
    drawPixel(ctx, storeX + 2, storeY + 2, storeW - 4, storeH - 4, '#8a5c36');

    for (let row = storeY + 4; row < groundY + 6; row += 6) {
        drawPixel(ctx, storeX + 2, row, storeW - 4, 1, '#5e3e24');
    }

    drawPixel(ctx, storeX + 14, storeY - 18, storeW - 28, 18, snesPalette.outline);
    drawPixel(ctx, storeX + 16, storeY - 16, storeW - 32, 14, '#5e3e24');

    const gsSignX = storeX + 10;
    const gsSignY = storeY + 10;
    const gsSignW = 136;
    const gsSignH = 22;
    drawPixel(ctx, gsSignX - 2, gsSignY - 2, gsSignW + 4, gsSignH + 4, snesPalette.outline);
    drawPixel(ctx, gsSignX, gsSignY, gsSignW, gsSignH, '#201408');
    drawPixel(ctx, gsSignX + 2, gsSignY + 2, gsSignW - 4, gsSignH - 4, '#e4d0a0');

    ctx.fillStyle = '#201408';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText("GENERAL STORE", gsSignX + gsSignW / 2, gsSignY + 15);

    [storeX + 20, storeX + 96].forEach((winX) => {
        drawPixel(ctx, winX - 2, storeY + 46, 40, 32, snesPalette.outline);
        drawPixel(ctx, winX, storeY + 48, 36, 28, '#181014');
        drawPixel(ctx, winX + 16, storeY + 48, 4, 28, '#5e3e24');
    });

    const awnY = storeY + 96;
    drawPixel(ctx, storeX - 6, awnY - 2, storeW + 12, 22, snesPalette.outline);
    for (let stripe = storeX - 4; stripe < storeX + storeW + 8; stripe += 16) {
        drawPixel(ctx, stripe, awnY, 8, 18, '#a82c18');
        drawPixel(ctx, stripe + 8, awnY, 8, 18, '#fcfcfc');
    }

    drawPixel(ctx, storeX + 10, storeY + 130, 44, 46, snesPalette.outline);
    drawPixel(ctx, storeX + 12, storeY + 132, 40, 42, '#181014');
    drawPixel(ctx, storeX + 102, storeY + 130, 44, 46, snesPalette.outline);
    drawPixel(ctx, storeX + 104, storeY + 132, 40, 42, '#181014');

    drawPixel(ctx, storeX + 58, storeY + 126, 40, 86, snesPalette.outline);
    drawPixel(ctx, storeX + 60, storeY + 128, 36, 84, '#482c18');

    // 5. HOTEL & LODGING
    const hotelX = width - 176;
    const hotelW = 172;
    const hotelH = 260;
    const hotelY = groundY - hotelH + 10;

    drawPixel(ctx, hotelX, hotelY, hotelW, hotelH, snesPalette.outline);
    drawPixel(ctx, hotelX + 2, hotelY + 2, hotelW - 4, hotelH - 4, '#a87848');

    for (let row = hotelY + 4; row < groundY + 6; row += 6) {
        drawPixel(ctx, hotelX + 2, row, hotelW - 4, 1, '#78502c');
    }

    drawPixel(ctx, hotelX - 6, hotelY - 24, hotelW + 12, 24, snesPalette.outline);
    drawPixel(ctx, hotelX - 4, hotelY - 22, hotelW + 8, 20, '#582410');

    const hSignX = hotelX + 18;
    const hSignY = hotelY + 10;
    const hSignW = 136;
    const hSignH = 26;
    drawPixel(ctx, hSignX - 2, hSignY - 2, hSignW + 4, hSignH + 4, snesPalette.outline);
    drawPixel(ctx, hSignX, hSignY, hSignW, hSignH, '#381808');
    drawPixel(ctx, hSignX + 2, hSignY + 2, hSignW - 4, hSignH - 4, '#e4d0a0');

    ctx.fillStyle = '#201008';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("HOTEL", hSignX + hSignW / 2, hSignY + 18);

    [hotelX + 12, hotelX + 68, hotelX + 124].forEach((winX) => {
        drawPixel(ctx, winX - 2, hotelY + 50, 32, 34, snesPalette.outline);
        drawPixel(ctx, winX, hotelY + 52, 28, 30, '#181014');
        drawPixel(ctx, winX + 2, hotelY + 54, 6, 26, '#4878a8');
        drawPixel(ctx, winX + 20, hotelY + 54, 6, 26, '#4878a8');
    });

    drawPixel(ctx, hotelX - 6, hotelY + 98, hotelW + 12, 8, snesPalette.outline);
    drawPixel(ctx, hotelX - 4, hotelY + 100, hotelW + 8, 4, '#d89c58');
    for (let post = hotelX; post < hotelX + hotelW; post += 12) {
        drawPixel(ctx, post, hotelY + 90, 2, 10, '#381808');
    }

    [hotelX + 12, hotelX + 124].forEach((winX) => {
        drawPixel(ctx, winX - 2, hotelY + 120, 34, 46, snesPalette.outline);
        drawPixel(ctx, winX, hotelY + 122, 30, 42, '#181014');
        drawPixel(ctx, winX + 2, hotelY + 124, 6, 38, '#4878a8');
        drawPixel(ctx, winX + 22, hotelY + 124, 6, 38, '#4878a8');
    });

    drawPixel(ctx, hotelX + 60, hotelY + 116, 48, 134, snesPalette.outline);
    drawPixel(ctx, hotelX + 62, hotelY + 118, 44, 132, '#482010');
    drawPixel(ctx, hotelX + 83, hotelY + 118, 2, 132, '#201008');

    // 6. HITCHING POST & HORSE
    drawPixel(ctx, 238, groundY - 18, 94, 28, snesPalette.outline);
    drawPixel(ctx, 240, groundY - 16, 90, 6, '#88481c');
    drawPixel(ctx, 244, groundY - 10, 6, 26, '#582c0e');
    drawPixel(ctx, 322, groundY - 10, 6, 26, '#582c0e');

    const horseX = 258;
    const horseY = groundY - 44;

    drawPixel(ctx, horseX, horseY, 52, 36, snesPalette.outline);
    drawPixel(ctx, horseX + 2, horseY + 2, 48, 32, '#582810');
    drawPixel(ctx, horseX + 8, horseY + 6, 32, 18, '#703418');

    drawPixel(ctx, horseX + 38, horseY - 16, 16, 30, snesPalette.outline);
    drawPixel(ctx, horseX + 40, horseY - 14, 12, 26, '#582810');
    drawPixel(ctx, horseX + 46, horseY - 20, 14, 16, snesPalette.outline);
    drawPixel(ctx, horseX + 48, horseY - 18, 10, 12, '#441c08');
    drawPixel(ctx, horseX + 50, horseY - 16, 3, 3, '#ffffff');
    drawPixel(ctx, horseX + 42, horseY - 22, 4, 6, '#582810');

    drawPixel(ctx, horseX + 36, horseY - 16, 4, 20, '#180804');
    drawPixel(ctx, horseX - 4, horseY + 4, 6, 28, '#180804');
    drawPixel(ctx, horseX + 46, horseY - 14, 2, 14, '#fce0a0');

    drawPixel(ctx, horseX + 4, horseY + 34, 6, 18, snesPalette.outline);
    drawPixel(ctx, horseX + 38, horseY + 34, 6, 18, snesPalette.outline);

    // 7. BOARDWALK & ROADWAY
    drawPixel(ctx, 0, groundY - 2, width, 6, snesPalette.outline);
    drawPixel(ctx, 0, groundY, width, 4, snesPalette.boardwalk);

    drawPixel(ctx, 0, groundY + 4, width, height - (groundY + 4), snesPalette.streetDirt);
    drawPixel(ctx, 0, groundY + 28, width, 8, snesPalette.streetRut);
    drawPixel(ctx, 0, groundY + 62, width, 12, snesPalette.streetDeep);
}

// Wanted Poster Screen
function drawWantedPoster(ctx, width, height, outlaw) {
    const cardW = 320;
    const cardH = 340;
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, height);

    drawPixel(ctx, cardX - 6, cardY - 6, cardW + 12, cardH + 12, snesPalette.outline);
    drawPixel(ctx, cardX, cardY, cardW, cardH, '#e4a058');
    drawPixel(ctx, cardX + 8, cardY + 8, cardW - 16, cardH - 16, '#c4784c');

    ctx.fillStyle = '#000000';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("WANTED", width / 2, cardY + 50);

    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText("DEAD OR ALIVE", width / 2, cardY + 75);

    const mugX = width / 2;
    const mugY = cardY + 160;
    drawPixel(ctx, mugX - 45, mugY - 55, 90, 90, snesPalette.outline);
    drawPixel(ctx, mugX - 40, mugY - 50, 80, 80, '#884400');

    if (outlaw && outlaw.isBlondie) {
        drawBlondieCowboy(ctx, mugX, mugY - 10, false);
    } else {
        drawHogansCowboy(ctx, mugX, mugY - 10, outlaw.outfit, true, false);
    }

    ctx.fillStyle = '#000000';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText(outlaw.name, width / 2, cardY + 250);

    ctx.fillStyle = '#882800';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(`REWARD ${outlaw.bounty}`, width / 2, cardY + 290);
}

export function createRenderer(canvas) {
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    context.imageSmoothingEnabled = false;

    return {
        render(state) {
            const shake = state.screenShake || 0;
            const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 6 : 0;
            const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 4 : 0;

            context.save();
            context.translate(Math.floor(shakeX), Math.floor(shakeY));

            if (state.phase === 'wanted') {
                renderHogansBackground(context, width, height, state.round);
                drawWantedPoster(context, width, height, state.currentOutlaw);
                context.restore();
                return;
            }

            // Cinematic Responsive Framing on Mobile
            const isNarrowMobile = typeof window !== 'undefined' && window.innerWidth < 520;
            const zoomScale = isNarrowMobile ? 1.8 : 1.0;

            context.save();
            if (isNarrowMobile) {
                const focalX = width * 0.50;
                const focalY = height * 0.40;
                context.translate(focalX, focalY);
                context.scale(zoomScale, zoomScale);
                context.translate(-focalX, -focalY);
            }

            renderHogansBackground(context, width, height, state.round);

            // Wind Dust FX
            drawDustParticles(context, state.dustParticles, state.round);

            // Tumbleweed
            if (state.tumbleweed && state.tumbleweed.active) {
                drawTumbleweed(context, state.tumbleweed);
            }

            const playerX = isNarrowMobile ? width * 0.28 : width * 0.26;
            const opponentX = isNarrowMobile ? width * 0.72 : width * 0.74;
            const cowboyY = height * 0.40;

            // Player Render
            if (state.playerDeathProgress > 0) {
                drawHogansFallenCowboy(context, playerX, cowboyY, { hat: '#1c202a', body: '#202028' }, false, state.playerDeathProgress);
            } else {
                drawHeroVanCleef(context, playerX, cowboyY, state.playerHasDrawn);
            }

            // Opponent Render
            if (state.opponentDeathProgress > 0) {
                drawHogansFallenCowboy(context, opponentX, cowboyY, state.opponentOutfit, true, state.opponentDeathProgress);
            } else if (state.currentOutlaw && state.currentOutlaw.isBlondie) {
                drawBlondieCowboy(context, opponentX, cowboyY, state.opponentHasDrawn);
            } else {
                drawHogansCowboy(context, opponentX, cowboyY, state.opponentOutfit, true, state.opponentHasDrawn);
            }

            // Muzzle Flash & Smoke
            if (state.muzzleFlash) {
                if (state.muzzleFlash.player > 0) {
                    drawMuzzleBlast(context, playerX + 70, cowboyY + 4, false, state.muzzleFlash.player);
                }
                if (state.muzzleFlash.opponent > 0) {
                    drawMuzzleBlast(context, opponentX - 60, cowboyY + 4, true, state.muzzleFlash.opponent);
                }
            }

            context.restore(); // Exit zoom transform

            // HUD Overlays
            drawTimerMeter(context, width, state.countdownProgress);

            context.fillStyle = '#fce0a0';
            context.font = '28px "Press Start 2P", monospace';
            context.textAlign = 'center';
            context.fillText(state.phaseLabel, width / 2, height - 44);

            context.restore();
        },
    };
}