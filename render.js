// render.js - Midnight Spur 3D Full Town & Character Standoff Engine
import * as THREE from 'three';

export function createRenderer(canvas) {
    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1b3b6f);
    scene.fog = new THREE.FogExp2(0xd4aa7d, 0.022);

    const camera = new THREE.PerspectiveCamera(36, canvas.width / canvas.height, 0.1, 100);
    camera.position.set(0, 1.4, 5.8);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Lighting & Dynamic Muzzle Flash Point Lights
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    sunLight.position.set(8, 12, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -2;
    scene.add(sunLight);

    const playerMuzzleLight = new THREE.PointLight(0xffaa33, 0, 6);
    playerMuzzleLight.position.set(-1.0, 1.1, 0.3);
    scene.add(playerMuzzleLight);

    const opponentMuzzleLight = new THREE.PointLight(0xffaa33, 0, 6);
    opponentMuzzleLight.position.set(1.0, 1.1, 0.3);
    scene.add(opponentMuzzleLight);

    // 3. Ground & Boardwalk
    const groundGeo = new THREE.PlaneGeometry(40, 20);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xb87034 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const boardwalkGeo = new THREE.BoxGeometry(26, 0.12, 1.4);
    const boardwalkMat = new THREE.MeshLambertMaterial({ color: 0xa87848 });
    const boardwalk = new THREE.Mesh(boardwalkGeo, boardwalkMat);
    boardwalk.position.set(0, 0.06, -1.2);
    boardwalk.receiveShadow = true;
    boardwalk.castShadow = true;
    scene.add(boardwalk);

    // 4. Detailed 3D Western Buildings Builder
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);

    function addBox(parent, w, h, d, color, x, y, z) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshLambertMaterial({ color })
        );
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
    }

    // A. Saloon (Red 2-Story with False-Front & Porch)
    const saloon = new THREE.Group();
    saloon.position.set(-5.8, 0, -2.4);
    addBox(saloon, 3.2, 3.2, 2.0, 0x7c2814, 0, 1.6, 0);
    addBox(saloon, 2.8, 0.5, 0.1, 0x581c0e, 0, 3.45, 1.0); // Pediment
    addBox(saloon, 2.4, 0.4, 0.08, 0x2a1408, 0, 3.0, 1.04); // Sign
    addBox(saloon, 3.4, 0.12, 1.0, 0x582410, 0, 1.7, 0.5); // Porch Overhang
    addBox(saloon, 0.08, 1.7, 0.08, 0x3a1a0c, -1.5, 0.85, 0.9); // Left Post
    addBox(saloon, 0.08, 1.7, 0.08, 0x3a1a0c, 1.5, 0.85, 0.9); // Right Post
    // Batwing Doors
    addBox(saloon, 0.35, 0.65, 0.04, 0x884414, -0.22, 0.75, 1.02);
    addBox(saloon, 0.35, 0.65, 0.04, 0x884414, 0.22, 0.75, 1.02);
    buildingsGroup.add(saloon);

    // B. Sheriff's Office & Jail (Timber with Iron Bars)
    const sheriff = new THREE.Group();
    sheriff.position.set(-2.6, 0, -2.5);
    addBox(sheriff, 2.6, 2.7, 2.0, 0x5c3822, 0, 1.35, 0);
    addBox(sheriff, 2.8, 0.18, 0.4, 0x3a2012, 0, 2.75, 0.9); // Heavy Cornice
    addBox(sheriff, 1.8, 0.35, 0.06, 0xa87848, 0, 2.3, 1.03); // Sign
    // Jail Bars Window
    addBox(sheriff, 0.6, 0.7, 0.06, 0x181014, -0.65, 1.1, 1.02);
    for (let i = -0.2; i <= 0.2; i += 0.13) {
        addBox(sheriff, 0.03, 0.65, 0.03, 0x888888, -0.65 + i, 1.1, 1.04);
    }
    buildingsGroup.add(sheriff);

    // C. The Bank (Stone Masonry)
    const bank = new THREE.Group();
    bank.position.set(0.6, 0, -2.6);
    addBox(bank, 2.8, 3.4, 2.2, 0x7c8088, 0, 1.7, 0);
    addBox(bank, 3.0, 0.3, 0.3, 0x585c64, 0, 3.45, 1.0); // Stone Pediment
    addBox(bank, 1.8, 0.4, 0.06, 0xfce0a0, 0, 2.9, 1.13); // Bank Sign
    addBox(bank, 0.8, 1.6, 0.1, 0x282c34, 0, 0.8, 1.12); // Vault Door
    buildingsGroup.add(bank);

    // D. General Store (Striped Awning)
    const store = new THREE.Group();
    store.position.set(3.6, 0, -2.5);
    addBox(store, 2.6, 2.8, 2.0, 0x8a5c36, 0, 1.4, 0);
    addBox(store, 2.0, 0.35, 0.06, 0xe4d0a0, 0, 2.5, 1.03); // Sign
    // Striped Awning
    const awning = new THREE.Group();
    awning.position.set(0, 1.6, 1.2);
    awning.rotation.x = Math.PI / 8;
    for (let s = -1.2; s <= 1.2; s += 0.3) {
        const isRed = Math.round((s + 1.2) / 0.3) % 2 === 0;
        addBox(awning, 0.28, 0.06, 0.8, isRed ? 0xa82c18 : 0xfcfcfc, s, 0, 0);
    }
    store.add(awning);
    buildingsGroup.add(store);

    // E. Hotel (Grand Multi-Tier Structure)
    const hotel = new THREE.Group();
    hotel.position.set(6.8, 0, -2.4);
    addBox(hotel, 3.0, 3.6, 2.2, 0xa87848, 0, 1.8, 0);
    addBox(hotel, 3.2, 0.35, 0.3, 0x582410, 0, 3.7, 1.0); // Cornice
    addBox(hotel, 2.0, 0.4, 0.06, 0xe4d0a0, 0, 3.2, 1.13); // Sign
    addBox(hotel, 3.1, 0.1, 0.8, 0xd89c58, 0, 1.8, 0.5); // Veranda
    buildingsGroup.add(hotel);

    // F. Hitching Post & Horse
    const hitch = new THREE.Group();
    hitch.position.set(-0.8, 0, -0.6);
    addBox(hitch, 1.8, 0.08, 0.08, 0x88481c, 0, 0.55, 0);
    addBox(hitch, 0.08, 0.6, 0.08, 0x582c0e, -0.8, 0.3, 0);
    addBox(hitch, 0.08, 0.6, 0.08, 0x582c0e, 0.8, 0.3, 0);
    buildingsGroup.add(hitch);

    // 5. 3D Character Rig Builder
    function create3DCowboy(isHero = false) {
        const root = new THREE.Group();

        // Materials container to allow dynamic outlaw recoloring
        root.mats = {
            hat: new THREE.MeshLambertMaterial({ color: isHero ? 0x1c202a : 0x443018 }),
            body: new THREE.MeshLambertMaterial({ color: isHero ? 0x202028 : 0x8c5828 }),
            accent: new THREE.MeshLambertMaterial({ color: isHero ? 0xb02820 : 0xe2d19d }),
            skin: new THREE.MeshLambertMaterial({ color: 0xf4b884 }),
            pants: new THREE.MeshLambertMaterial({ color: isHero ? 0x1c1c24 : 0x1c345c }),
            boots: new THREE.MeshLambertMaterial({ color: 0x101014 }),
            gun: new THREE.MeshLambertMaterial({ color: 0xd0d0dc }),
            silver: new THREE.MeshLambertMaterial({ color: 0xe0e0ea }),
        };

        // Legs & Boots
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.48, 0.13), root.mats.pants);
        const legR = legL.clone();
        legL.position.set(-0.11, 0.34, 0);
        legR.position.set(0.11, 0.34, 0);
        legL.castShadow = legR.castShadow = true;

        const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.18), root.mats.boots);
        const bootR = bootL.clone();
        bootL.position.set(-0.11, 0.06, 0.02);
        bootR.position.set(0.11, 0.06, 0.02);
        bootL.castShadow = bootR.castShadow = true;
        root.add(legL, legR, bootL, bootR);

        // Torso & Gun Belt
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.22), root.mats.body);
        torso.position.set(0, 0.78, 0);
        torso.castShadow = true;
        root.add(torso);

        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.08, 0.24), new THREE.MeshLambertMaterial({ color: 0x482010 }));
        belt.position.set(0, 0.58, 0);
        root.add(belt);

        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.09, 0.04), root.mats.silver);
        buckle.position.set(0, 0.58, 0.12);
        root.add(buckle);

        // Red Bandana for Hero
        if (isHero) {
            const bandana = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.10, 0.24), root.mats.accent);
            bandana.position.set(0, 0.98, 0);
            root.add(bandana);
        }

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), root.mats.skin);
        head.position.set(0, 1.12, 0);
        head.castShadow = true;
        root.add(head);

        // Hat (Crown & Wide Brim)
        const hatBrim = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.035, 0.62), root.mats.hat);
        hatBrim.position.set(0, 1.25, 0);
        hatBrim.castShadow = true;

        const hatCrown = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.32), root.mats.hat);
        hatCrown.position.set(0, 1.34, 0);
        hatCrown.castShadow = true;
        root.add(hatBrim, hatCrown);
        root.hatMesh = hatBrim;

        // Gun Arm (Pivot at Shoulder)
        const armPivot = new THREE.Group();
        armPivot.position.set(0.24, 0.92, 0);

        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.12), root.mats.body);
        arm.position.set(0, -0.19, 0);
        arm.castShadow = true;
        armPivot.add(arm);

        const pistol = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.26), root.mats.gun);
        pistol.position.set(0, -0.36, 0.08);
        pistol.castShadow = true;
        armPivot.add(pistol);

        root.add(armPivot);
        root.armPivot = armPivot;

        return root;
    }

    const player = create3DCowboy(true);
    player.position.set(-1.4, 0, 0);
    player.rotation.y = Math.PI / 2.8;
    scene.add(player);

    const opponent = create3DCowboy(false);
    opponent.position.set(1.4, 0, 0);
    opponent.rotation.y = -Math.PI / 2.8;
    scene.add(opponent);

    // 6. 3D Bushy Tumbleweed Mesh
    const twGroup = new THREE.Group();
    const twCore = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.22, 1),
        new THREE.MeshLambertMaterial({ color: 0x8c5828, wireframe: true })
    );
    const twFibers = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.26, 1),
        new THREE.MeshLambertMaterial({ color: 0xd4944c, wireframe: true })
    );
    twGroup.add(twCore, twFibers);
    twGroup.castShadow = true;
    twGroup.position.set(0, 0.26, 0.8);
    scene.add(twGroup);

    // 7. Atmospheric 3D Dust Particles
    const dustCount = 45;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
        dustPos[i] = (Math.random() - 0.5) * 14;
        dustPos[i + 1] = Math.random() * 2.2;
        dustPos[i + 2] = (Math.random() - 0.5) * 8;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
        color: 0xe0c090,
        size: 0.04,
        transparent: true,
        opacity: 0.45,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 8. Starlight Stars (Tier 3 Night Sky)
    const starCount = 80;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 30;
        starPos[i + 1] = 4 + Math.random() * 12;
        starPos[i + 2] = -5 - Math.random() * 15;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 9. Sky & Lighting Tiers
    function updateSkyAndLighting(round = 1) {
        if (round <= 5) {
            scene.background.setHex(0x1b3b6f); // Midday Blue
            scene.fog.color.setHex(0xd4aa7d);
            sunLight.color.setHex(0xfffaed);
            sunLight.intensity = 1.3;
            ambientLight.color.setHex(0xffeedd);
            starMat.opacity = 0;
        } else if (round <= 12) {
            scene.background.setHex(0x5c1e28); // Fiery Sunset
            scene.fog.color.setHex(0xe07824);
            sunLight.color.setHex(0xff8833);
            sunLight.intensity = 1.1;
            ambientLight.color.setHex(0xffaa77);
            starMat.opacity = 0;
        } else {
            scene.background.setHex(0x05070e); // Midnight Starlight
            scene.fog.color.setHex(0x1a182c);
            sunLight.color.setHex(0x5577aa);
            sunLight.intensity = 0.45;
            ambientLight.color.setHex(0x334466);
            starMat.opacity = 0.85;
        }
    }

    function syncOpponentOutfit(outfit) {
        if (!outfit) return;
        opponent.mats.hat.color.setStyle(outfit.hat);
        opponent.mats.body.color.setStyle(outfit.body);
        opponent.mats.accent.color.setStyle(outfit.accent);
    }

    return {
        render(state) {
            updateSkyAndLighting(state.round);
            syncOpponentOutfit(state.opponentOutfit);

            // 1. Camera Dynamic Framing & Screen Shake
            const shake = state.screenShake || 0;
            const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 0.12 : 0;
            const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 0.08 : 0;

            if (state.phase === 'countdown' || state.phase === 'duel') {
                // Smoothly zoom in on the duelists as tension rises
                camera.position.x = THREE.MathUtils.lerp(camera.position.x, shakeX, 0.08);
                camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.25 + shakeY, 0.08);
                camera.position.z = THREE.MathUtils.lerp(camera.position.z, 4.2 - (state.tension || 0) * 0.6, 0.08);
            } else {
                camera.position.set(shakeX, 1.4 + shakeY, 5.8);
            }
            camera.lookAt(0, 1.0, 0);

            // 2. Tumbleweed 3D Movement & Rotation
            if (state.tumbleweed && state.tumbleweed.active) {
                twGroup.visible = true;
                twGroup.position.x = ((state.tumbleweed.x / canvas.width) - 0.5) * 8.5;
                twGroup.position.y = 0.26 + Math.abs(Math.sin((state.tumbleweed.bouncePhase || 0))) * 0.2;
                twGroup.rotation.z = -(state.tumbleweed.rotation || 0);
                twGroup.rotation.y += 0.03;
            } else {
                twGroup.visible = false;
            }

            // 3. 3D Dust Particles Wind Drift
            const pos = dustGeo.attributes.position.array;
            const windSpeed = state.round > 12 ? 0.04 : 0.02;
            for (let i = 0; i < dustCount * 3; i += 3) {
                pos[i] += windSpeed;
                if (pos[i] > 7) pos[i] = -7;
            }
            dustGeo.attributes.position.needsUpdate = true;

            // 4. Arms & Draw Animations
            if (state.playerHasDrawn) {
                player.armPivot.rotation.x = THREE.MathUtils.lerp(player.armPivot.rotation.x, -Math.PI / 2, 0.35);
            } else {
                player.armPivot.rotation.x = THREE.MathUtils.lerp(player.armPivot.rotation.x, 0, 0.2);
            }

            if (state.opponentHasDrawn) {
                opponent.armPivot.rotation.x = THREE.MathUtils.lerp(opponent.armPivot.rotation.x, -Math.PI / 2, 0.35);
            } else {
                opponent.armPivot.rotation.x = THREE.MathUtils.lerp(opponent.armPivot.rotation.x, 0, 0.2);
            }

            // 5. Fallen Cowboy Death Physics
            if (state.playerDeathProgress > 0) {
                player.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 2.1, state.playerDeathProgress);
                player.position.y = THREE.MathUtils.lerp(0, 0.2, state.playerDeathProgress);
            } else {
                player.rotation.z = 0;
                player.position.y = 0;
            }

            if (state.opponentDeathProgress > 0) {
                opponent.rotation.z = THREE.MathUtils.lerp(0, -Math.PI / 2.1, state.opponentDeathProgress);
                opponent.position.y = THREE.MathUtils.lerp(0, 0.2, state.opponentDeathProgress);
            } else {
                opponent.rotation.z = 0;
                opponent.position.y = 0;
            }

            // 6. Dynamic Muzzle Flash Point Lighting
            if (state.muzzleFlash) {
                playerMuzzleLight.intensity = state.muzzleFlash.player > 0 ? 8 : 0;
                opponentMuzzleLight.intensity = state.muzzleFlash.opponent > 0 ? 8 : 0;
            }

            renderer.render(scene, camera);
        }
    };
}