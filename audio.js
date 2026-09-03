// audio.js - Midnight Spur: Authentic Spaghetti Western Soundscape

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

// Layered Peacemaker Gunshot (Crack + Powder Blast + Reverb Tail + Ricochet)
function playAuthenticGunshot(context, startTime, hasRicochet = false) {
    const now = startTime;

    // 1. Initial High-Velocity Crack
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

    // 2. Sub-Bass Powder Blast
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

    // 3. Desert Canyon Reverb Tail
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

    // 4. Bullet Ricochet
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

// --- SPAGHETTI WESTERN INSTRUMENTATION ---

// 1. Acoustic / Spanish Guitar Pluck
function scheduleAcousticPluck(context, frequency, startTime, duration, gainValue, destinationGain, registerNode) {
    const osc = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gainNode = context.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, startTime);
    filter.frequency.exponentialRampToValueAtTime(320, startTime + duration);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.006);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destinationGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);

    registerNode(osc, gainNode);
}

// 2. The Lone Whistle (Sine wave with Morricone vibrato & portamento)
function scheduleWhistleNote(context, fromFreq, toFreq, startTime, duration, gainValue, destinationGain, registerNode) {
    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(fromFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(toFreq, startTime + duration * 0.3);

    // Expressive vibrato depth
    const now = startTime;
    const vibrato = context.createOscillator();
    const vibratoGain = context.createGain();
    vibrato.frequency.value = 5.2; // 5.2 Hz human whistle vibrato
    vibratoGain.gain.value = 4.5;
    vibrato.connect(osc.frequency);
    vibrato.start(now);
    vibrato.stop(now + duration);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.05);
    gainNode.gain.setValueAtTime(gainValue * 0.9, startTime + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(destinationGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);

    registerNode(osc, gainNode);
    registerNode(vibrato, vibratoGain);
}

// 3. Standoff Composition in D Minor (8-bar loop)
function scheduleWesternLoopTracked(context, startTime, musicGain, registerNode) {
    const tempo = 104;
    const beat = 60 / tempo; // ~0.576s per beat

    // Rhythmic Spanish Guitar / Bass Ostinato (D Minor Strum Pattern)
    const guitarChords = [
        { bass: 73.42, root: 146.83, fifth: 220.00, minorThird: 174.61 }, // Dm
        { bass: 65.41, root: 130.81, fifth: 196.00, minorThird: 164.81 }, // C
        { bass: 58.27, root: 116.54, fifth: 174.61, minorThird: 146.83 }, // Bb
        { bass: 55.00, root: 110.00, fifth: 164.81, minorThird: 138.59 }, // A (Dominant)
    ];

    for (let bar = 0; bar < 4; bar++) {
        const barStart = startTime + bar * 4 * beat;
        const chord = guitarChords[bar];

        // Bass drop on beat 1 & 3
        scheduleAcousticPluck(context, chord.bass, barStart, beat * 1.2, 0.09, musicGain, registerNode);
        scheduleAcousticPluck(context, chord.bass, barStart + beat * 2, beat * 0.9, 0.07, musicGain, registerNode);

        // Syncopated Spanish guitar finger-picking
        scheduleAcousticPluck(context, chord.root, barStart + beat * 0.5, beat * 0.45, 0.05, musicGain, registerNode);
        scheduleAcousticPluck(context, chord.minorThird, barStart + beat * 1.0, beat * 0.45, 0.045, musicGain, registerNode);
        scheduleAcousticPluck(context, chord.fifth, barStart + beat * 1.5, beat * 0.45, 0.045, musicGain, registerNode);
        scheduleAcousticPluck(context, chord.root, barStart + beat * 2.5, beat * 0.45, 0.05, musicGain, registerNode);
        scheduleAcousticPluck(context, chord.minorThird, barStart + beat * 3.0, beat * 0.45, 0.045, musicGain, registerNode);
        scheduleAcousticPluck(context, chord.fifth, barStart + beat * 3.5, beat * 0.35, 0.04, musicGain, registerNode);
    }

    // Iconic Whistle Melody (The Leone Standoff Hook)
    // Bar 1: A4 -> D5 -> F5
    scheduleWhistleNote(context, 440.00, 587.33, startTime + beat * 0.5, beat * 1.8, 0.055, musicGain, registerNode);
    scheduleWhistleNote(context, 587.33, 698.46, startTime + beat * 2.5, beat * 1.3, 0.06, musicGain, registerNode);

    // Bar 2: E5 -> D5 slide down
    scheduleWhistleNote(context, 659.25, 587.33, startTime + beat * 4.0, beat * 2.6, 0.055, musicGain, registerNode);

    // Bar 3: F5 -> G5 -> A5
    scheduleWhistleNote(context, 698.46, 783.99, startTime + beat * 8.5, beat * 1.8, 0.06, musicGain, registerNode);
    scheduleWhistleNote(context, 783.99, 880.00, startTime + beat * 10.5, beat * 1.3, 0.065, musicGain, registerNode);

    // Bar 4: F5 -> E5 -> D5 resolution
    scheduleWhistleNote(context, 698.46, 659.25, startTime + beat * 12.0, beat * 1.8, 0.055, musicGain, registerNode);
    scheduleWhistleNote(context, 659.25, 587.33, startTime + beat * 14.0, beat * 2.0, 0.05, musicGain, registerNode);
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
        const lookahead = 3.5;

        if (musicGain) {
            musicGain.gain.cancelScheduledValues(now);
            musicGain.gain.setValueAtTime(1, now);
        }

        if (musicLoopEnd === 0 || now + lookahead >= musicLoopEnd) {
            const nextStart = musicLoopEnd === 0 ? now + 0.05 : musicLoopEnd;
            scheduleWesternLoopTracked(context, nextStart, musicGain, registerMusicNode);
            musicLoopEnd = nextStart + (60 / 104) * 16; // 4 bars of 4 beats
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
            musicTimer = window.setInterval(scheduleMusic, 1200);
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
                musicTimer = window.setInterval(scheduleMusic, 1200);
            }
            return muted;
        },
        toggleMute() {
            return this.setMuted(!muted);
        },
        isMuted() {
            return muted;
        },

        // Pocket Watch Ticking
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

        // Player Gunshot
        playDraw() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            playAuthenticGunshot(ctx, ctx.currentTime, true);
        },

        // Opponent Gunshot
        playHit() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            playAuthenticGunshot(ctx, ctx.currentTime, false);
        },

        // Victory Chime
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

        // Loss Thud & Drop
        playLoss() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            playAuthenticGunshot(ctx, now, false);

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

        // Revolver Cylinder Spin
        playCylinderSpin() {
            // if (muted) return;
            // const ctx = ensureContext();
            // if (!ctx) return;
            // const now = ctx.currentTime;

            // const clickCount = 10;
            // let currentDelay = 0;

            // for (let i = 0; i < clickCount; i++) {
            //     currentDelay += 0.022 + Math.pow(i / clickCount, 2) * 0.045;
            //     const clickTime = now + currentDelay;

            //     const osc = ctx.createOscillator();
            //     osc.type = 'triangle';
            //     osc.frequency.setValueAtTime(2800 + Math.random() * 300, clickTime);
            //     osc.frequency.exponentialRampToValueAtTime(1100, clickTime + 0.012);

            //     const gain = ctx.createGain();
            //     const vol = (1 - (i / clickCount) * 0.4) * 0.18;
            //     gain.gain.setValueAtTime(vol, clickTime);
            //     gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.014);

            //     osc.connect(gain);
            //     gain.connect(ctx.destination);
            //     osc.start(clickTime);
            //     osc.stop(clickTime + 0.016);
            //}
        },
    };
}