import { initAuth, updateUI, UserState, addPoints as authAddPoints, usePoints as authUsePoints, authReady } from './auth.js';
import { initArcade } from './arcade.js';
import { renderBoard } from './board.js';
import { renderRanking } from './ranking.js';
import { TESTS } from './tests-data.js?v=3.1.1';
import { trackVisit, renderVisitorStats, FOX_ADVICE, handleImgError } from './ui-utils.js';
import { renderCategorySelection, renderTestExecution } from './test-handler.js';
import { renderProfile, renderAdmin } from './profile-handler.js';
import { renderPrivacy, renderTerms, renderContact, renderGuide, renderAbout } from './info-handler.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const app = document.getElementById('app');

let isDataProcessing = false;
async function addPoints(amount, reason) {
    if (isDataProcessing) return false;
    isDataProcessing = true;
    try { const res = await authAddPoints(amount, reason); isDataProcessing = false; return res; }
    catch (e) { isDataProcessing = false; return false; }
}
async function usePoints(amount) {
    if (isDataProcessing) return false;
    isDataProcessing = true;
    try { const res = await authUsePoints(amount); isDataProcessing = false; return res; }
    catch (e) { isDataProcessing = false; return false; }
}

async function safeRender(renderFunc, ...args) {
    try { await renderFunc(...args); } catch (error) {
        console.error("Render Error:", error);
        app.innerHTML = `<div class="card" style="text-align:center; padding:4rem;">⚠️ 로딩 중 오류가 발생했습니다.<br><button onclick="location.reload()" class="btn-primary" style="margin-top:1rem;">새로고침</button></div>`;
    }
}

const categoryMap = { '#personality': '성격', '#face': '얼굴', '#fortune': '사주', '#fun': '재미', '#arcade': '오락실', '#board': '게시판', '#profile': '프로필', '#ranking': '랭킹', '#guide': '가이드', '#news': '공지' };
let currentFilter = '전체';

async function router() {
    if (!app) return;
    const hash = window.location.hash || '#home';
    const currentScrollY = window.scrollY;

    trackVisit().catch(() => {});
    renderVisitorStats().catch(() => {});

    document.querySelectorAll('.nav-link').forEach(link => {
        const filter = link.dataset.filter;
        const isActive = (hash === '#home' && filter === '전체') || (hash !== '#home' && link.getAttribute('href').includes(hash));
        link.classList.toggle('active', isActive);
    });

    const instantPages = ['#home', '#7check', '#guide', '#about', '#privacy', '#terms', '#contact'];
    if (!instantPages.includes(hash) && !hash.startsWith('#test/')) await authReady;

    app.innerHTML = ''; 
    if (hash === '#privacy') renderPrivacy();
    else if (hash === '#about') renderAbout();
    else if (hash === '#terms') renderTerms();
    else if (hash === '#contact') renderContact();
    else if (hash === '#arcade') renderArcade();
    else if (hash === '#board') await safeRender(renderBoard, app);
    else if (hash === '#ranking') await safeRender(renderRanking, app);
    else if (hash === '#guide') renderGuide();
    else if (hash === '#profile') renderProfile();
    else if (hash === '#admin') renderAdmin();
    else if (hash === '#7check') renderCategorySelection();
    else if (hash.startsWith('#test/')) await safeRender(renderTestExecution, hash.split('/')[1]);
    else {
        currentFilter = categoryMap[hash] || '전체';
        await safeRender(renderHome, hash);
    }

    authReady.then(() => { if (UserState.user) window.checkDailyQuests?.('login'); });
    if (window._preventScroll) { window.scrollTo(0, currentScrollY); window._preventScroll = false; } else { window.scrollTo(0, 0); }
}

async function renderHome(hash) {
    if (hash === '#home' || !hash) {
        const randomAdvice = FOX_ADVICE[Math.floor(Math.random() * FOX_ADVICE.length)];
        app.innerHTML = `
            <div class="dashboard fade-in">
                <div class="hero-section">
                    <div class="hero-content">
                        <div class="fox-advice-container" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; gap: 12px;">
                            <div class="fox-avatar" style="font-size: 3rem;">🦊</div>
                            <div class="advice-bubble" style="background: rgba(255,255,255,0.9); padding: 0.8rem 1.5rem; border-radius: 20px 20px 20px 4px; box-shadow: var(--shadow-md); font-weight: 800; color: #334155; border: 2px solid var(--accent-soft);">${randomAdvice}</div>
                        </div>
                        <span class="hero-tag">✨ 7번의 질문으로 찾는 나</span>
                        <h1>당신이 몰랐던<br>진짜 모습을 확인하세요</h1>
                        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                            <button class="btn-primary" style="padding: 1rem 2.5rem; font-size: 1.1rem; border-radius: 50px;" onclick="location.hash='#7check'">테스트 시작하기</button>
                        </div>
                    </div>
                </div>
                <div class="banner-grid" style="margin-top: 2rem;">
                    <div class="arcade-preview-card" onclick="location.hash='#arcade'"><div><h3 style="font-size: 1.8rem; font-weight: 900;">세븐 오락실 오픈!</h3><p style="font-weight: 600; opacity: 0.9;">매일 출석하고 포인트 채굴해서 희귀 이모지를 수집하세요.</p></div><span style="position:absolute; bottom: -20px; right: -10px; font-size: 8rem; opacity: 0.2;">🎰</span></div>
                    <div class="ranking-preview-card"><h4>🏆 명예의 전당</h4><button class="btn-secondary" style="width:100%; padding: 0.5rem; font-size: 0.8rem;" onclick="location.hash='#ranking'">랭킹 보기</button></div>
                    <div class="guide-preview-card" onclick="location.hash='#guide'"><h4>📖 이용 가이드</h4><p style="font-size: 0.8rem;">포인트 획득 방법부터 등급까지 한눈에!</p></div>
                </div>
            </div>`;
    } else {
        const filtered = TESTS.filter(t => t.category === currentFilter);
        app.innerHTML = `<div class="category-page fade-in"><div class="section-header"><h2>${currentFilter} 테스트</h2></div><div class="test-grid">${filtered.map(t => renderTestCard(t)).join('')}</div></div>`;
    }
    updateUI();
}

function renderTestCard(t) {
    return `<div class="test-card fade-in" onclick="location.hash='#test/${t.id}'"><div class="thumb-wrapper" style="position:relative; aspect-ratio:16/9; overflow:hidden; border-radius:15px;"><img src="${t.thumb}" style="width:100%; height:100%; object-fit:cover;" onerror="handleImgError(this)"></div><div class="test-info"><h3>${t.title}</h3><p>${t.desc}</p></div></div>`;
}

function renderArcade() {
    if (!UserState.user) { renderProfile(); return; }
    app.innerHTML = `<div class="arcade-page fade-in"><div class="card arcade-header" style="text-align:center; padding:2.5rem 1.5rem; background:linear-gradient(135deg, var(--accent-color), var(--accent-soft)); color:#fff; margin-bottom:2rem;"><h2>🎰 SEVEN ARCADE</h2><div style="margin-top:1.5rem; background:rgba(255,255,255,0.2); padding:0.8rem 2rem; border-radius:50px; display:inline-block;">내 포인트: <span id="user-points">0</span></div></div><div class="arcade-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1.5rem;"><div class="card arcade-item-card"><h3>⛏️ 포인트 채굴</h3><button id="click-game-btn" class="btn-primary" style="width:100%;">채굴기 가동</button></div><div class="card arcade-item-card"><h3>📅 출석체크</h3><button id="daily-checkin-btn" class="btn-primary" style="width:100%; background:#10b981;">출석체크 완료</button></div></div></div>`;
    initArcade();
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
initAuth(); router();
authReady.then(() => { router(); });
