import { db } from './firebase-init.js';
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export async function renderRanking(container) {
    container.innerHTML = `
        <div class="ranking-page fade-in">
            <div class="card ranking-header" style="text-align:center; padding: 3rem 1.5rem; background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; position: relative;">🏆 명예의 전당</h2>
                <p style="opacity: 0.9; font-size: 1.1rem; font-weight: 600; position: relative;">SevenCheck 최고의 수집가들을 소개합니다</p>
            </div>

            <div class="ranking-list-container" id="ranking-list" style="display: flex; flex-direction: column; gap: 1rem; max-width: 800px; margin: 0 auto;">
                <div style="text-align:center; padding: 3rem;"><div class="loading-spinner">랭킹 데이터를 불러오는 중...</div></div>
            </div>
        </div>
    `;

    const listContainer = document.getElementById('ranking-list');

    try {
        // 관리자가 제외될 것을 고려해 넉넉하게 20명을 호출
        const q = query(collection(db, "users"), orderBy("totalScore", "desc"), limit(20));
        const snap = await getDocs(q);

        if (snap.empty) {
            listContainer.innerHTML = `<div class="card" style="text-align:center; padding:3rem;"><p class="text-sub">아직 랭킹 데이터가 없습니다.</p></div>`;
            return;
        }

        // isMaster가 true인 유저 제외 후 상위 10명 추출
        const topUsers = snap.docs
            .map(d => d.data())
            .filter(user => !user.isMaster)
            .slice(0, 10);

        if (topUsers.length === 0) {
            listContainer.innerHTML = `<div class="card" style="text-align:center; padding:3rem;"><p class="text-sub">랭킹에 표시할 수 있는 사용자가 없습니다.</p></div>`;
            return;
        }

        let rank = 1;
        listContainer.innerHTML = topUsers.map(data => {
            const isTop3 = rank <= 3;
            const badge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
            const html = `
                <div class="card ranking-item ${isTop3 ? 'top-rank' : ''}" style="display: flex; align-items: center; padding: 1.25rem 1.5rem; gap: 1.5rem; border-width: ${isTop3 ? '2px' : '1px'}; ${isTop3 ? 'border-color: var(--accent-soft);' : ''}">
                    <div class="rank-number" style="font-size: ${isTop3 ? '1.8rem' : '1.2rem'}; font-weight: 900; width: 40px; text-align: center; color: ${isTop3 ? 'var(--accent-color)' : 'var(--text-sub)'}">${badge}</div>
                    <div class="rank-avatar author-emoji-circle" style="width: 60px; height: 60px; font-size: 2rem; background: var(--bg-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border: 2px solid var(--border-color);">
                        ${data.emoji || '👤'}
                    </div>
                    <div class="rank-info" style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <h4 style="font-size: 1.1rem; font-weight: 800;">${data.nickname || '익명 수집가'}</h4>
                        </div>
                        <div style="display: flex; gap: 12px; font-size: 0.85rem; color: var(--text-sub);">
                            <span>아이템 점수: <strong style="color: var(--accent-color)">${(data.totalScore || 0).toLocaleString()}</strong></span>
                            <span>보유 자산: <strong>${(data.points || 0).toLocaleString()}P</strong></span>
                        </div>
                    </div>
                </div>
            `;
            rank++;
            return html;
        }).join('');

    } catch (e) {
        console.error("Ranking load error:", e);
        listContainer.innerHTML = `<p style="text-align:center; padding:2rem; color:#ef4444;">랭킹을 불러오는데 실패했습니다.</p>`;
    }
}
