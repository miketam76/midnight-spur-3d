// audio.js - Midnight Spur Expanded 8-Bit Chiptune System

function scheduleTone(context, frequency, startTime, duration, type = 'square', gainValue = 0.08, detune = 0) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    gainNode.gain.value = gainValue;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue * 0.001), startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
}

function scheduleNoiseBurst(context, startTime, duration, gainValue) {
    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < bufferSize; index += 1) {
        const falloff = 1 - index / bufferSize;
        data[index] = (Math.random() * 2 - 1) * falloff;
    }

    const source = context.createBufferSource();
    const bandPass = context.createBiquadFilter();
    const gainNode = context.createGain();

    source.buffer = buffer;
    bandPass.type = 'bandpass';
    bandPass.frequency.value = 2400;
    bandPass.Q.value = 1.2;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    source.connect(bandPass);
    bandPass.connect(gainNode);
    gainNode.connect(context.destination);

    source.start(startTime);
    source.stop(startTime + duration + 0.02);
}

// Authentic Peacemaker Shot with Layered Ricochet Whine
function playPeacemakerShot(context, startTime, withRicochet = false) {
    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(280, startTime);
    osc.frequency.exponentialRampToValueAtTime(36, startTime + 0.09);

    gainNode.gain.setValueAtTime(0.22, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

    osc.connect(gainNode);
    gainNode.connect(context.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.09);

    scheduleNoiseBurst(context, startTime, 0.08, 0.26);

    if (withRicochet) {
        const ricoOsc = context.createOscillator();
        const ricoGain = context.createGain();

        ricoOsc.type = 'sine';
        ricoOsc.frequency.setValueAtTime(800, startTime + 0.04);
        ricoOsc.frequency.exponentialRampToValueAtTime(3200, startTime + 0.12);
        ricoOsc.frequency.exponentialRampToValueAtTime(1200, startTime + 0.28);

        ricoGain.gain.setValueAtTime(0, startTime + 0.04);
        ricoGain.gain.linearRampToValueAtTime(0.09, startTime + 0.07);
        ricoGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

        ricoOsc.connect(ricoGain);
        ricoGain.connect(context.destination);

        ricoOsc.start(startTime + 0.04);
        ricoOsc.stop(startTime + 0.30);
    }
}

// Tracked Tone Scheduler
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

// Spaghetti Western Theme Loop
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
            scheduleTrackedTone(context, note.f, noteStart, beat * 0.9, 'square', 0.025, musicGain, registerNode);
        });

        scheduleTrackedTone(context, 146.83, barStart + beat * 3.5, beat * 0.45, 'square', 0.03, musicGain, registerNode);
    }
}

export function createAudioSystem() {
    let context = null;
    let muted = false;
    let musicTimer = null;
    let musicLoopEnd = 0;
    let musicEnabled = false;
    let musicMuted = false;
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
            if (!audioContext || muted || musicMuted) return;

            musicEnabled = true;
            musicLoopEnd = 0;
            scheduleMusic();
            musicTimer = window.setInterval(scheduleMusic, 1000);
        },
        stopMusic() {
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
        playTick(pitchMult = 1.0) {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            scheduleTone(ctx, 1200 * pitchMult, now, 0.015, 'sine', 0.035);
            scheduleNoiseBurst(ctx, now, 0.01, 0.02);
        },
        playSignal() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            scheduleTone(ctx, 440, now, 0.06, 'triangle', 0.08);
            scheduleTone(ctx, 880, now + 0.05, 0.12, 'square', 0.07);
        },
        playDraw() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            playPeacemakerShot(ctx, ctx.currentTime, true);
        },
        playHit() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            playPeacemakerShot(ctx, ctx.currentTime, false);
        },
        playVictory() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            scheduleTone(ctx, 523.25, now, 0.10, 'triangle', 0.07);
            scheduleTone(ctx, 659.25, now + 0.11, 0.10, 'triangle', 0.07);
            scheduleTone(ctx, 783.99, now + 0.22, 0.10, 'triangle', 0.07);
            scheduleTone(ctx, 1046.50, now + 0.33, 0.25, 'triangle', 0.08);
        },
        playLoss() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            playPeacemakerShot(ctx, now, false);
            scheduleTone(ctx, 311.13, now + 0.06, 0.16, 'sawtooth', 0.05, -30);
            scheduleTone(ctx, 293.66, now + 0.18, 0.22, 'sawtooth', 0.05, -45);
            scheduleTone(ctx, 146.83, now + 0.32, 0.38, 'sawtooth', 0.06, -60);
        },
        playCylinderSpin() {
            if (muted) return;
            const ctx = ensureContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            for (let i = 0; i < 6; i++) {
                const clickTime = now + i * 0.042;
                scheduleTone(ctx, 1600 + i * 120, clickTime, 0.012, 'square', 0.035);
                scheduleNoiseBurst(ctx, clickTime, 0.008, 0.03);
            }
        },
    };
}