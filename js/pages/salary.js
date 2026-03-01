import { UserState, postEconomyAction, updateUI } from '../auth.js?v=8.5.6';
import { db } from '../firebase-init.js?v=8.5.6';
import { collection, doc, getDocs, limit, orderBy, query, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.5.6';
import { renderTestCard } from './home.js?v=8.5.6';

const ADMIN_UID = '6LVa2hs5ICSi4cgNjRBAx3dA2In2';

const GAME_CONFIGS = {
    tabShift: {
        label: '업무창 위장하기',
        field: 'salaryGames.tabShift',
        icon: '🖥️',
        accent: '#0f766e'
    },
    inboxZero: {
        label: '메일 분류하기',
        field: 'salaryGames.inboxZero',
        icon: '📨',
        accent: '#2563eb'
    }
};

const TAB_LABELS = [
    '커뮤니티 후기 모음',
    '퇴근 후 저녁 메뉴 조합기',
    '회의 중 멍때리기 시뮬레이터',
    '월급 루팡 밈 저장소',
    '아무도 모를 새 창',
    '직장인 생존 가이드'
];

const MAIL_QUEUE = [
    { subject: '오늘 4시 대표 보고안 수정본 요청', from: '팀장님', category: 'urgent', note: '퇴근 전에 바로 봐야 할 느낌이 진합니다.' },
    { subject: '지난주 회의록 공유드립니다', from: '기획팀', category: 'reference', note: '당장 급하지는 않지만 언젠가 찾게 됩니다.' },
    { subject: '다음 달 복지 설문 참여 부탁드립니다', from: '인사팀', category: 'later', note: '오늘 안 해도 되지만 까먹으면 귀찮아집니다.' },
    { subject: '갑자기 생긴 디자인 검토 가능 여부', from: '마케팅팀', category: 'urgent', note: '누가 봐도 지금 답장 원합니다.' },
    { subject: '팀 워크숍 사진 공유', from: '총무팀', category: 'reference', note: '일단 보관하면 나중에 밈으로 씁니다.' },
    { subject: '사내 카페 신메뉴 투표', from: '사내복지', category: 'later', note: '급하진 않은데 은근 참여하고 싶습니다.' },
    { subject: '이번 주 배포 일정 확인 요청', from: '개발리드', category: 'urgent', note: '놓치면 오늘 저녁까지 길어질 수 있습니다.' },
    { subject: '업무용 템플릿 업데이트 안내', from: '운영지원', category: 'reference', note: '바로 안 봐도 되지만 묻히면 다시 찾게 됩니다.' }
];

function getSalaryTests() {
    return TESTS.filter((test) => test.category === '월급 루팡').reverse();
}

function getGameData(gameKey) {
    return UserState.data?.salaryGames?.[gameKey] || {};
}

function getPersonalBest(gameKey) {
    return getGameData(gameKey).bestScore || 0;
}

function getRewardForScore(score) {
    return Math.max(15, Math.min(120, Math.floor(score / 12)));
}

async function loadSalaryLeaderboard(gameKey) {
    const config = GAME_CONFIGS[gameKey];
    if (!config) return [];

    try {
        const snap = await getDocs(query(collection(db, 'users'), orderBy(`${config.field}.bestScore`, 'desc'), limit(10)));
        return snap.docs
            .filter((entry) => entry.id !== ADMIN_UID)
            .map((entry) => ({ id: entry.id, ...entry.data() }))
            .filter((user) => (user.salaryGames?.[gameKey]?.bestScore || 0) > 0)
            .slice(0, 10);
    } catch (error) {
        console.error(`${gameKey} leaderboard load failed`, error);
        return [];
    }
}

function renderLeaderboardRows(users, gameKey) {
    const config = GAME_CONFIGS[gameKey];
    if (!users.length) {
        return `<div style="padding:1.25rem; text-align:center; color:var(--text-sub); font-weight:700;">${config.label} 첫 기록의 주인공이 아직 없습니다.</div>`;
    }

    return users.map((user, index) => {
        const bestScore = user.salaryGames?.[gameKey]?.bestScore || 0;
        const plays = user.salaryGames?.[gameKey]?.plays || 0;
        const medal = ['🥇', '🥈', '🥉'][index] || config.icon;
        return `
            <div style="display:grid; grid-template-columns:auto auto 1fr auto; align-items:center; gap:0.8rem; padding:0.9rem 1rem; border-radius:18px; background:${index < 3 ? `linear-gradient(135deg, ${config.accent}1f, ${config.accent}08)` : 'rgba(255,255,255,0.7)'}; border:1px solid ${config.accent}22;">
                <div style="font-size:1.05rem; font-weight:900; color:${config.accent}; width:22px; text-align:center;">${index + 1}</div>
                <div style="width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid ${config.accent}22; font-size:1.45rem;">${user.emoji || medal}</div>
                <div style="min-width:0;">
                    <div style="font-size:0.95rem; font-weight:850; color:#0f172a; display:flex; align-items:center; gap:0.4rem; min-width:0;">
                        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.nickname || '익명'}</span>
                        ${index < 3 ? `<span style="font-size:0.82rem;">${medal}</span>` : ''}
                    </div>
                    <div style="font-size:0.77rem; color:var(--text-sub); font-weight:700;">플레이 ${plays.toLocaleString()}회</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.02rem; font-weight:950; color:${config.accent};">${bestScore.toLocaleString()}</div>
                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800;">BEST SCORE</div>
                </div>
            </div>
        `;
    }).join('');
}

async function persistSalaryScore(gameKey, score, extraStats = {}) {
    if (!UserState.user) return { reward: 0, bestScore: getPersonalBest(gameKey), isNewBest: false };

    const config = GAME_CONFIGS[gameKey];
    const previousBest = getPersonalBest(gameKey);
    const nextBest = Math.max(previousBest, score);
    const isNewBest = nextBest > previousBest;
    const reward = getRewardForScore(score);

    const result = await postEconomyAction('saveSalaryScore', {
        gameKey,
        score,
        extraStats
    });

    if (!UserState.data.salaryGames) UserState.data.salaryGames = {};
    if (!UserState.data.salaryGames[gameKey]) {
        UserState.data.salaryGames[gameKey] = { bestScore: 0, plays: 0, totalScore: 0 };
    }

    const local = UserState.data.salaryGames[gameKey];
    local.bestScore = nextBest;
    local.lastScore = score;
    local.plays = (local.plays || 0) + 1;
    local.totalScore = (local.totalScore || 0) + score;
    Object.entries(extraStats).forEach(([key, value]) => {
        local[key] = (local[key] || 0) + value;
    });

    UserState.data.points = (UserState.data.points || 0) + result.reward;
    updateUI();

    return { reward: result.reward, bestScore: result.bestScore, isNewBest: result.isNewBest };
}

export async function renderSalaryGame() {
    const app = document.getElementById('app');
    const tests = getSalaryTests();
    const [tabShiftLeaders, inboxLeaders] = await Promise.all([
        loadSalaryLeaderboard('tabShift'),
        loadSalaryLeaderboard('inboxZero')
    ]);
    const isLoggedIn = !!UserState.user;

    app.innerHTML = `
        <div class="salary-page fade-in" style="max-width:1120px; margin:0 auto; padding:1.2rem 1rem 5rem;">
            <section style="position:relative; overflow:hidden; border-radius:34px; padding:1.25rem; margin-bottom:1.4rem; background:linear-gradient(145deg,#0f172a 0%, #134e4a 45%, #0f766e 100%); color:#fff; box-shadow:0 24px 50px rgba(15,23,42,0.22);">
                <div style="position:absolute; width:360px; height:360px; top:-180px; right:-110px; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 72%);"></div>
                <div style="position:absolute; width:240px; height:240px; bottom:-140px; left:-70px; border-radius:50%; background:radial-gradient(circle, rgba(45,212,191,0.26) 0%, rgba(45,212,191,0) 72%);"></div>
                <div style="position:relative; z-index:1; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; align-items:stretch;">
                    <div style="display:flex; flex-direction:column; justify-content:space-between; min-height:320px;">
                        <div>
                            <div style="font-size:0.76rem; font-weight:900; letter-spacing:0.16em; color:rgba(255,255,255,0.72); margin-bottom:0.8rem;">OFFICE ESCAPE MODE</div>
                            <div style="font-size:3rem; margin-bottom:0.8rem;">🖥️</div>
                            <h2 style="font-size:clamp(2rem, 6vw, 3rem); line-height:1.04; letter-spacing:-0.05em; font-weight:950; margin:0 0 0.85rem;">회사에서 티 안 나게<br>시간 녹이기</h2>
                            <p style="font-size:0.98rem; line-height:1.72; color:rgba(240,253,250,0.92); font-weight:650; max-width:95%;">월급 루팡 카테고리 전용 게임 라운지입니다. 비회원은 바로 체험하고, 회원은 최고점과 플레이 기록이 저장되며 포인트도 획득합니다.</p>
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:0.55rem; margin-top:1.2rem;">
                            <span style="padding:0.52rem 0.82rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); font-size:0.77rem; font-weight:850;">무음 플레이</span>
                            <span style="padding:0.52rem 0.82rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); font-size:0.77rem; font-weight:850;">PC 최적화</span>
                            <span style="padding:0.52rem 0.82rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); font-size:0.77rem; font-weight:850;">게임별 랭킹</span>
                        </div>
                    </div>

                    <div style="display:grid; gap:0.8rem; align-content:start;">
                        <div style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.16); border-radius:26px; padding:1rem 1.05rem; backdrop-filter:blur(10px);">
                            <div style="font-size:0.75rem; font-weight:900; letter-spacing:0.1em; color:rgba(255,255,255,0.7); margin-bottom:0.55rem;">PLAYER STATUS</div>
                            <div style="display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:0.7rem;">
                                <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.12);">
                                    <div style="font-size:0.74rem; font-weight:800; color:rgba(255,255,255,0.72); margin-bottom:0.3rem;">업무창 위장 최고점</div>
                                    <div style="font-size:1.2rem; font-weight:950;">${getPersonalBest('tabShift').toLocaleString()}</div>
                                </div>
                                <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.12);">
                                    <div style="font-size:0.74rem; font-weight:800; color:rgba(255,255,255,0.72); margin-bottom:0.3rem;">메일 분류 최고점</div>
                                    <div style="font-size:1.2rem; font-weight:950;">${getPersonalBest('inboxZero').toLocaleString()}</div>
                                </div>
                                <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.12);">
                                    <div style="font-size:0.74rem; font-weight:800; color:rgba(255,255,255,0.72); margin-bottom:0.3rem;">로그인 상태</div>
                                    <div style="font-size:1rem; font-weight:900;">${isLoggedIn ? '회원 기록 저장 ON' : '비회원 체험 모드'}</div>
                                </div>
                            </div>
                        </div>

                        <div style="background:#f8fafc; color:#0f172a; border-radius:28px; padding:1rem; border:1px solid rgba(255,255,255,0.2); box-shadow:0 18px 30px rgba(15,23,42,0.12);">
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.8rem; margin-bottom:0.8rem;">
                                <div>
                                    <div style="font-size:0.74rem; font-weight:900; color:#0f766e; letter-spacing:0.1em; margin-bottom:0.18rem;">LIVE LEADERBOARD</div>
                                    <div style="font-size:1.05rem; font-weight:900;">월급 루팡 게임별 TOP 10</div>
                                </div>
                                <button onclick="location.hash='#ranking'" style="border:none; background:rgba(15,118,110,0.12); color:#0f766e; font-weight:850; border-radius:999px; padding:0.5rem 0.8rem; cursor:pointer;">전체 랭킹</button>
                            </div>
                            <div style="display:flex; gap:0.5rem; margin-bottom:0.8rem; flex-wrap:wrap;">
                                <button id="salary-board-tabShift" style="border:none; border-radius:999px; padding:0.55rem 0.85rem; background:#0f766e; color:#fff; font-weight:850; cursor:pointer;">🖥️ 업무창 위장하기</button>
                                <button id="salary-board-inboxZero" style="border:none; border-radius:999px; padding:0.55rem 0.85rem; background:rgba(37,99,235,0.1); color:#2563eb; font-weight:850; cursor:pointer;">📨 메일 분류하기</button>
                            </div>
                            <div id="salary-leaderboard-list" style="display:grid; gap:0.65rem;">
                                ${renderLeaderboardRows(tabShiftLeaders, 'tabShift')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section style="display:grid; gap:1rem; margin-bottom:1.6rem;">
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1rem; align-items:start;">
                    <div style="background:#ffffff; border:1px solid #dbece8; border-radius:30px; box-shadow:0 18px 34px rgba(15,23,42,0.06); overflow:hidden;">
                        <div style="padding:1.1rem 1.1rem 0.9rem; background:linear-gradient(180deg, rgba(15,118,110,0.08), rgba(15,118,110,0));">
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.6rem; margin-bottom:0.7rem;">
                                <div style="font-size:0.78rem; font-weight:900; color:#0f766e; letter-spacing:0.1em;">GAME 01</div>
                                <div id="salary-best-pill-tabShift" style="padding:0.34rem 0.7rem; border-radius:999px; background:rgba(15,118,110,0.1); color:#0f766e; font-size:0.76rem; font-weight:900;">BEST ${getPersonalBest('tabShift').toLocaleString()}</div>
                            </div>
                            <h3 style="font-size:1.4rem; font-weight:950; letter-spacing:-0.04em; color:#0f172a; margin:0 0 0.35rem;">상사 오기 전 업무창 위장하기</h3>
                            <p style="font-size:0.88rem; color:#475569; line-height:1.65; font-weight:650;">경고가 뜨면 바로 업무 모드로 숨기는 반응형 생존 게임입니다. 이전보다 경고 간격을 넓히고 실수 페널티를 조금 줄여 억울함을 덜었습니다.</p>
                            <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:0.55rem; margin-top:0.9rem;">
                                <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">점수</div>
                                    <div id="salary-score" style="font-size:1.25rem; font-weight:950; color:#0f172a;">0</div>
                                </div>
                                <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">남은 시간</div>
                                    <div id="salary-time" style="font-size:1.25rem; font-weight:950; color:#0f172a;">35</div>
                                </div>
                                <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">위장 성공</div>
                                    <div id="salary-saves" style="font-size:1.25rem; font-weight:950; color:#0f172a;">0</div>
                                </div>
                                <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">경고 누락</div>
                                    <div id="salary-misses" style="font-size:1.25rem; font-weight:950; color:#ef4444;">0</div>
                                </div>
                            </div>
                        </div>

                        <div style="padding:1rem 1.1rem 1.2rem;">
                            <div id="salary-screen" style="background:linear-gradient(145deg,#0f172a, #1e293b); color:#fff; border-radius:24px; padding:1rem; min-height:290px; position:relative; overflow:hidden; box-shadow:inset 0 0 40px rgba(255,255,255,0.04);">
                                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.8rem; margin-bottom:0.9rem;">
                                    <div style="font-size:0.75rem; font-weight:900; color:rgba(255,255,255,0.72); letter-spacing:0.12em;">DESKTOP STATUS</div>
                                    <div id="salary-mode-badge" style="padding:0.34rem 0.72rem; border-radius:999px; background:rgba(45,212,191,0.18); color:#5eead4; font-size:0.75rem; font-weight:900;">대기 중</div>
                                </div>
                                <div style="border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); padding:1rem; min-height:180px; display:flex; flex-direction:column; justify-content:space-between;">
                                    <div>
                                        <div id="salary-app-title" style="font-size:1rem; font-weight:900; margin-bottom:0.35rem;">루팡 모드 준비 완료</div>
                                        <div id="salary-app-desc" style="font-size:0.88rem; line-height:1.65; color:rgba(226,232,240,0.9); font-weight:650;">게임을 시작한 뒤 <strong>딴짓 탭 열기</strong>로 점수를 쌓으세요. 빨간 경고가 뜨면 바로 <strong>업무 모드 전환</strong>을 눌러야 합니다.</div>
                                    </div>
                                    <div style="display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:0.6rem; margin-top:1rem;">
                                        <div style="padding:0.7rem; border-radius:14px; background:rgba(255,255,255,0.05);">
                                            <div style="font-size:0.68rem; color:rgba(255,255,255,0.56); font-weight:800; margin-bottom:0.18rem;">열린 탭</div>
                                            <div id="salary-open-tab" style="font-size:0.9rem; font-weight:850;">준비 화면</div>
                                        </div>
                                        <div style="padding:0.7rem; border-radius:14px; background:rgba(255,255,255,0.05);">
                                            <div style="font-size:0.68rem; color:rgba(255,255,255,0.56); font-weight:800; margin-bottom:0.18rem;">상사 감지</div>
                                            <div id="salary-alert-text" style="font-size:0.9rem; font-weight:850;">없음</div>
                                        </div>
                                        <div style="padding:0.7rem; border-radius:14px; background:rgba(255,255,255,0.05);">
                                            <div style="font-size:0.68rem; color:rgba(255,255,255,0.56); font-weight:800; margin-bottom:0.18rem;">현재 페이스</div>
                                            <div id="salary-pace" style="font-size:0.9rem; font-weight:850;">워밍업</div>
                                        </div>
                                    </div>
                                </div>
                                <div id="salary-overlay" style="position:absolute; inset:0; display:none; align-items:center; justify-content:center; background:rgba(239,68,68,0.88); color:#fff; text-align:center; padding:1.25rem;">
                                    <div>
                                        <div style="font-size:2.5rem; margin-bottom:0.4rem;">🚨</div>
                                        <div style="font-size:1.25rem; font-weight:950; margin-bottom:0.25rem;">상사 접근 중</div>
                                        <div style="font-size:0.92rem; font-weight:700; opacity:0.92;">지금 바로 업무 모드로 숨기세요</div>
                                    </div>
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:0.7rem; margin-top:0.95rem;">
                                <button id="salary-start-btn" class="btn-primary" style="height:58px; border:none; border-radius:18px; background:linear-gradient(135deg,#0f766e,#14b8a6); font-weight:900;">게임 시작</button>
                                <button id="salary-loaf-btn" class="btn-secondary" style="height:58px; border-radius:18px; font-weight:850; border-color:#99f6e4; color:#0f766e;">딴짓 탭 열기</button>
                                <button id="salary-work-btn" class="btn-secondary" style="height:58px; border-radius:18px; font-weight:850; border-color:#fecaca; color:#b91c1c;">업무 모드 전환</button>
                            </div>
                            <div id="salary-status" style="margin-top:0.85rem; min-height:52px; border-radius:18px; background:#f8fafc; border:1px solid #e2e8f0; padding:0.9rem 1rem; font-size:0.9rem; line-height:1.6; color:#334155; font-weight:700;">게임 시작을 누르면 35초 동안 회사에서 딴짓하다 들키지 않는 생존 게임이 시작됩니다.</div>
                        </div>
                    </div>

                    <div style="background:#ffffff; border:1px solid #dbe7f8; border-radius:30px; box-shadow:0 18px 34px rgba(15,23,42,0.06); overflow:hidden;">
                        <div style="padding:1.1rem 1.1rem 0.9rem; background:linear-gradient(180deg, rgba(37,99,235,0.08), rgba(37,99,235,0));">
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.6rem; margin-bottom:0.7rem;">
                                <div style="font-size:0.78rem; font-weight:900; color:#2563eb; letter-spacing:0.1em;">GAME 02</div>
                                <div id="salary-best-pill-inboxZero" style="padding:0.34rem 0.7rem; border-radius:999px; background:rgba(37,99,235,0.1); color:#2563eb; font-size:0.76rem; font-weight:900;">BEST ${getPersonalBest('inboxZero').toLocaleString()}</div>
                            </div>
                            <h3 style="font-size:1.4rem; font-weight:950; letter-spacing:-0.04em; color:#0f172a; margin:0 0 0.35rem;">메일 정리하는 척 분류하기</h3>
                            <p style="font-size:0.88rem; color:#475569; line-height:1.65; font-weight:650;">업무 메일처럼 보이는 카드가 나오면 <strong>긴급</strong>, <strong>참고</strong>, <strong>보류</strong> 중 하나로 빠르게 분류하세요. 속도와 연속 정답이 점수 차이를 만듭니다.</p>
                            <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:0.55rem; margin-top:0.9rem;">
                                <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">점수</div>
                                    <div id="mail-score" style="font-size:1.25rem; font-weight:950; color:#0f172a;">0</div>
                                </div>
                                <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">남은 시간</div>
                                    <div id="mail-time" style="font-size:1.25rem; font-weight:950; color:#0f172a;">25</div>
                                </div>
                                <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">연속 정답</div>
                                    <div id="mail-streak" style="font-size:1.25rem; font-weight:950; color:#2563eb;">0</div>
                                </div>
                                <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">오답</div>
                                    <div id="mail-wrong" style="font-size:1.25rem; font-weight:950; color:#ef4444;">0</div>
                                </div>
                            </div>
                        </div>
                        <div style="padding:1rem 1.1rem 1.2rem;">
                            <div id="mail-screen" style="background:linear-gradient(145deg,#eff6ff, #dbeafe); color:#0f172a; border-radius:24px; padding:1rem; min-height:290px; border:1px solid rgba(37,99,235,0.12); display:flex; flex-direction:column; justify-content:space-between;">
                                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.8rem; margin-bottom:0.9rem;">
                                    <div style="font-size:0.75rem; font-weight:900; color:#2563eb; letter-spacing:0.12em;">INBOX CONSOLE</div>
                                    <div id="mail-badge" style="padding:0.34rem 0.72rem; border-radius:999px; background:rgba(37,99,235,0.12); color:#2563eb; font-size:0.75rem; font-weight:900;">대기 중</div>
                                </div>
                                <div style="border-radius:20px; background:#fff; border:1px solid rgba(37,99,235,0.12); padding:1rem; min-height:182px; box-shadow:inset 0 0 24px rgba(37,99,235,0.03);">
                                    <div id="mail-subject" style="font-size:1rem; font-weight:950; color:#0f172a; margin-bottom:0.4rem;">메일 분류 준비 완료</div>
                                    <div id="mail-from" style="font-size:0.82rem; font-weight:850; color:#2563eb; margin-bottom:0.75rem;">보낸 사람: 시스템</div>
                                    <div id="mail-note" style="font-size:0.9rem; line-height:1.7; color:#475569; font-weight:650;">게임을 시작하면 업무 메일처럼 보이는 카드가 나옵니다. 아래 세 버튼 중 맞는 분류를 눌러 점수를 쌓으세요.</div>
                                    <div style="display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:0.55rem; margin-top:1rem;">
                                        <div style="padding:0.7rem; border-radius:14px; background:#f8fafc;">
                                            <div style="font-size:0.68rem; color:#64748b; font-weight:800; margin-bottom:0.18rem;">최근 판정</div>
                                            <div id="mail-last-result" style="font-size:0.9rem; font-weight:850;">없음</div>
                                        </div>
                                        <div style="padding:0.7rem; border-radius:14px; background:#f8fafc;">
                                            <div style="font-size:0.68rem; color:#64748b; font-weight:800; margin-bottom:0.18rem;">현재 집중도</div>
                                            <div id="mail-focus" style="font-size:0.9rem; font-weight:850;">워밍업</div>
                                        </div>
                                        <div style="padding:0.7rem; border-radius:14px; background:#f8fafc;">
                                            <div style="font-size:0.68rem; color:#64748b; font-weight:800; margin-bottom:0.18rem;">분류 상태</div>
                                            <div id="mail-status-chip" style="font-size:0.9rem; font-weight:850;">대기</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:0.6rem; margin-top:0.95rem;">
                                <button id="mail-start-btn" class="btn-primary" style="height:58px; border:none; border-radius:18px; background:linear-gradient(135deg,#2563eb,#60a5fa); font-weight:900;">게임 시작</button>
                                <button class="btn-secondary mail-choice-btn" data-choice="urgent" style="height:58px; border-radius:18px; font-weight:850; border-color:#fecaca; color:#b91c1c;">긴급</button>
                                <button class="btn-secondary mail-choice-btn" data-choice="reference" style="height:58px; border-radius:18px; font-weight:850; border-color:#bfdbfe; color:#1d4ed8;">참고</button>
                                <button class="btn-secondary mail-choice-btn" data-choice="later" style="height:58px; border-radius:18px; font-weight:850; border-color:#d9f99d; color:#4d7c0f;">보류</button>
                            </div>
                            <div id="mail-game-status" style="margin-top:0.85rem; min-height:52px; border-radius:18px; background:#f8fafc; border:1px solid #e2e8f0; padding:0.9rem 1rem; font-size:0.9rem; line-height:1.6; color:#334155; font-weight:700;">메일 게임은 빠른 분류와 연속 정답이 핵심입니다. 속도가 붙을수록 점수도 빠르게 올라갑니다.</div>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; align-items:start;">
                    <div style="background:#ffffff; border:1px solid #dbece8; border-radius:28px; box-shadow:0 18px 34px rgba(15,23,42,0.06); padding:1rem 1.05rem;">
                        <div style="font-size:0.78rem; font-weight:900; color:#0f766e; letter-spacing:0.1em; margin-bottom:0.55rem;">HOW TO PLAY</div>
                        <div style="display:grid; gap:0.6rem;">
                            <div style="padding:0.85rem 0.9rem; border-radius:18px; background:rgba(15,118,110,0.06); font-size:0.88rem; color:#334155; font-weight:750;">1. <strong>업무창 위장하기</strong>는 경고 간격이 조금 더 길어졌고, 잘못 눌렀을 때 감점은 줄였습니다.</div>
                            <div style="padding:0.85rem 0.9rem; border-radius:18px; background:rgba(15,118,110,0.06); font-size:0.88rem; color:#334155; font-weight:750;">2. <strong>메일 분류하기</strong>는 속도보다 정확도가 우선이지만, 연속 정답이 이어지면 점수가 크게 붙습니다.</div>
                            <div style="padding:0.85rem 0.9rem; border-radius:18px; background:rgba(15,118,110,0.06); font-size:0.88rem; color:#334155; font-weight:750;">3. 비회원은 플레이만 가능하고, 회원은 게임별 최고점과 플레이 수가 저장됩니다.</div>
                            <div style="padding:0.85rem 0.9rem; border-radius:18px; background:rgba(15,118,110,0.06); font-size:0.88rem; color:#334155; font-weight:750;">4. 게임 종료 시 점수에 따라 포인트가 지급되며, 게임별 랭킹에 반영됩니다.</div>
                        </div>
                    </div>

                    <div style="background:#ffffff; border:1px solid #dbece8; border-radius:28px; box-shadow:0 18px 34px rgba(15,23,42,0.06); padding:1rem 1.05rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.7rem; margin-bottom:0.75rem;">
                            <div>
                                <div style="font-size:0.78rem; font-weight:900; color:#0f766e; letter-spacing:0.1em; margin-bottom:0.18rem;">CATEGORY CONTENTS</div>
                                <div style="font-size:1.02rem; font-weight:900; color:#0f172a;">월급 루팡 테스트도 같이 즐기기</div>
                            </div>
                            <button onclick="location.hash='#salary'" style="border:none; background:rgba(15,118,110,0.12); color:#0f766e; font-weight:850; border-radius:999px; padding:0.48rem 0.82rem; cursor:pointer;">카테고리 보기</button>
                        </div>
                        <div class="test-grid" style="display:grid; grid-template-columns:1fr; gap:0.8rem;">
                            ${tests.slice(0, 3).map((test) => renderTestCard(test)).join('')}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;

    const leaderboardData = {
        tabShift: tabShiftLeaders,
        inboxZero: inboxLeaders
    };
    let currentLeaderboardGame = 'tabShift';

    const leaderboardListEl = document.getElementById('salary-leaderboard-list');
    const boardButtons = {
        tabShift: document.getElementById('salary-board-tabShift'),
        inboxZero: document.getElementById('salary-board-inboxZero')
    };

    const refreshLeaderboard = (gameKey) => {
        currentLeaderboardGame = gameKey;
        leaderboardListEl.innerHTML = renderLeaderboardRows(leaderboardData[gameKey], gameKey);
        Object.entries(boardButtons).forEach(([key, button]) => {
            if (!button) return;
            const active = key === gameKey;
            const config = GAME_CONFIGS[key];
            button.style.background = active ? config.accent : `${config.accent}1a`;
            button.style.color = active ? '#fff' : config.accent;
        });
    };

    boardButtons.tabShift.onclick = () => refreshLeaderboard('tabShift');
    boardButtons.inboxZero.onclick = () => refreshLeaderboard('inboxZero');

    const tabState = {
        running: false,
        score: 0,
        timeLeft: 35,
        saves: 0,
        misses: 0,
        loafClicks: 0,
        activeAlert: false,
        timerId: null,
        alertTimeoutId: null,
        alertResolveId: null
    };

    const scoreEl = document.getElementById('salary-score');
    const timeEl = document.getElementById('salary-time');
    const savesEl = document.getElementById('salary-saves');
    const missesEl = document.getElementById('salary-misses');
    const statusEl = document.getElementById('salary-status');
    const screenTitleEl = document.getElementById('salary-app-title');
    const screenDescEl = document.getElementById('salary-app-desc');
    const openTabEl = document.getElementById('salary-open-tab');
    const alertTextEl = document.getElementById('salary-alert-text');
    const paceEl = document.getElementById('salary-pace');
    const modeBadgeEl = document.getElementById('salary-mode-badge');
    const overlayEl = document.getElementById('salary-overlay');
    const bestPillTabShiftEl = document.getElementById('salary-best-pill-tabShift');
    const loafBtn = document.getElementById('salary-loaf-btn');
    const workBtn = document.getElementById('salary-work-btn');
    const startBtn = document.getElementById('salary-start-btn');

    const tabPaceText = () => {
        if (tabState.score >= 620) return '전설 루팡';
        if (tabState.score >= 420) return '매우 능숙';
        if (tabState.score >= 240) return '슬슬 감 잡음';
        if (tabState.score >= 100) return '들키진 않음';
        return '워밍업';
    };

    const syncTabUi = () => {
        scoreEl.textContent = tabState.score.toLocaleString();
        timeEl.textContent = tabState.timeLeft.toString();
        savesEl.textContent = tabState.saves.toString();
        missesEl.textContent = tabState.misses.toString();
        paceEl.textContent = tabPaceText();
    };

    const clearTabAlertTimers = () => {
        if (tabState.alertTimeoutId) clearTimeout(tabState.alertTimeoutId);
        if (tabState.alertResolveId) clearTimeout(tabState.alertResolveId);
        tabState.alertTimeoutId = null;
        tabState.alertResolveId = null;
    };

    const setTabIdleScreen = (message) => {
        tabState.activeAlert = false;
        overlayEl.style.display = 'none';
        modeBadgeEl.textContent = tabState.running ? '딴짓 진행 중' : '대기 중';
        modeBadgeEl.style.background = 'rgba(45,212,191,0.18)';
        modeBadgeEl.style.color = '#5eead4';
        alertTextEl.textContent = '없음';
        screenTitleEl.textContent = tabState.running ? '새 탭을 열어 점수 쌓는 중' : '루팡 모드 준비 완료';
        screenDescEl.innerHTML = message;
    };

    const scheduleTabAlert = () => {
        clearTabAlertTimers();
        if (!tabState.running) return;
        const delay = 1800 + Math.floor(Math.random() * 1700);
        tabState.alertTimeoutId = setTimeout(() => {
            if (!tabState.running) return;
            tabState.activeAlert = true;
            overlayEl.style.display = 'flex';
            alertTextEl.textContent = '접근 중';
            modeBadgeEl.textContent = '경고';
            modeBadgeEl.style.background = 'rgba(254,202,202,0.24)';
            modeBadgeEl.style.color = '#fecaca';
            screenTitleEl.textContent = '상사 그림자 포착';
            screenDescEl.innerHTML = '지금 바로 <strong>업무 모드 전환</strong>을 눌러야 합니다. 늦으면 경고 누락으로 처리됩니다.';
            tabState.alertResolveId = setTimeout(() => {
                if (!tabState.running || !tabState.activeAlert) return;
                tabState.activeAlert = false;
                tabState.misses += 1;
                tabState.score = Math.max(0, tabState.score - 28);
                statusEl.innerHTML = `🚨 늦었습니다. 상사가 화면을 본 척하고 지나갔습니다. <strong>누락 ${tabState.misses}회</strong>`;
                syncTabUi();
                if (tabState.misses >= 3) {
                    finishTabGame('상사에게 세 번 들켜서 게임이 종료되었습니다.');
                    return;
                }
                setTabIdleScreen('위기는 넘겼지만 점수가 조금 깎였습니다. 다시 <strong>딴짓 탭 열기</strong>로 템포를 되찾으세요.');
                scheduleTabAlert();
            }, 1450);
        }, delay);
    };

    const finishTabGame = async (reason) => {
        tabState.running = false;
        clearTabAlertTimers();
        if (tabState.timerId) clearInterval(tabState.timerId);
        tabState.timerId = null;
        overlayEl.style.display = 'none';
        modeBadgeEl.textContent = '결과 집계 중';
        modeBadgeEl.style.background = 'rgba(255,255,255,0.12)';
        modeBadgeEl.style.color = '#fff';
        openTabEl.textContent = '결과 리포트';
        alertTextEl.textContent = '종료';
        screenTitleEl.textContent = '게임 종료';
        screenDescEl.innerHTML = `최종 점수 <strong>${tabState.score.toLocaleString()}</strong>, 위장 성공 <strong>${tabState.saves}회</strong>, 누락 <strong>${tabState.misses}회</strong>로 마무리됐습니다.`;
        loafBtn.disabled = true;
        workBtn.disabled = true;
        startBtn.disabled = false;
        startBtn.textContent = '다시 시작';
        syncTabUi();

        if (!UserState.user) {
            statusEl.innerHTML = `${reason} 비회원은 기록이 저장되지 않습니다. 로그인하면 최고점과 포인트를 받을 수 있습니다.`;
            return;
        }

        try {
            const result = await persistSalaryScore('tabShift', tabState.score, { totalSaved: tabState.saves });
            bestPillTabShiftEl.textContent = `BEST ${result.bestScore.toLocaleString()}`;
            statusEl.innerHTML = `${reason} <strong>${result.reward}P</strong>가 지급되었습니다.${result.isNewBest ? ` 새 최고점 <strong>${result.bestScore.toLocaleString()}</strong> 기록도 저장됐습니다.` : ''}`;
            leaderboardData.tabShift = await loadSalaryLeaderboard('tabShift');
            if (currentLeaderboardGame === 'tabShift') refreshLeaderboard('tabShift');
        } catch (error) {
            console.error('tabShift save failed', error);
            statusEl.textContent = `${reason} 점수 저장 중 오류가 발생했습니다.`;
        }
    };

    startBtn.onclick = () => {
        tabState.running = true;
        tabState.score = 0;
        tabState.timeLeft = 35;
        tabState.saves = 0;
        tabState.misses = 0;
        tabState.loafClicks = 0;
        tabState.activeAlert = false;
        clearTabAlertTimers();
        if (tabState.timerId) clearInterval(tabState.timerId);
        syncTabUi();
        startBtn.disabled = true;
        startBtn.textContent = '진행 중';
        loafBtn.disabled = false;
        workBtn.disabled = false;
        statusEl.textContent = '게임 시작. 경고가 없을 때는 딴짓 탭을 눌러 점수를 쌓고, 경고가 뜨면 바로 업무 모드로 전환하세요.';
        openTabEl.textContent = '업무 메인화면';
        setTabIdleScreen('아직 안전합니다. <strong>딴짓 탭 열기</strong>로 점수를 모으세요. 경고가 뜨면 바로 업무 모드로 숨겨야 합니다.');
        scheduleTabAlert();
        tabState.timerId = setInterval(() => {
            tabState.timeLeft -= 1;
            syncTabUi();
            if (tabState.timeLeft <= 0) finishTabGame('35초를 버텨냈습니다.');
        }, 1000);
    };

    loafBtn.onclick = () => {
        if (!tabState.running || tabState.activeAlert) {
            statusEl.textContent = tabState.activeAlert ? '지금은 경고 중입니다. 업무 모드 전환부터 하세요.' : '먼저 게임을 시작하세요.';
            return;
        }
        tabState.loafClicks += 1;
        tabState.score += 10;
        const currentTab = TAB_LABELS[tabState.loafClicks % TAB_LABELS.length];
        openTabEl.textContent = currentTab;
        screenTitleEl.textContent = '딴짓 탭 활성화';
        screenDescEl.innerHTML = `<strong>${currentTab}</strong>을(를) 보고 있는 척 즐기는 중입니다. 지금은 안전합니다. 하지만 방심하면 곧 경고가 올 수 있습니다.`;
        statusEl.innerHTML = `🫥 안전하게 딴짓 중입니다. 탭 <strong>${currentTab}</strong> 열람으로 점수 +10`;
        syncTabUi();
    };

    workBtn.onclick = () => {
        if (!tabState.running) {
            statusEl.textContent = '게임이 시작되면 업무 모드 전환 버튼이 활성화됩니다.';
            return;
        }
        if (!tabState.activeAlert) {
            tabState.score = Math.max(0, tabState.score - 5);
            statusEl.innerHTML = `😅 경고도 없는데 먼저 업무창을 열어버렸습니다. 괜히 수상해서 점수 -5`;
            openTabEl.textContent = '업무 문서';
            screenTitleEl.textContent = '업무창만 괜히 열림';
            screenDescEl.innerHTML = '타이밍은 조금 애매했지만 어쨌든 업무 문서는 떠 있습니다. 다시 템포를 조절해보세요.';
            syncTabUi();
            return;
        }
        tabState.activeAlert = false;
        clearTabAlertTimers();
        tabState.saves += 1;
        tabState.score += 55;
        openTabEl.textContent = '분기별 실적 정리안';
        statusEl.innerHTML = `🧾 위장 성공. 업무 모드로 잘 숨겼습니다. 점수 +55`;
        setTabIdleScreen('상사를 무사히 넘겼습니다. 지금이 다시 점수를 쌓을 타이밍입니다.');
        syncTabUi();
        scheduleTabAlert();
    };

    loafBtn.disabled = true;
    workBtn.disabled = true;

    const mailState = {
        running: false,
        score: 0,
        timeLeft: 25,
        streak: 0,
        wrong: 0,
        currentMail: null,
        timerId: null
    };

    const mailScoreEl = document.getElementById('mail-score');
    const mailTimeEl = document.getElementById('mail-time');
    const mailStreakEl = document.getElementById('mail-streak');
    const mailWrongEl = document.getElementById('mail-wrong');
    const mailSubjectEl = document.getElementById('mail-subject');
    const mailFromEl = document.getElementById('mail-from');
    const mailNoteEl = document.getElementById('mail-note');
    const mailLastResultEl = document.getElementById('mail-last-result');
    const mailFocusEl = document.getElementById('mail-focus');
    const mailStatusChipEl = document.getElementById('mail-status-chip');
    const mailBadgeEl = document.getElementById('mail-badge');
    const mailStatusEl = document.getElementById('mail-game-status');
    const mailStartBtn = document.getElementById('mail-start-btn');
    const mailBestPillEl = document.getElementById('salary-best-pill-inboxZero');
    const mailChoiceButtons = Array.from(document.querySelectorAll('.mail-choice-btn'));

    const nextMail = () => {
        const pool = MAIL_QUEUE.filter((mail) => mail.subject !== mailState.currentMail?.subject);
        mailState.currentMail = pool[Math.floor(Math.random() * pool.length)];
        mailSubjectEl.textContent = mailState.currentMail.subject;
        mailFromEl.textContent = `보낸 사람: ${mailState.currentMail.from}`;
        mailNoteEl.textContent = mailState.currentMail.note;
        mailStatusChipEl.textContent = '분류 대기';
        mailBadgeEl.textContent = '진행 중';
    };

    const mailFocusText = () => {
        if (mailState.streak >= 8) return '초집중';
        if (mailState.streak >= 5) return '매우 좋음';
        if (mailState.streak >= 3) return '안정적';
        return '워밍업';
    };

    const syncMailUi = () => {
        mailScoreEl.textContent = mailState.score.toLocaleString();
        mailTimeEl.textContent = mailState.timeLeft.toString();
        mailStreakEl.textContent = mailState.streak.toString();
        mailWrongEl.textContent = mailState.wrong.toString();
        mailFocusEl.textContent = mailFocusText();
    };

    const finishMailGame = async (reason) => {
        mailState.running = false;
        if (mailState.timerId) clearInterval(mailState.timerId);
        mailState.timerId = null;
        mailChoiceButtons.forEach((button) => { button.disabled = true; });
        mailStartBtn.disabled = false;
        mailStartBtn.textContent = '다시 시작';
        mailBadgeEl.textContent = '결과 집계 중';
        mailStatusChipEl.textContent = '종료';
        mailSubjectEl.textContent = '메일 분류 종료';
        mailFromEl.textContent = '보낸 사람: 시스템';
        mailNoteEl.innerHTML = `최종 점수 <strong>${mailState.score.toLocaleString()}</strong>, 연속 정답 <strong>${mailState.streak}</strong>, 오답 <strong>${mailState.wrong}</strong>로 마무리됐습니다.`;
        syncMailUi();

        if (!UserState.user) {
            mailStatusEl.innerHTML = `${reason} 비회원은 기록이 저장되지 않습니다. 로그인하면 최고점과 포인트를 받을 수 있습니다.`;
            return;
        }

        try {
            const result = await persistSalaryScore('inboxZero', mailState.score, { totalCorrect: Math.max(0, Math.floor(mailState.score / 12)) });
            mailBestPillEl.textContent = `BEST ${result.bestScore.toLocaleString()}`;
            mailStatusEl.innerHTML = `${reason} <strong>${result.reward}P</strong>가 지급되었습니다.${result.isNewBest ? ` 새 최고점 <strong>${result.bestScore.toLocaleString()}</strong> 기록도 저장됐습니다.` : ''}`;
            leaderboardData.inboxZero = await loadSalaryLeaderboard('inboxZero');
            if (currentLeaderboardGame === 'inboxZero') refreshLeaderboard('inboxZero');
        } catch (error) {
            console.error('inboxZero save failed', error);
            mailStatusEl.textContent = `${reason} 점수 저장 중 오류가 발생했습니다.`;
        }
    };

    mailStartBtn.onclick = () => {
        mailState.running = true;
        mailState.score = 0;
        mailState.timeLeft = 25;
        mailState.streak = 0;
        mailState.wrong = 0;
        mailStartBtn.disabled = true;
        mailStartBtn.textContent = '진행 중';
        mailChoiceButtons.forEach((button) => { button.disabled = false; });
        mailStatusEl.innerHTML = '메일이 도착했습니다. <strong>긴급</strong>, <strong>참고</strong>, <strong>보류</strong> 중 맞는 분류를 빠르게 눌러 점수를 쌓으세요.';
        syncMailUi();
        nextMail();
        if (mailState.timerId) clearInterval(mailState.timerId);
        mailState.timerId = setInterval(() => {
            mailState.timeLeft -= 1;
            syncMailUi();
            if (mailState.timeLeft <= 0) finishMailGame('25초 동안 메일 분류를 완료했습니다.');
        }, 1000);
    };

    mailChoiceButtons.forEach((button) => {
        button.disabled = true;
        button.onclick = () => {
            if (!mailState.running || !mailState.currentMail) return;
            const choice = button.dataset.choice;
            const correct = choice === mailState.currentMail.category;
            if (correct) {
                mailState.streak += 1;
                const gained = 14 + Math.min(16, mailState.streak * 2);
                mailState.score += gained;
                mailLastResultEl.textContent = `정답 +${gained}`;
                mailStatusChipEl.textContent = '정확';
                mailStatusEl.innerHTML = `📨 정확한 분류입니다. 연속 정답 <strong>${mailState.streak}</strong>로 점수 +${gained}`;
            } else {
                mailState.streak = 0;
                mailState.wrong += 1;
                mailState.score = Math.max(0, mailState.score - 10);
                mailLastResultEl.textContent = '오답 -10';
                mailStatusChipEl.textContent = '재분류 필요';
                mailStatusEl.innerHTML = `⚠️ 분류가 엇나갔습니다. 점수 -10, 현재 오답 <strong>${mailState.wrong}</strong>회`;
            }
            syncMailUi();
            nextMail();
        };
    });

    refreshLeaderboard('tabShift');
}
