import { initAuth, updateUI, UserState, addPoints as authAddPoints, authReady } from './auth.js';
import { copyLink } from './share.js';
import { renderBoard } from './board.js';
import { renderRanking } from './ranking.js';
import { db } from './firebase-init.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { renderHome, renderCategorySelection, fetchAllLikes, testLikesData } from './pages/home.js';
import { trackVisit, renderVisitorStats } from './services/siteStats.js';
import { renderProfile } from './pages/profile.js';
import { renderAdmin } from './pages/admin.js';
import { renderArcade } from './pages/arcade-page.js';
import { renderTestExecution, renderResult } from './pages/tests.js';
import { renderAbout, renderPrivacy, renderTerms, renderContact, renderGuide, renderEncyclopedia } from './pages/info.js';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80";

window.handleImgError = function(img) {
    img.onerror = null;
    img.src = DEFAULT_IMAGE;
    img.classList.add('img-fallback');
};

// [보안] 데이터 중복 처리 방지 잠금 장치
let isDataProcessing = false;

async function addPoints(amount, reason) {
    if (isDataProcessing) return false;
    isDataProcessing = true;
    try {
        const res = await authAddPoints(amount, reason);
        isDataProcessing = false;
        return res;
    } catch (e) {
        isDataProcessing = false;
        return false;
    }
}

// =================================================================
// Router
// =================================================================

const categoryMap = {
    '#personality': '성격', '#face': '얼굴', '#fortune': '사주', '#fun': '재미',
    '#arcade': '오락실', '#board': '게시판', '#profile': '프로필', '#ranking': '랭킹', '#guide': '가이드', '#news': '공지'
};
let currentFilter = '전체';
let isRouting = false;

async function router() {
    const container = document.getElementById('app');
    if (!container || isRouting) return;

    isRouting = true;
    const hash = window.location.hash || '#home';
    const currentScrollY = window.scrollY;

    try {
        // 통계 및 좋아요 데이터 로드 (비동기 병렬 처리)
        Promise.all([
            trackVisit().catch(() => {}),
            renderVisitorStats().catch(() => {})
        ]);

        if (Object.keys(testLikesData).length === 0) {
            await fetchAllLikes();
        }

        // 네비게이션 활성화 상태 업데이트
        document.querySelectorAll('.nav-link').forEach(link => {
            const filter = link.dataset.filter;
            const href = link.getAttribute('href') || '';
            const isActive = (hash === '#home' && filter === '전체') ||
                           (hash !== '#home' && href.length > 1 && hash.includes(href.substring(1)));
            link.classList.toggle('active', isActive);
        });

        // 즉시 렌더링 가능한 페이지가 아니면 인증 상태 대기
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
            window._currentFilter = currentFilter;
            await renderHome(hash);
        }

        // 일일 퀘스트 체크
        authReady.then(() => {
            if (UserState.user && typeof window.checkDailyQuests === 'function') {
                window.checkDailyQuests('login').catch(() => {});
            }
        });

        // 스크롤 복구 로직
        if (window._preventScroll) {
            window.scrollTo(0, currentScrollY);
            window._preventScroll = false;
        } else {
            window.scrollTo(0, 0);
        }

    } catch (error) {
        console.error("Routing error:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:3rem;">
                <h3>⚠️ 서비스를 불러올 수 없습니다</h3>
                <p style="color:var(--text-muted); margin:1rem 0;">인증 서버 또는 네트워크 상태를 확인해 주세요.</p>
                <button onclick="location.reload()" class="btn-primary" style="margin-top:1rem;">새로고침</button>
            </div>`;
    } finally {
        isRouting = false;
    }
}

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
// Global Share
// =================================================================

let lastGlobalShareTime = 0;
window.globalShareSite = async () => {
    const siteUrl = window.location.origin;
    const now = Date.now();

    const rewardUser = async () => {
        if (now - lastGlobalShareTime > 10000) {
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
        } catch (e) { console.error(e); }
    } else {
        await copyLink(siteUrl);
    }
};

// =================================================================
// Init
// =================================================================

const headerShareBtn = document.getElementById('share-site-btn');
if (headerShareBtn) {
    headerShareBtn.onclick = window.globalShareSite;
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// 초기화 시작
initAuth();
// router()를 직접 호출하지 않고 authReady 이후에 한 번만 실행하도록 유도 (중복 실행 방지)
authReady.then(() => { 
    if (!isRouting) router(); 
});

// 모바일 드롭다운 메뉴 자동 닫기 및 토글 로직
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.nav-dropdown');
    const dropbtn = document.querySelector('.nav-dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (dropbtn && dropdownContent) {
        dropbtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isActive = dropdownContent.classList.contains('is-active');
            document.querySelectorAll('.dropdown-content').forEach(el => el.classList.remove('is-active'));
            if (!isActive) {
                dropdownContent.classList.add('is-active');
            }
        });

        dropdownContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                dropdownContent.classList.remove('is-active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdownContent.classList.remove('is-active');
            }
        });
    }
});
