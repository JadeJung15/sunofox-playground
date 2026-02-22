// js/app.js
import { auth } from './firebase-init.js';

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

// 테스트 데이터베이스 (test-it.co.kr 스타일로 확장)
const TESTS = [
    // --- 성격 카테고리 ---
    { 
        id: 'first-impression', 
        category: '성격', 
        title: '나의 첫인상 테스트', 
        desc: '남들이 보는 나의 첫인상은 어떨까? 분위기 분석 테스트', 
        thumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '새로운 모임에 갔을 때 나는?', options: [{ text: '먼저 말을 건네 분위기를 띄운다', type: '인싸' }, { text: '조용히 상황을 지켜본다', type: '신중' }] },
            { q: '친구들이 말하는 나의 매력은?', options: [{ text: '다정하고 따뜻함', type: '따뜻' }, { text: '쿨하고 지적인 느낌', type: '냉철' }] }
        ]
    },
    { 
        id: 'love-style', 
        category: '성격', 
        title: '연애 스타일 MBTI', 
        desc: '연애할 때 나는 어떤 모습일까? 나의 연애 세포 분석', 
        thumb: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '데이트 코스를 짤 때 나는?', options: [{ text: '철저하게 시간 단위로 계획', type: 'J' }, { text: '그때그때 기분에 따라', type: 'P' }] },
            { q: '연인과 갈등이 생기면?', options: [{ text: '논리적으로 잘잘못을 가린다', type: 'T' }, { text: '상대의 감정을 먼저 살핀다', type: 'F' }] }
        ]
    },
    { 
        id: 'office-type', 
        category: '성격', 
        title: '직장인 생존 유형 테스트', 
        desc: '회사에서 나는 어떤 캐릭터? 사무실 속 나의 모습', 
        thumb: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '출근하자마자 하는 일은?', options: [{ text: 'To-do 리스트 작성', type: '워크홀릭' }, { text: '커피 마시며 루팡 대기', type: '자유영혼' }] }
        ]
    },

    // --- 얼굴 카테고리 ---
    { 
        id: 'personal-color', 
        category: '얼굴', 
        title: '퍼스널 컬러 자가진단', 
        desc: '나에게 가장 잘 어울리는 색은? 웜톤 vs 쿨톤 분석', 
        thumb: 'https://images.unsplash.com/photo-1523260572679-8e2fe22281fe?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '금액세서리 vs 은액세서리?', options: [{ text: '금색이 더 잘 어울린다', type: 'Warm' }, { text: '은색이 더 잘 어울린다', type: 'Cool' }] },
            { q: '오렌지 립 vs 핑크 립?', options: [{ text: '상큼한 오렌지', type: 'Warm' }, { text: '화사한 핑크', type: 'Cool' }] }
        ]
    },
    { 
        id: 'animal-look', 
        category: '얼굴', 
        title: '닮은꼴 동물 테스트', 
        desc: '강아지상? 고양이상? 나의 이미지 동물 찾기', 
        thumb: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '나의 눈매는 어떤 편인가요?', options: [{ text: '동글동글 순한 편', type: '강아지' }, { text: '날카롭고 시크한 편', type: '고양이' }] }
        ]
    },

    // --- 사주 카테고리 ---
    { 
        id: 'money-luck', 
        category: '사주', 
        title: '이번 주 금전운 테스트', 
        desc: '내 지갑은 두둑해질까? 가볍게 보는 주간 재물운', 
        thumb: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '길을 가다 만 원을 줍는다면?', options: [{ text: '오늘 운이 좋네! 맛있는 거 먹자', type: '상승' }, { text: '주인을 찾아줄까? 저축할까?', type: '유지' }] }
        ]
    },
    { 
        id: 'lucky-place', 
        category: '사주', 
        title: '오늘의 행운 장소', 
        desc: '나의 운기를 높여줄 오늘 최고의 장소는?', 
        thumb: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '지금 가장 떠오르는 이미지는?', options: [{ text: '나무와 숲', type: 'Nature' }, { text: '화려한 불빛', type: 'City' }] }
        ]
    },

    // --- 그외 카테고리 ---
    { 
        id: 'balance-game', 
        category: '그외', 
        title: '극강의 밸런스 게임', 
        desc: '도저히 고를 수 없다! 당신의 최종 선택은?', 
        thumb: 'https://images.unsplash.com/photo-1509228468518-180dd48a5db5?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '평생 하나만 한다면?', options: [{ text: '여름에 에어컨 없이 살기', type: 'A' }, { text: '겨울에 히터 없이 살기', type: 'B' }] },
            { q: '더 나쁜 상황은?', options: [{ text: '친구랑 절교하기', type: 'A' }, { text: '애인이랑 헤어지기', type: 'B' }] }
        ]
    },
    { 
        id: 'past-life', 
        category: '그외', 
        title: '나의 전생 체험 테스트', 
        desc: '전생에 나는 왕이었을까? 재미로 보는 전생 찾기', 
        thumb: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '꿈속에서 당신은 어디에 있나요?', options: [{ text: '거대한 궁궐', type: '왕족' }, { text: '평화로운 시골 마을', type: '평민' }] }
        ]
    },
    { 
        id: 'dessert-soul', 
        category: '그외', 
        title: '디저트로 본 나의 성격', 
        desc: '달콤한 디저트에 비유한 나의 매력 지수', 
        thumb: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '가장 좋아하는 맛은?', options: [{ text: '진하고 묵직한 단맛', type: '초코' }, { text: '상큼하고 가벼운 맛', type: '레몬' }] }
        ]
    },
    { 
        id: 'hobby-finder', 
        category: '그외', 
        title: '인생 취미 찾기 테스트', 
        desc: '무료한 일상, 나에게 딱 맞는 취미를 추천해 드려요.', 
        thumb: 'https://images.unsplash.com/photo-1520156582985-31368ad1a1b1?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '몸을 움직이는 걸 좋아하나요?', options: [{ text: '땀 흘리는 운동이 최고', type: 'Active' }, { text: '앉아서 사부작대는 게 최고', type: 'Creative' }] }
        ]
    }
];

let currentFilter = '전체';

// 라우터
function router() {
    const hash = window.location.hash || '#home';
    
    // 네비게이션 활성화 표시
    navLinks.forEach(link => {
        const filter = link.dataset.filter;
        link.classList.toggle('active', hash.includes(filter.toLowerCase()) || (hash === '#home' && filter === '전체'));
    });

    if (hash.startsWith('#test/')) {
        const testId = hash.split('/')[1];
        renderTestExecution(testId);
    } else {
        const filterMap = { '#personality': '성격', '#face': '얼굴', '#fun': '그외', '#fortune': '사주' };
        currentFilter = filterMap[hash] || '전체';
        renderHome();
    }
    window.scrollTo(0, 0);
}

// 홈 화면 렌더링
function renderHome() {
    const filteredTests = currentFilter === '전체' 
        ? TESTS 
        : TESTS.filter(t => t.category === currentFilter);

    app.innerHTML = `
        <div class="ad-slot">상단 광고 (AdSense)</div>
        
        <section class="portal-hero fade-in">
            <h1>심플 테스트 포털</h1>
            <p>MBTI, 운세, 재미있는 심리테스트를 즐겨보세요!</p>
        </section>

        <div class="search-bar fade-in">
            <input type="text" id="search-input" class="input-search" placeholder="궁금한 테스트를 검색해보세요">
        </div>

        <div class="test-grid">
            ${filteredTests.map(test => `
                <a href="#test/${test.id}" class="test-card fade-in">
                    <div class="test-thumb" style="background-image: url('${test.thumb}')"></div>
                    <div class="test-info">
                        <span class="test-category">${test.category}</span>
                        <h3>${test.title}</h3>
                        <p>${test.desc}</p>
                    </div>
                </a>
            `).join('')}
        </div>

        <div class="ad-slot">하단 광고 (AdSense)</div>
    `;

    document.getElementById('search-input').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.test-card');
        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            card.style.display = title.includes(keyword) ? 'block' : 'none';
        });
    });
}

// 테스트 실행 화면
function renderTestExecution(testId) {
    const test = TESTS.find(t => t.id === testId);
    if (!test) { window.location.hash = '#home'; return; }

    let step = 0;
    const answers = [];

    const updateStep = () => {
        const progress = ((step + 1) / test.questions.length) * 100;
        const currentQ = test.questions[step];

        app.innerHTML = `
            <div class="ad-slot">상단 광고 (AdSense)</div>
            <div class="test-execution fade-in">
                <div class="progress-bar">
                    <div class="progress-inner" style="width: ${progress}%"></div>
                </div>
                <div class="q-box">
                    <span class="test-category">${test.title}</span>
                    <h2 style="margin-top:1rem;">Q${step + 1}. ${currentQ.q}</h2>
                </div>
                <div class="options">
                    ${currentQ.options.map((opt, idx) => `
                        <button class="option-btn" data-type="${opt.type}">${opt.text}</button>
                    `).join('')}
                </div>
            </div>
            <div class="ad-slot">하단 광고 (AdSense)</div>
        `;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => {
                answers.push(btn.dataset.type);
                if (step < test.questions.length - 1) {
                    step++;
                    updateStep();
                } else {
                    renderResult(testId, answers);
                }
            };
        });
    };

    updateStep();
}

// 결과 화면
function renderResult(testId, answers) {
    const test = TESTS.find(t => t.id === testId);
    const resultType = answers.sort((a, b) => 
        answers.filter(v => v === a).length - answers.filter(v => v === b).length
    ).pop();

    app.innerHTML = `
        <div class="ad-slot">상단 광고 (AdSense)</div>
        <div class="result-card test-execution fade-in">
            <span class="test-category">테스트 완료!</span>
            <h2 class="result-title">당신은 [${resultType}] 유형!</h2>
            <p class="result-desc">${test.title} 분석 결과, 당신은 매우 독특하고 긍정적인 에너지를 가진 사람으로 나타났습니다. 친구들에게도 공유해 보세요!</p>
            <div class="result-actions">
                <button class="btn btn-primary" style="width:100%; margin-bottom:0.5rem;" onclick="location.hash='#home'">다른 테스트 하러 가기</button>
                <button class="btn btn-secondary" style="width:100%;" onclick="copyResult()">결과 링크 복사하기</button>
            </div>
        </div>
        <div class="ad-slot">전면 광고 대기 영역</div>
    `;
}

function copyResult() {
    navigator.clipboard.writeText(window.location.href);
    alert('결과 링크가 복사되었습니다!');
}

// 테마 변경
themeToggle.onclick = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
