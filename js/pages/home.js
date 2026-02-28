import { updateUI, UserState, addPoints } from '../auth.js?v=8.3.2';
import { db } from '../firebase-init.js?v=8.3.2';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.3.2';

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

function getLatestTests() {
    return [...TESTS].reverse();
}

function getRandomTests(count) {
    const shuffled = [...TESTS];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

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
        fun: 'linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%)'         // Violet
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
    const latestTests = getLatestTests();
    const curatedTests = getRandomTests(6);

    if (hash === '#home' || !hash) {
        const randomAdvice = FOX_ADVICE[Math.floor(Math.random() * FOX_ADVICE.length)];
        const userName = UserState.user ? UserState.data?.nickname || '사용자' : '방문자';
        const heroTest = latestTests[Math.floor(Math.random() * latestTests.length)];

        app.innerHTML = `
            <div class="dashboard fade-in home-renewal" style="width: 100%; max-width: 1120px; margin: 0 auto; padding: 1.2rem 1.1rem 5.5rem; box-sizing: border-box;">
                <section class="home-hero-shell" style="position:relative; margin-bottom:2rem; border-radius:34px; padding:1.2rem; background:linear-gradient(155deg,#eef2ff 0%,#f8fafc 44%,#ecfeff 100%); border:1px solid #e2e8f0; overflow:hidden;">
                    <div style="position:absolute; width:380px; height:380px; right:-180px; top:-210px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,0.26) 0%, rgba(99,102,241,0) 72%);"></div>
                    <div style="position:absolute; width:320px; height:320px; left:-170px; bottom:-220px; border-radius:50%; background:radial-gradient(circle,rgba(16,185,129,0.18) 0%, rgba(16,185,129,0) 72%);"></div>

                    <div class="home-hero-grid" style="position:relative; z-index:2; display:grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap:1rem;">
                        <article class="home-primary-hero" style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#312e81 100%); border-radius:28px; padding:1.8rem; color:#fff; min-height:300px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 24px 50px -22px rgba(15,23,42,0.7);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                                <span style="font-size:0.72rem; letter-spacing:0.12em; font-weight:800; color:rgba(255,255,255,0.75);">PREMIUM ANALYTICS HOME</span>
                                <span style="font-size:0.74rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:999px; padding:0.25rem 0.65rem;">LIVE</span>
                            </div>
                            <div>
                                <h1 style="font-size:clamp(1.9rem,7.6vw,2.8rem); line-height:1.08; letter-spacing:-0.04em; margin-bottom:0.7rem;">${userName}님을 위한<br>정밀 리포트 허브</h1>
                                <p style="font-size:0.95rem; color:rgba(226,232,240,0.95); line-height:1.55; max-width: 95%;">심리, 비주얼, 운세, 재미 테스트를 하나의 흐름으로 연결한 고급 분석 경험을 시작하세요.</p>
                            </div>
                            <div style="display:flex; gap:0.6rem; margin-top:1.2rem; flex-wrap:wrap;">
                                <button class="home-cta-main" onclick="location.hash='#test/${heroTest.id}'" style="border:none; border-radius:14px; padding:0.75rem 1.05rem; background:linear-gradient(135deg,#22d3ee 0%,#6366f1 55%,#7c3aed 100%); color:#fff; font-weight:900; font-size:0.86rem; cursor:pointer; box-shadow:0 12px 24px rgba(99,102,241,0.35);">나를 위한 추천</button>
                                <button onclick="location.hash='#7check'" style="border:1px solid rgba(255,255,255,0.24); border-radius:14px; padding:0.75rem 1.05rem; background:rgba(255,255,255,0.07); color:#fff; font-weight:800; font-size:0.86rem; cursor:pointer;">전체 카테고리 보기</button>
                            </div>
                        </article>

                        <div class="home-hero-side" style="display:grid; gap:0.8rem; grid-template-rows:auto auto 1fr;">
                            <div style="background:#fff; border-radius:20px; border:1px solid #e2e8f0; padding:1rem 1rem; box-shadow:0 14px 25px rgba(15,23,42,0.05);">
                                <div style="font-size:0.72rem; font-weight:900; color:#6366f1; letter-spacing:0.1em; margin-bottom:0.4rem;">TODAY INSIGHT</div>
                                <div style="font-size:0.92rem; font-weight:700; color:#334155; line-height:1.5;">${randomAdvice}</div>
                            </div>

                            <div style="position:relative;">
                                <input type="text" id="home-search" placeholder="테스트 제목/카테고리 검색" style="width:100%; padding:0.92rem 1rem 0.92rem 2.9rem; border-radius:16px; border:1px solid #dbe3ef; background:#ffffff; font-size:0.9rem; font-weight:700; color:#1e293b; outline:none; box-shadow:0 10px 20px rgba(15,23,42,0.04);">
                                <span style="position:absolute; left:0.95rem; top:50%; transform:translateY(-50%); font-size:1.08rem; opacity:0.5;">⌕</span>
                            </div>

                            <div style="background:#fff; border-radius:20px; border:1px solid #e2e8f0; padding:0.8rem; box-shadow:0 14px 25px rgba(15,23,42,0.05);">
                                <div class="home-quick-grid" style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:0.55rem;">
                                    <button onclick="location.hash='#arcade'" style="border:none; border-radius:12px; padding:0.62rem 0.66rem; background:linear-gradient(135deg,#34d399,#059669); color:#fff; font-size:0.82rem; font-weight:800; cursor:pointer;">🕹️ 오락실</button>
                                    <button onclick="location.hash='#ranking'" style="border:none; border-radius:12px; padding:0.62rem 0.66rem; background:linear-gradient(135deg,#facc15,#d97706); color:#fff; font-size:0.82rem; font-weight:800; cursor:pointer;">🏆 랭킹</button>
                                    <button onclick="location.hash='#board'" style="border:none; border-radius:12px; padding:0.62rem 0.66rem; background:linear-gradient(135deg,#60a5fa,#4338ca); color:#fff; font-size:0.82rem; font-weight:800; cursor:pointer;">💬 커뮤니티</button>
                                    <button onclick="location.hash='#profile'" style="border:none; border-radius:12px; padding:0.62rem 0.66rem; background:linear-gradient(135deg,#64748b,#0f172a); color:#fff; font-size:0.82rem; font-weight:800; cursor:pointer;">👤 내 정보</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="home-pill-grid" style="margin-bottom:1.8rem; display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:0.72rem;">
                    <div onclick="location.hash='#personality'" style="cursor:pointer; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:0.85rem 0.95rem; box-shadow:0 8px 16px rgba(15,23,42,0.04);">
                        <div style="font-size:0.75rem; color:#6366f1; font-weight:900; margin-bottom:0.22rem;">MENTAL LAB</div>
                        <div style="font-size:0.95rem; color:#1e293b; font-weight:800;">성격 분석 컬렉션</div>
                    </div>
                    <div onclick="location.hash='#face'" style="cursor:pointer; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:0.85rem 0.95rem; box-shadow:0 8px 16px rgba(15,23,42,0.04);">
                        <div style="font-size:0.75rem; color:#db2777; font-weight:900; margin-bottom:0.22rem;">AURA LOOK</div>
                        <div style="font-size:0.95rem; color:#1e293b; font-weight:800;">비주얼 진단실</div>
                    </div>
                    <div onclick="location.hash='#fortune'" style="cursor:pointer; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:0.85rem 0.95rem; box-shadow:0 8px 16px rgba(15,23,42,0.04);">
                        <div style="font-size:0.75rem; color:#d97706; font-weight:900; margin-bottom:0.22rem;">FORTUNE FLOW</div>
                        <div style="font-size:0.95rem; color:#1e293b; font-weight:800;">오늘의 운세 리포트</div>
                    </div>
                    <div onclick="location.hash='#fun'" style="cursor:pointer; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:0.85rem 0.95rem; box-shadow:0 8px 16px rgba(15,23,42,0.04);">
                        <div style="font-size:0.75rem; color:#059669; font-weight:900; margin-bottom:0.22rem;">PLAY MIND</div>
                        <div style="font-size:0.95rem; color:#1e293b; font-weight:800;">재미/심리 큐레이션</div>
                    </div>
                </section>

                <section style="margin-bottom:1.4rem; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="font-size:1.35rem; font-weight:900; color:#0f172a; letter-spacing:-0.02em;">큐레이션 테스트</h3>
                    <span onclick="location.hash='#7check'" style="font-size:0.84rem; font-weight:800; color:#6366f1; cursor:pointer;">전체 보기</span>
                </section>
                <div id="test-list-grid" class="test-grid home-renewal-test-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:0.95rem; width:100%;">
                    ${curatedTests.map(t => renderTestCard(t)).join('')}
                </div>
            </div>
        `;

        const searchInput = document.getElementById('home-search');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const term = e.target.value.toLowerCase().trim();
                const filtered = latestTests.filter(t => t.title.toLowerCase().includes(term) || t.category.toLowerCase().includes(term));
                const grid = document.getElementById('test-list-grid');
                if (grid) {
                    grid.innerHTML = filtered.length > 0
                        ? filtered.slice(0, 12).map(t => renderTestCard(t)).join('')
                        : `<div style="grid-column:1/-1; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:2rem; text-align:center; color:#64748b; font-weight:700;">검색 결과가 없습니다.</div>`;
                }
            };
        }
    } else {
        const filtered = latestTests.filter(t => t.category === window._currentFilter);
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
    const seed = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const playCount = (seed * 123) % 15000 + 5000; 
    const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
    const displayLikes = actualLikes + baseLikes;

    const themes = [
        { bg: 'linear-gradient(145deg,#eef2ff 0%,#e0e7ff 100%)', text: '#1e1b4b', sub: '#4338ca', accent: '#6366f1', border: '#c7d2fe' },
        { bg: 'linear-gradient(145deg,#ecfdf5 0%,#d1fae5 100%)', text: '#064e3b', sub: '#059669', accent: '#10b981', border: '#a7f3d0' },
        { bg: 'linear-gradient(145deg,#fff1f2 0%,#ffe4e6 100%)', text: '#881337', sub: '#e11d48', accent: '#f43f5e', border: '#fecdd3' },
        { bg: 'linear-gradient(145deg,#fffbeb 0%,#fef3c7 100%)', text: '#78350f', sub: '#d97706', accent: '#f59e0b', border: '#fde68a' },
        { bg: 'linear-gradient(145deg,#f5f3ff 0%,#ede9fe 100%)', text: '#4c1d95', sub: '#7c3aed', accent: '#8b5cf6', border: '#ddd6fe' },
        { bg: 'linear-gradient(145deg,#f0f9ff 0%,#e0f2fe 100%)', text: '#0c4a6e', sub: '#0284c7', accent: '#0ea5e9', border: '#bae6fd' }
    ];
    const theme = themes[seed % themes.length];

    return `
    <div class="test-card fade-in" data-cat="${t.category}" onclick="location.hash='#test/${t.id}'" 
         style="position:relative; background:${theme.bg}; border-radius:20px; overflow:hidden; border:1px solid ${theme.border}; display:flex; flex-direction:column; cursor:pointer; transition:transform 0.2s; box-shadow:0 10px 20px rgba(15,23,42,0.06); color:${theme.text};">
        
        <div class="test-info" style="padding:1.15rem; flex-grow:1; display:flex; flex-direction:column; position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.95rem;">
                <span class="test-category-tag" style="font-size:0.68rem; font-weight:900; color:#fff; background:${theme.accent}; padding:4px 10px; border-radius:999px;">
                    ${t.category}
                </span>
                
                <div style="background:rgba(255,255,255,0.6); color:${theme.sub}; padding:4px 10px; border-radius:999px; font-size:0.72rem; font-weight:800; display:flex; align-items:center; gap:4px; border:1px solid rgba(255,255,255,0.75);">
                    <span style="font-size:0.85rem;">🔥</span> <span>${formatEngUnit(playCount)}</span>
                </div>
            </div>
            
            <h3 style="font-size:1.16rem; font-weight:900; line-height:1.35; color:${theme.text}; margin-bottom:0.62rem; word-break:keep-all; letter-spacing:-0.02em;">${t.title}</h3>
            <p style="font-size:0.86rem; color:#475569; line-height:1.55; margin-bottom:1.15rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:keep-all; font-weight:600;">${t.desc}</p>
            
            <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(30,41,59,0.09); padding-top:0.9rem;">
                <div id="like-badge-${t.id}"
                     onclick="event.stopPropagation(); handleLike('${t.id}')"
                     style="color:${theme.sub}; background:#fff; padding:5px 12px; border-radius:999px; font-size:0.78rem; font-weight:800; display:flex; align-items:center; gap:5px; cursor:pointer; border:1px solid ${theme.border};">
                    <span style="font-size:0.96rem; line-height:1;">❤️</span> <span id="like-count-${t.id}">${formatEngUnit(displayLikes)}</span>
                </div>
                
                <div style="color:${theme.accent}; font-weight:900; font-size:0.84rem; display:flex; align-items:center; gap:3px;">
                    시작하기 <span style="font-size:1rem;">➔</span>
                </div>
            </div>
        </div>
    </div>`;
}
