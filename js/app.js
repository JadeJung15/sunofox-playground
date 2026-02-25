
import { initAuth, updateUI, UserState, addPoints, usePoints, EMOJI_SHOP, getTier, TIERS, chargeUserPoints, chargeUserScore, authReady, ITEM_GRADES, ITEM_VALUES, getGrade, updateProfileCache } from './auth.js';
import { initArcade } from './arcade.js';
import { copyLink, saveAsStoryImage } from './share.js';
import { renderBoard, AURA_SHOP, BORDER_SHOP, BACKGROUND_SHOP } from './board.js';
import { renderRanking } from './ranking.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, increment, getDoc, setDoc, collection, getDocs, query, where, orderBy, limit, onSnapshot, deleteDoc, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from './tests-data.js?v=2.2.3';

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=500&q=60`;
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80"; // 부드러운 그라데이션 이미지

// 이미지 로드 실패 시 호출될 공통 핸들러
window.handleImgError = function(img) {
    img.onerror = null; // 무한 루프 방지
    img.src = DEFAULT_IMAGE;
    img.classList.add('img-fallback');
};

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

// =================================================================
// 2. Main Logic & Router
// =================================================================

const categoryMap = { 
    '#personality': '성격', '#face': '얼굴', '#fortune': '사주', '#fun': '재미', 
    '#arcade': '오락실', '#board': '게시판', '#profile': '프로필', '#ranking': '랭킹', '#guide': '가이드', '#news': '공지'
};
let currentFilter = '전체';
let testLikesData = {};

async function fetchAllLikes() {
    try {
        const snap = await getDocs(collection(db, "testStats"));
        snap.forEach(doc => { testLikesData[doc.id] = doc.data().likes || 0; });
    } catch (e) { console.error(e); }
}

async function handleLike(testId) {
    if (!UserState.user) return alert("로그인이 필요합니다.");
    if (sessionStorage.getItem(`liked_${testId}`)) return alert("이미 완료한 투표입니다.");
    try {
        const statsRef = doc(db, "testStats", testId);
        await setDoc(statsRef, { likes: increment(1) }, { merge: true });
        sessionStorage.setItem(`liked_${testId}`, "true");
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5);
        
        // 1. 플로팅 아이콘 업데이트
        const floatingIcon = document.getElementById(`like-icon-floating-${testId}`);
        if (floatingIcon) floatingIcon.textContent = '❤️';
        
        // 2. 하단 카운트 뱃지 업데이트
        const countEl = document.getElementById(`like-count-${testId}`);
        if (countEl) countEl.textContent = testLikesData[testId];
        
        // 3. 버튼 활성화 상태 클래스 추가
        const btn = document.getElementById(`like-btn-${testId}`);
        if (btn) btn.classList.add('active');
        
        alert("감사합니다! 5P가 적립되었습니다. ❤️");
    } catch (e) { console.error(e); }
}

let isRouting = false;

async function router() {
    const container = document.getElementById('app');
    if (!container || isRouting) return;
    
    isRouting = true;
    const hash = window.location.hash || '#home';

    // 특정 상황(아케이드 갱신 등)에서 스크롤 위치 저장
    const currentScrollY = window.scrollY;

    try {
        // 백그라운드 통계 (렌더링 차단 안함)
        trackVisit().catch(() => {});
        renderVisitorStats().catch(() => {});

        // 네비게이션 상태 업데이트
        document.querySelectorAll('.nav-link').forEach(link => {
            const filter = link.dataset.filter;
            const href = link.getAttribute('href') || '';
            const isActive = (hash === '#home' && filter === '전체') || 
                           (hash !== '#home' && href.length > 1 && hash.includes(href.substring(1)));
            link.classList.toggle('active', isActive);
        });

        // 인증 대기 (특정 페이지는 비로그인 상태로 즉시 렌더링)
        const instantPages = ['#home', '#7check', '#guide', '#about', '#privacy', '#terms', '#contact'];
        if (!instantPages.includes(hash) && !hash.startsWith('#test/')) {
            await authReady;
        }

        container.innerHTML = ''; 
        if (hash === '#privacy') renderPrivacy();
        else if (hash === '#about') renderAbout();
        else if (hash === '#terms') renderTerms();
        else if (hash === '#contact') renderContact();
        else if (hash === '#arcade') renderArcade();
        else if (hash === '#board') await renderBoard(container);
        else if (hash === '#ranking') await renderRanking(container);
        else if (hash === '#guide') renderGuide();
        else if (hash === '#book') await renderEncyclopedia();
        else if (hash === '#profile') renderProfile();
        else if (hash === '#admin') renderAdmin();
        else if (hash === '#7check') renderCategorySelection();
        else if (hash.startsWith('#test/')) renderTestExecution(hash.split('/')[1]);
        else {
            currentFilter = categoryMap[hash] || '전체';
            await renderHome(hash);
        }

        // 인증이 뒤늦게 완료된 경우 퀘스트 체크
        authReady.then(() => {
            if (UserState.user && typeof window.checkDailyQuests === 'function') {
                window.checkDailyQuests('login').catch(() => {});
            }
        });

        // 아케이드 내부 갱신일 경우 스크롤 복구
        if (window._preventScroll) {
            window.scrollTo(0, currentScrollY);
            window._preventScroll = false;
        } else {
            window.scrollTo(0, 0);
        }

    } catch (error) {
        console.error("Routing error:", error);
        container.innerHTML = `<div style="text-align:center; padding:3rem;"><h3>⚠️ 서비스를 불러올 수 없습니다</h3><button onclick="location.reload()" class="btn-primary" style="margin-top:1rem;">새로고침</button></div>`;
    } finally {
        isRouting = false;
    }
}

// 일일 퀘스트 처리 함수 복구 및 전역 정의
window.checkDailyQuests = async function(type) {
    if (!UserState.user || !UserState.data) return;
    try {
        const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
        const userRef = doc(db, "users", UserState.user.uid);
        if (!UserState.data.quests || UserState.data.quests.date !== today) {
            const newQuests = { date: today, list: { login: true, test: false, board: false } };
            await updateDoc(userRef, { quests: newQuests });
            UserState.data.quests = newQuests;
            if (type === 'login') return;
        }
        if (UserState.data.quests.list && UserState.data.quests.list[type] === false) {
            await updateDoc(userRef, { [`quests.list.${type}`]: true });
            UserState.data.quests.list[type] = true;
            await addPoints(50, `일일 퀘스트 완료: ${type}`);
        }
    } catch (e) { console.error("Quest error:", e); }
};

// =================================================================
// 3. Page Renders
// =================================================================

function renderCategorySelection() {
    app.innerHTML = `
        <div class="category-selection-page fade-in">
            <div class="section-header" style="text-align:center; flex-direction:column; gap:1rem; margin-bottom:3.5rem; margin-top: 2rem;">
                <h2 class="section-title" style="font-size:2.2rem; width:100%; text-align:center;">✨ 어떤 분석을 원하시나요?</h2>
                <p class="text-sub" style="font-weight:600; font-size: 1.1rem;">당신의 본모습을 찾아줄 7가지 질문이 기다리고 있습니다.</p>
            </div>
            <div class="category-large-grid">
                <div class="cat-large-card" onclick="location.hash='#personality'" style="--cat-color: var(--color-personality);">
                    <div class="cat-card-inner">
                        <span class="cat-icon">🧠</span>
                        <h3>성격 분석</h3>
                        <p>내면의 심리와 숨겨진 성향을<br>심층 분석합니다.</p>
                        <span class="cat-go">시작하기 →</span>
                    </div>
                </div>
                <div class="cat-large-card" onclick="location.hash='#face'" style="--cat-color: var(--color-face);">
                    <div class="cat-card-inner">
                        <span class="cat-icon">✨</span>
                        <h3>비주얼/얼굴</h3>
                        <p>이목구비와 첫인상이 주는<br>고유한 매력을 진단합니다.</p>
                        <span class="cat-go">시작하기 →</span>
                    </div>
                </div>
                <div class="cat-large-card" onclick="location.hash='#fortune'" style="--cat-color: var(--color-fortune);">
                    <div class="cat-card-inner">
                        <span class="cat-icon">🔮</span>
                        <h3>오늘의 운세</h3>
                        <p>영적 타로와 사주 관법으로<br>오늘의 운을 점쳐봅니다.</p>
                        <span class="cat-go">시작하기 →</span>
                    </div>
                </div>
                <div class="cat-large-card" onclick="location.hash='#fun'" style="--cat-color: var(--color-fun);">
                    <div class="cat-card-inner">
                        <span class="cat-icon">🎨</span>
                        <h3>재미/심리</h3>
                        <p>일상의 소소한 취향과<br>재미있는 심리 테스트입니다.</p>
                        <span class="cat-go">시작하기 →</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function renderHome(hash) {
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
        const filtered = TESTS.filter(t => t.category === currentFilter);
        app.innerHTML = `
            <div class="category-page fade-in">
                <div class="section-header" style="margin-bottom: 2rem;">
                    <h2 class="section-title">${currentFilter} 테스트</h2>
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

function renderTestCard(t) {
    const likes = testLikesData[t.id] || 0;
    const isLiked = sessionStorage.getItem(`liked_${t.id}`);
    return `
    <div class="test-card fade-in" data-cat="${t.category}" onclick="location.hash='#test/${t.id}'" style="position:relative;">
        <div class="thumb-wrapper" style="position: relative; aspect-ratio: 16/9; overflow: hidden; border-radius: 15px;">
            <img src="${t.thumb}" alt="${t.title}" 
                 style="width: 100%; height: 100%; object-fit: cover;" 
                 onerror="window.handleImgError(this)">
            <div class="thumb-overlay" style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%); pointer-events: none;"></div>
            
            <!-- 플로팅 하트 버튼 (개선됨) -->
            <button id="like-btn-${t.id}" 
                    class="like-btn-floating ${isLiked ? 'active' : ''}" 
                    onclick="event.stopPropagation(); handleLike('${t.id}')"
                    style="position:absolute; top:12px; right:12px; z-index:20; width:40px; height:40px; border-radius:50%; background:#fff; border:none; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 15px rgba(0,0,0,0.2); cursor:pointer;">
                <span id="like-icon-floating-${t.id}" style="font-size:1.2rem; line-height:1;">${isLiked ? '❤️' : '🤍'}</span>
            </button>

            <!-- 좋아요 카운트 뱃지 (썸네일 내부 좌측 하단) -->
            <div style="position:absolute; bottom:12px; left:12px; z-index:10; background: rgba(0,0,0,0.6); color: #fff; backdrop-filter: blur(4px); padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; display: flex; align-items:center; gap:4px; border: 1px solid rgba(255,255,255,0.2);">
                <span>❤️</span> <span id="like-count-${t.id}">${likes}</span>
            </div>
        </div>
        <div class="test-info">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span class="test-category-tag">${t.category}</span>
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-sub); display: flex; align-items: center; gap: 4px;"><span>⏱️</span> 3분</span>
            </div>
            <h3 style="margin-top: 0.5rem; font-size: 1.1rem; line-height: 1.4;">${t.title}</h3>
            <p style="font-size: 0.85rem; margin-top: 0.4rem;">${t.desc}</p>
            <div style="margin-top: auto; padding-top: 1rem; border-top: 1px dashed var(--border-color); display: flex; justify-content: flex-end;">
                <span style="font-size: 0.8rem; font-weight: 800; color: var(--accent-color);">테스트 시작 ➔</span>
            </div>
        </div>
    </div>`;
}

function renderProfile() {
    if (!UserState.user) {
        app.innerHTML = `<div class="card" style="text-align:center; padding:4rem;"><h2>👤 로그인이 필요합니다</h2><button id="login-btn" class="btn-primary" style="margin:1.5rem auto 0;">로그인하기</button></div>`;
        return;
    }
    const inv = UserState.data.inventory || [];
    const groupedInv = inv.reduce((acc, item) => { acc[item] = (acc[item] || 0) + 1; return acc; }, {});
    const invHTML = Object.entries(groupedInv).map(([name, count]) => {
        const grade = getGrade(name);
        return `
            <div class="inv-card grade-${grade.toLowerCase()}">
                <span class="inv-grade-badge">${grade[0]}</span>
                <span class="inv-icon">${name.split(' ')[0]}</span>
                <span class="inv-name">${name.split(' ')[1] || ''}</span>
                <span class="inv-badge">${count}</span>
            </div>
        `;
    }).join('') || '<p class="text-sub">수집한 아이템이 없습니다.</p>';

    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);
    const stats = UserState.data.arcadeStats || { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 };

    // 테두리 및 배경 적용 효과 미리보기용 클래스 추출
    const activeBorderClass = UserState.data.activeBorder !== 'NONE' ? BORDER_SHOP[UserState.data.activeBorder]?.class || '' : '';
    const activeBackgroundClass = UserState.data.activeBackground !== 'NONE' ? BACKGROUND_SHOP[UserState.data.activeBackground]?.class || '' : '';
    const activeAuraClass = UserState.data.activeAura !== 'NONE' ? AURA_SHOP[UserState.data.activeAura]?.class || '' : '';

    app.innerHTML = `
        <div class="profile-page fade-in">
            <div class="card profile-header-card ${activeBackgroundClass}" style="padding: 2.5rem 1.5rem; text-align: center; overflow: hidden; position: relative;">
                <div class="profile-accent-bg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100px; background: linear-gradient(135deg, var(--accent-color), var(--accent-soft)); opacity: 0.1;"></div>
                <div id="user-emoji" class="author-emoji-circle ${activeBorderClass} ${activeAuraClass}" style="font-size: 5rem; margin: 0 auto 1rem; position: relative; display: flex; background: var(--card-bg); border-radius: 50%; width: 120px; height: 120px; align-items: center; justify-content: center; box-shadow: var(--shadow-md);">👤</div>
                <div class="tier-badge" style="background: var(--accent-color); color: #fff; display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem; position: relative;">${tier.name}</div>
                <h2 id="user-name" style="font-size: 2rem; font-weight: 800; margin-bottom: 1.5rem;">닉네임</h2>
                
                <div class="progress-container" style="max-width: 400px; margin: 0 auto 2rem; position:relative; z-index:1;">
                    <div class="progress-label" style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 800; margin-bottom: 0.5rem; background: rgba(0,0,0,0.4); color: #fff; padding: 4px 12px; border-radius: 50px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                        <span>등급 성장도</span>
                        <span>${currentScore.toLocaleString()} / ${nextTier.min.toLocaleString()}</span>
                    </div>
                    <div class="progress-track" style="height: 12px; background: rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
                        <div class="progress-fill" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--accent-color), var(--accent-soft)); border-radius: 10px; box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);"></div>
                    </div>
                </div>
            </div>

            <details class="profile-details" open>
                <summary>🎨 내 꾸미기 관리</summary>
                <div class="content-area">
                    <div style="display: grid; gap: 1.5rem;">
                        <div>
                            <h4 style="font-size:0.9rem; margin-bottom:0.8rem; color:var(--accent-color);">🖼️ 보유한 테두리</h4>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                                <button class="btn-equip-profile ${UserState.data.activeBorder === 'NONE' ? 'active' : ''}" data-type="Border" data-id="NONE" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--border-color); background:none;">해제</button>
                                ${(UserState.data.unlockedBorders || []).filter(id => id !== 'NONE').map(id => `
                                    <button class="btn-equip-profile ${UserState.data.activeBorder === id ? 'active' : ''}" data-type="Border" data-id="${id}" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--accent-color); background:${UserState.data.activeBorder === id ? 'var(--accent-color)' : 'none'}; color:${UserState.data.activeBorder === id ? '#fff' : 'inherit'}">${BORDER_SHOP[id]?.name || id}</button>
                                `).join('')}
                            </div>
                        </div>
                        <div>
                            <h4 style="font-size:0.9rem; margin-bottom:0.8rem; color:var(--accent-secondary);">🎨 보유한 배경</h4>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                                <button class="btn-equip-profile ${UserState.data.activeBackground === 'NONE' ? 'active' : ''}" data-type="Background" data-id="NONE" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--border-color); background:none;">해제</button>
                                ${(UserState.data.unlockedBackgrounds || []).filter(id => id !== 'NONE').map(id => `
                                    <button class="btn-equip-profile ${UserState.data.activeBackground === id ? 'active' : ''}" data-type="Background" data-id="${id}" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--accent-color); background:${UserState.data.activeBackground === id ? 'var(--accent-color)' : 'none'}; color:${UserState.data.activeBackground === id ? '#fff' : 'inherit'}">${BACKGROUND_SHOP[id]?.name || id}</button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>📊 오락실 이용 통계</summary>
                <div class="content-area">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                        <div><small class="text-sub">⛏️ 채굴</small><p><strong>${stats.mining || 0}</strong></p></div>
                        <div><small class="text-sub">📦 가챠</small><p><strong>${stats.gacha || 0}</strong></p></div>
                        <div><small class="text-sub">⚗️ 연금술</small><p><strong>${stats.alchemy || 0}</strong></p></div>
                        <div><small class="text-sub">🎫 복권</small><p><strong>${stats.lottery || 0}</strong></p></div>
                        <div><small class="text-sub">🎲 베팅</small><p><strong>${stats.betting || 0}</strong></p></div>
                        <div><small class="text-sub">📅 출석</small><p><strong>${stats.checkin || 0}</strong></p></div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>🎒 내 인벤토리</summary>
                <div class="content-area"><div class="inventory-grid">${invHTML}</div></div>
            </details>
            
            <details class="profile-details" open>
                <summary>🏪 이모지 교환소</summary>
                <div class="content-area shop-wrapper">
                    ${Object.entries(EMOJI_SHOP).map(([cat, emojis]) => `
                        <h4 style="margin-top:1rem; font-size:0.9rem; color:var(--accent-color);">${cat}</h4>
                        <div class="emoji-grid" style="margin-top:0.8rem;">
                            ${Object.entries(emojis).map(([e, price]) => `
                                <button class="emoji-btn ${UserState.data.unlockedEmojis.includes(e) ? 'owned' : 'locked'} ${UserState.data.emoji === e ? 'active' : ''}" data-emoji="${e}">
                                    <span class="e-icon">${e}</span>
                                    <span class="e-price">${price}</span>
                                </button>`).join('')}
                        </div>
                    `).join('')}
                </div>
            </details>

            <details class="profile-details">
                <summary>⚙️ 계정 설정</summary>
                <div class="content-area">
                    <div class="setting-group" style="background: var(--bg-color); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.9rem; font-weight: 800; margin-bottom: 0.25rem;">닉네임 변경 ${UserState.data.nicknameChanged ? '(소모: 5,000P)' : '<span style="color:var(--accent-secondary);">(최초 1회 무료)</span>'}</label>
                        <p style="font-size: 0.75rem; color: var(--text-sub); margin-bottom: 0.75rem;">${UserState.data.nicknameChanged ? '닉네임 변경 시 포인트가 차감됩니다.' : '현재 랜덤 닉네임 상태입니다. 원하는 이름으로 변경해 보세요!'}</p>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="nickname-input" style="flex: 1; padding: 0.8rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.95rem;" placeholder="새 닉네임 (2~10자)">
                            <button id="nickname-save" class="btn-primary" style="padding: 0 1.5rem; font-size: 0.9rem;">변경</button>
                        </div>
                        <p id="nickname-msg" style="margin-top: 0.75rem; font-size: 0.8rem; font-weight: 600;"></p>
                    </div>
                    <button id="logout-btn" class="btn-secondary" style="width: 100%; padding: 1rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.2); font-weight: 700;">로그아웃</button>
                </div>
            </details>
        </div>
    `;

    // 프로필 장착 이벤트 바인딩
    app.querySelectorAll('.btn-equip-profile').forEach(btn => {
        btn.onclick = async () => {
            const { type, id } = btn.dataset;
            const activeKey = `active${type}`;
            await updateDoc(doc(db, "users", UserState.user.uid), { [activeKey]: id });
            UserState.data[activeKey] = id;
            
            // 캐시 업데이트 추가
            updateProfileCache(UserState.user.uid, { [activeKey]: id });

            renderProfile();
            updateUI();
        };
    });

    updateUI();
}

function renderAdmin() {
    if (!UserState.isMaster) { location.hash = '#home'; return; }
    
    app.innerHTML = `
        <div class="admin-page fade-in">
            <div class="card admin-header" style="background: linear-gradient(135deg, var(--accent-color), #4f46e5); color:#fff; border:none; padding:3rem 1.5rem; text-align:center; border-radius: var(--radius-lg); margin-bottom:2rem;">
                <h2 style="font-size:2.2rem; font-weight:900; margin-bottom:0.5rem;">🛡️ MASTER CONSOLE</h2>
                <p style="opacity:0.9; font-weight:600;">사용자 관리 및 시스템 자산 조정 시스템</p>
            </div>

            <div class="card" style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.5rem; display:flex; align-items:center; gap:10px;">👤 사용자 데이터베이스</h3>
                <button id="admin-search-users" class="btn-primary" style="width:100%; margin-bottom:1.5rem; background: var(--accent-color);">모든 사용자 불러오기</button>
                
                <div id="admin-user-list-container" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:1rem; max-height: 600px; overflow-y: auto; padding: 0.5rem; border-radius: 12px; background: var(--bg-color); border: 1px solid var(--border-color); display:none;"></div>
            </div>

            <div id="admin-user-log-container" style="display:none; margin-bottom: 2rem; background: var(--card-bg); border-radius: var(--radius-lg); padding: 2rem; border: 2px solid var(--accent-soft); box-shadow: var(--shadow-lg);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h3 style="font-size: 1.2rem;">📋 활동 이력 조회: <span id="log-target-name" style="color:var(--accent-color);"></span></h3>
                    <button onclick="document.getElementById('admin-user-log-container').style.display='none'" class="btn-secondary" style="width:auto; padding: 0.4rem 1rem;">닫기 ✕</button>
                </div>
                <div id="log-list-content" style="display:flex; flex-direction:column; gap:0.75rem; max-height: 500px; overflow-y:auto;"></div>
            </div>

            <div class="card" style="background: rgba(99, 102, 241, 0.03); border: 2px dashed var(--accent-soft);">
                <h3 style="margin-bottom: 1.5rem;">💰 실시간 자산 집행</h3>
                <div style="display: grid; gap: 1.5rem;">
                    <div class="input-group">
                        <label style="display:block; font-size:0.85rem; font-weight:800; margin-bottom:0.5rem; color:var(--text-sub);">관리 대상 UID (사용자 목록에서 '선택' 클릭)</label>
                        <input type="text" id="admin-target-uid" style="width:100%; padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); font-family: monospace;" placeholder="대상 UID">
                    </div>
                    <div class="input-group">
                        <label style="display:block; font-size:0.85rem; font-weight:800; margin-bottom:0.5rem; color:var(--text-sub);">조정 수량 (+ 또는 -)</label>
                        <div style="display: flex; gap: 0.75rem;">
                            <input type="number" id="admin-amount" style="flex: 1; padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); font-size: 1.2rem; font-weight: 900;" placeholder="0">
                            <button id="admin-charge-points-btn" class="btn-primary" style="background: var(--accent-secondary); flex: 1;">포인트 집행</button>
                            <button id="admin-charge-score-btn" class="btn-primary" style="background: var(--accent-color); flex: 1;">점수 집행</button>
                        </div>
                    </div>
                </div>
                <p id="admin-msg" style="margin-top: 1.5rem; font-size: 0.9rem; font-weight: 800; text-align: center; min-height: 1.2rem; color: var(--accent-color);"></p>
            </div>
        </div>
    `;

    // 관리자 기능 이벤트 바인딩 (기존 로직 재활용 및 UI에 맞춰 개선)
    const setupAdminEvents = () => {
        document.getElementById('admin-charge-points-btn').onclick = async () => {
            const uid = document.getElementById('admin-target-uid').value.trim();
            const amount = parseInt(document.getElementById('admin-amount').value);
            const msg = document.getElementById('admin-msg');
            if (isNaN(amount)) return alert("금액을 정확히 입력하세요.");
            if (await chargeUserPoints(uid, amount)) {
                msg.textContent = `성공: ${uid}에게 ${amount}P 적용 완료.`;
                document.getElementById('admin-amount').value = '';
            } else { msg.textContent = "실패: 사용자 정보를 확인하세요."; }
        };

        document.getElementById('admin-charge-score-btn').onclick = async () => {
            const uid = document.getElementById('admin-target-uid').value.trim();
            const amount = parseInt(document.getElementById('admin-amount').value);
            const msg = document.getElementById('admin-msg');
            if (isNaN(amount)) return alert("수량을 정확히 입력하세요.");
            if (await chargeUserScore(uid, amount)) {
                msg.textContent = `성공: ${uid}에게 ${amount}점 적용 완료.`;
                document.getElementById('admin-amount').value = '';
            } else { msg.textContent = "실패: 사용자 정보를 확인하세요."; }
        };

        document.getElementById('admin-search-users').onclick = async () => {
            const listContainer = document.getElementById('admin-user-list-container');
            listContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:2rem;">로딩 중...</p>';
            listContainer.style.display = 'grid';
            
            try {
                const snap = await getDocs(collection(db, "users"));
                const users = [];
                snap.forEach(d => {
                    const data = d.data();
                    users.push(`
                        <div class="card user-admin-card" style="padding: 1.25rem; margin-bottom:0; display:flex; flex-direction:column; gap:1rem; border: 1px solid var(--border-color);">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div style="overflow:hidden;">
                                    <h4 style="font-size:1rem; font-weight:900; margin-bottom:0.2rem;">${data.nickname || '익명'}</h4>
                                    <p style="font-size:0.75rem; color:var(--accent-color); font-weight:600; margin-bottom:0.4rem;">${data.originalEmail ? `(${data.originalEmail})` : '<span style="color:var(--text-sub); font-weight:normal;">(미접속: 정보 업데이트 대기)</span>'}</p>
                                    <small style="font-size:0.65rem; color:var(--text-sub); font-family:monospace;">${d.id}</small>
                                </div>
                                <div style="display:flex; gap:0.4rem; flex-shrink:0;">
                                    <button class="admin-view-log-btn btn-secondary" data-uid="${d.id}" data-name="${data.nickname}" style="padding: 4px 8px; font-size: 0.7rem; border-color:var(--accent-color); color:var(--accent-color);">로그</button>
                                    <button class="admin-select-user-btn btn-secondary" data-uid="${d.id}" style="padding: 4px 8px; font-size: 0.7rem;">선택</button>
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; background:var(--bg-color); padding:0.75rem; border-radius:10px;">
                                <div style="text-align:center;">
                                    <small style="display:block; font-size:0.6rem; color:var(--text-sub); font-weight:800; margin-bottom:2px;">포인트</small>
                                    <span style="font-weight:900; color:var(--accent-secondary); font-size:0.9rem;">${(data.points || 0).toLocaleString()}</span>
                                </div>
                                <div style="text-align:center; border-left:1px solid var(--border-color);">
                                    <small style="display:block; font-size:0.6rem; color:var(--text-sub); font-weight:800; margin-bottom:2px;">랭킹점수</small>
                                    <span style="font-weight:900; color:var(--accent-color); font-size:0.9rem;">${(data.totalScore || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    `);
                });
                listContainer.innerHTML = users.join('');
                
                listContainer.querySelectorAll('.admin-select-user-btn').forEach(btn => {
                    btn.onclick = () => {
                        document.getElementById('admin-target-uid').value = btn.dataset.uid;
                        document.getElementById('admin-msg').textContent = `선택된 대상: ${btn.dataset.uid}`;
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    };
                });

                listContainer.querySelectorAll('.admin-view-log-btn').forEach(btn => {
                    btn.onclick = async () => {
                        const logContainer = document.getElementById('admin-user-log-container');
                        const logListContent = document.getElementById('log-list-content');
                        document.getElementById('log-target-name').textContent = `${btn.dataset.name} (${btn.dataset.uid})`;
                        
                        logListContent.innerHTML = '<p class="text-sub" style="text-align:center; padding:2rem;">데이터 불러오는 중...</p>';
                        logContainer.style.display = 'block';
                        logContainer.scrollIntoView({ behavior: 'smooth' });
                        
                        try {
                            const q = query(collection(db, "pointLogs"), where("uid", "==", btn.dataset.uid), orderBy("timestamp", "desc"), limit(50));
                            const logSnap = await getDocs(q);
                            
                            if (logSnap.empty) {
                                logListContent.innerHTML = '<p class="text-sub" style="text-align:center; padding:2rem;">기록된 내역이 없습니다.</p>';
                                return;
                            }
                            
                            const logs = [];
                            logSnap.forEach(ld => {
                                const l = ld.data();
                                const date = l.timestamp ? new Date(l.timestamp.toMillis()).toLocaleString() : '진행 중...';
                                const color = l.amount > 0 ? '#10b981' : '#ef4444';
                                
                                logs.push(`
                                    <div style="background:var(--bg-color); padding:1rem; border-radius:12px; border:1px solid var(--border-color);">
                                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                                            <span style="font-weight:900; color:var(--accent-color); font-size:0.7rem; letter-spacing:0.05em;">${l.type.toUpperCase()}</span>
                                            <span style="font-size:0.7rem; color:var(--text-sub); font-weight:600;">${date}</span>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span style="font-weight:700; font-size:0.9rem;">${l.reason}</span>
                                            <span style="font-weight:900; color:${color}; font-size:1rem;">${l.amount > 0 ? '+' : ''}${l.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                `);
                            });
                            logListContent.innerHTML = logs.join('');
                        } catch (err) {
                            logListContent.innerHTML = `<p style="color:#ef4444; font-size:0.85rem; text-align:center; padding:2rem;">오류: 색인 생성 전이거나 권한이 없습니다.</p>`;
                        }
                    };
                });
            } catch (e) { alert("목록 로드 실패"); }
        };
    };

    setupAdminEvents();
}

function renderArcade() {
    if (!UserState.user) { renderProfile(); return; }
    app.innerHTML = `
        <div class="arcade-page fade-in">
            <div class="card arcade-header" style="text-align:center; padding: 2.5rem 1.5rem; background: linear-gradient(135deg, var(--accent-color), var(--accent-soft)); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                <h2 style="font-size: 2.2rem; font-weight: 900; margin-bottom: 0.5rem; position: relative;">🎰 SEVEN ARCADE</h2>
                <p style="opacity: 0.9; font-size: 1rem; font-weight: 600; position: relative;">매일 즐거운 게임과 포인트 혜택!</p>
                <div class="arcade-user-stats" style="display: inline-flex; justify-content: center; gap: 2rem; margin-top: 2rem; background: rgba(255,255,255,0.2); padding: 0.8rem 2rem; border-radius: 50px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); position: relative;">
                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:0.85rem; font-weight:700;">내 포인트:</span><span id="user-points" style="font-weight:900; font-size: 1.1rem;">0</span></div>
                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:0.85rem; font-weight:700;">부스터:</span><span style="font-weight:900; font-size: 1.1rem;">${UserState.data.boosterCount || 0}회</span></div>
                </div>
            </div>

            <!-- Daily Quest Section -->
            <details class="profile-details quest-section fade-in" style="margin-bottom: 2rem; border: 2px solid var(--accent-soft);">
                <summary id="quest-summary" style="font-size:1.1rem; font-weight:800;">📜 일일 퀘스트 (로딩 중...)</summary>
                <div id="daily-quest-list" class="content-area">
                    <!-- 퀘스트 목록은 JS로 동적 로드 -->
                </div>
            </details>

            <div class="arcade-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">📅 일일 출석체크</h3>
                        <span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">FREE</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">하루 한 번, 클릭만으로 <strong>100P</strong>를 즉시 획득하세요.</p>
                    <button id="daily-checkin-btn" class="btn-primary" style="width:100%; background:#10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">출석체크 완료하기</button>
                </div>

                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">⛏️ 포인트 채굴</h3>
                        <span style="background: rgba(99, 102, 241, 0.1); color: var(--accent-color); padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">LIMITLESS</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">채굴기를 가동하여 무작위 포인트를 생산합니다. (5~15P)</p>
                    <button id="click-game-btn" class="btn-primary" style="width:100%; height:55px; background:linear-gradient(90deg, var(--accent-color), #8b5cf6);">채굴기 가동 시작</button>
                </div>

                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🎰 이모지 슬롯</h3>
                        <span style="background: rgba(253, 160, 133, 0.1); color: #fda085; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">JACKPOT</span>
                    </div>
                    <div id="slot-machine-container" style="height:100px; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:1.25rem; border:2px solid #fda085; border-radius:15px; background:rgba(253,160,133,0.05); font-size: 3rem; overflow: hidden;">
                        <div class="slot-reel" id="slot-1">🎰</div>
                        <div class="slot-reel" id="slot-2">🎰</div>
                        <div class="slot-reel" id="slot-3">🎰</div>
                    </div>
                    <button id="slot-spin-btn" class="btn-primary" style="width:100%; background:#fda085; box-shadow: 0 4px 14px rgba(253, 160, 133, 0.3); height:55px; font-weight: 800;">슬롯 돌리기 (300P)</button>
                </div>

                <div class="card arcade-item-card" style="margin-bottom:0;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">🎲 주사위 3개 베팅</h3>
                    <div style="background: var(--bg-color); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-sub); margin-bottom: 0.5rem;">베팅 금액 설정</label>
                        <input type="number" id="bet-amount" value="100" min="10" style="width:100%; background: transparent; border: none; text-align:center; font-size:1.5rem; font-weight:900; color: var(--accent-color); outline: none;">
                    </div>
                    <div id="bet-result-msg" style="text-align:center; font-weight:800; margin-bottom:1rem; min-height:35px; font-size:0.9rem; color: var(--text-sub);">주사위 3개를 던집니다!</div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.6rem;">
                        <button class="bet-btn btn-secondary" style="font-weight: 800; padding: 0.8rem 0;" data-game="dice3" data-choice="small">소(3~8)<br><small>3.5배</small></button>
                        <button class="bet-btn btn-secondary" style="font-weight: 800; padding: 0.8rem 0;" data-game="dice3" data-choice="middle">중(9~12)<br><small>2배</small></button>
                        <button class="bet-btn btn-secondary" style="font-weight: 800; padding: 0.8rem 0;" data-game="dice3" data-choice="big">대(13~18)<br><small>3.5배</small></button>
                    </div>
                </div>

                <div class="card arcade-item-card" style="margin-bottom:0;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">📦 아이템 뽑기</h3>
                    <div id="gacha-result" class="gacha-box" style="min-height:75px; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; border:2px dashed var(--border-color); border-radius:15px; text-align:center; font-size:0.9rem; background:rgba(0,0,0,0.02); font-weight: 600;">희귀 아이템이 쏟아집니다</div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.5rem;">
                        <button id="gacha-btn" class="btn-primary" style="background:var(--text-main); font-size:0.75rem; padding:0.8rem 0.5rem; height:50px;">1회 (100P)</button>
                        <button id="gacha-10-btn" class="btn-primary" style="background:var(--accent-color); font-size:0.75rem; padding:0.8rem 0.5rem; height:50px;">10회 (950P)</button>
                        <button id="gacha-30-btn" class="btn-primary" style="background:#f43f5e; font-size:0.75rem; padding:0.8rem 0.5rem; height:50px;">30회 (2700P 🔥)</button>
                    </div>
                </div>

                <!-- 아이템 연금술 (고도화) -->
                <div class="card arcade-item-card alchemy-card" style="margin-bottom:0; display: flex; flex-direction: column; border: 2px solid #8b5cf6; background: rgba(139, 92, 246, 0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">⚗️ 아이템 연금술</h3>
                        <span style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">UPGRADE</span>
                    </div>
                    
                    <div style="background:var(--bg-color); padding:1rem; border-radius:12px; margin-bottom:1.25rem; border:1px solid var(--border-color); text-align:center;">
                        <div style="background:var(--card-bg); padding:0.8rem; border-radius:10px; margin-bottom:1rem; border:1px solid var(--border-color);">
                            <label style="display:block; font-size:0.75rem; font-weight:800; color:var(--text-sub); margin-bottom:0.5rem;">연성할 등급 선택</label>
                            <select id="alchemy-grade-select" style="width:100%; background:none; border:none; font-size:1rem; font-weight:800; color:#8b5cf6; outline:none; cursor:pointer; font-family:inherit; text-align:center;">
                                <option value="COMMON">일반 (COMMON) ➔ 고급</option>
                                <option value="UNCOMMON">고급 (UNCOMMON) ➔ 희귀</option>
                                <option value="RARE">희귀 (RARE) ➔ 전설</option>
                            </select>
                        </div>
                        <p style="font-size:0.8rem; font-weight:800; color:var(--text-sub); margin-bottom:0.5rem;">필요한 제물 (6개 소모)</p>
                        <div style="display:flex; justify-content:center; gap:1rem; align-items:center;">
                            <div style="background:var(--card-bg); padding:0.5rem 1.5rem; border-radius:10px; border:1px solid #8b5cf6;">
                                <small style="display:block; font-size:0.6rem; color:var(--text-sub);">선택 등급 재료</small>
                                <strong style="color:#8b5cf6;">6개</strong> (보유: <span id="count-material-available">0</span>)
                            </div>
                        </div>
                    </div>

                    <div id="alchemy-result" style="text-align:center; font-weight:800; color:#8b5cf6; margin-bottom:1.25rem; min-height:60px; font-size:0.85rem; display:flex; align-items:center; justify-content:center; background:rgba(139, 92, 246, 0.05); border-radius:10px; padding: 0.5rem;">금단의 연성법을 시전합니다</div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.5rem;">
                        <button id="alchemy-btn" class="btn-primary" style="background:#8b5cf6; font-size:0.75rem; height:50px; font-weight:800;">1회<br><small>300P</small></button>
                        <button id="alchemy-5-btn" class="btn-primary" style="background:#7c3aed; font-size:0.75rem; height:50px; font-weight:800;">5회 🔥<br><small>1,350P</small></button>
                        <button id="alchemy-10-btn" class="btn-primary" style="background:#6d28d9; font-size:0.75rem; height:50px; font-weight:800;">10회 🔥<br><small>2,500P</small></button>
                    </div>
                </div>

                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🧨 폭탄 돌리기</h3>
                        <span style="background: rgba(244, 63, 94, 0.1); color: #f43f5e; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">DANGER</span>
                    </div>
                    <p id="bomb-msg" class="text-sub" style="font-size:0.9rem; margin-bottom:1rem; text-align: center; min-height: 24px;">전선을 선택하세요! (현재 누적: 0P)</p>
                    <div id="bomb-wires" style="display:grid; grid-template-columns: repeat(5, 1fr); gap:0.5rem; margin-bottom:1.5rem;">
                        <button class="wire-btn" data-wire="0" style="height:60px; background:#ef4444; border:none; border-radius:8px;"></button>
                        <button class="wire-btn" data-wire="1" style="height:60px; background:#3b82f6; border:none; border-radius:8px;"></button>
                        <button class="wire-btn" data-wire="2" style="height:60px; background:#10b981; border:none; border-radius:8px;"></button>
                        <button class="wire-btn" data-wire="3" style="height:60px; background:#f59e0b; border:none; border-radius:8px;"></button>
                        <button class="wire-btn" data-wire="4" style="height:60px; background:#8b5cf6; border:none; border-radius:8px;"></button>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.6rem;">
                        <button id="bomb-start-btn" class="btn-primary" style="background:#f43f5e; font-size:0.8rem; height:50px;">게임 시작 (200P)</button>
                        <button id="bomb-claim-btn" class="btn-secondary" style="font-size:0.8rem; height:50px; border-color:#f43f5e; color:#f43f5e;" disabled>포인트 챙기기</button>
                    </div>
                </div>

                <div class="card arcade-item-card market-card" style="margin-bottom:0; border: 2px solid var(--accent-secondary); background: rgba(16, 185, 129, 0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🏪 아이템 중고장터</h3>
                        <span style="background: var(--accent-secondary); color: #fff; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">BULK SELL</span>
                    </div>
                    <p class="text-sub" style="font-size:0.85rem; margin-bottom:1.5rem; line-height:1.4;">보유한 아이템을 포인트로 대량 환전하세요.<br>(아이템 가치의 <strong>70%</strong> 환급)</p>
                    <div id="market-ui-container"></div>
                    <button id="market-open-btn" class="btn-secondary" style="width:100%; border-width: 2px; border-color:var(--accent-secondary); color:var(--accent-secondary); font-weight: 800;">아이템 일괄 판매 열기</button>
                </div>
            </div>

            <div class="card booster-section fade-in" style="margin-top:2.5rem; background:linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); border: 2px solid var(--accent-soft); padding: 2rem; border-radius: var(--radius-lg);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem;">
                    <div style="flex: 1; min-width: 250px;">
                        <h3 style="font-size:1.4rem; font-weight: 900; color:var(--accent-color); margin-bottom:0.5rem; display: flex; align-items: center; gap: 8px;">⚡ 슈퍼 부스터 (Super Booster)</h3>
                        <p class="text-sub" style="font-size:0.95rem; font-weight: 600;">부스터 활성화 시 모든 테스트 보상 포인트가 <strong>2배(20P)</strong>로 지급됩니다.</p>
                    </div>
                    <button id="buy-booster-btn" class="btn-primary" style="background:var(--accent-color); padding: 1rem 2.5rem; font-size: 1rem; border-radius: 50px;">부스터 20회 충전 (100P)</button>
                </div>
            </div>
        </div>
    `;
    initArcade(); 

    // 연금술 재료 수량 업데이트 로직
    const updateAlchemyCounts = () => {
        const inv = UserState.data?.inventory || [];
        const counts = { COMMON: 0, UNCOMMON: 0, RARE: 0 };
        inv.forEach(item => {
            const grade = getGrade(item);
            if (counts[grade] !== undefined) counts[grade]++;
        });
        
        const gradeSelect = document.getElementById('alchemy-grade-select');
        const materialEl = document.getElementById('count-material-available');
        
        if (gradeSelect && materialEl) {
            // 이전 선택값 유지
            const prevVal = sessionStorage.getItem('last_alchemy_grade') || 'COMMON';
            if (counts[prevVal] !== undefined) gradeSelect.value = prevVal;
            
            materialEl.textContent = counts[gradeSelect.value];
            gradeSelect.onchange = () => { 
                materialEl.textContent = counts[gradeSelect.value]; 
                sessionStorage.setItem('last_alchemy_grade', gradeSelect.value);
            };
        }
    };
    updateAlchemyCounts();

    const buyBoosterBtn = document.getElementById('buy-booster-btn');
    if (buyBoosterBtn) {
        buyBoosterBtn.onclick = async () => {
            if (await usePoints(100)) {
                await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(20) });
                UserState.data.boosterCount = (UserState.data.boosterCount || 0) + 20;
                updateUI(); alert("부스터 충전 완료! 🔥"); renderArcade();
            }
        };
    }
    updateUI();
}

async function renderResult(testId, traitScores) {
    const test = TESTS.find(t => t.id === testId);
    const traits = ['energy', 'logic', 'empathy', 'creativity'];
    const dominantTrait = traits.reduce((a, b) => (traitScores[a] >= traitScores[b] ? a : b));
    
    const result = (test.results[dominantTrait]) ? test.results[dominantTrait] : (traitScores.energy >= 4 ? test.results.A : test.results.B);
    const themeColor = result.color || '#6366f1';
    const tags = result.tags || [];
    const maxScore = 14;
    const stats = {
        energy:     Math.min(Math.round((traitScores.energy     / maxScore) * 100), 100),
        logic:      Math.min(Math.round((traitScores.logic      / maxScore) * 100), 100),
        empathy:    Math.min(Math.round((traitScores.empathy    / maxScore) * 100), 100),
        creativity: Math.min(Math.round((traitScores.creativity / maxScore) * 100), 100),
    };

    let basePointReward = 10;
    if (UserState.user && UserState.data.boosterCount > 0) {
        basePointReward = 20;
        await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(-1) });
        UserState.data.boosterCount -= 1;
    }

    let rewardedItem = null;
    if (UserState.user) {
        const traitItems = {
            energy: '⚡ 번개 병',
            logic: '🧪 현자의 돌',
            empathy: '🌱 묘목',
            creativity: '🌌 은하수 가루'
        };
        rewardedItem = traitItems[dominantTrait] || '💩 돌멩이';
        const itemVal = ITEM_VALUES[rewardedItem] || 500;
        
        await updateDoc(doc(db, "users", UserState.user.uid), {
            inventory: arrayUnion(rewardedItem),
            totalScore: increment(itemVal),
            discoveredItems: arrayUnion(rewardedItem)
        });
        UserState.data.inventory.push(rewardedItem);
        UserState.data.totalScore = (UserState.data.totalScore || 0) + itemVal;
        await addPoints(basePointReward, '분석 완료 보상');
        if (typeof checkDailyQuests === 'function') checkDailyQuests('test');
    }

    // 추천 테스트 추출 (v2.1.0 추가)
    const recommendedTests = TESTS
        .filter(t => t.id !== testId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    // Dynamic Aura Background
    app.innerHTML = `
        <div class="aura-bg-container">
            <div class="aura-sphere" style="background: ${themeColor}; top: -100px; left: -100px; opacity: 0.2;"></div>
            <div class="aura-sphere" style="background: ${themeColor}; bottom: -100px; right: -100px; opacity: 0.1; animation-delay: -5s;"></div>
        </div>
        <div class="result-page fade-in" style="min-height: 100vh; padding: 2rem 1rem;">
            <div class="result-card" id="capture-target" style="max-width: 600px; margin: 0 auto; background: var(--card-bg); border-radius: 30px; overflow: hidden; box-shadow: var(--shadow-lg); border: 2px solid ${themeColor}44; backdrop-filter: blur(5px);">
                <div style="padding: 1.5rem 1.5rem 0;">
                    <div class="result-img-wrapper" style="height: 300px; position: relative; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.15); border: 4px solid #fff;">
                        <img src="${result.img}" alt="${result.title}" 
                             style="width: 100%; height: 100%; object-fit: cover;" 
                             onerror="window.handleImgError(this)">
                    </div>
                </div>
                <div style="padding: 1.5rem 1.5rem 2.5rem; text-align: center;">
                    <div style="display:flex; justify-content:center; gap:8px; margin-bottom:1.5rem;" class="result-tag-floating">
                        ${tags.map(tag => `<span style="background:${themeColor}22; color:${themeColor}; padding:6px 14px; border-radius:50px; font-size:0.85rem; font-weight:800;">${tag}</span>`).join('')}
                    </div>
                    <h2 style="font-size: 2.6rem; font-weight: 900; color: ${themeColor}; margin-bottom: 1.25rem; letter-spacing: -0.04em;">${result.title}</h2>
                    
                    <div style="min-height: 8rem; margin-bottom: 2.5rem; background: rgba(255,255,255,0.5); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                        <p id="typing-desc" style="font-size: 1.15rem; line-height: 1.9; color: var(--text-main); word-break: keep-all; font-weight: 600;"></p>
                    </div>
                    
                    <div class="radar-chart-container" style="background: var(--bg-color); border-radius: 24px; padding: 2.5rem 1rem; margin-bottom: 3rem; border: 1px solid var(--border-color); position: relative;">
                        <h4 style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--text-sub); font-weight: 800; letter-spacing: 0.1em;">나의 7단계 심층 지표</h4>
                        <canvas id="radarChart" width="220" height="220" style="margin: 0 auto;"></canvas>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1.5rem;">
                            <div style="font-size: 0.75rem; color: ${themeColor}; font-weight: 800;">에너지 ${Math.round(stats.energy)}%</div>
                            <div style="font-size: 0.75rem; color: ${themeColor}; font-weight: 800;">논리 ${Math.round(stats.logic)}%</div>
                            <div style="font-size: 0.75rem; color: ${themeColor}; font-weight: 800;">공감 ${Math.round(stats.empathy)}%</div>
                            <div style="font-size: 0.75rem; color: ${themeColor}; font-weight: 800;">독창성 ${Math.round(stats.creativity)}%</div>
                        </div>
                    </div>

                    <div class="reward-box" style="background: linear-gradient(135deg, #1e293b, #334155); color: #fff; padding: 2.2rem; border-radius: 24px; margin-bottom: 2.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -10px; right: -10px; font-size: 5rem; opacity: 0.1;">✨</div>
                        <span style="font-size: 0.85rem; font-weight: 800; opacity: 0.8; display: block; margin-bottom: 1rem; letter-spacing: 0.05em;">🎁 당신만을 위한 전용 보상</span>
                        <div style="font-size: 2.2rem; font-weight: 900; color: #fbbf24; margin-bottom: 0.6rem; text-shadow: 0 0 15px rgba(251, 191, 36, 0.3);">${rewardedItem || '20P 획득'}</div>
                        <p style="opacity: 0.7; font-size: 0.9rem; font-weight: 600;">아이템 도감에 기록되었습니다.</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" data-html2canvas-ignore="true">
                        <button class="btn-primary" style="background: ${themeColor}; border: none; height: 60px; font-weight: 800; font-size: 1.1rem; border-radius: 18px;" onclick="location.hash='#home'">메인으로</button>
                        <button id="save-story-btn" class="btn-secondary" style="height: 60px; font-weight: 800; font-size: 1.1rem; border-radius: 18px; border-color: ${themeColor}; color: ${themeColor}; display: flex; align-items: center; justify-content: center; gap: 8px;"><span>📸</span> 인스타용 저장</button>
                    </div>

                    <!-- 추천 테스트 및 전체보기 (v2.1.0 추가) -->
                    <div class="recommended-section" style="margin-top: 4rem; padding-top: 3rem; border-top: 1px dashed var(--border-color);" data-html2canvas-ignore="true">
                        <h3 style="text-align:center; margin-bottom: 2.5rem; font-size: 1.4rem; font-weight: 900; color: var(--text-main);">✨ 이런 분석은 어때요?</h3>
                        <div class="test-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem;">
                            ${recommendedTests.map(t => `
                                <div class="test-card" onclick="location.hash='#test/${t.id}'" style="margin-bottom:0; cursor:pointer;">
                                    <div class="test-thumb-wrapper" style="height: 120px; border-radius: 12px; overflow:hidden; position:relative;">
                                        <img src="${t.thumb}" alt="${t.title}" 
                                             style="width:100%; height:100%; object-fit:cover;" 
                                             onerror="window.handleImgError(this)">
                                    </div>
                                    <div class="test-info" style="padding: 0.8rem; text-align: left;">
                                        <span class="test-category-tag" style="font-size: 0.6rem; padding: 2px 6px;">${t.category}</span>
                                        <h4 style="font-size: 0.85rem; margin-top: 0.4rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${t.title}</h4>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="text-align: center; margin-top: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                            <button id="result-share-btn" class="btn-primary" style="padding: 1rem 3rem; font-weight: 800; border-radius: 50px; width: auto; background: var(--accent-secondary);">🔗 이 테스트 다시 공유하기</button>
                            <button class="btn-secondary" style="padding: 1rem 3rem; font-weight: 800; border-radius: 50px; width: auto; border-color: var(--border-color); color: var(--text-sub);" onclick="location.hash='#7check'">📋 전체 리스트 보기</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 인스타 스토리 전용 숨겨진 레이아웃 (9:16) -->
            <div id="story-capture-area" style="position: absolute; left: -9999px; width: 360px; height: 640px; background: ${themeColor}; color: #fff; overflow: hidden; font-family: 'Pretendard', sans-serif;">
                <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%); z-index: 1;"></div>
                <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em;">SEVEN CHECK REPORT</span>
                    </div>
                    
                    <div class="story-img-wrapper" style="width: 100%; aspect-ratio: 1; border-radius: 20px; overflow:hidden; margin-bottom: 30px; border: 4px solid #fff; box-shadow: 0 15px 30px rgba(0,0,0,0.3);">
                        <img src="${result.img}" alt="" style="width:100%; height:100%; object-fit:cover;" onerror="window.handleImgError(this)">
                    </div>
                    
                    <div style="text-align: center;">
                        <h2 style="font-size: 2.2rem; font-weight: 900; margin-bottom: 15px; line-height: 1.2; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">${result.title}</h2>
                        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 25px;">
                            ${tags.map(tag => `<span style="background:rgba(255,255,255,0.2); padding:5px 12px; border-radius:50px; font-size:0.75rem; font-weight:700; backdrop-filter:blur(5px);">${tag}</span>`).join('')}
                        </div>
                    </div>

                    <div style="margin-top: auto; text-align: center;">
                        <div style="font-size: 1.4rem; font-weight: 900; margin-bottom: 5px;">7Check</div>
                        <div style="font-size: 0.7rem; opacity: 0.8; font-weight: 600;">지금 7Check에서 당신의 아우라를 확인하세요</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 1. Typing Effect Logic
    const descEl = document.getElementById('typing-desc');
    let i = 0;
    const type = () => {
        if (i < result.desc.length) {
            descEl.innerHTML = result.desc.substring(0, i + 1) + '<span class="typing-cursor"></span>';
            i++;
            setTimeout(type, 35);
        } else {
            descEl.innerHTML = result.desc;
        }
    };
    setTimeout(type, 600);

    // 2. Custom Radar Drawing
    const canvas = document.getElementById('radarChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const cx = 110, cy = 110, r = 85;
        const labels = ['energy', 'logic', 'empathy', 'creativity'];
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        [0.3, 0.6, 1].forEach(scale => {
            ctx.beginPath();
            labels.forEach((_, idx) => {
                const angle = (idx * 90 - 90) * Math.PI / 180;
                const x = cx + Math.cos(angle) * r * scale;
                const y = cy + Math.sin(angle) * r * scale;
                idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.stroke();
        });

        ctx.fillStyle = themeColor + '44';
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        labels.forEach((label, idx) => {
            const angle = (idx * 90 - 90) * Math.PI / 180;
            const val = stats[label] / 100;
            const x = cx + Math.cos(angle) * r * val;
            const y = cy + Math.sin(angle) * r * val;
            idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // 결과 페이지 공유 버튼 이벤트 (v2.1.0 추가)
    const resultShareBtn = document.getElementById('result-share-btn');
    if(resultShareBtn) {
        resultShareBtn.onclick = async () => {
            const siteUrl = window.location.href;
            if (navigator.share) {
                try {
                    await navigator.share({ title: `7Check - ${test.title}`, text: test.desc, url: siteUrl });
                    await addPoints(30, '테스트 공유 보상');
                } catch (e) {}
            } else {
                await copyLink(siteUrl);
            }
        };
    }

    // 인스타용 저장 버튼 이벤트
    const storyBtn = document.getElementById('save-story-btn');
    if(storyBtn) {
        storyBtn.onclick = async () => {
            storyBtn.disabled = true;
            storyBtn.textContent = "생성 중...";
            const success = await saveAsStoryImage('story-capture-area', `7Check_${test.title.replace(/\s/g, '_')}.png`);
            if(success) alert("인스타 스토리 최적화 이미지가 저장되었습니다! 📸\n30P가 적립되었습니다.");
            storyBtn.disabled = false;
            storyBtn.innerHTML = "<span>📸</span> 인스타용 저장";
        };
    }
}
function renderAbout() {
    app.innerHTML = `
        <div class="card guide-container fade-in">
            <h2 style="margin-bottom: 1.5rem; color: var(--accent-color);">✨ SevenCheck: 나를 찾는 여정</h2>
            <div style="line-height: 1.9; color: var(--text-main);">
                <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem;">"딱 7번의 질문으로, 당신의 내면을 비춥니다."</p>
                <p>SevenCheck Studio는 심리학적 통찰과 디지털 재미를 결합하여, 바쁜 현대인들이 잠시나마 자신을 돌아볼 수 있는 '마음의 쉼터'를 지향합니다.</p>
                <div style="background: var(--bg-color); padding: 1.5rem; border-radius: var(--radius-md); margin: 2rem 0;">
                    <h4 style="margin-bottom: 0.8rem;">🚀 우리의 미션</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li>✅ 정교한 분석을 통한 자아 발견 도구 제공</li>
                        <li>✅ 심리 테스트와 게임화를 통한 즐거운 사용자 경험</li>
                        <li>✅ 수집과 성장의 재미를 느낄 수 있는 오락실 시스템</li>
                    </ul>
                </div>
                <p>우리는 단순히 결과를 보여주는 것에 그치지 않고, 당신이 가진 고유한 매력(Aura)을 발견하고 이를 가꿀 수 있는 커뮤니티를 만들어 갑니다.</p>
            </div>
        </div>`;
}

function renderPrivacy() {
    app.innerHTML = `
        <div class="card legal-page fade-in">
            <h2 style="margin-bottom: 2rem; color: var(--accent-color);">🔒 개인정보처리방침</h2>
            <div class="legal-content" style="line-height: 1.8; font-size: 0.95rem; color: var(--text-main);">
                <p style="margin-bottom: 1.5rem;">SevenCheck Studio(이하 "서비스")는 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 및 관련 법령을 준수합니다.</p>

                <h4 style="margin-top: 1.5rem;">1. 수집하는 개인정보 항목</h4>
                <p>- 회원가입 시: 이메일 주소, 닉네임 (Google 소셜 로그인 경유)<br>
                   - 서비스 이용 시: 테스트 결과, 포인트 및 아이템 정보, 게시글/댓글, 접속 기록</p>

                <h4 style="margin-top: 1.5rem;">2. 개인정보의 수집 및 이용 목적</h4>
                <p>- 회원 식별 및 서비스 제공<br>
                   - 랭킹, 도감 등 게임화 기능 운영<br>
                   - 서비스 개선 및 통계 분석</p>

                <h4 style="margin-top: 1.5rem;">3. 개인정보의 보유 및 이용 기간</h4>
                <p>회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>

                <h4 style="margin-top: 1.5rem;">4. 제3자 서비스 이용 안내 (Google AdSense)</h4>
                <p>본 서비스는 Google AdSense를 통해 광고를 게재합니다. Google은 쿠키를 사용하여 이용자의 관심사에 기반한 광고를 표시할 수 있습니다.</p>
                <p style="margin-top: 0.75rem;">- Google의 광고 쿠키 사용으로 인해, 이용자가 본 서비스 또는 다른 웹사이트를 방문할 때 Google이 광고를 게재할 수 있습니다.<br>
                   - 이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" style="color: var(--accent-color);">Google 광고 설정</a> 페이지에서 맞춤 광고를 비활성화할 수 있습니다.<br>
                   - 또한 <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener" style="color: var(--accent-color);">aboutads.info</a>를 방문하여 관심 기반 광고에 사용되는 제3자 벤더의 쿠키를 비활성화할 수 있습니다.</p>

                <h4 style="margin-top: 1.5rem;">5. 이용자의 권리</h4>
                <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다. 개인정보 관련 문의는 아래 연락처로 접수하십시오.</p>

                <h4 style="margin-top: 1.5rem;">6. 개인정보 보호 책임자</h4>
                <p>이메일: sunofox.official@gmail.com</p>

                <p style="margin-top: 2rem; font-size: 0.85rem; color: var(--text-sub);">본 방침은 2025년 1월 1일부터 시행됩니다.</p>
            </div>
        </div>`;
}

function renderTerms() {
    app.innerHTML = `
        <div class="card legal-page fade-in">
            <h2 style="margin-bottom: 2rem; color: var(--accent-color);">📜 이용약관</h2>
            <div class="legal-content" style="line-height: 1.8; font-size: 0.95rem; color: var(--text-main);">
                <h4 style="margin-top: 1.5rem;">1. 서비스 이용</h4>
                <p>이용자는 본 약관을 준수해야 하며, 타인의 정보를 도용하거나 서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</p>
                <h4 style="margin-top: 1.5rem;">2. 포인트 및 아이템 (Arcade System)</h4>
                <p>- 서비스 내에서 획득한 포인트(P)와 아이템은 현금으로 환전할 수 없습니다.<br>- 부정한 방법으로 획득한 포인트는 사전 고지 없이 회수될 수 있습니다.<br>- 아이템의 가치는 서비스 업데이트에 따라 변동될 수 있습니다.</p>
                <h4 style="margin-top: 1.5rem;">3. 커뮤니티 이용 규칙</h4>
                <p>게시판 이용 시 욕설, 비방, 광고성 게시글은 관리자에 의해 삭제될 수 있으며, 반복 시 이용이 제한될 수 있습니다.</p>
                <h4 style="margin-top: 1.5rem;">4. 면책 사항</h4>
                <p>심리 테스트 결과는 통계적 경향성에 기반한 것으로, 의학적 진단이나 법적 판단의 근거로 사용될 수 없습니다.</p>
            </div>
        </div>`;
}

function renderContact() {
    app.innerHTML = `
        <div class="card guide-container fade-in" style="text-align:center; padding: 4rem 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1.5rem;">📧</div>
            <h2 style="margin-bottom: 1rem; color: var(--accent-color);">무엇을 도와드릴까요?</h2>
            <p style="color: var(--text-sub); margin-bottom: 2.5rem;">서비스 이용 중 불편한 점이나 제휴 제안이 있으시면 언제든 연락주세요.</p>
            
            <div style="display: grid; gap: 1rem; max-width: 400px; margin: 0 auto; text-align: left;">
                <div style="background: var(--bg-color); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <small style="color: var(--text-sub); display: block; margin-bottom: 0.3rem;">공식 이메일</small>
                    <strong style="font-size: 1.1rem;">sunofox.official@gmail.com</strong>
                </div>
                <div style="background: var(--bg-color); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <small style="color: var(--text-sub); display: block; margin-bottom: 0.3rem;">운영 시간</small>
                    <strong style="font-size: 1.1rem;">평일 10:00 - 18:00 (KST)</strong>
                </div>
            </div>
            
            <p style="margin-top: 3rem; font-size: 0.85rem; color: var(--text-sub);">보통 영업일 기준 24시간 이내에 답변을 드립니다.</p>
        </div>`;
}

async function renderEncyclopedia() {
    const discovered = UserState.data?.discoveredItems || [];
    
    const ITEM_DESCRIPTIONS = {
        '💩 돌멩이': '어디서나 흔히 볼 수 있는 평범한 돌멩이입니다. 가치는 낮지만 수집의 시작입니다.',
        '💊 물약': '기력을 회복시켜주는 기초적인 물약입니다. 연금술의 단골 재료입니다.',
        '🌱 묘목': '작고 소중한 생명의 시작입니다. 정성껏 돌보면 큰 나무가 될 잠재력이 있습니다.',
        '🥉 동메달': '노력의 결실로 얻은 구리빛 메달입니다. 수집가로서의 첫 발걸음을 상징합니다.',
        '🥈 은메달': '뛰어난 성취를 증명하는 은빛 메달입니다. 상당한 가치를 지니고 있습니다.',
        '🌳 일반 나무': '울창한 잎을 가진 평범하지만 든든한 나무입니다. 자연의 기운을 담고 있습니다.',
        '🥇 금메달': '최고의 영광을 상징하는 황금빛 메달입니다. 모든 수집가가 탐내는 귀한 아이템입니다.',
        '🍀 행운의 클로버': '발견하는 것만으로도 행운을 가져다준다는 희귀한 네잎 클로버입니다.',
        '🌲 전나무': '추운 겨울에도 푸르름을 잃지 않는 강인한 나무입니다. 고결한 분위기를 자아냅니다.',
        '🍎 사과나무': '달콤한 결실을 맺는 풍요로운 나무입니다. 보기만 해도 마음이 풍성해집니다.',
        '💎 다이아몬드': '영원히 변치 않는 광채를 뿜어내는 최상급 보석입니다. 엄청난 가치를 자랑합니다.',
        '🧪 현자의 돌': '모든 물질을 금으로 바꿀 수 있다는 전설의 촉매제입니다. 연금술의 정점입니다.',
        '🧬 인공 생명체': '금단의 연금술로 탄생한 신비로운 존재입니다. 생명의 신비를 담고 있습니다.',
        '⚡ 번개 병': '폭풍우 치는 밤의 강력한 번개를 병 속에 가두었습니다. 엄청난 에너지가 요동칩니다.',
        '🌌 은하수 가루': '밤하늘의 은하수를 한 줌 담아온 듯한 신비로운 가루입니다. 우주의 기운이 느껴집니다.',
        '✨ 생명의 나무': '신화 속에서나 존재한다는 전설의 나무입니다. 영원한 생명력의 원천입니다.'
    };

    app.innerHTML = `
        <div class="book-page fade-in">
            <button onclick="location.hash='#guide'" class="btn-secondary" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px; font-weight: 800; padding: 0.6rem 1.2rem; background: var(--card-bg); border-radius: 50px; box-shadow: var(--shadow-sm);">
                ← 가이드로 돌아가기
            </button>

            <div class="card book-header" style="background: linear-gradient(135deg, #1e293b, #334155); color:#fff; border:none; padding:3rem 1.5rem; text-align:center; border-radius: var(--radius-lg); margin-bottom:2rem;">
                <h2 style="font-size:2.2rem; font-weight:900; margin-bottom:0.5rem;">📒 아이템 도감</h2>
                <p style="opacity:0.9; font-weight:600;">세븐 오락실에서 발견한 모든 보물들의 상세 정보</p>
                <div style="margin-top:1.5rem; display:inline-block; background:rgba(255,255,255,0.1); padding:0.5rem 1.5rem; border-radius:50px; font-size:0.9rem; font-weight:800;">
                    수집률: ${discovered.length} / ${Object.keys(ITEM_VALUES).length} (${Math.round((discovered.length / Object.keys(ITEM_VALUES).length) * 100)}%)
                </div>
            </div>

            <!-- Item Value & Acquisition Guide -->
            <div class="card" style="margin-bottom: 2rem; background: var(--bg-color); border: 1px solid var(--accent-soft); padding: 1.5rem;">
                <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 1rem; color: var(--accent-color); display: flex; align-items: center; gap: 8px;">
                    💡 아이템 가치 및 획득 가이드
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; font-weight: 800;">💎 가치 산정 방식</h4>
                        <p style="font-size: 0.85rem; color: var(--text-sub); line-height: 1.6;">
                            아이템의 가치는 <strong>희귀도(Grade)</strong>에 따라 결정됩니다. 등급이 높을수록 획득 확률이 낮아지며, 인벤토리에 보유한 모든 아이템의 가치 총합이 나의 <strong>'통합 아이템 점수'</strong>가 됩니다.
                        </p>
                    </div>
                    <div>
                        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; font-weight: 800;">🧪 효율적인 획득 방법</h4>
                        <ul style="font-size: 0.85rem; color: var(--text-sub); line-height: 1.6; padding-left: 1.2rem;">
                            <li><strong>뽑기:</strong> 가장 기본적인 획득 경로입니다.</li>
                            <li><strong>연금술:</strong> 낮은 등급 아이템 6개를 확정적으로 상위 등급으로 변환하여 가치를 크게 뻥튀기할 수 있습니다.</li>
                            <li><strong>복권:</strong> 낮은 확률로 '다이아몬드' 같은 고가치 아이템을 획득합니다.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; font-weight: 800;">🏆 명예와 랭킹</h4>
                        <p style="font-size: 0.85rem; color: var(--text-sub); line-height: 1.6;">
                            모은 점수에 따라 <strong>ROOKIE부터 DIAMOND</strong>까지 티어가 결정됩니다. 고가치 아이템을 많이 수집하여 명예의 전당(랭킹)에 이름을 올려보세요!
                        </p>
                    </div>
                </div>
            </div>

            ${Object.entries(ITEM_GRADES).map(([grade, items]) => `
                <div class="card" style="margin-bottom:2rem; border-left: 6px solid var(--color-${grade.toLowerCase()}, #ccc);">
                    <h3 style="margin-bottom:1.5rem; font-size:1.1rem; display:flex; align-items:center; gap:10px;">
                        ${grade === 'LEGENDARY' ? '✨' : grade === 'RARE' ? '💎' : grade === 'UNCOMMON' ? '🥈' : '💩'} 
                        ${grade} 아이템
                    </h3>
                    <div class="book-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
                        ${items.map(name => {
                            const isUnlocked = discovered.includes(name);
                            const icon = name.split(' ')[0];
                            const label = name.substring(name.indexOf(' ') + 1);
                            const desc = ITEM_DESCRIPTIONS[name] || '정보가 없습니다.';
                            
                            return `
                                <div class="book-item-card ${isUnlocked ? 'unlocked' : 'locked'}" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 15px; padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s; ${isUnlocked ? '' : 'opacity: 0.6; filter: grayscale(0.8);'}">
                                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                        <div style="font-size: 2.5rem; background: var(--bg-color); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid var(--border-color);">
                                            ${isUnlocked ? icon : '❓'}
                                        </div>
                                        <div>
                                            <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.2rem;">${isUnlocked ? label : '???'}</h4>
                                            <span style="font-size: 0.85rem; font-weight: 900; color: var(--accent-color);">${ITEM_VALUES[name]}P</span>
                                        </div>
                                    </div>
                                    <p style="font-size: 0.85rem; line-height: 1.6; color: var(--text-sub); min-height: 3rem;">
                                        ${isUnlocked ? desc : '아직 발견하지 못한 아이템입니다. 오락실 활동을 통해 획득할 수 있습니다.'}
                                    </p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderGuide() {
    app.innerHTML = `
        <div class="guide-page fade-in">
            <div class="card guide-header" style="text-align:center; padding: 3.5rem 1.5rem; background: linear-gradient(135deg, var(--color-guide), #94a3b8); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg);">
                <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 0.75rem;">📖 이용 가이드</h2>
                <p style="opacity: 0.9; font-size: 1.1rem; font-weight: 600;">SevenCheck을 완벽하게 즐기는 방법을 안내해 드립니다.</p>
            </div>

            <details class="profile-details" open>
                <summary>🧠 심리 테스트 및 분석</summary>
                <div class="content-area">
                    <p style="margin-bottom: 1.25rem; line-height: 1.7;">SevenCheck의 모든 테스트는 <strong>딱 7번의 질문</strong>으로 당신의 잠재력과 본모습을 정교하게 분석합니다.</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div style="background: var(--bg-color); padding: 1.25rem; border-radius: 12px;">
                            <h4 style="color: var(--color-personality); margin-bottom: 0.5rem;">다양한 카테고리</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">성격, 비주얼, 운세, 재미 등 당신이 궁금한 모든 분야의 리포트를 제공합니다.</p>
                        </div>
                        <div style="background: var(--bg-color); padding: 1.25rem; border-radius: 12px;">
                            <h4 style="color: var(--accent-secondary); margin-bottom: 0.5rem;">참여 보상</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">테스트 완료 시 기본 10P와 분석 결과에 따른 <strong>희귀 아이템</strong>이 지급됩니다.</p>
                        </div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>💰 포인트 및 부스터 시스템</summary>
                <div class="content-area">
                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <div>
                            <h4 style="color: var(--accent-color); margin-bottom: 0.5rem; font-size: 1.1rem;">포인트(P) 활용처</h4>
                            <p style="font-size: 0.95rem; line-height: 1.6;">모은 포인트는 오락실 게임 참여, 게시글 강조, 그리고 상점에서 희귀 이모지, 테두리, 배경을 교환하는 데 사용됩니다.</p>
                        </div>
                        <div style="background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); padding: 1.5rem; border-radius: 15px; border: 2px solid var(--accent-soft);">
                            <h4 style="color: var(--accent-color); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">⚡ 슈퍼 부스터 (Super Booster)</h4>
                            <p style="font-size: 0.9rem; line-height: 1.6; font-weight: 600;">오락실에서 부스터를 충전하면 다음 20회의 테스트 완료 보상이 <strong>무조건 2배(20P)</strong>로 적용되어 빠른 성장이 가능합니다.</p>
                        </div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>🎰 세븐 오락실 (Seven Arcade)</summary>
                <div class="content-area">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.25rem;">
                        <div style="border-left: 3px solid var(--accent-color); padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">⛏️ 포인트 채굴</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">비용 없이 클릭만으로 5~15P를 지속적으로 생산합니다.</p>
                        </div>
                        <div style="border-left: 3px solid #fda085; padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">🎰 이모지 슬롯</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">3개의 이모지를 맞춰 최대 <strong>5,000P 잭팟</strong>을 노려보세요.</p>
                        </div>
                        <div style="border-left: 3px solid #f43f5e; padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">🧨 폭탄 돌리기</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">안전한 전선을 끊어 포인트를 누적하세요. 위험하지만 보상은 강력합니다.</p>
                        </div>
                        <div style="border-left: 3px solid var(--accent-secondary); padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">⚗️ 아이템 연금술</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">낮은 등급 아이템 6개를 합성하여 확정적으로 상위 아이템을 연성합니다.</p>
                        </div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>✨ 실시간 프로필 동기화</summary>
                <div class="content-area">
                    <p style="margin-bottom: 1rem; line-height: 1.7;">SevenCheck은 최신 웹 기술을 통해 <strong>실시간 프로필 동기화</strong>를 지원합니다.</p>
                    <ul style="font-size: 0.95rem; line-height: 1.8; color: var(--text-main);">
                        <li>✅ 닉네임이나 이모지를 변경하면 <strong>과거에 쓴 모든 게시물과 댓글</strong>이 즉시 업데이트됩니다.</li>
                        <li>✅ 상점에서 구매한 <strong>오라, 테두리, 배경</strong>도 실시간으로 모든 화면에 반영됩니다.</li>
                        <li>✅ 내가 획득한 티어(등급) 배지는 랭킹과 프로필에서 실시간으로 확인할 수 있습니다.</li>
                    </ul>
                </div>
            </details>

            <details class="profile-details">
                <summary>🏆 등급 및 랭킹</summary>
                <div class="content-area">
                    <p style="margin-bottom: 1.25rem;">보유한 모든 아이템의 가치를 합산한 <strong>'아이템 점수'</strong>로 당신의 명예가 결정됩니다.</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-color); padding: 1.5rem; border-radius: 12px; font-weight: 800; font-size: 0.85rem; overflow-x: auto; white-space: nowrap; gap: 10px;">
                        <span>ROOKIE</span> ➔ <span>BRONZE</span> ➔ <span>SILVER</span> ➔ <span>GOLD</span> ➔ <span>PLATINUM</span> ➔ <span style="color: var(--accent-color);">DIAMOND</span>
                    </div>
                    <p style="margin-top: 1.25rem; font-size: 0.95rem;">상위 10명의 수집가는 <strong>명예의 전당</strong>에 실시간으로 등재되어 모든 사용자에게 공개됩니다.</p>
                </div>
            </details>

            <details class="profile-details">
                <summary>💬 커뮤니티 매너</summary>
                <div class="content-area" style="line-height: 1.8; font-size: 0.95rem;">
                    <p>1. 모든 사용자는 서로를 존중하며 따뜻한 언어를 사용해야 합니다.</p>
                    <p>2. <strong>게시글 강조(Premium)</strong> 기능을 사용하면 화려한 효과와 함께 리스트 상단에 노출됩니다.</p>
                    <p>3. 도배, 욕설, 광고 등 부적절한 활동은 서비스 이용이 제한될 수 있습니다.</p>
                </div>
            </details>

            <!-- Encyclopedia CTA -->
            <div class="card" style="margin-top: 2.5rem; background: linear-gradient(135deg, #334155, #1e293b); color: #fff; border: none; text-align: center; padding: 2.5rem 1.5rem;">
                <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.75rem;">📒 수집한 아이템이 궁금하신가요?</h3>
                <p style="opacity: 0.8; font-size: 0.9rem; margin-bottom: 1.5rem;">지금까지 발견한 모든 아이템의 상세 정보와 가치를 확인해보세요.</p>
                <button onclick="location.hash='#book'" class="btn-primary" style="background: var(--accent-color); border: none; padding: 0.8rem 2rem; font-weight: 800;">아이템 도감 열기</button>
            </div>
        </div>
    `;
}

function renderTestExecution(testId) {
    const test = TESTS.find(t => t.id === testId);
    if (!test) return;
    let step = 0;
    const traitScores = { energy: 0, logic: 0, empathy: 0, creativity: 0 };
    let history = []; 

    const renderIntro = () => {
        app.innerHTML = `
            <div class="test-intro-container fade-in" style="padding: 2rem 1.5rem 4rem; max-width: 500px; margin: 0 auto; text-align: center;">
                <div class="test-visual-header" style="margin-top: 2rem; margin-bottom: 2.5rem;">
                    <div class="test-thumb-wrapper" style="width: 120px; height: 120px; margin: 0 auto; border-radius: 30px; overflow: hidden; box-shadow: var(--shadow-lg); border: 4px solid var(--card-bg);">
                        <img src="${test.thumb}" alt="" style="width:100%; height:100%; object-fit:cover;" onerror="window.handleImgError(this)">
                    </div>
                    <span class="test-category-tag" style="margin-top: 1.5rem; display: inline-block;">${test.category} 분석</span>
                    <h2 style="font-size: 2rem; font-weight: 900; margin-top: 1rem; line-height: 1.3;">${test.title}</h2>
                </div>
                
                <div class="card" style="padding: 2rem; margin-bottom: 2.5rem; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); border-radius: 24px; border: 1px solid rgba(255,255,255,0.3);">
                    <h4 style="font-size: 0.9rem; color: var(--accent-color); font-weight: 800; margin-bottom: 1rem; letter-spacing: 0.1em;">TEST PURPOSE</h4>
                    <p style="font-size: 1.1rem; line-height: 1.7; color: var(--text-main); font-weight: 600; word-break: keep-all;">${test.desc}</p>
                </div>

                <div style="display: grid; gap: 1rem;">
                    <button id="test-start-btn" class="btn-primary" style="height: 65px; font-size: 1.2rem; font-weight: 900; border-radius: 20px; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);">테스트 시작하기</button>
                    <button id="test-share-btn" class="btn-secondary" style="height: 60px; font-size: 1rem; font-weight: 800; border-radius: 20px; display: flex; align-items: center; justify-content: center; gap: 8px;">🔗 이 테스트 공유하기</button>
                </div>
                
                <button onclick="location.hash='#7check'" style="margin-top: 2rem; background: none; border: none; color: var(--text-sub); font-weight: 700; font-size: 0.9rem; text-decoration: underline; cursor: pointer;">다른 테스트 둘러보기</button>
            </div>
        `;

        const startBtn = document.getElementById('test-start-btn');
        if (startBtn) startBtn.onclick = () => updateStep();

        const shareBtn = document.getElementById('test-share-btn');
        if (shareBtn) {
            shareBtn.onclick = async () => {
                const siteUrl = window.location.href;
                if (navigator.share) {
                    try {
                        await navigator.share({ title: `7Check - ${test.title}`, text: test.desc, url: siteUrl });
                        await addPoints(30, '테스트 공유 보상');
                    } catch (e) {}
                } else {
                    await copyLink(siteUrl);
                }
            };
        }
    };

    const updateStep = () => {
        if (step >= 7) { renderResult(testId, traitScores); return; }
        const qData = test.questions[step];
        app.innerHTML = `
            <div class="test-container slide-up" data-cat="${test.category}" style="padding: 2rem 1.5rem 4rem; max-width: 500px; margin: 0 auto; text-align: center; position: relative;">
                <button id="test-back-btn" class="btn-secondary" style="position: absolute; top: 1rem; left: 1rem; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem; border: none; background: rgba(0,0,0,0.05); display: ${step > 0 ? 'inline-block' : 'none'};">← 이전</button>
                
                <div class="test-visual-header" style="margin-top: 3rem; margin-bottom: 2rem;">
                    <div class="test-thumb-mini-wrapper" style="width: 80px; height: 80px; margin: 0 auto; border-radius: 50%; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border: 3px solid var(--card-bg);">
                        <img src="${test.thumb}" alt="" style="width:100%; height:100%; object-fit:cover;" onerror="window.handleImgError(this)">
                    </div>
                    <div style="font-size: 0.8rem; font-weight: 800; color: var(--text-sub); margin-top: 0.8rem; letter-spacing: 0.05em;">${test.title}</div>
                </div>

                <div style="margin-bottom: 3rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span class="step-counter">QUESTION ${String(step + 1).padStart(2, '0')} / 07</span>
                        <span style="font-weight: 800; color: var(--text-sub); font-size: 0.85rem;">${Math.round(((step + 1) / 7) * 100)}%</span>
                    </div>
                    <div class="progress-mini">
                        <div class="progress-mini-fill" style="width: ${((step + 1) / 7) * 100}%;"></div>
                    </div>
                </div>
                
                <h2 class="test-question">${qData.q}</h2>
                
                <div class="options-grid">
                    ${qData.options.map((opt, idx) => `
                        <button class="option-btn slide-up" style="animation-delay: ${idx * 0.1}s;" 
                            data-scores='${JSON.stringify(opt.scores || {e: (opt.type==='A'?2:0), p: (opt.type==='B'?2:0)})}'>
                            <span class="opt-label">${String.fromCharCode(65 + idx)}</span>
                            <span class="opt-text">${opt.text}</span>
                        </button>`).join('')}
                </div>
            </div>`;
        
        const backBtn = document.getElementById('test-back-btn');
        if(backBtn) {
            backBtn.onclick = () => {
                if(step > 0) {
                    step--;
                    const prevScores = history.pop();
                    traitScores.energy = prevScores.energy;
                    traitScores.logic = prevScores.logic;
                    traitScores.empathy = prevScores.empathy;
                    traitScores.creativity = prevScores.creativity;
                    updateStep();
                }
            };
        }

        app.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => {
                history.push({...traitScores}); // 현재 상태 저장
                const scores = JSON.parse(btn.dataset.scores);
                if(scores.e) traitScores.energy += scores.e;
                if(scores.l) traitScores.logic += scores.l;
                if(scores.p) traitScores.empathy += scores.p;
                if(scores.c) traitScores.creativity += scores.c;
                step++;
                updateStep();
            };
        });
    };
    renderIntro(); // 인트로 화면부터 시작
}

let lastGlobalShareTime = 0;
window.globalShareSite = async () => {
    const siteUrl = window.location.origin;
    const now = Date.now();
    
    const rewardUser = async () => {
        if (now - lastGlobalShareTime > 10000) { // 10 second throttle
            const success = await addPoints(30);
            if (success) lastGlobalShareTime = now;
        }
    };

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'SevenCheck - 7번의 질문으로 찾는 나의 본모습',
                text: '이 사이트 완전 대박이야! 너도 한번 해봐.',
                url: siteUrl
            });
            await rewardUser();
        } catch (e) {
            console.error(e);
        }
    } else {
        await copyLink(siteUrl);
        // copyLink already rewards 30 points.
    }
};

const headerShareBtn = document.getElementById('share-site-btn');
    if (headerShareBtn) {
    headerShareBtn.onclick = window.globalShareSite;
}

themeToggle.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '✨';
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
initAuth();
router();

// --- Visitor Stats Functions ---
async function trackVisit() {
    try {
        if (sessionStorage.getItem('sc_visit')) return;
        const kstDate = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
        await setDoc(doc(db, 'siteStats', 'global'), { total: increment(1) }, { merge: true });
        await setDoc(doc(db, 'siteStats', kstDate), { count: increment(1) }, { merge: true });
        sessionStorage.setItem('sc_visit', '1');
    } catch (e) { console.error('Visit tracking failed', e); }
}

async function renderVisitorStats() {
    try {
        const el = document.getElementById('visitor-stats');
        if (!el) return;
        
        const kstDate = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
        const [gSnap, dSnap] = await Promise.all([
            getDoc(doc(db, 'siteStats', 'global')),
            getDoc(doc(db, 'siteStats', kstDate))
        ]);
        
        // 기초 숫자 설정 (조작)
        const baseTotal = 48290;
        const baseToday = 1540;
        
        let total = baseTotal;
        let today = baseToday;

        if (gSnap.exists()) total += gSnap.data().total;
        if (dSnap.exists()) today += dSnap.data().count;
        
        const totalEl = document.getElementById('total-visitors');
        const todayEl = document.getElementById('today-visitors');
        if (totalEl) totalEl.textContent = total.toLocaleString();
        if (todayEl) todayEl.textContent = today.toLocaleString();
    } catch (e) { console.error('Stats loading failed', e); }
}
authReady.then(() => { router(); });
