// render.js - Midnight Spur: Voxel 3D Western Engine (Dynamic Outlaw Face Wanted Posters)
import * as THREE from 'three';

export function createRenderer(canvas) {
    // 1. Scene & Retro Voxel Sky Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x60a8e8);
    scene.fog = new THREE.Fog(0x60a8e8, 14, 38);

    const aspect = canvas.width / canvas.height;
    const fov = aspect < 1.0 ? 52 : (aspect < 1.4 ? 44 : 36);
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.set(0, 1.45, 7.2);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaea, 1.4);
    sunLight.position.set(10, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const playerMuzzleLight = new THREE.PointLight(0xffaa22, 0, 10);
    playerMuzzleLight.position.set(-2.2, 1.15, 0.4);
    scene.add(playerMuzzleLight);

    const opponentMuzzleLight = new THREE.PointLight(0xffaa22, 0, 10);
    opponentMuzzleLight.position.set(2.2, 1.15, 0.4);
    scene.add(opponentMuzzleLight);

    // 3. Ground & Extended Boardwalk
    const blockMat = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true });

    const groundGeo = new THREE.BoxGeometry(48, 2, 24);
    const ground = new THREE.Mesh(groundGeo, blockMat(0xbe783c));
    ground.position.set(0, -1, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    const boardwalkGeo = new THREE.BoxGeometry(32, 0.3, 2.2);
    const boardwalk = new THREE.Mesh(boardwalkGeo, blockMat(0x8a5c36));
    boardwalk.position.set(0, 0.15, -1.5);
    boardwalk.receiveShadow = true;
    boardwalk.castShadow = true;
    scene.add(boardwalk);

    // 4. Spread Voxel Town Buildings
    const townGroup = new THREE.Group();
    scene.add(townGroup);

    function buildVoxelHouse(x, z, w, h, d, wallCol, roofCol) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), blockMat(wallCol));
        wall.position.y = h / 2;
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);

        const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.4, d + 0.4), blockMat(roofCol));
        cornice.position.set(0, h + 0.2, 0);
        cornice.castShadow = true;
        group.add(cornice);

        const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.1), blockMat(0x3e2412));
        door.position.set(0, 0.9, d / 2 + 0.05);
        group.add(door);

        [-w * 0.3, w * 0.3].forEach((wx) => {
            const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.1), blockMat(0x223344));
            win.position.set(wx, 1.4, d / 2 + 0.05);
            group.add(win);
        });

        townGroup.add(group);
    }

    buildVoxelHouse(-7.4, -2.8, 3.8, 4.2, 2.4, 0x8a2c1a, 0x54180c);
    buildVoxelHouse(-3.6, -3.0, 2.8, 3.2, 2.2, 0x6e4428, 0x3d2414);
    buildVoxelHouse(0.0, -3.2, 3.4, 4.4, 2.4, 0x6c7482, 0x484e5a);
    buildVoxelHouse(3.6, -3.0, 2.8, 3.4, 2.2, 0x94643a, 0x5a3a1e);
    buildVoxelHouse(7.4, -2.8, 3.8, 4.6, 2.4, 0xb88452, 0x6a4828);

    // 5. 3D Voxel Wanted Poster Board with Dynamic Outlaw Mugshot
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = 512;
    posterCanvas.height = 700;
    const pctx = posterCanvas.getContext('2d');

    const posterTexture = new THREE.CanvasTexture(posterCanvas);
    posterTexture.magFilter = THREE.NearestFilter;
    posterTexture.minFilter = THREE.NearestFilter;

    const wantedGroup = new THREE.Group();
    wantedGroup.position.set(0, 1.25, -0.15);

    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 0.12), blockMat(0x4a2c14));
    postL.position.set(-0.82, -0.1, -0.04);
    postL.castShadow = true;

    const postR = postL.clone();
    postR.position.set(0.82, -0.1, -0.04);

    const backBoard = new THREE.Mesh(new THREE.BoxGeometry(1.64, 2.15, 0.08), blockMat(0x6e4422));
    backBoard.position.set(0, 0.25, -0.02);
    backBoard.castShadow = true;

    const paperMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.45, 1.95),
        new THREE.MeshBasicMaterial({ map: posterTexture })
    );
    paperMesh.position.set(0, 0.25, 0.03);

    [[-0.68, 1.15], [0.68, 1.15], [-0.68, -0.65], [0.68, -0.65]].forEach(([nx, ny]) => {
        const tack = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.03), blockMat(0x111116));
        tack.position.set(nx, ny, 0.04);
        wantedGroup.add(tack);
    });

    wantedGroup.add(postL, postR, backBoard, paperMesh);
    scene.add(wantedGroup);

    function drawPixelRect(x, y, w, h, color) {
        pctx.fillStyle = color;
        pctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    function updateWantedPoster(outlaw) {
        if (!outlaw) return;
        const name = (outlaw.name || 'UNKNOWN OUTLAW').toUpperCase();
        const bounty = outlaw.bounty ? `${outlaw.bounty.toLocaleString()}` : '$25,000';
        const crime = outlaw.crime || 'TRAIN ROBBERY & MURDER';
        const outfit = outlaw.outfit || {};

        // Archetype color resolution
        let skinColor = '#df9f72';
        let skinShade = '#be7e54';
        let hairColor = '#482a16';
        let hatColor = outfit.hat || '#543622';
        let torsoColor = outfit.body || '#a46034';
        let hasHat = true;
        let isSombrero = false;
        let hasGoatee = false;
        let hasMustache = true;
        let hasCigar = false;
        let isHawkNose = true;

        if (name.includes('TUCO')) {
            isSombrero = true;
            hairColor = '#382010';
            skinColor = '#e0a068';
            skinShade = '#c48850';
            isHawkNose = false;
        } else if (name.includes('INDIO')) {
            hasHat = false;
            hairColor = '#6a6d78';
            torsoColor = '#1a1c24';
            hasMustache = false;
        } else if (outlaw.isBlondie || name.includes('NO NAME')) {
            hasCigar = true;
            hairColor = '#5a3c24';
            hatColor = '#48301c';
            torsoColor = '#486c42';
        } else if (name.includes('BLACK')) {
            hatColor = '#111116';
            torsoColor = '#161820';
            hairColor = '#0e0e12';
            hasGoatee = true;
        }

        // 1. Parchment Background Texture
        pctx.fillStyle = '#e8d4a6';
        pctx.fillRect(0, 0, 512, 700);

        // Aged Border Lines
        pctx.strokeStyle = '#382012';
        pctx.lineWidth = 8;
        pctx.strokeRect(16, 16, 480, 668);
        pctx.lineWidth = 2;
        pctx.strokeRect(26, 26, 460, 648);

        // 2. Star Ornaments & Headers
        pctx.fillStyle = '#382012';
        pctx.font = 'bold 34px monospace';
        pctx.textAlign = 'center';
        pctx.fillText('★  ★  ★', 256, 68);

        pctx.font = '900 48px monospace';
        pctx.fillText('WANTED', 256, 122);
        pctx.font = 'bold 22px monospace';
        pctx.fillText('DEAD OR ALIVE', 256, 154);

        pctx.fillRect(40, 168, 432, 4);

        // 3. Mugshot Background Frame
        pctx.fillStyle = '#cfb684';
        pctx.fillRect(76, 185, 360, 250);
        pctx.strokeStyle = '#382012';
        pctx.lineWidth = 4;
        pctx.strokeRect(76, 185, 360, 250);

        // 4. Exact Outlaw Voxel Face Render (Pixel-by-Pixel Canvas Sculpt)
        const cx = 256;
        const cy = 290;

        // Torso / Coat Shoulders
        drawPixelRect(cx - 88, cy + 85, 176, 60, torsoColor);
        drawPixelRect(cx - 24, cy + 85, 48, 50, '#dedee8'); // Shirt collar

        // Voxel Head & Ears
        drawPixelRect(cx - 56, cy - 25, 112, 115, skinColor);
        drawPixelRect(cx - 68, cy + 15, 12, 35, skinColor); // Ear L
        drawPixelRect(cx + 56, cy + 15, 12, 35, skinColor); // Ear R
        drawPixelRect(cx - 44, cy + 30, 16, 16, skinShade); // Cheek L
        drawPixelRect(cx + 28, cy + 30, 16, 16, skinShade); // Cheek R

        // Hair / Sideburns
        drawPixelRect(cx - 56, cy - 25, 14, 55, hairColor); // Sideburn L
        drawPixelRect(cx + 42, cy - 25, 14, 55, hairColor); // Sideburn R

        if (!hasHat) {
            // Salt & Pepper Indio Mane
            drawPixelRect(cx - 58, cy - 55, 116, 32, hairColor);
            drawPixelRect(cx - 62, cy - 25, 12, 85, hairColor);
            drawPixelRect(cx + 50, cy - 25, 12, 85, hairColor);
            drawPixelRect(cx - 20, cy - 50, 40, 10, '#9a9ea8'); // Grey streaks
        }

        // Piercing Eyes & Slanted Brows (Van Cleef Hawk Look)
        drawPixelRect(cx - 38, cy + 2, 28, 7, hairColor); // Eyebrow L
        drawPixelRect(cx + 10, cy + 2, 28, 7, hairColor); // Eyebrow R

        drawPixelRect(cx - 36, cy + 12, 24, 12, '#ffffff'); // Eye White L
        drawPixelRect(cx + 12, cy + 12, 24, 12, '#ffffff'); // Eye White R
        drawPixelRect(cx - 28, cy + 12, 12, 12, '#111116'); // Pupil L
        drawPixelRect(cx + 16, cy + 12, 12, 12, '#111116'); // Pupil R

        // Nose (Hawk vs Wide)
        if (isHawkNose) {
            drawPixelRect(cx - 6, cy + 15, 12, 32, skinShade);
            drawPixelRect(cx - 8, cy + 42, 16, 12, skinShade);
        } else {
            drawPixelRect(cx - 14, cy + 22, 28, 28, skinShade); // Tuco's broken nose
        }

        // Mustache & Facial Hair
        if (hasMustache) {
            drawPixelRect(cx - 32, cy + 56, 64, 12, hairColor);
        }

        // Mouth Line
        drawPixelRect(cx - 16, cy + 70, 32, 5, '#541c14');

        // Goatee (Van Cleef / Man in Black)
        if (hasGoatee) {
            drawPixelRect(cx - 10, cy + 75, 20, 15, hairColor);
        }

        // Smoking Cheroot (The Man With No Name)
        if (hasCigar) {
            drawPixelRect(cx + 12, cy + 64, 30, 8, '#3d2010');
            drawPixelRect(cx + 42, cy + 64, 8, 8, '#ff4411'); // Glowing tip
        }

        // Hat Render (Wide Flat Brim vs Sombrero)
        if (hasHat) {
            if (isSombrero) {
                drawPixelRect(cx - 140, cy - 30, 280, 20, hatColor);
                drawPixelRect(cx - 65, cy - 75, 130, 48, hatColor);
                drawPixelRect(cx - 65, cy - 35, 130, 8, '#be9458');
            } else {
                drawPixelRect(cx - 110, cy - 30, 220, 16, hatColor);
                drawPixelRect(cx - 52, cy - 65, 104, 38, hatColor);
                drawPixelRect(cx - 52, cy - 32, 104, 6, '#b8281e'); // Red band
            }
        }

        // 5. Outlaw Name, Charges & Bounty Footer
        pctx.fillStyle = '#382012';
        pctx.font = '900 32px monospace';
        pctx.fillText(name, 256, 475);

        pctx.font = 'bold 18px monospace';
        pctx.fillText(crime, 256, 515);

        pctx.fillRect(40, 535, 432, 3);

        pctx.font = 'bold 22px monospace';
        pctx.fillText('REWARD', 256, 575);
        pctx.font = '900 52px monospace';
        pctx.fillText(bounty, 256, 635);

        posterTexture.needsUpdate = true;
    }

    // 6. Detailed Voxel Character & Facial Sculptor
    function createDetailedVoxelCowboy(isHero = false) {
        const root = new THREE.Group();

        root.mats = {
            skin: blockMat(isHero ? 0xebaf84 : 0xdf9f72),
            skinShade: blockMat(isHero ? 0xc88e68 : 0xbe7e54),
            hat: blockMat(isHero ? 0x181a22 : 0x543622),
            torso: blockMat(isHero ? 0x202430 : 0xa46034),
            accent: blockMat(isHero ? 0xb8281e : 0xe8cf8c),
            pants: blockMat(isHero ? 0x161820 : 0x2c4468),
            boots: blockMat(0x18120c),
            gunSteel: blockMat(0x282c38),
            gunSilver: blockMat(0xd4d8e4),
            gold: blockMat(0xf2be34),
            hair: blockMat(isHero ? 0x1c100a : 0x482a16),
            stubble: blockMat(isHero ? 0x9e6a48 : 0x8e5836),
            pupil: blockMat(0x0e1014),
            eyeWhite: blockMat(0xffffff),
            mouth: blockMat(0x6e281e),
            cigar: blockMat(0x482410),
            cigarTip: new THREE.MeshBasicMaterial({ color: 0xff4411 }),
        };

        // Legs
        function createVoxelLeg(xOffset) {
            const legGroup = new THREE.Group();
            legGroup.position.set(xOffset, 0.72, 0);

            const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), root.mats.pants);
            legMesh.position.y = -0.36;
            legMesh.castShadow = true;
            legGroup.add(legMesh);

            const bootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.244, 0.20, 0.244), root.mats.boots);
            bootMesh.position.y = -0.62;
            legGroup.add(bootMesh);

            return legGroup;
        }

        const legL = createVoxelLeg(-0.13);
        const legR = createVoxelLeg(0.13);
        root.add(legL, legR);
        root.legL = legL;
        root.legR = legR;

        // Torso
        const torsoGroup = new THREE.Group();
        torsoGroup.position.set(0, 0.72, 0);

        const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.72, 0.24), root.mats.torso);
        torsoMesh.position.y = 0.36;
        torsoMesh.castShadow = true;
        torsoGroup.add(torsoMesh);

        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.08, 0.25), blockMat(0x3a1a0c));
        belt.position.y = 0.08;
        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.09, 0.26), root.mats.gold);
        buckle.position.y = 0.08;

        const holster = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.22, 0.12), blockMat(0x281208));
        holster.position.set(0.25, 0.04, 0);
        holster.rotation.z = -0.15;
        torsoGroup.add(belt, buckle, holster);

        const overlay = new THREE.Mesh(new THREE.BoxGeometry(0.495, 0.26, 0.255), root.mats.accent);
        overlay.position.y = 0.54;
        torsoGroup.add(overlay);
        root.overlay = overlay;

        root.add(torsoGroup);
        root.torsoGroup = torsoGroup;

        // Head Group
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.44, 0);

        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), root.mats.skin);
        headMesh.position.y = 0.23;
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // Voxel Ears
        const earL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.10, 0.08), root.mats.skin);
        earL.position.set(-0.25, 0.23, 0);
        const earR = earL.clone();
        earR.position.set(0.25, 0.23, 0);
        headGroup.add(earL, earR);

        // High Cheekbones
        const cheekL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), root.mats.skinShade);
        cheekL.position.set(-0.16, 0.18, 0.23);
        const cheekR = cheekL.clone();
        cheekR.position.set(0.16, 0.18, 0.23);
        headGroup.add(cheekL, cheekR);

        // Aquiline Hawk Nose (Van Cleef Signature)
        const noseGroup = new THREE.Group();
        noseGroup.position.set(0, 0.19, 0.23);

        const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.08), root.mats.skin);
        noseBridge.position.set(0, 0.02, 0.04);

        const noseTip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.06), root.mats.skinShade);
        noseTip.position.set(0, -0.04, 0.05);

        noseGroup.add(noseBridge, noseTip);
        headGroup.add(noseGroup);
        root.noseGroup = noseGroup;

        // Slanted Squint Eyes & Brow Ridges
        const browL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), root.mats.hair);
        browL.position.set(-0.12, 0.30, 0.24);
        browL.rotation.z = -0.08;

        const browR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), root.mats.hair);
        browR.position.set(0.12, 0.30, 0.24);
        browR.rotation.z = 0.08;

        function createSlantedEye(x) {
            const eye = new THREE.Group();
            eye.position.set(x, 0.24, 0.232);

            const w = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.045), root.mats.eyeWhite);
            const p = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.045), root.mats.pupil);
            p.position.set(x > 0 ? 0.02 : -0.02, 0, 0.002);

            eye.add(w, p);
            return eye;
        }

        headGroup.add(browL, browR, createSlantedEye(-0.12), createSlantedEye(0.12));

        // Trimmed Mustache, Mouth & Chin Goatee
        const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.04), root.mats.hair);
        mustache.position.set(0, 0.13, 0.24);

        const mouth = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 0.02), root.mats.mouth);
        mouth.position.set(0, 0.09, 0.233);

        const goatee = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), root.mats.hair);
        goatee.position.set(0, 0.04, 0.24);

        headGroup.add(mustache, mouth, goatee);
        root.mustache = mustache;
        root.goatee = goatee;

        // Sideburns
        const sideburnL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.08), root.mats.hair);
        sideburnL.position.set(-0.24, 0.28, 0.10);
        const sideburnR = sideburnL.clone();
        sideburnR.position.set(0.24, 0.28, 0.10);
        headGroup.add(sideburnL, sideburnR);

        // Hat Assembly
        const hatGroup = new THREE.Group();
        hatGroup.position.set(0, 0.46, 0);

        const brim = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.05, 0.92), root.mats.hat);
        brim.castShadow = true;

        const crown = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.20, 0.50), root.mats.hat);
        crown.position.set(0, 0.12, 0);
        crown.castShadow = true;

        const band = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.52), root.mats.accent);
        band.position.set(0, 0.04, 0);

        hatGroup.add(brim, crown, band);
        headGroup.add(hatGroup);
        root.hatGroup = hatGroup;
        root.hatBrim = brim;

        // Hatless Hair
        const hairLayer = new THREE.Group();
        hairLayer.position.set(0, 0.23, 0);

        const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.48), root.mats.hair);
        hairTop.position.set(0, 0.20, 0);

        const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.10), root.mats.hair);
        hairBack.position.set(0, 0.06, -0.20);

        hairLayer.add(hairTop, hairBack);
        hairLayer.visible = false;
        headGroup.add(hairLayer);
        root.hairLayer = hairLayer;

        // Cigarillo
        const cigarGroup = new THREE.Group();
        cigarGroup.position.set(0.08, 0.08, 0.26);
        const cigarBody = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.14), root.mats.cigar);
        const cigarTip = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.038, 0.03), root.mats.cigarTip);
        cigarTip.position.set(0, 0, 0.08);
        cigarGroup.add(cigarBody, cigarTip);
        cigarGroup.visible = false;
        headGroup.add(cigarGroup);
        root.cigarGroup = cigarGroup;

        root.add(headGroup);
        root.headGroup = headGroup;

        // Left Resting Arm
        const armLeftGroup = new THREE.Group();
        armLeftGroup.position.set(-0.36, 1.38, 0);

        const armLeftMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), root.mats.torso);
        armLeftMesh.position.y = -0.30;
        armLeftMesh.castShadow = true;
        armLeftGroup.add(armLeftMesh);
        root.add(armLeftGroup);

        // Right Arm & Peacemaker
        const armRightGroup = new THREE.Group();
        armRightGroup.position.set(0.36, 1.38, 0);

        const armRightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), root.mats.torso);
        armRightMesh.position.y = -0.30;
        armRightMesh.castShadow = true;
        armRightGroup.add(armRightMesh);

        const handTip = new THREE.Mesh(new THREE.BoxGeometry(0.242, 0.16, 0.242), root.mats.skin);
        handTip.position.y = -0.58;
        armRightGroup.add(handTip);

        const gun = new THREE.Group();
        gun.position.set(0, -0.62, 0.10);
        gun.rotation.x = Math.PI / 2;

        const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.44), root.mats.gunSteel);
        barrel.position.set(0, 0.05, 0.22);
        barrel.castShadow = true;

        const sight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.04), root.mats.gunSilver);
        sight.position.set(0, 0.10, 0.40);

        const cylinder = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.16), root.mats.gunSilver);
        cylinder.position.set(0, 0.04, 0.04);
        cylinder.castShadow = true;

        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.18), root.mats.gunSteel);
        frame.position.set(0, 0.03, -0.05);

        const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.05), root.mats.gunSilver);
        hammer.position.set(0, 0.11, -0.12);

        const triggerGuard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.08), root.mats.gunSteel);
        triggerGuard.position.set(0, -0.06, -0.02);

        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.20, 0.09), blockMat(0x4a2410));
        grip.position.set(0, -0.10, -0.10);
        grip.rotation.x = -0.38;
        grip.castShadow = true;

        gun.add(barrel, sight, cylinder, frame, hammer, triggerGuard, grip);
        armRightGroup.add(gun);

        root.add(armRightGroup);
        root.armRightGroup = armRightGroup;
        root.gun = gun;

        return root;
    }

    const player = createDetailedVoxelCowboy(true);
    player.position.set(-2.8, 0, 0);
    player.rotation.y = Math.PI / 2.3;
    scene.add(player);

    const opponent = createDetailedVoxelCowboy(false);
    opponent.position.set(2.8, 0, 0);
    opponent.rotation.y = -Math.PI / 2.3;
    scene.add(opponent);

    // 7. Circular 3D Tumbleweed
    const twGroup = new THREE.Group();
    const twCore = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.24, 1),
        new THREE.MeshLambertMaterial({ color: 0x8c5828, wireframe: true })
    );
    const twFibers = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.28, 1),
        new THREE.MeshLambertMaterial({ color: 0xd4944c, wireframe: true })
    );
    twGroup.add(twCore, twFibers);
    twGroup.castShadow = true;
    twGroup.position.set(0, 0.28, 0.8);
    scene.add(twGroup);

    // 8. Sky Tiers
    function updateVoxelSky(round = 1) {
        if (round <= 5) {
            scene.background.setHex(0x60a8e8);
            scene.fog.color.setHex(0x60a8e8);
            sunLight.color.setHex(0xfffaea);
            sunLight.intensity = 1.4;
        } else if (round <= 12) {
            scene.background.setHex(0xb84424);
            scene.fog.color.setHex(0xb84424);
            sunLight.color.setHex(0xffaa44);
            sunLight.intensity = 1.3;
        } else {
            scene.background.setHex(0x0e1424);
            scene.fog.color.setHex(0x0e1424);
            sunLight.color.setHex(0x7799cc);
            sunLight.intensity = 0.7;
        }
    }

    let lastOutlawName = '';

    function syncOpponentArchetype(outlaw) {
        if (!outlaw) return;
        const outfit = outlaw.outfit || {};
        const name = outlaw.name || '';

        if (name !== lastOutlawName) {
            lastOutlawName = name;
            updateWantedPoster(outlaw);
        }

        opponent.hatGroup.visible = true;
        opponent.hairLayer.visible = false;
        opponent.cigarGroup.visible = false;
        opponent.mustache.visible = true;
        opponent.goatee.visible = false;
        opponent.hatBrim.scale.set(1.0, 1.0, 1.0);
        opponent.noseGroup.scale.set(1.0, 1.0, 1.0);

        opponent.mats.hat.color.setStyle(outfit.hat || '#543622');
        opponent.mats.torso.color.setStyle(outfit.body || '#a46034');
        opponent.mats.accent.color.setStyle(outfit.accent || '#e8cf8c');

        if (name.includes('TUCO')) {
            opponent.hatBrim.scale.set(1.40, 1.0, 1.40);
            opponent.noseGroup.scale.set(1.4, 0.8, 1.2);
            opponent.mats.hair.color.setHex(0x382010);
            opponent.mats.pants.color.setHex(0x4a3c28);
        } else if (name.includes('INDIO')) {
            opponent.hatGroup.visible = false;
            opponent.hairLayer.visible = true;
            opponent.noseGroup.scale.set(0.9, 1.2, 1.1);
            opponent.mats.hair.color.setHex(0x6a6d78);
            opponent.mats.torso.color.setHex(0x1a1c24);
            opponent.mats.accent.color.setHex(0xf4be34);
            opponent.mustache.visible = false;
        } else if (outlaw.isBlondie || name.includes('NO NAME')) {
            opponent.cigarGroup.visible = true;
            opponent.hatBrim.scale.set(1.15, 1.0, 0.9);
            opponent.mats.hair.color.setHex(0x5a3c24);
            opponent.mats.accent.color.setHex(0x486c42);
            opponent.mats.pants.color.setHex(0x2c4874);
        } else if (name.includes('BLACK')) {
            opponent.mats.hat.color.setHex(0x111116);
            opponent.mats.torso.color.setHex(0x161820);
            opponent.mats.pants.color.setHex(0x111116);
            opponent.mats.hair.color.setHex(0x0e0e12);
            opponent.goatee.visible = true;
        }
    }

    const clockTimer = new THREE.Clock();
    let elapsedTime = 0;
    const xAxis = new THREE.Vector3(1, 0, 0);

    return {
        render(state) {
            const delta = Math.min(clockTimer.getDelta(), 0.1);
            elapsedTime += delta;

            updateVoxelSky(state.round);
            syncOpponentArchetype(state.currentOutlaw);

            // 1. Camera Tracking & Screen Shake
            const shake = state.screenShake || 0;
            const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 0.12 : 0;
            const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 0.08 : 0;

            const currentAspect = canvas.width / canvas.height;
            const baseCamZ = currentAspect < 1.0 ? 9.2 : (currentAspect < 1.4 ? 8.2 : 7.2);

            if (state.phase === 'wanted') {
                wantedGroup.visible = true;
                camera.position.x = THREE.MathUtils.lerp(camera.position.x, shakeX, 0.12);
                camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.45 + shakeY, 0.12);
                camera.position.z = THREE.MathUtils.lerp(camera.position.z, 2.75, 0.12);
                camera.lookAt(0, 1.45, 0);
            } else {
                wantedGroup.visible = false;
                if (state.phase === 'countdown' || state.phase === 'duel') {
                    camera.position.x = THREE.MathUtils.lerp(camera.position.x, shakeX, 0.1);
                    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.45 + shakeY, 0.1);
                    camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseCamZ - (state.tension || 0) * 0.6, 0.1);
                } else {
                    camera.position.set(shakeX, 1.5 + shakeY, baseCamZ + 0.4);
                }
                camera.lookAt(0, 1.0, 0);
            }

            // 2. Smooth Breathing & Hand Hover
            const tension = state.tension || 0;

            if (!state.playerHasDrawn && state.playerDeathProgress === 0) {
                const breath = Math.sin(elapsedTime * 2.2) * 0.012;
                const handHover = Math.sin(elapsedTime * 3.6) * (0.01 + tension * 0.025);

                player.torsoGroup.position.y = 0.72 + breath;
                player.armRightGroup.rotation.x = 0.16 + handHover;
                player.armRightGroup.rotation.z = -0.06;
                player.headGroup.rotation.y = Math.sin(elapsedTime * 1.2) * 0.02;
            }

            if (!state.opponentHasDrawn && state.opponentDeathProgress === 0) {
                const breath = Math.cos(elapsedTime * 2.2) * 0.012;
                const handHover = Math.cos(elapsedTime * 3.6) * (0.01 + tension * 0.025);

                opponent.torsoGroup.position.y = 0.72 + breath;
                opponent.armRightGroup.rotation.x = 0.16 + handHover;
                opponent.armRightGroup.rotation.z = -0.06;
                opponent.headGroup.rotation.y = Math.cos(elapsedTime * 1.2) * 0.02;
            }

            // 3. Quick-Draw Snap + Recoil Kick
            if (state.playerHasDrawn) {
                const recoil = state.muzzleFlash && state.muzzleFlash.player > 0 ? -0.22 : 0;
                player.armRightGroup.rotation.x = THREE.MathUtils.lerp(player.armRightGroup.rotation.x, -Math.PI / 2 + recoil, 0.55);
                player.armRightGroup.rotation.z = 0;
            }

            if (state.opponentHasDrawn) {
                const recoil = state.muzzleFlash && state.muzzleFlash.opponent > 0 ? -0.22 : 0;
                opponent.armRightGroup.rotation.x = THREE.MathUtils.lerp(opponent.armRightGroup.rotation.x, -Math.PI / 2 + recoil, 0.55);
                opponent.armRightGroup.rotation.z = 0;
            }

            // 4. Backward Knockback Fall
            if (state.playerDeathProgress > 0) {
                const t = state.playerDeathProgress;
                player.rotation.set(0, Math.PI / 2.3, 0);
                player.rotateOnAxis(xAxis, -t * (Math.PI / 2.05));
                player.position.set(
                    -2.8 - Math.sin(Math.PI / 2.3) * (t * 0.6),
                    THREE.MathUtils.lerp(0, 0.18, t),
                    -Math.cos(Math.PI / 2.3) * (t * 0.6)
                );
            } else {
                player.position.set(-2.8, 0, 0);
                player.rotation.set(0, Math.PI / 2.3, 0);
            }

            if (state.opponentDeathProgress > 0) {
                const t = state.opponentDeathProgress;
                opponent.rotation.set(0, -Math.PI / 2.3, 0);
                opponent.rotateOnAxis(xAxis, -t * (Math.PI / 2.05));
                opponent.position.set(
                    2.8 + Math.sin(Math.PI / 2.3) * (t * 0.6),
                    THREE.MathUtils.lerp(0, 0.18, t),
                    -Math.cos(Math.PI / 2.3) * (t * 0.6)
                );
            } else {
                opponent.position.set(2.8, 0, 0);
                opponent.rotation.set(0, -Math.PI / 2.3, 0);
            }

            // 5. Circular Tumbleweed Rolling & Bouncing
            if (state.tumbleweed && state.tumbleweed.active) {
                twGroup.visible = true;
                twGroup.position.x = ((state.tumbleweed.x / canvas.width) - 0.5) * 11.0;
                twGroup.position.y = 0.28 + Math.abs(Math.sin((state.tumbleweed.bouncePhase || 0))) * 0.22;
                twGroup.rotation.z = -(state.tumbleweed.rotation || 0);
                twGroup.rotation.y += 0.03;
            } else {
                twGroup.visible = false;
            }

            // 6. Dynamic Muzzle Flash Point Lights
            if (state.muzzleFlash) {
                playerMuzzleLight.intensity = state.muzzleFlash.player > 0 ? 8 : 0;
                opponentMuzzleLight.intensity = state.muzzleFlash.opponent > 0 ? 8 : 0;
            }

            renderer.render(scene, camera);
        }
    };
}