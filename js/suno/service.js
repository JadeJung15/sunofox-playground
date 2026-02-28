import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { db } from "../firebase-init.js?v=8.0.0";

function getConfig() {
    return window.__SEVENCHECK_CONFIG__?.sunoGenerator || {};
}

function getEndpointUrl() {
    const configured = typeof getConfig().endpointUrl === "string" ? getConfig().endpointUrl.trim() : "";
    return configured || "/api/generate";
}

function cleanText(value) {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function validateDraftShape(payload) {
    return !!payload &&
        typeof payload.title === "string" &&
        typeof payload.style === "string" &&
        typeof payload.lyrics === "string";
}

function normalizeRequestPayload(preset, options = {}) {
    return {
        genrePreset: cleanText(options.genrePreset) || cleanText(preset?.label) || cleanText(preset?.name),
        themePreset: cleanText(options.themePreset) || "reunion_promise",
        languageMode: options.languageMode === "KR_EN_MIX" ? "KR_EN_MIX" : "KR_ONLY",
        energyMode: cleanText(options.energyMode) || "emotional",
        youtubeMode: options.youtubeMode !== false
    };
}

export async function generateSunoDraft(preset, rawOptions) {
    const payload = normalizeRequestPayload(preset, rawOptions);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getConfig().requestTimeoutMs || 15000);

    try {
        const response = await fetch(getEndpointUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            signal: controller.signal,
            body: JSON.stringify(payload)
        });

        const responseBody = await response.json().catch(() => null);
        if (!response.ok) {
            const message = responseBody?.error || `HTTP ${response.status}`;
            throw new Error(message);
        }

        if (!validateDraftShape(responseBody)) {
            throw new Error("Invalid response shape");
        }

        return {
            title: responseBody.title.trim(),
            style: responseBody.style.trim(),
            lyrics: responseBody.lyrics.trim()
        };
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function saveSunoDraft(draft, context = {}) {
    const payload = {
        title: cleanText(draft.title),
        style: cleanText(draft.style),
        lyrics: typeof draft.lyrics === "string" ? draft.lyrics.trim() : "",
        genre: cleanText(context.genre),
        theme: cleanText(context.theme),
        languageMode: cleanText(context.languageMode) || "KR_ONLY",
        energyMode: cleanText(context.energyMode) || "emotional",
        youtubeMode: context.youtubeMode !== false,
        createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "songDrafts"), payload);
    return { ok: true };
}
