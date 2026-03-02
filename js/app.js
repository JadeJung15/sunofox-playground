import { initAuth, updateUI, UserState, addPoints as authAddPoints, authReady, postEconomyAction } from './auth.js?v=8.5.2';
import { copyLink } from './share.js?v=8.5.2';
import { renderBoard } from './board.js?v=8.5.2';
import { renderRanking } from './ranking.js?v=8.5.2';
import { db } from './firebase-init.js?v=8.5.2';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { renderHome, renderCategorySelection, fetchAllLikes } from './pages/home.js?v=8.5.2';
import { trackVisit, renderVisitorStats } from './services/siteStats.js?v=8.5.2';
import { renderProfile } from './pages/profile.js?v=8.5.2';
import { renderAdmin } from './pages/admin.js?v=8.5.2';
import { renderArcade } from './pages/arcade-page.js?v=8.5.2';
import { renderTestExecution, renderResult } from './pages/tests.js?v=8.5.2';
import { renderSalaryGame } from './pages/salary.js?v=8.5.2';
import { renderAbout, renderPrivacy, renderTerms, renderContact, renderGuide, renderEncyclopedia } from './pages/info.js?v=8.5.2';
import { renderDailyList, renderDailyDetail } from './pages/daily.js?v=8.5.2';

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
// Router & URL Handler
// =================================================================

const categoryMap = {
    '#daily': '오늘의 테스트', '#personality': '성격', '#face': '얼굴', '#fortune': '사주', '#fun': '재미', '#salary': '월급 루팡',
    '#arcade': '오락실', '#board': '게시판', '#profile': '프로필', '#ranking': '랭킹', '#guide': '가이드', '#news': '공지'
};
let currentFilter = '전체';
let isRouting = false;

function getRouteGroup(route, hash) {
    if (route.kind === 'daily-list' || route.kind === 'daily-detail') return 'tests';
    if (hash === '#7check') return 'tests';
    if (hash === '#ranking') return 'ranking';
    if (hash === '#profile') return 'profile';
    if (hash.startsWith('#test/')) return 'tests';
    if (['#personality', '#face', '#fortune', '#fun', '#salary'].includes(hash)) return 'tests';
    return 'home';
}

function updateActiveNav(route, hash) {
    const activeGroup = getRouteGroup(route, hash || '#home');
    document.querySelectorAll('.nav-link').forEach((link) => {
        const isActive = link.dataset.routeGroup === activeGroup;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function resolveRoute() {
    const hash = window.location.hash || '';
    if (hash) {
        return { kind: 'hash', value: hash };
    }

    const { pathname } = window.location;
    if (pathname === '/daily' || pathname === '/daily/') {
        return { kind: 'daily-list', value: '/daily/' };
    }
    if (pathname.startsWith('/daily/')) {
        const slug = decodeURIComponent(pathname.replace(/^\/daily\//, '').replace(/\/+$/, ''));
        return { kind: 'daily-detail', value: slug };
    }
    return { kind: 'hash', value: '#home' };
}

window.goToDaily = (path = '/daily/') => {
    window.history.pushState({}, '', path);
    router();
};

// Cloudflare Workers 호환성을 위한 쿼리 파라미터 처리
function handleQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('test');
    if (testId) {
        // ?test=id 형식을 #test/id 형식으로 변환 후 URL 정리
        window.history.replaceState(null, '', window.location.origin + window.location.pathname);
        window.location.hash = `#test/${testId}`;
    }
}

async function router() {
    handleQueryParams();
    const container = document.getElementById('app');
    if (!container || isRouting) return;

    isRouting = true;
    const route = resolveRoute();
    const hash = route.kind === 'hash' ? route.value : '';
    const currentScrollY = window.scrollY;

    try {
        // 통계 및 좋아요 데이터 로드 (비동기 병렬 처리)
        Promise.all([
            trackVisit().catch(() => {}),
            renderVisitorStats().catch(() => {})
        ]);

        updateActiveNav(route, hash);

        // 즉시 렌더링 가능한 페이지 (비회원 접근 허용)
        const instantPages = ['#home', '#7check', '#guide', '#about', '#privacy', '#terms', '#contact', '#arcade', '#profile', '#ranking', '#board', '#salary-tab-shift', '#daily'];
        if (route.kind !== 'daily-list' && route.kind !== 'daily-detail' && !instantPages.includes(hash) && !hash.startsWith('#test/')) {
            await authReady;
        }

        container.innerHTML = '';
        if (route.kind === 'daily-list' || hash === '#daily') await renderDailyList();
        else if (route.kind === 'daily-detail') await renderDailyDetail(route.value);
        else if (hash === '#privacy') renderPrivacy();
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
        else if (hash === '#7check') {
            await fetchAllLikes();
            renderCategorySelection();
        }
        else if (hash === '#salary-tab-shift') await renderSalaryGame();
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
            <section class="ui-surface ui-panel ui-empty-state">
                <strong>서비스를 불러올 수 없습니다.</strong>
                <p>인증 서버 또는 네트워크 상태를 확인해 주세요.</p>
                <button onclick="location.reload()" class="ui-button ui-button--primary" type="button">새로고침</button>
            </section>`;
    } finally {
        isRouting = false;
    }
}

window.checkDailyQuests = async function(type) {
    if (!UserState.user || !UserState.data) return;
    try {
        const result = await postEconomyAction('completeQuest', { questType: type });
        UserState.data.quests = result.quests;
        if (result.reward) {
            UserState.data.points = (UserState.data.points || 0) + result.reward;
            updateUI();
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

window.addEventListener('hashchange', router);
window.addEventListener('popstate', router);
window.addEventListener('load', router);

// 초기화 시작
initAuth();
authReady.then(() => {
    if (!isRouting) router();
});
