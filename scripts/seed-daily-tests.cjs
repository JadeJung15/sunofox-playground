const admin = require('firebase-admin');

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
  ) {
    return 'index';
  }
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

async function main() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  const db = admin.firestore();
  const usedSlugs = new Set();
  const now = Date.now();
  const batch = db.batch();

  DAILY_TITLES.forEach((title, index) => {
    const slug = slugifyTitle(title, usedSlugs);
    const ref = db.collection('tests').doc(slug);
    batch.set(ref, {
      slug,
      title,
      category: 'daily',
      type: inferType(title),
      createdAt: admin.firestore.Timestamp.fromMillis(now + index * 1000),
      isActive: true
    }, { merge: true });
  });

  await batch.commit();
  console.log(`Seeded ${DAILY_TITLES.length} daily tests into tests collection.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
