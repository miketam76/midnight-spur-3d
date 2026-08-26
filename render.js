// render.js - Midnight Spur: Voxel 3D Western Engine (Forward Sightline Revolver Fix)
import * as THREE from 'three';

export function createRenderer(canvas) {
    // 1. Scene & Retro Voxel Sky Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x60a8e8);
    scene.fog = new THREE.Fog(0x60a8e8, 12, 32);

    const camera = new THREE.PerspectiveCamera(38, canvas.width / canvas.height, 0.1, 100);
    camera.position.set(0, 1.4, 5.8);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // 2. Bright Voxel Sunlight
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaea, 1.4);
    sunLight.position.set(8, 16, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const playerMuzzleLight = new THREE.PointLight(0xffaa22, 0, 8);
    playerMuzzleLight.position.set(-0.8, 1.15, 0.4);
    scene.add(playerMuzzleLight);

    const opponentMuzzleLight = new THREE.PointLight(0xffaa22, 0, 8);
    opponentMuzzleLight.position.set(0.8, 1.15, 0.4);
    scene.add(opponentMuzzleLight);

    // 3. Voxel Chunk Ground
    const blockMat = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true });

    const groundGeo = new THREE.BoxGeometry(40, 2, 20);
    const ground = new THREE.Mesh(groundGeo, blockMat(0xbe783c));
    ground.position.set(0, -1, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    const boardwalkGeo = new THREE.BoxGeometry(26, 0.3, 2.0);
    const boardwalk = new THREE.Mesh(boardwalkGeo, blockMat(0x8a5c36));
    boardwalk.position.set(0, 0.15, -1.5);
    boardwalk.receiveShadow = true;
    boardwalk.castShadow = true;
    scene.add(boardwalk);

    // 4. Voxel Town Architecture
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

    buildVoxelHouse(-6.2, -2.8, 3.8, 4.2, 2.4, 0x8a2c1a, 0x54180c);
    buildVoxelHouse(-2.6, -3.0, 2.8, 3.2, 2.2, 0x6e4428, 0x3d2414);
    buildVoxelHouse(0.8, -3.2, 3.2, 4.4, 2.4, 0x6c7482, 0x484e5a);
    buildVoxelHouse(4.2, -3.0, 3.0, 3.4, 2.2, 0x94643a, 0x5a3a1e);
    buildVoxelHouse(7.8, -2.8, 3.6, 4.6, 2.4, 0xb88452, 0x6a4828);

    // 5. Minecraft Humanoid Rig
    function createVoxelCowboy(isHero = false) {
        const root = new THREE.Group();

        root.mats = {
            skin: blockMat(0xebaf84),
            hat: blockMat(isHero ? 0x1a1c24 : 0x543622),
            torso: blockMat(isHero ? 0x222634 : 0xa46034),
            accent: blockMat(isHero ? 0xb8281e : 0xe8cf8c),
            pants: blockMat(isHero ? 0x161820 : 0x2c4468),
            boots: blockMat(0x1a120c),
            gunSteel: blockMat(0x282c38),
            gunSilver: blockMat(0xd4d8e4),
            gold: blockMat(0xf2be34),
            hair: blockMat(isHero ? 0x1e120c : 0x482a16),
            pupil: blockMat(0x111118),
            eyeWhite: blockMat(0xffffff),
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

        // Belt & Holster
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

        // Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.44, 0);

        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), root.mats.skin);
        headMesh.position.y = 0.23;
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        function createPixelEye(x) {
            const eye = new THREE.Group();
            eye.position.set(x, 0.24, 0.235);
            const w = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.06), root.mats.eyeWhite);
            const p = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.06), root.mats.pupil);
            p.position.set(x > 0 ? 0.02 : -0.02, 0, 0.002);
            eye.add(w, p);
            return eye;
        }
        headGroup.add(createPixelEye(-0.12), createPixelEye(0.12));

        const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.02), root.mats.hair);
        mustache.position.set(0, 0.12, 0.24);
        headGroup.add(mustache);
        root.mustache = mustache;

        // Hat
        const hatGroup = new THREE.Group();
        hatGroup.position.set(0, 0.46, 0);

        const brim = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.06, 0.84), root.mats.hat);
        brim.castShadow = true;

        const crown = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.22, 0.50), root.mats.hat);
        crown.position.set(0, 0.14, 0);
        crown.castShadow = true;

        const band = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.52), root.mats.accent);
        band.position.set(0, 0.05, 0);

        hatGroup.add(brim, crown, band);
        headGroup.add(hatGroup);
        root.hatGroup = hatGroup;
        root.hatBrim = brim;

        const hairLayer = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.24, 0.49), root.mats.hair);
        hairLayer.position.set(0, 0.36, -0.01);
        hairLayer.visible = false;
        headGroup.add(hairLayer);
        root.hairLayer = hairLayer;

        const cigarGroup = new THREE.Group();
        cigarGroup.position.set(0.08, 0.08, 0.26);
        const cigarBody = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.14), root.mats.cigar);
        const cigarTip = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.042, 0.03), root.mats.cigarTip);
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

        // Right Arm
        const armRightGroup = new THREE.Group();
        armRightGroup.position.set(0.36, 1.38, 0);

        const armRightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.24), root.mats.torso);
        armRightMesh.position.y = -0.30;
        armRightMesh.castShadow = true;
        armRightGroup.add(armRightMesh);

        // Hand Flesh Tip
        const handTip = new THREE.Mesh(new THREE.BoxGeometry(0.242, 0.16, 0.242), root.mats.skin);
        handTip.position.y = -0.58;
        armRightGroup.add(handTip);

        // Bold Voxel Single Action Revolver
        // Correctly oriented so when the arm raises, the barrel aims straight forward along the duel line
        const gun = new THREE.Group();
        gun.position.set(0, -0.62, 0.10);
        gun.rotation.x = Math.PI / 2; // Aligns barrel along the arm's pointing direction

        // 1. Long Heavy Octagonal Barrel
        const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.44), root.mats.gunSteel);
        barrel.position.set(0, 0.05, 0.22);
        barrel.castShadow = true;

        // 2. Raised Iron Sight
        const sight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.04), root.mats.gunSilver);
        sight.position.set(0, 0.10, 0.40);

        // 3. 6-Shot Revolver Cylinder
        const cylinder = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.16), root.mats.gunSilver);
        cylinder.position.set(0, 0.04, 0.04);
        cylinder.castShadow = true;

        // 4. Solid Steel Receiver Frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.18), root.mats.gunSteel);
        frame.position.set(0, 0.03, -0.05);

        // 5. Cocked Hammer
        const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.05), root.mats.gunSilver);
        hammer.position.set(0, 0.11, -0.12);

        // 6. Trigger Guard
        const triggerGuard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.08), root.mats.gunSteel);
        triggerGuard.position.set(0, -0.06, -0.02);

        // 7. Flared Walnut Grip (Angled backward)
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

    const player = createVoxelCowboy(true);
    player.position.set(-1.4, 0, 0);
    player.rotation.y = Math.PI / 2.5;
    scene.add(player);

    const opponent = createVoxelCowboy(false);
    opponent.position.set(1.4, 0, 0);
    opponent.rotation.y = -Math.PI / 2.5;
    scene.add(opponent);

    // 6. Circular 3D Tumbleweed
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

    // 7. Sky Tiers
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

    function syncOpponentArchetype(outlaw) {
        if (!outlaw) return;
        const outfit = outlaw.outfit || {};
        const name = outlaw.name || '';

        opponent.hatGroup.visible = true;
        opponent.hairLayer.visible = false;
        opponent.cigarGroup.visible = false;
        opponent.mustache.visible = true;
        opponent.hatBrim.scale.set(1.0, 1.0, 1.0);

        opponent.mats.hat.color.setStyle(outfit.hat || '#543622');
        opponent.mats.torso.color.setStyle(outfit.body || '#a46034');
        opponent.mats.accent.color.setStyle(outfit.accent || '#e8cf8c');

        if (name.includes('TUCO')) {
            opponent.hatBrim.scale.set(1.35, 1.0, 1.35);
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
            opponent.mats.hair.color.setHex(0x5a3c24);
            opponent.mats.accent.color.setHex(0x486c42);
            opponent.mats.pants.color.setHex(0x2c4874);
        } else if (name.includes('BLACK')) {
            opponent.mats.hat.color.setHex(0x111116);
            opponent.mats.torso.color.setHex(0x161820);
            opponent.mats.pants.color.setHex(0x111116);
            opponent.mats.hair.color.setHex(0x0e0e12);
        }
    }

    let clock = 0;
    const xAxis = new THREE.Vector3(1, 0, 0);

    return {
        render(state) {
            clock += 0.045;
            updateVoxelSky(state.round);
            syncOpponentArchetype(state.currentOutlaw);

            // 1. Camera Tracking & Screen Shake
            const shake = state.screenShake || 0;
            const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 0.12 : 0;
            const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 0.08 : 0;

            if (state.phase === 'countdown' || state.phase === 'duel') {
                camera.position.x = THREE.MathUtils.lerp(camera.position.x, shakeX, 0.1);
                camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.35 + shakeY, 0.1);
                camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.0 - (state.tension || 0) * 0.5, 0.1);
            } else {
                camera.position.set(shakeX, 1.4 + shakeY, 5.8);
            }
            camera.lookAt(0, 1.0, 0);

            // 2. Idle Tension Hand Hover
            const tension = state.tension || 0;

            if (!state.playerHasDrawn && state.playerDeathProgress === 0) {
                const jitter = Math.sin(clock * (4 + tension * 10)) * (0.02 + tension * 0.04);
                player.armRightGroup.rotation.x = 0.18 + jitter;
                player.armRightGroup.rotation.z = -0.08;
                player.headGroup.rotation.y = Math.sin(clock * 1.5) * 0.03;
            }

            if (!state.opponentHasDrawn && state.opponentDeathProgress === 0) {
                const jitter = Math.cos(clock * (4 + tension * 10)) * (0.02 + tension * 0.04);
                opponent.armRightGroup.rotation.x = 0.18 + jitter;
                opponent.armRightGroup.rotation.z = -0.08;
                opponent.headGroup.rotation.y = Math.cos(clock * 1.4) * 0.03;
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

            // 4. True Local-Axis Backward Knockback Fall
            if (state.playerDeathProgress > 0) {
                const t = state.playerDeathProgress;
                player.rotation.set(0, Math.PI / 2.5, 0);
                player.rotateOnAxis(xAxis, -t * (Math.PI / 2.05));
                player.position.set(
                    -1.4 - Math.sin(Math.PI / 2.5) * (t * 0.45),
                    THREE.MathUtils.lerp(0, 0.18, t),
                    -Math.cos(Math.PI / 2.5) * (t * 0.45)
                );
            } else {
                player.position.set(-1.4, 0, 0);
                player.rotation.set(0, Math.PI / 2.5, 0);
            }

            if (state.opponentDeathProgress > 0) {
                const t = state.opponentDeathProgress;
                opponent.rotation.set(0, -Math.PI / 2.5, 0);
                opponent.rotateOnAxis(xAxis, -t * (Math.PI / 2.05));
                opponent.position.set(
                    1.4 + Math.sin(Math.PI / 2.5) * (t * 0.45),
                    THREE.MathUtils.lerp(0, 0.18, t),
                    -Math.cos(Math.PI / 2.5) * (t * 0.45)
                );
            } else {
                opponent.position.set(1.4, 0, 0);
                opponent.rotation.set(0, -Math.PI / 2.5, 0);
            }

            // 5. Circular Tumbleweed Rolling & Bouncing
            if (state.tumbleweed && state.tumbleweed.active) {
                twGroup.visible = true;
                twGroup.position.x = ((state.tumbleweed.x / canvas.width) - 0.5) * 8.5;
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