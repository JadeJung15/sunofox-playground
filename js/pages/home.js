import { updateUI, UserState, addPoints } from '../auth.js?v=7.1.1';
import { db } from '../firebase-init.js?v=7.1.1';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=7.1.1';

const FOX_ADVICE = [
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

export const testLikesData = {};

export async function fetchAllLikes() {
    try {
        const snap = await getDocs(collection(db, "testStats"));
        snap.forEach(doc => { testLikesData[doc.id] = doc.data().likes || 0; });
    } catch (e) { console.error("Fetch likes failed:", e); }
}
window.fetchAllLikes = fetchAllLikes;

async function handleLike(testId) {
    if (!UserState.user) {
        alert("로그인이 필요합니다. 우측 상단의 로그인 버튼을 이용해 주세요.");
        return;
    }
    const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
    const likeKey = `liked_${testId}_${today}`;
    if (localStorage.getItem(likeKey)) {
        alert("오늘 이미 이 테스트에 하트를 누르셨습니다! ❤️");
        return;
    }
    try {
        const statsRef = doc(db, "testStats", testId);
        await setDoc(statsRef, { likes: increment(1) }, { merge: true });
        localStorage.setItem(likeKey, "true");
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5, '테스트 추천 보상');
        const counter = document.getElementById(`like-count-${testId}`);
        if (counter) {
            const formatEngUnit = (num) => {
                if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                return num.toString();
            };
            const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const playCount = (seed * 123) % 15000 + 5000; 
            const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
            counter.textContent = formatEngUnit(testLikesData[testId] + baseLikes);
        }
        alert("하트 보상 5P가 적립되었습니다! ❤️");
    } catch (e) { alert("좋아요 처리 중 오류가 발생했습니다."); }
}
window.handleLike = handleLike;

export function renderCategorySelection() {
    const app = document.getElementById('app');
    const catStyles = {
        personality: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
        face: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        fortune: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        fun: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'
    };

    app.innerHTML = `
        <div class="category-selection-page fade-in" style="width: 100%; max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
            <div style="text-align:center; margin-bottom:3rem;">
                <h2 style="font-size:2rem; font-weight:900; color:var(--text-main); letter-spacing:-0.03em;">원하는 분석 카테고리</h2>
                <p style="color:var(--text-sub); font-weight:600; margin-top:0.5rem;">당신을 위한 7단계 정밀 리포트</p>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:1.5rem;">
                ${['personality', 'face', 'fortune', 'fun'].map(id => {
                    const names = { personality:'성격 분석', face:'비주얼/얼굴', fortune:'오늘의 운세', fun:'재미/심리' };
                    const icons = { personality:'🧠', face:'✨', fortune:'🔮', fun:'🎨' };
                    return `
                        <div class="bento-card" onclick="location.hash='#${id}'" style="background:${catStyles[id]}; border-radius:32px; padding:2rem; cursor:pointer; border:1px solid rgba(0,0,0,0.03);">
                            <div style="font-size:3rem; margin-bottom:1.5rem;">${icons[id]}</div>
                            <h3 style="font-size:1.5rem; font-weight:900; color:#1e293b; margin-bottom:0.5rem;">${names[id]}</h3>
                            <span style="font-size:0.85rem; font-weight:800; color:var(--accent-color);">분석 리스트 보기 →</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

export async function renderHome(hash) {
    const app = document.getElementById('app');
    await fetchAllLikes();

    if (hash === '#home' || !hash) {
        const randomAdvice = FOX_ADVICE[Math.floor(Math.random() * FOX_ADVICE.length)];

        app.innerHTML = `
            <div class="dashboard fade-in" style="width: 100%; max-width: 1100px; margin: 0 auto; padding: 1rem 1.25rem 5rem; box-sizing: border-box;">
                
                <!-- 1. 퀵 액션 (스토리 스타일) -->
                <div style="display: flex; gap: 1.25rem; overflow-x: auto; padding: 1rem 0.25rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; margin-bottom: 1.5rem;">
                    ${[
                        { id: 'arcade', label: '오락실', icon: '🕹️', bg: 'linear-gradient(135deg, #10b981, #059669)' },
                        { id: 'ranking', label: '랭킹', icon: '🏆', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
                        { id: 'board', label: '게시판', icon: '💬', bg: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
                        { id: 'profile', label: '내 정보', icon: '👤', bg: '#1e293b' },
                        { id: 'guide', label: '가이드', icon: '📖', bg: '#94a3b8' }
                    ].map(item => `
                        <div onclick="location.hash='#${item.id}'" style="flex-shrink: 0; text-align: center; width: 72px; cursor: pointer;">
                            <div style="width: 64px; height: 64px; border-radius: 50%; background: ${item.bg}; padding: 2px; border: 2px solid #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">${item.icon}</div>
                            <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-main);">${item.label}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- 2. 메인 히어로 (중앙 대칭) -->
                <div style="display: flex; justify-content: center; width: 100%; margin-bottom: 3.5rem;">
                    <div class="hero-section" style="width: 100%; max-width: 500px; aspect-ratio: 1 / 1; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 48px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(30, 27, 75, 0.4); text-align: center; color: #fff;">
                        <div style="position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, var(--accent-color) 0%, transparent 40%); opacity: 0.4;"></div>
                        <div style="position: relative; z-index: 2;">
                            <div style="font-size: 4.5rem; margin-bottom: 0.5rem; animation: float 3s infinite;">🦊</div>
                            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 0.7rem 1.2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); margin-bottom: 1.5rem; font-weight: 700; font-size: 0.9rem; display: inline-block;">
                                "${randomAdvice}"
                            </div>
                            <h1 style="font-size: 2.4rem; font-weight: 900; line-height: 1.2; margin-bottom: 1.2rem; letter-spacing: -0.04em;">진짜 나를<br>만나는 7가지 질문</h1>
                            <button class="btn-primary" style="padding: 1.1rem 2.8rem; font-size: 1.1rem; border-radius: 24px; background: #fff; color: #1e1b4b; font-weight: 900; border: none; box-shadow: 0 15px 30px rgba(255,255,255,0.2);" onclick="location.hash='#7check'">테스트 시작 ➔</button>
                        </div>
                    </div>
                </div>

                <!-- 3. 실시간 인기 분석 (대칭 그리드) -->
                <div style="width: 100%; margin-bottom: 3.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 0 0.5rem;">
                        <h3 style="font-size: 1.4rem; font-weight: 900; color: var(--text-main);">🔥 지금 가장 핫한 분석</h3>
                        <span style="font-size: 0.9rem; font-weight: 800; color: var(--accent-color); cursor: pointer;" onclick="location.hash='#7check'">전체보기</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                        ${TESTS.slice(0, 4).map(t => renderTestCard(t)).join('')}
                    </div>
                </div>

                <!-- 4. 하단 벤토 그리드 -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; width: 100%;">
                    <div class="bento-card" onclick="location.hash='#arcade'" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; min-height: 180px; display: flex; flex-direction: column; justify-content: center;">
                        <h4 style="font-size: 1.5rem; font-weight: 900; color: #064e3b; margin-bottom: 0.5rem;">세븐 오락실</h4>
                        <p style="font-size: 0.95rem; font-weight: 600; color: #059669; margin-bottom: 1.5rem;">포인트 채굴과 미니게임</p>
                        <button style="background: #059669; color: #fff; border: none; padding: 8px 20px; border-radius: 12px; font-weight: 900; font-size: 0.85rem; width: fit-content;">입장하기</button>
                        <span style="position: absolute; bottom: -10px; right: -10px; font-size: 6rem; opacity: 0.15; transform: rotate(-15deg);">🎰</span>
                    </div>
                    <div class="bento-card" onclick="location.hash='#ranking'" style="background: #fff; border: 1px solid var(--border-color); min-height: 180px; display: flex; flex-direction: column; justify-content: center;">
                        <h4 style="font-size: 1.5rem; font-weight: 900; color: var(--text-main); margin-bottom: 0.5rem;">명예의 전당</h4>
                        <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-sub); margin-bottom: 1.5rem;">실시간 랭킹 순위 확인</p>
                        <button style="background: var(--text-main); color: #fff; border: none; padding: 8px 20px; border-radius: 12px; font-weight: 900; font-size: 0.85rem; width: fit-content;">랭킹보기</button>
                        <span style="position: absolute; bottom: -10px; right: -10px; font-size: 6rem; opacity: 0.05; transform: rotate(-15deg);">🏆</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        const filtered = TESTS.filter(t => t.category === window._currentFilter);
        app.innerHTML = `
            <div class="category-page fade-in" style="width: 100%; max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; padding: 0 0.5rem;">
                    <div>
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: var(--text-main); letter-spacing:-0.03em;">${window._currentFilter} 테스트</h2>
                        <p style="color:var(--text-sub); font-size:0.95rem; font-weight:600; margin-top:0.4rem;">총 ${filtered.length}개의 정밀 분석 리포트</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    ${filtered.map(t => renderTestCard(t)).join('')}
                </div>
            </div>
        `;
    }
    updateUI();
}

export function renderTestCard(t) {
    const formatEngUnit = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num.toString();
    };

    const actualLikes = testLikesData[t.id] || 0;
    const seed = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const playCount = (seed * 123) % 15000 + 5000; 
    const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
    const displayLikes = actualLikes + baseLikes;

    const themes = [
        { bg: '#f8fafc', text: '#0f172a', accent: '#4f46e5', border: 'rgba(0,0,0,0.05)' },
        { bg: '#f8fafc', text: '#0f172a', accent: '#059669', border: 'rgba(0,0,0,0.05)' },
        { bg: '#f8fafc', text: '#0f172a', accent: '#d97706', border: 'rgba(0,0,0,0.05)' },
        { bg: '#f8fafc', text: '#0f172a', accent: '#db2777', border: 'rgba(0,0,0,0.05)' }
    ];
    const theme = themes[seed % themes.length];

    return `
    <div class="test-card" onclick="location.hash='#test/${t.id}'" 
         style="background: #fff; border-radius: 28px; border: 1px solid ${theme.border}; display: flex; flex-direction: column; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(0,0,0,0.02); overflow: hidden;">
        <div style="padding: 1.75rem; flex-grow: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                <span style="font-size: 0.7rem; font-weight: 900; color: ${theme.accent}; background: ${theme.accent}15; padding: 4px 12px; border-radius: 50px; text-transform: uppercase;">
                    ${t.category}
                </span>
                <span style="font-size: 0.75rem; font-weight: 800; color: #64748b;">🔥 ${formatEngUnit(playCount)} Play</span>
            </div>
            <h3 style="font-size: 1.35rem; font-weight: 900; line-height: 1.4; color: #1e293b; margin-bottom: 0.7rem; word-break: keep-all;">${t.title}</h3>
            <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 500;">${t.desc}</p>
            <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 1.25rem; border-top: 1px solid #f1f5f9;">
                <div onclick="event.stopPropagation(); handleLike('${t.id}')" style="display: flex; align-items: center; gap: 6px; color: #64748b; font-weight: 800; font-size: 0.85rem;">
                    <span style="font-size: 1.1rem; color: #f43f5e;">❤️</span> <span id="like-count-${t.id}">${formatEngUnit(displayLikes)}</span>
                </div>
                <span style="color: ${theme.accent}; font-weight: 900; font-size: 0.9rem;">시작하기 ➔</span>
            </div>
        </div>
    </div>`;
}
