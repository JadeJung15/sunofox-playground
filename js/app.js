import { initAuth, updateUI, UserState, addPoints as authAddPoints, authReady, postEconomyAction } from './auth.js?v=8.6.3';
import { copyLink } from './share.js?v=8.6.3';
import { renderHome, renderCategorySelection, fetchAllLikes, testLikesData } from './pages/home.js?v=8.6.3';
import { renderTestExecution } from './pages/tests.js?v=8.6.3';
import { renderProfileShell } from './pages/profile-shell.js?v=8.6.3';
import { trackVisit, renderVisitorStats } from './services/siteStats.js?v=8.6.3';

let isDataProcessing = false;
let isRouting = false;

const CATEGORY_ROUTE_MAP = {
    '#personality': '성격',
    '#face': '얼굴',
    '#fortune': '사주',
    '#fun': '재미',
    '#salary': '월급 루팡'
};

async function addPoints(amount, reason) {
    if (isDataProcessing) return false;
    isDataProcessing = true;
    try {
        return await authAddPoints(amount, reason);
    } catch (error) {
        return false;
    } finally {
        isDataProcessing = false;
    }
}

function handleQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('test');
    if (testId) {
        window.history.replaceState(null, '', window.location.origin + window.location.pathname);
        window.location.hash = `#test/${testId}`;
    }
}

function normalizeHash(hash) {
    if (!hash || hash === '#home') return '#home';
    return hash;
}

function setActiveNav(hash) {
    document.querySelectorAll('.tab').forEach((link) => {
        const target = link.dataset.route;
        const isHome = target === '#home' && (hash === '#home' || hash.startsWith('#test/'));
        const isCategories = target === '#categories' && (hash === '#categories' || Object.prototype.hasOwnProperty.call(CATEGORY_ROUTE_MAP, hash));
        const isProfile = target === '#profile' && hash === '#profile';
        link.classList.toggle('active', isHome || isCategories || isProfile);
    });
}

window.goHome = function goHome() {
    window.location.hash = '#home';
};

window.showAppToast = function showAppToast(message) {
    const root = document.getElementById('toast-root');
    if (!root) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    root.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 1800);
};

async function router() {
    handleQueryParams();
    const container = document.getElementById('app');
    if (!container || isRouting) return;

    isRouting = true;
    const hash = normalizeHash(window.location.hash);
    setActiveNav(hash);

    try {
        Promise.all([
            trackVisit().catch(() => {}),
            renderVisitorStats().catch(() => {})
        ]);

        if (Object.keys(testLikesData).length === 0) {
            await fetchAllLikes();
        }

        container.innerHTML = '';

        if (hash.startsWith('#test/')) {
            renderTestExecution(hash.split('/')[1]);
        } else if (hash === '#profile') {
            renderProfileShell();
        } else if (hash === '#categories' || hash === '#7check') {
            renderCategorySelection();
        } else if (Object.prototype.hasOwnProperty.call(CATEGORY_ROUTE_MAP, hash)) {
            window._currentFilter = CATEGORY_ROUTE_MAP[hash];
            await renderHome(hash);
        } else {
            await renderHome('#home');
        }

        authReady.then(() => {
            if (UserState.user && typeof window.checkDailyQuests === 'function') {
                window.checkDailyQuests('login').catch(() => {});
            }
        });

        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Routing error:', error);
        container.innerHTML = `
            <section class="page-shell">
                <div class="empty-state">
                    <strong>화면을 불러오지 못했습니다.</strong>
                    <p>새로고침 후 다시 시도해 주세요.</p>
                    <button class="button button--primary" onclick="location.reload()">새로고침</button>
                </div>
            </section>
        `;
    } finally {
        isRouting = false;
    }
}

window.checkDailyQuests = async function checkDailyQuests(type) {
    if (!UserState.user || !UserState.data) return;
    try {
        const result = await postEconomyAction('completeQuest', { questType: type });
        UserState.data.quests = result.quests;
        if (result.reward) {
            UserState.data.points = (UserState.data.points || 0) + result.reward;
            updateUI();
        }
    } catch (error) {
        console.error('Quest error:', error);
    }
};

window.globalShareSite = async function globalShareSite() {
    const siteUrl = window.location.origin;
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'SevenCheck',
                text: '심리테스트 하러 와.',
                url: siteUrl
            });
            await addPoints(30, '사이트 공유 보상');
        } catch (error) {
            console.error(error);
        }
    } else {
        await copyLink(siteUrl);
    }
};

window.openCategoryHub = function openCategoryHub() {
    window.location.hash = '#categories';
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

initAuth();
authReady.then(() => {
    if (!isRouting) router();
});
