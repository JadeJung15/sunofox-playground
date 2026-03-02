import { updateUI, UserState, addPoints } from '../auth.js?v=8.5.2';
import { db } from '../firebase-init.js?v=8.5.2';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.5.2';
import {
    renderBadge,
    renderButton,
    renderChip,
    renderEmptyState,
    renderSectionHeader,
    renderStatCard
} from '../ui/components.js?v=8.5.2';

const DAILY_CATEGORY_META = {
    hash: '/daily/',
    category: 'daily',
    label: 'TODAY',
    title: '오늘의 테스트',
    desc: '하루 한 번 같은 결과로 저장되는 초단기 테스트 모음',
    count: 30
};

const CATEGORY_META = {
    성격: { label: 'PERSONALITY', desc: '관계와 성향을 읽는 질문형 테스트' },
    얼굴: { label: 'VISUAL', desc: '분위기와 첫인상 중심의 가벼운 진단' },
    사주: { label: 'FORTUNE', desc: '오늘의 흐름을 보는 운세형 콘텐츠' },
    재미: { label: 'FUN', desc: '짧고 가볍게 즐기는 밈 감성 테스트' },
    '월급 루팡': { label: 'OFFICE', desc: '회사에서 조용히 즐기기 좋은 콘텐츠' }
};

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

function getCategoryItems() {
    const latestTests = getLatestTests();
    const categories = Object.entries(CATEGORY_META).map(([category, meta]) => {
        const tests = latestTests.filter((test) => test.category === category);
        return {
            hash: `#${category === '월급 루팡' ? 'salary' : category === '사주' ? 'fortune' : category === '얼굴' ? 'face' : category === '재미' ? 'fun' : 'personality'}`,
            category,
            title: category,
            count: tests.length,
            latestTitle: tests[0]?.title || '준비 중',
            ...meta
        };
    });

    return [
        DAILY_CATEGORY_META,
        ...categories
    ];
}

function getRouteForTest(test) {
    return `#test/${test.id}`;
}

function formatCompactCount(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `${num}`;
}

function getPopularity(testId) {
    const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const playCount = (seed * 123) % 15000 + 5000;
    const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
    return {
        playCount,
        displayLikes: (testLikesData[testId] || 0) + baseLikes
    };
}

async function handleLike(testId) {
    if (!UserState.user) {
        alert('로그인이 필요합니다. 우측 상단의 로그인 버튼을 이용해 주세요.');
        return;
    }

    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
    const likeKey = `liked_${testId}_${today}`;

    if (localStorage.getItem(likeKey)) {
        alert('오늘 이미 이 테스트에 하트를 누르셨습니다.');
        return;
    }

    try {
        await setDoc(doc(db, 'testStats', testId), { likes: increment(1) }, { merge: true });

        localStorage.setItem(likeKey, 'true');
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5, '테스트 추천 보상');

        const counter = document.getElementById(`like-count-${testId}`);
        if (counter) {
            counter.textContent = formatCompactCount(getPopularity(testId).displayLikes);
        }

        alert('하트를 반영했습니다. 5P가 적립되었습니다.');
    } catch (error) {
        console.error('Like operation failed:', error);
        alert('좋아요 처리 중 오류가 발생했습니다.');
    }
}

window.handleLike = handleLike;

export function renderCategorySelection() {
    const app = document.getElementById('app');
    const categories = getCategoryItems();
    const cards = categories.map((item) => {
        const action = item.hash.startsWith('/')
            ? `window.goToDaily('${item.hash}')`
            : `location.hash='${item.hash}'`;

        return `
            <article class="catalog-card" onclick="${action}">
                <div class="catalog-card__head">
                    ${renderBadge(item.label, 'muted')}
                    <strong>${item.count}개</strong>
                </div>
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
                <div class="catalog-card__footer">
                    <span>${item.latestTitle}</span>
                    <span>열기</span>
                </div>
            </article>
        `;
    }).join('');

    app.innerHTML = `
        <section class="simple-page simple-page--wide fade-in">
            ${renderSectionHeader({
                eyebrow: 'CATEGORY',
                title: '테스트 종류 선택',
                description: '불필요한 정보 없이 카테고리와 최신 테스트만 남겼습니다.',
                meta: renderChip(`총 ${TESTS.length + DAILY_CATEGORY_META.count}개`, 'accent')
            })}
            <div class="catalog-grid">${cards}</div>
        </section>
    `;
}

export async function renderHome(hash) {
    const app = document.getElementById('app');
    const latestTests = getLatestTests();

    await fetchAllLikes();

    if (hash === '#home' || !hash) {
        const featured = latestTests[0];
        const sections = getCategoryItems();
        const recommended = latestTests.slice(0, 8);

        app.innerHTML = `
            <section class="simple-page simple-page--wide fade-in">
                <div class="home-hero-minimal">
                    <div class="home-hero-minimal__copy">
                        ${renderBadge('SEVEN CHECK', 'accent')}
                        <h1>7번 안에 끝나는 심리테스트</h1>
                        <p>선택, 진행, 결과만 빠르게 이어지는 구조로 다시 정리했습니다.</p>
                        <div class="home-hero-minimal__actions">
                            ${renderButton({
                                label: '바로 시작',
                                attrs: `onclick="location.hash='${getRouteForTest(featured)}'"`
                            })}
                            ${renderButton({
                                label: '카테고리 보기',
                                variant: 'ghost',
                                attrs: `onclick="location.hash='#7check'"`
                            })}
                        </div>
                    </div>
                    <div class="home-hero-minimal__panel">
                        ${renderStatCard({ label: '전체 테스트', value: `${TESTS.length + DAILY_CATEGORY_META.count}`, caption: '일반 + 오늘의 테스트' })}
                        ${renderStatCard({ label: '지금 추천', value: featured.title, caption: featured.category })}
                    </div>
                </div>

                <div class="simple-search">
                    <label for="home-search">테스트 검색</label>
                    <input id="home-search" type="search" placeholder="제목 또는 카테고리" autocomplete="off">
                </div>

                <section class="home-category-strip">
                    ${sections.map((item) => `
                        <button
                            class="category-pill"
                            onclick="${item.hash.startsWith('/') ? `window.goToDaily('${item.hash}')` : `location.hash='${item.hash}'`}">
                            <span>${item.title}</span>
                            <strong>${item.count}</strong>
                        </button>
                    `).join('')}
                </section>

                <section>
                    ${renderSectionHeader({
                        eyebrow: 'PICK',
                        title: '지금 인기 있는 테스트',
                        description: '최신순으로 바로 시작할 수 있게 정리했습니다.'
                    })}
                    <div id="test-list-grid" class="test-grid-simple">
                        ${recommended.map((test) => renderTestCard(test)).join('')}
                    </div>
                </section>
            </section>
        `;

        const searchInput = document.getElementById('home-search');
        const grid = document.getElementById('test-list-grid');
        if (searchInput && grid) {
            searchInput.addEventListener('input', (event) => {
                const term = event.target.value.toLowerCase().trim();
                const filtered = latestTests.filter((test) => {
                    return test.title.toLowerCase().includes(term) || test.category.toLowerCase().includes(term);
                });

                grid.innerHTML = filtered.length
                    ? filtered.slice(0, 12).map((test) => renderTestCard(test)).join('')
                    : renderEmptyState({
                        title: '검색 결과가 없습니다.',
                        description: '다른 키워드로 다시 찾아보세요.'
                    });
            });
        }
    } else {
        const filter = window._currentFilter;
        const filtered = latestTests.filter((test) => test.category === filter);
        app.innerHTML = `
            <section class="simple-page simple-page--wide fade-in">
                ${renderSectionHeader({
                    eyebrow: CATEGORY_META[filter]?.label || 'CATEGORY',
                    title: `${filter} 테스트`,
                    description: CATEGORY_META[filter]?.desc || '선택 후 바로 진행할 수 있습니다.',
                    meta: renderChip(`${filtered.length}개`, 'accent')
                })}
                <div class="test-grid-simple">
                    ${filtered.map((test) => renderTestCard(test)).join('')}
                </div>
            </section>
        `;
    }

    updateUI();
}

export function renderTestCard(test) {
    const popularity = getPopularity(test.id);
    const footer = `
        <div class="test-card-simple__meta">
            <button class="like-pill" onclick="event.stopPropagation(); handleLike('${test.id}')">
                하트 <span id="like-count-${test.id}">${formatCompactCount(popularity.displayLikes)}</span>
            </button>
            <span>${formatCompactCount(popularity.playCount)} plays</span>
        </div>
    `;

    return `
        <article class="test-card-simple" onclick="location.hash='${getRouteForTest(test)}'">
            <div class="test-card-simple__top">
                ${renderBadge(test.category, 'muted')}
                <span class="test-card-simple__arrow">시작</span>
            </div>
            <h3>${test.title}</h3>
            <p>${test.desc}</p>
            ${footer}
        </article>
    `;
}
