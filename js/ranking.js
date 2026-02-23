import { db } from './firebase-init.js';
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export async function renderRanking(container) {
    container.innerHTML = `
        <div class="ranking-page fade-in">
            <div class="card ranking-header" style="text-align:center; padding: 3.5rem 1.5rem; background: linear-gradient(135deg, #1e293b, #334155); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; position: relative;">👑 명예의 전당</h2>
                <p style="opacity: 0.9; font-size: 1.1rem; font-weight: 600; position: relative;">최고의 자리를 차지한 영광의 수집가들</p>
            </div>

            <div class="ranking-list-container" id="ranking-list" style="display: flex; flex-direction: column; gap: 1rem; max-width: 800px; margin: 0 auto;">
                <div style="text-align:center; padding: 3rem;"><div class="loading-spinner">랭킹 데이터를 분석 중...</div></div>
            </div>
        </div>
    `;

    const listContainer = document.getElementById('ranking-list');
    const ADMIN_UID = '6LVa2hs5ICSi4cgNjRBAx3dA2In2';
    const RANK_EMOJIS = ['👑', '✨', '⭐', '🎖️', '🏅', '💎', '🔥', '⚡', '🔮', '🍀'];

    try {
        const q = query(collection(db, "users"), orderBy("totalScore", "desc"), limit(30));
        const snap = await getDocs(q);

        if (snap.empty) {
            listContainer.innerHTML = `<div class="card" style="text-align:center; padding:3rem;"><p class="text-sub">아직 랭킹 데이터가 없습니다.</p></div>`;
            return;
        }

        // 특정 UID 및 마스터 권한 유저 필터링
        const topUsers = snap.docs
            .filter(doc => doc.id !== ADMIN_UID) // 특정 관리자 ID 제외
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(user => !user.isMaster) // 일반 마스터 권한 제외
            .slice(0, 10);

        let rank = 1;
        listContainer.innerHTML = topUsers.map(data => {
            const isTop3 = rank <= 3;
            const rankEmoji = RANK_EMOJIS[rank - 1] || '🎖️';
            
            // 1, 2, 3등 특별 배경색 설정
            let specialStyle = '';
            if (rank === 1) specialStyle = 'background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%); border: 2px solid #fbbf24; box-shadow: 0 10px 25px -5px rgba(251, 191, 36, 0.2);';
            else if (rank === 2) specialStyle = 'background: linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, rgba(148, 163, 184, 0.05) 100%); border: 2px solid #94a3b8;';
            else if (rank === 3) specialStyle = 'background: linear-gradient(135deg, rgba(212, 163, 115, 0.15) 0%, rgba(212, 163, 115, 0.05) 100%); border: 2px solid #d4a373;';

            const badgeColor = rank === 1 ? '#fbbf24' : (rank === 2 ? '#94a3b8' : (rank === 3 ? '#d4a373' : 'var(--text-sub)'));

            const html = `
                <div class="card ranking-item" style="display: flex; align-items: center; padding: 1.5rem; gap: 1.5rem; ${specialStyle} position: relative; overflow: hidden;">
                    ${rank === 1 ? '<div style="position:absolute; top:-10px; right:-10px; font-size:5rem; opacity:0.05; transform:rotate(15deg);">🏆</div>' : ''}
                    <div class="rank-number" style="font-size: ${isTop3 ? '2rem' : '1.2rem'}; font-weight: 900; width: 50px; text-align: center; color: ${badgeColor};">${rank}</div>
                    <div class="rank-avatar author-emoji-circle" style="width: 65px; height: 60px; font-size: 2.2rem; background: var(--card-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border: 2px solid ${isTop3 ? badgeColor : 'var(--border-color)'};">
                        ${data.emoji || '👤'}
                    </div>
                    <div class="rank-info" style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <h4 style="font-size: 1.2rem; font-weight: 800; color:${isTop3 ? 'var(--text-main)' : 'inherit'};">${data.nickname || '익명 수집가'} <span style="margin-left:4px;">${rankEmoji}</span></h4>
                        </div>
                        <div style="display: flex; gap: 12px; font-size: 0.9rem; color: var(--text-sub);">
                            <span>아이템 점수: <strong style="color: ${rank === 1 ? '#fbbf24' : 'var(--accent-color)'}; font-size:1.1rem;">${(data.totalScore || 0).toLocaleString()}</strong></span>
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
        listContainer.innerHTML = `<p style="text-align:center; padding:2rem; color:#ef4444;">랭킹 데이터를 불러오는 중 오류가 발생했습니다.</p>`;
    }
}
