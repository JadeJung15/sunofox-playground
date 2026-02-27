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
    if (!UserState.user) { alert("로그인이 필요합니다! 👋"); return; }
    const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
    const likeKey = `liked_${testId}_${today}`;
    if (localStorage.getItem(likeKey)) { alert("이미 하트를 누르셨습니다! ❤️"); return; }
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
    } catch (e) {}
}
window.handleLike = handleLike;

export function renderCategorySelection() {
    const app = document.getElementById('app');
    const categories = [
        { id: 'personality', name: '성격 분석', icon: '🧠', bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', text: '#4338ca', desc: '내면의 심리와 성향 분석' },
        { id: 'face', name: '비주얼/얼굴', icon: '✨', bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', text: '#e11d48', desc: '첫인상과 매력 포인트 진단' },
        { id: 'fortune', name: '오늘의 운세', icon: '🔮', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', text: '#d97706', desc: '행운의 흐름과 운명 확인' },
        { id: 'fun', name: '재미/심리', icon: '🎨', bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', text: '#7c3aed', desc: '소소한 즐거움과 취향 발견' }
    ];

    app.innerHTML = `
        <div class="category-selection-page fade-in" style="width: 100%; max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 6rem; box-sizing: border-box;">
            <div style="margin-bottom: 3.5rem; text-align: center;">
                <p style="font-size: 0.85rem; font-weight: 800; color: var(--accent-color); letter-spacing: 0.1em; margin-bottom: 8px;">CATEGORY SELECT</p>
                <h2 style="font-size: 2.2rem; font-weight: 900; color: #1e293b; letter-spacing: -0.04em;">어떤 분석을 원하시나요?</h2>
            </div>
            
            <div class="category-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
                ${categories.map(cat => `
                    <div class="cat-card" onclick="location.hash='#${cat.id}'" 
                         style="background: ${cat.bg}; border-radius: 36px; padding: 2.5rem 2rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(0,0,0,0.03); box-shadow: 0 10px 25px rgba(0,0,0,0.02); position: relative; overflow: hidden;">
                        <div style="font-size: 3.5rem; margin-bottom: 1.5rem;">${cat.icon}</div>
                        <h3 style="font-size: 1.6rem; font-weight: 900; color: #1e293b; margin-bottom: 0.6rem;">${cat.name}</h3>
                        <p style="font-size: 0.95rem; color: #64748b; font-weight: 600; margin-bottom: 2rem;">${cat.desc}</p>
                        <span style="font-size: 0.9rem; font-weight: 800; color: ${cat.text}; background: #fff; padding: 8px 18px; border-radius: 50px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">리포트 보기 →</span>
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
            <div class="dashboard fade-in" style="width: 100%; max-width: 1100px; margin: 0 auto; padding: 1rem 1.25rem 6rem; box-sizing: border-box;">
                
                <!-- 1. 고밀도 환영 섹션 -->
                <div style="margin-bottom: 1.25rem; padding: 0 0.5rem; text-align: center;">
                    <p style="font-size: 0.75rem; font-weight: 800; color: var(--accent-color); letter-spacing: 0.1em; margin-bottom: 2px;">PREMIUM ANALYTICS</p>
                    <h2 style="font-size: 1.5rem; font-weight: 900; color: #1e293b; letter-spacing: -0.02em;">환영합니다, ${userName}님! 👋</h2>
                </div>

                <!-- 2. 단순화된 퀵 메뉴 (간격 축소 및 미니멀 디자인) -->
                <div style="display: flex; justify-content: center; gap: 0.75rem; margin-bottom: 2.5rem; width: 100%; padding: 0 0.5rem;">
                    ${[
                        { id: 'arcade', label: '오락실', icon: '🕹️' },
                        { id: 'ranking', label: '랭킹', icon: '🏆' },
                        { id: 'board', label: '게시판', icon: '💬' },
                        { id: 'profile', label: '마이룸', icon: '👤' }
                    ].map(item => `
                        <div onclick="location.hash='#${item.id}'" style="flex: 1; max-width: 80px; text-align: center; cursor: pointer; transition: transform 0.2s;">
                            <div style="font-size: 2.2rem; margin-bottom: 6px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.05));">${item.icon}</div>
                            <span style="font-size: 0.75rem; font-weight: 800; color: #475569; letter-spacing: -0.02em;">${item.label}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- 3. 대형 히어로 보드 (1:1 고정) -->
                <div style="display: flex; justify-content: center; margin-bottom: 4rem; width: 100%; padding: 0 0.5rem; box-sizing: border-box;">
                    <div class="hero-card" style="width: 100%; max-width: 420px; aspect-ratio: 1/1; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 48px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1.5rem; color: #fff; box-shadow: var(--shadow-premium); box-sizing: border-box;">
                        <div style="position: absolute; top: -10%; left: -10%; width: 70%; height: 70%; background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);"></div>
                        <div style="position: relative; z-index: 2; text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <div style="background: rgba(255,255,255,0.12); backdrop-filter: blur(15px); padding: 0.7rem 1.2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); margin-bottom: 1.5rem; font-weight: 700; font-size: clamp(0.85rem, 3.5vw, 1rem); line-height: 1.4; color: #e0e7ff; max-width: 90%;">
                                "${randomAdvice}"
                            </div>
                            <h1 style="font-size: clamp(1.8rem, 8vw, 2.4rem); font-weight: 900; line-height: 1.2; margin-bottom: 1.5rem; letter-spacing: -0.04em; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">당신의 숨겨진<br>본질을 확인하세요</h1>
                            <button class="btn-primary" style="padding: 0.9rem 2.5rem; font-size: clamp(0.95rem, 4vw, 1.1rem); border-radius: 20px; background: #fff; color: #1e1b4b; font-weight: 900; border: none; box-shadow: 0 10px 30px rgba(255,255,255,0.2);" onclick="location.hash='#7check'">시작하기 →</button>
                        </div>
                    </div>
                </div>

                <!-- 4. 실시간 트렌딩 분석 -->
                <div style="margin-bottom: 4rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem; padding: 0 0.5rem;">
                        <h3 style="font-size: 1.5rem; font-weight: 900; color: #1e293b;">🔥 지금 핫한 분석</h3>
                        <span style="font-size: 0.9rem; font-weight: 800; color: var(--accent-color); cursor: pointer;" onclick="location.hash='#7check'">전체보기</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                        ${TESTS.slice(0, 4).map(t => renderTestCard(t)).join('')}
                    </div>
                </div>

                <!-- 5. 하단 월드 벤토 -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <div onclick="location.hash='#arcade'" style="background: #10b981; border-radius: 40px; padding: 2.5rem; color: #fff; position: relative; overflow: hidden; min-height: 220px; display: flex; flex-direction: column; justify-content: flex-end; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2); cursor: pointer;">
                        <span style="font-size: 6rem; position: absolute; top: -10px; right: -10px; opacity: 0.2; transform: rotate(15deg);">🎰</span>
                        <h4 style="font-size: 1.8rem; font-weight: 900; margin-bottom: 0.5rem;">세븐 오락실</h4>
                        <p style="font-weight: 600; opacity: 0.9;">포인트를 모아 희귀 펫을 입양하세요.</p>
                    </div>
                    <div onclick="location.hash='#ranking'" style="background: #f59e0b; border-radius: 40px; padding: 2.5rem; color: #fff; position: relative; overflow: hidden; min-height: 220px; display: flex; flex-direction: column; justify-content: flex-end; box-shadow: 0 20px 40px rgba(245, 158, 11, 0.2); cursor: pointer;">
                        <span style="font-size: 6rem; position: absolute; top: -10px; right: -10px; opacity: 0.2; transform: rotate(15deg);">👑</span>
                        <h4 style="font-size: 1.8rem; font-weight: 900; margin-bottom: 0.5rem;">명예의 전당</h4>
                        <p style="font-weight: 600; opacity: 0.9;">당신의 분석력을 증명할 시간입니다.</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        const filtered = TESTS.filter(t => t.category === window._currentFilter);
        app.innerHTML = `
            <div class="category-page fade-in" style="width: 100%; max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 6rem;">
                <div style="margin-bottom: 3rem; padding: 0 0.5rem;">
                    <h2 style="font-size: 2.2rem; font-weight: 900; color: #1e293b; letter-spacing: -0.04em;">${window._currentFilter} 분석</h2>
                    <p style="color: #64748b; font-weight: 600; margin-top: 0.5rem;">총 ${filtered.length}개의 리포트가 발견되었습니다.</p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    ${filtered.map(t => renderTestCard(t)).join('')}
                </div>
            </div>
        `;
    }
    updateUI();
}

export function renderTestCard(t) {
    const seed = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const playCount = (seed * 123) % 15000 + 5000; 
    const actualLikes = testLikesData[t.id] || 0;
    const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
    const displayLikes = actualLikes + baseLikes;

    return `
    <div class="test-card" onclick="location.hash='#test/${t.id}'" 
         style="background: #ffffff; border-radius: 32px; border: 1px solid #f1f5f9; display: flex; flex-direction: column; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: hidden; position: relative;">
        <div style="padding: 2rem; flex-grow: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <span style="font-size: 0.75rem; font-weight: 900; color: var(--accent-color); background: var(--accent-soft); padding: 5px 12px; border-radius: 50px;">${t.category}</span>
                <span style="font-size: 0.8rem; font-weight: 800; color: #64748b;">🔥 ${(playCount/1000).toFixed(1)}K Play</span>
            </div>
            <h3 style="font-size: 1.45rem; font-weight: 900; line-height: 1.35; color: #1e293b; margin-bottom: 0.8rem; word-break: keep-all;">${t.title}</h3>
            <p style="font-size: 0.95rem; color: #475569; line-height: 1.6; margin-bottom: 2rem; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${t.desc}</p>
            <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid #f8fafc;">
                <div onclick="event.stopPropagation(); handleLike('${t.id}')" style="display: flex; align-items: center; gap: 6px; color: #475569; font-weight: 800; font-size: 0.95rem; background: #f8fafc; padding: 8px 16px; border-radius: 50px;">
                    <span style="font-size: 1.1rem; color: #f43f5e;">❤️</span> <span id="like-count-${t.id}">${displayLikes.toLocaleString()}</span>
                </div>
                <span style="color: var(--accent-color); font-weight: 900; font-size: 1rem;">시작 ➔</span>
            </div>
        </div>
    </div>`;
}
