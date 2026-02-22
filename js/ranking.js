import { db } from './firebase-init.js';
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export async function renderRanking(container) {
    container.innerHTML = `
        <div class="card ranking-container fade-in">
            <h2>🏆 아이템 점수 랭킹</h2>
            <p class="text-sub">수집한 아이템 점수의 총합으로 순위를 매깁니다.</p>
            <div id="ranking-list" class="ranking-list">
                <div class="loading-spinner">랭킹 데이터를 불러오는 중...</div>
            </div>
        </div>
    `;

    const listContainer = document.getElementById('ranking-list');

    try {
        const q = query(collection(db, "users"), orderBy("totalScore", "desc"), limit(10));
        const snap = await getDocs(q);

        if (snap.empty) {
            listContainer.innerHTML = `<p class="text-sub" style="text-align:center; padding:2rem;">아직 랭킹 데이터가 없습니다.</p>`;
            return;
        }

        let rank = 1;
        listContainer.innerHTML = snap.docs.map(docSnap => {
            const data = docSnap.data();
            const badge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
            const html = `
                <div class="ranking-item">
                    <span class="rank-badge">${badge}</span>
                    <span class="rank-name">${data.nickname || '익명'}</span>
                    <span class="rank-score">${(data.totalScore || 0).toLocaleString()} 점</span>
                </div>
            `;
            rank++;
            return html;
        }).join('');

    } catch (e) {
        console.error("Ranking load error:", e);
        listContainer.innerHTML = `<p class="error-msg">랭킹을 불러오는데 실패했습니다.</p>`;
    }
}
