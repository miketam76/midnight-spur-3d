// audio.js - Midnight Spur: Realistic Western Audio Synthesizer (Acoustic Layers)

function createNoiseBuffer(context, duration = 1.0) {
    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }
    return buffer;
}

// Layered Gunshot Synthesizer (Crack + Powder + Sub-Bass + Desert Echo Tail)
function playAuthenticGunshot(context, startTime, hasRicochet = false) {
    const now = startTime;

    // 1. Initial High-Velocity Crack (0 - 45ms)
    const crackSource = context.createBufferSource();
    crackSource.buffer = createNoiseBuffer(context, 0.08);

    const crackFilter = context.createBiquadFilter();
    crackFilter.type = 'highpass';
    crackFilter.frequency.setValueAtTime(1400, now);
    crackFilter.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    const crackGain = context.createGain();
    crackGain.gain.setValueAtTime(1.4, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    crackSource.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(context.destination);
    crackSource.start(now);

    // 2. Sub-Bass Powder Blast (Punch & Weight)
    const subOsc = context.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.22);

    const subGain = context.createGain();
    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    subOsc.connect(subGain);
    subGain.connect(context.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.28);

    // 3. Canyon Reverb / Desert Echo Tail (0.05s - 1.2s)
    const tailSource = context.createBufferSource();
    tailSource.buffer = createNoiseBuffer(context, 1.2);

    const tailFilter = context.createBiquadFilter();
    tailFilter.type = 'lowpass';
    tailFilter.frequency.setValueAtTime(900, now + 0.02);
    tailFilter.frequency.exponentialRampToValueAtTime(180, now + 1.1);

    const tailGain = context.createGain();
    tailGain.gain.setValueAtTime(0.55, now + 0.02);
    tailGain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

    tailSource.connect(tailFilter);
    tailFilter.connect(tailGain);
    tailGain.connect(context.destination);
    tailSource.start(now + 0.02);

    // 4. Spaghetti Western Bullet Ricochet Whine
    if (hasRicochet) {
        const ricoOsc = context.createOscillator();
        const ricoGain = context.createGain();

        ricoOsc.type = 'sine';
        ricoOsc.frequency.setValueAtTime(950, now + 0.04);
        ricoOsc.frequency.exponentialRampToValueAtTime(2800, now + 0.12);
        ricoOsc.frequency.exponentialRampToValueAtTime(650, now + 0.35);

        ricoGain.gain.setValueAtTime(0, now + 0.04);
        ricoGain.gain.linearRampToValueAtTime(0.12, now + 0.08);
        ricoGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        ricoOsc.connect(ricoGain);
        ricoGain.connect(context.destination);
        ricoOsc.start(now + 0.04);
        ricoOsc.stop(now + 0.38);
    }
}

// Tracked Tone Scheduler for Theme
function scheduleTrackedTone(context, frequency, startTime, duration, type, gainValue, destinationGain, registerNode) {
    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gainNode.gain.value = gainValue;

    osc.connect(gainNode);
    gainNode.connect(destinationGain);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue * 0.001), startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);

    registerNode(osc, gainNode);
}

// Spaghetti Western Standoff Theme
function scheduleWesternLoopTracked(context, startTime, musicGain, registerNode) {
    const beat = 60 / 102;
    const bassNotes = [82.41, 98.00, 110.00, 98.00];

    for (let bar = 0; bar < 2; bar += 1) {
        const barStart = startTime + bar * 4 * beat;

        bassNotes.forEach((frequency, beatIndex) => {
            const noteStart = barStart + beatIndex * beat;
            scheduleTrackedTone(context, frequency, noteStart, beat * 0.4, 'triangle', 0.05, musicGain, registerNode);
            scheduleTrackedTone(context, frequency * 2, noteStart + beat * 0.5, beat * 0.25, 'triangle', 0.03, musicGain, registerNode);
        });

        const melody = bar === 0
            ? [{ t: 0, f: 659.25 }, { t: 1.5, f: 783.99 }, { t: 2.5, f: 880.00 }]
            : [{ t: 0, f: 783.99 }, { t: 1.5, f: 659.25 }, { t: 2.5, f: 587.33 }];

        melody.forEach((note) => {
            const noteStart = barStart + note.t * beat;
            scheduleTrackedTone(context, note.f, noteStart, beat * 0.9, 'triangle', 0.04, musicGain, registerNode);
        });
    }
}

export function createAudioSystem() {
    let context = null;
    let muted = false;
    let musicTimer = null;
    let musicLoopEnd = 0;
    let musicEnabled = false;
    let activeMusicNodes = [];
    let musicGain = null;

    function ensureContext() {
        if (muted) return null;

        if (!context) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return null;
            context = new AudioContext();
            musicGain = context.createGain();
            musicGain.connect(context.destination);
        }

        if (context.state === 'suspended') {
            void context.resume();
        }

        return context;
    }

    function registerMusicNode(osc, gainNode) {
        activeMusicNodes.push({ osc, gainNode });
        osc.onended = () => {
            activeMusicNodes = activeMusicNodes.filter((item) => item.osc !== osc);
        };
    }

    function clearMusicTimer() {
        if (musicTimer) {
            window.clearInterval(musicTimer);
            musicTimer = null;
        }
    }

    function stopMusic() {
        musicEnabled = false;
        musicLoopEnd = 0;
        clearMusicTimer();

        if (musicGain && context) {
            musicGain.gain.cancelScheduledValues(0);
            musicGain.gain.setValueAtTime(0, context.currentTime);
        }

        activeMusicNodes.forEach((item) => {
            try {
                if (item.gainNode && context) {
                    item.gainNode.gain.cancelScheduledValues(0);
                    item.gainNode.gain.setValueAtTime(0, context.currentTime);
                }
                item.osc.stop(0);
                item.osc.disconnect();
            } catch (err) { }
        });
        activeMusicNodes = [];
    }

    function scheduleMusic() {
        if (!context || muted || !musicEnabled) return;

        const now = context.currentTime;
        const lookahead = 2.5;

        if (musicGain) {
            musicGain.gain.cancelScheduledValues(now);
            musicGain.gain.setValueAtTime(1, now);
        }

        if (musicLoopEnd === 0 || now + lookahead >= musicLoopEnd) {
            const nextStart = musicLoopEnd === 0 ? now + 0.05 : musicLoopEnd;
            scheduleWesternLoopTracked(context, nextStart, musicGain, registerMusicNode);
            musicLoopEnd = nextStart + (60 / 102) * 8;
        }
    }

    return {
        unlock() {
            ensureContext();
        },
        startMusic() {
            stopMusic();
            const audioContext = ensureContext();
            if (!audioContext || muted) return;

            musicEnabled = true;
            musicLoopEnd = 0;
            scheduleMusic();
            musicTimer = window.setInterval(scheduleMusic, 1000);
        },
        stopMusic() {
            stopMusic();
        },
        stopAll() {
            stopMusic();
        },
        setMuted(value) {
            muted = Boolean(value);
            if (!context) return muted;

            if (muted && context.state === 'running') void context.suspend();
            if (!muted && context.state === 'suspended') void context.resume();

            if (muted) {
                stopMusic();
            } else if (musicEnabled) {
                scheduleMusic();
                clearMusicTimer();
                musicTimer = window.setInterval(scheduleMusic, 1000);
            }
            return muted;
        },
        toggleMute() {
            return this.setMuted(!muted);
        },
        isMuted() {
            return muted;
        },

        // Pocket Watch Ticking (Dual-gear mechanical click)
        playTick(pitchMult = 1.0) {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(2400 * pitchMult, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.012);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.015);
        },

        // Metallic Hammer Lock / Cocking Draw Signal
        playSignal() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            // Click 1 (Pawl engagement)
            const osc1 = ctx.createOscillator();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(1800, now);
            osc1.frequency.exponentialRampToValueAtTime(600, now + 0.025);

            const gain1 = ctx.createGain();
            gain1.gain.setValueAtTime(0.25, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.035);

            // Click 2 (Solid cylinder lock)
            const osc2 = ctx.createOscillator();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(2600, now + 0.04);
            osc2.frequency.exponentialRampToValueAtTime(800, now + 0.075);

            const gain2 = ctx.createGain();
            gain2.gain.setValueAtTime(0.35, now + 0.04);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.04);
            osc2.stop(now + 0.085);
        },

        // Player Gunshot (Full Peacemaker blast + Whistle Ricochet)
        playDraw() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            playAuthenticGunshot(ctx, ctx.currentTime, true);
        },

        // Opponent Gunshot (Heavy Body Hit)
        playHit() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            playAuthenticGunshot(ctx, ctx.currentTime, false);
        },

        // Victory Acoustic Motif (Bell Harmonic Chime)
        playVictory() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.1);

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.18, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.65);
            });
        },

        // Loss Thud & Resonant Drop
        playLoss() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            playAuthenticGunshot(ctx, now, false);

            // Body Thud impact
            const thudOsc = ctx.createOscillator();
            thudOsc.type = 'sine';
            thudOsc.frequency.setValueAtTime(110, now + 0.15);
            thudOsc.frequency.exponentialRampToValueAtTime(28, now + 0.45);

            const thudGain = ctx.createGain();
            thudGain.gain.setValueAtTime(0.65, now + 0.15);
            thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            thudOsc.connect(thudGain);
            thudGain.connect(ctx.destination);
            thudOsc.start(now + 0.15);
            thudOsc.stop(now + 0.52);
        },

        // Rapid Metallic Cylinder Spin with Decreasing Rate of Clicks
        playCylinderSpin() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            const clickCount = 10;
            let currentDelay = 0;

            for (let i = 0; i < clickCount; i++) {
                currentDelay += 0.022 + Math.pow(i / clickCount, 2) * 0.045;
                const clickTime = now + currentDelay;

                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(2800 + Math.random() * 300, clickTime);
                osc.frequency.exponentialRampToValueAtTime(1100, clickTime + 0.012);

                const gain = ctx.createGain();
                const vol = (1 - (i / clickCount) * 0.4) * 0.18;
                gain.gain.setValueAtTime(vol, clickTime);
                gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.014);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(clickTime);
                osc.stop(clickTime + 0.016);
            }
        },
    };
}