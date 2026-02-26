import { db } from './firebase-init.js';
import { doc, getDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80";

export function handleImgError(img) {
    img.onerror = null;
    img.src = DEFAULT_IMAGE;
    img.classList.add('img-fallback');
}
window.handleImgError = handleImgError;

export const FOX_ADVICE = [
    "오늘 하루도 당신은 충분히 빛나요! ✨",
    "오른쪽으로 걸어가면 뜻밖의 행운이 있을지도? 🍀",
    "지금 테스트를 하면 마음이 한결 가벼워질 거예요. 🧠",
    "지칠 땐 오락실에서 한 판 쉬어가는 건 어때요? 🎰",
    "당신의 아우라는 오늘 '열정의 레드'만큼 뜨겁네요! 🔥",
    "맛있는 걸 먹으면 운세가 2배로 좋아질 거예요! 🍰",
    "누군가 당신을 생각하고 있는 따뜻한 날이네요. 💌",
    "오늘은 새로운 도전을 시작하기에 완벽한 날입니다! 🚀",
    "가끔은 아무것도 하지 않는 게 최고의 휴식이에요. 💤",
    "당신이 몰랐던 매력을 곧 발견하게 될 거예요! 💎"
];

export async function trackVisit() {
    try {
        if (sessionStorage.getItem('sc_visit')) return;
        const kstDate = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
        await setDoc(doc(db, 'siteStats', 'global'), { total: increment(1) }, { merge: true });
        await setDoc(doc(db, 'siteStats', kstDate), { count: increment(1) }, { merge: true });
        sessionStorage.setItem('sc_visit', '1');
    } catch (e) {}
}

export async function renderVisitorStats() {
    try {
        const totalEl = document.getElementById('total-visitors');
        const todayEl = document.getElementById('today-visitors');
        if (!totalEl || !todayEl) return;
        const kstDate = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
        const [gSnap, dSnap] = await Promise.all([getDoc(doc(db, 'siteStats', 'global')), getDoc(doc(db, 'siteStats', 'kstDate'))]);
        let total = 48290, today = 1540;
        if (gSnap.exists()) total += gSnap.data().total;
        if (dSnap.exists()) today += dSnap.data().count;
        totalEl.textContent = total.toLocaleString();
        todayEl.textContent = today.toLocaleString();
    } catch (e) {}
}
