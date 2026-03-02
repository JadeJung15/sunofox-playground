import { updateUI, UserState, addPoints } from '../auth.js?v=8.6.3';
import { db } from '../firebase-init.js?v=8.6.3';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.6.3';
import { renderBadge, renderButton, renderChip, renderSectionHead } from '../ui/components.js?v=8.6.3';

const CATEGORY_ORDER = ['성격', '얼굴', '사주', '재미', '월급 루팡'];

export const testLikesData = {};

export async function fetchAllLikes() {
    try {
        const snap = await getDocs(collection(db, 'testStats'));
        snap.forEach((item) => {
            testLikesData[item.id] = item.data().likes || 0;
        });
    } catch (error) {
        console.error('Fetch likes failed:', error);
    }
}

window.fetchAllLikes = fetchAllLikes;

function getLatestTests() {
    return [...TESTS].reverse();
}

function formatCompact(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `${num}`;
}

function getCategoryRoute(category) {
    if (category === '성격') return '#personality';
    if (category === '얼굴') return '#face';
    if (category === '사주') return '#fortune';
    if (category === '재미') return '#fun';
    if (category === '월급 루팡') return '#salary';
    return '#home';
}

function getPopularity(testId) {
    const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const playCount = (seed * 123) % 15000 + 5000;
    const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
    return {
        playCount,
        likes: (testLikesData[testId] || 0) + baseLikes
    };
}

function getTrendingTests(limit = 6) {
    return getLatestTests()
        .map((test) => {
            const popularity = getPopularity(test.id);
            return { test, score: popularity.playCount + popularity.likes * 4 };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.test);
}

function getNewTests(limit = 4) {
    return getLatestTests().slice(0, limit);
}

function getRandomTest() {
    return TESTS[Math.floor(Math.random() * TESTS.length)];
}

async function handleLike(testId) {
    if (!UserState.user) {
        alert('로그인이 필요합니다.');
        return;
    }

    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
    const likeKey = `liked_${testId}_${today}`;
    if (localStorage.getItem(likeKey)) {
        alert('오늘 이미 추천했습니다.');
        return;
    }

    try {
        await setDoc(doc(db, 'testStats', testId), { likes: increment(1) }, { merge: true });
        localStorage.setItem(likeKey, 'true');
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5, '테스트 추천 보상');

        const counter = document.getElementById(`like-count-${testId}`);
        if (counter) counter.textContent = formatCompact(getPopularity(testId).likes);
        window.showAppToast?.('추천을 반영했습니다.');
    } catch (error) {
        console.error('Like operation failed:', error);
        alert('추천 처리 중 오류가 발생했습니다.');
    }
}

window.handleLike = handleLike;
window.startRandomTest = function startRandomTest() {
    const next = getRandomTest();
    if (next) location.hash = `#test/${next.id}`;
};

function getCategoryCards() {
    const latestTests = getLatestTests();
    return CATEGORY_ORDER.map((category) => {
        const tests = latestTests.filter((test) => test.category === category);
        return {
            category,
            route: getCategoryRoute(category),
            count: tests.length,
            latestTitle: tests[0]?.title || '준비 중'
        };
    });
}

function renderHero(featured, trendingTest) {
    return `
        <section class="hero">
            <p class="kicker">SevenCheck Studio · by SunoFox</p>
            <h1>7개의 질문으로<br>지금의 나를 확인.</h1>
            <p class="sub">짧게, 빠르게, 웃기게. 결과는 공유하기 좋게.</p>
            <div class="cta-row">
                ${renderButton({ label: '테스트 시작', attrs: `onclick="location.hash='#test/${featured.id}'"` })}
                ${renderButton({ label: '인기 테스트', variant: 'ghost', attrs: `onclick="location.hash='#test/${trendingTest.id}'"` })}
            </div>
            <div class="hero-soft-cta">
                ${renderButton({ label: '🎲 랜덤으로 바로 시작', variant: 'soft', attrs: 'onclick="window.startRandomTest()"' })}
            </div>
        </section>
    `;
}

function renderSearchBox() {
    return `
        <section class="panel">
            <input id="home-search" class="search-box" type="search" placeholder="테스트 제목 또는 카테고리 검색" autocomplete="off">
        </section>
    `;
}

function renderQuickStart() {
    return `
        <section class="block">
            <div class="block-head">
                <h2>Quick Start</h2>
            </div>
            <div class="panel">
                ${renderButton({ label: '🎲 랜덤 시작', variant: 'soft', attrs: 'onclick="window.startRandomTest()"' })}
            </div>
        </section>
    `;
}

function renderCategoryChips(activeCategory = '') {
    return `
        <section class="block" id="categories">
            <div class="block-head">
                <h2>카테고리</h2>
            </div>
            <div class="chips">
                ${CATEGORY_ORDER.map((category) => `
                    <button class="chip${activeCategory === category ? ' active' : ''}" onclick="location.hash='${getCategoryRoute(category)}'">${category}</button>
                `).join('')}
            </div>
        </section>
    `;
}

function renderSocialProof() {
    return `
        <section id="home-social-proof" class="social-proof">
            <div>
                <strong>지금도 참여가 이어지고 있어요</strong>
                <p>오늘 <span id="home-today-visitors">0</span>명 참여 · 누적 <span id="home-total-visitors">0</span>회</p>
            </div>
            ${renderButton({ label: '인기 테스트 보기', variant: 'ghost', attrs: `onclick="location.hash='#categories'"` })}
        </section>
    `;
}

function renderGrid(tests) {
    return tests.map((test, index) => renderTestCard(test, index < 3)).join('');
}

function renderHomeSections() {
    const latestTests = getLatestTests();
    const featured = latestTests[0];
    const trending = getTrendingTests(6);
    const newTests = getNewTests(4);

    return `
        ${renderHero(featured, trending[0] || featured)}
        ${renderQuickStart()}
        ${renderSearchBox()}
        <section class="block">
            <div class="block-head">
                <h2>🔥 지금 뜨는 테스트</h2>
                <a class="link" href="#categories">전체 보기</a>
            </div>
            <div id="trending-grid" class="test-grid">${renderGrid(trending)}</div>
        </section>
        <section class="block">
            <div class="block-head">
                <h2>🆕 새로 나온 테스트</h2>
            </div>
            <div class="test-grid">${renderGrid(newTests)}</div>
        </section>
        ${renderCategoryChips()}
        ${renderSocialProof()}
    `;
}

function renderFilteredSection(filter, tests) {
    return `
        ${renderCategoryChips(filter)}
        ${renderSectionHead({
            eyebrow: 'Category',
            title: `${filter} 테스트`,
            description: `${tests.length}개 테스트`
        })}
        <div id="test-list-grid" class="test-grid">${renderGrid(tests)}</div>
    `;
}

export function renderCategorySelection() {
    const app = document.getElementById('app');
    const cards = getCategoryCards().map((item) => `
        <article class="category-card" onclick="location.hash='${item.route}'">
            <div class="category-card__top">
                ${renderBadge(item.category)}
                <span>${item.count}개</span>
            </div>
            <h3>${item.category}</h3>
            <p>${item.latestTitle}</p>
            <div class="category-card__bottom">
                <span>카테고리 열기</span>
                <span>→</span>
            </div>
        </article>
    `).join('');

    app.innerHTML = `
        <section class="page-shell">
            ${renderSectionHead({
                eyebrow: 'Categories',
                title: '카테고리로 바로 이동',
                description: '원하는 결의 테스트만 빠르게 골라 들어갑니다.'
            })}
            ${renderCategoryChips()}
            <div class="category-grid">${cards}</div>
        </section>
    `;

    updateUI();
}

export async function renderHome(hash) {
    const app = document.getElementById('app');
    const latestTests = getLatestTests();
    const filter = window._currentFilter;
    const filtered = hash === '#home' ? latestTests : latestTests.filter((test) => test.category === filter);

    app.innerHTML = `
        <section class="page-shell">
            ${hash === '#home' ? renderHomeSections() : renderFilteredSection(filter, filtered)}
        </section>
    `;

    const searchInput = document.getElementById('home-search');
    const trendingGrid = document.getElementById('trending-grid');
    if (searchInput && trendingGrid) {
        searchInput.addEventListener('input', (event) => {
            const term = event.target.value.toLowerCase().trim();
            const result = latestTests.filter((test) => {
                return test.title.toLowerCase().includes(term) || test.category.toLowerCase().includes(term);
            });

            trendingGrid.innerHTML = result.length
                ? renderGrid(result.slice(0, 6))
                : `
                    <div class="empty-state">
                        <strong>검색 결과가 없습니다.</strong>
                        <p>다른 키워드로 다시 찾아보세요.</p>
                    </div>
                `;
        });
    }

    updateUI();
}

export function renderTestCard(test, isHot = false) {
    const popularity = getPopularity(test.id);
    const resultCount = Object.keys(test.results || {}).length || 0;
    return `
        <article class="test-card" onclick="location.hash='#test/${test.id}'">
            <div class="test-card__top">
                <span>${test.category}</span>
                <span>${formatCompact(popularity.playCount)} plays</span>
            </div>
            <h3>${test.title}</h3>
            <p>${test.questions?.length || 7}문항 · 결과 ${resultCount}종 · ${test.desc}</p>
            <div class="badges">
                ${renderBadge('7Q', 'q7')}
                ${isHot ? renderBadge('TREND', 'hot') : ''}
                ${renderBadge(test.category)}
            </div>
            <div class="test-card__bottom">
                <button class="like-button" onclick="event.stopPropagation(); handleLike('${test.id}')">
                    추천 <span id="like-count-${test.id}">${formatCompact(popularity.likes)}</span>
                </button>
                <span>시작</span>
            </div>
        </article>
    `;
}
