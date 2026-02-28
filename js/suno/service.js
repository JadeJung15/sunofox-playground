import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { db } from "../firebase-init.js?v=8.0.0";

const SUNO_OUTPUT_RULES_PROMPT = `너는 SunoFox 프로젝트를 위한 Suno 입력 3종을 생성한다.
반드시 JSON만 출력한다.
형식:
{
  "title": "",
  "style": "",
  "lyrics": ""
}
입력값:
- genrePreset
- languageMode: KR_ONLY | KR_EN_MIX
- vocalGender: FEMALE
- bpmHint
- themeHint
- intensity: CALM | EMOTIONAL | HYPE
핵심 규칙:
- title/style/lyrics 외 다른 텍스트 금지
- title은 "🦊 [한국어 제목] — [English Title]"
- style은 영어 한 줄, "Genre1, Genre2(, Genre3) | BPM | instruments | female vocal + tone | emotion/energy"
- lyrics는 실제 가사만 작성
- 섹션 태그는 영어로만 작성
- KR_ONLY는 한국어 가사만, KR_EN_MIX는 한국어 중심 자연 혼합
- 애니 OST 감정 곡선: 절제 -> 상승 -> 폭발 -> 여운
- 과한 반복, 설명문, 연출문 금지`;

const PRESET_THEME_MAP = {
    "symphonic-dnb": "storm",
    "emotional-glitch-pop": "glass",
    "fantasy-ost": "dawn",
    "battle-theme": "flame",
    "ending-theme": "afterglow",
    "dreamwave-anime": "dream",
    "idol-rock": "runway",
    "night-drive-city-pop": "night",
    "celestial-ballad": "starlight",
    "boss-rush": "gate"
};

const THEME_LIBRARY = {
    storm: {
        krTitle: "폭우 끝의 맹세",
        krAltTitle: "빗속의 약속",
        enTitle: "Stormbound Oath",
        enAltTitle: "Promise in the Rain",
        image: "젖은 하늘",
        trace: "번진 불빛",
        vow: "끝내 지킬 이름",
        hookKr: "넘어져도 너를 향해 달려",
        hookEn: "Run through the rain"
    },
    glass: {
        krTitle: "유리빛 새벽",
        krAltTitle: "흩어진 빛의 끝",
        enTitle: "Glass Dawn",
        enAltTitle: "Shards of Light",
        image: "얇은 새벽빛",
        trace: "깨질 듯한 숨",
        vow: "다시 모아 든 마음",
        hookKr: "흩어진 빛도 우리를 비춰",
        hookEn: "Hold the broken light"
    },
    dawn: {
        krTitle: "새벽의 숲길",
        krAltTitle: "빛을 건너는 노래",
        enTitle: "Path of Dawn",
        enAltTitle: "Crossing into Light",
        image: "고요한 숲길",
        trace: "엷게 번진 안개",
        vow: "멀리 남은 약속",
        hookKr: "먼 빛 끝까지 나는 가",
        hookEn: "Follow the dawn"
    },
    flame: {
        krTitle: "불꽃의 경계",
        krAltTitle: "타오르는 선",
        enTitle: "Edge of Flame",
        enAltTitle: "Burning Line",
        image: "붉은 하늘",
        trace: "들끓는 숨결",
        vow: "끝까지 놓지 않을 뜻",
        hookKr: "타는 밤을 넘어 내가 선다",
        hookEn: "Stand through the fire"
    },
    afterglow: {
        krTitle: "마지막 빛의 곁",
        krAltTitle: "남겨진 장면",
        enTitle: "Beside the Last Light",
        enAltTitle: "Left in the Last Scene",
        image: "늦은 저녁빛",
        trace: "가만한 발자국",
        vow: "조용히 남아 준 온기",
        hookKr: "끝난 줄 알았던 마음이 또 피어",
        hookEn: "Stay in the afterglow"
    },
    dream: {
        krTitle: "푸른 꿈의 잔광",
        krAltTitle: "잠들지 않는 파문",
        enTitle: "Blue Dream Afterglow",
        enAltTitle: "Waking Ripple",
        image: "푸른 잔광",
        trace: "느리게 번지는 파문",
        vow: "사라지지 않을 떨림",
        hookKr: "흔들려도 이 꿈을 안아",
        hookEn: "Keep the dream alive"
    },
    runway: {
        krTitle: "심장 점화",
        krAltTitle: "빛나는 출발선",
        enTitle: "Heart Ignition",
        enAltTitle: "Shining Start Line",
        image: "눈부신 무대 끝",
        trace: "떨리는 첫 박자",
        vow: "멈추지 않을 선언",
        hookKr: "지금 이 순간 더 높이 올라",
        hookEn: "Raise it up tonight"
    },
    night: {
        krTitle: "새벽 차선 위에서",
        krAltTitle: "도시의 잔불",
        enTitle: "On the Midnight Lane",
        enAltTitle: "City Afterglow",
        image: "비어 있는 차선",
        trace: "흐린 가로등",
        vow: "천천히 깨어난 마음",
        hookKr: "멀어진 밤도 우리를 못 멈춰",
        hookEn: "Drive into the blue"
    },
    starlight: {
        krTitle: "별 내린 숨결",
        krAltTitle: "은하의 조용한 말",
        enTitle: "Starlit Breath",
        enAltTitle: "Quiet Words of the Sky",
        image: "낮게 내린 별빛",
        trace: "가벼운 숨의 떨림",
        vow: "조용히 이어진 기도",
        hookKr: "아득한 빛도 내 안에 닿아",
        hookEn: "Breathe in the starlight"
    },
    gate: {
        krTitle: "최후의 문 앞에서",
        krAltTitle: "닫히지 않는 결의",
        enTitle: "Before the Final Gate",
        enAltTitle: "Unbroken Resolve",
        image: "거대한 문 앞",
        trace: "무겁게 고인 침묵",
        vow: "끝까지 밀어 올릴 의지",
        hookKr: "무너져도 다시 문을 연다",
        hookEn: "Break the final gate"
    }
};

function getConfig() {
    return window.__SEVENCHECK_CONFIG__?.sunoGenerator || {};
}

function cleanText(value) {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeOptions(preset, options = {}) {
    const bpmHint = Number.parseInt(options.bpmHint, 10);
    return {
        genrePreset: cleanText(options.genrePreset) || `${preset.genres.join(", ")} | ${preset.instruments.join(", ")}`,
        languageMode: options.languageMode === "KR_EN_MIX" ? "KR_EN_MIX" : "KR_ONLY",
        vocalGender: "FEMALE",
        bpmHint: Number.isFinite(bpmHint) ? Math.max(60, Math.min(220, bpmHint)) : preset.bpm,
        themeHint: cleanText(options.themeHint),
        intensity: ["CALM", "EMOTIONAL", "HYPE"].includes(options.intensity) ? options.intensity : "EMOTIONAL"
    };
}

function inferThemeKey(preset, themeHint) {
    const hint = themeHint.toLowerCase();

    if (/(비|rain|storm|폭우|소나기)/.test(hint)) return "storm";
    if (/(유리|glass|조각|빛조각)/.test(hint)) return "glass";
    if (/(새벽|dawn|아침|해뜰)/.test(hint)) return "dawn";
    if (/(불|fire|flame|화염|열기)/.test(hint)) return "flame";
    if (/(엔딩|ending|여운|잔광|afterglow)/.test(hint)) return "afterglow";
    if (/(꿈|dream|환상|파문)/.test(hint)) return "dream";
    if (/(무대|stage|idol|출발선|run)/.test(hint)) return "runway";
    if (/(밤|night|도시|drive|차선)/.test(hint)) return "night";
    if (/(별|star|moon|우주|은하)/.test(hint)) return "starlight";
    if (/(문|gate|boss|최후|결전)/.test(hint)) return "gate";

    return PRESET_THEME_MAP[preset.id] || "dawn";
}

function getThemeData(preset, options, variation) {
    const themeKey = inferThemeKey(preset, options.themeHint);
    const theme = THEME_LIBRARY[themeKey] || THEME_LIBRARY.dawn;

    return {
        themeKey,
        krTitle: variation ? theme.krAltTitle : theme.krTitle,
        enTitle: variation ? theme.enAltTitle : theme.enTitle,
        image: theme.image,
        trace: theme.trace,
        vow: theme.vow,
        hookKr: theme.hookKr,
        hookEn: theme.hookEn
    };
}

function buildTitle(preset, options, variation = false) {
    const theme = getThemeData(preset, options, variation);
    return `🦊 ${theme.krTitle} — ${theme.enTitle}`;
}

function buildStyleBlueprint(preset, options, variation = false) {
    const theme = getThemeData(preset, options, variation);
    const genres = preset.genres.slice(0, 3).join(", ");
    const instruments = preset.instruments.slice(0, 5).join(", ");

    const vocalTone = {
        CALM: "female vocal + clear soft tone",
        EMOTIONAL: "female vocal + clear emotional tone",
        HYPE: "female vocal + bright urgent tone"
    }[options.intensity];

    const energyLine = {
        CALM: `restrained verses, tender rise, luminous chorus, lingering ${theme.themeKey} afterglow`,
        EMOTIONAL: `restrained verses, swelling ache, explosive chorus, lingering ${theme.themeKey} afterglow`,
        HYPE: `restrained verses, fast lift, explosive chorus, lingering ${theme.themeKey} afterglow`
    }[options.intensity];

    return [
        genres,
        `${options.bpmHint} BPM`,
        instruments,
        vocalTone,
        energyLine
    ].join(" | ");
}

function buildThemeHintLine(themeHint, fallback, suffix) {
    if (!themeHint) return `${fallback}${suffix}`;
    return `${themeHint} ${suffix}`;
}

function buildKrOnlyLyrics(theme, options) {
    const themeLine = buildThemeHintLine(options.themeHint, theme.image, "아래 숨을 모아");
    const secondThemeLine = buildThemeHintLine(options.themeHint, theme.trace, "곁에서 떨린 마음도");

    const intro = [
        themeLine,
        `${theme.trace} 끝에 아직 이름을 안아`
    ];

    const verse1 = [
        `늦은 바람이 어깨를 스쳐도`,
        `나는 오늘의 떨림을 숨기지 않아`,
        secondThemeLine,
        `조용한 발끝으로 다시 너를 향해 가`
    ];

    const preChorus1 = options.intensity === "CALM"
        ? [
            `접어 둔 두려움이 천천히 풀리고`,
            `가슴 안 작은 불빛이 길을 밝혀`,
            `${theme.vow} 점점 더 선명해져`
        ]
        : [
            `접어 둔 두려움이 한순간 깨어나`,
            `가슴 안 작은 불빛이 위로 치솟아`,
            `${theme.vow} 점점 더 선명해져`
        ];

    const chorus = options.intensity === "HYPE"
        ? [
            `${theme.hookKr}`,
            `거센 밤 끝에서도 나는 더 크게 빛나`,
            `멈춘 듯한 세상을 밀어 올려`,
            `우리의 내일은 지금 여기서 시작돼`
        ]
        : [
            `${theme.hookKr}`,
            `흔들린 밤 끝에서도 나는 너를 비춰`,
            `울어도 좋아 다시 피어날 테니`,
            `우리의 내일은 지금 여기서 시작돼`
        ];

    const verse2 = [
        `멀어진 시간은 뒤로 흘러가도`,
        `내 안의 목소리는 더욱 또렷해져`,
        `작게 접어 둔 바람 하나까지`,
        `이번엔 놓치지 않고 두 손에 쥘 거야`
    ];

    const preChorus2 = options.intensity === "CALM"
        ? [
            `조용히 닫힌 문들도 결국 열리고`,
            `멈춘 줄 알았던 계절이 돌아와`,
            `${theme.vow} 이제는 피하지 않아`
        ]
        : [
            `조용히 닫힌 문들도 끝내 열리고`,
            `멈춘 줄 알았던 심장이 다시 뛰어`,
            `${theme.vow} 이제는 피하지 않아`
        ];

    const bridge = options.intensity === "HYPE"
        ? [
            `가장 어두운 순간에 더 크게 외쳐`,
            `부서진 장면 위로 새 길을 그려`,
            `끝까지 남을 이름을 내 안에 새겨`
        ]
        : [
            `가장 깊은 숨 끝에서 너를 부르면`,
            `멈춰 있던 장면들도 빛으로 열려`,
            `끝까지 남을 이름을 내 안에 새겨`
        ];

    const outro = [
        `사라진 뒤에도 온기는 남아`,
        `조용한 여운처럼 오래 번져 가`
    ];

    return [
        "[Intro]",
        ...intro,
        "",
        "[Verse]",
        ...verse1,
        "",
        "[Pre-Chorus]",
        ...preChorus1,
        "",
        "[Chorus]",
        ...chorus,
        "",
        "[Verse]",
        ...verse2,
        "",
        "[Pre-Chorus]",
        ...preChorus2,
        "",
        "[Chorus]",
        ...chorus,
        "",
        "[Bridge]",
        ...bridge,
        "",
        "[Chorus]",
        ...chorus,
        "",
        "[Outro]",
        ...outro
    ].join("\n");
}

function buildMixedLyrics(theme, options) {
    const hintKorean = buildThemeHintLine(options.themeHint, theme.image, "아래 숨을 모아");

    const intro = [
        hintKorean,
        `I keep your light with me`
    ];

    const verse1 = [
        `늦은 바람이 스쳐도 나는 멈추지 않아`,
        `${theme.trace} 끝에서 더 선명해진 너를 봐`,
        `작게 흔들리던 마음까지 안고서`,
        `I take one more step tonight`
    ];

    const preChorus1 = options.intensity === "CALM"
        ? [
            `조용히 닫아 둔 문이 조금씩 열려`,
            `${theme.vow} 더 가까워져`,
            `Hold on, I can hear it now`
        ]
        : [
            `조용히 닫아 둔 문이 한순간 열려`,
            `${theme.vow} 더 가까워져`,
            `Hold on, I can hear it now`
        ];

    const chorus = options.intensity === "HYPE"
        ? [
            `${theme.hookKr}, never let it fall`,
            `거센 밤 끝에서도 we are still alive`,
            `밀어 올려 지금 이 장면 위로`,
            `Stay with me, our story starts tonight`
        ]
        : [
            `${theme.hookKr}, never let it fade`,
            `흔들린 밤 끝에서도 we are still alive`,
            `울어도 돼 여기서 다시 피어나`,
            `Stay with me, our story starts tonight`
        ];

    const verse2 = [
        `멀어진 시간도 이제는 두렵지 않아`,
        `작게 남은 떨림까지 품에 안아`,
        `무너진 장면 위에 숨을 맞추고`,
        `I can see the way we go`
    ];

    const preChorus2 = [
        `멈춘 줄 알았던 계절이 다시 돌아와`,
        `${theme.vow} 더 크게 번져`,
        `This is where I call your name`
    ];

    const bridge = options.intensity === "HYPE"
        ? [
            `가장 어두운 순간에도 나를 깨워`,
            `Break the silence, light the road`,
            `끝까지 남을 진심만 안고 가`
        ]
        : [
            `가장 깊은 숨 끝에서 너를 부르면`,
            `Break the silence, light the road`,
            `끝까지 남을 진심만 안고 가`
        ];

    const outro = [
        `사라진 뒤에도 온기는 남아`,
        `Softly, your light stays with me`
    ];

    return [
        "[Intro]",
        ...intro,
        "",
        "[Verse]",
        ...verse1,
        "",
        "[Pre-Chorus]",
        ...preChorus1,
        "",
        "[Chorus]",
        ...chorus,
        "",
        "[Verse]",
        ...verse2,
        "",
        "[Pre-Chorus]",
        ...preChorus2,
        "",
        "[Chorus]",
        ...chorus,
        "",
        "[Bridge]",
        ...bridge,
        "",
        "[Chorus]",
        ...chorus,
        "",
        "[Outro]",
        ...outro
    ].join("\n");
}

function buildLyrics(preset, options, variation = false) {
    const theme = getThemeData(preset, options, variation);
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
                    languageMode: options.languageMode,
                    vocalGender: options.vocalGender,
                    bpmHint: options.bpmHint,
                    themeHint: options.themeHint || null,
                    intensity: options.intensity
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
        title: buildTitle(preset, options, variation),
        style: buildStyleBlueprint(preset, options, variation),
        lyrics: buildLyrics(preset, options, variation)
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
