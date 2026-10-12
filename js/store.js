// Prototype storage: everything lives in this browser's localStorage.
// The real version will keep the same shape on a server.

const KEY = 'dojo-arena-v1';

const blank = () => ({ theme: 'colosseum', coach: null, participants: [], selected: [] });

export function load() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? { ...blank(), ...JSON.parse(raw) } : blank();
    } catch {
        return blank();
    }
}

export function save(state) {
    try {
        localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
        // private mode / storage full — the page keeps working until reload
    }
}

export function reset() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    return blank();
}
