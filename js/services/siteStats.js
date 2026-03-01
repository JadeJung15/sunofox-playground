import { db } from '../firebase-init.js?v=8.5.3';
import { doc, setDoc, getDoc, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export async function trackVisit() {
    try {
        if (sessionStorage.getItem('sc_visit')) return;
        const kstDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
        await setDoc(doc(db, 'siteStats', 'global'), { total: increment(1) }, { merge: true });
        await setDoc(doc(db, 'siteStats', kstDate), { count: increment(1) }, { merge: true });
        sessionStorage.setItem('sc_visit', '1');
    } catch (e) { console.error('Visit tracking failed', e); }
}

export async function renderVisitorStats() {
    try {
        const el = document.getElementById('visitor-stats');
        if (!el) return;

        const kstDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
        const [gSnap, dSnap] = await Promise.all([
            getDoc(doc(db, 'siteStats', 'global')),
            getDoc(doc(db, 'siteStats', kstDate))
        ]);

        const baseTotal = 48290;
        const baseToday = 1540;

        let total = baseTotal;
        let today = baseToday;

        if (gSnap.exists()) total += gSnap.data().total;
        if (dSnap.exists()) today += dSnap.data().count;

        const totalEl = document.getElementById('total-visitors');
        const todayEl = document.getElementById('today-visitors');
        if (totalEl) totalEl.textContent = total.toLocaleString();
        if (todayEl) todayEl.textContent = today.toLocaleString();
    } catch (e) { console.error('Stats loading failed', e); }
}
