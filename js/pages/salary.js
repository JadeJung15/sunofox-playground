import { UserState, addPoints } from '../auth.js?v=8.4.0';
import { db } from '../firebase-init.js?v=8.4.0';
import { collection, doc, getDocs, limit, orderBy, query, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.4.0';
import { renderTestCard } from './home.js?v=8.4.0';

const ADMIN_UID = '6LVa2hs5ICSi4cgNjRBAx3dA2In2';
const GAME_KEY = 'tabShift';
const GAME_FIELD = 'salaryGames.tabShift';

function getSalaryTests() {
    return TESTS.filter((test) => test.category === '월급 루팡').reverse();
}

function getPersonalBest() {
    return UserState.data?.salaryGames?.tabShift?.bestScore || 0;
}

function getRewardForScore(score) {
    return Math.max(10, Math.min(90, Math.floor(score / 14)));
}

async function loadSalaryLeaderboard() {
    try {
        const snap = await getDocs(query(collection(db, 'users'), orderBy(`${GAME_FIELD}.bestScore`, 'desc'), limit(10)));
        return snap.docs
            .filter((entry) => entry.id !== ADMIN_UID)
            .map((entry) => ({ id: entry.id, ...entry.data() }))
            .filter((user) => (user.salaryGames?.tabShift?.bestScore || 0) > 0)
            .slice(0, 10);
    } catch (error) {
        console.error('salary leaderboard load failed', error);
        return [];
    }
}

function renderLeaderboardRows(users) {
    if (!users.length) {
        return `<div style="padding:1.25rem; text-align:center; color:var(--text-sub); font-weight:700;">첫 기록의 주인공이 아직 없습니다.</div>`;
    }

    return users.map((user, index) => {
        const bestScore = user.salaryGames?.tabShift?.bestScore || 0;
        const plays = user.salaryGames?.tabShift?.plays || 0;
        const medal = ['🥇', '🥈', '🥉'][index] || '🖥️';
        return `
            <div style="display:grid; grid-template-columns:auto auto 1fr auto; align-items:center; gap:0.8rem; padding:0.9rem 1rem; border-radius:18px; background:${index < 3 ? 'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(20,184,166,0.04))' : 'rgba(255,255,255,0.7)'}; border:1px solid rgba(15,118,110,0.12);">
                <div style="font-size:1.05rem; font-weight:900; color:#0f766e; width:22px; text-align:center;">${index + 1}</div>
                <div style="width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid rgba(15,118,110,0.15); font-size:1.45rem;">${user.emoji || medal}</div>
                <div style="min-width:0;">
                    <div style="font-size:0.95rem; font-weight:850; color:#0f172a; display:flex; align-items:center; gap:0.4rem; min-width:0;">
                        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.nickname || '익명'}</span>
                        ${index < 3 ? `<span style="font-size:0.82rem;">${medal}</span>` : ''}
                    </div>
                    <div style="font-size:0.77rem; color:var(--text-sub); font-weight:700;">플레이 ${plays.toLocaleString()}회</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.02rem; font-weight:950; color:#0f766e;">${bestScore.toLocaleString()}</div>
                    <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800;">BEST SCORE</div>
                </div>
            </div>
        `;
    }).join('');
}

export async function renderSalaryGame() {
    const app = document.getElementById('app');
    const tests = getSalaryTests();
    const leaderboard = await loadSalaryLeaderboard();
    const isLoggedIn = !!UserState.user;
    const personalBest = getPersonalBest();

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
                            <h2 style="font-size:clamp(2rem, 6vw, 3rem); line-height:1.04; letter-spacing:-0.05em; font-weight:950; margin:0 0 0.85rem;">상사 오기 전<br>업무창 위장하기</h2>
                            <p style="font-size:0.98rem; line-height:1.72; color:rgba(240,253,250,0.92); font-weight:650; max-width:95%;">딴짓 탭으로 점수를 쌓다가, 경고가 뜨면 즉시 업무 모드로 전환하세요. 비회원은 플레이만 가능하고, 회원은 최고점이 저장되고 포인트도 획득합니다.</p>
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:0.55rem; margin-top:1.2rem;">
                            <span style="padding:0.52rem 0.82rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); font-size:0.77rem; font-weight:850;">무음 플레이</span>
                            <span style="padding:0.52rem 0.82rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); font-size:0.77rem; font-weight:850;">PC 최적화</span>
                            <span style="padding:0.52rem 0.82rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); font-size:0.77rem; font-weight:850;">회원 포인트 지급</span>
                        </div>
                    </div>

                    <div style="display:grid; gap:0.8rem; align-content:start;">
                        <div style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.16); border-radius:26px; padding:1rem 1.05rem; backdrop-filter:blur(10px);">
                            <div style="font-size:0.75rem; font-weight:900; letter-spacing:0.1em; color:rgba(255,255,255,0.7); margin-bottom:0.55rem;">PLAYER STATUS</div>
                            <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:0.7rem;">
                                <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.12);">
                                    <div style="font-size:0.74rem; font-weight:800; color:rgba(255,255,255,0.72); margin-bottom:0.3rem;">내 최고점</div>
                                    <div style="font-size:1.4rem; font-weight:950;">${personalBest.toLocaleString()}</div>
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
                                    <div style="font-size:1.05rem; font-weight:900;">상사 오기 전 위장하기 TOP 10</div>
                                </div>
                                <button onclick="location.hash='#ranking'" style="border:none; background:rgba(15,118,110,0.12); color:#0f766e; font-weight:850; border-radius:999px; padding:0.5rem 0.8rem; cursor:pointer;">전체 랭킹</button>
                            </div>
                            <div id="salary-leaderboard-list" style="display:grid; gap:0.65rem;">
                                ${renderLeaderboardRows(leaderboard)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1rem; align-items:start; margin-bottom:1.6rem;">
                <div style="background:#ffffff; border:1px solid #dbece8; border-radius:30px; box-shadow:0 18px 34px rgba(15,23,42,0.06); overflow:hidden;">
                    <div style="padding:1.1rem 1.1rem 0.9rem; background:linear-gradient(180deg, rgba(15,118,110,0.08), rgba(15,118,110,0));">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.6rem; margin-bottom:0.7rem;">
                            <div style="font-size:0.78rem; font-weight:900; color:#0f766e; letter-spacing:0.1em;">GAME CONSOLE</div>
                            <div id="salary-best-pill" style="padding:0.34rem 0.7rem; border-radius:999px; background:rgba(15,118,110,0.1); color:#0f766e; font-size:0.76rem; font-weight:900;">BEST ${personalBest.toLocaleString()}</div>
                        </div>
                        <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:0.55rem;">
                            <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">점수</div>
                                <div id="salary-score" style="font-size:1.25rem; font-weight:950; color:#0f172a;">0</div>
                            </div>
                            <div style="padding:0.8rem; background:#f8fafc; border-radius:18px; text-align:center;">
                                <div style="font-size:0.72rem; color:var(--text-sub); font-weight:800; margin-bottom:0.22rem;">남은 시간</div>
                                <div id="salary-time" style="font-size:1.25rem; font-weight:950; color:#0f172a;">30</div>
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
                            <div id="salary-screen-main" style="border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); padding:1rem; min-height:180px; display:flex; flex-direction:column; justify-content:space-between;">
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
                        <div id="salary-status" style="margin-top:0.85rem; min-height:52px; border-radius:18px; background:#f8fafc; border:1px solid #e2e8f0; padding:0.9rem 1rem; font-size:0.9rem; line-height:1.6; color:#334155; font-weight:700;">게임 시작을 누르면 30초 동안 회사에서 딴짓하다 들키지 않는 생존 게임이 시작됩니다.</div>
                    </div>
                </div>

                <div style="display:grid; gap:1rem;">
                    <div style="background:#ffffff; border:1px solid #dbece8; border-radius:28px; box-shadow:0 18px 34px rgba(15,23,42,0.06); padding:1rem 1.05rem;">
                        <div style="font-size:0.78rem; font-weight:900; color:#0f766e; letter-spacing:0.1em; margin-bottom:0.55rem;">HOW TO PLAY</div>
                        <div style="display:grid; gap:0.6rem;">
                            <div style="padding:0.85rem 0.9rem; border-radius:18px; background:rgba(15,118,110,0.06); font-size:0.88rem; color:#334155; font-weight:750;">1. <strong>딴짓 탭 열기</strong>로 점수를 쌓습니다.</div>
                            <div style="padding:0.85rem 0.9rem; border-radius:18px; background:rgba(15,118,110,0.06); font-size:0.88rem; color:#334155; font-weight:750;">2. 빨간 경고가 뜨면 바로 <strong>업무 모드 전환</strong>을 눌러 숨깁니다.</div>
                            <div style="padding:0.85rem 0.9rem; border-radius:18px; background:rgba(15,118,110,0.06); font-size:0.88rem; color:#334155; font-weight:750;">3. 성공할수록 점수가 커지고, 누락 3회면 즉시 게임 종료입니다.</div>
                            <div style="padding:0.85rem 0.9rem; border-radius:18px; background:rgba(15,118,110,0.06); font-size:0.88rem; color:#334155; font-weight:750;">4. 회원은 최고점 저장 + 포인트 획득, 비회원은 체험만 가능합니다.</div>
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

    const state = {
        running: false,
        score: 0,
        timeLeft: 30,
        saves: 0,
        misses: 0,
        loafClicks: 0,
        activeAlert: false,
        timerId: null,
        alertTimeoutId: null,
        alertResolveId: null
    };

    const TAB_LABELS = [
        '커뮤니티 후기 모음',
        '퇴근 후 저녁 메뉴 조합기',
        '회의 중 멍때리기 시뮬레이터',
        '월급 루팡 밈 저장소',
        '아무도 모를 새 창',
        '직장인 생존 가이드'
    ];

    const paceText = () => {
        if (state.score >= 500) return '전설 루팡';
        if (state.score >= 320) return '매우 능숙';
        if (state.score >= 180) return '슬슬 감 잡음';
        if (state.score >= 80) return '들키진 않음';
        return '워밍업';
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
    const bestPillEl = document.getElementById('salary-best-pill');
    const loafBtn = document.getElementById('salary-loaf-btn');
    const workBtn = document.getElementById('salary-work-btn');
    const startBtn = document.getElementById('salary-start-btn');

    const syncUi = () => {
        scoreEl.textContent = state.score.toLocaleString();
        timeEl.textContent = state.timeLeft.toString();
        savesEl.textContent = state.saves.toString();
        missesEl.textContent = state.misses.toString();
        paceEl.textContent = paceText();
    };

    const clearAlertTimers = () => {
        if (state.alertTimeoutId) clearTimeout(state.alertTimeoutId);
        if (state.alertResolveId) clearTimeout(state.alertResolveId);
        state.alertTimeoutId = null;
        state.alertResolveId = null;
    };

    const setIdleScreen = (message) => {
        state.activeAlert = false;
        overlayEl.style.display = 'none';
        modeBadgeEl.textContent = state.running ? '딴짓 진행 중' : '대기 중';
        modeBadgeEl.style.background = 'rgba(45,212,191,0.18)';
        modeBadgeEl.style.color = '#5eead4';
        alertTextEl.textContent = '없음';
        screenTitleEl.textContent = state.running ? '새 탭을 열어 점수 쌓는 중' : '루팡 모드 준비 완료';
        screenDescEl.innerHTML = message;
    };

    const scheduleAlert = () => {
        clearAlertTimers();
        if (!state.running) return;
        const delay = 1100 + Math.floor(Math.random() * 1900);
        state.alertTimeoutId = setTimeout(() => {
            if (!state.running) return;
            state.activeAlert = true;
            overlayEl.style.display = 'flex';
            alertTextEl.textContent = '접근 중';
            modeBadgeEl.textContent = '경고';
            modeBadgeEl.style.background = 'rgba(254,202,202,0.24)';
            modeBadgeEl.style.color = '#fecaca';
            screenTitleEl.textContent = '상사 그림자 포착';
            screenDescEl.innerHTML = '지금 바로 <strong>업무 모드 전환</strong>을 눌러야 합니다. 늦으면 경고 누락으로 처리됩니다.';
            state.alertResolveId = setTimeout(() => {
                if (!state.running || !state.activeAlert) return;
                state.activeAlert = false;
                state.misses += 1;
                state.score = Math.max(0, state.score - 35);
                statusEl.innerHTML = `🚨 늦었습니다. 상사가 화면을 본 척하고 지나갔습니다. <strong>누락 ${state.misses}회</strong>`;
                syncUi();
                if (state.misses >= 3) {
                    finishGame('상사에게 세 번 들켜서 게임이 종료되었습니다.');
                    return;
                }
                setIdleScreen('위기는 넘겼지만 점수가 깎였습니다. 다시 <strong>딴짓 탭 열기</strong>로 템포를 되찾으세요.');
                scheduleAlert();
            }, 1200);
        }, delay);
    };

    const finishGame = async (reason) => {
        state.running = false;
        clearAlertTimers();
        if (state.timerId) clearInterval(state.timerId);
        state.timerId = null;
        overlayEl.style.display = 'none';
        modeBadgeEl.textContent = '결과 집계 중';
        modeBadgeEl.style.background = 'rgba(255,255,255,0.12)';
        modeBadgeEl.style.color = '#fff';
        openTabEl.textContent = '결과 리포트';
        alertTextEl.textContent = '종료';
        screenTitleEl.textContent = '게임 종료';
        screenDescEl.innerHTML = `최종 점수 <strong>${state.score.toLocaleString()}</strong>, 위장 성공 <strong>${state.saves}회</strong>, 누락 <strong>${state.misses}회</strong>로 마무리됐습니다.`;
        loafBtn.disabled = true;
        workBtn.disabled = true;
        startBtn.disabled = false;
        startBtn.textContent = '다시 시작';
        syncUi();

        if (!UserState.user) {
            statusEl.innerHTML = `${reason} 비회원은 기록이 저장되지 않습니다. 로그인하면 최고점과 포인트를 받을 수 있습니다.`;
            return;
        }

        const reward = getRewardForScore(state.score);
        const previousBest = getPersonalBest();
        const nextBest = Math.max(previousBest, state.score);
        const isNewBest = nextBest > previousBest;

        try {
            await updateDoc(doc(db, 'users', UserState.user.uid), {
                [`${GAME_FIELD}.bestScore`]: nextBest,
                [`${GAME_FIELD}.lastScore`]: state.score,
                [`${GAME_FIELD}.plays`]: increment(1),
                [`${GAME_FIELD}.totalSaved`]: increment(state.saves),
                [`${GAME_FIELD}.totalScore`]: increment(state.score)
            });
            if (!UserState.data.salaryGames) UserState.data.salaryGames = {};
            if (!UserState.data.salaryGames[GAME_KEY]) UserState.data.salaryGames[GAME_KEY] = { bestScore: 0, plays: 0, totalSaved: 0, totalScore: 0 };
            UserState.data.salaryGames[GAME_KEY].bestScore = nextBest;
            UserState.data.salaryGames[GAME_KEY].lastScore = state.score;
            UserState.data.salaryGames[GAME_KEY].plays = (UserState.data.salaryGames[GAME_KEY].plays || 0) + 1;
            UserState.data.salaryGames[GAME_KEY].totalSaved = (UserState.data.salaryGames[GAME_KEY].totalSaved || 0) + state.saves;
            UserState.data.salaryGames[GAME_KEY].totalScore = (UserState.data.salaryGames[GAME_KEY].totalScore || 0) + state.score;
            bestPillEl.textContent = `BEST ${nextBest.toLocaleString()}`;
            await addPoints(reward, '월급 루팡 게임 보상');
            updateUI();
        } catch (error) {
            console.error('salary game save failed', error);
        }

        statusEl.innerHTML = `${reason} <strong>${reward}P</strong>가 지급되었습니다.${isNewBest ? ` 새 최고점 <strong>${nextBest.toLocaleString()}</strong> 기록도 저장됐습니다.` : ''}`;

        const nextLeaderboard = await loadSalaryLeaderboard();
        const list = document.getElementById('salary-leaderboard-list');
        if (list) list.innerHTML = renderLeaderboardRows(nextLeaderboard);
    };

    const startGame = () => {
        state.running = true;
        state.score = 0;
        state.timeLeft = 30;
        state.saves = 0;
        state.misses = 0;
        state.loafClicks = 0;
        state.activeAlert = false;
        clearAlertTimers();
        if (state.timerId) clearInterval(state.timerId);
        syncUi();
        startBtn.disabled = true;
        loafBtn.disabled = false;
        workBtn.disabled = false;
        statusEl.textContent = '게임 시작. 경고가 없을 때는 딴짓 탭을 눌러 점수를 쌓고, 경고가 뜨면 바로 업무 모드로 전환하세요.';
        openTabEl.textContent = '업무 메인화면';
        setIdleScreen('아직 안전합니다. <strong>딴짓 탭 열기</strong>로 점수를 모으세요. 경고가 뜨면 바로 업무 모드로 숨겨야 합니다.');
        scheduleAlert();
        state.timerId = setInterval(() => {
            state.timeLeft -= 1;
            syncUi();
            if (state.timeLeft <= 0) finishGame('30초를 버텨냈습니다.');
        }, 1000);
    };

    loafBtn.onclick = () => {
        if (!state.running || state.activeAlert) {
            statusEl.textContent = state.activeAlert ? '지금은 경고 중입니다. 업무 모드 전환부터 하세요.' : '먼저 게임을 시작하세요.';
            return;
        }
        state.loafClicks += 1;
        state.score += 12;
        const currentTab = TAB_LABELS[state.loafClicks % TAB_LABELS.length];
        openTabEl.textContent = currentTab;
        screenTitleEl.textContent = '딴짓 탭 활성화';
        screenDescEl.innerHTML = `<strong>${currentTab}</strong>을(를) 보고 있는 척 즐기는 중입니다. 지금은 안전합니다. 하지만 방심하면 곧 경고가 올 수 있습니다.`;
        statusEl.innerHTML = `🫥 안전하게 딴짓 중입니다. 탭 <strong>${currentTab}</strong> 열람으로 점수 +12`;
        syncUi();
    };

    workBtn.onclick = () => {
        if (!state.running) {
            statusEl.textContent = '게임이 시작되면 업무 모드 전환 버튼이 활성화됩니다.';
            return;
        }
        if (!state.activeAlert) {
            state.score = Math.max(0, state.score - 8);
            statusEl.innerHTML = `😅 경고도 없는데 먼저 업무창을 열어버렸습니다. 괜히 수상해서 점수 -8`;
            openTabEl.textContent = '업무 문서';
            screenTitleEl.textContent = '업무창만 괜히 열림';
            screenDescEl.innerHTML = '타이밍은 조금 애매했지만 어쨌든 업무 문서는 떠 있습니다. 다시 템포를 조절해보세요.';
            syncUi();
            return;
        }
        state.activeAlert = false;
        clearAlertTimers();
        state.saves += 1;
        state.score += 48;
        openTabEl.textContent = '분기별 실적 정리안';
        statusEl.innerHTML = `🧾 위장 성공. 업무 모드로 잘 숨겼습니다. 점수 +48`;
        setIdleScreen('상사를 무사히 넘겼습니다. 지금이 다시 점수를 쌓을 타이밍입니다.');
        syncUi();
        scheduleAlert();
    };

    startBtn.onclick = startGame;
    loafBtn.disabled = true;
    workBtn.disabled = true;
}
