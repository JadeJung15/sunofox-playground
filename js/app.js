// js/app.js
const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

// 테스트 데이터베이스 (7문 7답 시스템 & Anime Style)
const TESTS = [
    { 
        id: 'anime-soul', 
        category: '성격', 
        title: '나의 애니 속 캐릭터 타입', 
        desc: '7번의 질문으로 알아보는 나의 만화 속 페르소나', 
        thumb: 'https://images.unsplash.com/photo-1578632738908-4521c442075a?auto=format&fit=crop&w=500&q=80',
        questions: [
            { q: '낯선 세계에서 눈을 떴을 때, 첫 반응은?', options: [{ text: '일단 주변을 탐색하며 동료를 찾는다', type: 'Protagonist' }, { text: '조용히 상황을 파악하며 혼자 움직인다', type: 'Shadow' }] },
            { q: '위기에 처한 마을을 발견했다. 당신은?', options: [{ text: '주저 없이 앞장서서 도와준다', type: 'Protagonist' }, { text: '효율적인 해결책을 고민한 뒤 움직인다', type: 'Shadow' }] },
            { q: '가장 소중하게 생각하는 가치는?', options: [{ text: '우정과 유대감', type: 'Protagonist' }, { text: '자유와 실력', type: 'Shadow' }] },
            { q: '휴식 시간에 하고 싶은 일은?', options: [{ text: '친구들과 시끌벅적 파티', type: 'Protagonist' }, { text: '조용한 숲속에서 명상', type: 'Shadow' }] },
            { q: '라이벌이 나타났다. 당신의 태도는?', options: [{ text: '선의의 경쟁을 하며 함께 성장한다', type: 'Protagonist' }, { text: '그의 약점을 파악해 압도한다', type: 'Shadow' }] },
            { q: '어떤 능력을 갖고 싶은가?', options: [{ text: '모두를 지키는 방어력', type: 'Protagonist' }, { text: '누구도 막지 못하는 파괴력', type: 'Shadow' }] },
            { q: '최종 결전의 순간, 당신의 선택은?', options: [{ text: '희망을 믿고 끝까지 싸운다', type: 'Protagonist' }, { text: '냉정하게 승산이 있는 길을 택한다', type: 'Shadow' }] }
        ]
    },
    { 
        id: 'pastel-mood', 
        category: '감성', 
        title: '나의 오늘의 오라(Aura) 컬러', 
        desc: '7번의 감성 선택으로 확인하는 나의 현재 무드', 
        thumb: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=500&q=80',
        questions: [
            { q: '가장 끌리는 하늘의 모습은?', options: [{ text: '해 질 녘 노을', type: 'Warm' }, { text: '새벽녘 푸른 빛', type: 'Cool' }] },
            { q: '어떤 향기가 더 좋은가요?', options: [{ text: '달콤한 꽃향기', type: 'Warm' }, { text: '싱그러운 풀내음', type: 'Cool' }] },
            { q: '지금 듣고 싶은 음악은?', options: [{ text: '신나는 비트', type: 'Warm' }, { text: '잔잔한 피아노', type: 'Cool' }] },
            { q: '방 꾸미기를 한다면?', options: [{ text: '따뜻한 노란 조명', type: 'Warm' }, { text: '깔끔한 화이트 톤', type: 'Cool' }] },
            { q: '여행을 간다면 가고 싶은 곳은?', options: [{ text: '활기찬 휴양지', type: 'Warm' }, { text: '고요한 설산', type: 'Cool' }] },
            { q: '친구에게 건네는 한마디?', options: [{ text: '힘내! 다 잘 될 거야', type: 'Warm' }, { text: '무슨 일이야? 차근차근 말해봐', type: 'Cool' }] },
            { q: '오늘의 나에게 어울리는 수식어는?', options: [{ text: '빛나는', type: 'Warm' }, { text: '깊이 있는', type: 'Cool' }] }
        ]
    }
];

let currentFilter = '전체';

function router() {
    const hash = window.location.hash || '#home';
    navLinks.forEach(link => {
        const filter = link.dataset.filter;
        link.classList.toggle('active', hash.includes(filter.toLowerCase()) || (hash === '#home' && filter === '전체'));
    });

    if (hash.startsWith('#test/')) {
        renderTestExecution(hash.split('/')[1]);
    } else {
        const filterMap = { '#personality': '성격', '#face': '감성', '#fortune': '사주' };
        currentFilter = filterMap[hash] || '전체';
        renderHome();
    }
    window.scrollTo(0, 0);
}

function renderHome() {
    const filtered = currentFilter === '전체' ? TESTS : TESTS.filter(t => t.category === currentFilter);
    app.innerHTML = `
        <div class="ad-slot">AD SPACE (TOP)</div>
        <section class="portal-hero">
            <h1><span>7</span>Check</h1>
            <p>7번의 질문으로 확인하는 나의 모든 것</p>
        </section>
        <div class="test-grid">
            ${filtered.map(t => `
                <a href="#test/${t.id}" class="test-card fade-in">
                    <div class="test-thumb" style="background-image: url('${t.thumb}')"></div>
                    <div class="test-info">
                        <h3>${t.title}</h3>
                        <p>${t.desc}</p>
                    </div>
                </a>
            `).join('')}
        </div>
        <div class="ad-slot">AD SPACE (BOTTOM)</div>
    `;
}

function renderTestExecution(testId) {
    const test = TESTS.find(t => t.id === testId);
    if (!test) return location.hash = '#home';

    let step = 0;
    const answers = [];

    const updateStep = () => {
        const currentQ = test.questions[step];
        app.innerHTML = `
            <div class="ad-slot">AD SPACE (MID)</div>
            <div class="test-execution fade-in">
                <div class="progress-container">
                    <div class="step-dots">
                        ${Array.from({length: 7}).map((_, i) => `<div class="dot ${i <= step ? 'active' : ''}"></div>`).join('')}
                    </div>
                </div>
                <h2>Q${step + 1}. ${currentQ.q}</h2>
                <div class="options" style="margin-top:2rem;">
                    ${currentQ.options.map(opt => `<button class="option-btn" data-type="${opt.type}">${opt.text}</button>`).join('')}
                </div>
            </div>
        `;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => {
                answers.push(btn.dataset.type);
                if (step < 6) {
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

function renderResult(testId, answers) {
    const test = TESTS.find(t => t.id === testId);
    const resultType = answers.sort((a,b) => answers.filter(v => v===a).length - answers.filter(v => v===b).length).pop();

    app.innerHTML = `
        <div class="ad-slot">AD SPACE (RESULT TOP)</div>
        <div class="result-card fade-in">
            <span class="test-category">7 Check 완료!</span>
            <h2 style="margin:1rem 0; font-size:2rem;">당신은 [${resultType}] 타입</h2>
            <p style="color:var(--text-sub);">7번의 질문을 통해 분석한 당신의 가장 가까운 모습입니다. 분석 결과 당신은 조화롭고 창의적인 에너지를 가지고 있습니다.</p>
            
            <div class="share-grid">
                <button class="btn-share" id="share-web">카카오톡 공유</button>
                <button class="btn-share btn-copy" id="share-copy">링크 복사하기</button>
            </div>
            
            <button class="btn-share" style="width:100%; margin-top:1rem; background:#4a4a4a;" onclick="location.hash='#home'">다른 테스트 하기</button>
        </div>
        <div class="ad-slot">AD SPACE (RESULT BOTTOM)</div>
    `;

    document.getElementById('share-copy').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다! 친구들에게 공유해보세요.');
    };

    document.getElementById('share-web').onclick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SevenCheck - 결과 확인',
                    text: `나의 테스트 결과는 [${resultType}]! 당신도 확인해보세요.`,
                    url: window.location.href,
                });
            } catch (err) { console.log('Error sharing', err); }
        } else {
            alert('링크를 복사해 공유해 주세요!');
        }
    };
}

themeToggle.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '✨';
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
