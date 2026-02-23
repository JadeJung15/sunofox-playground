import { db } from './firebase-init.js';
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getTier } from './auth.js';

export async function renderRanking(container) {
    let currentTab = 'score'; // 'score', 'points', 'activity'

    const renderBaseUI = () => {
        container.innerHTML = `
            <div class="ranking-page fade-in">
                <div class="card ranking-header" style="text-align:center; padding: 3rem 1.5rem; background: linear-gradient(135deg, #1e293b, #334155); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                    <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; position: relative;">🏆 명예의 전당</h2>
                    <p style="opacity: 0.9; font-size: 1.1rem; font-weight: 600; position: relative;">분야별 최고의 기록을 확인하세요</p>
                </div>

                <div class="ranking-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 2rem; justify-content: center; background: var(--bg-color); padding: 0.5rem; border-radius: 50px; border: 1px solid var(--border-color); max-width: 500px; margin-left: auto; margin-right: auto;">
                    <button class="tab-btn ${currentTab === 'score' ? 'active' : ''}" data-tab="score" style="flex:1; padding: 0.8rem; border-radius: 50px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; background: ${currentTab === 'score' ? 'var(--accent-color)' : 'transparent'}; color: ${currentTab === 'score' ? '#fff' : 'var(--text-sub)'}">💎 아이템 점수</button>
                    <button class="tab-btn ${currentTab === 'points' ? 'active' : ''}" data-tab="points" style="flex:1; padding: 0.8rem; border-radius: 50px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; background: ${currentTab === 'points' ? 'var(--accent-secondary)' : 'transparent'}; color: ${currentTab === 'points' ? '#fff' : 'var(--text-sub)'}">💰 보유 자산</button>
                    <button class="tab-btn ${currentTab === 'activity' ? 'active' : ''}" data-tab="activity" style="flex:1; padding: 0.8rem; border-radius: 50px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; background: ${currentTab === 'activity' ? '#10b981' : 'transparent'}; color: ${currentTab === 'activity' ? '#fff' : 'var(--text-sub)'}">🎮 오락실 활동</button>
                </div>

                <div class="ranking-list-container" id="ranking-list" style="display: flex; flex-direction: column; gap: 1rem; max-width: 800px; margin: 0 auto;">
                    <div style="text-align:center; padding: 3rem;"><div class="loading-spinner">데이터를 분석 중...</div></div>
                </div>
            </div>
        `;

        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                currentTab = btn.dataset.tab;
                renderBaseUI();
                loadData();
            };
        });
    };

    const loadData = async () => {
        const listContainer = document.getElementById('ranking-list');
        const ADMIN_UID = '6LVa2hs5ICSi4cgNjRBAx3dA2In2';
        const RANK_EMOJIS = ['👑', '✨', '⭐', '🎖️', '🏅', '💎', '🔥', '⚡', '🔮', '🍀'];

        try {
            // 탭에 따라 다른 정렬 기준 적용
            const sortField = currentTab === 'score' ? 'totalScore' : (currentTab === 'points' ? 'points' : 'totalScore');
            const q = query(collection(db, "users"), orderBy(sortField, "desc"), limit(50));
            const snap = await getDocs(q);

            if (snap.empty) {
                listContainer.innerHTML = `<div class="card" style="text-align:center; padding:3rem;"><p class="text-sub">데이터가 없습니다.</p></div>`;
                return;
            }

            let users = snap.docs
                .filter(doc => doc.id !== ADMIN_UID)
                .map(d => {
                    const data = d.data();
                    // 활동량 합계 계산
                    const stats = data.arcadeStats || {};
                    const totalActivity = Object.values(stats).reduce((a, b) => a + b, 0);
                    return { id: d.id, ...data, totalActivity };
                })
                .filter(user => !user.isMaster);

            // 활동량 탭일 경우 별도 정렬
            if (currentTab === 'activity') {
                users.sort((a, b) => b.totalActivity - a.totalActivity);
            }

            const topUsers = users.slice(0, 10);

            let rank = 1;
            listContainer.innerHTML = topUsers.map(data => {
                const isTop3 = rank <= 3;
                const rankEmoji = RANK_EMOJIS[rank - 1] || '🎖️';
                
                let specialStyle = '';
                let accentColor = 'var(--accent-color)';
                
                if (currentTab === 'score') {
                    if (rank === 1) specialStyle = 'background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%); border: 2px solid #fbbf24;';
                    else if (rank === 2) specialStyle = 'background: linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, rgba(148, 163, 184, 0.05) 100%); border: 2px solid #94a3b8;';
                    else if (rank === 3) specialStyle = 'background: linear-gradient(135deg, rgba(212, 163, 115, 0.15) 0%, rgba(212, 163, 115, 0.05) 100%); border: 2px solid #d4a373;';
                } else if (currentTab === 'points') {
                    accentColor = 'var(--accent-secondary)';
                    if (rank === 1) specialStyle = 'background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.05) 100%); border: 2px solid #f43f5e;';
                } else {
                    accentColor = '#10b981';
                    if (rank === 1) specialStyle = 'background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border: 2px solid #10b981;';
                }

                const displayValue = currentTab === 'score' ? 
                    `${(data.totalScore || 0).toLocaleString()} 점` : 
                    (currentTab === 'points' ? `${(data.points || 0).toLocaleString()} P` : `${(data.totalActivity || 0).toLocaleString()} 회`);

                const displayLabel = currentTab === 'score' ? '아이템 점수' : (currentTab === 'points' ? '보유 자산' : '총 활동량');

                return `
                    <div class="card ranking-item" style="display: flex; align-items: center; padding: 1.25rem 1.5rem; gap: 1.5rem; ${specialStyle} position: relative; overflow: hidden;">
                        <div class="rank-number" style="font-size: ${isTop3 ? '1.8rem' : '1.2rem'}; font-weight: 900; width: 40px; text-align: center; color: ${isTop3 ? accentColor : 'var(--text-sub)'}">${rank}</div>
                        <div class="rank-avatar author-emoji-circle" style="width: 55px; height: 55px; font-size: 1.8rem; background: var(--card-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${isTop3 ? accentColor : 'var(--border-color)'};">
                            ${data.emoji || '👤'}
                        </div>
                        <div class="rank-info" style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <h4 style="font-size: 1.1rem; font-weight: 800;">${data.nickname || '익명'} <span style="font-size:0.9rem;">${rankEmoji}</span></h4>
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-sub); margin-top: 4px;">
                                ${displayLabel}: <strong style="color: ${accentColor}; font-size: 1rem;">${displayValue}</strong>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // 랭크 숫자 업데이트를 위한 후처리
            const items = listContainer.querySelectorAll('.ranking-item');
            items.forEach((_, idx) => rank++);

        } catch (e) {
            console.error(e);
            listContainer.innerHTML = '<p style="text-align:center; padding:2rem; color:#ef4444;">로드 실패</p>';
        }
    };

    renderBaseUI();
    await loadData();
}
