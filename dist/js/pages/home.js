import { updateUI, UserState, addPoints } from '../auth.js?v=8.5.2';
import { db } from '../firebase-init.js?v=8.5.2';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.5.2';

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
    const categoryCards = [
        DAILY_CATEGORY_META,
        {
            hash: '#personality',
            category: '성격',
            icon: '🧠',
            label: 'MENTAL LAB',
            title: '성격 분석',
            desc: '내면 패턴과 관계 습관, 감정의 결을 조금 더 정교하게 읽어내는 카테고리입니다.',
            gradient: 'linear-gradient(145deg, #e0e7ff 0%, #c7d2fe 52%, #eef2ff 100%)',
            accent: '#312e81',
            chips: ['깊이 있는 질문', '심리 리포트', '자기이해 강화']
        },
        {
            hash: '#face',
            category: '얼굴',
            icon: '✨',
            label: 'VISUAL CODE',
            title: '비주얼/얼굴',
            desc: '분위기, 인상, 매력 포인트를 중심으로 내 비주얼 캐릭터를 재밌게 읽어내는 영역입니다.',
            gradient: 'linear-gradient(145deg, #ffe4e6 0%, #fecdd3 52%, #fff1f2 100%)',
            accent: '#9d174d',
            chips: ['첫인상 분석', '매력 포인트', '분위기 진단']
        },
        {
            hash: '#fortune',
            category: '사주',
            icon: '🔮',
            label: 'FORTUNE FLOW',
            title: '오늘의 운세',
            desc: '오늘의 기운, 인연 흐름, 타이밍 감각까지 가볍게 보되 은근히 몰입되는 운세 모음입니다.',
            gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 52%, #fffbeb 100%)',
            accent: '#92400e',
            chips: ['타이밍 체크', '행운 흐름', '인연 레이더']
        },
        {
            hash: '#fun',
            category: '재미',
            icon: '🎨',
            label: 'PLAY MIND',
            title: '재미/심리',
            desc: '밈, 캐릭터성, 병맛 감성까지 섞어서 친구에게 바로 던지기 좋은 테스트가 몰려 있습니다.',
            gradient: 'linear-gradient(145deg, #f5f3ff 0%, #ddd6fe 52%, #faf5ff 100%)',
            accent: '#5b21b6',
            chips: ['병맛 테스트', '캐릭터 판정', '친구 공유 맛집']
        },
        {
            hash: '#salary',
            category: '월급 루팡',
            icon: '🖥️',
            label: 'OFFICE ESCAPE',
            title: '월급 루팡',
            desc: '회사 PC 앞에서 조용히 시간을 녹이는 직장인 전용 콘텐츠입니다. 티 안 나게 웃기고, 짧게 시작해도 은근 오래 붙잡힙니다.',
            gradient: 'linear-gradient(145deg, #ccfbf1 0%, #99f6e4 52%, #f0fdfa 100%)',
            accent: '#115e59',
            chips: ['직장인 밈', 'PC 최적화', '조용한 시간순삭']
        }
    ].map((card) => {
        if (card.category === 'daily') {
            return card;
        }
        const tests = latestTests.filter((test) => test.category === card.category);
        return {
            ...card,
            count: tests.length,
            latestTitle: tests[0]?.title || '준비 중',
            sampleTitles: tests.slice(0, 3).map((test) => test.title)
        };
    });

    const featuredCards = categoryCards
        .map((card) => `
            <article class="cat-large-card" onclick="${card.hash.startsWith('/') ? `window.goToDaily('${card.hash}')` : `location.hash='${card.hash}'`}" style="background:${card.gradient}; border-radius:32px; padding:1.55rem; cursor:pointer; border:1px solid rgba(255,255,255,0.72); box-shadow:0 18px 34px rgba(15,23,42,0.07); position:relative; overflow:hidden; display:flex; flex-direction:column; min-height:355px;">
                <div style="position:absolute; inset:auto -24px -28px auto; font-size:8rem; opacity:0.09; transform:rotate(14deg); pointer-events:none;">${card.icon}</div>
                <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:0.8rem; margin-bottom:0.8rem;">
                        <div style="font-size:0.74rem; letter-spacing:0.14em; font-weight:900; color:${card.accent}; opacity:0.92;">${card.label}</div>
                        <div style="flex-shrink:0; padding:0.42rem 0.72rem; border-radius:999px; background:rgba(255,255,255,0.52); border:1px solid rgba(255,255,255,0.75); color:${card.accent}; font-size:0.74rem; font-weight:900;">NEW FLOW</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-start; gap:0.72rem;">
                        <span style="width:54px; height:54px; border-radius:18px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.62); font-size:1.9rem; box-shadow:inset 0 1px 0 rgba(255,255,255,0.75);">${card.icon}</span>
                        <div style="min-width:0; width:100%;">
                            <h3 style="font-size:1.48rem; font-weight:900; color:#1e293b; margin:0 0 0.28rem; letter-spacing:-0.03em; line-height:1.16; word-break:keep-all;">${card.title}</h3>
                            <div style="font-size:0.84rem; font-weight:800; color:${card.accent}; line-height:1.3;">${card.count}개 테스트 운영 중</div>
                        </div>
                    </div>
                </div>

                <p style="font-size:0.96rem; color:#334155; line-height:1.68; font-weight:650; margin:0 0 1rem; word-break:keep-all;">${card.desc}</p>

                <div style="display:flex; flex-wrap:wrap; gap:0.45rem; margin-bottom:1rem;">
                    ${card.chips.map((chip) => `<span style="padding:0.42rem 0.72rem; border-radius:999px; background:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.72); color:#334155; font-size:0.77rem; font-weight:800;">${chip}</span>`).join('')}
                </div>

                <div style="margin-top:auto; background:rgba(255,255,255,0.48); border:1px solid rgba(255,255,255,0.72); border-radius:22px; padding:1rem 1rem 0.95rem;">
                    <div style="font-size:0.72rem; font-weight:900; color:${card.accent}; letter-spacing:0.11em; margin-bottom:0.45rem;">LATEST PICK</div>
                    <div style="font-size:1.02rem; font-weight:870; color:#0f172a; line-height:1.42; margin-bottom:0.82rem; word-break:keep-all;">${card.latestTitle}</div>
                    <div style="display:grid; gap:0.42rem; margin-bottom:0.95rem;">
                        ${card.sampleTitles.map((title) => `<div style="display:grid; grid-template-columns:auto 1fr; align-items:start; column-gap:0.42rem;"><span style="font-size:0.82rem; color:${card.accent}; font-weight:900; line-height:1.35;">•</span><span style="font-size:0.79rem; color:#475569; font-weight:700; line-height:1.38; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${title}</span></div>`).join('')}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.12rem; border-top:1px solid rgba(255,255,255,0.54);">
                        <span style="font-size:0.82rem; color:#475569; font-weight:850;">카테고리 전체 보기</span>
                        <span style="font-size:1.02rem; font-weight:900; color:${card.accent};">→</span>
                    </div>
                </div>
            </article>
        `)
        .join('');

    const summaryStats = categoryCards
        .map((card) => `
            <div style="background:rgba(255,255,255,0.72); border:1px solid rgba(255,255,255,0.8); border-radius:20px; padding:1rem 1.05rem; box-shadow:0 10px 20px rgba(15,23,42,0.05);">
                <div style="font-size:0.74rem; font-weight:900; color:${card.accent}; letter-spacing:0.1em; margin-bottom:0.45rem;">${card.label}</div>
                <div style="font-size:1.55rem; font-weight:950; color:#0f172a; line-height:1;">${card.count}</div>
                <div style="margin-top:0.35rem; font-size:0.84rem; color:#475569; font-weight:700;">${card.title}</div>
            </div>
        `)
        .join('');

    app.innerHTML = `
        <div class="category-selection-page fade-in" style="padding:1.4rem 1rem 5rem; max-width:1180px; margin:0 auto;">
            <section style="position:relative; overflow:hidden; border-radius:36px; padding:1.45rem; margin:1rem 0 1.6rem; background:linear-gradient(140deg,#fff7ed 0%,#f8fafc 36%,#eef2ff 100%); border:1px solid #e2e8f0; box-shadow:0 22px 50px rgba(15,23,42,0.07);">
                <div style="position:absolute; width:340px; height:340px; top:-170px; right:-110px; border-radius:50%; background:radial-gradient(circle,rgba(249,115,22,0.22) 0%, rgba(249,115,22,0) 72%);"></div>
                <div style="position:absolute; width:280px; height:280px; bottom:-150px; left:-90px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,0.16) 0%, rgba(99,102,241,0) 72%);"></div>
                <div style="position:relative; z-index:1; display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1rem; align-items:stretch;">
                    <div style="background:linear-gradient(145deg,#111827 0%,#1f2937 48%,#3730a3 100%); border-radius:30px; padding:1.8rem; color:#fff; min-height:300px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 22px 44px rgba(15,23,42,0.28);">
                        <div>
                            <div style="font-size:0.78rem; letter-spacing:0.16em; font-weight:900; color:rgba(255,255,255,0.72); margin-bottom:0.9rem;">CATEGORY GUIDE</div>
                            <div style="font-size:3.1rem; line-height:1; margin-bottom:1rem;">🎭</div>
                            <h2 class="section-title" style="font-size:clamp(2rem,7vw,2.9rem); width:100%; text-align:left; letter-spacing:-0.05em; color:#fff; font-weight:950; margin:0 0 0.8rem;">전체 카테고리 보기</h2>
                            <p class="text-sub" style="font-weight:650; font-size:1rem; color:rgba(226,232,240,0.92); line-height:1.7; margin:0;">지금 기분에 맞는 테스트를 한 번에 고를 수 있게, 카테고리별 성격과 최신 흐름을 한 화면에 정리했습니다. 새로 추가된 월급 루팡 카테고리도 여기서 바로 들어갈 수 있습니다.</p>
                        </div>
                        <div style="display:flex; gap:0.55rem; flex-wrap:wrap; margin-top:1.2rem;">
                            <span style="padding:0.5rem 0.78rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.14); font-size:0.78rem; font-weight:850;">총 ${TESTS.length + DAILY_CATEGORY_META.count}개 테스트</span>
                            <span style="padding:0.5rem 0.78rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.14); font-size:0.78rem; font-weight:850;">최신순 정렬 반영</span>
                        </div>
                    </div>

                    <div style="display:grid; gap:0.8rem; grid-template-rows:auto 1fr;">
                        <div style="background:rgba(255,255,255,0.72); border-radius:24px; padding:1.15rem; border:1px solid rgba(255,255,255,0.85); box-shadow:0 12px 24px rgba(15,23,42,0.05);">
                            <div style="font-size:0.78rem; font-weight:900; color:#ea580c; letter-spacing:0.13em; margin-bottom:0.55rem;">HOW TO PICK</div>
                            <div style="display:grid; gap:0.55rem;">
                            <div style="font-size:0.92rem; color:#334155; font-weight:750;">지금 나를 깊게 보고 싶으면 성격 분석</div>
                            <div style="font-size:0.92rem; color:#334155; font-weight:750;">오늘 상태만 빠르게 찍고 싶으면 오늘의 테스트</div>
                            <div style="font-size:0.92rem; color:#334155; font-weight:750;">가볍게 매력 포인트 보고 싶으면 비주얼/얼굴</div>
                                <div style="font-size:0.92rem; color:#334155; font-weight:750;">타이밍과 흐름이 궁금하면 오늘의 운세</div>
                                <div style="font-size:0.92rem; color:#334155; font-weight:750;">친구랑 웃으면서 하기엔 재미/심리</div>
                                <div style="font-size:0.92rem; color:#334155; font-weight:750;">회사에서 조용히 시간 보내려면 월급 루팡</div>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0.75rem;">
                            ${summaryStats}
                        </div>
                    </div>
                </div>
            </section>

            <div class="category-large-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1.15rem;">
                ${featuredCards}
            </div>
        </div>
    `;
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
        const homeCategories = [
            { hash: '/daily/', label: "TODAY'S TEST", title: '오늘의 테스트', category: 'daily', accent: '#0c4a6e', gradient: 'linear-gradient(145deg,#e0f2fe 0%,#bfdbfe 100%)', latestTitle: '오늘 회사 때려칠 확률 테스트', countText: '30개 테스트' },
            { hash: '#personality', label: 'MENTAL LAB', title: '성격 분석', category: '성격', accent: '#4f46e5', gradient: 'linear-gradient(145deg,#eef2ff 0%,#c7d2fe 100%)' },
            { hash: '#face', label: 'VISUAL CODE', title: '비주얼/얼굴', category: '얼굴', accent: '#db2777', gradient: 'linear-gradient(145deg,#fff1f2 0%,#fecdd3 100%)' },
            { hash: '#fortune', label: 'FORTUNE FLOW', title: '오늘의 운세', category: '사주', accent: '#d97706', gradient: 'linear-gradient(145deg,#fffbeb 0%,#fde68a 100%)' },
            { hash: '#fun', label: 'PLAY MIND', title: '재미/심리', category: '재미', accent: '#059669', gradient: 'linear-gradient(145deg,#ecfdf5 0%,#a7f3d0 100%)' },
            { hash: '#salary', label: 'OFFICE ESCAPE', title: '월급 루팡', category: '월급 루팡', accent: '#0f766e', gradient: 'linear-gradient(145deg,#f0fdfa 0%,#99f6e4 100%)' }
        ].map((item) => {
            if (item.category === 'daily') return item;
            const categoryTests = latestTests.filter((test) => test.category === item.category);
            return {
                ...item,
                count: categoryTests.length,
                latestTitle: categoryTests[0]?.title || '준비 중',
                countText: `${categoryTests.length}개 테스트`
            };
        });
        const latestDrop = latestTests.slice(0, 4);
        const spotlightTests = getRandomTests(3);

        app.innerHTML = `
            <div class="dashboard fade-in home-renewal" style="width: 100%; max-width: 1120px; margin: 0 auto; padding: 1.2rem 1.1rem 5.5rem; box-sizing: border-box;">
                <section class="home-hero-shell" style="position:relative; margin-bottom:1.35rem; border-radius:38px; padding:1.25rem; background:linear-gradient(145deg,#f8fafc 0%,#fff7ed 32%,#eef2ff 70%,#ecfeff 100%); border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 22px 60px rgba(15,23,42,0.08);">
                    <div style="position:absolute; width:420px; height:420px; right:-170px; top:-220px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,0.24) 0%, rgba(99,102,241,0) 72%);"></div>
                    <div style="position:absolute; width:300px; height:300px; left:-140px; bottom:-170px; border-radius:50%; background:radial-gradient(circle,rgba(234,88,12,0.18) 0%, rgba(234,88,12,0) 72%);"></div>
                    <div style="position:relative; z-index:2; display:grid; grid-template-columns:minmax(0,1.35fr) minmax(300px,0.9fr); gap:1rem;" class="home-hero-grid">
                        <article class="home-primary-hero" style="background:linear-gradient(135deg,#111827 0%,#1e1b4b 50%,#0f766e 100%); border-radius:30px; padding:1.9rem; color:#fff; min-height:380px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 28px 54px rgba(15,23,42,0.28); position:relative; overflow:hidden;">
                            <div style="position:absolute; inset:auto -70px -90px auto; width:230px; height:230px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%);"></div>
                            <div style="position:relative; z-index:1;">
                                <div class="home-hero-meta" style="display:flex; justify-content:space-between; align-items:center; gap:0.8rem; margin-bottom:1rem; flex-wrap:wrap;">
                                    <span style="font-size:0.72rem; letter-spacing:0.16em; font-weight:900; color:rgba(255,255,255,0.74);">SEVEN CHECK PLAYGROUND</span>
                                    <span style="font-size:0.74rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.18); border-radius:999px; padding:0.34rem 0.72rem; font-weight:900;">FRESH PICKS</span>
                                </div>
                                <h1 style="font-size:clamp(2rem,7vw,3.25rem); line-height:1.02; letter-spacing:-0.055em; margin:0 0 0.85rem;">${userName}님이<br>지금 바로 빠질<br>테스트 허브</h1>
                                <p style="font-size:0.96rem; color:rgba(226,232,240,0.95); line-height:1.7; max-width:92%; font-weight:650; margin-bottom:1rem;">심리 분석부터 병맛 테스트, 운세, 월급 루팡용 콘텐츠까지 한 화면에서 고르고 바로 시작할 수 있게 흐름을 다시 정리했습니다.</p>
                                <div class="home-hero-cta-row" style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-bottom:1.1rem;">
                                    <button class="home-cta-main" onclick="location.hash='#test/${heroTest.id}'" style="border:none; border-radius:16px; padding:0.82rem 1.08rem; background:linear-gradient(135deg,#22d3ee 0%,#6366f1 45%,#7c3aed 100%); color:#fff; font-weight:950; font-size:0.88rem; cursor:pointer; box-shadow:0 14px 26px rgba(99,102,241,0.34);">랜덤 추천 시작</button>
                                    <button onclick="location.hash='#7check'" style="border:1px solid rgba(255,255,255,0.24); border-radius:16px; padding:0.82rem 1.08rem; background:rgba(255,255,255,0.08); color:#fff; font-weight:850; font-size:0.88rem; cursor:pointer;">카테고리 허브 보기</button>
                                </div>
                                <div style="display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0.7rem;" class="home-hero-stats">
                                    <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.12);">
                                        <div style="font-size:0.7rem; letter-spacing:0.08em; font-weight:900; color:rgba(255,255,255,0.7); margin-bottom:0.2rem;">TOTAL TESTS</div>
                                        <div style="font-size:1.24rem; font-weight:950;">${TESTS.length + DAILY_CATEGORY_META.count}</div>
                                    </div>
                                    <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.12);">
                                        <div style="font-size:0.7rem; letter-spacing:0.08em; font-weight:900; color:rgba(255,255,255,0.7); margin-bottom:0.2rem;">TODAY MOOD</div>
                                        <div style="font-size:1.02rem; font-weight:900;">병맛 + 몰입</div>
                                    </div>
                                    <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.12);">
                                        <div style="font-size:0.7rem; letter-spacing:0.08em; font-weight:900; color:rgba(255,255,255,0.7); margin-bottom:0.2rem;">HOT PICK</div>
                                        <div style="font-size:1.02rem; font-weight:900;">${heroTest.category}</div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        <div class="home-hero-side" style="display:grid; gap:0.85rem; grid-template-rows:auto auto auto 1fr;">
                            <div class="home-side-card" style="background:#fff; border-radius:22px; border:1px solid #e2e8f0; padding:1rem 1rem; box-shadow:0 14px 28px rgba(15,23,42,0.05);">
                                <div style="font-size:0.72rem; font-weight:900; color:#7c3aed; letter-spacing:0.12em; margin-bottom:0.42rem;">TODAY INSIGHT</div>
                                <div style="font-size:0.93rem; font-weight:750; color:#334155; line-height:1.58;">${randomAdvice}</div>
                            </div>

                            <div class="home-side-card" style="background:linear-gradient(145deg,#ffffff 0%,#eff6ff 100%); border-radius:22px; border:1px solid #dbeafe; padding:1rem; box-shadow:0 14px 28px rgba(15,23,42,0.05);">
                                <div style="font-size:0.72rem; font-weight:900; color:#2563eb; letter-spacing:0.12em; margin-bottom:0.42rem;">SPOTLIGHT TEST</div>
                                <div style="font-size:1.02rem; font-weight:900; color:#0f172a; line-height:1.38; margin-bottom:0.4rem; word-break:keep-all;">${heroTest.title}</div>
                                <div style="font-size:0.82rem; color:#475569; font-weight:700; line-height:1.55; margin-bottom:0.7rem;">${heroTest.desc}</div>
                                <button onclick="location.hash='#test/${heroTest.id}'" style="width:100%; border:none; border-radius:14px; padding:0.78rem 0.9rem; background:linear-gradient(135deg,#60a5fa,#4338ca); color:#fff; font-weight:900; cursor:pointer;">이 테스트 바로 시작</button>
                            </div>

                            <div class="home-search-shell" style="position:relative;">
                                <input type="text" id="home-search" placeholder="테스트 제목/카테고리 검색" style="width:100%; padding:0.95rem 1rem 0.95rem 2.95rem; border-radius:18px; border:1px solid #dbe3ef; background:#ffffff; font-size:0.9rem; font-weight:750; color:#1e293b; outline:none; box-shadow:0 10px 20px rgba(15,23,42,0.04);">
                                <span style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); font-size:1.08rem; opacity:0.48;">⌕</span>
                            </div>

                            <div class="home-side-card" style="background:#fff; border-radius:22px; border:1px solid #e2e8f0; padding:0.82rem; box-shadow:0 14px 28px rgba(15,23,42,0.05);">
                                <div class="home-quick-grid" style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:0.55rem;">
                                    <button onclick="location.hash='#arcade'" style="border:none; border-radius:14px; padding:0.68rem 0.72rem; background:linear-gradient(135deg,#34d399,#059669); color:#fff; font-size:0.82rem; font-weight:850; cursor:pointer;">🕹️ 오락실</button>
                                    <button onclick="location.hash='#ranking'" style="border:none; border-radius:14px; padding:0.68rem 0.72rem; background:linear-gradient(135deg,#facc15,#d97706); color:#fff; font-size:0.82rem; font-weight:850; cursor:pointer;">🏆 랭킹</button>
                                    <button onclick="location.hash='#board'" style="border:none; border-radius:14px; padding:0.68rem 0.72rem; background:linear-gradient(135deg,#60a5fa,#4338ca); color:#fff; font-size:0.82rem; font-weight:850; cursor:pointer;">💬 커뮤니티</button>
                                    <button onclick="location.hash='#profile'" style="border:none; border-radius:14px; padding:0.68rem 0.72rem; background:linear-gradient(135deg,#64748b,#0f172a); color:#fff; font-size:0.82rem; font-weight:850; cursor:pointer;">👤 내 정보</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="home-ops-strip" style="margin-bottom:1.35rem; border-radius:30px; padding:1.05rem; background:linear-gradient(145deg,#ffffff 0%,#f8fafc 50%,#eef2ff 100%); border:1px solid #e2e8f0; box-shadow:0 18px 34px rgba(15,23,42,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:0.9rem; flex-wrap:wrap; margin-bottom:0.82rem;">
                        <div>
                            <div style="font-size:0.74rem; color:#4f46e5; letter-spacing:0.14em; font-weight:900; margin-bottom:0.2rem;">LIVE OPS</div>
                            <h3 style="font-size:1.26rem; font-weight:950; color:#0f172a; letter-spacing:-0.03em; margin:0;">최근 손본 기능과 운영 흐름</h3>
                        </div>
                        <span onclick="location.hash='#guide'" style="font-size:0.82rem; font-weight:900; color:#4f46e5; cursor:pointer;">이용 가이드 →</span>
                    </div>
                    <div class="home-ops-grid" style="display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0.72rem;">
                        ${HOME_UPDATES.map((item) => `
                            <article style="border-radius:22px; padding:0.95rem; background:${item.gradient}; border:1px solid rgba(255,255,255,0.7); box-shadow:0 10px 22px rgba(15,23,42,0.04);">
                                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.6rem; margin-bottom:0.55rem;">
                                    <span style="padding:0.28rem 0.52rem; border-radius:999px; background:#fff; color:${item.accent}; font-size:0.68rem; font-weight:900; letter-spacing:0.08em;">${item.badge}</span>
                                    <span style="width:9px; height:9px; border-radius:999px; background:${item.accent}; box-shadow:0 0 0 5px ${item.accent}18;"></span>
                                </div>
                                <div style="font-size:0.98rem; color:#0f172a; font-weight:900; line-height:1.38; margin-bottom:0.38rem; word-break:keep-all;">${item.title}</div>
                                <div style="font-size:0.8rem; color:#475569; font-weight:700; line-height:1.55; word-break:keep-all;">${item.desc}</div>
                            </article>
                        `).join('')}
                    </div>
                </section>

                <section style="display:grid; grid-template-columns:minmax(0,1.2fr) minmax(280px,0.8fr); gap:1rem; margin-bottom:1.75rem;" class="home-feature-stack">
                    <div style="background:#fff; border-radius:30px; border:1px solid #e2e8f0; padding:1.2rem; box-shadow:0 18px 36px rgba(15,23,42,0.05);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:0.8rem; flex-wrap:wrap; margin-bottom:0.95rem;">
                            <div>
                                <div style="font-size:0.74rem; color:#0f766e; letter-spacing:0.14em; font-weight:900; margin-bottom:0.2rem;">CATEGORY LANES</div>
                                <h3 style="font-size:1.38rem; font-weight:950; color:#0f172a; letter-spacing:-0.03em; margin:0;">지금 들어가기 좋은 라인업</h3>
                            </div>
                            <span onclick="location.hash='#7check'" style="font-size:0.82rem; font-weight:900; color:#0f766e; cursor:pointer;">전체 카테고리 →</span>
                        </div>
                        <div class="home-category-lanes" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:0.8rem;">
                            ${homeCategories.map((card) => `
                                <article onclick="${card.hash.startsWith('/') ? `window.goToDaily('${card.hash}')` : `location.hash='${card.hash}'`}" style="cursor:pointer; border-radius:24px; padding:1rem; background:${card.gradient}; border:1px solid rgba(255,255,255,0.7); min-height:170px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 12px 24px rgba(15,23,42,0.05);">
                                    <div>
                                        <div style="font-size:0.72rem; color:${card.accent}; font-weight:900; letter-spacing:0.11em; margin-bottom:0.28rem;">${card.label}</div>
                                        <div style="font-size:1.08rem; color:#0f172a; font-weight:950; letter-spacing:-0.02em; margin-bottom:0.35rem;">${card.title}</div>
                                        <div style="font-size:0.82rem; color:#475569; font-weight:700; line-height:1.5;">${card.latestTitle}</div>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.9rem;">
                                        <span style="font-size:0.8rem; color:${card.accent}; font-weight:900;">${card.countText}</span>
                                        <span style="font-size:1rem; color:${card.accent}; font-weight:900;">→</span>
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    </div>

                    <div style="background:linear-gradient(145deg,#fff7ed 0%,#ffffff 100%); border-radius:30px; border:1px solid #fed7aa; padding:1.2rem; box-shadow:0 18px 36px rgba(15,23,42,0.05);">
                        <div style="font-size:0.74rem; color:#ea580c; letter-spacing:0.14em; font-weight:900; margin-bottom:0.22rem;">LATEST DROP</div>
                        <h3 style="font-size:1.35rem; font-weight:950; color:#0f172a; letter-spacing:-0.03em; margin:0 0 0.9rem;">가장 최근 추가된 테스트</h3>
                        <div class="home-latest-drop" style="display:grid; gap:0.72rem;">
                            ${latestDrop.map((test, index) => `
                                <button onclick="location.hash='#test/${test.id}'" style="text-align:left; border:none; border-radius:18px; padding:0.95rem; background:#fff; border:1px solid rgba(251,146,60,0.18); box-shadow:0 10px 18px rgba(15,23,42,0.04); cursor:pointer;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; gap:0.65rem; margin-bottom:0.34rem;">
                                        <span style="font-size:0.72rem; color:#ea580c; font-weight:900; letter-spacing:0.08em;">NEW ${index + 1}</span>
                                        <span style="font-size:0.72rem; color:#64748b; font-weight:800;">${test.category}</span>
                                    </div>
                                    <div style="font-size:0.92rem; color:#0f172a; font-weight:900; line-height:1.42; word-break:keep-all;">${test.title}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </section>

                <section style="margin-bottom:1.35rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; flex-wrap:wrap; margin-bottom:0.9rem;">
                        <div>
                            <div style="font-size:0.74rem; color:#7c3aed; letter-spacing:0.14em; font-weight:900; margin-bottom:0.18rem;">CURATED NOW</div>
                            <h3 style="font-size:1.4rem; font-weight:950; color:#0f172a; letter-spacing:-0.03em; margin:0;">지금 눌러도 재밌을 큐레이션 테스트</h3>
                        </div>
                        <span onclick="location.hash='#7check'" style="font-size:0.84rem; font-weight:900; color:#6366f1; cursor:pointer;">전체 보기 →</span>
                    </div>
                    <div class="home-spotlight-grid" style="display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0.8rem; margin-bottom:0.95rem;">
                        ${spotlightTests.map((test, index) => `
                            <article onclick="location.hash='#test/${test.id}'" style="cursor:pointer; border-radius:22px; padding:1rem; background:${index === 0 ? 'linear-gradient(145deg,#dbeafe 0%,#eef2ff 100%)' : index === 1 ? 'linear-gradient(145deg,#fef3c7 0%,#fff7ed 100%)' : 'linear-gradient(145deg,#dcfce7 0%,#ecfdf5 100%)'}; border:1px solid rgba(255,255,255,0.75); min-height:150px; box-shadow:0 12px 24px rgba(15,23,42,0.04);">
                                <div style="font-size:0.72rem; font-weight:900; color:#475569; letter-spacing:0.08em; margin-bottom:0.35rem;">PICK ${index + 1}</div>
                                <div style="font-size:1rem; color:#0f172a; font-weight:900; line-height:1.4; margin-bottom:0.45rem;">${test.title}</div>
                                <div style="font-size:0.8rem; color:#475569; font-weight:700;">${test.category}</div>
                            </article>
                        `).join('')}
                    </div>
                </section>

                <div id="test-list-grid" class="test-grid home-renewal-test-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:0.95rem; width:100%;">
                    ${curatedTests.map(t => renderTestCard(t)).join('')}
                </div>
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
                        : `<div style="grid-column:1/-1; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:2rem; text-align:center; color:#64748b; font-weight:700;">검색 결과가 없습니다.</div>`;
                }
            };
        }
    } else {
        const filtered = latestTests.filter(t => t.category === window._currentFilter);
        const isSalaryCategory = window._currentFilter === '월급 루팡';
        app.innerHTML = `
            <div class="category-page fade-in">
                <div class="section-header" style="margin-bottom: 2rem;">
                    <h2 class="section-title">${window._currentFilter} 테스트</h2>
                    <span class="text-sub" style="font-weight: 700;">총 ${filtered.length}개</span>
                </div>
                ${isSalaryCategory ? `
                    <section style="margin-bottom:1.6rem; border-radius:28px; padding:1.2rem; background:linear-gradient(145deg,#0f172a 0%, #134e4a 55%, #0f766e 100%); color:#fff; position:relative; overflow:hidden; box-shadow:0 20px 40px rgba(15,23,42,0.16);">
                        <div style="position:absolute; width:260px; height:260px; top:-130px; right:-90px; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 72%);"></div>
                        <div style="position:relative; z-index:1; display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem; align-items:center;">
                            <div>
                                <div style="font-size:0.76rem; font-weight:900; letter-spacing:0.14em; color:rgba(255,255,255,0.7); margin-bottom:0.65rem;">FEATURED MINI GAME</div>
                                <h3 style="font-size:1.8rem; line-height:1.15; letter-spacing:-0.04em; font-weight:950; margin:0 0 0.6rem;">상사 오기 전<br>업무창 위장하기</h3>
                                <p style="font-size:0.92rem; color:rgba(240,253,250,0.92); line-height:1.72; font-weight:650; max-width:95%;">회사 PC에서 조용히 즐기는 30초 생존 게임입니다. 비회원은 바로 체험, 회원은 최고점 저장과 포인트 획득이 가능합니다.</p>
                            </div>
                            <div style="display:grid; gap:0.7rem; align-content:start;">
                                <div style="display:flex; flex-wrap:wrap; gap:0.45rem;">
                                    <span style="padding:0.45rem 0.72rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.16); font-size:0.75rem; font-weight:850;">무음 플레이</span>
                                    <span style="padding:0.45rem 0.72rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.16); font-size:0.75rem; font-weight:850;">회원 랭킹 저장</span>
                                    <span style="padding:0.45rem 0.72rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.16); font-size:0.75rem; font-weight:850;">포인트 지급</span>
                                </div>
                                <button onclick="location.hash='#salary-tab-shift'" style="border:none; border-radius:18px; padding:0.95rem 1.1rem; background:#fff; color:#0f766e; font-size:0.95rem; font-weight:950; cursor:pointer; box-shadow:0 14px 24px rgba(15,23,42,0.16);">🖥️ 월급 루팡 게임 시작</button>
                            </div>
                        </div>
                    </section>
                ` : ''}
                <div class="test-grid">
                    ${filtered.map(t => renderTestCard(t)).join('')}
                </div>
            </div>
        `;
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
        { bg: 'linear-gradient(145deg,#eef2ff 0%,#e0e7ff 100%)', text: '#1e1b4b', sub: '#4338ca', accent: '#6366f1', border: '#c7d2fe' },
        { bg: 'linear-gradient(145deg,#ecfdf5 0%,#d1fae5 100%)', text: '#064e3b', sub: '#059669', accent: '#10b981', border: '#a7f3d0' },
        { bg: 'linear-gradient(145deg,#fff1f2 0%,#ffe4e6 100%)', text: '#881337', sub: '#e11d48', accent: '#f43f5e', border: '#fecdd3' },
        { bg: 'linear-gradient(145deg,#fffbeb 0%,#fef3c7 100%)', text: '#78350f', sub: '#d97706', accent: '#f59e0b', border: '#fde68a' },
        { bg: 'linear-gradient(145deg,#f5f3ff 0%,#ede9fe 100%)', text: '#4c1d95', sub: '#7c3aed', accent: '#8b5cf6', border: '#ddd6fe' },
        { bg: 'linear-gradient(145deg,#f0f9ff 0%,#e0f2fe 100%)', text: '#0c4a6e', sub: '#0284c7', accent: '#0ea5e9', border: '#bae6fd' }
    ];
    const theme = themes[seed % themes.length];

    return `
    <div class="test-card fade-in" data-cat="${t.category}" onclick="location.hash='#test/${t.id}'" 
         style="position:relative; background:${theme.bg}; border-radius:20px; overflow:hidden; border:1px solid ${theme.border}; display:flex; flex-direction:column; cursor:pointer; transition:transform 0.2s; box-shadow:0 10px 20px rgba(15,23,42,0.06); color:${theme.text};">
        
        <div class="test-info" style="padding:1.15rem; flex-grow:1; display:flex; flex-direction:column; position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.95rem;">
                <span class="test-category-tag" style="font-size:0.68rem; font-weight:900; color:#fff; background:${theme.accent}; padding:4px 10px; border-radius:999px;">
                    ${t.category}
                </span>
                
                <div style="background:rgba(255,255,255,0.6); color:${theme.sub}; padding:4px 10px; border-radius:999px; font-size:0.72rem; font-weight:800; display:flex; align-items:center; gap:4px; border:1px solid rgba(255,255,255,0.75);">
                    <span style="font-size:0.85rem;">🔥</span> <span>${formatEngUnit(playCount)}</span>
                </div>
            </div>
            
            <h3 style="font-size:1.16rem; font-weight:900; line-height:1.35; color:${theme.text}; margin-bottom:0.62rem; word-break:keep-all; letter-spacing:-0.02em;">${t.title}</h3>
            <p style="font-size:0.86rem; color:#475569; line-height:1.55; margin-bottom:1.15rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:keep-all; font-weight:600;">${t.desc}</p>
            
            <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(30,41,59,0.09); padding-top:0.9rem;">
                <div id="like-badge-${t.id}"
                     onclick="event.stopPropagation(); handleLike('${t.id}')"
                     style="color:${theme.sub}; background:#fff; padding:5px 12px; border-radius:999px; font-size:0.78rem; font-weight:800; display:flex; align-items:center; gap:5px; cursor:pointer; border:1px solid ${theme.border};">
                    <span style="font-size:0.96rem; line-height:1;">❤️</span> <span id="like-count-${t.id}">${formatEngUnit(displayLikes)}</span>
                </div>
                
                <div style="color:${theme.accent}; font-weight:900; font-size:0.84rem; display:flex; align-items:center; gap:3px;">
                    시작하기 <span style="font-size:1rem;">➔</span>
                </div>
            </div>
        </div>
    </div>`;
}
