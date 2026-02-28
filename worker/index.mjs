const OPENAI_CHAT_COMPLETIONS_PATH = "/chat/completions";

const THEME_LIBRARY = {
    adventure_start: {
        label: "Adventure Start",
        krTitle: "새벽의 출발선",
        enTitle: "First Light Departure",
        storySeed: "departure, courage, first step into a new world"
    },
    night_journey: {
        label: "Night Journey",
        krTitle: "밤을 건너는 숨",
        enTitle: "Breath Across the Night",
        storySeed: "night drive, dim lights, searching through darkness"
    },
    reunion_promise: {
        label: "Reunion Promise",
        krTitle: "다시 만나는 약속",
        enTitle: "Promise to Meet Again",
        storySeed: "reunion, promise, longing and recovery"
    },
    final_battle: {
        label: "Final Battle",
        krTitle: "마지막 불꽃 앞에서",
        enTitle: "Before the Last Flame",
        storySeed: "last stand, fire, resolve, climax"
    },
    victory_scene: {
        label: "Victory Scene",
        krTitle: "빛으로 남는 순간",
        enTitle: "The Moment We Remain",
        storySeed: "victory, sunlight, emotional release"
    },
    summer_festival: {
        label: "Summer Festival",
        krTitle: "불꽃 아래 여름",
        enTitle: "Summer Under Fireworks",
        storySeed: "festival lights, fireworks, fleeting youth"
    },
    ocean_voyage: {
        label: "Ocean Voyage",
        krTitle: "푸른 항로의 끝",
        enTitle: "Beyond the Blue Route",
        storySeed: "voyage, sea wind, horizon, adventure"
    },
    time_loop: {
        label: "Time Loop",
        krTitle: "되돌아오는 새벽",
        enTitle: "Dawn That Comes Again",
        storySeed: "repeated day, memory fragments, breaking the cycle"
    }
};

const ENERGY_GUIDE = {
    calm: "soft, airy, intimate, gentle rise",
    emotional: "emotional, cinematic, heartfelt, strong chorus payoff",
    epic: "heroic, dramatic, high-impact, explosive final chorus",
    bright: "hopeful, sparkling, uplifting, energetic",
    dark: "tense, shadowy, dramatic, moody"
};

function json(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...headers
        }
    });
}

function normalizeText(value) {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeOrigin(env, requestOrigin) {
    const configured = normalizeText(env.CORS_ALLOWED_ORIGIN || env.APP_ORIGIN);
    if (!configured) return "";
    return requestOrigin === configured ? configured : "";
}

function buildCorsHeaders(env, request) {
    const origin = normalizeOrigin(env, request.headers.get("Origin") || "");
    if (!origin) return null;
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin"
    };
}

function readJsonBody(request) {
    return request.json().catch(() => {
        throw new Error("Invalid JSON body");
    });
}

function normalizeThemeId(value) {
    const normalized = normalizeText(value);
    return THEME_LIBRARY[normalized] ? normalized : "reunion_promise";
}

function normalizeEnergyMode(value) {
    const normalized = normalizeText(value).toLowerCase();
    return ENERGY_GUIDE[normalized] ? normalized : "emotional";
}

function normalizePayload(input) {
    return {
        genrePreset: normalizeText(input.genrePreset),
        themePreset: normalizeThemeId(input.themePreset),
        languageMode: input.languageMode === "KR_EN_MIX" ? "KR_EN_MIX" : "KR_ONLY",
        energyMode: normalizeEnergyMode(input.energyMode),
        youtubeMode: input.youtubeMode !== false
    };
}

function validatePayload(payload) {
    if (!payload.genrePreset) {
        return "genrePreset is required";
    }
    return null;
}

function buildPrompt(payload) {
    const theme = THEME_LIBRARY[payload.themePreset] || THEME_LIBRARY.reunion_promise;
    const languageRule = payload.languageMode === "KR_EN_MIX"
        ? "Lyrics should be mostly Korean with selective emotional English hooks."
        : "Lyrics should be Korean only, except section tags like [Verse] and [Chorus].";
    const youtubeRule = payload.youtubeMode
        ? "Start with a strong hook and make the final chorus the biggest moment."
        : "Allow a slower build before the main payoff.";

    return [
        "Generate Suno-ready JSON only.",
        'Return exactly this JSON shape: {"title":"","style":"","lyrics":""}.',
        "Do not wrap the JSON in markdown.",
        "Title must follow: 🦊 Korean Title — English Title.",
        "Style must be a single English line suitable for Suno.",
        "Lyrics must contain section tags and only singable lines.",
        "",
        `Genre preset: ${payload.genrePreset}`,
        `Theme: ${theme.label} (${theme.storySeed})`,
        `Energy: ${payload.energyMode} (${ENERGY_GUIDE[payload.energyMode]})`,
        `Language mode: ${payload.languageMode}`,
        `YouTube mode: ${payload.youtubeMode ? "on" : "off"}`,
        "",
        languageRule,
        youtubeRule,
        "Female anime-style late-teen vocal tone. Emotional electronic / anime OST sensibility."
    ].join("\n");
}

function validateDraftShape(payload) {
    return payload &&
        typeof payload.title === "string" &&
        typeof payload.style === "string" &&
        typeof payload.lyrics === "string";
}

async function callProvider(env, payload) {
    const baseUrl = normalizeText(env.OPENAI_COMPAT_BASE_URL);
    const apiKey = normalizeText(env.OPENAI_API_KEY);
    const model = normalizeText(env.OPENAI_MODEL);

    if (!baseUrl || !apiKey || !model) {
        throw new Error("Worker secrets/vars are incomplete");
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}${OPENAI_CHAT_COMPLETIONS_PATH}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            temperature: 0.9,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: "Return only JSON with title, style, lyrics."
                },
                {
                    role: "user",
                    content: buildPrompt(payload)
                }
            ]
        })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.error?.message || data?.error || `Provider HTTP ${response.status}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    if (!validateDraftShape(parsed)) {
        throw new Error("Provider returned invalid draft shape");
    }

    return {
        title: parsed.title.trim(),
        style: parsed.style.trim(),
        lyrics: parsed.lyrics.trim()
    };
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const corsHeaders = buildCorsHeaders(env, request);

        if (request.method === "OPTIONS" && url.pathname === "/api/generate") {
            if (!corsHeaders) {
                return json({ error: "Origin not allowed" }, 403);
            }
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (request.method === "GET" && url.pathname === "/healthz") {
            return json({ ok: true });
        }

        if (request.method !== "POST" || url.pathname !== "/api/generate") {
            return json({ error: "Not found" }, 404);
        }

        if (!corsHeaders) {
            return json({ error: "Origin not allowed" }, 403);
        }

        try {
            const body = await readJsonBody(request);
            const payload = normalizePayload(body);
            const validationError = validatePayload(payload);
            if (validationError) {
                return json({ error: validationError }, 400, corsHeaders);
            }

            const draft = await callProvider(env, payload);
            return json(draft, 200, corsHeaders);
        } catch (error) {
            return json({ error: error.message || "Unknown error" }, 500, corsHeaders);
        }
    }
};
