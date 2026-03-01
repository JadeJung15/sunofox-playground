import { auth, db } from '../firebase-init.js?v=8.5.4';
import { ensureAnonymousUser } from '../auth.js?v=8.5.4';
import { collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const DAILY_TITLES = [
  '오늘 회사 때려칠 확률 테스트',
  '오늘 인간관계 망할 확률 테스트',
  '오늘 멘탈 남은 배터리 테스트',
  '지금 당장 집 가고 싶은 지수',
  '오늘 사회생활 가능 여부 테스트',
  '오늘 나 정상인인가 테스트',
  '오늘 나 왜 살아있지 테스트',
  '오늘 내가 주인공인지 엑스트라인지 테스트',
  '오늘 하루 버티기 난이도',
  '오늘 나 호감형인지 빌런인지',
  '지금 상태로 보는 직장인 등급',
  '오늘 나 사람 만나도 되는 상태인지 테스트',
  '오늘 대화하면 사고칠 확률',
  '오늘 나 T인지 F인지 다시 검사',
  '오늘 나 예민도 측정기',
  '지금 기분 기준 인간 유형 테스트',
  '오늘 나 게으름 레벨 측정',
  '오늘 인간관계 체력 테스트',
  '오늘 집돌이 / 집순이 확률',
  '오늘 사회성 고장 여부 테스트',
  '지금 당장 연락 오면 짜증나는 사람 테스트',
  '오늘 나 혼자 있고 싶은 정도',
  '오늘 세상 귀찮음 수치',
  '오늘 현실 도피 지수',
  '오늘 감정 롤러코스터 테스트',
  '오늘 운빨 인간 테스트',
  '오늘 인생 난이도 설정값',
  '오늘 NPC인지 플레이어인지',
  '오늘 인생 버그 발생률',
  '오늘 나 왜 이러는지 테스트'
];

function inferType(title) {
  if (title.includes('확률')) return 'probability';
  if (
    title.includes('지수') ||
    title.includes('배터리') ||
    title.includes('난이도') ||
    title.includes('레벨') ||
    title.includes('측정기') ||
    title.includes('정도') ||
    title.includes('수치') ||
    title.includes('설정값') ||
    title.includes('체력')
  ) return 'index';
  return 'grade';
}

function slugifyTitle(title, usedSlugs) {
  const base = title
    .normalize('NFKC')
    .trim()
    .replace(/테스트/g, '')
    .replace(/[^\p{L}\p{N}\s/-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'daily-test';

  let slug = base;
  let seq = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${seq}`;
    seq += 1;
  }
  usedSlugs.add(slug);
  return slug;
}

const FALLBACK_DAILY_TESTS = (() => {
  const usedSlugs = new Set();
  return DAILY_TITLES.map((title, index) => ({
    slug: slugifyTitle(title, usedSlugs),
    title,
    category: 'daily',
    type: inferType(title),
    isActive: true,
    createdAt: { seconds: index + 1 }
  }));
})();

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
  const comment = pick(rand, comments[band]);

  return {
    template: 'probability',
    headline: `${value}%`,
    subline: band,
    comment,
    shareText: `${title} 결과 ${value}% · ${band} · ${comment}`,
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
  const comment = pick(rand, comments[tier]);

  return {
    template: 'index',
    headline: useTenScale ? `${raw}/${max}` : `${raw}`,
    subline: tier,
    comment,
    shareText: `${title} 결과 ${useTenScale ? `${raw}/${max}` : `${raw}점`} · ${tier} · ${comment}`,
    accent: ratio < 0.26 ? '#22c55e' : ratio < 0.51 ? '#3b82f6' : ratio < 0.76 ? '#f97316' : '#7c3aed'
  };
}

function buildGradeResult(title, rand) {
  const grades = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D'];
  const grade = grades[Math.min(grades.length - 1, Math.floor(rand() * grades.length))];
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
  const comment = pick(rand, comments[grade]);

  return {
    template: 'grade',
    headline: grade,
    subline: ['S', 'A+', 'A'].includes(grade) ? '오늘은 상위권' : ['B+', 'B'].includes(grade) ? '그럭저럭 버팀' : '조용히 숨기',
    comment,
    shareText: `${title} 결과 ${grade} · ${comment}`,
    accent: ['S', 'A+', 'A'].includes(grade) ? '#0ea5e9' : ['B+', 'B'].includes(grade) ? '#f59e0b' : '#64748b'
  };
}

function buildLocalResultPayload(test, uid, dateKey) {
  const next = hashString(`${uid}:${dateKey}:${test.slug}`);
  const rand = mulberry32(next());
  if (test.type === 'probability') return buildProbabilityResult(test.title, rand);
  if (test.type === 'index') return buildIndexResult(test.title, rand);
  return buildGradeResult(test.title, rand);
}

function getLocalResultCacheKey(uid, slug, dateKey) {
  return `daily_result:${uid}:${slug}:${dateKey}`;
}

function readLocalResult(uid, slug, dateKey) {
  try {
    const raw = localStorage.getItem(getLocalResultCacheKey(uid, slug, dateKey));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeLocalResult(uid, slug, dateKey, payload) {
  try {
    localStorage.setItem(getLocalResultCacheKey(uid, slug, dateKey), JSON.stringify(payload));
  } catch (error) {
    console.warn('Daily local result cache failed:', error?.message || error);
  }
}

function sortDailyTests(a, b) {
  const aTime = a.createdAt?.seconds || 0;
  const bTime = b.createdAt?.seconds || 0;
  return aTime - bTime;
}

export async function fetchDailyTests() {
  try {
    const snap = await getDocs(collection(db, 'tests'));
    const items = snap.docs
      .map((item) => item.data())
      .filter((item) => item.category === 'daily' && item.isActive)
      .sort(sortDailyTests);

    return items.length > 0 ? items : FALLBACK_DAILY_TESTS;
  } catch (error) {
    console.warn('Daily tests fallback activated:', error?.message || error);
    return FALLBACK_DAILY_TESTS;
  }
}

export async function fetchDailyTest(slug) {
  try {
    const snap = await getDoc(doc(db, 'tests', slug));
    if (snap.exists()) return snap.data();
  } catch (error) {
    console.warn('Daily test detail fallback activated:', error?.message || error);
  }
  return FALLBACK_DAILY_TESTS.find((item) => item.slug === slug) || null;
}

export async function requestDailyResult(slug) {
  await ensureAnonymousUser();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('로그인 정보를 확인할 수 없습니다.');
  }

  const dateKey = getDateKey();
  const test = await fetchDailyTest(slug);
  if (!test) {
    throw new Error('테스트를 찾을 수 없습니다.');
  }

  const cached = readLocalResult(user.uid, slug, dateKey);
  if (cached) {
    return {
      slug,
      title: test.title,
      dateKey,
      resultPayload: cached,
      cached: true,
      source: 'local'
    };
  }

  try {
    const token = await user.getIdToken();
    const apiBaseUrl = window.__SEVENCHECK_CONFIG__?.apiBaseUrl || '';
    const dailyResultUrl = apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, '')}/dailyResult` : '/api/daily-result';
    const response = await fetch(dailyResultUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ slug })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || '결과를 불러오지 못했습니다.');
    }
    if (payload?.resultPayload) {
      writeLocalResult(user.uid, slug, dateKey, payload.resultPayload);
    }
    return payload;
  } catch (error) {
    console.warn('Daily result API fallback activated:', error?.message || error);
    const resultPayload = buildLocalResultPayload(test, user.uid, dateKey);
    writeLocalResult(user.uid, slug, dateKey, resultPayload);
    return {
      slug,
      title: test.title,
      dateKey,
      resultPayload,
      cached: false,
      source: 'local'
    };
  }
}

export function getDailyPath(slug = '') {
  return slug ? `/daily/${encodeURIComponent(slug)}` : '/daily/';
}
