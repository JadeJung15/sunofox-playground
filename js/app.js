// js/app.js
import { initAuth, updateUI, UserState, addPoints, EMOJI_SHOP, getTier, TIERS } from './auth.js';
import { initArcade } from './arcade.js';
import { copyLink, shareTest } from './share.js';
import { renderBoard } from './board.js';
import { renderRanking } from './ranking.js';

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

const categoryMap = { '#personality': '성격', '#face': '얼굴', '#fortune': '사주', '#fun': '재미', '#arcade': '오락실', '#board': '게시판', '#profile': '프로필', '#ranking': '랭킹' };
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
    else if (hash === '#profile') renderProfile();
    else if (hash.startsWith('#test/')) renderTestExecution(hash.split('/')[1]);
    else {
        currentFilter = categoryMap[hash] || '전체';
        renderHome();
    }
    window.scrollTo(0, 0);
}

function renderHome() {
    const authHeader = `
        <div class="card mini-profile-bar" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
            ${UserState.user ? 
                `<div style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;" onclick="location.hash='#profile'">
                    <span id="user-emoji" style="font-size:1.5rem;">${UserState.data.emoji || '👤'}</span>
                    <div style="display:flex; flex-direction:column;">
                        <strong id="user-name" style="font-size:0.9rem;">${UserState.data.nickname}</strong>
                        <div class="tier-display" style="margin-top:-2px;"></div>
                    </div>
                 </div>
                 <div style="display:flex; gap:0.5rem;">
                    <button onclick="location.hash='#ranking'" class="btn-secondary" style="width: auto; padding: 0.4rem 0.8rem; font-size: 0.8rem;">🏆 랭킹</button>
                    <button id="login-btn" class="hidden"></button>
                 </div>` :
                `<span>로그인하고 혜택 받기</span>
                 <button id="login-btn" class="btn-primary" style="width: auto; padding: 0.4rem 0.8rem; font-size: 0.8rem;">로그인</button>`
            }
        </div>
    `;
    const filtered = currentFilter === '전체' ? TESTS : TESTS.filter(t => t.category === currentFilter);
    app.innerHTML = authHeader + `<div class="test-grid">${filtered.map(t => `
        <div class="test-card fade-in" onclick="location.hash='#test/${t.id}'">
            <div class="test-thumb" style="background-image: url('${t.thumb}')"></div>
            <div class="test-info">
                <span class="test-category-tag">${t.category}</span>
                <h3>${t.title}</h3>
                <p>${t.desc}</p>
            </div>
        </div>
    `).join('')}</div>`;
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
        Object.entries(groupedInv).map(([name, count]) => `<div class="inv-item"><span class="inv-name">${name}</span><span class="inv-count">x${count}</span></div>`).join('') : 
        '<p class="text-sub">획득한 아이템이 없습니다.</p>';

    const unlocked = UserState.data.unlockedEmojis || ['👤'];
    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);

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
            <div class="profile-stats" style="margin:1.5rem 0;">
                <div class="stat-item"><span class="stat-label">보유 포인트</span><span class="stat-value" id="user-points">0 P</span></div>
                <div class="stat-item"><span class="stat-label">아이템 점수</span><span class="stat-value" id="user-total-score">0 점</span></div>
            </div>

            <!-- 복권 섹션 -->
            <div class="game-zone card lotto-section" style="background:linear-gradient(135deg, #f6d365 0%, #fda085 100%); color:white; padding:1.5rem; margin-bottom:1.5rem; border:none;">
                <h3 style="color:white;">🎫 인생역전! 럭키 복권</h3>
                <p class="text-sub" style="color:rgba(255,255,255,0.9);">한 장당 500P - 1등 당첨금 30,000P!</p>
                <div id="lotto-result" class="lotto-card" style="background:rgba(255,255,255,0.2); height:100px; display:flex; align-items:center; justify-content:center; margin:1rem 0; border-radius:10px; border:2px dashed #fff; font-weight:bold;">행운을 빌어요!</div>
                <button id="lotto-btn" class="btn-primary" style="background:white; color:#fda085;">복권 구매하기 (500P)</button>
            </div>

            <!-- 베팅 게임 섹션 -->
            <div class="game-zone card" style="background:#fff3f5; border:1px solid #ffcad4; padding:1.5rem; margin-bottom:1.5rem;">
                <h3 style="color:#ff4757;">🎲 포인트 베팅 (홀짝 / 고저)</h3>
                <div class="bet-input-area" style="margin:1.5rem 0;">
                    <label style="font-size:0.8rem; font-weight:bold;">베팅 금액 (최소 10P)</label>
                    <input type="number" id="bet-amount" value="100" min="10" style="width:100%; padding:0.8rem; border-radius:10px; border:1px solid var(--border-color); margin-top:0.5rem; text-align:center; font-size:1.2rem; font-weight:800;">
                </div>
                <div id="bet-result-msg" style="height:50px; display:flex; align-items:center; justify-content:center; text-align:center; font-weight:bold; margin-bottom:1rem;">준비 되셨나요?</div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem;">
                    <button class="bet-btn btn-primary" data-game="oddeven" data-choice="odd" style="background:#6c5ce7;">홀 (Odd)</button>
                    <button class="bet-btn btn-primary" data-game="oddeven" data-choice="even" style="background:#a29bfe;">짝 (Even)</button>
                    <button class="bet-btn btn-secondary" data-game="dice" data-choice="low">주사위 저 (1-3)</button>
                    <button class="bet-btn btn-secondary" data-game="dice" data-choice="high">주사위 고 (4-6)</button>
                </div>
            </div>
            
            <div class="game-zone card" style="background:var(--bg-color); border:1px solid var(--border-color); padding:1.5rem;">
                <h3>📦 행운의 아이템 뽑기 (100 P)</h3>
                <div id="gacha-result" class="gacha-box" style="height:100px; display:flex; align-items:center; justify-content:center; margin:1rem 0;">준비 완료!</div>
                <button id="gacha-btn" class="btn-primary">100P로 뽑기</button>
            </div>

            <div class="alchemy-zone card" style="margin-top:1.5rem;">
                <h3>🔮 아이템 연금술 (500 P)</h3>
                <p class="text-sub">아이템 5개 -> 상급 아이템 1개</p>
                <div id="alchemy-result" style="margin:1rem 0; font-weight:bold; text-align:center;">재료를 준비해 주세요.</div>
                <button id="alchemy-btn" class="btn-primary" style="background:#fff; color:#6c5ce7;">연금술 시작</button>
            </div>

            <div class="game-zone card" style="margin-top:1.5rem; background:var(--bg-color); border:1px solid var(--border-color); padding:1.5rem;">
                <h3>🔢 숫자 Up & Down (보상: 50P)</h3>
                <div id="updown-msg" style="margin:1rem 0; font-weight:bold; text-align:center;">숫자 입력 (1-50)</div>
                <div class="input-row">
                    <input type="number" id="updown-input" placeholder="1-50" min="1" max="50">
                    <button id="updown-submit" class="btn-primary" style="width:80px;">확인</button>
                </div>
            </div>

            <div class="game-zone card" style="margin-top:1.5rem; background:var(--bg-color); border:1px solid var(--border-color); padding:1.5rem;">
                <h3>⛏️ 포인트 채굴</h3>
                <button id="click-game-btn" class="btn-secondary">클릭해서 채굴</button>
            </div>
        </div>
    `;
    initArcade(); 
    updateUI();
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
                <button class="btn-share" id="share-link-btn" style="margin-top:2rem; background:var(--text-sub); font-size:0.8rem;">🔗 테스트 링크 공유 (+30P)</button>
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
    if (UserState.user) await addPoints(10);
    app.innerHTML = `
        <div class="result-card fade-in">
            <span class="test-category">분석 리포트</span>
            <div class="result-img" style="background-image: url('${result.img}');"></div>
            <h2 style="color:var(--accent-color);">[${result.title}]</h2>
            <div class="result-desc" style="text-align:left; line-height:1.8;"><p>${result.desc}</p></div>
            <p class="text-sub" style="margin-top:1rem;">보상 +10P 지급 완료!</p>
            <div class="share-grid">
                <button class="btn-share" id="share-result">결과 공유 (+30P)</button>
                <button class="btn-share btn-copy" id="share-test">테스트 공유 (+30P)</button>
            </div>
            <button class="btn-secondary" style="width:100%; margin-top:1rem;" onclick="location.hash='#home'">메인으로</button>
        </div>`;
    document.getElementById('share-result').onclick = () => shareTest(testId, `나의 결과: ${result.title}`);
    document.getElementById('share-test').onclick = () => copyLink(window.location.origin + `/#test/${testId}`);
}

function renderPrivacy() { app.innerHTML = `<div class="card"><h2>개인정보처리방침</h2><p>보안 규정을 준수합니다.</p></div>`; }
function renderAbout() { app.innerHTML = `<div class="card"><h2>서비스 소개</h2><p>SevenCheck Studio</p></div>`; }
function renderTerms() { app.innerHTML = `<div class="card"><h2>이용약관</h2><p>약관을 확인하세요.</p></div>`; }
function renderContact() { app.innerHTML = `<div class="card"><h2>문의하기</h2><p>support@sevencheck.studio</p></div>`; }

themeToggle.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '✨';
};
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
initAuth();
router();
