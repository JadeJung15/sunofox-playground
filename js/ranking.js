import { db } from './firebase-init.js?v=8.5.5';
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

function escapeHTML(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>'"]/g, (tag) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

export async function renderRanking(container) {
    let currentTab = 'score'; // 'score', 'points', 'activity', 'salary'
    let currentSalaryGame = 'tabShift';

    const renderBaseUI = () => {
        const salarySubtabs = currentTab === 'salary' ? `
            <div class="salary-ranking-subtabs" style="display:flex; gap:0.5rem; justify-content:center; flex-wrap:wrap; margin-top:-0.6rem; margin-bottom:1.4rem;">
                <button class="salary-subtab-btn" data-game="tabShift" style="border:none; border-radius:999px; padding:0.58rem 0.95rem; font-weight:850; cursor:pointer; background:${currentSalaryGame === 'tabShift' ? '#0f766e' : 'rgba(15,118,110,0.1)'}; color:${currentSalaryGame === 'tabShift' ? '#fff' : '#0f766e'};">🖥️ 업무창 위장하기</button>
                <button class="salary-subtab-btn" data-game="inboxZero" style="border:none; border-radius:999px; padding:0.58rem 0.95rem; font-weight:850; cursor:pointer; background:${currentSalaryGame === 'inboxZero' ? '#2563eb' : 'rgba(37,99,235,0.1)'}; color:${currentSalaryGame === 'inboxZero' ? '#fff' : '#2563eb'};">📨 메일 분류하기</button>
            </div>
        ` : '';

        container.innerHTML = `
            <div class="ranking-page fade-in">
                <div class="card ranking-header" style="text-align:center; padding: 3rem 1.5rem; background: linear-gradient(135deg, #1e293b, #334155); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                    <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; position: relative;">🏆 명예의 전당</h2>
                    <p style="opacity: 0.9; font-size: 1.1rem; font-weight: 600; position: relative;">각 분야의 정점에 선 수집가들</p>
                </div>

                <div class="ranking-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 2rem; justify-content: center; background: var(--bg-color); padding: 0.5rem; border-radius: 50px; border: 1px solid var(--border-color); max-width: 720px; margin-left: auto; margin-right: auto; flex-wrap: wrap;">
                    <button class="tab-btn ${currentTab === 'score' ? 'active' : ''}" data-tab="score" style="flex:1; padding: 0.8rem; border-radius: 50px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; background: ${currentTab === 'score' ? 'var(--accent-color)' : 'transparent'}; color: ${currentTab === 'score' ? '#fff' : 'var(--text-sub)'}">💎 아이템 점수</button>
                    <button class="tab-btn ${currentTab === 'points' ? 'active' : ''}" data-tab="points" style="flex:1; padding: 0.8rem; border-radius: 50px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; background: ${currentTab === 'points' ? 'var(--accent-secondary)' : 'transparent'}; color: ${currentTab === 'points' ? '#fff' : 'var(--text-sub)'}">💰 보유 자산</button>
                    <button class="tab-btn ${currentTab === 'activity' ? 'active' : ''}" data-tab="activity" style="flex:1; padding: 0.8rem; border-radius: 50px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; background: ${currentTab === 'activity' ? '#10b981' : 'transparent'}; color: ${currentTab === 'activity' ? '#fff' : 'var(--text-sub)'}">🎮 오락실 활동</button>
                    <button class="tab-btn ${currentTab === 'salary' ? 'active' : ''}" data-tab="salary" style="flex:1; padding: 0.8rem; border-radius: 50px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; background: ${currentTab === 'salary' ? '#0f766e' : 'transparent'}; color: ${currentTab === 'salary' ? '#fff' : 'var(--text-sub)'}">🖥️ 월급 루팡</button>
                </div>
                ${salarySubtabs}

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

        container.querySelectorAll('.salary-subtab-btn').forEach(btn => {
            btn.onclick = () => {
                currentSalaryGame = btn.dataset.game;
                renderBaseUI();
                loadData();
            };
        });
    };

    const loadData = async () => {
        const listContainer = document.getElementById('ranking-list');
        const ADMIN_UID = '6LVa2hs5ICSi4cgNjRBAx3dA2In2';
        
        // 카테고리별 스페셜 이모지 정의 (1~5등)
        const SPECIAL_EMOJIS = {
            score: ['👑', '💎', '🌟', '✨', '⭐'],
            points: ['💰', '💵', '💸', '🪙', '💳'],
            activity: ['🕹️', '🎮', '⚡', '🔥', '🍀'],
            salary: ['🖥️', '⌨️', '📊', '🫥', '🚨'],
            inboxZero: ['📨', '📬', '📎', '🗂️', '📌']
        };

        try {
            if (currentTab === 'salary') {
                const salaryField = currentSalaryGame === 'inboxZero' ? 'salaryGames.inboxZero.bestScore' : 'salaryGames.tabShift.bestScore';
                const salaryTitle = currentSalaryGame === 'inboxZero' ? '메일 분류 최고점' : '업무창 위장 최고점';
                const salaryAccent = currentSalaryGame === 'inboxZero' ? '#2563eb' : '#0f766e';
                const salaryBadges = currentSalaryGame === 'inboxZero' ? SPECIAL_EMOJIS.inboxZero : SPECIAL_EMOJIS.salary;
                const salaryQuery = query(collection(db, "users"), orderBy(salaryField, "desc"), limit(100));
                const salarySnap = await getDocs(salaryQuery);
                const salaryUsers = salarySnap.docs
                    .filter(doc => doc.id !== ADMIN_UID)
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(user => !user.isMaster && ((currentSalaryGame === 'inboxZero' ? user.salaryGames?.inboxZero?.bestScore : user.salaryGames?.tabShift?.bestScore) || 0) > 0)
                    .slice(0, 10);

                listContainer.innerHTML = salaryUsers.length ? salaryUsers.map((data, idx) => {
                    const rank = idx + 1;
                    const isTop3 = rank <= 3;
                    const specialStyle = rank === 1
                        ? `background: linear-gradient(135deg, ${salaryAccent}29 0%, ${salaryAccent}0a 100%); border: 2px solid ${salaryAccent};`
                        : (isTop3 ? `border-left: 4px solid ${salaryAccent};` : '');
                    const gameStats = currentSalaryGame === 'inboxZero' ? (data.salaryGames?.inboxZero || {}) : (data.salaryGames?.tabShift || {});
                    return `
                        <div class="card ranking-item" style="display: flex; align-items: center; padding: 1.25rem 1.5rem; gap: 1.5rem; ${specialStyle} position: relative; overflow: hidden;">
                            <div class="rank-number" style="font-size: ${isTop3 ? '1.8rem' : '1.2rem'}; font-weight: 900; width: 40px; text-align: center; color: ${isTop3 ? salaryAccent : 'var(--text-sub)'}">${rank}</div>
                            <div class="rank-avatar author-emoji-circle" style="width: 55px; height: 55px; font-size: 1.8rem; background: var(--card-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${isTop3 ? salaryAccent : 'var(--border-color)'};">
                                ${data.emoji || salaryBadges[idx] || '👤'}
                            </div>
                            <div class="rank-info" style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <h4 style="font-size: 1.1rem; font-weight: 800;">${escapeHTML(data.nickname || '익명')} <span style="margin-left:4px;">${escapeHTML(salaryBadges[idx] || '')}</span></h4>
                                </div>
                                <div style="font-size: 0.85rem; color: var(--text-sub); margin-top: 4px;">
                                    ${salaryTitle}: <strong style="color:${salaryAccent}; font-size: 1rem;">${(gameStats.bestScore || 0).toLocaleString()}</strong>
                                    <span style="margin: 0 8px; opacity: 0.3;">|</span>
                                    플레이: <strong style="color: var(--text-main); font-size: 0.9rem;">${(gameStats.plays || 0).toLocaleString()}회</strong>
                                    ${currentSalaryGame === 'tabShift' ? `<span style="margin: 0 8px; opacity: 0.3;">|</span>
                                    위장 성공: <strong style="color: var(--text-main); font-size: 0.9rem;">${(gameStats.totalSaved || 0).toLocaleString()}회</strong>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('') : '<p style="text-align:center; padding:2rem; color:var(--text-sub);">아직 월급 루팡 게임 기록이 없습니다.</p>';
                return;
            }

            // 충분한 양의 유저 데이터를 가져와서 모든 랭킹을 클라이언트에서 계산
            const q = query(collection(db, "users"), orderBy("totalScore", "desc"), limit(100));
            const snap = await getDocs(q);

            let allUsers = snap.docs
                .filter(doc => doc.id !== ADMIN_UID)
                .map(d => {
                    const data = d.data();
                    const stats = data.arcadeStats || {};
                    const totalActivity = Object.values(stats).reduce((a, b) => a + b, 0);
                    return { id: d.id, ...data, totalActivity };
                })
                .filter(user => !user.isMaster);

            // 1. 아이템 점수 랭킹 계산
            const scoreRanked = [...allUsers].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
            // 2. 보유 자산 랭킹 계산
            const pointsRanked = [...allUsers].sort((a, b) => (b.points || 0) - (a.points || 0));
            // 3. 활동량 랭킹 계산
            const activityRanked = [...allUsers].sort((a, b) => b.totalActivity - a.totalActivity);

            // 현재 탭에 맞는 리스트 선택
            let currentList = [];
            let accentColor = 'var(--accent-color)';
            let displayLabel = '';

            if (currentTab === 'score') {
                currentList = scoreRanked;
                accentColor = 'var(--accent-color)';
                displayLabel = '아이템 점수';
            } else if (currentTab === 'points') {
                currentList = pointsRanked;
                accentColor = 'var(--accent-secondary)';
                displayLabel = '보유 자산';
            } else {
                currentList = activityRanked;
                accentColor = '#10b981';
                displayLabel = '총 활동량';
            }

            const top10 = currentList.slice(0, 10);

            listContainer.innerHTML = top10.map((data, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                
                // 유저가 획득한 모든 분야의 배지 수집
                let userBadges = '';
                
                // 점수 배지 체크
                const sIdx = scoreRanked.findIndex(u => u.id === data.id);
                if (sIdx >= 0 && sIdx < 5) userBadges += `<span title="점수 ${sIdx+1}위">${SPECIAL_EMOJIS.score[sIdx]}</span>`;
                
                // 자산 배지 체크
                const pIdx = pointsRanked.findIndex(u => u.id === data.id);
                if (pIdx >= 0 && pIdx < 5) userBadges += `<span title="자산 ${pIdx+1}위">${SPECIAL_EMOJIS.points[pIdx]}</span>`;
                
                // 활동 배지 체크
                const aIdx = activityRanked.findIndex(u => u.id === data.id);
                if (aIdx >= 0 && aIdx < 5) userBadges += `<span title="활동 ${aIdx+1}위">${SPECIAL_EMOJIS.activity[aIdx]}</span>`;

                let specialStyle = '';
                if (rank === 1) specialStyle = `background: linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}05 100%); border: 2px solid ${accentColor};`;
                else if (isTop3) specialStyle = `border-left: 4px solid ${accentColor};`;

                const displayValue = currentTab === 'score' ? 
                    `${(data.totalScore || 0).toLocaleString()} 점` : 
                    (currentTab === 'points' ? `${(data.points || 0).toLocaleString()} P` : `${(data.totalActivity || 0).toLocaleString()} 회`);

                return `
                    <div class="card ranking-item" style="display: flex; align-items: center; padding: 1.25rem 1.5rem; gap: 1.5rem; ${specialStyle} position: relative; overflow: hidden;">
                        <div class="rank-number" style="font-size: ${isTop3 ? '1.8rem' : '1.2rem'}; font-weight: 900; width: 40px; text-align: center; color: ${isTop3 ? accentColor : 'var(--text-sub)'}">${rank}</div>
                        <div class="rank-avatar author-emoji-circle" style="width: 55px; height: 55px; font-size: 1.8rem; background: var(--card-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${isTop3 ? accentColor : 'var(--border-color)'};">
                            ${data.emoji || '👤'}
                        </div>
                        <div class="rank-info" style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <h4 style="font-size: 1.1rem; font-weight: 800;">${escapeHTML(data.nickname || '익명')} <span style="margin-left:4px; display:inline-flex; gap:2px;">${userBadges}</span></h4>
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-sub); margin-top: 4px;">
                                ${displayLabel}: <strong style="color: ${accentColor}; font-size: 1rem;">${displayValue}</strong>
                                <span style="margin: 0 8px; opacity: 0.3;">|</span>
                                작성글: <strong style="color: var(--text-main); font-size: 0.9rem;">${data.postCount || 0}</strong>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (e) {
            console.error(e);
            listContainer.innerHTML = '<p style="text-align:center; padding:2rem; color:#ef4444;">데이터 처리 중 오류가 발생했습니다.</p>';
        }
    };

    renderBaseUI();
    await loadData();
}
