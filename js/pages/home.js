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
        console.log("Fetching test likes data...");
        const snap = await getDocs(collection(db, "testStats"));
        snap.forEach(doc => { testLikesData[doc.id] = doc.data().likes || 0; });
        console.log("Likes data loaded:", testLikesData);
    } catch (e) { console.error("Fetch likes failed:", e); }
}
window.fetchAllLikes = fetchAllLikes;

async function handleLike(testId) {
    console.log("handleLike called for:", testId);
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
            const displayLikes = testLikesData[testId] + baseLikes;
            counter.textContent = formatEngUnit(displayLikes);
        }

        alert("감사합니다! 하트 보상으로 5P가 적립되었습니다. ❤️");
    } catch (e) {
        console.error("Like operation failed:", e);
        alert("좋아요 처리 중 오류가 발생했습니다.");
    }
}
window.handleLike = handleLike;

export function renderCategorySelection() {
    const app = document.getElementById('app');
    
    // 카테고리별 세련된 파스텔 그라데이션 정의
    const catStyles = {
        personality: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', // Indigo
        face: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)',        // Rose
        fortune: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',     // Amber
        fun: 'linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%)'          // Violet
    };

    app.innerHTML = `
        <div class="category-selection-page fade-in" style="padding-bottom: 5rem;">
            <div class="section-header" style="text-align:center; flex-direction:column; gap:1rem; margin-bottom:4rem; margin-top: 3rem;">
                <div style="font-size: 3.5rem; margin-bottom: 0.5rem; opacity: 0.9;">🎭</div>
                <h2 class="section-title" style="font-size:2.5rem; width:100%; text-align:center; letter-spacing: -0.04em; color: #1e293b; font-weight: 900;">어떤 분석을 원하시나요?</h2>
                <p class="text-sub" style="font-weight:600; font-size: 1.15rem; color: #64748b;">당신의 본모습을 찾아줄 분석 리포트가 준비되어 있습니다.</p>
            </div>
            
            <div class="category-large-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; padding: 0 1rem;">
                <div class="cat-large-card" onclick="location.hash='#personality'" style="background: ${catStyles.personality}; border-radius: 32px; padding: 2.5rem 2rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.8); transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(0,0,0,0.04); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 6rem; opacity: 0.1; transform: rotate(15deg);">🧠</div>
                    <span style="font-size: 3rem; display: block; margin-bottom: 1.5rem;">🧠</span>
                    <h3 style="font-size: 1.7rem; font-weight: 900; color: #1e293b; margin-bottom: 0.75rem; letter-spacing: -0.02em;">성격 분석</h3>
                    <p style="font-size: 1rem; color: #475569; line-height: 1.6; font-weight: 600; margin-bottom: 2rem;">내면의 심리와 숨겨진 성향을<br>전문적인 문항으로 심층 분석합니다.</p>
                    <span style="font-size: 0.95rem; font-weight: 900; color: #312e81; background: rgba(255,255,255,0.5); padding: 8px 18px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.8);">분석 시작하기 →</span>
                </div>

                <div class="cat-large-card" onclick="location.hash='#face'" style="background: ${catStyles.face}; border-radius: 32px; padding: 2.5rem 2rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.8); transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(0,0,0,0.04); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 6rem; opacity: 0.1; transform: rotate(15deg);">✨</div>
                    <span style="font-size: 3rem; display: block; margin-bottom: 1.5rem;">✨</span>
                    <h3 style="font-size: 1.7rem; font-weight: 900; color: #1e293b; margin-bottom: 0.75rem; letter-spacing: -0.02em;">비주얼/얼굴</h3>
                    <p style="font-size: 1rem; color: #475569; line-height: 1.6; font-weight: 600; margin-bottom: 2rem;">이목구비와 첫인상이 주는<br>당신만의 고유한 매력을 진단합니다.</p>
                    <span style="font-size: 0.95rem; font-weight: 900; color: #881337; background: rgba(255,255,255,0.5); padding: 8px 18px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.8);">진단 시작하기 →</span>
                </div>

                <div class="cat-large-card" onclick="location.hash='#fortune'" style="background: ${catStyles.fortune}; border-radius: 32px; padding: 2.5rem 2rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.8); transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(0,0,0,0.04); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 6rem; opacity: 0.1; transform: rotate(15deg);">🔮</div>
                    <span style="font-size: 3rem; display: block; margin-bottom: 1.5rem;">🔮</span>
                    <h3 style="font-size: 1.7rem; font-weight: 900; color: #1e293b; margin-bottom: 0.75rem; letter-spacing: -0.02em;">오늘의 운세</h3>
                    <p style="font-size: 1rem; color: #475569; line-height: 1.6; font-weight: 600; margin-bottom: 2rem;">영적 타로와 사주 관법을 통해<br>운명의 흐름과 행운을 점쳐봅니다.</p>
                    <span style="font-size: 0.95rem; font-weight: 900; color: #92400e; background: rgba(255,255,255,0.5); padding: 8px 18px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.8);">점괘 확인하기 →</span>
                </div>

                <div class="cat-large-card" onclick="location.hash='#fun'" style="background: ${catStyles.fun}; border-radius: 32px; padding: 2.5rem 2rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.8); transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(0,0,0,0.04); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 6rem; opacity: 0.1; transform: rotate(15deg);">🎨</div>
                    <span style="font-size: 3rem; display: block; margin-bottom: 1.5rem;">🎨</span>
                    <h3 style="font-size: 1.7rem; font-weight: 900; color: #1e293b; margin-bottom: 0.75rem; letter-spacing: -0.02em;">재미/심리</h3>
                    <p style="font-size: 1rem; color: #475569; line-height: 1.6; font-weight: 600; margin-bottom: 2rem;">일상의 소소한 취향을 발견하는<br>가볍고 즐거운 심리 테스트입니다.</p>
                    <span style="font-size: 0.95rem; font-weight: 900; color: #4c1d95; background: rgba(255,255,255,0.5); padding: 8px 18px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.8);">즐기러 가기 →</span>
                </div>
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
            <div class="dashboard fade-in" style="width: 100%; max-width: 1100px; margin: 0 auto; padding: 1rem 1.25rem 5rem; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;">
                
                <!-- 1. 상단 퀵 메뉴 (스토리 스타일 - 가로 스크롤 대칭) -->
                <div class="quick-menu-stories" style="display: flex; gap: 1.5rem; overflow-x: auto; width: 100%; padding: 1.5rem 0.5rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; margin-bottom: 1.5rem; justify-content: flex-start; md-justify-content: center;">
                    <div class="story-item" onclick="location.hash='#arcade'" style="flex-shrink: 0; text-align: center; width: 75px; cursor: pointer;">
                        <div style="width: 68px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); padding: 3px; border: 2px solid #fff; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2); margin-bottom: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 8px;">🕹️</div>
                        <span style="font-size: 0.75rem; font-weight: 800; color: #1e293b;">오락실</span>
                    </div>
                    <div class="story-item" onclick="location.hash='#ranking'" style="flex-shrink: 0; text-align: center; width: 75px; cursor: pointer;">
                        <div style="width: 68px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); padding: 3px; border: 2px solid #fff; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2); margin-bottom: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 8px;">🏆</div>
                        <span style="font-size: 0.75rem; font-weight: 800; color: #1e293b;">랭킹</span>
                    </div>
                    <div class="story-item" onclick="location.hash='#board'" style="flex-shrink: 0; text-align: center; width: 75px; cursor: pointer;">
                        <div style="width: 68px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 3px; border: 2px solid #fff; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2); margin-bottom: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 8px;">💬</div>
                        <span style="font-size: 0.75rem; font-weight: 800; color: #1e293b;">커뮤니티</span>
                    </div>
                    <div class="story-item" onclick="location.hash='#guide'" style="flex-shrink: 0; text-align: center; width: 75px; cursor: pointer;">
                        <div style="width: 68px; height: 64px; border-radius: 50%; background: #94a3b8; padding: 3px; border: 2px solid #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 8px;">📖</div>
                        <span style="font-size: 0.75rem; font-weight: 800; color: #1e293b;">가이드</span>
                    </div>
                    <div class="story-item" onclick="location.hash='#profile'" style="flex-shrink: 0; text-align: center; width: 75px; cursor: pointer;">
                        <div style="width: 68px; height: 64px; border-radius: 50%; background: #1e293b; padding: 3px; border: 2px solid #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 8px;">👤</div>
                        <span style="font-size: 0.75rem; font-weight: 800; color: #1e293b;">내 정보</span>
                    </div>
                </div>

                <!-- 2. 메인 배너 (정사각형 Bento - 중앙 집중) -->
                <div class="hero-container" style="display: flex; justify-content: center; width: 100%; margin-bottom: 3.5rem;">
                    <div class="hero-section" style="width: 100%; max-width: 450px; aspect-ratio: 1 / 1; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 44px; position: relative; overflow: hidden; text-align: center; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 1.5rem; box-shadow: 0 25px 50px -12px rgba(30, 27, 75, 0.4); box-sizing: border-box;">
                        <div style="position: absolute; top: -10%; left: -10%; width: 60%; height: 60%; background: var(--accent-color); filter: blur(80px); opacity: 0.4;"></div>
                        <div class="hero-content" style="position: relative; z-index: 5; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                            <div style="font-size: clamp(3.5rem, 15vw, 4.5rem); margin-bottom: 0.5rem; animation: float 3s infinite;">🦊</div>
                            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(15px); padding: 0.7rem 1.2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); margin-bottom: 1.5rem; font-weight: 700; font-size: clamp(0.85rem, 3.5vw, 1rem); max-width: 85%; line-height: 1.4;">
                                "${randomAdvice}"
                            </div>
                            <h1 style="font-size: clamp(2rem, 9vw, 2.6rem); font-weight: 900; line-height: 1.2; margin-bottom: 1.2rem; letter-spacing: -0.04em;">진짜 당신을<br>마주할 시간</h1>
                            <button class="btn-primary" style="padding: 1rem 2.5rem; font-size: clamp(1rem, 4vw, 1.15rem); border-radius: 24px; background: #fff; color: #1e1b4b; font-weight: 900; border: none; box-shadow: 0 15px 30px rgba(255,255,255,0.2);" onclick="location.hash='#7check'">시작하기 ➔</button>
                        </div>
                    </div>
                </div>

                <!-- 3. 실시간 핫 테스트 (대칭형 리스트) -->
                <div style="width: 100%; margin-bottom: 3.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 0 0.5rem;">
                        <h3 style="font-size: 1.4rem; font-weight: 900; color: #1e293b; display: flex; align-items: center; gap: 8px;">🔥 지금 핫한 분석</h3>
                        <span style="font-size: 0.9rem; font-weight: 800; color: var(--accent-color); cursor: pointer;" onclick="location.hash='#7check'">전체보기 ➔</span>
                    </div>
                    <div class="test-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; width: 100%;">
                        ${TESTS.slice(0, 4).map(t => renderTestCard(t)).join('')}
                    </div>
                </div>

                <!-- 4. 하단 벤토 그리드 (완벽 대칭) -->
                <div class="bento-symmetric-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; width: 100%;">
                    <div class="bento-box" onclick="location.hash='#arcade'" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 32px; padding: 2rem; color: #fff; position: relative; overflow: hidden; min-height: 180px; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 15px 30px rgba(16, 185, 129, 0.15); cursor: pointer; transition: transform 0.2s;">
                        <h4 style="font-size: 1.5rem; font-weight: 900; margin-bottom: 0.5rem; position: relative; z-index: 2;">포인트 채굴</h4>
                        <p style="font-size: 0.95rem; font-weight: 600; opacity: 0.9; margin-bottom: 1.5rem; position: relative; z-index: 2;">행운의 주사위를 굴려보세요.</p>
                        <button style="background: #fff; color: #059669; border: none; padding: 8px 20px; border-radius: 12px; font-weight: 900; font-size: 0.85rem; width: fit-content; position: relative; z-index: 2;">참여하기</button>
                        <span style="position: absolute; bottom: -10px; right: -10px; font-size: 6rem; opacity: 0.2; transform: rotate(-15deg); pointer-events: none;">🎰</span>
                    </div>
                    <div class="bento-box" onclick="location.hash='#ranking'" style="background: #fff; border-radius: 32px; padding: 2rem; border: 1px solid #f1f5f9; position: relative; overflow: hidden; min-height: 180px; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 15px 30px rgba(0,0,0,0.03); cursor: pointer; transition: transform 0.2s;">
                        <h4 style="font-size: 1.5rem; font-weight: 900; color: #1e293b; margin-bottom: 0.5rem; position: relative; z-index: 2;">명예의 전당</h4>
                        <p style="font-size: 0.95rem; font-weight: 600; color: #64748b; margin-bottom: 1.5rem; position: relative; z-index: 2;">최고의 분석가를 확인하세요.</p>
                        <button style="background: #1e293b; color: #fff; border: none; padding: 8px 20px; border-radius: 12px; font-weight: 900; font-size: 0.85rem; width: fit-content; position: relative; z-index: 2;">랭킹보기</button>
                        <span style="position: absolute; bottom: -10px; right: -10px; font-size: 6rem; opacity: 0.05; transform: rotate(-15deg); pointer-events: none;">🏆</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        const filtered = TESTS.filter(t => t.category === window._currentFilter);
        app.innerHTML = `
            <div class="category-page fade-in">
                <div class="section-header" style="margin-bottom: 2rem;">
                    <h2 class="section-title">${window._currentFilter} 테스트</h2>
                    <span class="text-sub" style="font-weight: 700;">총 ${filtered.length}개</span>
                </div>
                <div class="test-grid">
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
    // 테스트 ID를 기반으로 고정된 대형 참여자 수 생성 (시각적 마케팅 효과)
    const seed = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const playCount = (seed * 123) % 15000 + 5000; 
    
    // 이용자 수에 비례하게 하트(좋아요) 숫자도 뻥튀기 (대략 20~40% 수준)
    const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
    const displayLikes = actualLikes + baseLikes;

    // 가독성을 위해 불투명하고 밝은 파스텔톤 배경색 팔레트 (글자가 잘 보이도록 보정)
    const themes = [
        { bg: '#eef2ff', text: '#1e1b4b', sub: '#4338ca', accent: '#6366f1', border: '#c7d2fe' }, // Indigo
        { bg: '#ecfdf5', text: '#064e3b', sub: '#059669', accent: '#10b981', border: '#a7f3d0' }, // Emerald
        { bg: '#fff1f2', text: '#881337', sub: '#e11d48', accent: '#f43f5e', border: '#fecdd3' }, // Rose
        { bg: '#fffbeb', text: '#78350f', sub: '#d97706', accent: '#f59e0b', border: '#fde68a' }, // Amber
        { bg: '#f5f3ff', text: '#4c1d95', sub: '#7c3aed', accent: '#8b5cf6', border: '#ddd6fe' }, // Violet
        { bg: '#f0f9ff', text: '#0c4a6e', sub: '#0284c7', accent: '#0ea5e9', border: '#bae6fd' }  // Sky
    ];
    const theme = themes[seed % themes.length];

    return `
    <div class="test-card fade-in" data-cat="${t.category}" onclick="location.hash='#test/${t.id}'" 
         style="position:relative; background: ${theme.bg}; border-radius: 24px; overflow: hidden; border: 2px solid ${theme.border}; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.05); color: ${theme.text};">
        
        <div class="test-info" style="padding: 1.75rem; flex-grow: 1; display: flex; flex-direction: column; position: relative; z-index: 2;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                <span class="test-category-tag" style="font-size: 0.75rem; font-weight: 900; color: #fff; background: ${theme.accent}; padding: 4px 12px; border-radius: 50px;">
                    ${t.category}
                </span>
                
                <div style="background: rgba(0,0,0,0.05); color: ${theme.sub}; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: flex; align-items:center; gap:4px; border: 1px solid rgba(0,0,0,0.03);">
                    <span style="font-size:0.9rem;">🔥</span> <span>${formatEngUnit(playCount)} Play</span>
                </div>
            </div>
            
            <h3 style="font-size: 1.4rem; font-weight: 900; line-height: 1.4; color: ${theme.text}; margin-bottom: 0.7rem; word-break: keep-all; letter-spacing: -0.02em;">${t.title}</h3>
            <p style="font-size: 0.95rem; color: #4b5563; line-height: 1.6; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: keep-all; font-weight: 600;">${t.desc}</p>
            
            <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 1.25rem;">
                <div id="like-badge-${t.id}"
                     onclick="event.stopPropagation(); handleLike('${t.id}')"
                     style="color: ${theme.sub}; background: #fff; padding: 6px 16px; border-radius: 50px; font-size: 0.85rem; font-weight: 800; display: flex; align-items:center; gap:6px; cursor:pointer; transition:all 0.2s ease; border: 1px solid ${theme.border};">
                    <span style="font-size:1.1rem; line-height:1;">❤️</span> <span id="like-count-${t.id}">${formatEngUnit(displayLikes)}</span>
                </div>
                
                <div style="color: ${theme.accent}; font-weight: 900; font-size: 0.95rem; display: flex; align-items: center; gap: 4px;">
                    시작하기 <span style="font-size: 1.2rem;">➔</span>
                </div>
            </div>
        </div>
    </div>`;
}
