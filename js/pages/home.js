import { updateUI, UserState, addPoints } from '../auth.js?v=8.5.11';
import { db } from '../firebase-init.js?v=8.5.11';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.5.11';
import { renderBadge, renderButton, renderChip, renderSectionHeader, renderStatCard } from '../ui/components.js?v=8.5.11';

const DAILY_CATEGORY_META = {
    hash: '/daily/',
    category: 'daily',
    icon: '☀️',
    label: "TODAY'S TEST",
    title: '오늘의 테스트',
    desc: '오늘 기분으로 가볍게 확인하는 초단기 테스트 모음입니다.',
    chips: ['10초 컷', '하루 1회', '공유하기 좋음'],
    count: 30,
    latestTitle: '오늘 회사 때려칠 확률 테스트',
    sampleTitles: ['오늘 회사 때려칠 확률 테스트', '오늘 멘탈 남은 배터리 테스트', '오늘 인생 버그 발생률']
};

const CATEGORY_META = [
    { hash: '#personality', category: '성격', icon: '🧠', label: 'MENTAL LAB', title: '성격 분석', desc: '내면 패턴과 감정의 결을 깊게 읽는 카테고리입니다.', chips: ['깊이 있는 질문', '심리 리포트', '자기이해'] },
    { hash: '#face', category: '얼굴', icon: '✨', label: 'VISUAL CODE', title: '비주얼/얼굴', desc: '분위기와 첫인상, 매력 포인트를 가볍게 확인합니다.', chips: ['첫인상 분석', '분위기 진단', '매력 포인트'] },
    { hash: '#fortune', category: '사주', icon: '🔮', label: 'FORTUNE FLOW', title: '오늘의 운세', desc: '오늘의 흐름과 타이밍 감각을 빠르게 살펴보는 영역입니다.', chips: ['운세 체크', '행운 흐름', '인연 레이더'] },
    { hash: '#fun', category: '재미', icon: '🎨', label: 'PLAY MIND', title: '재미/심리', desc: '가볍게 웃고 바로 공유하기 좋은 테스트를 모았습니다.', chips: ['캐릭터 판정', '가벼운 심리', '친구 공유'] },
    { hash: '#salary', category: '월급 루팡', icon: '🖥️', label: 'OFFICE ESCAPE', title: '월급 루팡', desc: '회사에서 짧게 즐기기 좋은 테스트와 게임 흐름입니다.', chips: ['직장인 밈', '짧은 몰입', '무음 플레이'] }
];

const HOME_STATS = [
    { label: '테스트', value: `${TESTS.length + DAILY_CATEGORY_META.count}+`, caption: '전체 라이브 콘텐츠' },
    { label: '카테고리', value: '6', caption: '하나의 허브에서 탐색' },
    { label: '포맷', value: '1분 내외', caption: '짧고 빠른 진입' }
];

export const testLikesData = {};

function formatEngUnit(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return num.toString();
}

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

function getCategoryTheme(category) {
    const themes = {
        daily: { accent: 'var(--accent1)', accentAlt: 'var(--accent2)' },
        '성격': { accent: 'var(--accent2)', accentAlt: 'var(--accent1)' },
        '얼굴': { accent: 'var(--accent3)', accentAlt: 'var(--accent2)' },
        '사주': { accent: 'var(--accent1)', accentAlt: 'var(--accent3)' },
        '재미': { accent: 'var(--accent2)', accentAlt: 'var(--accent3)' },
        '월급 루팡': { accent: 'var(--accent3)', accentAlt: 'var(--accent1)' }
    };
    return themes[category] || themes.daily;
}

function buildCategoryCards() {
    const latestTests = getLatestTests();
    return [DAILY_CATEGORY_META, ...CATEGORY_META].map((card) => {
        if (card.category === 'daily') return card;
        const tests = latestTests.filter((test) => test.category === card.category);
        return {
            ...card,
            count: tests.length,
            latestTitle: tests[0]?.title || '준비 중',
            sampleTitles: tests.slice(0, 3).map((test) => test.title)
        };
    });
}

function renderCategoryCard(card) {
    const theme = getCategoryTheme(card.category);
    const action = card.hash.startsWith('/') ? `window.goToDaily('${card.hash}')` : `location.hash='${card.hash}'`;
    return `
        <article class="ui-card ui-card--interactive category-card" onclick="${action}" style="--card-accent:${theme.accent}; --card-accent-alt:${theme.accentAlt};">
            <div class="ui-card-head">
                <div class="ui-stack ui-stack--xs">
                    ${renderBadge(card.label, 'soft')}
                    <h3>${card.title}</h3>
                </div>
                <span class="category-card-icon">${card.icon}</span>
            </div>
            <p class="ui-card-copy">${card.desc}</p>
            <div class="ui-inline category-chip-row">
                ${card.chips.map((chip) => renderChip(chip, 'soft')).join('')}
            </div>
            <div class="ui-card-meta">
                <strong>${card.count}개</strong>
                <span>${card.latestTitle}</span>
            </div>
        </article>
    `;
}

function renderCategoryShortcut(card) {
    const theme = getCategoryTheme(card.category);
    const action = card.hash.startsWith('/') ? `window.goToDaily('${card.hash}')` : `location.hash='${card.hash}'`;
    return `
        <button class="ui-card ui-card--interactive home-lane-card" onclick="${action}" style="--card-accent:${theme.accent}; --card-accent-alt:${theme.accentAlt};">
            <span class="ui-card-index">${card.label}</span>
            <strong>${card.title}</strong>
            <span>${card.latestTitle}</span>
            <em>${card.count}개 테스트</em>
        </button>
    `;
}

export async function fetchAllLikes() {
    try {
        const snap = await getDocs(collection(db, "testStats"));
        snap.forEach((entry) => {
            testLikesData[entry.id] = entry.data().likes || 0;
        });
    } catch (error) {
        console.error("Fetch likes failed:", error);
    }
}
window.fetchAllLikes = fetchAllLikes;

async function handleLike(testId) {
    if (!UserState.user) {
        alert("로그인이 필요합니다. 우측 상단의 로그인 버튼을 이용해 주세요.");
        return;
    }

    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
    const likeKey = `liked_${testId}_${today}`;

    if (localStorage.getItem(likeKey)) {
        alert("오늘 이미 이 테스트에 하트를 누르셨습니다! ❤️");
        return;
    }

    try {
        const statsRef = doc(db, "testStats", testId);
        await setDoc(statsRef, { likes: increment(1) }, { merge: true });

        localStorage.setItem(likeKey, "true");
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5, '테스트 추천 보상');

        const counter = document.getElementById(`like-count-${testId}`);
        if (counter) {
            const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const playCount = (seed * 123) % 15000 + 5000;
            const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
            counter.textContent = formatEngUnit(testLikesData[testId] + baseLikes);
        }

        alert("감사합니다! 하트 보상으로 5P가 적립되었습니다. ❤️");
    } catch (error) {
        console.error("Like operation failed:", error);
        alert("좋아요 처리 중 오류가 발생했습니다.");
    }
}
window.handleLike = handleLike;

export function renderCategorySelection() {
    const app = document.getElementById('app');
    const categoryCards = buildCategoryCards();

    app.innerHTML = `
        <div class="page-shell fade-in">
            <section class="ui-section">
                <div class="ui-hero ui-hero--compact">
                    <div class="ui-stack ui-stack--md">
                        ${renderBadge('CATEGORY HUB', 'soft')}
                        <h1>모든 심리 테스트를 한 화면에서 고릅니다.</h1>
                        <p class="ui-hero-copy">카테고리별 성격과 최신 테스트를 같은 구조로 정리해, 진입 위치만 다르고 경험은 일관되게 유지합니다.</p>
                    </div>
                    <div class="ui-grid ui-grid--3">
                        ${categoryCards.map((card) => renderStatCard({ label: card.title, value: card.count, caption: card.label })).join('')}
                    </div>
                </div>
            </section>

            <section class="ui-section">
                ${renderSectionHeader({
                    eyebrow: 'ALL CATEGORIES',
                    title: '카테고리별 탐색',
                    description: '페이지마다 다른 톤을 쓰지 않고, 같은 카드 시스템 안에서 정보 구조만 바뀌도록 정리했습니다.'
                })}
                <div class="ui-grid ui-grid--3 category-grid">
                    ${categoryCards.map((card) => renderCategoryCard(card)).join('')}
                </div>
            </section>
        </div>
    `;
}

function renderHomeHero(heroTest) {
    return `
        <section class="ui-section home-hero-section">
            <div class="ui-hero home-hero">
                <div class="ui-stack ui-stack--lg home-hero-copy-wrap">
                    ${renderBadge('SEVENCHECK', 'soft')}
                    <div class="ui-stack ui-stack--sm">
                        <h1>지금 바로 시작할 테스트를 가장 짧게 보여줍니다.</h1>
                        <p class="ui-hero-copy">첫 화면에는 시작 버튼과 현재 서비스 흐름만 남기고, 탐색은 아래 섹션 카드로 분리했습니다.</p>
                    </div>
                    <div class="ui-inline home-hero-actions">
                        ${renderButton({ label: '테스트 시작하기', variant: 'primary', attrs: `onclick="location.hash='#test/${heroTest.id}'"` })}
                        ${renderButton({ label: '카테고리 보기', variant: 'ghost', attrs: `onclick="location.hash='#7check'"` })}
                    </div>
                </div>
                <div class="ui-grid ui-grid--3 home-hero-stats">
                    ${HOME_STATS.map((item) => renderStatCard(item)).join('')}
                </div>
            </div>
        </section>
    `;
}

function renderSearchSection(latestTests) {
    return `
        <section class="ui-section">
            ${renderSectionHeader({
                eyebrow: 'SEARCH',
                title: '원하는 테스트를 바로 찾기',
                description: '홈 탐색 기능은 유지하고, 별도 박스와 보조 색상 없이 같은 카드 규칙으로 정리했습니다.'
            })}
            <div class="ui-card search-panel">
                <input id="home-search" class="ui-input" type="search" placeholder="테스트 제목 또는 카테고리 검색">
                <div id="test-list-grid" class="ui-grid ui-grid--3 test-card-grid">
                    ${latestTests.slice(0, 12).map((test) => renderTestCard(test)).join('')}
                </div>
            </div>
        </section>
    `;
}

export async function renderHome(hash) {
    const app = document.getElementById('app');
    await fetchAllLikes();
    const latestTests = getLatestTests();
    const categories = buildCategoryCards();

    if (hash === '#home' || !hash) {
        const heroTest = latestTests[Math.floor(Math.random() * latestTests.length)];
        const spotlightTests = getRandomTests(3);

        app.innerHTML = `
            <div class="page-shell fade-in">
                ${renderHomeHero(heroTest)}

                <section class="ui-section">
                    ${renderSectionHeader({
                        eyebrow: 'QUICK LANES',
                        title: '카테고리별 바로가기',
                        description: '핵심 분류만 카드로 배치하고, 각 카드가 동일한 정보 밀도를 갖도록 정리했습니다.',
                        meta: `<button class="ui-link-button" onclick="location.hash='#7check'">전체 카테고리 보기</button>`
                    })}
                    <div class="ui-grid ui-grid--3 home-lane-grid">
                        ${categories.map((card) => renderCategoryShortcut(card)).join('')}
                    </div>
                </section>

                <section class="ui-section">
                    ${renderSectionHeader({
                        eyebrow: 'CURATED NOW',
                        title: '지금 눌러도 좋은 추천 테스트',
                        description: '이미지 없이도 카드 구조와 타이포만으로 우선순위가 드러나도록 구성했습니다.'
                    })}
                    <div class="ui-grid ui-grid--3 spotlight-grid">
                        ${spotlightTests.map((test, index) => `
                            <article class="ui-card ui-card--interactive spotlight-card" onclick="location.hash='#test/${test.id}'">
                                <span class="ui-card-index">PICK ${index + 1}</span>
                                <h3>${test.title}</h3>
                                <p class="ui-card-copy">${test.desc}</p>
                                <div class="ui-card-foot">
                                    ${renderChip(test.category, 'soft')}
                                    <span class="ui-card-link">시작하기</span>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </section>

                ${renderSearchSection(latestTests)}
            </div>
        `;

        const searchInput = document.getElementById('home-search');
        if (searchInput) {
            searchInput.oninput = (event) => {
                const term = event.target.value.toLowerCase().trim();
                const filtered = latestTests.filter((test) =>
                    test.title.toLowerCase().includes(term) || test.category.toLowerCase().includes(term)
                );
                const grid = document.getElementById('test-list-grid');
                if (grid) {
                    grid.innerHTML = filtered.length > 0
                        ? filtered.slice(0, 12).map((test) => renderTestCard(test)).join('')
                        : `<div class="ui-empty-state" style="grid-column:1 / -1;"><strong>검색 결과가 없습니다.</strong><p>다른 키워드로 다시 검색해 주세요.</p></div>`;
                }
            };
        }
    } else {
        const filtered = latestTests.filter((test) => test.category === window._currentFilter);
        const isSalaryCategory = window._currentFilter === '월급 루팡';

        app.innerHTML = `
            <div class="page-shell fade-in">
                <section class="ui-section">
                    ${renderSectionHeader({
                        eyebrow: 'CATEGORY',
                        title: `${window._currentFilter} 테스트`,
                        description: `총 ${filtered.length}개의 테스트가 있습니다.`,
                        meta: `<button class="ui-link-button" onclick="location.hash='#7check'">카테고리 허브</button>`
                    })}
                    ${isSalaryCategory ? `
                        <div class="ui-card salary-card-callout">
                            <div class="ui-stack ui-stack--sm">
                                ${renderBadge('FEATURED GAME', 'soft')}
                                <h3>상사 오기 전 업무창 위장하기</h3>
                                <p class="ui-card-copy">회사 PC에서 조용히 즐기는 30초 생존 게임입니다. 비회원은 바로 체험하고, 회원은 최고점 저장과 포인트 획득이 가능합니다.</p>
                            </div>
                            ${renderButton({ label: '월급 루팡 게임 시작', variant: 'primary', attrs: `onclick="location.hash='#salary-tab-shift'"` })}
                        </div>
                    ` : ''}
                    <div class="ui-grid ui-grid--3 test-card-grid">
                        ${filtered.map((test) => renderTestCard(test)).join('')}
                    </div>
                </section>
            </div>
        `;
    }

    updateUI();
}

export function renderTestCard(test) {
    const actualLikes = testLikesData[test.id] || 0;
    const seed = test.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const playCount = (seed * 123) % 15000 + 5000;
    const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
    const displayLikes = actualLikes + baseLikes;

    const tones = [
        { accent: 'var(--accent1)', accentAlt: 'var(--accent2)' },
        { accent: 'var(--accent2)', accentAlt: 'var(--accent3)' },
        { accent: 'var(--accent3)', accentAlt: 'var(--accent1)' }
    ];
    const theme = tones[seed % tones.length];

    return `
        <article class="ui-card ui-card--interactive test-card" onclick="location.hash='#test/${test.id}'" style="--card-accent:${theme.accent}; --card-accent-alt:${theme.accentAlt};">
            <div class="ui-card-head">
                ${renderBadge(test.category, 'soft')}
                <span class="ui-card-meta-pill">🔥 ${formatEngUnit(playCount)}</span>
            </div>
            <div class="ui-stack ui-stack--sm">
                <h3>${test.title}</h3>
                <p class="ui-card-copy">${test.desc}</p>
            </div>
            <div class="ui-card-foot">
                <button id="like-badge-${test.id}" class="ui-chip ui-chip--soft like-chip" onclick="event.stopPropagation(); handleLike('${test.id}')">
                    ❤️ <span id="like-count-${test.id}">${formatEngUnit(displayLikes)}</span>
                </button>
                <span class="ui-card-link">시작하기</span>
            </div>
        </article>
    `;
}
