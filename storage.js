const STORAGE_KEY = 'quick-draw-duel-high-score';

export function loadBestWins() {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const parsedValue = Number(rawValue);

    return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

export function saveBestWins(wins) {
    const currentBest = loadBestWins();
    const nextBest = Math.max(currentBest, wins);
    window.localStorage.setItem(STORAGE_KEY, String(nextBest));
    return nextBest;
}
