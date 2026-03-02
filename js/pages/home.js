import { updateUI, UserState, addPoints } from '../auth.js?v=8.5.2';
import { db } from '../firebase-init.js?v=8.5.2';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.5.2';
import { renderBadge, renderButton, renderChip, renderEmptyState, renderSectionHeader, renderStatCard } from '../ui/components.js?v=8.5.2';

const FOX_ADVICE = [
    "지금 3분만 쓰면 오늘 기분을 꽤 정확하게 정리할 수 있어요.",
    "짧은 테스트 하나로도 생각보다 선명한 결과가 나올 수 있습니다.",
    "오늘은 깊게 보기보다 가볍게 시작하는 흐름이 더 잘 맞아요.",
    "친구에게 바로 보내기 좋은 결과형 테스트부터 골라보세요."
];

const DAILY_CATEGORY_META = {
    hash: '/daily/',
    category: 'daily',
    icon: '☀',
    label: 'Today',
    title: '오늘의 테스트',
    desc: '오늘 기분으로 바로 시작하는 초단기 테스트입니다.',
    count: 30,
    latestTitle: '오늘 회사 때려칠 확률 테스트',
    sampleTitles: [
        '오늘 회사 때려칠 확률 테스트',
        '오늘 멘탈 남은 배터리 테스트',
        '오늘 인생 버그 발생률'
    ]
};

const CATEGORY_META = [
    { hash: '/daily/', category: 'daily', icon: '☀', label: 'Today', title: '오늘의 테스트', desc: '하루 한 번 가볍게 체크하는 빠른 테스트.' },
    { hash: '#personality', category: '성격', icon: '🧠', label: 'Personality', title: '성격 분석', desc: '관계, 감정, 습관을 정리하는 심리 중심 테스트.' },
    { hash: '#face', category: '얼굴', icon: '✨', label: 'Visual', title: '비주얼/얼굴', desc: '분위기와 인상 포인트를 가볍게 읽는 테스트.' },
    { hash: '#fortune', category: '사주', icon: '🔮', label: 'Fortune', title: '오늘의 운세', desc: '오늘의 흐름과 타이밍을 보는 운세형 테스트.' },
    { hash: '#fun', category: '재미', icon: '🎨', label: 'Fun', title: '재미/심리', desc: '가볍게 공유하기 좋은 밈 기반 테스트.' },
    { hash: '#salary', category: '월급 루팡', icon: '🖥', label: 'Office', title: '월급 루팡', desc: '회사에서 조용히 즐기는 짧은 콘텐츠.' }
];

export const testLikesData = {};

export async function fetchAllLikes() {
    if (Object.keys(testLikesData).length > 0) return;
    try {
        const snap = await getDocs(collection(db, 'testStats'));
        snap.forEach((entry) => {
            testLikesData[entry.id] = entry.data().likes || 0;
        });
    } catch (error) {
        console.error('Fetch likes failed:', error);
    }
}
window.fetchAllLikes = fetchAllLikes;

function getLatestTests() {
    return [...TESTS].reverse();
}

function getRandomTests(count) {
    const shuffled = [...TESTS];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

function formatEngUnit(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return num.toString();
}

function getPlayCount(testId) {
    const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (seed * 123) % 15000 + 5000;
}

function getDisplayLikeCount(testId) {
    const actualLikes = testLikesData[testId] || 0;
    const playCount = getPlayCount(testId);
    const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
    return actualLikes + baseLikes;
}

function getCategoryCards(latestTests) {
    return CATEGORY_META.map((item) => {
        if (item.category === 'daily') {
            return {
                ...item,
                count: DAILY_CATEGORY_META.count,
                latestTitle: DAILY_CATEGORY_META.latestTitle,
                sampleTitles: DAILY_CATEGORY_META.sampleTitles
            };
        }

        const categoryTests = latestTests.filter((test) => test.category === item.category);
        return {
            ...item,
            count: categoryTests.length,
            latestTitle: categoryTests[0]?.title || '준비 중',
            sampleTitles: categoryTests.slice(0, 3).map((test) => test.title)
        };
    });
}

async function handleLike(testId) {
    if (!UserState.user) {
        alert('로그인이 필요합니다. 우측 상단의 로그인 버튼을 이용해 주세요.');
        return;
    }

    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
    const likeKey = `liked_${testId}_${today}`;

    if (localStorage.getItem(likeKey)) {
        alert('오늘 이미 이 테스트에 하트를 눌렀습니다.');
        return;
    }

    try {
        const statsRef = doc(db, 'testStats', testId);
        await setDoc(statsRef, { likes: increment(1) }, { merge: true });

        localStorage.setItem(likeKey, 'true');
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5, '테스트 추천 보상');

        const counter = document.getElementById(`like-count-${testId}`);
        if (counter) {
            counter.textContent = formatEngUnit(getDisplayLikeCount(testId));
        }

        alert('감사합니다. 하트 보상으로 5P가 적립되었습니다.');
    } catch (error) {
        console.error('Like operation failed:', error);
        alert('좋아요 처리 중 오류가 발생했습니다.');
    }
}
window.handleLike = handleLike;

function renderCardLinkAction(label, attrs) {
    return renderButton({
        label,
        variant: 'secondary',
        tag: 'button',
        attrs: `type="button" ${attrs}`
    });
}

function renderTodayCard(title, desc, cta) {
    return `
        <article class="today-card">
            <div class="today-card__header">
                <div class="ui-stack ui-stack--xs">
                    ${renderBadge('Today', 'accent')}
                    <h3 class="today-card__title">${title}</h3>
                </div>
            </div>
            <p class="today-card__desc">${desc}</p>
            <div class="today-card__footer">
                <span class="test-card__metric">10초 컷 · 하루 1회</span>
                ${cta}
            </div>
        </article>
    `;
}

export function renderCategorySelection() {
    const app = document.getElementById('app');
    const latestTests = getLatestTests();
    const categoryCards = getCategoryCards(latestTests);
    const featuredTests = latestTests.slice(0, 6);

    app.innerHTML = `
        <div class="site-page fade-in">
            <section class="ui-surface ui-panel">
                ${renderSectionHeader({
                    eyebrow: 'Library',
                    title: '테스트 라이브러리',
                    description: '카테고리 입구와 최신 테스트를 같은 화면에서 관리하는 탐색용 보드입니다.',
                    meta: `${TESTS.length + DAILY_CATEGORY_META.count} tests`
                })}
            </section>

            <section class="ui-grid ui-grid--2">
                ${categoryCards.map((card) => `
                    <article class="category-card">
                        <div class="category-card__header">
                            <div class="ui-stack ui-stack--sm">
                                <span class="category-card__icon" aria-hidden="true">${card.icon}</span>
                                <div class="ui-stack ui-stack--xs">
                                    ${renderBadge(card.label, 'soft')}
                                    <h3 class="category-card__title">${card.title}</h3>
                                </div>
                            </div>
                            <span class="test-card__metric">${card.count}개</span>
                        </div>
                        <p class="category-card__desc">${card.desc}</p>
                        <div class="category-grid__meta">
                            ${card.sampleTitles.map((title) => renderChip(title, 'soft')).join('')}
                        </div>
                        <div class="category-card__footer">
                            <span class="test-card__metric">${card.latestTitle}</span>
                            ${card.hash.startsWith('/')
                                ? renderCardLinkAction('열기', `onclick="window.goToDaily('${card.hash}')"` )
                                : renderCardLinkAction('열기', `onclick="location.hash='${card.hash}'"` )}
                        </div>
                    </article>
                `).join('')}
            </section>

            <section class="ui-surface ui-panel search-panel">
                ${renderSectionHeader({
                    eyebrow: 'Browse',
                    title: '검색과 최신 테스트',
                    description: '카테고리보다 제목으로 먼저 찾고 싶을 때 사용하는 작업 영역입니다.'
                })}
                <label class="ui-stack ui-stack--xs" for="tests-search">
                    <span class="ui-section-meta">테스트 검색</span>
                    <input id="tests-search" class="search-field" type="search" placeholder="테스트 제목 또는 카테고리 검색" aria-label="테스트 검색">
                </label>
                <div id="tests-search-grid" class="test-grid">
                    ${featuredTests.map((test) => renderTestCard(test)).join('')}
                </div>
            </section>
        </div>
    `;

    const searchInput = document.getElementById('tests-search');
    const searchGrid = document.getElementById('tests-search-grid');

    if (searchInput && searchGrid) {
        searchInput.addEventListener('input', (event) => {
            const term = event.target.value.toLowerCase().trim();
            const filtered = latestTests.filter((test) =>
                test.title.toLowerCase().includes(term) || test.category.toLowerCase().includes(term)
            );

            searchGrid.innerHTML = filtered.length
                ? filtered.slice(0, 9).map((test) => renderTestCard(test)).join('')
                : renderEmptyState({
                    title: '검색 결과가 없습니다.',
                    description: '다른 키워드로 다시 찾아보세요.'
                });
        });
    }
}

function renderHomeOverview(latestTests) {
    const app = document.getElementById('app');
    const randomAdvice = FOX_ADVICE[Math.floor(Math.random() * FOX_ADVICE.length)];
    const userName = UserState.user ? UserState.data?.nickname || '사용자' : '방문자';
    const heroTest = latestTests[0] || TESTS[0];
    const todayTests = DAILY_CATEGORY_META.sampleTitles;
    const categoryCards = getCategoryCards(latestTests);
    const quickStats = [
        { label: '전체 테스트', value: TESTS.length + DAILY_CATEGORY_META.count, caption: 'daily 포함' },
        { label: '오늘의 테스트', value: 3, caption: '첫 화면 고정' },
        { label: '핵심 카테고리', value: 5, caption: '성격, 비주얼, 운세, 재미, 오피스' }
    ];

    app.innerHTML = `
        <div class="site-page fade-in">
            <section class="ui-surface ui-panel">
                ${renderSectionHeader({
                    eyebrow: 'Overview',
                    title: `${userName}님이 지금 시작하기 좋은 테스트 워크스페이스`,
                    description: '첫 화면에서는 오늘의 테스트와 카테고리 진입만 보여주고, 세부 탐색은 별도 라이브러리로 분리했습니다.',
                    meta: 'Home'
                })}
                <div class="ui-grid ui-grid--2">
                    <div class="ui-stack ui-stack--sm">
                        <div class="report-action-row">
                            ${renderButton({
                                label: '추천 테스트 시작',
                                variant: 'primary',
                                tag: 'button',
                                attrs: `type="button" onclick="location.hash='#test/${heroTest.id}'"`
                            })}
                            ${renderButton({
                                label: '라이브러리 열기',
                                variant: 'secondary',
                                tag: 'button',
                                attrs: `type="button" onclick="location.hash='#7check'"`
                            })}
                        </div>
                        <div class="report-chip-row">
                            ${renderChip(randomAdvice, 'soft')}
                            ${renderChip(`최근 추천: ${heroTest.title}`, 'soft')}
                        </div>
                    </div>
                    <aside class="home-side-card" aria-label="요약 정보">
                        ${quickStats.map((stat) => renderStatCard(stat)).join('')}
                    </aside>
                </div>
            </section>

            <section class="ui-surface ui-panel today-tests">
                ${renderSectionHeader({
                    eyebrow: 'Today',
                    title: '오늘의 테스트 3개',
                    description: '가볍게 시작하는 진입 구간입니다.',
                    meta: '<a href="/daily/" onclick="event.preventDefault(); window.goToDaily(\'/daily/\');">전체 보기</a>'
                })}
                <div class="today-tests__grid">
                    ${todayTests.map((title) => renderTodayCard(
                        title,
                        '짧고 가볍게 오늘 상태를 체크하는 결과형 테스트입니다.',
                        renderCardLinkAction('시작', `onclick="window.goToDaily('/daily/')"`))
                    ).join('')}
                </div>
            </section>

            <section class="ui-surface ui-panel">
                ${renderSectionHeader({
                    eyebrow: 'Library Entry',
                    title: '카테고리 입구',
                    description: '여기서는 들어갈 곳만 정하고, 상세 비교는 Library에서 진행합니다.',
                    meta: '<a href="#7check">Tests 전체 보기</a>'
                })}
                <div class="category-grid">
                    ${categoryCards.map((card) => `
                        <article class="category-card">
                            <div class="category-card__header">
                                <div class="ui-stack ui-stack--sm">
                                    <span class="category-card__icon" aria-hidden="true">${card.icon}</span>
                                    <div class="ui-stack ui-stack--xs">
                                        ${renderBadge(card.label, 'soft')}
                                        <h3 class="category-card__title">${card.title}</h3>
                                    </div>
                                </div>
                                <span class="test-card__metric">${card.count}개</span>
                            </div>
                            <p class="category-card__desc">${card.desc}</p>
                            <div class="category-card__footer">
                                <span class="test-card__metric">${card.latestTitle}</span>
                                ${card.hash.startsWith('/')
                                    ? renderCardLinkAction('열기', `onclick="window.goToDaily('${card.hash}')"` )
                                    : renderCardLinkAction('열기', `onclick="location.hash='${card.hash}'"` )}
                            </div>
                        </article>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
}

function renderCategoryPage(filtered) {
    const app = document.getElementById('app');
    const isSalaryCategory = window._currentFilter === '월급 루팡';

    app.innerHTML = `
        <div class="site-page fade-in">
            <section class="ui-surface ui-panel">
                ${renderSectionHeader({
                    eyebrow: 'Category',
                    title: `${window._currentFilter} 테스트`,
                    description: isSalaryCategory
                        ? '회사에서 조용히 즐기기 좋은 테스트와 게임 진입을 함께 배치했습니다.'
                        : `${window._currentFilter} 카테고리 테스트만 모았습니다.`,
                    meta: `${filtered.length} items`
                })}
                ${isSalaryCategory ? `
                    <div class="home-side-card home-side-card--spaced">
                        <div class="ui-stack ui-stack--sm">
                            ${renderBadge('Office Game', 'accent')}
                            <strong>상사 오기 전 업무창 위장하기</strong>
                            <p class="page-copy">회원은 기록 저장과 포인트 획득이 가능합니다.</p>
                            ${renderButton({
                                label: '월급 루팡 게임 시작',
                                variant: 'primary',
                                tag: 'button',
                                attrs: `type="button" onclick="location.hash='#salary-tab-shift'"`
                            })}
                        </div>
                    </div>
                ` : ''}
            </section>

            <section class="test-grid">
                ${filtered.length
                    ? filtered.map((test) => renderTestCard(test)).join('')
                    : renderEmptyState({
                        title: '표시할 테스트가 없습니다.',
                        description: '다른 카테고리를 선택해 주세요.'
                    })}
            </section>
        </div>
    `;
}

export async function renderHome(hash) {
    await fetchAllLikes();
    const latestTests = getLatestTests();

    if (hash === '#home' || !hash) {
        renderHomeOverview(latestTests);
    } else {
        const filtered = latestTests.filter((test) => test.category === window._currentFilter);
        renderCategoryPage(filtered);
    }

    updateUI();
}

export function renderTestCard(test) {
    const playCount = getPlayCount(test.id);
    const displayLikes = getDisplayLikeCount(test.id);

    return `
        <article class="test-card" onclick="location.hash='#test/${test.id}'" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();location.hash='#test/${test.id}';}" role="button" tabindex="0" aria-label="${test.title} 테스트 시작">
            <div class="test-card__header">
                <div class="ui-stack ui-stack--xs">
                    ${renderBadge(test.category, 'accent')}
                    <h3 class="test-card__title">${test.title}</h3>
                </div>
                <span class="test-card__metric">${formatEngUnit(playCount)} plays</span>
            </div>
            <p class="test-card__desc">${test.desc}</p>
            <div class="test-card__footer">
                <button
                    id="like-badge-${test.id}"
                    class="test-card__like"
                    type="button"
                    onclick="event.stopPropagation(); handleLike('${test.id}')"
                    aria-label="${test.title} 좋아요">
                    <span aria-hidden="true">❤</span>
                    <span id="like-count-${test.id}">${formatEngUnit(displayLikes)}</span>
                </button>
                <span class="test-card__action">시작하기</span>
            </div>
        </article>
    `;
}
