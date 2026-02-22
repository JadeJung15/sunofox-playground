// js/app.js
import { initAuth, updateUI, UserState } from './auth.js';
import { initArcade } from './arcade.js';
import { copyLink, shareTest } from './share.js';
import { renderBoard } from './board.js';

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

// =================================================================
// 1. Data Store
// =================================================================

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=500&q=60`;

// Simplified 40 tests for robust routing
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

// =================================================================
// 2. Application Logic (Router)
// =================================================================

const categoryMap = { 
    '#personality': '성격', '#face': '얼굴', '#fortune': '사주', '#fun': '재미', 
    '#arcade': '오락실', '#board': '게시판', '#profile': '프로필' 
};
let currentFilter = '전체';

async function router() {
    const hash = window.location.hash || '#home';
    
    navLinks.forEach(link => {
        const filter = link.dataset.filter;
        link.classList.toggle('active', (hash === '#home' && filter === '전체') || hash.includes(filter?.toLowerCase()));
    });

    app.innerHTML = ''; // Clear main content

    if (hash === '#privacy') renderPrivacy();
    else if (hash === '#about') renderAbout();
    else if (hash === '#arcade') renderArcade();
    else if (hash === '#board') await renderBoard(app);
    else if (hash === '#profile') renderProfile();
    else if (hash.startsWith('#test/')) renderTestExecution(hash.split('/')[1]);
    else {
        currentFilter = categoryMap[hash] || '전체';
        renderHome();
    }
    window.scrollTo(0, 0);
}

// =================================================================
// 3. Render Functions
// =================================================================

function renderHome() {
    const authHeader = `
        <div class="card mini-profile-bar" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
            ${UserState.user ? 
                `<span><strong>${UserState.data.nickname}</strong>님 반가워요!</span>
                 <button onclick="location.hash='#profile'" class="btn-secondary" style="width: auto; padding: 0.4rem 0.8rem; font-size: 0.8rem;">프로필 관리</button>` :
                `<span>로그인하고 혜택을 받아보세요.</span>
                 <button id="login-btn" class="btn-primary" style="width: auto; padding: 0.4rem 0.8rem; font-size: 0.8rem;">로그인</button>`
            }
        </div>
    `;

    const filtered = currentFilter === '전체' ? TESTS : TESTS.filter(t => t.category === currentFilter);
    
    app.innerHTML = authHeader + `
        <div class="ad-slot">SevenCheck : 나의 오늘을 기록하다</div>
        <div class="test-grid">
            ${filtered.map(t => `
                <div class="test-card fade-in" onclick="location.hash='#test/${t.id}'">
                    <div class="test-thumb" style="background-image: url('${t.thumb}')"></div>
                    <div class="test-info">
                        <span class="test-category-tag">${t.category}</span>
                        <h3>${t.title}</h3>
                        <p>${t.desc}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    updateUI(); 
}

function renderProfile() {
    if (!UserState.user) {
        app.innerHTML = `<div class="card" style="text-align:center; padding:3rem;">
            <h2>👤 프로필 관리</h2>
            <p>로그인이 필요한 서비스입니다.</p>
            <button id="login-btn" class="btn-primary" style="margin-top:1rem;">로그인하기</button>
        </div>`;
        return;
    }

    app.innerHTML = `
        <div class="card profile-container fade-in">
            <h2>👤 프로필 관리</h2>
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-label">보유 포인트</span>
                    <span class="stat-value" id="user-points">${UserState.data.points.toLocaleString()} P</span>
                </div>
            </div>

            <div class="profile-edit-section">
                <h3>닉네임 변경</h3>
                <p class="text-sub">닉네임은 30일에 한 번만 변경 가능합니다.</p>
                <div class="input-row">
                    <input type="text" id="nickname-input" placeholder="새로운 닉네임" maxlength="10">
                    <button id="nickname-save" class="btn-primary" style="width: 80px;">저장</button>
                </div>
                <p id="nickname-msg"></p>
            </div>

            <div class="profile-menu" style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
                <button onclick="location.hash='#arcade'" class="btn-secondary" style="margin-bottom: 0.5rem;">🎮 내 포인트로 게임하기</button>
                <button id="logout-btn" class="btn-secondary" style="color: #ff4757;">로그아웃</button>
            </div>
        </div>
    `;
    updateUI();
}

function renderArcade() {
    if (!UserState.user) {
        renderProfile(); // Uses its fallback
        return;
    }

    app.innerHTML = `
        <div class="card arcade-container fade-in" style="text-align:center; padding:2rem;">
            <h2>🎰 행운의 뽑기 & 채굴</h2>
            <p style="margin-bottom:2rem;">내 포인트: <strong id="user-points">${UserState.data.points.toLocaleString()} P</strong></p>
            
            <div class="game-zone" style="margin-bottom:2rem; padding:1.5rem; background:var(--bg-color); border-radius:15px; border: 1px solid var(--border-color);">
                <h3>📦 아이템 뽑기 (100 P)</h3>
                <div id="gacha-result" class="gacha-box" style="height:100px; display:flex; align-items:center; justify-content:center; margin:1rem 0; font-weight:bold;">
                    준비 완료!
                </div>
                <button id="gacha-btn" class="btn-primary">뽑기!</button>
            </div>

            <div class="game-zone" style="padding:1.5rem; background:var(--bg-color); border-radius:15px; border: 1px solid var(--border-color);">
                <h3>⛏️ 포인트 채굴</h3>
                <button id="click-game-btn" class="btn-secondary">채굴해서 포인트 얻기</button>
            </div>
        </div>
    `;
    initArcade(); 
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
                <div class="options">
                    ${currentQ.options.map(opt => `<button class="option-btn" data-type="${opt.type}">${opt.text}</button>`).join('')}
                </div>
                <button class="btn-share" id="share-link-btn" style="margin-top:2rem; background:var(--text-sub); font-size:0.8rem;">🔗 이 테스트 링크 공유하기</button>
            </div>
        `;
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

function renderResult(testId, answers) {
    const test = TESTS.find(t => t.id === testId);
    const winningType = answers.filter(x => x==='A').length >= 4 ? 'A' : 'B';
    const result = test.results[winningType];

    app.innerHTML = `
        <div class="result-card fade-in">
            <span class="test-category">결과 리포트</span>
            <div class="result-img" style="background-image: url('${result.img}');"></div>
            <h2 style="color:var(--accent-color); margin-bottom:1rem;">[${result.title}]</h2>
            <div class="result-desc" style="text-align:left; line-height:1.8;"><p>${result.desc}</p></div>
            <div class="share-grid">
                <button class="btn-share" id="share-result">결과 공유</button>
                <button class="btn-share btn-copy" id="share-test">테스트 공유</button>
            </div>
            <button class="btn-secondary" style="width:100%; margin-top:1rem;" onclick="location.hash='#home'">다른 테스트 보러 가기</button>
        </div>
    `;

    document.getElementById('share-result').onclick = () => shareTest(testId, `결과: ${result.title}`);
    document.getElementById('share-test').onclick = () => shareTest(testId, test.title);
}

// Static
function renderPrivacy() { app.innerHTML = `<div class="card"><h2>개인정보처리방침</h2><p>사용자 정보는 안전하게 관리됩니다.</p></div>`; }
function renderAbout() { app.innerHTML = `<div class="card"><h2>서비스 소개</h2><p>SevenCheck Studio입니다.</p></div>`; }
function renderTerms() { app.innerHTML = `<div class="card"><h2>이용약관</h2><p>건전한 커뮤니티 문화를 지향합니다.</p></div>`; }
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
