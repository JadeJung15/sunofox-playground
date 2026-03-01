import { auth, db } from '../firebase-init.js?v=8.5.0';
import { ensureAnonymousUser } from '../auth.js?v=8.5.0';
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

  const token = await user.getIdToken();
  const response = await fetch('/api/daily-result', {
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
  return payload;
}

export function getDailyPath(slug = '') {
  return slug ? `/daily/${encodeURIComponent(slug)}` : '/daily';
}
