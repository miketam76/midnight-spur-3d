// main.js
import { createGame } from './game.js';

const dom = {
    menuScreen: document.getElementById('menuScreen'),
    gameScreen: document.getElementById('gameScreen'),
    resultScreen: document.getElementById('resultScreen'),
    scoresScreen: document.getElementById('scoresScreen'),
    entryScreen: document.getElementById('entryScreen'),
    demoMarquee: document.getElementById('demoMarquee'),
    startButton: document.getElementById('startButton'),
    scoresButton: document.getElementById('scoresButton'),
    scoresBackButton: document.getElementById('scoresBackButton'),
    playAgainButton: document.getElementById('playAgainButton'),
    backToMenuButton: document.getElementById('backToMenuButton'),
    drawButton: document.getElementById('drawButton'),
    canvas: document.getElementById('gameCanvas'),
    statusText: document.getElementById('statusText'),
    roundValue: document.getElementById('roundValue'),
    bountyValue: document.getElementById('bountyValue'),
    winsValue: document.getElementById('winsValue'),
    bestValue: document.getElementById('bestValue'),
    finalWins: document.getElementById('finalWins'),
    finalBest: document.getElementById('finalBest'),
    resultBadge: document.getElementById('resultBadge'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    pauseButton: document.getElementById('pauseButton'),
    muteButton: document.getElementById('muteButton'),
    exitButton: document.getElementById('exitButton'),
    scoresTable: document.getElementById('scoresTable'),
    charSlot0: document.getElementById('charSlot0'),
    charSlot1: document.getElementById('charSlot1'),
    charSlot2: document.getElementById('charSlot2'),
    prevCharBtn: document.getElementById('prevCharBtn'),
    nextCharBtn: document.getElementById('nextCharBtn'),
    confirmCharBtn: document.getElementById('confirmCharBtn'),
};

const game = createGame(dom);
game.boot();

// Start & Menu Handlers
dom.startButton.addEventListener('click', () => game.startRound());
dom.scoresButton.addEventListener('click', () => game.showHighScores());
dom.scoresBackButton?.addEventListener('click', () => game.startMenu(true));
dom.playAgainButton.addEventListener('click', () => game.restartGame());
dom.backToMenuButton?.addEventListener('click', () => game.startMenu(true));
dom.exitButton?.addEventListener('click', () => game.startMenu(true));
dom.drawButton.addEventListener('click', () => game.onDraw());

// Initials Entry Controls
dom.prevCharBtn?.addEventListener('click', () => game.cycleInitials(-1));
dom.nextCharBtn?.addEventListener('click', () => game.cycleInitials(1));
dom.confirmCharBtn?.addEventListener('click', () => game.confirmInitialSlot());

// Utility Buttons
dom.pauseButton.addEventListener('click', () => game.togglePause());
dom.muteButton.addEventListener('click', () => {
    const isMuted = game.toggleMute();
    dom.muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
});

// Any pointer click or touch during Attract Demo or Scores interrupts and returns to Title
window.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('button')) {
        game.handleAttractInterrupt();
    }
});

// Keyboard Navigation & Shortcuts
window.addEventListener('keydown', (event) => {
    if (game.handleAttractInterrupt()) {
        event.preventDefault();
        return;
    }

    if (event.code === 'KeyP') {
        event.preventDefault();
        game.togglePause();
        return;
    }

    if (event.code === 'KeyM') {
        event.preventDefault();
        const isMuted = game.toggleMute();
        dom.muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
        return;
    }

    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        game.cycleInitials(-1);
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        game.cycleInitials(1);
    }

    if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        if (dom.entryScreen && !dom.entryScreen.hidden) {
            game.confirmInitialSlot();
        } else {
            game.onDraw();
        }
    }
});