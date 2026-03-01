import { updateUI, UserState, addPoints } from '../auth.js?v=8.5.5';
import { db } from '../firebase-init.js?v=8.5.5';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.5.5';

const FOX_ADVICE = [
    "오늘 하루도 당신은 충분히 빛나요! ✨",
    "오른쪽으로 걸어가면 뜻밖의 행운이 있을지도? 🍀",
    "지금 테스트를 하면 마음이 한결 가벼워질 거예요. 🧠",
    "지칠 땐 오락실에서 한 판 쉬어가는 건 어때요? 🎰",
    "당신의 아우라는 오늘 '열정의 레드'만큼 뜨겁네요! 🔥",
    "맛있는 걸 먹으면 운세가 2배로 좋아질 거예요! 🍰",
    "누군가 당신을 생각하고 있는 따뜻한 날이네요. 💌",
    "오늘은 새로운 도전을 시작하기에 완벽한 날입니다! 🚀",
    "가끔은 아무것도 하지 않는 게 최고의 휴식이에요. 💤",
    "당신이 몰랐던 매력을 곧 발견하게 될 거예요! 💎"
];

const HOME_UPDATES = [
    {
        badge: 'NEW',
        title: '오늘의 테스트 오픈',
        desc: '10초 안에 끝나는 초단기 결과형 테스트가 새 카테고리로 붙었습니다.',
        accent: '#0ea5e9',
        gradient: 'linear-gradient(145deg,#eff6ff 0%,#dbeafe 100%)'
    },
    {
        badge: 'UPDATED',
        title: '오락실 보상 흐름 정리',
        desc: '게임별 수익 구조와 주간 보너스를 다시 다듬어서 재방문 동선을 보강했습니다.',
        accent: '#d97706',
        gradient: 'linear-gradient(145deg,#fff7ed 0%,#ffedd5 100%)'
    },
    {
        badge: 'POLISHED',
        title: '프로필 · 게시판 개선',
        desc: '프로필 가독성과 게시판 피드백을 손봐서 전체 사용감이 더 자연스러워졌습니다.',
        accent: '#7c3aed',
        gradient: 'linear-gradient(145deg,#f5f3ff 0%,#ede9fe 100%)'
    }
];

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
            hash: '#fun',
            category: '재미',
            icon: '02',
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
                    <h1>심리테스트만,<br>간단하게.</h1>
                    <p>불필요한 분기를 걷어내고 핵심 심리테스트 카테고리만 남겼습니다.</p>
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
                <div class="minimal-section-head">
                    <div>
                        <span class="minimal-kicker">Category Grid</span>
                        <h2>지금 필요한 두 가지</h2>
                    </div>
                </div>
                <div class="minimal-card-grid minimal-card-grid-2">
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
    const curatedTests = getRandomTests(6);

    if (hash === '#home' || !hash) {
        app.innerHTML = `
            <div class="minimal-page minimal-home fade-in">
                <section class="minimal-hero reveal">
                    <div class="minimal-hero-copy">
                        <span class="minimal-kicker">SevenCheck</span>
                        <h1>심리테스트만<br>남겼습니다.</h1>
                        <p>불필요한 요소를 지우고, 바로 시작하는 흐름만 남겼습니다.</p>
                        <div class="minimal-hero-actions minimal-hero-actions-center">
                            <button class="btn-primary minimal-start-button" onclick="location.hash='#7check'">테스트 시작하기</button>
                        </div>
                        <div class="minimal-home-links">
                            <button class="minimal-text-link" onclick="location.hash='#7check'">카테고리 보기</button>
                        </div>
                    </div>
                </section>
            </div>
        `;
        initRevealMotion(app);
    } else {
        const filtered = latestTests.filter(t => t.category === window._currentFilter);
        app.innerHTML = `
            <div class="minimal-page minimal-page-narrow fade-in">
                <div class="minimal-section-head reveal">
                    <div>
                        <span class="minimal-kicker">${window._currentFilter}</span>
                        <h2>${window._currentFilter} 테스트</h2>
                    </div>
                    <span class="minimal-text-meta">총 ${filtered.length}개</span>
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
