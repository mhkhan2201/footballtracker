// localStorage is the ONLY persistence in this app, and only to survive a
// screen lock / tab switch / accidental refresh mid-match. Wiped completely
// on "End Match".
const KEY = 'match-tracker:state:v1';

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage can throw in private-browsing / quota-exceeded situations.
    // The match still works in-memory, it just won't survive a reload.
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    // ignore
  }
}
