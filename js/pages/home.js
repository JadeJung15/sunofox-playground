import { updateUI, UserState, addPoints } from '../auth.js?v=8.5.8';
import { db } from '../firebase-init.js?v=8.5.8';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.5.8';
import { renderSectionHead } from '../ui/primitives.js?v=8.5.8';

const DAILY_CATEGORY_META = {
    hash: '/daily/',
    category: 'daily',
    icon: '☀️',
    label: "TODAY'S TEST",
    title: '오늘의 테스트',
    desc: '오늘 기분으로 바로 찍고 끝내는 초단기 테스트 모음입니다. 질문 길게 안 가고, 하루 한 번 같은 결과로 고정됩니다.',
    gradient: 'linear-gradient(145deg, #e0f2fe 0%, #bfdbfe 52%, #f0f9ff 100%)',
    accent: '#0c4a6e',
    chips: ['10초 컷', '하루 1회 고정', '캡처 공유용'],
    count: 30,
    latestTitle: '오늘 회사 때려칠 확률 테스트',
    sampleTitles: ['오늘 회사 때려칠 확률 테스트', '오늘 멘탈 남은 배터리 테스트', '오늘 인생 버그 발생률'],
    countText: '30개 테스트'
};

function buildHomeCategoryCards(latestTests) {
    return [
        DAILY_CATEGORY_META,
        {
            hash: '#personality',
            category: '성격',
            icon: '01',
            label: 'PERSONALITY',
            title: '성격 분석',
            desc: '관계 습관, 감정 패턴, 내면의 결을 읽는 심리테스트.',
            accent: 'var(--tone-indigo)',
            chips: ['자기이해', '심리 리포트', '관계 패턴']
        },
        {
            hash: '#face',
            category: '얼굴',
            icon: '02',
            label: 'VISUAL',
            title: '인상 분석',
            desc: '첫인상, 분위기, 비주얼 무드를 읽는 테스트.',
            accent: 'var(--tone-rose)',
            chips: ['첫인상', '분위기', '매력 포인트']
        },
        {
            hash: '#fortune',
            category: '사주',
            icon: '03',
            label: 'FORTUNE',
            title: '운세 흐름',
            desc: '오늘의 기분과 타이밍을 가볍게 확인하는 테스트.',
            accent: 'var(--tone-amber)',
            chips: ['타이밍', '행운 흐름', '데일리 감각']
        },
        {
            hash: '#fun',
            category: '재미',
            icon: '04',
            label: 'LIGHT PSYCHOLOGY',
            title: '가벼운 심리',
            desc: '짧고 직관적이지만 여전히 심리 흐름을 읽는 테스트.',
            accent: 'var(--tone-ink)',
            chips: ['짧은 질문', '가벼운 몰입', '공유용']
        }
    ].map((item) => {
        if (item.category === 'daily') {
            return item;
        }
        const categoryTests = latestTests.filter((test) => test.category === item.category);
        return {
            ...item,
            count: categoryTests.length,
            latestTitle: categoryTests[0]?.title || '준비 중',
            countText: `${categoryTests.length}개 테스트`
        };
    });
}

function initRevealMotion(root = document) {
    const targets = Array.from(root.querySelectorAll('.reveal'));
    if (!targets.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((target, index) => {
        target.style.transitionDelay = `${Math.min(index * 40, 220)}ms`;
        observer.observe(target);
    });
}

export const testLikesData = {};

export async function fetchAllLikes() {
    try {
        console.log("Fetching test likes data...");
        const snap = await getDocs(collection(db, "testStats"));
        snap.forEach(doc => { testLikesData[doc.id] = doc.data().likes || 0; });
        console.log("Likes data loaded:", testLikesData);
    } catch (e) { console.error("Fetch likes failed:", e); }
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

async function handleLike(testId) {
    console.log("handleLike called for:", testId);
    if (!UserState.user) {
        alert("로그인이 필요합니다. 우측 상단의 로그인 버튼을 이용해 주세요.");
        return;
    }

    const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
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
            const formatEngUnit = (num) => {
                if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                return num.toString();
            };
            const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const playCount = (seed * 123) % 15000 + 5000; 
            const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
            const displayLikes = testLikesData[testId] + baseLikes;
            counter.textContent = formatEngUnit(displayLikes);
        }

        alert("감사합니다! 하트 보상으로 5P가 적립되었습니다. ❤️");
    } catch (e) {
        console.error("Like operation failed:", e);
        alert("좋아요 처리 중 오류가 발생했습니다.");
    }
}
window.handleLike = handleLike;

export function renderCategorySelection() {
    const app = document.getElementById('app');
    const latestTests = getLatestTests();
    const categoryCards = buildHomeCategoryCards(latestTests);

    app.innerHTML = `
        <div class="minimal-page minimal-category-page fade-in">
            <section class="minimal-hero minimal-category-hero reveal">
                <div class="minimal-hero-copy">
                    <span class="minimal-kicker">SevenCheck Categories</span>
                    <h1>모든 심리테스트를<br>한눈에.</h1>
                    <p>성격, 인상, 운세, 재미, 오늘의 테스트까지 흐름대로 다시 배치했습니다.</p>
                </div>
                <div class="minimal-stat-row">
                    <div class="minimal-stat-card">
                        <small>Total</small>
                        <strong>${categoryCards.reduce((acc, card) => acc + (card.count || 0), 0)}</strong>
                        <span>심리테스트 수</span>
                    </div>
                    <div class="minimal-stat-card">
                        <small>Categories</small>
                        <strong>${categoryCards.length}</strong>
                        <span>핵심 분류</span>
                    </div>
                </div>
            </section>

            <section class="minimal-section reveal">
                ${renderSectionHead({ kicker: 'Category Grid', title: '원하는 방식으로 시작하기' })}
                <div class="minimal-card-grid minimal-card-grid-3">
                    ${categoryCards.map((card) => `
                        <article class="minimal-pane minimal-pane-interactive" onclick="${card.hash.startsWith('/') ? `window.goToDaily('${card.hash}')` : `location.hash='${card.hash}'`}">
                            <div class="minimal-pane-top">
                                <span class="minimal-pane-index" style="color:${card.accent || 'var(--accent-color)'}">${card.icon || '00'}</span>
                                <span class="minimal-pane-label">${card.label}</span>
                            </div>
                            <h3>${card.title}</h3>
                            <p>${card.desc}</p>
                            <div class="minimal-chip-row">
                                ${(card.chips || []).map((chip) => `<span>${chip}</span>`).join('')}
                            </div>
                            <div class="minimal-pane-bottom">
                                <strong>${card.countText || `${card.count || 0}개 테스트`}</strong>
                                <span>${card.latestTitle || '준비 중'}</span>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
    initRevealMotion(app);
}

export async function renderHome(hash) {
    const app = document.getElementById('app');
    await fetchAllLikes();
    const latestTests = getLatestTests();
    const curatedTests = getRandomTests(4);
    const categoryCards = buildHomeCategoryCards(latestTests);

    if (hash === '#home' || !hash) {
        app.innerHTML = `
            <div class="minimal-page minimal-home fade-in">
                <section class="minimal-hero reveal">
                    <div class="minimal-hero-copy">
                        <span class="minimal-kicker">It's simple</span>
                        <h1>심리테스트,<br>바로 시작.</h1>
                        <p>원하는 결의 테스트를 고르고 바로 들어가면 됩니다.</p>
                        <div class="minimal-hero-actions minimal-hero-actions-center">
                            <button class="btn-primary minimal-start-button" onclick="location.hash='#7check'">테스트 시작하기</button>
                        </div>
                        <div class="minimal-home-links minimal-home-links-wide">
                            ${categoryCards.map((card) => `
                                <button class="minimal-text-link" onclick="${card.hash.startsWith('/') ? `window.goToDaily('${card.hash}')` : `location.hash='${card.hash}'`}">${card.title}</button>
                            `).join('')}
                        </div>
                    </div>
                </section>

                <section class="minimal-section reveal">
                    ${renderSectionHead({ kicker: 'Browse', title: '카테고리' })}
                    <div class="minimal-card-grid minimal-card-grid-3">
                        ${categoryCards.map((card) => `
                            <article class="minimal-pane minimal-pane-interactive minimal-pane-compact" onclick="${card.hash.startsWith('/') ? `window.goToDaily('${card.hash}')` : `location.hash='${card.hash}'`}">
                                <div class="minimal-pane-top">
                                    <span class="minimal-pane-label">${card.label}</span>
                                    <span class="minimal-pane-index" style="color:${card.accent || 'var(--accent-color)'}">${card.count || ''}</span>
                                </div>
                                <h3>${card.title}</h3>
                                <p>${card.desc}</p>
                            </article>
                        `).join('')}
                    </div>
                </section>

                <section class="minimal-section reveal">
                    ${renderSectionHead({ kicker: 'Recommended', title: '지금 많이 보는 테스트' })}
                    <div class="test-grid minimal-test-grid">
                        ${curatedTests.map((t) => renderTestCard(t)).join('')}
                    </div>
                </section>
            </div>
        `;
        initRevealMotion(app);
    } else {
        const filtered = latestTests.filter(t => t.category === window._currentFilter);
        app.innerHTML = `
            <div class="minimal-page minimal-page-narrow fade-in">
                <div class="reveal">
                    ${renderSectionHead({ kicker: window._currentFilter, title: `${window._currentFilter} 테스트`, meta: `총 ${filtered.length}개` })}
                </div>
                <div class="test-grid minimal-test-grid reveal">
                    ${filtered.map(t => renderTestCard(t)).join('')}
                </div>
            </div>
        `;
        initRevealMotion(app);
    }
    updateUI();
}

export function renderTestCard(t) {
    const formatEngUnit = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num.toString();
    };

    const actualLikes = testLikesData[t.id] || 0;
    const seed = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const playCount = (seed * 123) % 15000 + 5000; 
    const baseLikes = Math.floor(playCount * (0.2 + ((seed % 20) / 100)));
    const displayLikes = actualLikes + baseLikes;

    const themes = [
        { surface: 'var(--surface-subtle)', text: '#111111', sub: '#4b5563', accent: 'var(--tone-indigo)' },
        { surface: '#f5f7f4', text: '#111111', sub: '#4b5563', accent: 'var(--tone-mint)' },
        { surface: '#f8f3f2', text: '#111111', sub: '#4b5563', accent: 'var(--tone-rose)' },
        { surface: '#faf6ef', text: '#111111', sub: '#4b5563', accent: 'var(--tone-amber)' }
    ];
    const theme = themes[seed % themes.length];

    return `
    <article class="test-card minimal-test-card fade-in" data-cat="${t.category}" onclick="location.hash='#test/${t.id}'" style="background:${theme.surface}; color:${theme.text};">
        <div class="test-info">
            <div class="minimal-test-card-top">
                <span class="test-category-tag" style="background:${theme.accent};">${t.category}</span>
                <span class="minimal-test-card-meta">${formatEngUnit(playCount)} plays</span>
            </div>
            <h3>${t.title}</h3>
            <p>${t.desc}</p>
            <div class="minimal-test-card-bottom">
                <button id="like-badge-${t.id}" class="minimal-like-button" onclick="event.stopPropagation(); handleLike('${t.id}')">
                    <span>❤️</span><span id="like-count-${t.id}">${formatEngUnit(displayLikes)}</span>
                </button>
                <span class="minimal-open-link">Open</span>
            </div>
        </div>
    </article>`;
}
