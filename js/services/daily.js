import { auth, db } from '../firebase-init.js?v=8.5.0';
import { ensureAnonymousUser } from '../auth.js?v=8.5.0';
import { collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

function sortDailyTests(a, b) {
  const aTime = a.createdAt?.seconds || 0;
  const bTime = b.createdAt?.seconds || 0;
  return aTime - bTime;
}

export async function fetchDailyTests() {
  const snap = await getDocs(collection(db, 'tests'));
  return snap.docs
    .map((item) => item.data())
    .filter((item) => item.category === 'daily' && item.isActive)
    .sort(sortDailyTests);
}

export async function fetchDailyTest(slug) {
  const snap = await getDoc(doc(db, 'tests', slug));
  return snap.exists() ? snap.data() : null;
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
