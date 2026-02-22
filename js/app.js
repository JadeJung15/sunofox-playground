// js/app.js
import { auth } from './firebase-init.js';

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

// 테스트 데이터베이스
const TESTS = [
    { 
        id: 'fan-style', 
        category: '성격', 
        title: '나의 덕질 성향 테스트', 
        desc: '나는 어떤 유형의 팬일까? 나의 감상 스타일을 확인해보세요.', 
        thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '새로운 영상을 발견했을 때 나는?', options: [{ text: '일단 바로 본다', type: 'E' }, { text: '나중에 볼 목록에 저장한다', type: 'I' }] },
            { q: '좋아하는 장면에 대한 나의 반응은?', options: [{ text: '댓글로 주접을 떤다', type: 'E' }, { text: '조용히 무한 반복 재생한다', type: 'I' }] }
        ]
    },
    { 
        id: 'daily-luck', 
        category: '사주', 
        title: '오늘의 행운 컬러 테스트', 
        desc: '오늘 나에게 행운을 가져다줄 색깔은 무엇일까요?', 
        thumb: 'https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '지금 기분은 어떤가요?', options: [{ text: '활기차다', type: 'Red' }, { text: '차분하다', type: 'Blue' }] },
            { q: '어디로 떠나고 싶나요?', options: [{ text: '바다', type: 'Blue' }, { text: '도시', type: 'Red' }] }
        ]
    },
    { 
        id: 'mbti-food', 
        category: '그외', 
        title: '음식으로 보는 나의 성격', 
        desc: '내가 만약 음식이라면? 맛있는 성격 테스트!', 
        thumb: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '배고플 때 나는?', options: [{ text: '눈에 보이는 걸 먹는다', type: 'P' }, { text: '맛집을 검색해서 간다', type: 'J' }] }
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
}

// 홈 화면 렌더링
function renderHome() {
    const filteredTests = currentFilter === '전체' 
        ? TESTS 
        : TESTS.filter(t => t.category === currentFilter);

    app.innerHTML = `
        <div class="ad-slot">상단 광고 영역</div>
        
        <section class="portal-hero fade-in">
            <h1>심플 테스트 포털</h1>
            <p>매일매일 업데이트되는 새로운 재미!</p>
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

        <div class="ad-slot">하단 광고 영역</div>
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
            <div class="ad-slot">상단 광고 영역</div>
            <div class="test-execution fade-in">
                <div class="progress-bar">
                    <div class="progress-inner" style="width: ${progress}%"></div>
                </div>
                <div class="q-box">
                    <h2>Q${step + 1}. ${currentQ.q}</h2>
                </div>
                <div class="options">
                    ${currentQ.options.map((opt, idx) => `
                        <button class="option-btn" data-type="${opt.type}">${opt.text}</button>
                    `).join('')}
                </div>
            </div>
            <div class="ad-slot">하단 광고 영역</div>
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
    // 간단한 결과 계산 로직 (가장 많이 나온 타입 선택)
    const resultType = answers.sort((a, b) => 
        answers.filter(v => v === a).length - answers.filter(v => v === b).length
    ).pop();

    app.innerHTML = `
        <div class="ad-slot">상단 광고 영역</div>
        <div class="result-card test-execution fade-in">
            <span class="test-category">테스트 결과</span>
            <h2 class="result-title">당신은 [${resultType}] 유형!</h2>
            <p class="result-desc">${test.title}의 결과, 당신은 매우 독특한 매력을 가진 사람으로 나타났습니다.</p>
            <div class="hero-actions">
                <button class="btn btn-primary" onclick="location.hash='#home'">다른 테스트 하기</button>
                <button class="btn btn-secondary" onclick="alert('결과가 복사되었습니다!')">결과 공유하기</button>
            </div>
        </div>
        <div class="ad-slot">하단 광고 영역</div>
    `;
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
