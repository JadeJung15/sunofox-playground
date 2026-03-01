import { updateUI, UserState, addPoints } from '../auth.js?v=8.5.3';
import { db } from '../firebase-init.js?v=8.5.3';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.5.3';

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
        DAILY_CATEGORY_META,
        {
            hash: '#personality',
            category: '성격',
            icon: '01',
            label: 'MENTAL LAB',
            title: '성격 분석',
            desc: '관계 습관, 감정 패턴, 내면의 결을 긴 호흡으로 읽는 분석형 테스트.',
            accent: 'var(--tone-indigo)',
            chips: ['깊이 있는 질문', '심리 리포트', '자기이해']
        },
        {
            hash: '#face',
            category: '얼굴',
            icon: '02',
            label: 'VISUAL CODE',
            title: '비주얼/얼굴',
            desc: '첫인상과 분위기, 매력 포인트를 직관적으로 잡아내는 캐주얼 진단.',
            accent: 'var(--tone-rose)',
            chips: ['인상 분석', '매력 포인트', '분위기 판독']
        },
        {
            hash: '#fortune',
            category: '사주',
            icon: '03',
            label: 'FORTUNE FLOW',
            title: '오늘의 운세',
            desc: '오늘의 감정 흐름과 타이밍을 짧고 선명하게 읽는 데일리 포맷.',
            accent: 'var(--tone-amber)',
            chips: ['타이밍 체크', '행운 흐름', '일상 리듬']
        },
        {
            hash: '#fun',
            category: '재미',
            icon: '04',
            label: 'PLAY MIND',
            title: '재미/심리',
            desc: '밈과 캐릭터성을 섞은 라이트한 테스트. 친구에게 바로 보내기 좋습니다.',
            accent: 'var(--tone-mint)',
            chips: ['캐릭터 판정', '가벼운 몰입', '공유용']
        },
        {
            hash: '#salary',
            category: '월급 루팡',
            icon: '05',
            label: 'OFFICE ESCAPE',
            title: '월급 루팡',
            desc: '짧은 플레이와 조용한 몰입에 맞춘 직장인 전용 콘텐츠 라인.',
            accent: 'var(--tone-ink)',
            chips: ['PC 최적화', '짧은 세션', '직장인 밈']
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
                    <span class="minimal-kicker">SevenCheck Index</span>
                    <h1>Choose a lane.<br>Keep it simple.</h1>
                    <p>지금 기분과 집중도에 맞춰 가장 적합한 테스트 라인을 바로 고를 수 있게 카테고리를 다시 정리했습니다.</p>
                </div>
                <div class="minimal-stat-row">
                    <div class="minimal-stat-card">
                        <small>Total</small>
                        <strong>${TESTS.length + DAILY_CATEGORY_META.count}</strong>
                        <span>전체 테스트 수</span>
                    </div>
                    <div class="minimal-stat-card">
                        <small>Mode</small>
                        <strong>5</strong>
                        <span>핵심 카테고리</span>
                    </div>
                    <div class="minimal-stat-card">
                        <small>Daily</small>
                        <strong>${DAILY_CATEGORY_META.count}</strong>
                        <span>오늘의 테스트</span>
                    </div>
                </div>
            </section>

            <section class="minimal-section reveal">
                <div class="minimal-section-head">
                    <div>
                        <span class="minimal-kicker">Category Grid</span>
                        <h2>콘텐츠 중심으로 다시 정리된 구조</h2>
                    </div>
                </div>
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
    const curatedTests = getRandomTests(6);

    if (hash === '#home' || !hash) {
        const randomAdvice = FOX_ADVICE[Math.floor(Math.random() * FOX_ADVICE.length)];
        const userName = UserState.user ? UserState.data?.nickname || '사용자' : '방문자';
        const heroTest = latestTests[Math.floor(Math.random() * latestTests.length)];
        const homeCategories = buildHomeCategoryCards(latestTests);
        const latestDrop = latestTests.slice(0, 4);
        const spotlightTests = getRandomTests(3);

        app.innerHTML = `
            <div class="minimal-page minimal-home fade-in">
                <section class="minimal-hero reveal">
                    <div class="minimal-hero-copy">
                        <span class="minimal-kicker">SevenCheck Minimal</span>
                        <h1>${userName}님에게<br>지금 필요한 건<br>복잡하지 않은 테스트.</h1>
                        <p>심리 분석, 운세, 캐주얼 테스트까지 한 화면에서 빠르게 고르고 바로 시작할 수 있는 미니멀 웹앱 구조로 재정리했습니다.</p>
                        <div class="minimal-hero-actions">
                            <button class="btn-primary" onclick="location.hash='#test/${heroTest.id}'">랜덤 추천 시작</button>
                            <button class="btn-secondary" onclick="location.hash='#7check'">카테고리 보기</button>
                        </div>
                    </div>
                    <div class="minimal-hero-aside">
                        <div class="minimal-metric-block">
                            <small>Today Insight</small>
                            <strong>${randomAdvice}</strong>
                        </div>
                        <div class="minimal-metric-row">
                            <div class="minimal-metric-card">
                                <small>Tests</small>
                                <strong>${TESTS.length + DAILY_CATEGORY_META.count}</strong>
                            </div>
                            <div class="minimal-metric-card">
                                <small>Hot Pick</small>
                                <strong>${heroTest.category}</strong>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="minimal-section reveal">
                    <div class="minimal-section-head">
                        <div>
                            <span class="minimal-kicker">Category Grid</span>
                            <h2>지금 들어가기 좋은 라인</h2>
                        </div>
                        <button class="minimal-text-link" onclick="location.hash='#7check'">전체 보기</button>
                    </div>
                    <div class="minimal-card-grid minimal-card-grid-3">
                        ${homeCategories.map((card) => `
                            <article class="minimal-pane minimal-pane-interactive" onclick="${card.hash.startsWith('/') ? `window.goToDaily('${card.hash}')` : `location.hash='${card.hash}'`}">
                                <div class="minimal-pane-top">
                                    <span class="minimal-pane-index" style="color:${card.accent || 'var(--accent-color)'}">${card.icon || '00'}</span>
                                    <span class="minimal-pane-label">${card.label}</span>
                                </div>
                                <h3>${card.title}</h3>
                                <p>${card.desc || card.latestTitle}</p>
                                <div class="minimal-pane-bottom">
                                    <strong>${card.countText}</strong>
                                    <span>${card.latestTitle}</span>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </section>

                <section class="minimal-section reveal">
                    <div class="minimal-feature-grid">
                        <article class="minimal-feature-card minimal-feature-card-dark">
                            <span class="minimal-kicker">Spotlight Test</span>
                            <h2>${heroTest.title}</h2>
                            <p>${heroTest.desc}</p>
                            <button class="btn-primary" onclick="location.hash='#test/${heroTest.id}'">이 테스트 시작</button>
                        </article>
                        <article class="minimal-feature-card">
                            <span class="minimal-kicker">Search</span>
                            <h2>원하는 테스트를 바로 찾기</h2>
                            <p>제목이나 카테고리로 즉시 필터링합니다.</p>
                            <div class="minimal-search-shell">
                                <input type="text" id="home-search" placeholder="테스트 제목 / 카테고리 검색">
                            </div>
                        </article>
                    </div>
                </section>

                <section class="minimal-section reveal">
                    <div class="minimal-section-head">
                        <div>
                            <span class="minimal-kicker">Live Notes</span>
                            <h2>최근 업데이트</h2>
                        </div>
                    </div>
                    <div class="minimal-card-grid">
                        ${HOME_UPDATES.map((item) => `
                            <article class="minimal-note-card">
                                <small>${item.badge}</small>
                                <h3>${item.title}</h3>
                                <p>${item.desc}</p>
                            </article>
                        `).join('')}
                    </div>
                </section>

                <section class="minimal-section reveal">
                    <div class="minimal-section-head">
                        <div>
                            <span class="minimal-kicker">Curated Tests</span>
                            <h2>바로 눌러도 좋은 큐레이션</h2>
                        </div>
                    </div>
                    <div class="minimal-card-grid">
                        ${spotlightTests.map((test) => `
                            <article class="minimal-spotlight-card" onclick="location.hash='#test/${test.id}'">
                                <small>${test.category}</small>
                                <h3>${test.title}</h3>
                                <span>Open test</span>
                            </article>
                        `).join('')}
                    </div>
                </section>

                <section class="minimal-section reveal">
                    <div class="minimal-section-head">
                        <div>
                            <span class="minimal-kicker">Open Chat</span>
                            <h2>결과 얘기까지 이어지는 공식 채팅방</h2>
                        </div>
                        <a href="https://open.kakao.com/o/g1PIRRii" target="_blank" rel="noopener noreferrer" class="minimal-text-link">입장하기</a>
                    </div>
                    <div class="minimal-chip-row minimal-chip-row-wide">
                        ${['#심리테스트', '#MBTI', '#연애테스트', '#궁합', '#보이스룸', '#2030'].map((tag) => `<span>${tag}</span>`).join('')}
                    </div>
                </section>

                <section class="minimal-section reveal">
                    <div class="minimal-section-head">
                        <div>
                            <span class="minimal-kicker">Browse</span>
                            <h2>콘텐츠 카드</h2>
                        </div>
                    </div>
                    <div id="test-list-grid" class="test-grid minimal-test-grid">
                        ${curatedTests.map((t) => renderTestCard(t)).join('')}
                    </div>
                </section>

                <section class="minimal-section reveal">
                    <div class="minimal-section-head">
                        <div>
                            <span class="minimal-kicker">Latest</span>
                            <h2>최근 추가된 테스트</h2>
                        </div>
                    </div>
                    <div class="minimal-card-grid">
                        ${latestDrop.map((test, index) => `
                            <article class="minimal-note-card" onclick="location.hash='#test/${test.id}'">
                                <small>NEW ${index + 1}</small>
                                <h3>${test.title}</h3>
                                <p>${test.category}</p>
                            </article>
                        `).join('')}
                    </div>
                </section>
            </div>
        `;

        const searchInput = document.getElementById('home-search');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const term = e.target.value.toLowerCase().trim();
                const filtered = latestTests.filter(t => t.title.toLowerCase().includes(term) || t.category.toLowerCase().includes(term));
                const grid = document.getElementById('test-list-grid');
                if (grid) {
                    grid.innerHTML = filtered.length > 0
                        ? filtered.slice(0, 12).map(t => renderTestCard(t)).join('')
                        : `<div class="minimal-empty-state">검색 결과가 없습니다.</div>`;
                }
            };
        }
        initRevealMotion(app);
    } else {
        const filtered = latestTests.filter(t => t.category === window._currentFilter);
        const isSalaryCategory = window._currentFilter === '월급 루팡';
        app.innerHTML = `
            <div class="minimal-page minimal-page-narrow fade-in">
                <div class="minimal-section-head reveal">
                    <div>
                        <span class="minimal-kicker">${window._currentFilter}</span>
                        <h2>${window._currentFilter} 테스트</h2>
                    </div>
                    <span class="minimal-text-meta">총 ${filtered.length}개</span>
                </div>
                ${isSalaryCategory ? `
                    <section class="minimal-feature-card minimal-feature-card-dark reveal" style="margin-bottom:1.5rem;">
                        <span class="minimal-kicker">Featured Mini Game</span>
                        <h2>상사 오기 전 업무창 위장하기</h2>
                        <p>회사 PC에서 조용히 즐기는 30초 생존 게임입니다. 비회원은 바로 체험, 회원은 최고점 저장과 포인트 획득이 가능합니다.</p>
                        <button class="btn-primary" onclick="location.hash='#salary-tab-shift'">월급 루팡 게임 시작</button>
                    </section>
                ` : ''}
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
