// render.js - Midnight Spur: Stylized Nintendo / Mario-Style Western Caricature Engine
import * as THREE from 'three';

export function createRenderer(canvas) {
    // 1. Scene & Atmosphere Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x629de0);
    scene.fog = new THREE.FogExp2(0x8ebcf0, 0.038);

    const aspect = canvas.width / canvas.height;
    const fov = aspect < 1.0 ? 52 : (aspect < 1.4 ? 44 : 36);
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.set(0, 1.45, 7.2);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    const toonMat = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true });

    // 2. Dynamic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xf4e6d0, 0.90);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff1dc, 1.6);
    sunLight.position.set(12, 18, 9);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xd67a48, 0.65);
    rimLight.position.set(-10, 6, -8);
    scene.add(rimLight);

    const playerMuzzleLight = new THREE.PointLight(0xffaa22, 0, 10);
    playerMuzzleLight.position.set(-2.2, 1.15, 0.4);
    scene.add(playerMuzzleLight);

    const opponentMuzzleLight = new THREE.PointLight(0xffaa22, 0, 10);
    opponentMuzzleLight.position.set(2.2, 1.15, 0.4);
    scene.add(opponentMuzzleLight);

    // 3. Ground & Boardwalk
    const groundGeo = new THREE.BoxGeometry(54, 2, 28);
    const ground = new THREE.Mesh(groundGeo, toonMat(0xbe783c));
    ground.position.set(0, -1, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    const boardwalkGroup = new THREE.Group();
    const mainWalk = new THREE.Mesh(new THREE.BoxGeometry(34, 0.28, 2.4), toonMat(0x845630));
    mainWalk.position.set(0, 0.14, -1.5);
    mainWalk.receiveShadow = true;
    mainWalk.castShadow = true;
    boardwalkGroup.add(mainWalk);

    const walkLip = new THREE.Mesh(new THREE.BoxGeometry(34.2, 0.32, 0.12), toonMat(0x5a361a));
    walkLip.position.set(0, 0.14, -0.3);
    boardwalkGroup.add(walkLip);
    scene.add(boardwalkGroup);

    // 4. Western Town Buildings
    const townGroup = new THREE.Group();
    scene.add(townGroup);

    function buildSaloonBuilding(x, z, w, h, d, wallCol, trimCol, isSaloon = false) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toonMat(wallCol));
        wall.position.y = h / 2;
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);

        const falseFront = new THREE.Mesh(new THREE.BoxGeometry(w + 0.15, 0.9, 0.18), toonMat(wallCol));
        falseFront.position.set(0, h + 0.45, d / 2 - 0.06);
        falseFront.castShadow = true;
        group.add(falseFront);

        const pediment = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, 0.5, 0.2), toonMat(trimCol));
        pediment.position.set(0, h + 0.95, d / 2 - 0.05);
        pediment.castShadow = true;
        group.add(pediment);

        const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.25, d + 0.3), toonMat(trimCol));
        cornice.position.set(0, h + 0.12, 0);
        cornice.castShadow = true;
        group.add(cornice);

        const awningRoof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.12, 1.3), toonMat(trimCol));
        awningRoof.position.set(0, 2.55, d / 2 + 0.65);
        awningRoof.rotation.x = 0.08;
        awningRoof.castShadow = true;
        group.add(awningRoof);

        [-w * 0.44, w * 0.44].forEach((px) => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), toonMat(0x482a14));
            post.position.set(px, 1.25, d / 2 + 1.22);
            post.castShadow = true;
            group.add(post);
        });

        const hitchRail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.08, 0.08), toonMat(0x3e2210));
        hitchRail.position.set(0, 0.75, d / 2 + 1.35);
        const hPostL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), toonMat(0x3e2210));
        hPostL.position.set(-w * 0.32, 0.375, d / 2 + 1.35);
        const hPostR = hPostL.clone();
        hPostR.position.set(w * 0.32, 0.375, d / 2 + 1.35);
        group.add(hitchRail, hPostL, hPostR);

        if (isSaloon) {
            const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.9, 0.1), toonMat(0x28160a));
            doorFrame.position.set(0, 0.95, d / 2 + 0.04);
            const batL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.85, 0.06), toonMat(0x8e5224));
            batL.position.set(-0.23, 1.05, d / 2 + 0.1);
            batL.rotation.y = 0.25;
            const batR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.85, 0.06), toonMat(0x8e5224));
            batR.position.set(0.23, 1.05, d / 2 + 0.1);
            batR.rotation.y = -0.25;
            group.add(doorFrame, batL, batR);
        } else {
            const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.08), toonMat(0x2c170a));
            door.position.set(0, 0.9, d / 2 + 0.05);
            group.add(door);
        }

        [-w * 0.28, w * 0.28].forEach((wx) => {
            const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.95, 0.12), toonMat(0x24160e));
            winFrame.position.set(wx, 1.45, d / 2 + 0.05);
            const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.82, 0.13), toonMat(0x182434));
            winGlass.position.set(wx, 1.45, d / 2 + 0.05);
            group.add(winFrame, winGlass);

            if (h >= 3.8) {
                const winUp = winFrame.clone();
                winUp.position.set(wx, h - 0.9, d / 2 + 0.05);
                group.add(winUp);
            }
        });

        if (Math.abs(x) > 2) {
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.65, 32), toonMat(0x56341a));
            barrel.position.set(w * 0.44 + (x > 0 ? 0.35 : -0.35), 0.325, d / 2 + 0.7);
            barrel.castShadow = true;
            const crate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), toonMat(0x764c28));
            crate.position.set(barrel.position.x, 0.225, d / 2 + 0.1);
            crate.castShadow = true;
            group.add(barrel, crate);
        }

        townGroup.add(group);
    }

    buildSaloonBuilding(-7.6, -3.2, 4.0, 4.2, 2.6, 0x8a2c1a, 0x54180c, false);
    buildSaloonBuilding(-3.7, -3.4, 3.2, 3.4, 2.4, 0x6e4428, 0x3d2414, false);
    buildSaloonBuilding(0.0, -3.6, 3.8, 4.8, 2.6, 0x5a6372, 0x3c434f, true);
    buildSaloonBuilding(3.7, -3.4, 3.2, 3.6, 2.4, 0x94643a, 0x5a3a1e, false);
    buildSaloonBuilding(7.6, -3.2, 4.0, 4.4, 2.6, 0xa87848, 0x624222, false);

    // 5. 3D Wanted Poster Board
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = 512;
    posterCanvas.height = 700;
    const pctx = posterCanvas.getContext('2d');

    const posterTexture = new THREE.CanvasTexture(posterCanvas);
    posterTexture.magFilter = THREE.NearestFilter;
    posterTexture.minFilter = THREE.NearestFilter;

    const wantedGroup = new THREE.Group();
    wantedGroup.position.set(0, 1.25, -0.15);

    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 0.12), toonMat(0x4a2c14));
    postL.position.set(-0.82, -0.1, -0.04);
    postL.castShadow = true;

    const postR = postL.clone();
    postR.position.set(0.82, -0.1, -0.04);

    const backBoard = new THREE.Mesh(new THREE.BoxGeometry(1.64, 2.15, 0.08), toonMat(0x6e4422));
    backBoard.position.set(0, 0.25, -0.02);
    backBoard.castShadow = true;

    const paperMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.45, 1.95),
        new THREE.MeshBasicMaterial({ map: posterTexture })
    );
    paperMesh.position.set(0, 0.25, 0.03);

    [[-0.68, 1.15], [0.68, 1.15], [-0.68, -0.65], [0.68, -0.65]].forEach(([nx, ny]) => {
        const tack = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.03), toonMat(0x111116));
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
        const bounty = outlaw.bounty ? `${outlaw.bounty}` : '$25,000';
        const crime = outlaw.crime || 'TRAIN ROBBERY & MURDER';
        const outfit = outlaw.outfit || {};

        let skinColor = '#e8aa78';
        let hairColor = '#3c2214';
        let hatColor = outfit.hat || '#543622';
        let torsoColor = outfit.body || '#a46034';
        let hasHat = true;
        let isSombrero = false;
        let hasGoatee = false;
        let hasMustache = true;
        let hasCigar = false;

        if (name.includes('TUCO')) {
            isSombrero = true;
            hairColor = '#382010';
            skinColor = '#e0a068';
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

        pctx.fillStyle = '#e8d4a6';
        pctx.fillRect(0, 0, 512, 700);

        pctx.strokeStyle = '#382012';
        pctx.lineWidth = 8;
        pctx.strokeRect(16, 16, 480, 668);
        pctx.lineWidth = 2;
        pctx.strokeRect(26, 26, 460, 648);

        pctx.fillStyle = '#382012';
        pctx.font = 'bold 34px monospace';
        pctx.textAlign = 'center';
        pctx.fillText('★  ★  ★', 256, 68);

        pctx.font = '900 48px monospace';
        pctx.fillText('WANTED', 256, 122);
        pctx.font = 'bold 22px monospace';
        pctx.fillText('DEAD OR ALIVE', 256, 154);

        pctx.fillRect(40, 168, 432, 4);

        pctx.fillStyle = '#cfb684';
        pctx.fillRect(76, 185, 360, 250);
        pctx.strokeStyle = '#382012';
        pctx.lineWidth = 4;
        pctx.strokeRect(76, 185, 360, 250);

        const cx = 256;
        const cy = 290;

        drawPixelRect(cx - 88, cy + 85, 176, 60, torsoColor);
        drawPixelRect(cx - 24, cy + 85, 48, 50, '#dedee8');

        drawPixelRect(cx - 56, cy - 25, 112, 115, skinColor);
        drawPixelRect(cx - 68, cy + 15, 12, 35, skinColor);
        drawPixelRect(cx + 56, cy + 15, 12, 35, skinColor);

        drawPixelRect(cx - 56, cy - 25, 14, 55, hairColor);
        drawPixelRect(cx + 42, cy - 25, 14, 55, hairColor);

        if (!hasHat) {
            drawPixelRect(cx - 58, cy - 55, 116, 32, hairColor);
            drawPixelRect(cx - 62, cy - 25, 12, 85, hairColor);
            drawPixelRect(cx + 50, cy - 25, 12, 85, hairColor);
        }

        drawPixelRect(cx - 38, cy + 2, 28, 7, hairColor);
        drawPixelRect(cx + 10, cy + 2, 28, 7, hairColor);

        drawPixelRect(cx - 36, cy + 12, 24, 12, '#ffffff');
        drawPixelRect(cx + 12, cy + 12, 24, 12, '#ffffff');
        drawPixelRect(cx - 28, cy + 12, 12, 12, '#111116');
        drawPixelRect(cx + 16, cy + 12, 12, 12, '#111116');

        // Mario-style big rounded nose
        drawPixelRect(cx - 16, cy + 24, 32, 28, skinColor);
        drawPixelRect(cx - 18, cy + 28, 36, 20, '#d89464');

        if (hasMustache) drawPixelRect(cx - 40, cy + 54, 80, 16, hairColor);
        drawPixelRect(cx - 16, cy + 74, 32, 5, '#541c14');
        if (hasGoatee) drawPixelRect(cx - 10, cy + 79, 20, 15, hairColor);

        if (hasCigar) {
            drawPixelRect(cx + 12, cy + 64, 30, 8, '#3d2010');
            drawPixelRect(cx + 42, cy + 64, 8, 8, '#ff4411');
        }

        if (hasHat) {
            if (isSombrero) {
                drawPixelRect(cx - 140, cy - 30, 280, 20, hatColor);
                drawPixelRect(cx - 65, cy - 75, 130, 48, hatColor);
                drawPixelRect(cx - 65, cy - 35, 130, 8, '#be9458');
            } else {
                drawPixelRect(cx - 110, cy - 30, 220, 16, hatColor);
                drawPixelRect(cx - 52, cy - 65, 104, 38, hatColor);
                drawPixelRect(cx - 52, cy - 32, 104, 6, '#b8281e');
            }
        }

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

    // 6. Mario / Nintendo-Style Stylized Character Sculptor
    function createDetailedVoxelCowboy(isHero = false) {
        const root = new THREE.Group();

        root.mats = {
            skin: toonMat(isHero ? 0xf4b48a : 0xebb082),
            nose: toonMat(isHero ? 0xe59b70 : 0xdb9468),
            hat: toonMat(isHero ? 0x1a1e28 : 0x543622),
            torso: toonMat(isHero ? 0x222a3a : 0xa46034),
            accent: toonMat(isHero ? 0xc83226 : 0xe8cf8c),
            pants: toonMat(isHero ? 0x161a22 : 0x2c4468),
            boots: toonMat(0x1a140e),
            glove: toonMat(isHero ? 0xf0efe8 : 0xd8c29d),
            gold: toonMat(0xf4c038),
            silver: toonMat(0xb8c0cc),
            hair: toonMat(isHero ? 0x22140a : 0x482a16),
            eyeWhite: toonMat(0xffffff),
            iris: toonMat(isHero ? 0x2864b0 : 0x4e2c14),
            pupil: toonMat(0x0a0c10),
            cigar: toonMat(0x482410),
            cigarTip: new THREE.MeshBasicMaterial({ color: 0xff4411 }),
            bluedSteel: toonMat(0x1a1c22),
            bluedSteelAccent: toonMat(0x282c36),
            ejectorRod: toonMat(0x121418),
            brassTrigger: toonMat(0xc49a45),
            walnutGrip: toonMat(0x381e0e),
        };

        // --- LOWER BODY: CHUNKY LEGS & BOOTS (Mario Style) ---
        function createToonLeg(xOffset) {
            const legGroup = new THREE.Group();
            legGroup.position.set(xOffset, 0.58, 0);

            // Sturdy tapered leg
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.10, 0.55, 32), root.mats.pants);
            leg.position.y = -0.27;
            leg.castShadow = true;
            legGroup.add(leg);

            // Big rounded boot
            const bootGroup = new THREE.Group();
            bootGroup.position.set(0, -0.56, 0);

            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.10, 0.12, 32), root.mats.boots);
            const toe = new THREE.Mesh(new THREE.SphereGeometry(0.115, 32, 16), root.mats.boots);
            toe.position.set(0, -0.04, 0.08);
            toe.scale.set(1.0, 0.75, 1.25);

            const heel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 24), root.mats.boots);
            heel.position.set(0, -0.045, -0.04);

            const spur = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 12), root.mats.silver);
            spur.position.set(0, -0.02, -0.11);

            bootGroup.add(shaft, toe, heel, spur);
            legGroup.add(bootGroup);

            return legGroup;
        }

        const legL = createToonLeg(-0.16);
        const legR = createToonLeg(0.16);
        root.add(legL, legR);
        root.legL = legL;
        root.legR = legR;

        // --- TORSO: ROUNDED BARREL CHEST & WAIST ---
        const torsoGroup = new THREE.Group();
        torsoGroup.position.set(0, 0.58, 0);

        // Rounded spherical belly/chest blend
        const chest = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 24), root.mats.torso);
        chest.position.y = 0.38;
        chest.scale.set(1.05, 1.15, 0.88);
        chest.castShadow = true;
        torsoGroup.add(chest);

        // Chunky Leather Belt & Big Buckle
        const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.29, 0.09, 32), toonMat(0x3a1a0c));
        belt.position.y = 0.10;
        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.09, 0.32), root.mats.gold);
        buckle.position.y = 0.10;

        const holster = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 24), toonMat(0x281208));
        holster.position.set(0.28, 0.04, 0.04);
        holster.rotation.z = -0.18;
        torsoGroup.add(belt, buckle, holster);

        // Poncho Trim
        const overlay = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.28, 0.24, 32), root.mats.accent);
        overlay.position.y = 0.50;
        torsoGroup.add(overlay);
        root.overlay = overlay;

        // Short stout neck
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.11, 0.12, 32), root.mats.skin);
        neck.position.set(0, 0.72, 0);
        torsoGroup.add(neck);

        root.add(torsoGroup);
        root.torsoGroup = torsoGroup;

        // --- HEAD: MARIO-STYLE PROPORTIONAL BULBOUS FACIAL SCULPT ---
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.45, 0);

        // 1. Big Spherical Head
        const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.26, 36, 28), root.mats.skin);
        headSphere.position.set(0, 0.14, 0);
        headSphere.scale.set(1.05, 1.0, 1.08);
        headSphere.castShadow = true;
        headGroup.add(headSphere);

        // 2. Signature Mario-Style Bulbous Nose (Protruding outward!)
        const noseGroup = new THREE.Group();
        noseGroup.position.set(0, 0.14, 0.26);

        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.095, 32, 24), root.mats.nose);
        nose.scale.set(1.15, 0.95, 1.1);
        noseGroup.add(nose);
        headGroup.add(noseGroup);
        root.noseGroup = noseGroup;

        // 3. Curved Low-Poly Mustache Arch (Rests right under the nose)
        const mustacheGroup = new THREE.Group();
        mustacheGroup.position.set(0, 0.07, 0.24);

        const stacheL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 16), root.mats.hair);
        stacheL.position.set(-0.07, 0, 0);
        stacheL.scale.set(1.2, 0.55, 0.8);
        stacheL.rotation.z = 0.25;

        const stacheR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 16), root.mats.hair);
        stacheR.position.set(0.07, 0, 0);
        stacheR.scale.set(1.2, 0.55, 0.8);
        stacheR.rotation.z = -0.25;

        const goatee = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 14), root.mats.hair);
        goatee.position.set(0, -0.08, -0.04);
        goatee.scale.set(1.0, 0.7, 0.9);

        mustacheGroup.add(stacheL, stacheR, goatee);
        headGroup.add(mustacheGroup);
        root.mustache = mustacheGroup;
        root.goatee = goatee;

        // 4. Clean Almond Eyes (White Sclera + Colored Iris + Pupil + Specular Glint)
        function createToonEye(x) {
            const eye = new THREE.Group();
            eye.position.set(x, 0.22, 0.22);
            eye.rotation.y = x > 0 ? 0.22 : -0.22;

            // Eye White
            const white = new THREE.Mesh(new THREE.SphereGeometry(0.048, 24, 18), root.mats.eyeWhite);
            white.scale.set(0.85, 1.25, 0.45);

            // Iris
            const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.005, 24), root.mats.iris);
            iris.position.set(x > 0 ? 0.004 : -0.004, 0, 0.022);
            iris.rotation.x = Math.PI / 2;

            // Pupil
            const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 20), root.mats.pupil);
            pupil.position.set(x > 0 ? 0.004 : -0.004, 0, 0.024);
            pupil.rotation.x = Math.PI / 2;

            // White Catchlight / Glint
            const glint = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.007, 12), root.mats.eyeWhite);
            glint.position.set(x > 0 ? 0.010 : 0.002, 0.008, 0.025);
            glint.rotation.x = Math.PI / 2;

            eye.add(white, iris, pupil, glint);
            return eye;
        }

        headGroup.add(createToonEye(-0.09), createToonEye(0.09));

        // 5. Arched Eyebrows (Resting above eyes)
        const browL = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.012, 0.09, 16), root.mats.hair);
        browL.position.set(-0.095, 0.29, 0.20);
        browL.rotation.set(-0.15, 0.22, Math.PI / 2 - 0.25);

        const browR = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.012, 0.09, 16), root.mats.hair);
        browR.position.set(0.095, 0.29, 0.20);
        browR.rotation.set(-0.15, -0.22, Math.PI / 2 + 0.25);

        headGroup.add(browL, browR);

        // 6. Rounded Ears
        const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 24), root.mats.skin);
        earL.position.set(-0.27, 0.14, -0.02);
        earL.rotation.z = Math.PI / 2;
        earL.rotation.y = 0.2;

        const earR = earL.clone();
        earR.position.set(0.27, 0.14, -0.02);
        earR.rotation.z = -Math.PI / 2;
        earR.rotation.y = -0.2;
        headGroup.add(earL, earR);

        // 7. Stetson Hat (Sits naturally on the spherical crown)
        const hatGroup = new THREE.Group();
        hatGroup.position.set(0, 0.30, 0);

        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.46, 0.035, 48), root.mats.hat);
        brim.scale.set(1.0, 1.0, 1.25);
        brim.castShadow = true;

        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.22, 36), root.mats.hat);
        crown.position.set(0, 0.11, -0.02);
        crown.castShadow = true;

        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.29, 0.04, 36), root.mats.accent);
        band.position.set(0, 0.03, -0.02);

        hatGroup.add(brim, crown, band);
        headGroup.add(hatGroup);
        root.hatGroup = hatGroup;
        root.hatBrim = brim;

        // Hair Cap
        const hairLayer = new THREE.Group();
        hairLayer.position.set(0, 0.16, 0);
        const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.27, 28, 20), root.mats.hair);
        hairTop.scale.set(1.06, 1.05, 1.12);
        hairLayer.add(hairTop);
        hairLayer.visible = false;
        headGroup.add(hairLayer);
        root.hairLayer = hairLayer;

        // Cheroot Cigarillo
        const cigarGroup = new THREE.Group();
        cigarGroup.position.set(0.06, 0.04, 0.28);
        const cigarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.10, 16), root.mats.cigar);
        cigarBody.rotation.x = Math.PI / 2;
        const cigarTip = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 16), root.mats.cigarTip);
        cigarTip.position.set(0, 0, 0.05);
        cigarTip.rotation.x = Math.PI / 2;
        cigarGroup.add(cigarBody, cigarTip);
        cigarGroup.visible = false;
        headGroup.add(cigarGroup);
        root.cigarGroup = cigarGroup;

        root.add(headGroup);
        root.headGroup = headGroup;

        // --- ARMS & GLOVED HANDS (Mario-Style White Gloves) ---
        const armLeftGroup = new THREE.Group();
        armLeftGroup.position.set(-0.35, 1.25, 0);

        const bicepL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.40, 32), root.mats.torso);
        bicepL.position.y = -0.18;
        bicepL.castShadow = true;
        armLeftGroup.add(bicepL);

        // Chunky Glove
        const gloveL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 18), root.mats.glove);
        gloveL.position.set(0, -0.42, 0);
        gloveL.scale.set(1.1, 1.2, 0.9);
        armLeftGroup.add(gloveL);
        root.add(armLeftGroup);

        const armRightGroup = new THREE.Group();
        armRightGroup.position.set(0.35, 1.25, 0);

        const bicepR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.40, 32), root.mats.torso);
        bicepR.position.y = -0.18;
        bicepR.castShadow = true;
        armRightGroup.add(bicepR);

        const gloveR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 18), root.mats.glove);
        gloveR.position.set(0, -0.42, 0);
        gloveR.scale.set(1.1, 1.2, 0.9);
        armRightGroup.add(gloveR);

        // Stylized Blued Peacemaker Revolver
        const gun = new THREE.Group();
        gun.position.set(0, -0.44, 0.12);
        gun.rotation.x = Math.PI / 2;

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 24), root.mats.bluedSteel);
        barrel.position.set(0, 0.04, 0.20);
        barrel.rotation.x = Math.PI / 2;
        barrel.castShadow = true;

        const ejectorRod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 16), root.mats.ejectorRod);
        ejectorRod.position.set(0.035, 0.02, 0.18);
        ejectorRod.rotation.x = Math.PI / 2;

        const sight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.035, 0.04), root.mats.bluedSteel);
        sight.position.set(0, 0.08, 0.38);

        const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 24), root.mats.bluedSteelAccent);
        cylinder.position.set(0, 0.035, 0.03);
        cylinder.rotation.x = Math.PI / 2;
        cylinder.castShadow = true;

        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.18), root.mats.bluedSteel);
        frame.position.set(0, 0.025, -0.05);

        const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.06, 0.04), root.mats.bluedSteelAccent);
        hammer.position.set(0, 0.09, -0.12);
        hammer.rotation.x = 0.3;

        const triggerGuard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.07), root.mats.brassTrigger);
        triggerGuard.position.set(0, -0.05, -0.02);

        const gripUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.18, 24), root.mats.walnutGrip);
        gripUpper.position.set(0, -0.09, -0.09);
        gripUpper.rotation.x = -0.42;
        gripUpper.castShadow = true;

        gun.add(barrel, ejectorRod, sight, cylinder, frame, hammer, triggerGuard, gripUpper);
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

    // 8. Drifting Desert Dust Motes
    const dustCount = 36;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * 16;
        dustPositions[i * 3 + 1] = Math.random() * 2.2 + 0.1;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
        color: 0xecd6a2,
        size: 0.05,
        transparent: true,
        opacity: 0.45
    });
    const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustParticles);

    // Sky Progression
    function updateVoxelSky(round = 1) {
        if (round <= 5) {
            scene.background.setHex(0x629de0);
            scene.fog.color.setHex(0x8ebcf0);
            sunLight.color.setHex(0xfff1dc);
            sunLight.intensity = 1.55;
            rimLight.color.setHex(0xd67a48);
        } else if (round <= 12) {
            scene.background.setHex(0xbd421e);
            scene.fog.color.setHex(0xd4683c);
            sunLight.color.setHex(0xffaa44);
            sunLight.intensity = 1.4;
            rimLight.color.setHex(0x5c1810);
        } else {
            scene.background.setHex(0x0a101e);
            scene.fog.color.setHex(0x121c32);
            sunLight.color.setHex(0x7c9acc);
            sunLight.intensity = 0.8;
            rimLight.color.setHex(0x182440);
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
        opponent.hatBrim.scale.set(1.0, 1.0, 1.25);

        opponent.mats.hat.color.setStyle(outfit.hat || '#543622');
        opponent.mats.torso.color.setStyle(outfit.body || '#a46034');
        opponent.mats.accent.color.setStyle(outfit.accent || '#e8cf8c');

        if (name.includes('TUCO')) {
            opponent.hatBrim.scale.set(1.40, 1.0, 1.40);
            opponent.mats.hair.color.setHex(0x382010);
            opponent.mats.pants.color.setHex(0x4a3c28);
        } else if (name.includes('INDIO')) {
            opponent.hatGroup.visible = false;
            opponent.hairLayer.visible = true;
            opponent.mats.hair.color.setHex(0x6a6d78);
            opponent.mats.torso.color.setHex(0x1a1c24);
            opponent.mats.accent.color.setHex(0xf4be34);
            opponent.mustache.visible = false;
        } else if (outlaw.isBlondie || name.includes('NO NAME')) {
            opponent.cigarGroup.visible = true;
            opponent.hatBrim.scale.set(1.15, 1.0, 1.15);
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
    const xAxis = new THREE.Vector3(1, 0, 0);

    return {
        render(state) {
            const delta = Math.min(clockTimer.getDelta(), 0.1);

            updateVoxelSky(state.round);
            syncOpponentArchetype(state.currentOutlaw);

            // Drifting Desert Dust
            const pos = dustGeometry.attributes.position.array;
            for (let i = 0; i < dustCount; i++) {
                pos[i * 3] += delta * 0.45;
                if (pos[i * 3] > 8) pos[i * 3] = -8;
            }
            dustGeometry.attributes.position.needsUpdate = true;

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

            // Standoff Stillness
            if (!state.playerHasDrawn && state.playerDeathProgress === 0) {
                player.torsoGroup.position.y = 0.58;
                player.torsoGroup.rotation.x = 0;
                player.armRightGroup.rotation.x = 0.18;
                player.armRightGroup.rotation.z = -0.06;
                player.headGroup.rotation.y = 0;
            }

            if (!state.opponentHasDrawn && state.opponentDeathProgress === 0) {
                opponent.torsoGroup.position.y = 0.58;
                opponent.torsoGroup.rotation.x = 0;
                opponent.armRightGroup.rotation.x = 0.18;
                opponent.armRightGroup.rotation.z = -0.06;
                opponent.headGroup.rotation.y = 0;
            }

            // Quick-Draw Snap
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

            // Knockback Fall Physics
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

            // Tumbleweed
            if (state.tumbleweed && state.tumbleweed.active) {
                twGroup.visible = true;
                twGroup.position.x = ((state.tumbleweed.x / canvas.width) - 0.5) * 11.0;
                twGroup.position.y = 0.28 + Math.abs(Math.sin((state.tumbleweed.bouncePhase || 0))) * 0.22;
                twGroup.rotation.z = -(state.tumbleweed.rotation || 0);
                twGroup.rotation.y += 0.03;
            } else {
                twGroup.visible = false;
            }

            if (state.muzzleFlash) {
                playerMuzzleLight.intensity = state.muzzleFlash.player > 0 ? 8 : 0;
                opponentMuzzleLight.intensity = state.muzzleFlash.opponent > 0 ? 8 : 0;
            }

            renderer.render(scene, camera);
        }
    };
}