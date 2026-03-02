import { db } from './firebase-init.js?v=8.5.2';
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { renderBadge, renderButton, renderSectionHeader, renderStatCard } from './ui/components.js?v=8.5.2';

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

function renderTabButton(tab, currentTab, label) {
    return `<button class="ranking-switcher__button${currentTab === tab ? ' is-active' : ''}" type="button" data-tab="${tab}">${label}</button>`;
}

function renderSalaryButton(game, currentSalaryGame, label) {
    return `<button class="ranking-subswitcher__button${currentSalaryGame === game ? ' is-active' : ''}" type="button" data-game="${game}">${label}</button>`;
}

function renderRankingItem(user, rank, accent, metricLabel, metricValue, extra = '') {
    return `
        <article class="ranking-row">
            <div class="ranking-row__rank" style="color:${accent};">${rank}</div>
            <div class="ranking-row__avatar" style="border-color:${accent}33;">${escapeHTML(user.emoji || '👤')}</div>
            <div class="ranking-row__body">
                <div class="ranking-row__title">
                    <strong>${escapeHTML(user.nickname || '익명')}</strong>
                </div>
                <div class="ranking-row__meta">
                    <span>${metricLabel}</span>
                    <strong style="color:${accent};">${metricValue}</strong>
                    ${extra ? `<span>${extra}</span>` : ''}
                </div>
            </div>
        </article>
    `;
}

export async function renderRanking(container) {
    let currentTab = 'score';
    let currentSalaryGame = 'tabShift';
    const ADMIN_UID = '6LVa2hs5ICSi4cgNjRBAx3dA2In2';

    const renderShell = () => {
        container.innerHTML = `
            <div class="site-page fade-in ranking-board-page">
                <section class="ui-surface ui-panel ranking-board-hero">
                    ${renderSectionHeader({
                        eyebrow: 'Ranking',
                        title: '활동 지표별 상위 플레이어',
                        description: '점수, 자산, 활동량, 월급 루팡 기록을 하나의 보드에서 확인합니다.'
                    })}
                    <div class="ui-grid ui-grid--3">
                        ${renderStatCard({ label: 'LIST', value: 'Top 10', caption: '탭별 상위권' })}
                        ${renderStatCard({ label: 'SOURCE', value: 'Live', caption: 'Firestore 기준' })}
                        ${renderStatCard({ label: 'VIEW', value: 'Board', caption: '지표별 비교' })}
                    </div>
                </section>

                <section class="ui-surface ui-panel">
                    <div class="ranking-switcher" role="tablist" aria-label="랭킹 탭">
                        ${renderTabButton('score', currentTab, '아이템 점수')}
                        ${renderTabButton('points', currentTab, '보유 자산')}
                        ${renderTabButton('activity', currentTab, '활동량')}
                        ${renderTabButton('salary', currentTab, '월급 루팡')}
                    </div>
                    ${currentTab === 'salary' ? `
                        <div class="ranking-subswitcher" role="tablist" aria-label="월급 루팡 세부 탭">
                            ${renderSalaryButton('tabShift', currentSalaryGame, '업무창 위장')}
                            ${renderSalaryButton('inboxZero', currentSalaryGame, '메일 분류')}
                        </div>
                    ` : ''}
                </section>

                <section class="ui-surface ui-panel">
                    <div id="ranking-list" class="ranking-list">
                        <div class="ui-empty-state">
                            <strong>랭킹을 불러오는 중입니다.</strong>
                            <p>잠시만 기다려 주세요.</p>
                        </div>
                    </div>
                </section>
            </div>
        `;

        container.querySelectorAll('.ranking-switcher__button').forEach((button) => {
            button.addEventListener('click', () => {
                currentTab = button.dataset.tab;
                renderShell();
                loadData();
            });
        });

        container.querySelectorAll('.ranking-subswitcher__button').forEach((button) => {
            button.addEventListener('click', () => {
                currentSalaryGame = button.dataset.game;
                renderShell();
                loadData();
            });
        });
    };

    const loadData = async () => {
        const listContainer = document.getElementById('ranking-list');

        try {
            if (currentTab === 'salary') {
                const salaryField = currentSalaryGame === 'inboxZero' ? 'salaryGames.inboxZero.bestScore' : 'salaryGames.tabShift.bestScore';
                const title = currentSalaryGame === 'inboxZero' ? '메일 분류 최고점' : '업무창 위장 최고점';
                const accent = currentSalaryGame === 'inboxZero' ? '#2563eb' : '#0f766e';
                const salaryQuery = query(collection(db, 'users'), orderBy(salaryField, 'desc'), limit(100));
                const salarySnap = await getDocs(salaryQuery);
                const users = salarySnap.docs
                    .filter((doc) => doc.id !== ADMIN_UID)
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((user) => !user.isMaster && ((currentSalaryGame === 'inboxZero'
                        ? user.salaryGames?.inboxZero?.bestScore
                        : user.salaryGames?.tabShift?.bestScore) || 0) > 0)
                    .slice(0, 10);

                listContainer.innerHTML = users.length
                    ? users.map((user, index) => {
                        const gameStats = currentSalaryGame === 'inboxZero' ? (user.salaryGames?.inboxZero || {}) : (user.salaryGames?.tabShift || {});
                        return renderRankingItem(
                            user,
                            index + 1,
                            accent,
                            title,
                            `${(gameStats.bestScore || 0).toLocaleString()}점`,
                            `플레이 ${(gameStats.plays || 0).toLocaleString()}회`
                        );
                    }).join('')
                    : `
                        <div class="ui-empty-state">
                            <strong>아직 기록이 없습니다.</strong>
                            <p>월급 루팡 게임이 시작되면 랭킹이 표시됩니다.</p>
                        </div>
                    `;
                return;
            }

            const q = query(collection(db, 'users'), orderBy('totalScore', 'desc'), limit(100));
            const snap = await getDocs(q);
            const users = snap.docs
                .filter((doc) => doc.id !== ADMIN_UID)
                .map((doc) => {
                    const data = doc.data();
                    const stats = data.arcadeStats || {};
                    const totalActivity = Object.values(stats).reduce((sum, value) => sum + value, 0);
                    return { id: doc.id, ...data, totalActivity };
                })
                .filter((user) => !user.isMaster);

            const ranked = {
                score: [...users].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)),
                points: [...users].sort((a, b) => (b.points || 0) - (a.points || 0)),
                activity: [...users].sort((a, b) => (b.totalActivity || 0) - (a.totalActivity || 0))
            };

            const config = {
                score: { accent: '#2563eb', label: '아이템 점수', value: (user) => `${(user.totalScore || 0).toLocaleString()}점` },
                points: { accent: '#16a34a', label: '보유 자산', value: (user) => `${(user.points || 0).toLocaleString()}P` },
                activity: { accent: '#ea580c', label: '총 활동량', value: (user) => `${(user.totalActivity || 0).toLocaleString()}회` }
            };

            const currentConfig = config[currentTab];
            const top10 = ranked[currentTab].slice(0, 10);

            listContainer.innerHTML = top10.length
                ? top10.map((user, index) => renderRankingItem(
                    user,
                    index + 1,
                    currentConfig.accent,
                    currentConfig.label,
                    currentConfig.value(user),
                    `작성글 ${user.postCount || 0}`
                )).join('')
                : `
                    <div class="ui-empty-state">
                        <strong>아직 랭킹 데이터가 없습니다.</strong>
                        <p>사용자 활동이 쌓이면 이 보드가 채워집니다.</p>
                    </div>
                `;
        } catch (error) {
            console.error(error);
            listContainer.innerHTML = `
                <div class="ui-empty-state">
                    <strong>랭킹을 불러오지 못했습니다.</strong>
                    <p>잠시 후 다시 시도해 주세요.</p>
                </div>
            `;
        }
    };

    renderShell();
    await loadData();
}
