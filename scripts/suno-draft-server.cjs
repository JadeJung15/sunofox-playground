#!/usr/bin/env node
const http = require('http');
const { URL } = require('url');

const PORT = Number.parseInt(process.env.PORT || '8787', 10);
const HOST = process.env.HOST || '0.0.0.0';
const API_PATH = process.env.SUNO_DRAFT_API_PATH || '/api/suno-draft';
const PROVIDER_MODE = (process.env.SUNO_DRAFT_PROVIDER || 'mock').toLowerCase();

const PRESET_THEME_MAP = {
  'symphonic-dnb': 'storm',
  'emotional-glitch-pop': 'glass',
  'fantasy-ost': 'dawn',
  'battle-theme': 'flame',
  'ending-theme': 'afterglow',
  'dreamwave-anime': 'dream',
  'idol-rock': 'runway',
  'night-drive-city-pop': 'night',
  'celestial-ballad': 'starlight',
  'boss-rush': 'gate'
};

const THEME_LIBRARY = {
  storm: {
    krTitle: '폭우 끝의 맹세',
    krAltTitle: '빗속의 약속',
    enTitle: 'Stormbound Oath',
    enAltTitle: 'Promise in the Rain',
    image: '젖은 하늘',
    trace: '번진 불빛',
    vow: '끝내 지킬 이름',
    hookKr: '넘어져도 너를 향해 달려'
  },
  glass: {
    krTitle: '유리빛 새벽',
    krAltTitle: '흩어진 빛의 끝',
    enTitle: 'Glass Dawn',
    enAltTitle: 'Shards of Light',
    image: '얇은 새벽빛',
    trace: '깨질 듯한 숨',
    vow: '다시 모아 든 마음',
    hookKr: '흩어진 빛도 우리를 비춰'
  },
  dawn: {
    krTitle: '새벽의 숲길',
    krAltTitle: '빛을 건너는 노래',
    enTitle: 'Path of Dawn',
    enAltTitle: 'Crossing into Light',
    image: '고요한 숲길',
    trace: '엷게 번진 안개',
    vow: '멀리 남은 약속',
    hookKr: '먼 빛 끝까지 나는 가'
  },
  flame: {
    krTitle: '불꽃의 경계',
    krAltTitle: '타오르는 선',
    enTitle: 'Edge of Flame',
    enAltTitle: 'Burning Line',
    image: '붉은 하늘',
    trace: '들끓는 숨결',
    vow: '끝까지 놓지 않을 뜻',
    hookKr: '타는 밤을 넘어 내가 선다'
  },
  afterglow: {
    krTitle: '마지막 빛의 곁',
    krAltTitle: '남겨진 장면',
    enTitle: 'Beside the Last Light',
    enAltTitle: 'Left in the Last Scene',
    image: '늦은 저녁빛',
    trace: '가만한 발자국',
    vow: '조용히 남아 준 온기',
    hookKr: '끝난 줄 알았던 마음이 또 피어'
  },
  dream: {
    krTitle: '푸른 꿈의 잔광',
    krAltTitle: '잠들지 않는 파문',
    enTitle: 'Blue Dream Afterglow',
    enAltTitle: 'Waking Ripple',
    image: '푸른 잔광',
    trace: '느리게 번지는 파문',
    vow: '사라지지 않을 떨림',
    hookKr: '흔들려도 이 꿈을 안아'
  },
  runway: {
    krTitle: '심장 점화',
    krAltTitle: '빛나는 출발선',
    enTitle: 'Heart Ignition',
    enAltTitle: 'Shining Start Line',
    image: '눈부신 무대 끝',
    trace: '떨리는 첫 박자',
    vow: '멈추지 않을 선언',
    hookKr: '지금 이 순간 더 높이 올라'
  },
  night: {
    krTitle: '새벽 차선 위에서',
    krAltTitle: '도시의 잔불',
    enTitle: 'On the Midnight Lane',
    enAltTitle: 'City Afterglow',
    image: '비어 있는 차선',
    trace: '흐린 가로등',
    vow: '천천히 깨어난 마음',
    hookKr: '멀어진 밤도 우리를 못 멈춰'
  },
  starlight: {
    krTitle: '별 내린 숨결',
    krAltTitle: '은하의 조용한 말',
    enTitle: 'Starlit Breath',
    enAltTitle: 'Quiet Words of the Sky',
    image: '낮게 내린 별빛',
    trace: '가벼운 숨의 떨림',
    vow: '조용히 이어진 기도',
    hookKr: '아득한 빛도 내 안에 닿아'
  },
  gate: {
    krTitle: '최후의 문 앞에서',
    krAltTitle: '닫히지 않는 결의',
    enTitle: 'Before the Final Gate',
    enAltTitle: 'Unbroken Resolve',
    image: '거대한 문 앞',
    trace: '무겁게 고인 침묵',
    vow: '끝까지 밀어 올릴 의지',
    hookKr: '무너져도 다시 문을 연다'
  }
};

const DEFAULT_PROMPT_TEMPLATE = `너는 SunoFox 프로젝트를 위한 Suno 입력 3종을 생성한다.
반드시 JSON만 출력한다.
형식은 아래 그대로다.
{
  "title": "",
  "style": "",
  "lyrics": ""
}`;

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function normalizeRequest(body) {
  const input = body && typeof body === 'object' ? body.input || {} : {};
  const preset = body && typeof body === 'object' ? body.preset || {} : {};
  const bpmHint = Number.parseInt(input.bpmHint, 10);

  return {
    promptTemplate: normalizeText(body.promptTemplate) || DEFAULT_PROMPT_TEMPLATE,
    variation: !!body.variation,
    preset: {
      id: normalizeText(preset.id),
      name: normalizeText(preset.name),
      genres: Array.isArray(preset.genres) ? preset.genres.map(normalizeText).filter(Boolean).slice(0, 3) : [],
      bpm: Number.isFinite(Number(preset.bpm)) ? Number(preset.bpm) : 120,
      instruments: Array.isArray(preset.instruments) ? preset.instruments.map(normalizeText).filter(Boolean).slice(0, 5) : [],
      moodFocus: normalizeText(preset.moodFocus)
    },
    input: {
      genrePreset: normalizeText(input.genrePreset),
      languageMode: input.languageMode === 'KR_EN_MIX' ? 'KR_EN_MIX' : 'KR_ONLY',
      vocalGender: normalizeText(input.vocalGender || 'FEMALE') || 'FEMALE',
      bpmHint: Number.isFinite(bpmHint) ? Math.max(60, Math.min(220, bpmHint)) : (Number.isFinite(Number(preset.bpm)) ? Number(preset.bpm) : 120),
      themeHint: normalizeText(input.themeHint),
      intensity: ['CALM', 'EMOTIONAL', 'HYPE'].includes(input.intensity) ? input.intensity : 'EMOTIONAL'
    }
  };
}

function validateRequestShape(payload) {
  if (!payload.input.genrePreset && payload.preset.genres.length === 0) {
    return 'genrePreset or preset.genres is required';
  }
  if (payload.input.vocalGender !== 'FEMALE') {
    return 'Only FEMALE vocalGender is supported';
  }
  return null;
}

function inferThemeKey(payload) {
  const hint = payload.input.themeHint.toLowerCase();

  if (/(비|rain|storm|폭우|소나기)/.test(hint)) return 'storm';
  if (/(유리|glass|조각|빛조각)/.test(hint)) return 'glass';
  if (/(새벽|dawn|아침|해뜰)/.test(hint)) return 'dawn';
  if (/(불|fire|flame|화염|열기)/.test(hint)) return 'flame';
  if (/(엔딩|ending|여운|잔광|afterglow)/.test(hint)) return 'afterglow';
  if (/(꿈|dream|환상|파문)/.test(hint)) return 'dream';
  if (/(무대|stage|idol|출발선|run)/.test(hint)) return 'runway';
  if (/(밤|night|도시|drive|차선)/.test(hint)) return 'night';
  if (/(별|star|moon|우주|은하)/.test(hint)) return 'starlight';
  if (/(문|gate|boss|최후|결전)/.test(hint)) return 'gate';

  return PRESET_THEME_MAP[payload.preset.id] || 'dawn';
}

function buildThemeHintLine(themeHint, fallback, suffix) {
  if (!themeHint) return `${fallback}${suffix}`;
  return `${themeHint} ${suffix}`;
}

function getTheme(payload) {
  const key = inferThemeKey(payload);
  const theme = THEME_LIBRARY[key] || THEME_LIBRARY.dawn;
  return {
    key,
    krTitle: payload.variation ? theme.krAltTitle : theme.krTitle,
    enTitle: payload.variation ? theme.enAltTitle : theme.enTitle,
    image: theme.image,
    trace: theme.trace,
    vow: theme.vow,
    hookKr: theme.hookKr
  };
}

function buildStyle(payload, theme) {
  const genres = (payload.preset.genres.length ? payload.preset.genres : [payload.input.genrePreset]).slice(0, 3).join(', ');
  const instruments = payload.preset.instruments.length ? payload.preset.instruments.join(', ') : 'piano, strings, drums';
  const vocalTone = {
    CALM: 'female vocal + clear soft tone',
    EMOTIONAL: 'female vocal + clear emotional tone',
    HYPE: 'female vocal + bright urgent tone'
  }[payload.input.intensity];
  const energy = {
    CALM: `restrained verses, tender rise, luminous chorus, lingering ${theme.key} afterglow`,
    EMOTIONAL: `restrained verses, swelling ache, explosive chorus, lingering ${theme.key} afterglow`,
    HYPE: `restrained verses, fast lift, explosive chorus, lingering ${theme.key} afterglow`
  }[payload.input.intensity];

  return `${genres} | ${payload.input.bpmHint} BPM | ${instruments} | ${vocalTone} | ${energy}`;
}

function buildKrLyrics(theme, payload) {
  const intro = [
    buildThemeHintLine(payload.input.themeHint, theme.image, '아래 숨을 모아'),
    `${theme.trace} 끝에 아직 이름을 안아`
  ];
  const chorus = payload.input.intensity === 'HYPE'
    ? [
        `${theme.hookKr}`,
        '거센 밤 끝에서도 나는 더 크게 빛나',
        '멈춘 듯한 세상을 밀어 올려',
        '우리의 내일은 지금 여기서 시작돼'
      ]
    : [
        `${theme.hookKr}`,
        '흔들린 밤 끝에서도 나는 너를 비춰',
        '울어도 좋아 다시 피어날 테니',
        '우리의 내일은 지금 여기서 시작돼'
      ];

  return [
    '[Intro]',
    ...intro,
    '',
    '[Verse]',
    '늦은 바람이 어깨를 스쳐도',
    '나는 오늘의 떨림을 숨기지 않아',
    buildThemeHintLine(payload.input.themeHint, theme.trace, '곁에서 떨린 마음도'),
    '조용한 발끝으로 다시 너를 향해 가',
    '',
    '[Pre-Chorus]',
    '접어 둔 두려움이 한순간 깨어나',
    '가슴 안 작은 불빛이 위로 치솟아',
    `${theme.vow} 점점 더 선명해져`,
    '',
    '[Chorus]',
    ...chorus,
    '',
    '[Verse]',
    '멀어진 시간은 뒤로 흘러가도',
    '내 안의 목소리는 더욱 또렷해져',
    '작게 접어 둔 바람 하나까지',
    '이번엔 놓치지 않고 두 손에 쥘 거야',
    '',
    '[Pre-Chorus]',
    '조용히 닫힌 문들도 끝내 열리고',
    '멈춘 줄 알았던 심장이 다시 뛰어',
    `${theme.vow} 이제는 피하지 않아`,
    '',
    '[Chorus]',
    ...chorus,
    '',
    '[Bridge]',
    '가장 깊은 숨 끝에서 너를 부르면',
    '멈춰 있던 장면들도 빛으로 열려',
    '끝까지 남을 이름을 내 안에 새겨',
    '',
    '[Chorus]',
    ...chorus,
    '',
    '[Outro]',
    '사라진 뒤에도 온기는 남아',
    '조용한 여운처럼 오래 번져 가'
  ].join('\n');
}

function buildMixedLyrics(theme, payload) {
  const chorus = payload.input.intensity === 'HYPE'
    ? [
        `${theme.hookKr}, never let it fall`,
        '거센 밤 끝에서도 we are still alive',
        '밀어 올려 지금 이 장면 위로',
        'Stay with me, our story starts tonight'
      ]
    : [
        `${theme.hookKr}, never let it fade`,
        '흔들린 밤 끝에서도 we are still alive',
        '울어도 돼 여기서 다시 피어나',
        'Stay with me, our story starts tonight'
      ];

  return [
    '[Intro]',
    buildThemeHintLine(payload.input.themeHint, theme.image, '아래 숨을 모아'),
    'I keep your light with me',
    '',
    '[Verse]',
    '늦은 바람이 스쳐도 나는 멈추지 않아',
    `${theme.trace} 끝에서 더 선명해진 너를 봐`,
    '작게 흔들리던 마음까지 안고서',
    'I take one more step tonight',
    '',
    '[Pre-Chorus]',
    '조용히 닫아 둔 문이 한순간 열려',
    `${theme.vow} 더 가까워져`,
    'Hold on, I can hear it now',
    '',
    '[Chorus]',
    ...chorus,
    '',
    '[Verse]',
    '멀어진 시간도 이제는 두렵지 않아',
    '작게 남은 떨림까지 품에 안아',
    '무너진 장면 위에 숨을 맞추고',
    'I can see the way we go',
    '',
    '[Pre-Chorus]',
    '멈춘 줄 알았던 계절이 다시 돌아와',
    `${theme.vow} 더 크게 번져`,
    'This is where I call your name',
    '',
    '[Chorus]',
    ...chorus,
    '',
    '[Bridge]',
    '가장 깊은 숨 끝에서 너를 부르면',
    'Break the silence, light the road',
    '끝까지 남을 진심만 안고 가',
    '',
    '[Chorus]',
    ...chorus,
    '',
    '[Outro]',
    '사라진 뒤에도 온기는 남아',
    'Softly, your light stays with me'
  ].join('\n');
}

function buildMockDraft(payload) {
  const theme = getTheme(payload);
  return {
    title: `🦊 ${theme.krTitle} — ${theme.enTitle}`,
    style: buildStyle(payload, theme),
    lyrics: payload.input.languageMode === 'KR_EN_MIX'
      ? buildMixedLyrics(theme, payload)
      : buildKrLyrics(theme, payload)
  };
}

function validateDraftShape(payload) {
  return payload &&
    typeof payload.title === 'string' &&
    typeof payload.style === 'string' &&
    typeof payload.lyrics === 'string';
}

async function generateWithOpenAICompatible(payload) {
  const baseUrl = normalizeText(process.env.OPENAI_COMPAT_BASE_URL);
  const apiKey = normalizeText(process.env.OPENAI_API_KEY);
  const model = normalizeText(process.env.OPENAI_MODEL);

  if (!baseUrl || !apiKey || !model) {
    throw new Error('OPENAI_COMPAT_BASE_URL, OPENAI_API_KEY, OPENAI_MODEL are required for openai_compatible mode');
  }

  const prompt = [
    payload.promptTemplate || DEFAULT_PROMPT_TEMPLATE,
    '',
    'Input JSON:',
    JSON.stringify(payload.input, null, 2),
    '',
    'Preset JSON:',
    JSON.stringify(payload.preset, null, 2),
    '',
    `variation: ${payload.variation ? 'true' : 'false'}`
  ].join('\n');

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.9,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Return only JSON with title, style, lyrics.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Provider HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data && data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : '';

  const parsed = typeof content === 'string' ? JSON.parse(content) : content;
  if (!validateDraftShape(parsed)) {
    throw new Error('Provider returned an invalid draft shape');
  }

  return parsed;
}

async function generateDraft(payload) {
  if (PROVIDER_MODE === 'openai_compatible') {
    return generateWithOpenAICompatible(payload);
  }
  return buildMockDraft(payload);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS' && url.pathname === API_PATH) {
    json(res, 204, {});
    return;
  }

  if (req.method === 'GET' && url.pathname === '/healthz') {
    json(res, 200, {
      ok: true,
      provider: PROVIDER_MODE,
      path: API_PATH
    });
    return;
  }

  if (req.method !== 'POST' || url.pathname !== API_PATH) {
    json(res, 404, { error: 'Not found' });
    return;
  }

  try {
    const body = await parseBody(req);
    const payload = normalizeRequest(body);
    const validationError = validateRequestShape(payload);
    if (validationError) {
      json(res, 400, { error: validationError });
      return;
    }

    const draft = await generateDraft(payload);
    if (!validateDraftShape(draft)) {
      throw new Error('Generated draft shape is invalid');
    }

    json(res, 200, draft);
  } catch (error) {
    json(res, 500, {
      error: error.message || 'Unknown error'
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Suno draft server listening on http://${HOST}:${PORT}${API_PATH}`);
  console.log(`Provider mode: ${PROVIDER_MODE}`);
});
