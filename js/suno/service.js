import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { db } from "../firebase-init.js?v=8.0.0";

function getConfig() {
    return window.__SEVENCHECK_CONFIG__?.sunoGenerator || {};
}

function buildStyleBlueprint(preset, options) {
    const vocalText = options.vocal === "instrumental" ? "무보컬 cinematic lead" : "여성 보컬 airy lead";
    return [
        preset.genres.join(", "),
        `${preset.bpm} BPM`,
        preset.instruments.join(", "),
        vocalText,
        `${options.mood}, ${options.length === "짧게" ? "compact structure" : "full arc"}, anime energy`
    ].join(" | ");
}

function buildTitle(preset, options, variation = false) {
    const suffixByMood = {
        "감성": "Blue Horizon",
        "비장": "Last Oath",
        "몽환": "Star Bloom",
        "전투": "Crimson Signal"
    };
    const prefixByLength = {
        "짧게": "Short Cut",
        "보통": "Full Ver."
    };

    const suffix = suffixByMood[options.mood] || "Silver Echo";
    const variationTag = variation ? " Reprise" : "";
    return `${preset.name} ${prefixByLength[options.length] || "Mix"} ${suffix}${variationTag}`;
}

function buildLyrics(preset, options, variation = false) {
    const vocalLine = options.vocal === "instrumental"
        ? "Instrumental hook carries the scene without any vocal line"
        : "A clear female lead enters with restrained emotion and rising resolve";

    const moodLine = {
        "감성": "Memories glow softly while the night air keeps every promise close",
        "비장": "Every step feels heavier, but the heart refuses to break formation",
        "몽환": "Light drifts slowly across the sky as if time forgot to fall",
        "전투": "The ground shakes with impact while resolve cuts through the smoke"
    }[options.mood] || "The scene stays vivid and focused through every measure";

    const closingLine = variation
        ? "The final refrain bends the theme into a brighter, riskier ending"
        : "The final refrain lands with clarity before the world fades into silence";

    return [
        "[Verse]",
        `In the opening frame, ${preset.name} starts with measured momentum`,
        moodLine,
        "",
        "[Chorus]",
        vocalLine,
        "The hook rises with a clean melodic lift and forward motion",
        "",
        "[Bridge]",
        "Harmony narrows, tension builds, and the arrangement opens one last path",
        "A short melodic answer turns the emotional center of the track",
        "",
        "[Outro]",
        closingLine,
        "Only the core motif remains as the scene cuts to black"
    ].join("\n");
}

function validateDraftShape(payload) {
    return !!payload &&
        typeof payload.title === "string" &&
        typeof payload.style === "string" &&
        typeof payload.lyrics === "string";
}

async function requestRemoteDraft(preset, options, variation) {
    const config = getConfig();
    if (!config.endpointUrl) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs || 15000);

    try {
        const response = await fetch(config.endpointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                preset: {
                    id: preset.id,
                    name: preset.name
                },
                options,
                variation
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        if (!validateDraftShape(payload)) {
            throw new Error("Invalid response shape");
        }

        return payload;
    } finally {
        clearTimeout(timeoutId);
    }
}

function buildDummyDraft(preset, options, variation = false) {
    return {
        title: buildTitle(preset, options, variation),
        style: buildStyleBlueprint(preset, options),
        lyrics: buildLyrics(preset, options, variation)
    };
}

export async function generateSunoDraft(preset, options, variation = false) {
    try {
        const remoteDraft = await requestRemoteDraft(preset, options, variation);
        if (remoteDraft) return remoteDraft;
    } catch (error) {
        console.warn("Suno draft remote generation failed. Falling back to dummy mode.", error);
    }

    return buildDummyDraft(preset, options, variation);
}

export async function saveSunoDraft(draft, context = {}) {
    const storageConfig = getConfig().storage || {};
    if (!storageConfig.enabled) {
        return { ok: false, reason: "storage-disabled" };
    }

    const collectionName = storageConfig.collection || "sunoDrafts";
    await addDoc(collection(db, collectionName), {
        ...draft,
        presetId: context.presetId || null,
        presetName: context.presetName || null,
        options: context.options || {},
        uid: context.user?.uid || null,
        email: context.user?.email || null,
        createdAt: serverTimestamp()
    });

    return { ok: true };
}
