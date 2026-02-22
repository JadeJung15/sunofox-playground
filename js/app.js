// js/app.js
import { initAuth, updateUI, UserState, addPoints, EMOJI_SHOP, getTier, TIERS } from './auth.js';
import { initArcade } from './arcade.js';
import { copyLink, shareTest } from './share.js';
import { renderBoard } from './board.js';
import { renderRanking } from './ranking.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, increment, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=500&q=60`;
const categories = ['성격', '얼굴', '사주', '재미'];
const TESTS = [];
for (let i = 0; i < 40; i++) {
    const cat = categories[Math.floor(i / 10)];
    const id = (cat === '성격' ? 'p' : cat === '얼굴' ? 'f' : cat === '사주' ? 't' : 'u') + ((i % 10) + 1);
    TESTS.push({
        id: id, category: cat,
        title: `${cat} 테마 분석 ${ (i % 10) + 1 }`,
        desc: `당신의 ${cat}적 성향과 무의식을 정교하게 분석하는 리포트입니다.`,
        thumb: unsplash(`15${i}123456789`),
        questions: Array.from({length: 7}, (_, qIdx) => ({
            q: `${cat}에 관한 심층 질문입니다. 당신은 어떤 선택을 하시겠습니까?`,
            options: [{ text: `A: 저는 이 방향을 선호합니다.`, type: 'A' }, { text: `B: 저는 저 방향이 더 끌립니다.`, type: 'B' }]
        })),
        results: {
            A: { title: '유형 Alpha', desc: '당신은 주도적이며 명확한 가치관을 가진 분이시군요!', img: unsplash(`15${i}987654321`) },
            B: { title: '유형 Beta', desc: '당신은 유연하며 주변과 조화를 이루는 매력적인 분이시군요!', img: unsplash(`15${i}111222333`) }
        }
    });
}

const categoryMap = { '#personality': '성격', '#face': '얼굴', '#fortune': '사주', '#fun': '재미', '#arcade': '오락실', '#board': '게시판', '#profile': '프로필', '#ranking': '랭킹', '#guide': '가이드' };
let currentFilter = '전체';

async function router() {
    const hash = window.location.hash || '#home';
    navLinks.forEach(link => {
        const filter = link.dataset.filter;
        link.classList.toggle('active', (hash === '#home' && filter === '전체') || hash.includes(filter?.toLowerCase()));
    });
    app.innerHTML = ''; 
    if (hash === '#privacy') renderPrivacy();
    else if (hash === '#about') renderAbout();
    else if (hash === '#arcade') renderArcade();
    else if (hash === '#board') await renderBoard(app);
    else if (hash === '#ranking') await renderRanking(app);
    else if (hash === '#guide') renderGuide();
    else if (hash === '#profile') renderProfile();
    else if (hash.startsWith('#test/')) renderTestExecution(hash.split('/')[1]);
    else {
        currentFilter = categoryMap[hash] || '전체';
        await renderHome();
    }
    window.scrollTo(0, 0);
}

// 좋아요 수 가져오기 전용 데이터 저장소
let testLikesData = {};

async function fetchAllLikes() {
    try {
        const snap = await getDocs(collection(db, "testStats"));
        snap.forEach(doc => { testLikesData[doc.id] = doc.data().likes || 0; });
    } catch (e) { console.error(e); }
}

async function handleLike(testId) {
    if (!UserState.user) return alert("로그인이 필요한 기능입니다.");
    
    // 로컬 중복 방지 (간단하게 세션 스토리지 사용)
    if (sessionStorage.getItem(`liked_${testId}`)) return alert("이미 좋아요를 누르셨습니다!");

    try {
        const statsRef = doc(db, "testStats", testId);
        const snap = await getDoc(statsRef);
        if (!snap.exists()) {
            await setDoc(statsRef, { likes: 1 });
        } else {
            await updateDoc(statsRef, { likes: increment(1) });
        }
        
        sessionStorage.setItem(`liked_${testId}`, "true");
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(10); // 보너스 포인트 (10P로 상향)
        alert("좋아요가 반영되었습니다! (+10P)");
        
        // UI 즉시 업데이트 (현재 결과 화면인 경우)
        const likeCounter = document.getElementById(`like-count-${testId}`);
        if (likeCounter) likeCounter.textContent = testLikesData[testId];
    } catch (e) { console.error(e); }
}

async function renderHome() {
    const authHeader = `
        <div class="card mini-profile-bar" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
            ${UserState.user ? 
                `<div style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;" onclick="location.hash='#profile'">
                    <span id="user-emoji" style="font-size:1.5rem;">${UserState.data.emoji || '👤'}</span>
                    <div style="display:flex; flex-direction:column;">
                        <strong id="user-name" style="font-size:0.9rem;">${UserState.data.nickname}</strong>
                        <div class="tier-display"></div>
                    </div>
                 </div>
                 <div style="display:flex; gap:0.5rem;">
                    <button onclick="location.hash='#ranking'" class="btn-secondary" style="width: auto; padding: 0.4rem 0.8rem; font-size: 0.8rem;">🏆 랭킹</button>
                 </div>` :
                `<span>로그인하고 혜택 받기</span>
                 <button id="login-btn" class="btn-primary" style="width: auto; padding: 0.4rem 0.8rem; font-size: 0.8rem;">로그인</button>`
            }
        </div>
    `;

    await fetchAllLikes(); // 모든 좋아요 데이터 로드
    const filtered = currentFilter === '전체' ? TESTS : TESTS.filter(t => t.category === currentFilter);
    
    app.innerHTML = authHeader + `<div class="test-grid">${filtered.map(t => {
        const likes = testLikesData[t.id] || 0;
        return `
            <div class="test-card fade-in" onclick="location.hash='#test/${t.id}'">
                <div class="test-thumb" style="background-image: url('${t.thumb}')">
                    <div class="like-badge">❤️ ${likes}</div>
                </div>
                <div class="test-info">
                    <span class="test-category-tag">${t.category}</span>
                    <h3>${t.title}</h3>
                    <p>${t.desc}</p>
                </div>
            </div>
        `;
    }).join('')}</div>`;
    updateUI(); 
}

// ... renderProfile, renderArcade, renderGuide 생략 (기존 코드 유지) ...
function renderProfile() {
    if (!UserState.user) { app.innerHTML = `<div class="card" style="text-align:center; padding:3rem;"><h2>👤 프로필</h2><button id="login-btn" class="btn-primary" style="margin-top:1rem;">로그인하기</button></div>`; return; }
    const inv = UserState.data.inventory || [];
    const groupedInv = inv.reduce((acc, item) => { acc[item] = (acc[item] || 0) + 1; return acc; }, {});
    const invHTML = Object.entries(groupedInv).length > 0 ? Object.entries(groupedInv).map(([name, count]) => `<div class="inv-item"><span class="inv-name">${name}</span><span class="inv-count">x${count}</span></div>`).join('') : '<p class="text-sub">획득한 아이템이 없습니다.</p>';
    const unlocked = UserState.data.unlockedEmojis || ['👤'];
    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);
    const nameColors = ['#333333', '#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#6c5ce7', '#ff6b81'];
    const unlockedColors = UserState.data.unlockedColors || ['#333333'];
    app.innerHTML = `
        <div class="card profile-container fade-in">
            <div style="text-align:center; margin-bottom:2rem;">
                <div id="user-emoji" style="font-size:4.5rem; margin-bottom:0.5rem;">${UserState.data.emoji || '👤'}</div>
                <div class="tier-display"></div>
                <h2 id="user-name" style="margin:0.5rem 0;">${UserState.data.nickname}</h2>
                <div class="progress-section" style="max-width:300px; margin:0 auto;">
                    <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
                    <p class="text-sub" style="font-size:0.75rem;">다음 등급까지: ${Math.max(0, nextTier.min - currentScore).toLocaleString()} 점 남음</p>
                </div>
                <div class="profile-stats" style="margin-top:1.5rem;">
                    <div class="stat-item"><span class="stat-label">랭킹 점수</span><span class="stat-value" id="user-total-score">0 점</span></div>
                    <div class="stat-item"><span class="stat-label">보유 포인트</span><span class="stat-value" id="user-points">0 P</span></div>
                </div>
            </div>
            <details class="profile-details" open><summary>🎒 내 인벤토리</summary><div class="inventory-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)); gap:0.5rem;">${invHTML}</div></details>
            <details class="profile-details"><summary>✨ 닉네임 컬러 샵 (2000P)</summary><div class="shop-wrapper"><div class="color-selector" style="display:flex; flex-wrap:wrap; gap:0.8rem;">${nameColors.map(c => `<button class="color-btn ${UserState.data.nameColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}; width:40px; height:40px; border-radius:50%; border:3px solid ${unlockedColors.includes(c) ? 'var(--accent-secondary)' : '#eee'}; cursor:pointer;"></button>`).join('')}</div></div></details>
            <details class="profile-details"><summary>🏪 이모지 교환소 (아이템 소모)</summary><div class="shop-wrapper"><p class="text-sub" style="margin-bottom:1rem; font-size:0.8rem; color:#ff4757;">⚠️ 주의: 교환 시 보유 아이템이 소모되어 랭킹 점수가 차감됩니다.</p>${Object.entries(EMOJI_SHOP).map(([catName, emojis]) => `<h4 style="margin-top:1rem; font-size:0.85rem; border-bottom:1px solid var(--border-color); padding-bottom:5px;">${catName}</h4><div class="emoji-selector" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap:0.5rem; margin-top:0.8rem;">${Object.entries(emojis).map(([e, price]) => {const isOwn = unlocked.includes(e); return `<button class="emoji-btn ${isOwn ? 'owned' : 'locked'} ${UserState.data.emoji === e ? 'active' : ''}" data-emoji="${e}"><span class="e-icon">${e}</span>${!isOwn ? `<span class="e-price">${price}</span>` : ''}</button>`;}).join('')}</div>`).join('')}</div></details>
            <details class="profile-details"><summary>⚙️ 계정 설정</summary><div class="profile-settings"><div class="setting-item"><label style="font-size:0.85rem; font-weight:bold;">닉네임 변경 (월 1회)</label><div class="input-row"><input type="text" id="nickname-input" placeholder="새 닉네임" maxlength="10"><button id="nickname-save" class="btn-primary" style="width: 80px;">변경</button></div><p id="nickname-msg" style="margin-top:0.5rem; font-size:0.8rem;"></p></div><button id="logout-btn" class="btn-secondary" style="margin-top:2rem; color:#ff4757; border-color:#ff4757;">로그아웃</button></div></details>
        </div>
    `;
    updateUI();
}

function renderArcade() {
    if (!UserState.user) { renderProfile(); return; }
    app.innerHTML = `
        <div class="card arcade-container fade-in">
            <h2 style="text-align:center;">🎰 오락실</h2>
            <div class="profile-stats" style="margin:1.5rem 0;"><div class="stat-item"><span class="stat-label">보유 포인트</span><span class="stat-value" id="user-points">0 P</span></div><div class="stat-item"><span class="stat-label">부스터 남음</span><span class="stat-value" style="color:var(--accent-secondary);">${UserState.data.boosterCount || 0}회</span></div></div>
            <details class="profile-details" open><summary>⚡ 슈퍼 포인트 부스터 상점</summary><div class="game-zone" style="background:#e3f2fd; border-radius:12px; padding:1.2rem;"><p class="text-sub">구매 시 다음 20번의 테스트 보상이 <strong>2배(20P)</strong>가 됩니다!</p><button id="buy-booster-btn" class="btn-primary" style="margin-top:1rem; background:#1976d2;">슈퍼 부스터 구매 (100P)</button></div></details>
            <details class="profile-details"><summary>🎫 인생역전! 럭키 복권</summary><div class="game-zone lotto-section" style="background:linear-gradient(135deg, #f6d365 0%, #fda085 100%); color:white; border-radius:12px; padding:1.2rem;"><div id="lotto-result" class="lotto-card" style="background:rgba(255,255,255,0.2); height:100px; display:flex; align-items:center; justify-content:center; margin-bottom:1rem; border-radius:10px; border:2px dashed #fff; font-weight:bold;">행운을 빌어요!</div><button id="lotto-btn" class="btn-primary" style="background:white; color:#fda085;">복권 구매하기 (500P)</button></div></details>
            <details class="profile-details"><summary>🎲 포인트 베팅 (홀짝/고저)</summary><div class="game-zone" style="background:#fff3f5; border-radius:12px; padding:1.2rem;"><div class="bet-input-area" style="margin-bottom: 1rem;"><input type="number" id="bet-amount" value="100" min="10" style="width:100%; padding:0.8rem; border-radius:10px; border:1px solid var(--border-color); text-align:center; font-size:1.2rem; font-weight:800;"></div><div id="bet-result-msg" style="height:40px; display:flex; align-items:center; justify-content:center; text-align:center; font-weight:bold; margin-bottom:1rem;">베팅 금액을 정하고 선택하세요!</div><div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;"><button class="bet-btn btn-primary" data-game="oddeven" data-choice="odd" style="background:#6c5ce7; font-size:0.9rem;">홀</button><button class="bet-btn btn-primary" data-game="oddeven" data-choice="even" style="background:#a29bfe; font-size:0.9rem;">짝</button><button class="bet-btn btn-secondary" data-game="dice" data-choice="low" style="font-size:0.9rem;">저 (1-3)</button><button class="bet-btn btn-secondary" data-game="dice" data-choice="high" style="font-size:0.9rem;">고 (4-6)</button></div></div></details>
                        <details class="profile-details">
                            <summary>📦 행운의 아이템 뽑기</summary>
                            <div class="game-zone" style="background:var(--bg-color); border-radius:12px; padding:1.2rem;">
                                <div id="gacha-result" class="gacha-box" style="min-height:100px; display:flex; align-items:center; justify-content:center; margin-bottom:1rem; border:2px dashed var(--border-color); border-radius:10px; padding:1rem; text-align:center;">준비 완료!</div>
                                <div style="display:grid; grid-template-columns: 1fr; gap:0.5rem;">
                                    <button id="gacha-btn" class="btn-primary">1회 뽑기 (100P)</button>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
                                        <button id="gacha-5-btn" class="btn-secondary" style="font-size:0.85rem;">5회 연속 (500P)</button>
                                        <button id="gacha-10-btn" class="btn-secondary" style="font-size:0.85rem; border-color:var(--accent-color); color:var(--accent-color);">10회 연속 (950P🔥)</button>
                                    </div>
                                </div>
                            </div>
                        </details>
            
                        <details class="profile-details">
                            <summary>🔮 아이템 연금술 (합성)</summary>
                            <div class="alchemy-zone" style="border-radius:12px; padding:1.2rem;">
                                <p class="text-sub" style="font-size:0.8rem; margin-bottom:1rem;">하급 아이템 5개를 소모하여 상급 1개를 연성합니다.</p>
                                <div id="alchemy-result" style="margin:1rem 0; font-weight:bold; text-align:center; min-height:40px; display:flex; align-items:center; justify-content:center; border:1px dashed rgba(255,255,255,0.3); border-radius:10px;">재료를 준비해 주세요.</div>
                                <div style="display:grid; grid-template-columns: 1fr; gap:0.5rem;">
                                    <button id="alchemy-btn" class="btn-primary" style="background:#fff; color:#6c5ce7;">1회 합성 (500P / 5개)</button>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
                                        <button id="alchemy-5-btn" class="btn-secondary" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid #fff; font-size:0.85rem;">5회 연속 (2500P / 25개)</button>
                                        <button id="alchemy-10-btn" class="btn-secondary" style="background:rgba(255,255,255,0.3); color:#fff; border:1px solid #fff; font-size:0.85rem;">10회 연속 (4500P🔥 / 50개)</button>
                                    </div>
                                </div>
                            </div>
                        </details>
            
            <details class="profile-details"><summary>⛏️ 단순 포인트 채굴</summary><div class="game-zone" style="background:var(--bg-color); border-radius:12px; padding:1.2rem;"><button id="click-game-btn" class="btn-secondary">클릭해서 채굴</button></div></details>
        </div>
    `;
    initArcade(); 
    document.getElementById('buy-booster-btn').onclick = async () => {
        if (await usePoints(100)) {
            const userRef = doc(db, "users", UserState.user.uid);
            await updateDoc(userRef, { boosterCount: increment(20) });
            UserState.data.boosterCount = (UserState.data.boosterCount || 0) + 20;
            updateUI(); alert("슈퍼 부스터 구매 완료!"); renderArcade();
        }
    };
    updateUI();
}

function renderGuide() {
    app.innerHTML = `
        <div class="card guide-container fade-in">
            <h2 style="text-align:center; margin-bottom:2rem;">📜 이용 가이드</h2>
            <section class="guide-section"><h3>1. 포인트(P) 획득</h3><ul class="guide-list"><li>테스트 완료: +10P (부스터 시 20P)</li><li>링크 공유: +30P</li><li>좋아요 클릭: +10P</li></ul></section>
            <section class="guide-section"><h3>2. 티어 안내</h3><table class="guide-table"><thead><tr><th>티어</th><th>점수</th></tr></thead><tbody><tr><td>ROOKIE</td><td>0~</td></tr><tr><td>BRONZE</td><td>1,000~</td></tr><tr><td>SILVER</td><td>5,000~</td></tr><tr><td>GOLD</td><td>15,000~</td></tr><tr><td>DIAMOND</td><td>100,000~</td></tr></tbody></table></section>
        </div>
    `;
}

function renderTestExecution(testId) {
    const test = TESTS.find(t => t.id === testId);
    if (!test) return location.hash = '#home';
    let step = 0; const answers = [];
    const updateStep = () => {
        const currentQ = test.questions[step];
        app.innerHTML = `
            <div class="test-execution fade-in">
                <div class="progress-container"><div class="step-dots">${Array.from({length: 7}).map((_, i) => `<div class="dot ${i <= step ? 'active' : ''}"></div>`).join('')}</div></div>
                <h2 style="font-size:1.4rem; margin-bottom:2rem;">Q${step + 1}. ${currentQ.q}</h2>
                <div class="options">${currentQ.options.map(opt => `<button class="option-btn" data-type="${opt.type}">${opt.text}</button>`).join('')}</div>
                <button class="btn-share" id="share-link-btn" style="margin-top:2rem; background:var(--text-sub); font-size:0.8rem;">🔗 테스트 공유하기 (+30P)</button>
            </div>`;
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => {
                answers.push(btn.dataset.type);
                if (step < 6) { step++; updateStep(); } 
                else { renderResult(testId, answers); }
            };
        });
        document.getElementById('share-link-btn').onclick = () => shareTest(testId, test.title);
    };
    updateStep();
}

async function renderResult(testId, answers) {
    const test = TESTS.find(t => t.id === testId);
    const result = test.results[answers.filter(x => x==='A').length >= 4 ? 'A' : 'B'];
    let reward = 10; let boosterMsg = "";
    if (UserState.user && UserState.data.boosterCount > 0) {
        reward = 20;
        await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(-1) });
        UserState.data.boosterCount -= 1; boosterMsg = " (부스터 적용!)";
    }
    if (UserState.user) await addPoints(reward);

    app.innerHTML = `
        <div class="result-card fade-in">
            <span class="test-category">분석 리포트</span>
            <div class="result-img" style="background-image: url('${result.img}');"></div>
            <h2 style="color:var(--accent-color);">[${result.title}]</h2>
            <div class="result-desc" style="text-align:left; line-height:1.8;"><p>${result.desc}</p></div>
            <div id="test-like-area" style="margin: 1.5rem 0;">
                <button id="like-btn" class="btn-secondary" style="width:auto; padding:0.6rem 1.5rem; border-radius:50px;">
                    ❤️ 좋아요 <span id="like-count-${testId}">${testLikesData[testId] || 0}</span>
                </button>
            </div>
            <p class="text-sub" style="font-weight:bold; color:var(--accent-secondary);">완료 보상 +${reward}P 지급!${boosterMsg}</p>
            <div class="share-grid">
                <button class="btn-share" id="share-result">결과 공유 (+30P)</button>
                <button class="btn-share btn-copy" id="share-test">테스트 공유 (+30P)</button>
            </div>
            <button class="btn-secondary" style="width:100%; margin-top:1rem;" onclick="location.hash='#home'">메인으로</button>
        </div>`;
    document.getElementById('like-btn').onclick = () => handleLike(testId);
    document.getElementById('share-result').onclick = () => shareTest(testId, `나의 결과: ${result.title}`);
    document.getElementById('share-test').onclick = () => copyLink(window.location.origin + `/#test/${testId}`);
}

function renderPrivacy() { 
    app.innerHTML = `
        <div class="card legal-page fade-in">
            <h2>🔒 개인정보처리방침</h2>
            <p class="text-sub">최종 수정일: 2026년 2월 22일</p>
            <section class="guide-section">
                <h3>1. 수집하는 개인정보 항목</h3>
                <p>SevenCheck는 사용자의 개인정보를 최소한으로 수집합니다. 구글 로그인을 이용할 경우, 구글로부터 제공받는 기본 프로필 정보(이름, 이메일, 프로필 이미지)만을 활용하며, 이는 서비스 내 사용자 식별 및 데이터 저장(포인트, 아이템 등)을 위해서만 사용됩니다.</p>
            </section>
            <section class="guide-section">
                <h3>2. 개인정보의 이용 목적</h3>
                <p>수집된 정보는 다음과 같은 목적으로 사용됩니다:<br>
                - 사용자별 테스트 결과 및 포인트/아이템 데이터 유지<br>
                - 커뮤니티 게시판 내 작성자 식별<br>
                - 부정 이용 방지 및 서비스 개선을 위한 통계 분석</p>
            </section>
            <section class="guide-section">
                <h3>3. 개인정보의 보유 및 파기</h3>
                <p>사용자가 회원 탈퇴를 요청하거나 개인정보 수집 동의를 철회할 경우, 해당 정보는 지체 없이 파기됩니다. 단, 관련 법령에 의해 보존할 필요가 있는 경우 일정 기간 보관될 수 있습니다.</p>
            </section>
            <section class="guide-section">
                <h3>4. 쿠키(Cookie)의 사용</h3>
                <p>본 서비스는 사용자 경험 향상 및 구글 애드센스 광고 최적화를 위해 쿠키를 사용합니다. 사용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</p>
            </section>
        </div>
    `; 
}

function renderAbout() { 
    app.innerHTML = `
        <div class="card guide-container fade-in">
            <h2 style="text-align:center; margin-bottom:2rem;">✨ SevenCheck 서비스 소개</h2>
            <p style="font-size:1.1rem; line-height:1.8; text-align:center; margin-bottom:2rem;">
                "나를 알아가는 7번의 질문, 그 이상의 가치"<br>
                <strong>SevenCheck Studio</strong>는 바쁜 일상을 살아가는 당신에게<br>잠시 멈춰 자신을 돌아볼 수 있는 '성찰의 시간'을 제공합니다.
            </p>
            <section class="guide-section">
                <h3>🎨 감성적인 분석 리포트</h3>
                <p>우리는 단순히 결과를 나열하지 않습니다. 독자적인 심리 분석 알고리즘과 감각적인 아트워크를 결합하여, 당신이 소장하고 싶은 한 장의 '분석 리포트'를 만들어 드립니다.</p>
            </section>
            <section class="guide-section">
                <h3>🕹️ 즐거운 성장 경험</h3>
                <p>테스트를 통해 포인트를 모으고, 오락실에서 아이템을 수집하며 자신의 계정을 성장시켜 보세요. 당신의 활동은 등급(Tier)으로 기록되며, 커뮤니티 내에서 자신만의 개성을 뽐낼 수 있습니다.</p>
            </section>
            <section class="guide-section">
                <h3>💬 함께하는 커뮤니티</h3>
                <p>혼자만 알고 있기 아쉬운 결과들, 자유 게시판에서 다른 사용자들과 나누어 보세요. 서로의 다름을 이해하고 공감하는 과정을 통해 진정한 나를 발견하게 될 것입니다.</p>
            </section>
        </div>
    `; 
}

function renderTerms() { 
    app.innerHTML = `
        <div class="card legal-page fade-in">
            <h2>📜 이용약관</h2>
            <p class="text-sub">시행일: 2026년 2월 22일</p>
            <section class="guide-section">
                <h3>제 1 조 (목적)</h3>
                <p>본 약관은 SevenCheck Studio(이하 '회사')가 제공하는 웹 서비스 및 관련 제반 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            </section>
            <section class="guide-section">
                <h3>제 2 조 (포인트 및 아이템 정책)</h3>
                <p>1. 포인트는 서비스 내 활동(테스트, 공유 등)을 통해 무상으로 지급되며, 현금으로 환전될 수 없습니다.<br>
                2. 사용자가 획득한 아이템 및 점수는 랭킹 산정의 기준이 되며, 부정한 방법으로 획득 시 사전 고지 없이 회수될 수 있습니다.<br>
                3. 이모지 교환 시 소모된 아이템 점수는 복구가 불가능합니다.</p>
            </section>
            <section class="guide-section">
                <h3>제 3 조 (게시물 관리)</h3>
                <p>회사는 다음 각 호에 해당하는 게시물을 사전 통보 없이 삭제할 수 있습니다:<br>
                - 타인을 비방하거나 명예를 훼손하는 경우<br>
                - 공공질서 및 미풍양속에 위반되는 경우<br>
                - 영리 목적의 광고성 게시물</p>
            </section>
        </div>
    `; 
}

function renderContact() { 
    app.innerHTML = `
        <div class="card guide-container fade-in" style="text-align:center;">
            <h2>📧 문의하기</h2>
            <p style="margin:2rem 0;">서비스 이용 중 불편한 점이나 제안하고 싶은 아이디어가 있으신가요?<br>아래 공식 이메일로 보내주시면 빠르게 확인 후 답변 드리겠습니다.</p>
            <div class="card" style="background:var(--bg-color); padding:2rem; display:inline-block; border:1px solid var(--border-color);">
                <h3 style="border:none; padding:0; margin-bottom:0.5rem; color:var(--accent-color);">Official Support</h3>
                <p style="font-size:1.2rem; font-weight:800;">support@sevencheck.studio</p>
            </div>
            <p class="text-sub" style="margin-top:2rem;">비즈니스 제휴 및 광고 문의도 환영합니다.<br>평일 기준 48시간 이내에 회신 드립니다.</p>
        </div>
    `; 
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
