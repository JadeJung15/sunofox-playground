const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function getDateKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

function hashString(input) {
  let hash = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return hash >>> 0;
  };
}

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rand, items) {
  return items[Math.floor(rand() * items.length)];
}

function buildProbabilityResult(title, rand) {
  const value = Math.floor(rand() * 101);
  const band = value < 34 ? '낮음' : value < 68 ? '보통' : '높음';
  const comments = {
    낮음: ['오늘은 생각보다 멀쩡합니다.', '의외로 큰 사고는 안 낼 분위기예요.', '지금은 그냥 조용히 지나갈 확률이 큽니다.'],
    보통: ['반쯤은 괜찮고 반쯤은 위험합니다.', '입 열기 전에 한 번만 더 생각하세요.', '조심하면 무난하게 넘어갈 수 있어요.'],
    높음: ['오늘은 살짝 위험 신호입니다.', '지금 텐션이면 한 번쯤 터질 수 있어요.', '괜히 나서면 피곤해질 확률이 높습니다.']
  };

  return {
    template: 'probability',
    headline: `${value}%`,
    subline: band,
    comment: pick(rand, comments[band]),
    shareText: `${title} 결과 ${value}% · ${band} · ${pick(rand, comments[band])}`,
    accent: value < 34 ? '#10b981' : value < 68 ? '#f59e0b' : '#ef4444'
  };
}

function buildIndexResult(title, rand) {
  const useTenScale = rand() > 0.5;
  const max = useTenScale ? 10 : 100;
  const raw = useTenScale ? Math.max(1, Math.ceil(rand() * 10)) : Math.floor(rand() * 101);
  const ratio = raw / max;
  const tier = ratio < 0.26 ? 'EASY' : ratio < 0.51 ? 'NORMAL' : ratio < 0.76 ? 'HARD' : 'EXTREME';
  const comments = {
    EASY: ['아직은 버틸 만합니다.', '지금은 꽤 사람처럼 굴 수 있어요.', '오늘은 생각보다 평화로운 편입니다.'],
    NORMAL: ['그럭저럭 굴러가는 상태예요.', '지금부터 슬슬 피곤함이 올라옵니다.', '무난하지만 오래 버티진 못합니다.'],
    HARD: ['지금부터는 의지력이 필요합니다.', '슬슬 표정 관리가 어려워질 수 있어요.', '적당히 도망칠 구실을 찾는 게 좋습니다.'],
    EXTREME: ['오늘은 거의 한계치입니다.', '지금은 건드리면 폭주할 수 있어요.', '잠깐 숨는 게 최선일 수 있습니다.']
  };

  return {
    template: 'index',
    headline: useTenScale ? `${raw}/${max}` : `${raw}`,
    subline: tier,
    comment: pick(rand, comments[tier]),
    shareText: `${title} 결과 ${useTenScale ? `${raw}/${max}` : `${raw}점`} · ${tier} · ${pick(rand, comments[tier])}`,
    accent: ratio < 0.26 ? '#22c55e' : ratio < 0.51 ? '#3b82f6' : ratio < 0.76 ? '#f97316' : '#7c3aed'
  };
}

function buildGradeResult(title, rand) {
  const grades = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D'];
  const index = Math.min(grades.length - 1, Math.floor(rand() * grades.length));
  const grade = grades[index];
  const comments = {
    S: ['오늘은 주인공 모드입니다.', '이 정도면 꽤 잘 굴러갑니다.', '지금 상태, 생각보다 괜찮아요.'],
    'A+': ['오늘은 꽤 안정적입니다.', '사람들 사이에서도 무난히 통할 타입이에요.', '지금은 제법 호감형에 가깝습니다.'],
    A: ['전체적으로 나쁘지 않습니다.', '적당히 사람답게 버티는 중입니다.', '오늘은 평균 이상입니다.'],
    'B+': ['괜찮다가도 한 번씩 흔들립니다.', '방심하면 살짝 삐끗할 수 있어요.', '오늘은 무난과 피곤 사이입니다.'],
    B: ['평균은 치는데 여유는 없습니다.', '지금은 간신히 굴러가는 중이에요.', '딱 오늘만 버티자는 느낌입니다.'],
    'C+': ['살짝 예민해 보일 수 있습니다.', '오늘은 대충 넘어가는 게 답입니다.', '조용히 있는 편이 안전합니다.'],
    C: ['지금은 컨디션이 썩 좋지 않습니다.', '괜히 나서면 피곤해질 수 있어요.', '오늘은 혼자 있는 쪽이 낫습니다.'],
    D: ['오늘은 그냥 쉬는 게 맞습니다.', '지금은 거의 시스템 점검 상태예요.', '세상과 잠깐 거리 두는 편이 좋겠습니다.']
  };

  return {
    template: 'grade',
    headline: grade,
    subline: ['S', 'A+', 'A'].includes(grade) ? '오늘은 상위권' : ['B+', 'B'].includes(grade) ? '그럭저럭 버팀' : '조용히 숨기',
    comment: pick(rand, comments[grade]),
    shareText: `${title} 결과 ${grade} · ${pick(rand, comments[grade])}`,
    accent: ['S', 'A+', 'A'].includes(grade) ? '#0ea5e9' : ['B+', 'B'].includes(grade) ? '#f59e0b' : '#64748b'
  };
}

function buildResultPayload(title, type, seedKey) {
  const next = hashString(seedKey);
  const rand = mulberry32(next());

  if (type === 'probability') return buildProbabilityResult(title, rand);
  if (type === 'index') return buildIndexResult(title, rand);
  return buildGradeResult(title, rand);
}

exports.dailyResult = onRequest({ cors: true, region: 'asia-northeast3' }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: '로그인이 필요합니다.' });
      return;
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const slug = String(req.body?.slug || '').trim();

    if (!slug) {
      res.status(400).json({ error: 'slug가 필요합니다.' });
      return;
    }

    const testRef = db.collection('tests').doc(slug);
    const testSnap = await testRef.get();
    if (!testSnap.exists) {
      res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
      return;
    }

    const test = testSnap.data();
    if (!test.isActive || test.category !== 'daily') {
      res.status(404).json({ error: '비활성 테스트입니다.' });
      return;
    }

    const dateKey = getDateKey();
    const resultId = `${uid}__${dateKey}__${slug}`;
    const resultRef = db.collection('results').doc(resultId);
    const existing = await resultRef.get();

    if (existing.exists) {
      res.json({
        slug,
        title: test.title,
        dateKey,
        resultPayload: existing.data().resultPayload,
        cached: true
      });
      return;
    }

    const resultPayload = buildResultPayload(test.title, test.type, `${uid}:${dateKey}:${slug}`);
    await resultRef.set({
      uid,
      slug,
      dateKey,
      resultPayload,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection('stats').doc(slug).set({
      slug,
      runs: admin.firestore.FieldValue.increment(1),
      likes: admin.firestore.FieldValue.increment(0)
    }, { merge: true });

    res.json({
      slug,
      title: test.title,
      dateKey,
      resultPayload,
      cached: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '결과를 만드는 중 오류가 발생했습니다.' });
  }
});
