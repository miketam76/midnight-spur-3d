// game.js - Midnight Spur (Attract Mode, Full Pause & Cumulative Bounty Ranking)
import { createAudioSystem } from './audio.js';
import { createRenderer } from './render.js';

const phases = {
    menu: 'menu',
    scores: 'scores',
    entry: 'entry',
    wanted: 'wanted',
    countdown: 'countdown',
    duel: 'duel',
    roundWin: 'roundWin',
    gameOver: 'gameOver',
};

// Factory Default Ephemeral Presets (RAM only)
const DEFAULT_SCORES = [
    { initials: 'BLD', bountyTotal: 588100 },
    { initials: 'COL', bountyTotal: 338100 },
    { initials: 'DOC', bountyTotal: 158100 },
    { initials: 'TUC', bountyTotal: 43100 },
    { initials: 'KID', bountyTotal: 10600 },
];

const outlawRoster = [
    { name: "SNAKE-EYE SAM", bounty: "$250", bountyNum: 250, delayMs: 400, outfit: { hat: '#6e2f35', body: '#7a3d30', accent: '#e2d19d' } },
    { name: "RUSTLER RICK", bounty: "$450", bountyNum: 450, delayMs: 370, outfit: { hat: '#443018', body: '#8c5828', accent: '#306844' } },
    { name: "TUCO THE RAT", bounty: "$750", bountyNum: 750, delayMs: 340, outfit: { hat: '#9a7848', body: '#b08450', accent: '#e05840' } },
    { name: "EL INDIO", bounty: "$1,200", bountyNum: 1200, delayMs: 310, outfit: { hat: '#2c1810', body: '#582418', accent: '#d4a040' } },
    { name: "WILD GROGGY", bounty: "$1,800", bountyNum: 1800, delayMs: 285, outfit: { hat: '#1c2430', body: '#3c4c64', accent: '#8c9ca8' } },
    { name: "CAVANAUGH", bounty: "$2,500", bountyNum: 2500, delayMs: 260, outfit: { hat: '#482014', body: '#703824', accent: '#e8d4a0' } },
    { name: "CUCHILLO", bounty: "$3,500", bountyNum: 3500, delayMs: 240, outfit: { hat: '#5c4838', body: '#846044', accent: '#408868' } },
    { name: "BARON SAXON", bounty: "$5,000", bountyNum: 5000, delayMs: 220, outfit: { hat: '#10141a', body: '#242a38', accent: '#c83428' } },
    { name: "PATRIARCH ADAM", bounty: "$7,500", bountyNum: 7500, delayMs: 205, outfit: { hat: '#382014', body: '#503020', accent: '#fce0a0' } },
    { name: "STENGEL", bounty: "$10,000", bountyNum: 10000, delayMs: 190, outfit: { hat: '#1c1c24', body: '#343444', accent: '#9070a8' } },
    { name: "PATRIARCA", bounty: "$15,000", bountyNum: 15000, delayMs: 175, outfit: { hat: '#0a0a0e', body: '#1a1820', accent: '#c02018' } },
    { name: "THE MAN IN BLACK", bounty: "$25,000", bountyNum: 25000, delayMs: 160, outfit: { hat: '#000000', body: '#101014', accent: '#e0a020' } },
    { name: "MONCO THE HAWK", bounty: "$30,000", bountyNum: 30000, delayMs: 155, outfit: { hat: '#3c3226', body: '#5c4e3c', accent: '#709080' } },
    { name: "SNAKE O'HARA", bounty: "$40,000", bountyNum: 40000, delayMs: 150, outfit: { hat: '#1c1814', body: '#4a2818', accent: '#d87040' } },
    { name: "ROSCOE THE PREACHER", bounty: "$50,000", bountyNum: 50000, delayMs: 145, outfit: { hat: '#101014', body: '#1c1c24', accent: '#e8e8f0' } },
    { name: "GRIFFIN THE BUTCHER", bounty: "$65,000", bountyNum: 65000, delayMs: 140, outfit: { hat: '#341c18', body: '#602820', accent: '#f4c060' } },
    { name: "MAJOR APONTE", bounty: "$80,000", bountyNum: 80000, delayMs: 135, outfit: { hat: '#142034', body: '#203454', accent: '#d4b038' } },
    { name: "THE DEVIL'S APPRENTICE", bounty: "$100,000", bountyNum: 100000, delayMs: 130, outfit: { hat: '#08080c', body: '#141418', accent: '#c81818' } },
    { name: "THE MAN WITH NO NAME", bounty: "$250,000", bountyNum: 250000, delayMs: 125, isBlondie: true, outfit: { hat: '#443020', body: '#3c4e32', accent: '#f4f0e0' } }
];

function getOutlawForRound(round) {
    const index = (round - 1) % outlawRoster.length;
    const base = outlawRoster[index];
    const loop = Math.floor((round - 1) / outlawRoster.length);
    const speedBoost = loop * 10;
    return { ...base, currentDelay: Math.max(110, base.delayMs - speedBoost) };
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789. ';

export function createGame(dom) {
    const canvas = dom.canvas;
    const renderer = createRenderer(canvas);
    const audio = createAudioSystem();

    let highScores = [...DEFAULT_SCORES];

    const state = {
        phase: phases.menu,
        isPaused: false,
        isDemo: false,
        round: 1,
        wins: 0,
        bestWins: 0,
        totalBountyEarned: 0,
        playerReady: false,
        playerHasDrawn: false,
        opponentReady: false,
        opponentHasDrawn: false,
        countdownStart: 0,
        countdownDuration: 0,
        drawTime: 0,
        animationFrame: 0,
        flash: 0,
        duelStartedAt: 0,
        phaseLabel: 'Press start to begin.',
        tension: 0,
        progress: 0,
        countdownProgress: 0,
        playerOutfit: { hat: '#101522', body: '#2f4368', accent: '#d7a65f' },
        opponentOutfit: outlawRoster[0].outfit,
        currentOutlaw: outlawRoster[0],
        playerDeathProgress: 0,
        opponentDeathProgress: 0,
        dustParticles: Array.from({ length: 18 }, () => ({
            x: Math.random() * 800,
            y: 200 + Math.random() * 200,
            size: Math.random() > 0.6 ? 2 : 1,
            speed: 1.5 + Math.random() * 2.5,
            alpha: 0.2 + Math.random() * 0.4
        })),
        screenShake: 0,
        baseStatus: 'Choose Start Game to face the outlaw.',
        pendingTransition: null,
        pendingTransitionAt: 0,
        pauseStartedAt: 0,
        lastTickTime: 0,
        muzzleFlash: { player: 0, opponent: 0 },
        tumbleweed: { x: -40, y: 320, currentY: 320, vx: 1.8, rotation: 0, bouncePhase: 0, active: false, timer: 60 },
        attractTimer: null,
        entrySlot: 0,
        initials: ['A', 'A', 'A'],
    };

    function isActivePhase() {
        return state.phase === phases.countdown || state.phase === phases.duel || state.phase === phases.roundWin;
    }

    function updateDust() {
        if (!state.dustParticles) return;
        const tierMultiplier = state.round > 12 ? 1.8 : (state.round > 5 ? 1.3 : 1.0);

        state.dustParticles.forEach((p) => {
            p.x += p.speed * tierMultiplier;
            if (p.x > canvas.width + 10) {
                p.x = -10;
                p.y = canvas.height * 0.45 + Math.random() * (canvas.height * 0.50);
            }
        });
    }

    function updateTumbleweed() {
        const tw = state.tumbleweed;
        if (!tw) return;

        const isLateGame = state.round > 12;
        const isMidGame = state.round > 5;

        if (!tw.active) {
            tw.timer--;
            if (tw.timer <= 0) {
                tw.active = true;
                tw.x = -40;
                tw.y = Math.floor(canvas.height * 0.76) + Math.random() * 12;

                // Speed scales up in Sunset (Tier 2) and Night (Tier 3)
                const baseSpeed = 1.6 + Math.random() * 1.0;
                tw.vx = baseSpeed * (isLateGame ? 1.5 : (isMidGame ? 1.25 : 1.0));

                tw.rotation = 0;
                tw.bouncePhase = 0;
            }
        } else {
            tw.x += tw.vx;
            tw.rotation += 0.07 * (tw.vx / 1.6);
            tw.bouncePhase += 0.055;

            // Scaled bounce arc height for the larger mass
            tw.currentY = tw.y - Math.abs(Math.sin(tw.bouncePhase) * 11);

            if (tw.x > canvas.width + 50) {
                tw.active = false;

                // Tighter delay between tumbleweeds in later rounds
                const minDelay = isLateGame ? 60 : (isMidGame ? 110 : 180);
                const variance = isLateGame ? 80 : 160;
                tw.timer = minDelay + Math.floor(Math.random() * variance);
            }
        }
    }

    function clearAttractTimer() {
        if (state.attractTimer) {
            window.clearTimeout(state.attractTimer);
            state.attractTimer = null;
        }
    }

    function scheduleAttractNext(step, delayMs = 10000) {
        clearAttractTimer();
        state.attractTimer = window.setTimeout(() => {
            if (step === 'demo') {
                startDemoRound();
            } else if (step === 'scores') {
                showHighScores();
            } else if (step === 'menu') {
                startMenu(true);
            }
        }, delayMs);
    }

    function syncHud() {
        if (dom.roundValue) dom.roundValue.textContent = String(state.round);
        if (dom.bountyValue) dom.bountyValue.textContent = '$' + Number(state.totalBountyEarned || 0).toLocaleString();
        if (dom.winsValue) dom.winsValue.textContent = String(state.wins);
        if (dom.bestValue) dom.bestValue.textContent = String(state.bestWins);
    }

    function syncControls() {
        if (!dom.pauseButton || !dom.muteButton) return;
        dom.pauseButton.textContent = state.isPaused ? 'Resume' : 'Pause';
        dom.pauseButton.disabled = !isActivePhase() || state.isDemo;
        dom.drawButton.disabled = state.isPaused || state.isDemo || !(state.phase === phases.countdown || state.phase === phases.duel);
        dom.muteButton.textContent = audio.isMuted() ? 'Unmute' : 'Mute';
    }

    function renderHighScoresTable() {
        if (!dom.scoresTable) return;
        dom.scoresTable.innerHTML = '';
        highScores.forEach((entry, idx) => {
            const formattedMoney = '$' + Number(entry.bountyTotal).toLocaleString();
            const row = document.createElement('div');
            row.className = 'score-row';
            row.innerHTML = `
                <span class="score-rank">${idx + 1}.</span>
                <span class="score-initials">${entry.initials}</span>
                <span class="score-bounty">${formattedMoney}</span>
            `;
            dom.scoresTable.appendChild(row);
        });
    }

    function showScreen(screenName) {
        dom.menuScreen.hidden = screenName !== phases.menu;
        dom.gameScreen.hidden = screenName !== phases.wanted && screenName !== phases.countdown && screenName !== phases.duel && screenName !== phases.roundWin;
        dom.resultScreen.hidden = screenName !== phases.gameOver;
        if (dom.scoresScreen) dom.scoresScreen.hidden = screenName !== phases.scores;
        if (dom.entryScreen) dom.entryScreen.hidden = screenName !== phases.entry;
        if (dom.demoMarquee) dom.demoMarquee.hidden = !state.isDemo;
        syncControls();
    }

    function restartGame() {
        clearAttractTimer();
        state.round = 1;
        state.wins = 0;
        state.totalBountyEarned = 0;
        syncHud();
        startRound();
    }

    function setStatus(message) {
        state.baseStatus = message;
        dom.statusText.textContent = message;
    }

    function setPausedStatus() {
        dom.statusText.textContent = 'Paused. Tap Resume to continue.';
    }

    function resetDeathStates() {
        state.playerDeathProgress = 0;
        state.opponentDeathProgress = 0;
        state.screenShake = 0;
        state.muzzleFlash.player = 0;
        state.muzzleFlash.opponent = 0;
    }

    function scheduleTransition(type, delayMs, payload = {}) {
        state.pendingTransition = { type, payload };
        state.pendingTransitionAt = performance.now() + delayMs;
    }

    function runPendingTransition() {
        if (!state.pendingTransition) return;
        const { type, payload } = state.pendingTransition;
        state.pendingTransition = null;
        state.pendingTransitionAt = 0;

        if (type === 'beginDuelCountdown') beginDuelCountdown();
        else if (type === 'endGame') endGame(payload.reason);
        else if (type === 'advanceRound') advanceRound();
        else if (type === 'startRound') startRound();
        else if (type === 'afterDemo') showHighScores();
    }

    function updateDifficulty() {
        const minDelay = Math.max(1.5, 3.0 - state.round * 0.15);
        const maxDelay = Math.max(2.5, 5.5 - state.round * 0.2);
        state.countdownDuration = minDelay + Math.random() * (maxDelay - minDelay);
        state.drawTime = state.countdownStart + state.countdownDuration * 1000;
    }

    function resumeAfterPause(now) {
        const pausedDuration = now - state.pauseStartedAt;
        state.countdownStart += pausedDuration;
        state.drawTime += pausedDuration;
        state.duelStartedAt += pausedDuration;

        if (state.pendingTransitionAt) {
            state.pendingTransitionAt += pausedDuration;
        }

        state.isPaused = false;
        state.pauseStartedAt = 0;
        dom.statusText.textContent = state.baseStatus;
        syncControls();
    }

    function startRound() {
        clearAttractTimer();
        state.isDemo = false;
        audio.unlock();
        audio.stopMusic();
        audio.playCylinderSpin();

        state.currentOutlaw = getOutlawForRound(state.round);
        state.opponentOutfit = state.currentOutlaw.outfit;
        state.phase = phases.wanted;
        state.isPaused = false;
        resetDeathStates();
        showScreen(phases.wanted);
        syncHud();
        setStatus(`WANTED: ${state.currentOutlaw.name} - ${state.currentOutlaw.bounty}`);
        scheduleTransition('beginDuelCountdown', 1800);
    }

    function startDemoRound() {
        clearAttractTimer();
        state.isDemo = true;
        state.round = Math.floor(Math.random() * 6) + 1;
        state.currentOutlaw = getOutlawForRound(state.round);
        state.opponentOutfit = state.currentOutlaw.outfit;
        state.phase = phases.wanted;
        resetDeathStates();
        showScreen(phases.wanted);
        setStatus(`DEMO: ${state.currentOutlaw.name}`);
        scheduleTransition('beginDuelCountdown', 1800);
    }

    function beginDuelCountdown() {
        audio.startMusic();
        state.phase = phases.countdown;
        state.playerReady = true;
        state.playerHasDrawn = false;
        state.opponentReady = false;
        state.opponentHasDrawn = false;
        state.flash = 0;
        state.countdownStart = performance.now();
        state.duelStartedAt = 0;
        state.lastTickTime = 0;
        state.phaseLabel = 'WAIT FOR IT';
        updateDifficulty();
        showScreen(phases.countdown);
        setStatus(state.isDemo ? 'DEMO PLAY IN PROGRESS' : `Face off against ${state.currentOutlaw.name}! Keep steady.`);
        audio.playSignal();
    }

    function resolveEarlyDraw() {
        state.phase = phases.gameOver;
        audio.stopMusic();
        state.playerHasDrawn = true;
        state.phaseLabel = 'TOO EARLY';
        state.playerDeathProgress = 0.035;
        state.muzzleFlash.opponent = 6;
        setStatus('You drew too soon and got clipped.');
        state.screenShake = 1.2;
        audio.playHit();
        scheduleTransition('endGame', 900, { reason: 'loss' });
    }

    function resolveVictory(drawTimeMs) {
        state.phase = phases.roundWin;
        audio.stopMusic();
        state.playerHasDrawn = true;
        state.opponentHasDrawn = false;
        state.phaseLabel = 'BANG';
        state.opponentDeathProgress = 0.035;
        state.muzzleFlash.player = 6;
        state.screenShake = drawTimeMs < 160 ? 1.8 : (drawTimeMs < 250 ? 1.1 : 0.6);

        setStatus(state.isDemo ? 'DEMO OVER' : 'Clean draw. Moving forward.');
        audio.playDraw();

        if (state.isDemo) {
            scheduleTransition('afterDemo', 1400);
        } else {
            scheduleTransition('advanceRound', 1100);
        }
    }

    function resolveLoss() {
        state.phase = phases.gameOver;
        audio.stopMusic();
        state.opponentHasDrawn = true;
        state.playerHasDrawn = false;
        state.phaseLabel = 'HIT';
        state.playerDeathProgress = 0.035;
        state.muzzleFlash.opponent = 6;
        state.screenShake = 1.4;
        setStatus(`${state.currentOutlaw.name} fired first.`);
        audio.playHit();

        if (state.isDemo) {
            scheduleTransition('afterDemo', 1400);
        } else {
            scheduleTransition('endGame', 900, { reason: 'loss' });
        }
    }

    function advanceRound() {
        state.totalBountyEarned += (state.currentOutlaw.bountyNum || 0);
        state.wins += 1;
        state.round += 1;
        state.bestWins = Math.max(state.bestWins, state.wins);
        syncHud();
        audio.playVictory();
        scheduleTransition('startRound', 1000);
    }

    function qualifiesForHighScores() {
        return state.totalBountyEarned > 0 &&
            (highScores.length < 5 || state.totalBountyEarned > highScores[highScores.length - 1].bountyTotal);
    }

    function startInitialsEntry() {
        state.phase = phases.entry;
        state.entrySlot = 0;
        state.initials = ['A', 'A', 'A'];
        updateInitialsDisplay();
        showScreen(phases.entry);
    }

    function updateInitialsDisplay() {
        [dom.charSlot0, dom.charSlot1, dom.charSlot2].forEach((slot, idx) => {
            if (!slot) return;
            slot.textContent = state.initials[idx];
            slot.classList.toggle('is-selected', idx === state.entrySlot);
        });
    }

    function commitScore() {
        const scoreObj = {
            initials: state.initials.join(''),
            bountyTotal: state.totalBountyEarned
        };
        highScores.push(scoreObj);
        highScores.sort((a, b) => b.bountyTotal - a.bountyTotal);
        highScores = highScores.slice(0, 5);
        showHighScores();
    }

    function showHighScores() {
        clearAttractTimer();
        state.phase = phases.scores;
        renderHighScoresTable();
        showScreen(phases.scores);
        scheduleAttractNext('menu', 10000);
    }

    function endGame(reason) {
        audio.stopMusic();
        state.bestWins = Math.max(state.bestWins, state.wins);
        syncHud();

        if (qualifiesForHighScores()) {
            startInitialsEntry();
            return;
        }

        state.phase = phases.gameOver;
        showScreen(phases.gameOver);
        dom.finalWins.textContent = String(state.wins);
        dom.finalBest.textContent = String(state.bestWins);
        dom.resultBadge.textContent = reason === 'win' ? 'Victory' : 'Game Over';
        dom.resultTitle.textContent = reason === 'win' ? 'You Cleared the Town' : 'The Outlaw Won';
        dom.resultMessage.textContent = `${state.currentOutlaw.name} was faster on the draw.`;
        audio[reason === 'win' ? 'playVictory' : 'playLoss']();
    }

    function startMenu(playGunshot = false) {
        clearAttractTimer();
        state.phase = phases.menu;
        state.isPaused = false;
        state.isDemo = false;
        state.round = 1;
        state.wins = 0;
        state.totalBountyEarned = 0;
        resetDeathStates();
        showScreen(phases.menu);
        syncHud();

        if (playGunshot) {
            audio.playDraw();
        }

        scheduleAttractNext('demo', 10000);
    }

    function handleAttractInterrupt() {
        if (state.isDemo || state.phase === phases.scores) {
            startMenu(true);
            return true;
        }
        return false;
    }

    function onDraw() {
        if (handleAttractInterrupt()) return;
        audio.unlock();
        if (state.isPaused || state.isDemo) return;

        if (state.phase === phases.menu) {
            startRound();
            return;
        }
        if (state.phase === phases.countdown && performance.now() < state.drawTime) {
            resolveEarlyDraw();
            return;
        }
        if (state.phase === phases.duel) {
            const reactionTime = Math.round(performance.now() - state.duelStartedAt);
            resolveVictory(reactionTime);
        }
    }

    function tick(now) {
        if (state.isPaused) {
            state.flash = Math.max(0, state.flash - 0.02);
            state.screenShake = Math.max(0, state.screenShake - 0.04);
            renderer.render(state);
            state.animationFrame = window.requestAnimationFrame(tick);
            return;
        }

        if (state.muzzleFlash.player > 0) state.muzzleFlash.player--;
        if (state.muzzleFlash.opponent > 0) state.muzzleFlash.opponent--;
        state.screenShake = Math.max(0, state.screenShake - 0.08);

        if (state.playerDeathProgress > 0 && state.playerDeathProgress < 1) {
            state.playerDeathProgress = clamp(state.playerDeathProgress + 0.035, 0, 1);
        }
        if (state.opponentDeathProgress > 0 && state.opponentDeathProgress < 1) {
            state.opponentDeathProgress = clamp(state.opponentDeathProgress + 0.035, 0, 1);
        }

        updateDust();
        updateTumbleweed();

        if (state.pendingTransition && now >= state.pendingTransitionAt) {
            runPendingTransition();
        }

        const elapsed = now - state.countdownStart;
        const timeUntilDraw = state.drawTime - now;

        if (state.phase === phases.countdown) {
            state.tension = clamp(elapsed / (state.countdownDuration * 1000), 0, 1);
            state.progress = state.tension;
            state.countdownProgress = clamp(1 - state.tension, 0, 1);

            if (!state.lastTickTime || now - state.lastTickTime > Math.max(180, 500 * (1 - state.tension))) {
                state.lastTickTime = now;
                audio.playTick(1.0 + state.tension * 0.5);
            }

            if (timeUntilDraw <= 350 && state.duelStartedAt === 0) {
                audio.stopMusic();
            }

            state.phaseLabel = timeUntilDraw > 0 ? `DRAW IN ${Math.max(0, Math.ceil(timeUntilDraw / 1000))}` : 'DRAW';

            if (timeUntilDraw <= 0) {
                state.phase = phases.duel;
                state.duelStartedAt = now;
                state.playerReady = true;
                state.opponentReady = true;
                state.phaseLabel = 'DRAW!';
                audio.playSignal();
            }
        } else if (state.phase === phases.duel) {
            const duelElapsed = now - state.duelStartedAt;
            const opponentDelay = state.currentOutlaw.currentDelay;

            if (state.isDemo) {
                const aiPlayerDelay = opponentDelay - 30;
                if (!state.playerHasDrawn && duelElapsed >= aiPlayerDelay) {
                    resolveVictory(aiPlayerDelay);
                }
            } else {
                if (!state.opponentHasDrawn && duelElapsed >= opponentDelay) {
                    resolveLoss();
                }
            }
        }

        renderer.render(state);
        state.animationFrame = window.requestAnimationFrame(tick);
    }

    function boot() {
        startMenu(true);
        state.animationFrame = window.requestAnimationFrame(tick);
    }

    return {
        boot,
        startMenu,
        startRound,
        restartGame,
        showHighScores,
        onDraw,
        handleAttractInterrupt,
        cycleInitials(dir) {
            const currentIdx = ALPHABET.indexOf(state.initials[state.entrySlot]);
            const nextIdx = (currentIdx + dir + ALPHABET.length) % ALPHABET.length;
            state.initials[state.entrySlot] = ALPHABET[nextIdx];
            updateInitialsDisplay();
            audio.playTick(1.2);
        },
        confirmInitialSlot() {
            if (state.entrySlot < 2) {
                state.entrySlot++;
                updateInitialsDisplay();
                audio.playSignal();
            } else {
                commitScore();
            }
        },
        togglePause() {
            if (state.isDemo || !isActivePhase()) {
                return false;
            }

            if (!state.isPaused) {
                state.isPaused = true;
                state.pauseStartedAt = performance.now();
                state.phaseLabel = 'PAUSED';
                audio.stopMusic();
                setPausedStatus();
                syncControls();
                return state.isPaused;
            }

            resumeAfterPause(performance.now());
            audio.startMusic();
            if (state.phase === phases.countdown) {
                state.phaseLabel = 'WAIT FOR IT';
            }
            return state.isPaused;
        },
        toggleMute() {
            return audio.toggleMute();
        },
        isMuted() {
            return audio.isMuted();
        },
        isPaused() {
            return state.isPaused;
        }
    };
}