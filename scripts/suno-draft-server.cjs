#!/usr/bin/env node
const http = require('http');
const { URL } = require('url');

const PORT = Number.parseInt(process.env.PORT || '8787', 10);
const HOST = process.env.HOST || '0.0.0.0';
const API_PATH = process.env.SUNO_DRAFT_API_PATH || '/api/suno-draft';
const PROVIDER_MODE = (process.env.SUNO_DRAFT_PROVIDER || 'mock').toLowerCase();

const DEFAULT_PROMPT_TEMPLATE = `You are generating music inputs specifically for Suno AI.
Return ONLY JSON.
{
  "title": "",
  "style": "",
  "lyrics": ""
}`;

const THEME_ID_BY_LABEL = {
  'Adventure Start': 'adventure_start',
  'Night Journey': 'night_journey',
  'Reunion Promise': 'reunion_promise',
  'Lost Memory': 'time_loop',
  'Final Battle': 'final_battle',
  'Victory Scene': 'victory_scene',
  'Training Montage': 'adventure_start',
  'School Youth': 'summer_festival',
  'Summer Festival': 'summer_festival',
  'Ocean Voyage': 'ocean_voyage',
  'Sci-Fi Exploration': 'time_loop',
  'Time Loop Story': 'time_loop'
};

const THEME_LIBRARY = {
  adventure_start: {
    label: 'Adventure Start',
    krTitle: '새벽의 출발선',
    enTitle: 'First Light Departure',
    imageA: '낯선 길목',
    imageB: '가벼운 바람',
    promise: '멀리 열린 길',
    hookKr: '두려움 너머로 먼저 달려가',
    hookEn: 'Run into the light'
  },
  reunion_promise: {
    label: 'Reunion Promise',
    krTitle: '다시 만나는 약속',
    enTitle: 'Promise to Meet Again',
    imageA: '젖은 골목 끝',
    imageB: '늦게 번진 불빛',
    promise: '놓지 않던 이름',
    hookKr: '멀어졌던 손끝 다시 닿아 와',
    hookEn: 'Stay with me tonight'
  },
  night_journey: {
    label: 'Night Journey',
    krTitle: '밤을 건너는 숨',
    enTitle: 'Breath Across the Night',
    imageA: '긴 그림자',
    imageB: '희미한 차선',
    promise: '아직 꺼지지 않은 방향',
    hookKr: '깊은 어둠 너머 별이 열려 와',
    hookEn: 'Follow the fading blue'
  },
  final_battle: {
    label: 'Final Battle',
    krTitle: '마지막 불꽃 앞에서',
    enTitle: 'Before the Last Flame',
    imageA: '갈라진 대지',
    imageB: '붉은 하늘',
    promise: '끝내 지킬 뜻',
    hookKr: '무너진 밤 위로 내가 다시 선다',
    hookEn: 'Stand through the fire'
  },
  victory_scene: {
    label: 'Victory Scene',
    krTitle: '빛으로 남는 순간',
    enTitle: 'The Moment We Remain',
    imageA: '들뜬 숨결',
    imageB: '쏟아진 햇빛',
    promise: '끝까지 붙든 꿈',
    hookKr: '멈춘 줄 알았던 하늘이 열려 와',
    hookEn: 'We made it alive'
  },
  summer_festival: {
    label: 'Summer Festival',
    krTitle: '불꽃 아래 여름',
    enTitle: 'Summer Under Fireworks',
    imageA: '붉은 등불',
    imageB: '흔들린 유카타 끝',
    promise: '짧고 선명한 계절',
    hookKr: '스쳐 간 한순간 오래 남아 있어',
    hookEn: 'Hold the summer night'
  },
  ocean_voyage: {
    label: 'Ocean Voyage',
    krTitle: '푸른 항로의 끝',
    enTitle: 'Beyond the Blue Route',
    imageA: '젖은 갑판',
    imageB: '먼 수평선',
    promise: '끝없이 열린 바다',
    hookKr: '부서진 파도 너머 내일이 밀려와',
    hookEn: 'Sail into the sky'
  },
  time_loop: {
    label: 'Time Loop',
    krTitle: '되돌아오는 새벽',
    enTitle: 'Dawn That Comes Again',
    imageA: '멈춘 시계',
    imageB: '낯익은 창문',
    promise: '같은 하루 속 다른 선택',
    hookKr: '반복된 시간 너머 결국 널 만나',
    hookEn: 'Break the same sunrise'
  }
};

const ENERGY_ID_BY_LABEL = {
  Calm: 'calm',
  Emotional: 'emotional',
  Epic: 'epic',
  Bright: 'bright',
  Dark: 'dark'
};

const ENERGY_LABEL_BY_ID = {
  calm: 'Calm',
  emotional: 'Emotional',
  epic: 'Epic',
  bright: 'Bright',
  dark: 'Dark'
};

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

function normalizeThemeId(value) {
  const cleanValue = normalizeText(value);
  return THEME_LIBRARY[cleanValue] ? cleanValue : (THEME_ID_BY_LABEL[cleanValue] || 'reunion_promise');
}

function normalizeEnergyId(value) {
  const cleanValue = normalizeText(value);
  return ENERGY_LABEL_BY_ID[cleanValue] ? cleanValue : (ENERGY_ID_BY_LABEL[cleanValue] || 'emotional');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) reject(new Error('Payload too large'));
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
  return {
    promptTemplate: normalizeText(body.promptTemplate) || DEFAULT_PROMPT_TEMPLATE,
    variation: !!body.variation,
    preset: {
      id: normalizeText(preset.id),
      name: normalizeText(preset.name),
      genres: Array.isArray(preset.genres) ? preset.genres.map(normalizeText).filter(Boolean).slice(0, 3) : [],
      bpm: Number.isFinite(Number(preset.bpm)) ? Number(preset.bpm) : 170,
      instruments: Array.isArray(preset.instruments) ? preset.instruments.map(normalizeText).filter(Boolean).slice(0, 5) : []
    },
    input: {
      genrePreset: normalizeText(input.genrePreset) || normalizeText(preset.name),
      themePreset: normalizeThemeId(input.themePreset),
      languageMode: input.languageMode === 'KR_EN_MIX' ? 'KR_EN_MIX' : 'KR_ONLY',
      energyMode: normalizeEnergyId(input.energyMode),
      youtubeMode: input.youtubeMode !== false
    }
  };
}

function validateRequestShape(payload) {
  if (!payload.input.genrePreset && payload.preset.genres.length === 0) {
    return 'genrePreset or preset name is required';
  }
  return null;
}

function buildStyle(payload, theme) {
  const genres = (payload.preset.genres.length ? payload.preset.genres : [payload.input.genrePreset]).slice(0, 3).join(', ');
  const instruments = payload.preset.instruments.length ? payload.preset.instruments.join(', ') : 'piano, strings, breakbeat drums, sub bass';
  const vocalTone = {
    calm: 'female vocal soft airy sincere',
    emotional: 'female vocal airy emotional sincere',
    epic: 'female vocal bright powerful sincere',
    bright: 'female vocal light clear hopeful',
    dark: 'female vocal soft tense shadowed'
  }[payload.input.energyMode];
  const direction = payload.input.youtubeMode
    ? {
        calm: 'immediate melody, gentle rise, bridge contrast, final chorus bloom',
        emotional: 'early hook, cinematic build, bridge contrast, final chorus peak',
        epic: 'immediate hook, strong build, dramatic bridge, final chorus explosion',
        bright: 'instant vocal lift, opening energy, contrast bridge, final chorus shine',
        dark: 'immediate tension, dark build, sharp bridge contrast, final chorus surge'
      }[payload.input.energyMode]
    : {
        calm: 'cinematic build, intimate verses, final chorus bloom',
        emotional: 'cinematic build, anime opening energy, final chorus peak',
        epic: 'heroic build, anime climax energy, final chorus explosion',
        bright: 'hopeful build, opening theme energy, final chorus shine',
        dark: 'tense build, story-driven intensity, final chorus release'
      }[payload.input.energyMode];

  return `${genres} | ${payload.preset.bpm} BPM | ${instruments} | ${vocalTone} | ${direction}`;
}

function introLines(theme, payload) {
  if (payload.input.languageMode === 'KR_ONLY') {
    return payload.input.youtubeMode
      ? [`${theme.imageA} 끝에 네가 먼저 스며와`, `${theme.imageB} 사이로 숨이 다시 깨어나`]
      : [`${theme.imageA} 위에 조용히 손을 얹고`, `${theme.imageB} 사이로 잊힌 숨을 모아`];
  }
  return payload.input.youtubeMode
    ? [`${theme.imageA} 끝에 네가 먼저 스며와`, 'You pull me into the light']
    : [`${theme.imageA} 위에 조용히 손을 얹고`, 'I can hear your distant breath'];
}

function chorusLines(theme, payload) {
  if (payload.input.languageMode === 'KR_ONLY') {
    return {
      calm: [`${theme.hookKr}`, '늦은 하늘 아래 마음이 천천히 열려', '멀어진 계절 끝에 다시 웃을 수 있어', '지금의 떨림도 결국 빛이 돼'],
      emotional: [`${theme.hookKr}`, '흩어진 장면 끝에 네가 선명해져', '떨리던 하루 끝에 다시 숨을 쉬어', '지금의 눈물도 결국 빛이 돼'],
      epic: [`${theme.hookKr}`, '무너진 세계 끝에 내가 더 크게 외쳐', '붙잡은 약속 하나 끝까지 밀어 올려', '지금의 심장으로 내일을 깨워 내'],
      bright: [`${theme.hookKr}`, '반짝인 하늘 아래 웃음이 먼저 번져', '쏟아진 햇빛처럼 하루가 가벼워져', '지금의 설렘으로 문을 열어 가'],
      dark: [`${theme.hookKr}`, '낮게 젖은 그림자마저 뒤로 흘러가', '닫혀 있던 마음도 끝내 금을 내고', '지금의 침묵도 결국 깨어나']
    }[payload.input.energyMode];
  }
  return {
    calm: [`${theme.hookKr}`, `${theme.hookEn}`, '늦은 하늘 아래 slowly we begin again', '지금의 떨림도 turns into light'],
    emotional: [`${theme.hookKr}`, `${theme.hookEn}`, '흩어진 장면 끝에 we are not too late', '지금의 눈물도 turns into light'],
    epic: [`${theme.hookKr}`, `${theme.hookEn}`, '무너진 세계 끝에 we rise again tonight', '붙잡은 약속으로 break the darkest line'],
    bright: [`${theme.hookKr}`, `${theme.hookEn}`, '반짝인 하늘 아래 we can run so high', '지금의 설렘으로 open up the sky'],
    dark: [`${theme.hookKr}`, `${theme.hookEn}`, '낮게 젖은 그림자 through the closing night', '지금의 침묵도 burns into light']
  }[payload.input.energyMode];
}

function buildLyrics(theme, payload) {
  const chorus = chorusLines(theme, payload);
  const finalChorus = [...chorus];

  if (payload.input.languageMode === 'KR_ONLY') {
    if (payload.input.energyMode === 'epic') finalChorus[1] = '갈라진 운명 끝에 내가 가장 크게 선다';
    if (payload.input.energyMode === 'bright') finalChorus[1] = '쏟아진 빛 한가운데 우리가 더 높이 선다';
  } else {
    if (payload.input.energyMode === 'epic') finalChorus[2] = '무너진 경계 너머 we rise again tonight';
    if (payload.input.energyMode === 'bright') finalChorus[2] = '눈부신 장면 위로 we can run so high';
  }

  const verse4 = payload.input.languageMode === 'KR_ONLY' ? '흔들린 발끝도 조금씩 단단해져' : 'I can see the road ahead';
  const pre3 = payload.input.languageMode === 'KR_ONLY' ? `${theme.promise} 이제는 놓치지 않아` : 'I will not let it go';
  const bridge2 = payload.input.languageMode === 'KR_ONLY' ? `${theme.imageB} 사이로 다른 문이 열려` : 'Everything turns and breaks apart';
  const outro2 = payload.input.languageMode === 'KR_ONLY' ? '늦은 여운처럼 오래 번져 가' : 'Your afterglow stays with me';

  return [
    '[Intro]',
    ...introLines(theme, payload),
    '',
    '[Verse]',
    `${theme.promise} 하나 가슴 안에 접어 두고`,
    `${theme.imageB} 뒤로 흐른 시간들을 넘어가`,
    '멀어진 거리마다 네 흔적이 남아서',
    payload.input.languageMode === 'KR_ONLY' ? '나는 오늘의 끝을 다시 고쳐 써' : 'I rewrite the end again',
    '',
    '[Pre-Chorus]',
    '멈춘 줄 알았던 계절이 눈앞에 번져',
    '가만한 두 손 위로 새로운 숨이 올라',
    pre3,
    '',
    '[Chorus]',
    ...chorus,
    '',
    '[Verse]',
    '작게 금이 간 하루도 결국 나를 밀어',
    `${theme.imageA} 너머로 더 멀리 시선을 던져`,
    '서툰 망설임까지 모두 안고 나면',
    verse4,
    '',
    '[Chorus]',
    ...chorus,
    '',
    '[Bridge]',
    payload.input.youtubeMode ? '모든 불빛이 꺼진 듯한 그 순간에도' : '아무 말 없는 하늘 아래 서 있어도',
    bridge2,
    '끝까지 남을 이름을 다시 불러',
    '',
    '[Chorus]',
    ...finalChorus,
    '',
    '[Outro]',
    '사라진 뒤에도 온기는 남아',
    outro2
  ].join('\n');
}

function buildMockDraft(payload) {
  const theme = THEME_LIBRARY[normalizeThemeId(payload.input.themePreset)] || THEME_LIBRARY.reunion_promise;
  return {
    title: payload.variation
      ? `🦊 ${theme.krTitle}의 끝 — ${theme.enTitle} Finale`
      : `🦊 ${theme.krTitle} — ${theme.enTitle}`,
    style: buildStyle(payload, theme),
    lyrics: buildLyrics(theme, payload)
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
        { role: 'system', content: 'Return only JSON with title, style, lyrics.' },
        { role: 'user', content: prompt }
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
    json(res, 200, { ok: true, provider: PROVIDER_MODE, path: API_PATH });
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
    json(res, 500, { error: error.message || 'Unknown error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Suno draft server listening on http://${HOST}:${PORT}${API_PATH}`);
  console.log(`Provider mode: ${PROVIDER_MODE}`);
});
