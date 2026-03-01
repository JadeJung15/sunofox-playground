import { initAuth, updateUI, UserState, addPoints as authAddPoints, authReady, postEconomyAction } from './auth.js?v=8.5.8';
import { copyLink } from './share.js?v=8.5.8';
import { renderBoard } from './board.js?v=8.5.8';
import { renderRanking } from './ranking.js?v=8.5.8';
import { db } from './firebase-init.js?v=8.5.8';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import { renderHome, renderCategorySelection, fetchAllLikes, testLikesData } from './pages/home.js?v=8.5.8';
import { trackVisit, renderVisitorStats } from './services/siteStats.js?v=8.5.8';
import { renderProfile } from './pages/profile.js?v=8.5.8';
import { renderAdmin } from './pages/admin.js?v=8.5.8';
import { renderArcade } from './pages/arcade-page.js?v=8.5.8';
import { renderTestExecution, renderResult } from './pages/tests.js?v=8.5.8';
import { renderSalaryGame } from './pages/salary.js?v=8.5.8';
import { renderAbout, renderPrivacy, renderTerms, renderContact, renderEncyclopedia } from './pages/info.js?v=8.5.8';
import { renderDailyList, renderDailyDetail } from './pages/daily.js?v=8.5.8';

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
    '#arcade': '오락실', '#board': '게시판', '#profile': '프로필', '#ranking': '랭킹', '#news': '공지'
};
let currentFilter = '전체';
let isRouting = false;

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

        if (Object.keys(testLikesData).length === 0) {
            await fetchAllLikes();
        }

        // 네비게이션 활성화 상태 업데이트
        document.querySelectorAll('.nav-link').forEach(link => {
            const filter = link.dataset.filter;
            const href = link.getAttribute('href') || '';
            const path = link.dataset.path || '';
            const isDailyRoute = route.kind === 'daily-list' || route.kind === 'daily-detail';
            const isActive = (hash === '#home' && filter === '전체') ||
                           (hash && hash !== '#home' && href.length > 1 && hash.includes(href.substring(1))) ||
                           (isDailyRoute && path && route.kind.startsWith('daily') && path === '/daily');
            link.classList.toggle('active', isActive);
        });

        // 즉시 렌더링 가능한 페이지 (비회원 접근 허용)
        const instantPages = ['#home', '#7check', '#about', '#privacy', '#terms', '#contact', '#arcade', '#profile', '#ranking', '#board', '#salary-tab-shift', '#daily'];
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
        else if (hash === '#guide') location.hash = '#home';
        else if (hash === '#book') await renderEncyclopedia();
        else if (hash === '#profile') await renderProfile();
        else if (hash === '#admin') renderAdmin();
        else if (hash === '#7check') renderCategorySelection();
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
// router()를 직접 호출하지 않고 authReady 이후에 한 번만 실행하도록 유도 (중복 실행 방지)
authReady.then(() => { 
    if (!isRouting) router(); 
});

// 드롭다운 메뉴 토글 로직 (완전 재작성)
const initDropdown = () => {
    const dropdown = document.querySelector('.nav-dropdown');
    const dropbtn = document.querySelector('.nav-dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (!dropbtn || !dropdownContent || !dropdown) return;

    const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

    const positionDropdown = () => {
        if (!isMobileViewport()) {
            dropdownContent.classList.remove('mobile-overlay');
            dropdownContent.style.removeProperty('top');
            dropdownContent.style.removeProperty('left');
            dropdownContent.style.removeProperty('width');
            return;
        }

        const rect = newBtn.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const overlayWidth = Math.min(Math.max(rect.width, 200), viewportWidth - 24);
        const left = Math.min(Math.max(12, rect.left), viewportWidth - overlayWidth - 12);

        dropdownContent.classList.add('mobile-overlay');
        dropdownContent.style.top = `${rect.bottom + 10}px`;
        dropdownContent.style.left = `${left}px`;
        dropdownContent.style.width = `${overlayWidth}px`;
    };

    const closeDropdown = () => {
        dropdownContent.classList.remove('is-active');
    };

    // 기존 이벤트가 중복 등록되지 않도록 버튼을 복제하여 교체
    const newBtn = dropbtn.cloneNode(true);
    dropbtn.parentNode.replaceChild(newBtn, dropbtn);

    // [핵심] 클릭 이벤트: 모바일 및 PC 클릭 대응
    newBtn.addEventListener('click', (e) => {
        // 기본 동작(링크 이동 등) 막지 않음. 이벤트 전파만 차단하여 바깥영역 클릭과 분리.
        e.stopPropagation();

        // 현재 상태 확인 (스타일 display 속성이나 클래스 유무로 판단)
        const isOpened = dropdownContent.classList.contains('is-active');

        // 다른 드롭다운이 있다면 모두 닫기 (현재는 하나지만 확장성 고려)
        document.querySelectorAll('.dropdown-content').forEach(el => el.classList.remove('is-active'));

        // 토글 동작
        if (!isOpened) {
            positionDropdown();
            dropdownContent.classList.add('is-active');
        } else {
            closeDropdown();
        }
    });

    // PC 호버 지원 (JS로 부드럽게)
    dropdown.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            dropdownContent.classList.add('is-active');
        }
    });

    dropdown.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
            closeDropdown();
        }
    });

    // 드롭다운 내부 링크 클릭 시 메뉴 닫기
    dropdownContent.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeDropdown();
        });
    });

    // 바탕 영역 클릭 시 닫기
    document.addEventListener('click', (e) => {
        // 클릭한 대상이 드롭다운 내부가 아닐 때만 닫기
        if (!dropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    window.addEventListener('resize', () => {
        if (!dropdownContent.classList.contains('is-active')) return;
        positionDropdown();
    });

    window.addEventListener('scroll', () => {
        if (!dropdownContent.classList.contains('is-active')) return;
        positionDropdown();
    }, { passive: true });

    window.addEventListener('hashchange', closeDropdown);
};
// DOM 로드 완료 후 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdown);
} else {
    initDropdown();
}
