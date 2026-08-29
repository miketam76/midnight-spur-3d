// render.js - Midnight Spur: Western Standoff Environment (Architectural False-Fronts & Atmosphere)
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

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    const blockMat = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true });

    // 2. Dynamic Lighting & Desert Haze
    const ambientLight = new THREE.AmbientLight(0xf4e6d0, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff1dc, 1.55);
    sunLight.position.set(12, 18, 9);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xd67a48, 0.6);
    rimLight.position.set(-10, 6, -8);
    scene.add(rimLight);

    const playerMuzzleLight = new THREE.PointLight(0xffaa22, 0, 10);
    playerMuzzleLight.position.set(-2.2, 1.15, 0.4);
    scene.add(playerMuzzleLight);

    const opponentMuzzleLight = new THREE.PointLight(0xffaa22, 0, 10);
    opponentMuzzleLight.position.set(2.2, 1.15, 0.4);
    scene.add(opponentMuzzleLight);

    // 3. Ground, Main Dirt Road & Layered Boardwalk
    const groundGeo = new THREE.BoxGeometry(54, 2, 28);
    const ground = new THREE.Mesh(groundGeo, blockMat(0xbe783c));
    ground.position.set(0, -1, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    const boardwalkGroup = new THREE.Group();
    const mainWalk = new THREE.Mesh(new THREE.BoxGeometry(34, 0.28, 2.4), blockMat(0x845630));
    mainWalk.position.set(0, 0.14, -1.5);
    mainWalk.receiveShadow = true;
    mainWalk.castShadow = true;
    boardwalkGroup.add(mainWalk);

    // Planks & Edge Lip
    const walkLip = new THREE.Mesh(new THREE.BoxGeometry(34.2, 0.32, 0.12), blockMat(0x5a361a));
    walkLip.position.set(0, 0.14, -0.3);
    boardwalkGroup.add(walkLip);
    scene.add(boardwalkGroup);

    // 4. Western Town Buildings with False Fronts & Saloon Architecture
    const townGroup = new THREE.Group();
    scene.add(townGroup);

    function buildSaloonBuilding(x, z, w, h, d, wallCol, trimCol, isSaloon = false) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Main Wall Block
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), blockMat(wallCol));
        wall.position.y = h / 2;
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);

        // Stepped Boomtown Parapet / False Front
        const falseFront = new THREE.Mesh(new THREE.BoxGeometry(w + 0.15, 0.9, 0.18), blockMat(wallCol));
        falseFront.position.set(0, h + 0.45, d / 2 - 0.06);
        falseFront.castShadow = true;
        group.add(falseFront);

        const pediment = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, 0.5, 0.2), blockMat(trimCol));
        pediment.position.set(0, h + 0.95, d / 2 - 0.05);
        pediment.castShadow = true;
        group.add(pediment);

        const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.25, d + 0.3), blockMat(trimCol));
        cornice.position.set(0, h + 0.12, 0);
        cornice.castShadow = true;
        group.add(cornice);

        // Overhanging Porch / Awning
        const awningRoof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.12, 1.3), blockMat(trimCol));
        awningRoof.position.set(0, 2.55, d / 2 + 0.65);
        awningRoof.rotation.x = 0.08;
        awningRoof.castShadow = true;
        group.add(awningRoof);

        // Awning Support Posts
        [-w * 0.44, w * 0.44].forEach((px) => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), blockMat(0x482a14));
            post.position.set(px, 1.25, d / 2 + 1.22);
            post.castShadow = true;
            group.add(post);
        });

        // Hitching Rail
        const hitchRail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.08, 0.08), blockMat(0x3e2210));
        hitchRail.position.set(0, 0.75, d / 2 + 1.35);
        const hPostL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), blockMat(0x3e2210));
        hPostL.position.set(-w * 0.32, 0.375, d / 2 + 1.35);
        const hPostR = hPostL.clone();
        hPostR.position.set(w * 0.32, 0.375, d / 2 + 1.35);
        group.add(hitchRail, hPostL, hPostR);

        // Doors & Windows
        if (isSaloon) {
            // Batwing Swinging Doors
            const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.9, 0.1), blockMat(0x28160a));
            doorFrame.position.set(0, 0.95, d / 2 + 0.04);
            const batL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.85, 0.06), blockMat(0x8e5224));
            batL.position.set(-0.23, 1.05, d / 2 + 0.1);
            batL.rotation.y = 0.25;
            const batR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.85, 0.06), blockMat(0x8e5224));
            batR.position.set(0.23, 1.05, d / 2 + 0.1);
            batR.rotation.y = -0.25;
            group.add(doorFrame, batL, batR);
        } else {
            const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.08), blockMat(0x2c170a));
            door.position.set(0, 0.9, d / 2 + 0.05);
            group.add(door);
        }

        [-w * 0.28, w * 0.28].forEach((wx) => {
            const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.95, 0.12), blockMat(0x24160e));
            winFrame.position.set(wx, 1.45, d / 2 + 0.05);
            const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.82, 0.13), blockMat(0x182434));
            winGlass.position.set(wx, 1.45, d / 2 + 0.05);
            group.add(winFrame, winGlass);

            // Upper Floor Windows
            if (h >= 3.8) {
                const winUp = winFrame.clone();
                winUp.position.set(wx, h - 0.9, d / 2 + 0.05);
                group.add(winUp);
            }
        });

        // Barrels & Supply Crates
        if (Math.abs(x) > 2) {
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.65, 8), blockMat(0x56341a));
            barrel.position.set(w * 0.44 + (x > 0 ? 0.35 : -0.35), 0.325, d / 2 + 0.7);
            barrel.castShadow = true;
            const crate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), blockMat(0x764c28));
            crate.position.set(barrel.position.x, 0.225, d / 2 + 0.1);
            crate.castShadow = true;
            group.add(barrel, crate);
        }

        townGroup.add(group);
    }

    // Spawn Frontier Street
    buildSaloonBuilding(-7.6, -3.2, 4.0, 4.2, 2.6, 0x8a2c1a, 0x54180c, false); // General Store
    buildSaloonBuilding(-3.7, -3.4, 3.2, 3.4, 2.4, 0x6e4428, 0x3d2414, false); // Gunsmith
    buildSaloonBuilding(0.0, -3.6, 3.8, 4.8, 2.6, 0x5a6372, 0x3c434f, true);   // Grand Saloon (Centerpiece)
    buildSaloonBuilding(3.7, -3.4, 3.2, 3.6, 2.4, 0x94643a, 0x5a3a1e, false);  // Bank
    buildSaloonBuilding(7.6, -3.2, 4.0, 4.4, 2.6, 0xa87848, 0x624222, false);  // Hotel & Sheriff

    // 5. 3D Voxel Wanted Poster Board
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
        const bounty = outlaw.bounty ? `${outlaw.bounty}` : '$25,000';
        const crime = outlaw.crime || 'TRAIN ROBBERY & MURDER';
        const outfit = outlaw.outfit || {};

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
        drawPixelRect(cx - 44, cy + 30, 16, 16, skinShade);
        drawPixelRect(cx + 28, cy + 30, 16, 16, skinShade);

        drawPixelRect(cx - 56, cy - 25, 14, 55, hairColor);
        drawPixelRect(cx + 42, cy - 25, 14, 55, hairColor);

        if (!hasHat) {
            drawPixelRect(cx - 58, cy - 55, 116, 32, hairColor);
            drawPixelRect(cx - 62, cy - 25, 12, 85, hairColor);
            drawPixelRect(cx + 50, cy - 25, 12, 85, hairColor);
            drawPixelRect(cx - 20, cy - 50, 40, 10, '#9a9ea8');
        }

        drawPixelRect(cx - 38, cy + 2, 28, 7, hairColor);
        drawPixelRect(cx + 10, cy + 2, 28, 7, hairColor);

        drawPixelRect(cx - 36, cy + 12, 24, 12, '#ffffff');
        drawPixelRect(cx + 12, cy + 12, 24, 12, '#ffffff');
        drawPixelRect(cx - 28, cy + 12, 12, 12, '#111116');
        drawPixelRect(cx + 16, cy + 12, 12, 12, '#111116');

        if (isHawkNose) {
            drawPixelRect(cx - 6, cy + 15, 12, 32, skinShade);
            drawPixelRect(cx - 8, cy + 42, 16, 12, skinShade);
        } else {
            drawPixelRect(cx - 14, cy + 22, 28, 28, skinShade);
        }

        if (hasMustache) drawPixelRect(cx - 32, cy + 56, 64, 12, hairColor);
        drawPixelRect(cx - 16, cy + 70, 32, 5, '#541c14');
        if (hasGoatee) drawPixelRect(cx - 10, cy + 75, 20, 15, hairColor);

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

    // 6. Character Models & Blued-Steel Peacemaker
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
            gold: blockMat(0xf2be34),
            hair: blockMat(isHero ? 0x1c100a : 0x482a16),
            pupil: blockMat(0x0e1014),
            eyeWhite: blockMat(0xffffff),
            mouth: blockMat(0x6e281e),
            cigar: blockMat(0x482410),
            cigarTip: new THREE.MeshBasicMaterial({ color: 0xff4411 }),
            bluedSteel: blockMat(0x1a1c22),
            bluedSteelAccent: blockMat(0x282c36),
            ejectorRod: blockMat(0x121418),
            brassTrigger: blockMat(0xc49a45),
            walnutGrip: blockMat(0x381e0e),
        };

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

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.44, 0);

        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), root.mats.skin);
        headMesh.position.y = 0.23;
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        const earL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.10, 0.08), root.mats.skin);
        earL.position.set(-0.25, 0.23, 0);
        const earR = earL.clone();
        earR.position.set(0.25, 0.23, 0);
        headGroup.add(earL, earR);

        const cheekL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), root.mats.skinShade);
        cheekL.position.set(-0.16, 0.18, 0.23);
        const cheekR = cheekL.clone();
        cheekR.position.set(0.16, 0.18, 0.23);
        headGroup.add(cheekL, cheekR);

        const noseGroup = new THREE.Group();
        noseGroup.position.set(0, 0.19, 0.23);

        const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.08), root.mats.skin);
        noseBridge.position.set(0, 0.02, 0.04);

        const noseTip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.06), root.mats.skinShade);
        noseTip.position.set(0, -0.04, 0.05);

        noseGroup.add(noseBridge, noseTip);
        headGroup.add(noseGroup);
        root.noseGroup = noseGroup;

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

        const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.04), root.mats.hair);
        mustache.position.set(0, 0.13, 0.24);

        const mouth = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 0.02), root.mats.mouth);
        mouth.position.set(0, 0.09, 0.233);

        const goatee = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), root.mats.hair);
        goatee.position.set(0, 0.04, 0.24);

        headGroup.add(mustache, mouth, goatee);
        root.mustache = mustache;
        root.goatee = goatee;

        const sideburnL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.08), root.mats.hair);
        sideburnL.position.set(-0.24, 0.28, 0.10);
        const sideburnR = sideburnL.clone();
        sideburnR.position.set(0.24, 0.28, 0.10);
        headGroup.add(sideburnL, sideburnR);

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

        const armLeftGroup = new THREE.Group();
        armLeftGroup.position.set(-0.36, 1.38, 0);

        const armLeftMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), root.mats.torso);
        armLeftMesh.position.y = -0.30;
        armLeftMesh.castShadow = true;
        armLeftGroup.add(armLeftMesh);
        root.add(armLeftGroup);

        const armRightGroup = new THREE.Group();
        armRightGroup.position.set(0.36, 1.38, 0);

        const armRightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), root.mats.torso);
        armRightMesh.position.y = -0.30;
        armRightMesh.castShadow = true;
        armRightGroup.add(armRightMesh);

        const handTip = new THREE.Mesh(new THREE.BoxGeometry(0.242, 0.16, 0.242), root.mats.skin);
        handTip.position.y = -0.58;
        armRightGroup.add(handTip);

        // 1873 Single Action Army Peacemaker
        const gun = new THREE.Group();
        gun.position.set(0, -0.62, 0.10);
        gun.rotation.x = Math.PI / 2;

        const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.46), root.mats.bluedSteel);
        barrel.position.set(0, 0.045, 0.23);
        barrel.castShadow = true;

        const ejectorRod = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.38), root.mats.ejectorRod);
        ejectorRod.position.set(0.035, 0.02, 0.20);

        const sight = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.05), root.mats.bluedSteel);
        sight.position.set(0, 0.09, 0.42);

        const cylinder = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.115, 0.17), root.mats.bluedSteelAccent);
        cylinder.position.set(0, 0.035, 0.04);
        cylinder.castShadow = true;

        const cylinderPin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.20), root.mats.bluedSteel);
        cylinderPin.position.set(0, 0.035, 0.04);

        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.18), root.mats.bluedSteel);
        frame.position.set(0, 0.025, -0.05);

        const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.05), root.mats.bluedSteelAccent);
        hammer.position.set(0, 0.10, -0.12);
        hammer.rotation.x = 0.3;

        const triggerGuard = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.055, 0.08), root.mats.brassTrigger);
        triggerGuard.position.set(0, -0.055, -0.02);

        const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.03), root.mats.bluedSteel);
        trigger.position.set(0, -0.045, -0.01);
        trigger.rotation.x = -0.4;

        const gripUpper = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.08), root.mats.walnutGrip);
        gripUpper.position.set(0, -0.08, -0.09);
        gripUpper.rotation.x = -0.36;
        gripUpper.castShadow = true;

        const gripButt = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.05, 0.085), root.mats.walnutGrip);
        gripButt.position.set(0, -0.15, -0.12);
        gripButt.rotation.x = -0.15;

        gun.add(barrel, ejectorRod, sight, cylinder, cylinderPin, frame, hammer, triggerGuard, trigger, gripUpper, gripButt);
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

            // Animate Desert Dust Drift
            const pos = dustGeometry.attributes.position.array;
            for (let i = 0; i < dustCount; i++) {
                pos[i * 3] += delta * 0.45;
                pos[i * 3 + 1] += Math.sin(elapsedTime * 2 + i) * 0.002;
                if (pos[i * 3] > 8) pos[i * 3] = -8;
            }
            dustGeometry.attributes.position.needsUpdate = true;

            // Camera Tracking & Shake
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