// js/app.js - UI Refinement
import { initAuth, updateUI, UserState, addPoints, usePoints, EMOJI_SHOP, getTier, TIERS, chargeUserPoints } from './auth.js';
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
            options: [{ text: `저는 이 방향을 선호합니다.`, type: 'A' }, { text: `저는 저 방향이 더 끌립니다.`, type: 'B' }]
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
    else if (hash === '#terms') renderTerms();
    else if (hash === '#contact') renderContact();
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

let testLikesData = {};
async function fetchAllLikes() {
    try {
        const snap = await getDocs(collection(db, "testStats"));
        snap.forEach(doc => { testLikesData[doc.id] = doc.data().likes || 0; });
    } catch (e) { console.error(e); }
}

async function handleLike(testId) {
    if (!UserState.user) return alert("로그인이 필요한 기능입니다.");
    if (sessionStorage.getItem(`liked_${testId}`)) return alert("이미 좋아요를 누르셨습니다!");
    try {
        const statsRef = doc(db, "testStats", testId);
        const snap = await getDoc(statsRef);
        if (!snap.exists()) { await setDoc(statsRef, { likes: 1 }); } 
        else { await updateDoc(statsRef, { likes: increment(1) }); }
        sessionStorage.setItem(`liked_${testId}`, "true");
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5);
        alert("좋아요 반영 완료! (+5P)");
        const likeCounter = document.getElementById(`like-count-${testId}`);
        if (likeCounter) likeCounter.textContent = testLikesData[testId];
    } catch (e) { console.error(e); }
}

async function renderHome() {
    const authHeader = `
        <div class="card mini-profile-bar" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
            ${UserState.user ? 
                `<div style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;" onclick="location.hash='#profile'">
                    <span id="user-emoji" style="font-size:1.5rem;">${UserState.data.emoji || '👤'}</span>
                    <div style="display:flex; flex-direction:column;">
                        <strong id="user-name" style="font-size:0.9rem;">${UserState.data.nickname}</strong>
                        <div class="tier-display" style="margin-top:-2px;"></div>
                    </div>
                 </div>
                 <div style="display:flex; gap:0.5rem;">
                    <button onclick="location.hash='#ranking'" class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width:auto;">🏆 랭킹</button>
                 </div>` :
                `<span>로그인하고 혜택 받기</span>
                 <button id="login-btn" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width:auto;">로그인</button>`
            }
        </div>
    `;
    await fetchAllLikes();
    const filtered = currentFilter === '전체' ? TESTS : TESTS.filter(t => t.category === currentFilter);
    app.innerHTML = authHeader + `<div class="test-grid" style="margin-top:1.5rem;">${filtered.map(t => {
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

function renderProfile() {
    if (!UserState.user) {
        app.innerHTML = `<div class="card" style="text-align:center; padding:3rem;"><h2>👤 프로필</h2><button id="login-btn" class="btn-primary" style="margin-top:1rem;">로그인하기</button></div>`;
        return;
    }
    const inv = UserState.data.inventory || [];
    const groupedInv = inv.reduce((acc, item) => { acc[item] = (acc[item] || 0) + 1; return acc; }, {});
    const invHTML = Object.entries(groupedInv).length > 0 ? 
        Object.entries(groupedInv).map(([name, count]) => `
            <div class="inv-card">
                <span class="inv-icon">${name.split(' ')[0]}</span>
                <span class="inv-name">${name.split(' ')[1] || ''}</span>
                <span class="inv-badge">${count}</span>
            </div>
        `).join('') : 
        '<p class="text-sub" style="grid-column: 1/-1; text-align:center; padding:2rem;">보유한 아이템이 없습니다.</p>';

    const unlocked = UserState.data.unlockedEmojis || ['👤'];
    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);

    const nameColors = ['#333333', '#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#6c5ce7', '#ff6b81'];
    const unlockedColors = UserState.data.unlockedColors || ['#333333'];

    app.innerHTML = `
        <div class="card profile-container fade-in">
            <div style="text-align:center; margin-bottom:2.5rem;">
                <div id="user-emoji" style="font-size:4.5rem; margin-bottom:0.5rem; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));">👤</div>
                <div class="tier-display"></div>
                <h2 id="user-name" style="margin:0.5rem 0; font-size:1.8rem;">닉네임</h2>
                <div class="progress-section" style="max-width:350px; margin:0 auto;">
                    <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
                    <p class="text-sub" style="font-size:0.75rem;">Next: ${nextTier.name} (${Math.max(0, nextTier.min - currentScore).toLocaleString()}점 남음)</p>
                </div>
                <div class="profile-stats" style="margin-top:2rem; background:var(--bg-color); padding:1.2rem; border-radius:15px;">
                    <div class="stat-item"><span class="stat-label">아이템 가치</span><span class="stat-value" id="user-total-score">0</span></div>
                    <div class="stat-item"><span class="stat-label">보유 포인트</span><span class="stat-value" id="user-points">0</span></div>
                </div>
            </div>

            <details class="profile-details" open>
                <summary>🎒 내 인벤토리 (수집한 아이템)</summary>
                <div class="content-area">
                    <div class="inventory-grid">${invHTML}</div>
                </div>
            </details>
            
            <details class="profile-details">
                <summary>🏪 이모지 교환소 (아이템 소모)</summary>
                <div class="content-area shop-wrapper">
                    <p class="text-sub" style="margin-bottom:1.5rem; font-size:0.8rem; color:#ff4757; background:#fff0f3; padding:0.8rem; border-radius:10px;">⚠️ 주의: 교환 시 가장 낮은 가치의 아이템부터 자동 소모되어 점수가 차감됩니다.</p>
                    ${Object.entries(EMOJI_SHOP).map(([catName, emojis]) => `
                        <h4 style="margin-top:1.5rem; font-size:0.9rem; color:var(--accent-color);">${catName}</h4>
                        <div class="emoji-grid" style="margin-top:0.8rem;">
                            ${Object.entries(emojis).map(([e, price]) => {
                                const isOwn = unlocked.includes(e);
                                return `<button class="emoji-btn ${isOwn ? 'owned' : 'locked'} ${UserState.data.emoji === e ? 'active' : ''}" data-emoji="${e}">
                                            <span class="e-icon">${e}</span>
                                            ${!isOwn ? `<span class="e-price">${price}</span>` : ''}
                                        </button>`;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            </details>

            <details class="profile-details">
                <summary>✨ 닉네임 컬러 샵</summary>
                <div class="content-area">
                    <div class="color-selector" style="display:flex; flex-wrap:wrap; gap:1rem; justify-content:center;">
                        ${nameColors.map(c => `<button class="color-btn ${UserState.data.nameColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}; width:45px; height:45px; border-radius:50%; border:4px solid ${unlockedColors.includes(c) ? 'var(--accent-secondary)' : '#eee'}; cursor:pointer; box-shadow:var(--shadow);"></button>`).join('')}
                    </div>
                    <p class="text-sub" style="margin-top:1.2rem; text-align:center; font-size:0.8rem;">색상 구매 시 2,000P가 소모됩니다.</p>
                </div>
            </details>
            
            <details class="profile-details">
                <summary>⚙️ 계정 설정</summary>
                <div class="content-area profile-settings">
                    <div class="setting-item">
                        <label style="font-size:0.85rem; font-weight:bold; display:block; margin-bottom:0.5rem;">닉네임 변경 (30일 1회)</label>
                        <div style="display:flex; gap:0.5rem;">
                            <input type="text" id="nickname-input" style="flex:1; padding:0.8rem; border-radius:10px; border:1px solid var(--border-color);" placeholder="새 닉네임">
                            <button id="nickname-save" class="btn-primary" style="width:80px; padding:0;">변경</button>
                        </div>
                        <p id="nickname-msg" style="margin-top:0.5rem; font-size:0.8rem;"></p>
                    </div>
                    <button id="logout-btn" class="btn-secondary" style="margin-top:2.5rem; width:100%; color:#ff4757; border-color:#ff4757;">로그아웃</button>
                </div>
            </details>

            ${UserState.isAdmin ? `
            <details class="profile-details" style="border:2px solid #2f3542;">
                <summary style="background:#2f3542; color:#fff;">🛠️ 관리자 도구</summary>
                <div class="content-area" style="background:#f8f9fa;">
                    <label style="font-size:0.8rem; font-weight:bold;">포인트 강제 충전</label>
                    <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
                        <input type="text" id="admin-target-uid" placeholder="대상 UID (비우면 본인)" style="padding:0.8rem; border-radius:10px; border:1px solid #ddd;">
                        <input type="number" id="admin-charge-amount" placeholder="충전량" value="1000" style="padding:0.8rem; border-radius:10px; border:1px solid #ddd;">
                        <button id="admin-charge-btn" class="btn-primary" style="background:#2f3542;">즉시 충전</button>
                    </div>
                </div>
            </details>` : ''}
        </div>
    `;
    updateUI();
    if (UserState.isAdmin) {
        const chargeBtn = document.getElementById('admin-charge-btn');
        if (chargeBtn) {
            chargeBtn.onclick = async () => {
                const targetUid = document.getElementById('admin-target-uid').value.trim() || UserState.user.uid;
                const amount = parseInt(document.getElementById('admin-charge-amount').value);
                if (isNaN(amount)) return alert("금액을 확인하세요.");
                const success = await chargeUserPoints(targetUid, amount);
                if (success) { alert(`${amount}P 충전 완료!`); renderProfile(); }
                else { alert("충전 실패."); }
            };
        }
    }
}

function renderArcade() {
    if (!UserState.user) { renderProfile(); return; }
    app.innerHTML = `
        <div class="card arcade-container fade-in">
            <h2 style="text-align:center; margin-bottom:1.5rem;">🎰 오락실</h2>
            <div class="profile-stats" style="background:var(--bg-color); padding:1rem; border-radius:15px; margin-bottom:2rem;">
                <div class="stat-item"><span class="stat-label">내 포인트</span><span class="stat-value" id="user-points">0</span></div>
                <div class="stat-item"><span class="stat-label">부스터</span><span class="stat-value" style="color:var(--accent-secondary);">${UserState.data.boosterCount || 0}회</span></div>
            </div>

            <details class="profile-details" open><summary>⚡ 슈퍼 부스터 상점</summary><div class="content-area" style="background:#e3f2fd;"><p class="text-sub">구매 시 다음 20회 테스트 보상 2배(20P)!</p><button id="buy-booster-btn" class="btn-primary" style="margin-top:1rem; background:#1976d2;">부스터 구매 (100P)</button></div></details>
            <details class="profile-details"><summary>🎫 럭키 복권</summary><div class="content-area" style="background:linear-gradient(135deg, #fff9e6 0%, #fff0e6 100%);"><div id="lotto-result" class="lotto-card" style="height:80px; display:flex; align-items:center; justify-content:center; margin-bottom:1rem; border:2px dashed #fda085; border-radius:12px; color:#fda085; font-weight:bold;">행운을 긁어보세요!</div><button id="lotto-btn" class="btn-primary" style="background:#fda085;">복권 구매 (500P)</button></div></details>
            <details class="profile-details"><summary>🎲 포인트 베팅</summary><div class="content-area"><input type="number" id="bet-amount" value="100" min="10" style="width:100%; padding:0.8rem; border-radius:10px; border:1px solid var(--border-color); text-align:center; font-size:1.2rem; font-weight:800; margin-bottom:1rem;"><div id="bet-result-msg" style="text-align:center; font-weight:bold; margin-bottom:1rem; min-height:40px;">도전하시겠습니까?</div><div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;"><button class="bet-btn btn-primary" data-game="oddeven" data-choice="odd" style="background:#6c5ce7;">홀</button><button class="bet-btn btn-primary" data-game="oddeven" data-choice="even" style="background:#a29bfe;">짝</button><button class="bet-btn btn-secondary" data-game="dice" data-choice="low">저 (1-3)</button><button class="bet-btn btn-secondary" data-game="dice" data-choice="high">고 (4-6)</button></div></div></details>
            <details class="profile-details"><summary>📦 아이템 뽑기</summary><div class="content-area"><div id="gacha-result" class="gacha-box" style="min-height:80px; display:flex; align-items:center; justify-content:center; margin-bottom:1rem; border:2px dashed var(--border-color); border-radius:12px; text-align:center;">준비 완료!</div><button id="gacha-btn" class="btn-primary" style="width:100%; margin-bottom:0.5rem;">1회 뽑기 (100P)</button><div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;"><button id="gacha-5-btn" class="btn-secondary">5회 (500P)</button><button id="gacha-10-btn" class="btn-secondary" style="color:var(--accent-color); border-color:var(--accent-color);">10회 (950P🔥)</button></div></div></details>
            <details class="profile-details"><summary>🔮 아이템 연금술</summary><div class="content-area" style="background:#f3f0ff;"><p class="text-sub">아이템 5개 -> 상급 아이템 1개</p><div id="alchemy-result" style="margin:1rem 0; font-weight:bold; text-align:center; min-height:40px;">재료를 준비해 주세요.</div><div style="display:grid; grid-template-columns: 1fr; gap:0.5rem;"><button id="alchemy-btn" class="btn-primary">1회 합성 (500P)</button><button id="alchemy-10-btn" class="btn-secondary" style="border-color:var(--accent-color); color:var(--accent-color);">10회 합성 (4500P🔥)</button></div></div></details>
            <details class="profile-details"><summary>⛏️ 단순 채굴</summary><div class="content-area"><button id="click-game-btn" class="btn-secondary" style="width:100%;">클릭해서 채굴</button></div></details>
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
            <section class="guide-section"><h3>1. 포인트(P) 획득</h3><ul class="guide-list"><li>테스트 완료: +10P (부스터 시 20P)</li><li>링크 공유: +30P</li><li>좋아요 클릭: +5P</li></ul></section>
            <section class="guide-section"><h3>2. 경제 시스템</h3><p class="text-sub">포인트는 소모성 재화이며, 아이템 가치는 랭킹 점수입니다. 이모지 교환 시 아이템이 소모되어 랭킹 점수가 낮아질 수 있습니다.</p></section>
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
                <button class="btn-share" id="share-link-btn" style="margin-top:2rem; background:var(--text-sub); font-size:0.8rem; border:none; padding:0.8rem; border-radius:10px; color:#fff; cursor:pointer; width:100%;">🔗 테스트 링크 공유 (+30P)</button>
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
    let reward = 10;
    if (UserState.user && UserState.data.boosterCount > 0) {
        reward = 20;
        await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(-1) });
        UserState.data.boosterCount -= 1;
    }
    if (UserState.user) await addPoints(reward);

    app.innerHTML = `
        <div class="result-card fade-in">
            <span class="test-category">분석 리포트</span>
            <div class="result-img" style="background-image: url('${result.img}'); background-size:cover; background-position:center;"></div>
            <h2 style="color:var(--accent-color); margin-bottom:1rem;">[${result.title}]</h2>
            <div class="result-desc" style="text-align:left; line-height:1.8; word-break:keep-all;"><p>${result.desc}</p></div>
            <div style="margin: 1.5rem 0;">
                <button id="like-btn" class="btn-secondary" style="width:auto; padding:0.6rem 1.5rem; border-radius:50px;">❤️ 좋아요 <span id="like-count-${testId}">${testLikesData[testId] || 0}</span></button>
            </div>
            <p class="text-sub" style="font-weight:bold; color:var(--accent-secondary); margin-bottom:1.5rem;">완료 보상 +${reward}P 지급!</p>
            <div class="share-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem;">
                <button class="btn-primary" id="share-result" style="background:var(--text-main); font-size:0.9rem;">결과 공유</button>
                <button class="btn-primary" id="share-test" style="background:var(--accent-soft); font-size:0.9rem;">링크 공유</button>
            </div>
            <button class="btn-secondary" style="width:100%; margin-top:1rem;" onclick="location.hash='#home'">다른 테스트 보러 가기</button>
        </div>`;
    document.getElementById('like-btn').onclick = () => handleLike(testId);
    document.getElementById('share-result').onclick = () => shareTest(testId, `나의 결과: ${result.title}`);
    document.getElementById('share-test').onclick = () => copyLink(window.location.origin + `/#test/${testId}`);
}

function renderPrivacy() { 
    app.innerHTML = `<div class="card legal-page fade-in"><h2>🔒 개인정보처리방침</h2><p>정보 보호 지침을 준수하며, 귀하의 데이터는 안전하게 관리됩니다.</p></div>`; 
}
function renderAbout() { 
    app.innerHTML = `<div class="card guide-container fade-in"><h2>✨ 서비스 소개</h2><p>SevenCheck Studio는 심리 분석과 성장의 재미를 결합한 플랫폼입니다.</p></div>`; 
}
function renderTerms() { 
    app.innerHTML = `<div class="card legal-page fade-in"><h2>📜 이용약관</h2><p>공정한 이용 규칙을 통해 건강한 커뮤니티를 지향합니다.</p></div>`; 
}
function renderContact() { 
    app.innerHTML = `<div class="card guide-container fade-in" style="text-align:center;"><h2>📧 문의하기</h2><p>support@sevencheck.studio</p></div>`; 
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
