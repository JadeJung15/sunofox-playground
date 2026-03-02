import { initAuth, updateUI, UserState, addPoints as authAddPoints, authReady, postEconomyAction } from './auth.js?v=8.5.2';
import { copyLink } from './share.js?v=8.5.2';
import { renderHome, renderCategorySelection } from './pages/home.js?v=8.5.2';
import { trackVisit, renderVisitorStats } from './services/siteStats.js?v=8.5.2';
import { renderProfile } from './pages/profile.js?v=8.5.2';
import { renderTestExecution } from './pages/tests.js?v=8.5.2';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80";

window.handleImgError = function(img) {
    img.onerror = null;
    img.src = DEFAULT_IMAGE;
    img.classList.add('img-fallback');
};

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

let isRouting = false;

function getRouteGroup(hash) {
    if (hash === '#7check' || hash.startsWith('#test/')) return 'tests';
    if (hash === '#profile') return 'profile';
    return 'home';
}

function updateActiveNav(hash) {
    const activeGroup = getRouteGroup(hash || '#home');
    document.querySelectorAll('.nav-link').forEach((link) => {
        const isActive = link.dataset.routeGroup === activeGroup;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function handleQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('test');
    if (testId) {
        window.history.replaceState(null, '', window.location.origin + window.location.pathname);
        window.location.hash = `#test/${testId}`;
    }
}

async function router() {
    handleQueryParams();
    const container = document.getElementById('app');
    if (!container || isRouting) return;

    isRouting = true;
    const hash = window.location.hash || '#home';

    try {
        Promise.all([
            trackVisit().catch(() => {}),
            renderVisitorStats().catch(() => {})
        ]);

        updateActiveNav(hash);
        container.innerHTML = '';

        if (hash === '#profile') {
            await authReady;
            renderProfile();
        } else if (hash === '#7check') {
            await renderCategorySelection();
        } else if (hash.startsWith('#test/')) {
            renderTestExecution(hash.split('/')[1]);
        } else {
            await renderHome();
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
            <section class="ui-surface ui-panel ui-empty-state">
                <strong>서비스를 불러올 수 없습니다.</strong>
                <p>잠시 후 다시 시도해 주세요.</p>
                <button onclick="location.reload()" class="ui-button ui-button--primary" type="button">새로고침</button>
            </section>
        `;
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
    } catch (e) {
        console.error('Quest error:', e);
    }
};

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
                title: 'SevenCheck - 심리테스트 10선',
                text: '심플한 심리테스트 모음',
                url: siteUrl
            });
            await rewardUser();
        } catch (e) {
            console.error(e);
        }
    } else {
        await copyLink(siteUrl);
    }
};

window.addEventListener('hashchange', router);
window.addEventListener('popstate', router);
window.addEventListener('load', router);

initAuth();
authReady.then(() => {
    if (!isRouting) router();
});
