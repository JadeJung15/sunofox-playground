const ACCESS_STORAGE_KEY = "suno_generator_access_v1";
const GATE_REQUEST_KEY = "suno_generator_open_gate";

function getSunoConfig() {
    return window.__SEVENCHECK_CONFIG__?.sunoGenerator || {};
}

function getAccessConfig() {
    return getSunoConfig().access || {};
}

function normalizeHash(value) {
    return (value || "").trim().toLowerCase();
}

function normalizeEmail(value) {
    return (value || "").trim().toLowerCase();
}

async function sha256Hex(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

function writeAccessSession() {
    const sessionHours = Number(getAccessConfig().sessionHours) || 12;
    const expiresAt = Date.now() + (sessionHours * 60 * 60 * 1000);
    sessionStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify({ expiresAt }));
}

export function getSunoRuntimeConfig() {
    return getSunoConfig();
}

export function requestSunoGateOpen() {
    sessionStorage.setItem(GATE_REQUEST_KEY, "1");
}

export function consumeSunoGateRequest() {
    const requested = sessionStorage.getItem(GATE_REQUEST_KEY) === "1";
    if (requested) sessionStorage.removeItem(GATE_REQUEST_KEY);
    return requested;
}

export function canUnlockWithAllowedEmail(user, isMaster = false) {
    if (isMaster) return true;
    const access = getAccessConfig();
    if (!access.allowFirebaseWhitelist) return false;
    const allowed = (access.allowedEmails || []).map(normalizeEmail).filter(Boolean);
    return !!user?.email && allowed.includes(normalizeEmail(user.email));
}

export function hasSunoAccess({ user = null, isMaster = false } = {}) {
    if (canUnlockWithAllowedEmail(user, isMaster)) return true;

    try {
        const raw = sessionStorage.getItem(ACCESS_STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
            sessionStorage.removeItem(ACCESS_STORAGE_KEY);
            return false;
        }
        return true;
    } catch (error) {
        sessionStorage.removeItem(ACCESS_STORAGE_KEY);
        return false;
    }
}

export async function unlockSunoWithPasscode(passcode) {
    const expectedHash = normalizeHash(getAccessConfig().passcodeHash);
    if (!expectedHash) {
        return { ok: false, reason: "not-configured" };
    }

    const actualHash = await sha256Hex(passcode.trim());
    if (actualHash !== expectedHash) {
        return { ok: false, reason: "invalid-passcode" };
    }

    writeAccessSession();
    return { ok: true };
}

export function unlockSunoForAllowedUser(user, isMaster = false) {
    if (!canUnlockWithAllowedEmail(user, isMaster)) {
        return { ok: false, reason: "not-allowed" };
    }

    writeAccessSession();
    return { ok: true };
}

export function clearSunoAccess() {
    sessionStorage.removeItem(ACCESS_STORAGE_KEY);
}
