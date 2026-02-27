import { updateUI, UserState, addPoints } from '../auth.js?v=7.1.1';
import { db } from '../firebase-init.js?v=7.1.1';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=7.1.1';

const FOX_ADVICE = [
    "오늘 하루도 당신은 충분히 빛나요! ✨",
    "오른쪽으로 걸어가면 뜻밖의 행운이 있을지도? 🍀",
    "지금 테스트를 하면 마음이 한결 가벼워질 거예요. 🧠",
    "지칠 땐 오락실에서 한 판 쉬어가는 건 어때요? 🎰",
    "맛있는 걸 먹으면 운세가 2배로 좋아질 거예요! 🍰",
    "누군가 당신을 생각하고 있는 따뜻한 날이네요. 💌",
    "오늘은 새로운 도전을 시작하기에 완벽한 날입니다! 🚀",
    "가끔은 아무것도 하지 않는 게 최고의 휴식이에요. 💤",
    "당신의 매력을 곧 발견하게 될 거예요! 💎"
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
        alert("로그인이 필요합니다. 🔑");
        return;
    }
    const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
    const likeKey = `liked_${testId}_${today}`;
    if (localStorage.getItem(likeKey)) {
        alert("오늘 이미 하트를 누르셨습니다! ❤️");
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
            const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const playCount = (seed * 123) % 15000 + 5000; 
            const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
            counter.textContent = (testLikesData[testId] + baseLikes).toLocaleString();
        }
        alert("감사합니다! 5P가 적립되었습니다. ❤️");
    } catch (e) { console.error(e); }
}
window.handleLike = handleLike;

export function renderCategorySelection() {
    const app = document.getElementById('app');
    const categories = [
        { id: 'personality', name: '성격 분석', icon: '🧠', bg: '#eef2ff', text: '#4338ca', desc: '내면의 심리 분석' },
        { id: 'face', name: '비주얼/얼굴', icon: '✨', bg: '#fff1f2', text: '#e11d48', desc: '매력 포인트 진단' },
        { id: 'fortune', name: '오늘의 운세', icon: '🔮', bg: '#fffbeb', text: '#d97706', desc: '운명과 행운 확인' },
        { id: 'fun', name: '재미/심리', icon: '🎨', bg: '#f5f3ff', text: '#7c3aed', desc: '소소한 취향 발견' }
    ];

    app.innerHTML = `
        <div class="category-selection-page fade-in" style="max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 6rem;">
            <div style="margin-bottom: 3rem; text-align: center;">
                <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--text-main); letter-spacing: -0.04em;">카테고리 선택</h2>
                <p style="color: var(--text-sub); font-weight: 600; margin-top: 0.5rem;">당신을 위한 정밀 분석 리포트</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
                ${categories.map(cat => `
                    <div onclick="location.hash='#${cat.id}'" style="background: ${cat.bg}; border-radius: 32px; padding: 2.5rem 2rem; cursor: pointer; border: 1px solid rgba(0,0,0,0.03); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(0,0,0,0.02); text-align: center;">
                        <div style="font-size: 3.5rem; margin-bottom: 1.5rem;">${cat.icon}</div>
                        <h3 style="font-size: 1.6rem; font-weight: 900; color: var(--text-main); margin-bottom: 0.6rem;">${cat.name}</h3>
                        <p style="font-size: 0.95rem; color: var(--text-sub); font-weight: 600; margin-bottom: 2rem;">${cat.desc}</p>
                        <span style="font-size: 0.9rem; font-weight: 800; color: ${cat.text}; background: #fff; padding: 10px 20px; border-radius: 50px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">리포트 보기 →</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

export async function renderHome(hash) {
    const app = document.getElementById('app');
    await fetchAllLikes();

    if (hash === '#home' || !hash) {
        const randomAdvice = FOX_ADVICE[Math.floor(Math.random() * FOX_ADVICE.length)];
        const userName = UserState.user ? UserState.data?.nickname || '사용자' : '방문자';

        app.innerHTML = `
            <div class="dashboard fade-in" style="max-width: 1100px; margin: 0 auto; padding: 1rem 1.25rem 6rem; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;">
                
                <!-- 1. 퀵 메뉴 (대칭형 상단 배치) -->
                <div style="display: flex; justify-content: center; gap: 1rem; width: 100%; margin-bottom: 2.5rem; overflow-x: auto; padding: 0.5rem; scrollbar-width: none; -webkit-overflow-scrolling: touch;">
                    ${[
                        { id: 'arcade', label: '오락실', icon: '🕹️' },
                        { id: 'ranking', label: '랭킹', icon: '🏆' },
                        { id: 'board', label: '게시판', icon: '💬' },
                        { id: 'profile', label: '내 정보', icon: '👤' }
                    ].map(item => `
                        <div onclick="location.hash='#${item.id}'" style="flex: 1; min-width: 75px; max-width: 90px; text-align: center; cursor: pointer; transition: transform 0.2s;">
                            <div style="width: 64px; height: 64px; border-radius: 50%; background: #fff; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">${item.icon}</div>
                            <span style="font-size: 0.8rem; font-weight: 800; color: var(--text-main);">${item.label}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- 2. 메인 배너 (1:1 반응형) -->
                <div style="display: flex; justify-content: center; width: 100%; margin-bottom: 4rem;">
                    <div class="hero-section" style="width: 100%; max-width: 450px; aspect-ratio: 1 / 1; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 40px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; box-shadow: var(--shadow-premium); text-align: center; color: #fff; box-sizing: border-box;">
                        <div style="position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, var(--accent-color) 0%, transparent 50%); opacity: 0.4;"></div>
                        <div style="position: relative; z-index: 2;">
                            <div style="background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); padding: 0.8rem 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); margin-bottom: 2rem; font-weight: 700; font-size: clamp(0.85rem, 3.5vw, 1rem); display: inline-block; max-width: 90%; line-height: 1.5;">
                                "${randomAdvice}"
                            </div>
                            <h1 style="font-size: clamp(2rem, 9vw, 2.6rem); font-weight: 900; line-height: 1.2; margin-bottom: 1.5rem; letter-spacing: -0.04em;">진짜 당신을<br>마주할 시간</h1>
                            <button class="btn-primary" style="padding: 1.1rem 3rem; font-size: clamp(1rem, 4vw, 1.15rem); border-radius: 24px; background: #fff; color: #1e1b4b; font-weight: 900; border: none; box-shadow: 0 15px 30px rgba(255,255,255,0.2);" onclick="location.hash='#7check'">테스트 시작 ➔</button>
                        </div>
                    </div>
                </div>

                <!-- 3. 테스트 목록 (깔끔한 화이트 카드 복구) -->
                <div style="width: 100%; margin-bottom: 4rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem; padding: 0 0.5rem;">
                        <h3 style="font-size: 1.5rem; font-weight: 900; color: var(--text-main); display: flex; align-items: center; gap: 10px;">🔥 지금 핫한 분석</h3>
                        <span style="font-size: 0.95rem; font-weight: 800; color: var(--accent-color); cursor: pointer;" onclick="location.hash='#7check'">전체보기 ➔</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; width: 100%;">
                        ${TESTS.slice(0, 4).map(t => renderTestCard(t)).join('')}
                    </div>
                </div>

                <!-- 4. 하단 벤토 섹션 -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; width: 100%;">
                    <div onclick="location.hash='#arcade'" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 36px; padding: 2.2rem; color: #fff; position: relative; overflow: hidden; min-height: 200px; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 15px 30px rgba(16, 185, 129, 0.1); cursor: pointer;">
                        <h4 style="font-size: 1.6rem; font-weight: 900; color: #064e3b; margin-bottom: 0.6rem; position: relative; z-index: 2;">세븐 오락실</h4>
                        <p style="font-size: 1rem; font-weight: 600; color: #059669; margin-bottom: 1.8rem; position: relative; z-index: 2;">포인트를 모아 펫을 입양하세요.</p>
                        <button style="background: #059669; color: #fff; border: none; padding: 10px 22px; border-radius: 14px; font-weight: 900; font-size: 0.9rem; width: fit-content; position: relative; z-index: 2;">입장하기</button>
                        <span style="position: absolute; bottom: -15px; right: -15px; font-size: 7.5rem; opacity: 0.15; transform: rotate(-15deg); pointer-events: none;">🎰</span>
                    </div>
                    <div onclick="location.hash='#ranking'" style="background: #fff; border-radius: 36px; padding: 2.2rem; border: 1px solid var(--border-color); position: relative; overflow: hidden; min-height: 200px; display: flex; flex-direction: column; justify-content: center; box-shadow: var(--shadow-premium); cursor: pointer;">
                        <h4 style="font-size: 1.6rem; font-weight: 900; color: var(--text-main); margin-bottom: 0.6rem; position: relative; z-index: 2;">명예의 전당</h4>
                        <p style="font-size: 1rem; font-weight: 600; color: var(--text-sub); margin-bottom: 1.8rem; position: relative; z-index: 2;">최고의 분석가 순위 확인</p>
                        <button style="background: var(--text-main); color: #fff; border: none; padding: 10px 22px; border-radius: 14px; font-weight: 900; font-size: 0.9rem; width: fit-content; position: relative; z-index: 2;">랭킹보기</button>
                        <span style="position: absolute; bottom: -15px; right: -15px; font-size: 7.5rem; opacity: 0.05; transform: rotate(-15deg); pointer-events: none;">🏆</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        const filtered = TESTS.filter(t => t.category === window._currentFilter);
        app.innerHTML = `
            <div class="category-page fade-in" style="max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 6rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; padding: 0 0.5rem;">
                    <div>
                        <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--text-main); letter-spacing: -0.04em;">${window._currentFilter} 분석</h2>
                        <p style="color: var(--text-sub); font-size: 1.05rem; font-weight: 600; margin-top: 0.5rem;">총 ${filtered.length}개의 리포트가 준비되어 있습니다.</p>
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

    return `
    <div class="test-card" onclick="location.hash='#test/${t.id}'" 
         style="background: #fff; border-radius: 28px; border: 1px solid var(--border-color); display: flex; flex-direction: column; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--shadow-sm); overflow: hidden;">
        <div style="padding: 1.75rem; flex-grow: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                <span style="font-size: 0.7rem; font-weight: 900; color: var(--accent-color); background: var(--accent-soft); padding: 4px 12px; border-radius: 50px; text-transform: uppercase;">
                    ${t.category}
                </span>
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-sub);">🔥 ${formatEngUnit(playCount)} Play</span>
            </div>
            <h3 style="font-size: 1.4rem; font-weight: 900; line-height: 1.4; color: var(--text-main); margin-bottom: 0.7rem; word-break: keep-all;">${t.title}</h3>
            <p style="font-size: 0.95rem; color: var(--text-sub); line-height: 1.6; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 500;">${t.desc}</p>
            <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 1.25rem; border-top: 1px solid var(--border-color);">
                <div onclick="event.stopPropagation(); handleLike('${t.id}')" style="display: flex; align-items: center; gap: 6px; color: var(--text-sub); font-weight: 800; font-size: 0.85rem; background: var(--bg-color); padding: 8px 16px; border-radius: 50px;">
                    <span style="font-size: 1.1rem; color: #f43f5e;">❤️</span> <span id="like-count-${t.id}">${formatEngUnit(displayLikes)}</span>
                </div>
                <span style="color: var(--accent-color); font-weight: 900; font-size: 0.9rem;">시작하기 ➔</span>
            </div>
        </div>
    </div>`;
}
