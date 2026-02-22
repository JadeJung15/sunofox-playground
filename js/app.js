// js/app.js
const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

// 테스트 데이터베이스 (10가지 애니메이션 스타일 테스트)
const TESTS = [
    { 
        id: 'hero-origin', 
        category: '성격', 
        title: '판타지 세계 나의 직업', 
        desc: '이세계에 소환된 당신, 어떤 클래스로 전직할까요?', 
        thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '길을 가다 마주친 몬스터! 첫 행동은?', options: [{ text: '검을 뽑아 돌진한다', type: 'A' }, { text: '거리를 두며 마법 주문을 외운다', type: 'B' }] },
            { q: '동료를 한 명 영입한다면?', options: [{ text: '나를 지켜줄 든든한 방패 기사', type: 'A' }, { text: '강력한 파괴력을 가진 흑마법사', type: 'B' }] },
            { q: '가장 탐나는 보물은?', options: [{ text: '전설의 성검', type: 'A' }, { text: '지혜의 마법 지팡이', type: 'B' }] },
            { q: '당신이 선호하는 전투 방식은?', options: [{ text: '근접전에서 느끼는 타격감', type: 'A' }, { text: '후방에서 지원하는 지략전', type: 'B' }] },
            { q: '마을 사람들이 도움을 요청한다.', options: [{ text: '직접 몸을 써서 해결해준다', type: 'A' }, { text: '마법 장치나 도구로 도와준다', type: 'B' }] },
            { q: '나의 가장 큰 장점은?', options: [{ text: '지치지 않는 체력과 용기', type: 'A' }, { text: '명석한 두뇌와 판단력', type: 'B' }] },
            { q: '최종 보스와의 대결에서?', options: [{ text: '정면 돌파로 승부한다', type: 'A' }, { text: '약점을 노려 한 방에 끝낸다', type: 'B' }] }
        ],
        results: {
            A: { title: '용맹한 성기사', desc: '당신은 정의감이 넘치고 행동력이 뛰어납니다. 항상 앞장서서 동료들을 이끄는 리더 타입이군요!' },
            B: { title: '대현자 마법사', desc: '냉철한 판단력과 깊은 지식을 가진 당신은 전략적인 사고에 능합니다. 세상을 바꿀 지혜의 소유자입니다.' }
        }
    },
    { 
        id: 'school-life', 
        category: '성격', 
        title: '하이틴 애니 속 나의 역할', 
        desc: '학교 배경 애니메이션에서 나는 어떤 캐릭터일까?', 
        thumb: 'https://images.unsplash.com/photo-1523050853061-850013fca462?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '등굣길, 당신의 모습은?', options: [{ text: '친구들과 수다 떨며 즐겁게', type: 'A' }, { text: '이어폰을 끼고 혼자 차분하게', type: 'B' }] },
            { q: '점심시간에 당신은 어디에?', options: [{ text: '매점이나 운동장에서 활발하게', type: 'A' }, { text: '교실이나 도서관에서 조용히', type: 'B' }] },
            { q: '동아리를 선택한다면?', options: [{ text: '활동적인 밴드부나 운동부', type: 'A' }, { text: '감성적인 미술부나 독서부', type: 'B' }] },
            { q: '발표 수업 시간이 다가왔다.', options: [{ text: '자신 있게 나가서 발표한다', type: 'A' }, { text: '원고를 꼼꼼히 준비해 차분히 읽는다', type: 'B' }] },
            { q: '축제 때 당신이 맡을 역할은?', options: [{ text: '무대 위 주인공', type: 'A' }, { text: '무대 뒤 든든한 스태프', type: 'B' }] },
            { q: '친구가 고민 상담을 요청하면?', options: [{ text: '함께 놀러 나가 기분을 풀어준다', type: 'A' }, { text: '조용히 들어주며 공감해준다', type: 'B' }] },
            { q: '방과 후 나의 일상은?', options: [{ text: '친구들과 시내에서 즐거운 시간', type: 'B' }, { text: '집에서 혼자만의 충전 시간', type: 'B' }] }
        ],
        results: {
            A: { title: '인기 만점 주인공', desc: '어디서나 주목받는 밝은 에너지를 가진 당신! 주변 사람들을 행복하게 만드는 능력이 있네요.' },
            B: { title: '신비로운 전학생', desc: '차분하고 생각이 깊은 당신은 남들이 모르는 독특한 매력을 지니고 있습니다. 관찰력이 매우 뛰어나군요.' }
        }
    },
    { 
        id: 'element-power', 
        category: '감성', 
        title: '나를 상징하는 원소 테스트', 
        desc: '불, 물, 바람, 흙 중 당신의 영혼은 무엇을 닮았나요?', 
        thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '좋아하는 계절은?', options: [{ text: '뜨거운 열정의 여름', type: 'Fire' }, { text: '차분하고 맑은 가을', type: 'Water' }] },
            { q: '가장 끌리는 풍경은?', options: [{ text: '타오르는 노을', type: 'Fire' }, { text: '끝없이 펼쳐진 바다', type: 'Water' }] },
            { q: '화가 났을 때 당신은?', options: [{ text: '금방 뜨거워졌다가 식는다', type: 'Fire' }, { text: '차갑게 가라앉으며 생각한다', type: 'Water' }] },
            { q: '선호하는 색상 톤은?', options: [{ text: '강렬한 붉은색 계열', type: 'Fire' }, { text: '평온한 푸른색 계열', type: 'Water' }] },
            { q: '휴식을 취할 때?', options: [{ text: '땀을 흘리며 활동적으로', type: 'Fire' }, { text: '반신욕이나 명상을 하며', type: 'Water' }] },
            { q: '도전적인 상황이 오면?', options: [{ text: '열정으로 맞서 싸운다', type: 'Fire' }, { text: '유연하게 흘려보낸다', type: 'Water' }] },
            { q: '당신을 한 단어로 표현하면?', options: [{ text: '열정(Passion)', type: 'Fire' }, { text: '정화(Pure)', type: 'Water' }] }
        ],
        results: {
            Fire: { title: '타오르는 불꽃의 영혼', desc: '당신은 주도적이고 열정적인 사람입니다. 목표가 생기면 누구보다 뜨겁게 타올라 성취해내는군요!' },
            Water: { title: '고요한 푸른 물결의 영혼', desc: '당신은 유연하고 포용력이 넓은 사람입니다. 주변 사람들을 편안하게 감싸주는 치유의 에너지를 가졌네요.' }
        }
    },
    { 
        id: 'magic-pet', 
        category: '감성', 
        title: '나의 수호 정령 찾기', 
        desc: '내 곁을 지켜줄 특별한 영적 파트너는 누구일까요?', 
        thumb: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '동물 중에서 더 끌리는 쪽은?', options: [{ text: '민첩한 여우', type: 'A' }, { text: '영리한 부엉이', type: 'B' }] },
            { q: '밤하늘을 볼 때 찾는 것은?', options: [{ text: '반짝이는 별자리', type: 'A' }, { text: '은은한 달빛', type: 'B' }] },
            { q: '당신이 좋아하는 시간대는?', options: [{ text: '활기찬 오후', type: 'A' }, { text: '신비로운 자정', type: 'B' }] },
            { q: '숲속에서 길을 잃었다면?', options: [{ text: '직감을 믿고 나아간다', type: 'A' }, { text: '흔적을 분석하며 길을 찾는다', type: 'B' }] },
            { q: '어떤 초능력이 탐나나요?', options: [{ text: '순간이동', type: 'A' }, { text: '시간 정지', type: 'B' }] },
            { q: '당신의 방 스타일은?', options: [{ text: '다양한 소품으로 꾸민 방', type: 'A' }, { text: '필요한 것만 있는 미니멀 방', type: 'B' }] },
            { q: '꿈을 자주 꾸시나요?', options: [{ text: '모험이 가득한 화려한 꿈', type: 'A' }, { text: '잔잔하고 기억에 남는 꿈', type: 'B' }] }
        ],
        results: {
            A: { title: '신비로운 구미호 정령', desc: '변화무쌍하고 매력적인 당신! 임기응변에 강하고 어디서나 잘 적응하는 영리함을 가졌습니다.' },
            B: { title: '지혜로운 수호 부엉이', desc: '깊은 통찰력과 인내심을 가진 당신! 남들이 보지 못하는 본질을 꿰뚫어 보는 힘이 있군요.' }
        }
    },
    // ... 추가 6가지 테스트 데이터 (구조 동일하게 확장)
    { id: 'mbti-travel', category: '성격', title: '7번으로 정하는 여행지', desc: '나의 성향에 딱 맞는 애니 속 여행지는?', thumb: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=500&q=60', questions: [ {q:'1', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'2', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'3', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'4', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'5', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'6', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'7', options:[{text:'A', type:'A'},{text:'B', type:'B'}]} ], results: { A:{title:'하늘 위의 섬', desc:'자유를 갈망하는 당신에게 딱!'}, B:{title:'비밀의 숲', desc:'휴식이 필요한 당신에게 최고!'} } },
    { id: 'dessert-soul', category: '감성', title: '나의 디저트 소울메이트', desc: '달콤한 디저트로 알아보는 나의 매력 점수', thumb: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=60', questions: [ {q:'1', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'2', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'3', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'4', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'5', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'6', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'7', options:[{text:'A', type:'A'},{text:'B', type:'B'}]} ], results: { A:{title:'달콤한 마카롱', desc:'다채로운 매력을 가진 당신!'}, B:{title:'진한 초콜릿', desc:'깊고 묵직한 존재감이 있네요.'} } },
    { id: 'spirit-animal', category: '성격', title: '나의 스피릿 애니멀', desc: '7번의 선택으로 만나는 나의 내면 동물', thumb: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=500&q=60', questions: [ {q:'1', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'2', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'3', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'4', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'5', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'6', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'7', options:[{text:'A', type:'A'},{text:'B', type:'B'}]} ], results: { A:{title:'용감한 사자', desc:'자신감이 넘치는 리더입니다.'}, B:{title:'지혜로운 돌고래', desc:'사교적이고 평화로운 사람입니다.'} } },
    { id: 'magic-shop', category: '감성', title: '비밀 마법 상점', desc: '당신이 고른 7개의 물건이 말해주는 미래', thumb: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=500&q=60', questions: [ {q:'1', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'2', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'3', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'4', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'5', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'6', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'7', options:[{text:'A', type:'A'},{text:'B', type:'B'}]} ], results: { A:{title:'행운의 열쇠', desc:'새로운 기회가 찾아올 거예요!'}, B:{title:'수호의 방패', desc:'당신을 지켜주는 힘이 생깁니다.'} } },
    { id: 'zodiac-anime', category: '사주', title: '애니로 보는 주간 운세', desc: '이번 주 당신에게 일어날 마법 같은 일', thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=60', questions: [ {q:'1', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'2', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'3', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'4', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'5', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'6', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'7', options:[{text:'A', type:'A'},{text:'B', type:'B'}]} ], results: { A:{title:'대성공의 기운', desc:'원하던 바를 이루게 될 주간입니다.'}, B:{title:'소소한 행복', desc:'작지만 소중한 기쁨이 가득합니다.'} } },
    { id: 'fashion-style', category: '감성', title: '나의 애니 코디 스타일', desc: '나에게 가장 잘 어울리는 캐릭터 패션은?', thumb: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=60', questions: [ {q:'1', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'2', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'3', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'4', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'5', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'6', options:[{text:'A', type:'A'},{text:'B', type:'B'}]}, {q:'7', options:[{text:'A', type:'A'},{text:'B', type:'B'}]} ], results: { A:{title:'스포티 스트릿', desc:'활동적이고 에너제틱한 스타일!'}, B:{title:'클래식 모던', desc:'깔끔하고 세련된 분위기의 스타일!'} } }
];

let currentFilter = '전체';

// 라우터
function router() {
    const hash = window.location.hash || '#home';
    navLinks.forEach(link => {
        const filter = link.dataset.filter;
        link.classList.toggle('active', (hash === '#home' && filter === '전체') || hash.includes(filter.toLowerCase()));
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
        <div class="ad-slot">AD SPACE - 메인 상단</div>
        <section class="portal-hero">
            <h1><span>7</span>Check</h1>
            <p>딱 7번의 선택으로 확인하는 나의 모든 것</p>
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
        <div class="ad-slot">AD SPACE - 메인 하단</div>
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
            <div class="ad-slot">AD SPACE - 테스트 중 상단</div>
            <div class="test-execution fade-in">
                <div class="progress-container">
                    <div class="step-dots">
                        ${Array.from({length: 7}).map((_, i) => `<div class="dot ${i <= step ? 'active' : ''}"></div>`).join('')}
                    </div>
                </div>
                <h2 style="font-size:1.5rem; margin-bottom:2rem;">Q${step + 1}. ${currentQ.q}</h2>
                <div class="options">
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
    // 가장 많이 나온 타입 계산
    const counts = answers.reduce((acc, type) => { acc[type] = (acc[type] || 0) + 1; return acc; }, {});
    const winningType = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    const result = test.results[winningType];

    app.innerHTML = `
        <div class="ad-slot">AD SPACE - 결과 상단</div>
        <div class="result-card fade-in">
            <span class="test-category">SevenCheck 분석 완료</span>
            <div class="result-img" style="background-image: url('${test.thumb}'); background-size: cover;"></div>
            <h2 style="font-size:2rem; color:var(--accent-color); margin-bottom:1rem;">당신은 [${result.title}]</h2>
            <p style="font-size:1.1rem; line-height:1.8; margin-bottom:2rem; word-break:keep-all;">${result.desc}</p>
            
            <div class="share-grid">
                <button class="btn-share" id="share-web">SNS 공유하기</button>
                <button class="btn-share btn-copy" id="share-copy">링크 복사</button>
            </div>
            
            <button class="btn-share" style="width:100%; margin-top:1rem; background:var(--text-main);" onclick="location.hash='#home'">다른 테스트 더 보기</button>
        </div>
        <div class="ad-slot">AD SPACE - 결과 하단</div>
    `;

    document.getElementById('share-copy').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다! 친구들에게 공유해보세요.');
    };

    document.getElementById('share-web').onclick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SevenCheck - 나의 결과',
                    text: `나의 결과는 [${result.title}]! 당신의 타입도 7번의 질문으로 확인해보세요.`,
                    url: window.location.href,
                });
            } catch (err) { console.log(err); }
        } else { alert('공유하기를 지원하지 않는 브라우저입니다. 링크 복사를 이용해주세요!'); }
    };
}

themeToggle.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '✨';
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
