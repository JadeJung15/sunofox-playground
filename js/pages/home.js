import { updateUI, UserState, addPoints } from '../auth.js?v=7.1.0';
import { db } from '../firebase-init.js?v=7.1.0';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=7.1.0';

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
            <div class="dashboard fade-in">
                <div class="hero-section">
                    <div class="hero-content">
                        <div class="fox-advice-container fade-in" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; gap: 12px;">
                            <div class="fox-avatar" style="font-size: 3rem; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.2));">🦊</div>
                            <div class="advice-bubble" style="background: rgba(255,255,255,0.9); padding: 0.8rem 1.5rem; border-radius: 20px 20px 20px 4px; box-shadow: var(--shadow-md); position: relative; font-weight: 800; color: #334155; font-size: 1rem; border: 2px solid var(--accent-soft); backdrop-filter: blur(5px);">
                                ${randomAdvice}
                            </div>
                        </div>
                        <span class="hero-tag">✨ 7번의 질문으로 찾는 나</span>
                        <h1>당신이 몰랐던<br>진짜 모습을 확인하세요</h1>
                        <p>심리학적 기반의 정교한 분석 리포트와<br>즐거운 미니게임이 기다리고 있습니다.</p>
                        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                            <button class="btn-primary" style="padding: 1rem 2.5rem; font-size: 1.1rem; border-radius: 50px;" onclick="location.hash='#7check'">테스트 시작하기</button>
                            <button class="btn-secondary" style="padding: 1rem 2rem; font-size: 1.1rem; border-radius: 50px; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); color: #fff;" onclick="window.globalShareSite()">🔗 공유하기</button>
                        </div>
                    </div>
                </div>

                <div class="banner-grid" style="margin-top: 2rem;">
                    <div class="arcade-preview-card" onclick="location.hash='#arcade'">
                        <div style="position:relative; z-index:1;">
                            <span style="font-size: 0.8rem; font-weight: 800; background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 50px; margin-bottom: 1rem; display: inline-block;">DAILY MISSION</span>
                            <h3 style="font-size: 1.8rem; font-weight: 900; margin-bottom: 0.5rem;">세븐 오락실 오픈!</h3>
                            <p style="font-weight: 600; opacity: 0.9;">매일 출석하고 포인트 채굴해서<br>희귀 이모지를 수집하세요.</p>
                        </div>
                        <span style="position:absolute; bottom: -20px; right: -10px; font-size: 8rem; opacity: 0.2;">🎰</span>
                    </div>
                    <div class="ranking-preview-card">
                        <h4 style="font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">🏆 명예의 전당</h4>
                        <div id="mini-ranking-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <p class="text-sub" style="font-size: 0.8rem;">실시간 랭킹 확인하기</p>
                            <button class="btn-secondary" style="width:100%; padding: 0.5rem; font-size: 0.8rem;" onclick="location.hash='#ranking'">랭킹 보기</button>
                        </div>
                    </div>
                    <div class="guide-preview-card" onclick="location.hash='#guide'">
                        <div style="position:relative; z-index:1;">
                            <h4 style="font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">📖 이용 가이드</h4>
                            <p style="font-size: 0.8rem; line-height: 1.5; opacity: 0.9;">포인트 획득 방법부터<br>등급 시스템까지 한눈에!</p>
                        </div>
                        <span style="position:absolute; bottom: -10px; right: -5px; font-size: 4rem; opacity: 0.1;">📒</span>
                    </div>
                    <div class="board-preview-card" onclick="location.hash='#board'">
                        <div style="position:relative; z-index:1;">
                            <h4 style="font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">💬 커뮤니티</h4>
                            <p class="text-sub" style="font-size: 0.8rem; line-height: 1.5;">다른 이용자들과 소통하고<br>나만의 분석 결과를 공유하세요.</p>
                        </div>
                        <span style="position:absolute; bottom: -10px; right: -5px; font-size: 4rem; opacity: 0.05;">✨</span>
                    </div>
                    <div class="profile-preview-card" onclick="location.hash='#profile'">
                        <div style="position:relative; z-index:1;">
                            <h4 style="font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">👤 내 정보</h4>
                            <p class="text-sub" style="font-size: 0.8rem; line-height: 1.5;">보유 포인트와 아이템,<br>현재 등급을 확인하세요.</p>
                        </div>
                        <span style="position:absolute; bottom: -10px; right: -5px; font-size: 4rem; opacity: 0.05;">🆔</span>
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

    // 카드의 배경을 다채롭게 만들기 위한 그라데이션 팔레트 (투명도를 살짝 주어 세련된 느낌)
    const gradients = [
        'linear-gradient(135deg, rgba(238, 242, 255, 0.9) 0%, rgba(224, 231, 255, 0.6) 100%)', // Indigo
        'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(220, 252, 231, 0.6) 100%)', // Green
        'linear-gradient(135deg, rgba(255, 241, 242, 0.9) 0%, rgba(255, 228, 230, 0.6) 100%)', // Rose
        'linear-gradient(135deg, rgba(255, 251, 235, 0.9) 0%, rgba(254, 243, 199, 0.6) 100%)', // Amber
        'linear-gradient(135deg, rgba(245, 243, 255, 0.9) 0%, rgba(237, 233, 254, 0.6) 100%)', // Violet
        'linear-gradient(135deg, rgba(240, 249, 255, 0.9) 0%, rgba(224, 242, 254, 0.6) 100%)'  // Sky
    ];
    const cardBg = gradients[seed % gradients.length];

    return `
    <div class="test-card fade-in" data-cat="${t.category}" onclick="location.hash='#test/${t.id}'" style="position:relative; background: ${cardBg}; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid rgba(0,0,0,0.05); display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.03); backdrop-filter: blur(10px);">
        <div class="test-info" style="padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column; position: relative; z-index: 2;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <span class="test-category-tag" style="font-size: 0.75rem; font-weight: 800; color: rgba(0,0,0,0.7); text-transform: uppercase; background: rgba(255,255,255,0.6); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    ${t.category}
                </span>
                
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="background: rgba(255,255,255,0.5); color: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; display: flex; align-items:center; gap:4px; border: 1px solid rgba(255,255,255,0.8);">
                        <span style="font-size:0.8rem; opacity:0.8;">🔥</span> <span>${formatEngUnit(playCount)} Play</span>
                    </div>
                </div>
            </div>
            
            <h3 style="font-size: 1.3rem; font-weight: 900; line-height: 1.4; color: #1e293b; margin-bottom: 0.5rem; word-break: keep-all; letter-spacing: -0.02em;">${t.title}</h3>
            <p style="font-size: 0.9rem; color: #475569; line-height: 1.6; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: keep-all; font-weight: 500;">${t.desc}</p>
            
            <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 1rem;">
                <div id="like-badge-${t.id}"
                     onclick="event.stopPropagation(); handleLike('${t.id}')"
                     style="color: #475569; background: rgba(255,255,255,0.6); padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 800; display: flex; align-items:center; gap:6px; cursor:pointer; transition:all 0.2s ease; border: 1px solid rgba(255,255,255,0.8);">
                    <span style="font-size:1rem; line-height:1; color: #ef4444;">❤️</span> <span id="like-count-${t.id}">${formatEngUnit(displayLikes)}</span>
                </div>
                
                <span style="font-size: 0.85rem; font-weight: 900; color: #334155; display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.4); padding: 6px 12px; border-radius: 20px;">분석 시작 <span style="font-size: 1.1rem;">➔</span></span>
            </div>
        </div>
    </div>`;
}
