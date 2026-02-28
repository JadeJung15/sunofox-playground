import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { db } from "../firebase-init.js?v=8.0.0";

const SUNO_OUTPUT_RULES_PROMPT = `You are an AI that generates Suno-ready music inputs for the SunoFox project.
Return ONLY valid JSON.
{
  "title": "",
  "style": "",
  "lyrics": ""
}
Project style:
- Anime OST inspired emotional electronic music
- Symphonic Drum & Bass, Ethereal Pop, Cinematic Electronic
- Female anime vocal, clear late-teen tone
- Emotional build, final chorus explosion
Input variables:
- genrePreset
- themePreset
- languageMode
- energyMode
- youtubeMode
Rules:
- Title format: 🦊 Korean Title — English Title
- Style in English only, one line
- Lyrics must contain only singable lines with allowed tags
- KR_ONLY = Korean only
- KR_EN_MIX = mostly Korean with some emotional English hooks
- Favor imagery, avoid commentary about music
- If youtubeMode is true, start immediately and make the final chorus biggest`;

const THEME_LIBRARY = {
    "Adventure Start": {
        krTitle: "새벽의 출발선",
        enTitle: "First Light Departure",
        imageA: "낯선 길목",
        imageB: "가벼운 바람",
        promise: "멀리 열린 길",
        hookKr: "두려움 너머로 먼저 달려가",
        hookEn: "Run into the light"
    },
    "Reunion Promise": {
        krTitle: "다시 만나는 약속",
        enTitle: "Promise to Meet Again",
        imageA: "젖은 골목 끝",
        imageB: "늦게 번진 불빛",
        promise: "놓지 않던 이름",
        hookKr: "멀어졌던 손끝 다시 닿아 와",
        hookEn: "Stay with me tonight"
    },
    "Night Journey": {
        krTitle: "밤을 건너는 숨",
        enTitle: "Breath Across the Night",
        imageA: "긴 그림자",
        imageB: "희미한 차선",
        promise: "아직 꺼지지 않은 방향",
        hookKr: "깊은 어둠 너머 별이 열려 와",
        hookEn: "Follow the fading blue"
    },
    "Lost Memory": {
        krTitle: "잊힌 장면의 끝",
        enTitle: "At the Edge of Memory",
        imageA: "빈 창가",
        imageB: "흐린 사진",
        promise: "남겨진 한 조각",
        hookKr: "지워진 시간 속 너를 다시 불러",
        hookEn: "Bring it back to me"
    },
    "Final Battle": {
        krTitle: "마지막 불꽃 앞에서",
        enTitle: "Before the Last Flame",
        imageA: "갈라진 대지",
        imageB: "붉은 하늘",
        promise: "끝내 지킬 뜻",
        hookKr: "무너진 밤 위로 내가 다시 선다",
        hookEn: "Stand through the fire"
    },
    "Victory Scene": {
        krTitle: "빛으로 남는 순간",
        enTitle: "The Moment We Remain",
        imageA: "들뜬 숨결",
        imageB: "쏟아진 햇빛",
        promise: "끝까지 붙든 꿈",
        hookKr: "멈춘 줄 알았던 하늘이 열려 와",
        hookEn: "We made it alive"
    },
    "Training Montage": {
        krTitle: "넘어선 발자국",
        enTitle: "Steps Beyond the Limit",
        imageA: "거친 숨",
        imageB: "이른 아침빛",
        promise: "쌓여 가는 의지",
        hookKr: "흔들린 어제보다 더 멀리 올라",
        hookEn: "Rise above again"
    },
    "School Youth": {
        krTitle: "교정 끝의 바람",
        enTitle: "Wind at the School Gate",
        imageA: "환한 복도",
        imageB: "늦은 종소리",
        promise: "아직 말하지 못한 마음",
        hookKr: "서툰 하루 끝에 웃음이 번져 와",
        hookEn: "Stay in this moment"
    },
    "Summer Festival": {
        krTitle: "불꽃 아래 여름",
        enTitle: "Summer Under Fireworks",
        imageA: "붉은 등불",
        imageB: "흔들린 유카타 끝",
        promise: "짧고 선명한 계절",
        hookKr: "스쳐 간 한순간 오래 남아 있어",
        hookEn: "Hold the summer night"
    },
    "Ocean Voyage": {
        krTitle: "푸른 항로의 끝",
        enTitle: "Beyond the Blue Route",
        imageA: "젖은 갑판",
        imageB: "먼 수평선",
        promise: "끝없이 열린 바다",
        hookKr: "부서진 파도 너머 내일이 밀려와",
        hookEn: "Sail into the sky"
    },
    "Sci-Fi Exploration": {
        krTitle: "별 사이의 좌표",
        enTitle: "Coordinates Between Stars",
        imageA: "낮은 엔진빛",
        imageB: "푸른 궤도선",
        promise: "아직 읽히지 않은 신호",
        hookKr: "먼 우주 끝에도 우리의 길이 있어",
        hookEn: "Find the next horizon"
    },
    "Time Loop Story": {
        krTitle: "되돌아오는 새벽",
        enTitle: "Dawn That Comes Again",
        imageA: "멈춘 시계",
        imageB: "낯익은 창문",
        promise: "같은 하루 속 다른 선택",
        hookKr: "반복된 시간 너머 결국 널 만나",
        hookEn: "Break the same sunrise"
    }
};

function getConfig() {
    return window.__SEVENCHECK_CONFIG__?.sunoGenerator || {};
}

function cleanText(value) {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeOptions(preset, options = {}) {
    return {
        genrePreset: cleanText(options.genrePreset) || preset.name,
        themePreset: THEME_LIBRARY[options.themePreset] ? options.themePreset : "Reunion Promise",
        languageMode: options.languageMode === "KR_EN_MIX" ? "KR_EN_MIX" : "KR_ONLY",
        energyMode: ["Calm", "Emotional", "Epic", "Bright", "Dark"].includes(options.energyMode) ? options.energyMode : "Emotional",
        youtubeMode: options.youtubeMode !== false
    };
}

function getTheme(themePreset) {
    return THEME_LIBRARY[themePreset] || THEME_LIBRARY["Reunion Promise"];
}

function buildTitle(options, variation = false) {
    const theme = getTheme(options.themePreset);
    if (!variation) return `🦊 ${theme.krTitle} — ${theme.enTitle}`;
    return `🦊 ${theme.krTitle}의 끝 — ${theme.enTitle} Finale`;
}

function buildStyleBlueprint(preset, options) {
    const genres = preset.genres.slice(0, 3).join(", ");
    const instruments = preset.instruments.slice(0, 5).join(", ");
    const vocalTone = {
        Calm: "female vocal soft airy sincere",
        Emotional: "female vocal airy emotional sincere",
        Epic: "female vocal bright powerful sincere",
        Bright: "female vocal light clear hopeful",
        Dark: "female vocal soft tense shadowed"
    }[options.energyMode];
    const direction = options.youtubeMode
        ? {
            Calm: "immediate melody, gentle rise, bridge contrast, final chorus bloom",
            Emotional: "early hook, cinematic build, bridge contrast, final chorus peak",
            Epic: "immediate hook, strong build, dramatic bridge, final chorus explosion",
            Bright: "instant vocal lift, opening energy, contrast bridge, final chorus shine",
            Dark: "immediate tension, dark build, sharp bridge contrast, final chorus surge"
        }[options.energyMode]
        : {
            Calm: "cinematic build, intimate verses, final chorus bloom",
            Emotional: "cinematic build, anime opening energy, final chorus peak",
            Epic: "heroic build, anime climax energy, final chorus explosion",
            Bright: "hopeful build, opening theme energy, final chorus shine",
            Dark: "tense build, story-driven intensity, final chorus release"
        }[options.energyMode];

    return `${genres} | ${preset.bpm} BPM | ${instruments} | ${vocalTone} | ${direction}`;
}

function introLines(theme, options) {
    if (options.languageMode === "KR_ONLY") {
        return options.youtubeMode
            ? [`${theme.imageA} 끝에 네가 먼저 스며와`, `${theme.imageB} 사이로 숨이 다시 깨어나`]
            : [`${theme.imageA} 위에 조용히 손을 얹고`, `${theme.imageB} 사이로 잊힌 숨을 모아`];
    }

    return options.youtubeMode
        ? [`${theme.imageA} 끝에 네가 먼저 스며와`, `You pull me into the light`]
        : [`${theme.imageA} 위에 조용히 손을 얹고`, `I can hear your distant breath`];
}

function chorusLines(theme, options) {
    if (options.languageMode === "KR_ONLY") {
        return {
            Calm: [`${theme.hookKr}`, `늦은 하늘 아래 마음이 천천히 열려`, `멀어진 계절 끝에 다시 웃을 수 있어`, `지금의 떨림도 결국 빛이 돼`],
            Emotional: [`${theme.hookKr}`, `흩어진 장면 끝에 네가 선명해져`, `떨리던 하루 끝에 다시 숨을 쉬어`, `지금의 눈물도 결국 빛이 돼`],
            Epic: [`${theme.hookKr}`, `무너진 세계 끝에 내가 더 크게 외쳐`, `붙잡은 약속 하나 끝까지 밀어 올려`, `지금의 심장으로 내일을 깨워 내`],
            Bright: [`${theme.hookKr}`, `반짝인 하늘 아래 웃음이 먼저 번져`, `쏟아진 햇빛처럼 하루가 가벼워져`, `지금의 설렘으로 문을 열어 가`],
            Dark: [`${theme.hookKr}`, `낮게 젖은 그림자마저 뒤로 흘러가`, `닫혀 있던 마음도 끝내 금을 내고`, `지금의 침묵도 결국 깨어나`]
        }[options.energyMode];
    }

    return {
        Calm: [`${theme.hookKr}`, `${theme.hookEn}`, `늦은 하늘 아래 slowly we begin again`, `지금의 떨림도 turns into light`],
        Emotional: [`${theme.hookKr}`, `${theme.hookEn}`, `흩어진 장면 끝에 we are not too late`, `지금의 눈물도 turns into light`],
        Epic: [`${theme.hookKr}`, `${theme.hookEn}`, `무너진 세계 끝에 we rise again tonight`, `붙잡은 약속으로 break the darkest line`],
        Bright: [`${theme.hookKr}`, `${theme.hookEn}`, `반짝인 하늘 아래 we can run so high`, `지금의 설렘으로 open up the sky`],
        Dark: [`${theme.hookKr}`, `${theme.hookEn}`, `낮게 젖은 그림자 through the closing night`, `지금의 침묵도 burns into light`]
    }[options.energyMode];
}

function buildKrOnlyLyrics(theme, options) {
    const firstChorus = chorusLines(theme, options);
    const finalChorus = [...firstChorus];
    finalChorus[1] = options.energyMode === "Epic"
        ? `갈라진 운명 끝에 내가 가장 크게 선다`
        : options.energyMode === "Bright"
            ? `쏟아진 빛 한가운데 우리가 더 높이 선다`
            : `${firstChorus[1]}`;

    return [
        "[Intro]",
        ...introLines(theme, options),
        "",
        "[Verse]",
        `${theme.promise} 하나 가슴 안에 접어 두고`,
        `${theme.imageB} 뒤로 흐른 시간들을 넘어가`,
        `멀어진 거리마다 네 흔적이 남아서`,
        `나는 오늘의 끝을 다시 고쳐 써`,
        "",
        "[Pre-Chorus]",
        `멈춘 줄 알았던 계절이 눈앞에 번져`,
        `가만한 두 손 위로 새로운 숨이 올라`,
        `${theme.promise} 이제는 놓치지 않아`,
        "",
        "[Chorus]",
        ...firstChorus,
        "",
        "[Verse]",
        `작게 금이 간 하루도 결국 나를 밀어`,
        `${theme.imageA} 너머로 더 멀리 시선을 던져`,
        `서툰 망설임까지 모두 안고 나면`,
        `흔들린 발끝도 조금씩 단단해져`,
        "",
        "[Chorus]",
        ...firstChorus,
        "",
        "[Bridge]",
        options.youtubeMode
            ? `모든 불빛이 꺼진 듯한 그 순간에도`
            : `아무 말 없는 하늘 아래 서 있어도`,
        `${theme.imageB} 사이로 다른 문이 열려`,
        `끝까지 남을 이름을 다시 불러`,
        "",
        "[Chorus]",
        ...finalChorus,
        "",
        "[Outro]",
        `사라진 뒤에도 온기는 남아`,
        `늦은 여운처럼 오래 번져 가`
    ].join("\n");
}

function buildMixedLyrics(theme, options) {
    const firstChorus = chorusLines(theme, options);
    const finalChorus = [...firstChorus];
    finalChorus[2] = options.energyMode === "Epic"
        ? `무너진 경계 너머 we rise again tonight`
        : options.energyMode === "Bright"
            ? `눈부신 장면 위로 we can run so high`
            : finalChorus[2];

    return [
        "[Intro]",
        ...introLines(theme, options),
        "",
        "[Verse]",
        `${theme.promise} 하나 가슴 안에 접어 두고`,
        `${theme.imageB} 뒤로 흐른 시간들을 넘어가`,
        `멀어진 거리마다 네 흔적이 남아서`,
        `I rewrite the end again`,
        "",
        "[Pre-Chorus]",
        `멈춘 줄 알았던 계절이 눈앞에 번져`,
        `가만한 두 손 위로 새로운 숨이 올라`,
        `I will not let it go`,
        "",
        "[Chorus]",
        ...firstChorus,
        "",
        "[Verse]",
        `작게 금이 간 하루도 결국 나를 밀어`,
        `${theme.imageA} 너머로 더 멀리 시선을 던져`,
        `서툰 망설임까지 모두 안고 나면`,
        `I can see the road ahead`,
        "",
        "[Chorus]",
        ...firstChorus,
        "",
        "[Bridge]",
        options.youtubeMode
            ? `모든 불빛이 꺼진 듯한 그 순간에도`
            : `아무 말 없는 하늘 아래 서 있어도`,
        `Everything turns and breaks apart`,
        `끝까지 남을 이름을 다시 불러`,
        "",
        "[Chorus]",
        ...finalChorus,
        "",
        "[Outro]",
        `사라진 뒤에도 온기는 남아`,
        `Your afterglow stays with me`
    ].join("\n");
}

function buildLyrics(preset, options) {
    const theme = getTheme(options.themePreset);
    return options.languageMode === "KR_EN_MIX"
        ? buildMixedLyrics(theme, options)
        : buildKrOnlyLyrics(theme, options);
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
                promptTemplate: SUNO_OUTPUT_RULES_PROMPT,
                input: {
                    genrePreset: options.genrePreset,
                    themePreset: options.themePreset,
                    languageMode: options.languageMode,
                    energyMode: options.energyMode,
                    youtubeMode: options.youtubeMode
                },
                preset: {
                    id: preset.id,
                    name: preset.name,
                    genres: preset.genres,
                    bpm: preset.bpm,
                    instruments: preset.instruments,
                    moodFocus: preset.moodFocus
                },
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

function buildDummyDraft(preset, rawOptions, variation = false) {
    const options = normalizeOptions(preset, rawOptions);
    return {
        title: buildTitle(options, variation),
        style: buildStyleBlueprint(preset, options),
        lyrics: buildLyrics(preset, options)
    };
}

export async function generateSunoDraft(preset, rawOptions, variation = false) {
    const options = normalizeOptions(preset, rawOptions);

    try {
        const remoteDraft = await requestRemoteDraft(preset, options, variation);
        if (remoteDraft) return remoteDraft;
    } catch (error) {
        console.warn("Suno draft remote generation failed. Falling back to local mode.", error);
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
