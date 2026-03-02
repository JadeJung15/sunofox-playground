import { updateUI, UserState, addPoints } from '../auth.js?v=8.6.0';
import { db } from '../firebase-init.js?v=8.6.0';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.6.0';
import { renderBadge, renderButton, renderChip, renderSectionHead } from '../ui/components.js?v=8.6.0';

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
        alert('추천을 반영했습니다.');
    } catch (error) {
        console.error('Like operation failed:', error);
        alert('추천 처리 중 오류가 발생했습니다.');
    }
}

window.handleLike = handleLike;

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
                eyebrow: 'Category',
                title: '테스트 종류',
                description: '복잡한 홈 대신 카테고리와 테스트 목록만 남겼습니다.'
            })}
            <div class="category-grid">${cards}</div>
        </section>
    `;

    updateUI();
}

function renderHero(featured) {
    return `
        <section class="hero">
            <div class="hero__copy">
                ${renderBadge('Psychology tests')}
                <h1>전부 지우고<br>테스트만 남겼다</h1>
                <p>선택, 진행, 결과. 그 흐름만 빠르게 타도록 다시 만들었습니다.</p>
                <div class="hero__actions">
                    ${renderButton({ label: '바로 시작', attrs: `onclick="location.hash='#test/${featured.id}'"` })}
                    ${renderButton({ label: '카테고리', variant: 'ghost', attrs: 'onclick="window.openCategoryHub()"' })}
                </div>
            </div>
            <div class="hero__meta">
                <div class="metric">
                    <span>지금 추천</span>
                    <strong>${featured.title}</strong>
                </div>
                <div class="metric">
                    <span>전체 테스트</span>
                    <strong>${TESTS.length}</strong>
                </div>
            </div>
        </section>
    `;
}

function renderCategoryChips() {
    return `
        <div class="panel">
            <div class="chip-row">
                ${CATEGORY_ORDER.map((category) => `
                    <button class="chip" onclick="location.hash='${getCategoryRoute(category)}'">${category}</button>
                `).join('')}
            </div>
        </div>
    `;
}

function renderSearchBox() {
    return `
        <section class="panel">
            <input id="home-search" class="search-box" type="search" placeholder="테스트 제목 또는 카테고리 검색" autocomplete="off">
        </section>
    `;
}

function renderGrid(tests) {
    return tests.map((test) => renderTestCard(test)).join('');
}

export async function renderHome(hash) {
    const app = document.getElementById('app');
    const latestTests = getLatestTests();
    const featured = latestTests[0];
    const filter = window._currentFilter;
    const filtered = hash === '#home' ? latestTests : latestTests.filter((test) => test.category === filter);

    app.innerHTML = `
        <section class="page-shell">
            ${hash === '#home' ? renderHero(featured) : ''}
            ${hash === '#home' ? renderSearchBox() : ''}
            ${hash === '#home' ? renderCategoryChips() : ''}
            ${renderSectionHead({
                eyebrow: hash === '#home' ? 'All tests' : filter,
                title: hash === '#home' ? '테스트 고르기' : `${filter} 테스트`,
                description: hash === '#home' ? '원하는 테스트를 바로 선택하면 됩니다.' : `${filtered.length}개 테스트`
            })}
            <div id="test-list-grid" class="test-grid">${renderGrid(filtered)}</div>
        </section>
    `;

    const searchInput = document.getElementById('home-search');
    const grid = document.getElementById('test-list-grid');
    if (searchInput && grid) {
        searchInput.addEventListener('input', (event) => {
            const term = event.target.value.toLowerCase().trim();
            const result = latestTests.filter((test) => {
                return test.title.toLowerCase().includes(term) || test.category.toLowerCase().includes(term);
            });

            grid.innerHTML = result.length
                ? renderGrid(result.slice(0, 18))
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

export function renderTestCard(test) {
    const popularity = getPopularity(test.id);
    return `
        <article class="test-card" onclick="location.hash='#test/${test.id}'">
            <div class="test-card__top">
                ${renderBadge(test.category)}
                <span>${formatCompact(popularity.playCount)} plays</span>
            </div>
            <h3>${test.title}</h3>
            <p>${test.desc}</p>
            <div class="test-card__bottom">
                <button class="like-button" onclick="event.stopPropagation(); handleLike('${test.id}')">
                    추천 <span id="like-count-${test.id}">${formatCompact(popularity.likes)}</span>
                </button>
                <span>시작하기</span>
            </div>
        </article>
    `;
}
