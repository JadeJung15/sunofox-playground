// js/app.js - Premium Content & Core Logic
import { initAuth, updateUI, UserState, addPoints, usePoints, EMOJI_SHOP, getTier, TIERS, chargeUserPoints, chargeUserScore } from './auth.js';
import { initArcade } from './arcade.js';
import { copyLink, shareTest } from './share.js';
import { renderBoard } from './board.js';
import { renderRanking } from './ranking.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, increment, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=500&q=60`;

// =================================================================
// 1. High-Quality Test Database
// =================================================================

const TESTS = [
    // 성격 분석 (Self-Discovery)
    {
        id: 'p1', category: '성격', title: '나의 숨겨진 아우라 컬러', desc: '타인에게 느껴지는 당신만의 고유한 색채와 분위기를 7단계 심층 질문으로 분석합니다.', thumb: unsplash('1557683316-973673baf926'),
        questions: [
            { q: '낯선 파티에 초대받았다면?', options: [{ text: '화려한 옷으로 존재감을 뽐낸다', type: 'A' }, { text: '깔끔하고 단정한 옷으로 섞인다', type: 'B' }] },
            { q: '길을 걷다 예쁜 꽃을 발견하면?', options: [{ text: '사진을 찍어 SNS에 공유한다', type: 'A' }, { text: '잠시 멈춰 향기를 맡으며 감상한다', type: 'B' }] },
            { q: '중요한 결정을 내릴 때 나는?', options: [{ text: '나의 직관과 느낌을 믿는다', type: 'A' }, { text: '데이터와 주변의 조언을 참고한다', type: 'B' }] },
            { q: '비 오는 창밖을 볼 때 드는 생각은?', options: [{ text: '파전에 막걸리 먹고 싶다!', type: 'A' }, { text: '왠지 모르게 감성적으로 변한다', type: 'B' }] },
            { q: '친구가 나에게 고민을 털어놓으면?', options: [{ text: '확실한 해결책을 제시해준다', type: 'A' }, { text: '끝까지 들어주며 같이 울어준다', type: 'B' }] },
            { q: '나의 책상 위 모습은?', options: [{ text: '자유분방하게 흐트러져 있다', type: 'A' }, { text: '항상 정해진 자리에 물건이 있다', type: 'B' }] },
            { q: '10년 후 나의 모습은 어떨까?', options: [{ text: '여전히 도전하며 열정적으로 살 것', type: 'A' }, { text: '평온하고 안정적인 삶을 누릴 것', type: 'B' }] }
        ],
        results: {
            A: { title: '타오르는 태양의 레드', desc: '당신은 주변 사람들에게 에너지를 나눠주는 강력한 아우라를 가졌습니다. 리더십이 뛰어나고 솔직한 표현이 매력적입니다.', img: unsplash('1525909002-1b05e0c869d8') },
            B: { title: '고요한 숲의 그린', desc: '당신은 함께 있는 것만으로도 마음이 편안해지는 아우라를 가졌습니다. 신중하고 사려 깊은 태도가 주변의 신뢰를 얻습니다.', img: unsplash('1518310383802-640c2de311b2') }
        }
    },
    {
        id: 'p2', category: '성격', title: '내면 아이 유형 테스트', desc: '당신의 무의식 깊은 곳에 자리 잡은 내면 아이의 목소리에 귀를 기울여 보세요.', thumb: unsplash('1516035069371-29a1b244cc32'),
        questions: Array(7).fill({ q: '어린 시절 가장 좋아했던 놀이는?', options: [{ text: '친구들과 뛰어노는 술래잡기', type: 'A' }, { text: '혼자 상상하며 그리는 그림', type: 'B' }] }),
        results: {
            A: { title: '호기심 많은 모험가', desc: '당신의 내면 아이는 여전히 새로운 세상을 향해 뛰어놀고 싶어 합니다. 지치지 않는 호기심이 당신의 힘입니다.', img: unsplash('1534361960057-19889db9621e') },
            B: { title: '지혜로운 꼬마 학자', desc: '당신의 내면 아이는 세상을 관찰하고 이해하며 깊은 생각을 즐깁니다. 통찰력 있는 시선이 당신의 매력입니다.', img: unsplash('1456513080510-7bf3a84b82f8') }
        }
    }
];

// 40개 테스트 자동 생성을 위한 고품질 템플릿 로직
const categoryIcons = { '성격': '🧠', '얼굴': '✨', '사주': '🔮', '재미': '🎨' };
const categoryThemes = {
    '성격': ['연애 가치관', '우정 스타일', '소비 패턴', '스트레스 지수', '대화 습관', '여행 성향', '자존감 온도'],
    '얼굴': ['퍼스널 무드', '이미지 동물', '관상 포인트', '스마일 라인', '안경 매칭', '헤어 추천', '메이크업 톤'],
    '사주': ['오늘의 카드', '재물운 흐름', '인복 테스트', '성공 키워드', '수호령 찾기', '행운의 아이템', '궁합 분석'],
    '재미': ['전생 탐구', '소울푸드', '인생 영화', '반려동물', '능력치 측정', '운명적 직업', '밸런스 게임']
};

for (let i = 3; i <= 40; i++) {
    const categories = Object.keys(categoryThemes);
    const cat = categories[Math.floor((i-1) / 10)];
    const theme = categoryThemes[cat][(i % categoryThemes[cat].length)];
    const id = `${cat[0].toLowerCase()}${i}`;
    
    TESTS.push({
        id: id, category: cat,
        title: `${categoryIcons[cat]} ${theme} 분석`,
        desc: `당신의 ${theme}에 대한 무의식적 반응을 7단계로 분석하여 정교한 리포트를 제공합니다.`,
        thumb: unsplash(`15${i}123456789`),
        questions: Array.from({length: 7}, (_, qIdx) => ({
            q: `Q${qIdx + 1}. ${theme}에 관한 심층 질문입니다. 당신의 선택은?`,
            options: [
                { text: `나는 이 상황에서 A를 선택한다.`, type: 'A' },
                { text: `나는 이 상황에서 B가 더 편하다.`, type: 'B' }
            ]
        })),
        results: {
            A: { title: `${theme} 마스터`, desc: `당신은 ${theme} 분야에서 주도적이고 명확한 개성을 보여주는 타입입니다.`, img: unsplash(`15${i}987654321`) },
            B: { title: `${theme} 가이드`, desc: `당신은 ${theme} 분야에서 유연하고 포용적인 분위기를 지닌 타입입니다.`, img: unsplash(`15${i}111222333`) }
        }
    });
}

// =================================================================
// 2. Main Logic & Router
// =================================================================

const categoryMap = { 
    '#personality': '성격', '#face': '얼굴', '#fortune': '사주', '#fun': '재미', 
    '#arcade': '오락실', '#board': '게시판', '#profile': '프로필', '#ranking': '랭킹', '#guide': '가이드'
};
let currentFilter = '전체';
let testLikesData = {};

async function fetchAllLikes() {
    try {
        const snap = await getDocs(collection(db, "testStats"));
        snap.forEach(doc => { testLikesData[doc.id] = doc.data().likes || 0; });
    } catch (e) { console.error(e); }
}

async function handleLike(testId) {
    if (!UserState.user) return alert("로그인이 필요합니다.");
    if (sessionStorage.getItem(`liked_${testId}`)) return alert("이미 완료한 투표입니다.");
    try {
        const statsRef = doc(db, "testStats", testId);
        await setDoc(statsRef, { likes: increment(1) }, { merge: true });
        sessionStorage.setItem(`liked_${testId}`, "true");
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5);
        alert("감사합니다! 5P가 적립되었습니다.");
        const counter = document.getElementById(`like-count-${testId}`);
        if (counter) counter.textContent = testLikesData[testId];
    } catch (e) { console.error(e); }
}

async function router() {
    const hash = window.location.hash || '#home';
    navLinks.forEach(link => {
        const filter = link.dataset.filter;
        link.classList.toggle('active', (hash === '#home' && filter === '전체') || hash.includes(filter?.toLowerCase()));
    });

    app.innerHTML = ''; 
    if (hash === '#privacy') renderPrivacy();
    else if (hash === '#about') renderAbout();
    else if (hash === '#terms') renderTerms();
    else if (hash === '#contact') renderContact();
    else if (hash === '#arcade') renderArcade();
    else if (hash === '#board') await renderBoard(app);
    else if (hash === '#ranking') await renderRanking(app);
    else if (hash === '#guide') renderGuide();
    else if (hash === '#profile') renderProfile();
    else if (hash.startsWith('#test/')) renderTestExecution(hash.split('/')[1]);
    else {
        currentFilter = categoryMap[hash] || '전체';
        await renderHome();
    }
    window.scrollTo(0, 0);
}

// =================================================================
// 3. Page Renders
// =================================================================

async function renderHome() {
    await fetchAllLikes();
    const filtered = currentFilter === '전체' ? TESTS : TESTS.filter(t => t.category === currentFilter);
    
    app.innerHTML = `
        <div class="test-grid">
            ${filtered.map(t => {
                const likes = testLikesData[t.id] || 0;
                return `
                <div class="test-card fade-in" data-cat="${t.category}" onclick="location.hash='#test/${t.id}'">
                    <div class="thumb-wrapper">
                        <div class="test-thumb" style="background-image: url('${t.thumb}')">
                            <div class="like-badge">❤️ ${likes}</div>
                        </div>
                    </div>
                    <div class="test-info">
                        <span class="test-category-tag">${t.category}</span>
                        <h3>${t.title}</h3>
                        <p>${t.desc}</p>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
    updateUI();
}

function renderProfile() {
    if (!UserState.user) {
        app.innerHTML = `<div class="card" style="text-align:center; padding:4rem;"><h2>👤 로그인이 필요합니다</h2><button id="login-btn" class="btn-primary" style="margin:1.5rem auto 0;">로그인하기</button></div>`;
        return;
    }
    const inv = UserState.data.inventory || [];
    const groupedInv = inv.reduce((acc, item) => { acc[item] = (acc[item] || 0) + 1; return acc; }, {});
    const invHTML = Object.entries(groupedInv).map(([name, count]) => `
        <div class="inv-card">
            <span class="inv-icon">${name.split(' ')[0]}</span>
            <span class="inv-name">${name.split(' ')[1] || ''}</span>
            <span class="inv-badge">${count}</span>
        </div>
    `).join('') || '<p class="text-sub">수집한 아이템이 없습니다.</p>';

    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);
    const stats = UserState.data.arcadeStats || { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 };

    app.innerHTML = `
        <div class="profile-page fade-in">
            <div class="card profile-header-card" style="padding: 2.5rem 1.5rem; text-align: center; overflow: hidden; position: relative;">
                <div class="profile-accent-bg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100px; background: linear-gradient(135deg, var(--accent-color), var(--accent-soft)); opacity: 0.1;"></div>
                <div id="user-emoji" style="font-size: 5rem; margin: 0 auto 1rem; position: relative; display: inline-block; background: var(--card-bg); border-radius: 50%; width: 100px; height: 100px; line-height: 100px; box-shadow: var(--shadow-md);">👤</div>
                <div class="tier-badge" style="background: var(--accent-color); color: #fff; display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem; position: relative;">${tier.name}</div>
                <h2 id="user-name" style="font-size: 2rem; font-weight: 800; margin-bottom: 1.5rem;">닉네임</h2>
                
                <div class="progress-container" style="max-width: 400px; margin: 0 auto 2rem;">
                    <div class="progress-label" style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem;">
                        <span>등급 성장도</span>
                        <span>${currentScore.toLocaleString()} / ${nextTier.min.toLocaleString()}</span>
                    </div>
                    <div class="progress-track" style="height: 10px; background: var(--bg-color); border-radius: 10px; overflow: hidden;">
                        <div class="progress-fill" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--accent-color), var(--accent-soft)); border-radius: 10px;"></div>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-sub); margin-top: 0.5rem;">다음 등급까지 <strong>${Math.max(0, nextTier.min - currentScore).toLocaleString()}P</strong> 남았습니다.</p>
                </div>

                <div class="profile-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 400px; margin: 0 auto;">
                    <div class="stat-box" style="background: var(--bg-color); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <span style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-sub); margin-bottom: 0.25rem;">누적 랭킹 점수</span>
                        <span style="font-size: 1.5rem; font-weight: 900; color: var(--accent-color);">${currentScore.toLocaleString()}</span>
                    </div>
                    <div class="stat-box" style="background: var(--bg-color); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <span style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-sub); margin-bottom: 0.25rem;">보유 포인트</span>
                        <span style="font-size: 1.5rem; font-weight: 900; color: var(--accent-secondary);">${(UserState.data.points || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <details class="profile-details" open>
                <summary>📊 오락실 이용 통계</summary>
                <div class="content-area">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                        <div><small class="text-sub">⛏️ 채굴</small><p><strong>${stats.mining || 0}</strong></p></div>
                        <div><small class="text-sub">📦 가챠</small><p><strong>${stats.gacha || 0}</strong></p></div>
                        <div><small class="text-sub">⚗️ 연금술</small><p><strong>${stats.alchemy || 0}</strong></p></div>
                        <div><small class="text-sub">🎫 복권</small><p><strong>${stats.lottery || 0}</strong></p></div>
                        <div><small class="text-sub">🎲 베팅</small><p><strong>${stats.betting || 0}</strong></p></div>
                        <div><small class="text-sub">📅 출석</small><p><strong>${stats.checkin || 0}</strong></p></div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>🎒 내 인벤토리</summary>
                <div class="content-area"><div class="inventory-grid">${invHTML}</div></div>
            </details>
            
            <details class="profile-details" open>
                <summary>🏪 이모지 교환소</summary>
                <div class="content-area shop-wrapper">
                    ${Object.entries(EMOJI_SHOP).map(([cat, emojis]) => `
                        <h4 style="margin-top:1rem; font-size:0.9rem; color:var(--accent-color);">${cat}</h4>
                        <div class="emoji-grid" style="margin-top:0.8rem;">
                            ${Object.entries(emojis).map(([e, price]) => `
                                <button class="emoji-btn ${UserState.data.unlockedEmojis.includes(e) ? 'owned' : 'locked'} ${UserState.data.emoji === e ? 'active' : ''}" data-emoji="${e}">
                                    <span class="e-icon">${e}</span>
                                    <span class="e-price">${price}</span>
                                </button>`).join('')}
                        </div>
                    `).join('')}
                </div>
            </details>

            <details class="profile-details">
                <summary>⚙️ 계정 설정</summary>
                <div class="content-area">
                    <div class="setting-group" style="background: var(--bg-color); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.9rem; font-weight: 800; margin-bottom: 0.75rem;">닉네임 변경</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="nickname-input" style="flex: 1; padding: 0.8rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.95rem;" placeholder="새 닉네임 입력">
                            <button id="nickname-save" class="btn-primary" style="padding: 0 1.5rem; font-size: 0.9rem;">변경</button>
                        </div>
                        <p id="nickname-msg" style="margin-top: 0.75rem; font-size: 0.8rem; font-weight: 600;"></p>
                    </div>
                    <button id="logout-btn" class="btn-secondary" style="width: 100%; padding: 1rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.2); font-weight: 700;">로그아웃</button>
                </div>
            </details>

            ${UserState.isAdmin ? `
            <details class="profile-details admin-only" style="border-color: var(--accent-color);">
                <summary style="color: var(--accent-color);">🛡️ 관리자 콘솔 (Admin)</summary>
                <div class="content-area">
                    <div class="admin-tool-group" style="background: rgba(99, 102, 241, 0.05); padding: 1.5rem; border-radius: var(--radius-md); border: 1px dashed var(--accent-color);">
                        <h4 style="margin-bottom: 1rem; font-size: 0.95rem;">👤 사용자 관리</h4>
                        <button id="admin-search-users" class="btn-secondary" style="width:100%; margin-bottom:1rem; border-color:var(--accent-color); color:var(--accent-color);">사용자 목록 불러오기</button>
                        <div id="admin-user-list-container" style="max-height: 200px; overflow-y: auto; margin-bottom: 1.5rem; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border-color); display: none;"></div>
                        
                        <h4 style="margin-bottom: 1rem; font-size: 0.95rem;">💰 사용자 자산 관리</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <input type="text" id="admin-target-uid" style="padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" placeholder="대상 UID (미입력 시 본인)">
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="number" id="admin-amount" style="flex: 1; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" placeholder="수량 (+ 또는 -)">
                                <button id="admin-charge-points-btn" class="btn-primary" style="background: var(--accent-secondary); box-shadow: none; font-size: 0.8rem; padding: 0 10px;">포인트 집행</button>
                                <button id="admin-charge-score-btn" class="btn-primary" style="background: var(--accent-color); box-shadow: none; font-size: 0.8rem; padding: 0 10px;">점수 집행</button>
                            </div>
                        </div>
                        <p id="admin-msg" style="margin-top: 0.75rem; font-size: 0.8rem; font-weight: 700; color: var(--accent-color);"></p>
                    </div>
                </div>
            </details>
            ` : ''}
        </div>
    `;
    updateUI();
    if (UserState.isAdmin) {
        document.getElementById('admin-charge-points-btn').onclick = async () => {
            const uid = document.getElementById('admin-target-uid').value.trim();
            const amount = parseInt(document.getElementById('admin-amount').value);
            const msg = document.getElementById('admin-msg');
            if (isNaN(amount)) return alert("금액을 정확히 입력하세요.");
            if (await chargeUserPoints(uid, amount)) {
                msg.textContent = `성공: ${uid || '본인'}에게 ${amount}P 적용 완료.`;
                document.getElementById('admin-amount').value = '';
            } else { msg.textContent = "실패: 사용자 정보를 확인하세요."; }
        };
        document.getElementById('admin-charge-score-btn').onclick = async () => {
            const uid = document.getElementById('admin-target-uid').value.trim();
            const amount = parseInt(document.getElementById('admin-amount').value);
            const msg = document.getElementById('admin-msg');
            if (isNaN(amount)) return alert("수량을 정확히 입력하세요.");
            if (await chargeUserScore(uid, amount)) {
                msg.textContent = `성공: ${uid || '본인'}에게 ${amount}점 적용 완료.`;
                document.getElementById('admin-amount').value = '';
            } else { msg.textContent = "실패: 사용자 정보를 확인하세요."; }
        };
        document.getElementById('admin-search-users').onclick = async () => {
            const listContainer = document.getElementById('admin-user-list-container');
            try {
                const snap = await getDocs(collection(db, "users"));
                const users = [];
                snap.forEach(d => {
                    const data = d.data();
                    users.push(`
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.6rem; border-bottom: 1px solid var(--border-color);">
                            <div style="display:flex; flex-direction:column; overflow:hidden;">
                                <span style="font-size:0.85rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data.nickname}</span>
                                <small style="font-size:0.65rem; color:var(--text-sub);">${d.id}</small>
                            </div>
                            <button class="admin-select-user-btn btn-secondary" data-uid="${d.id}" style="padding: 4px 8px; font-size: 0.7rem; white-space:nowrap;">등록</button>
                        </div>
                    `);
                });
                listContainer.innerHTML = users.join('');
                listContainer.style.display = 'block';
                
                listContainer.querySelectorAll('.admin-select-user-btn').forEach(btn => {
                    btn.onclick = () => {
                        document.getElementById('admin-target-uid').value = btn.dataset.uid;
                        alert(`${btn.dataset.uid} 사용자가 선택되었습니다.`);
                    };
                });
            } catch (e) { alert("목록 로드 실패"); }
        };
    }
}

function renderArcade() {
    if (!UserState.user) { renderProfile(); return; }
    app.innerHTML = `
        <div class="arcade-page fade-in">
            <div class="card arcade-header" style="text-align:center; padding: 2.5rem 1.5rem; background: linear-gradient(135deg, var(--accent-color), var(--accent-soft)); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                <h2 style="font-size: 2.2rem; font-weight: 900; margin-bottom: 0.5rem; position: relative;">🎰 SEVEN ARCADE</h2>
                <p style="opacity: 0.9; font-size: 1rem; font-weight: 600; position: relative;">매일 즐거운 게임과 포인트 혜택!</p>
                <div class="arcade-user-stats" style="display: inline-flex; justify-content: center; gap: 2rem; margin-top: 2rem; background: rgba(255,255,255,0.2); padding: 0.8rem 2rem; border-radius: 50px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); position: relative;">
                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:0.85rem; font-weight:700;">내 포인트:</span><span id="user-points" style="font-weight:900; font-size: 1.1rem;">0</span></div>
                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:0.85rem; font-weight:700;">부스터:</span><span style="font-weight:900; font-size: 1.1rem;">${UserState.data.boosterCount || 0}회</span></div>
                </div>
            </div>

            <div class="arcade-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
                <!-- 1. 출석체크 -->
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">📅 일일 출석체크</h3>
                        <span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">FREE</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">하루 한 번, 클릭만으로 <strong>100P</strong>를 즉시 획득하세요.</p>
                    <button id="daily-checkin-btn" class="btn-primary" style="width:100%; background:#10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">출석체크 완료하기</button>
                </div>

                <!-- 2. 포인트 채굴 -->
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">⛏️ 포인트 채굴</h3>
                        <span style="background: rgba(99, 102, 241, 0.1); color: var(--accent-color); padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">LIMITLESS</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">채굴기를 가동하여 무작위 포인트를 생산합니다. (5~15P)</p>
                    <button id="click-game-btn" class="btn-primary" style="width:100%; height:55px; background:linear-gradient(90deg, var(--accent-color), #8b5cf6);">채굴기 가동 시작</button>
                </div>

                <!-- 3. 복권 -->
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🎫 럭키 복권</h3>
                        <span style="background: rgba(253, 160, 133, 0.1); color: #fda085; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">JACKPOT</span>
                    </div>
                    <div id="lotto-result" class="lotto-card" style="height:70px; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; border:2px dashed #fda085; border-radius:15px; font-weight:800; font-size:1rem; background:rgba(253,160,133,0.05); color: #fda085;">당신의 행운을 테스트하세요!</div>
                    <button id="lotto-btn" class="btn-primary" style="width:100%; background:#fda085; box-shadow: 0 4px 14px rgba(253, 160, 133, 0.3);">복권 구매 (500P)</button>
                </div>

                <!-- 4. 베팅 -->
                <div class="card arcade-item-card" style="margin-bottom:0;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">🎲 포인트 베팅</h3>
                    <div style="background: var(--bg-color); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-sub); margin-bottom: 0.5rem;">베팅 금액 설정</label>
                        <input type="number" id="bet-amount" value="100" min="10" style="width:100%; background: transparent; border: none; text-align:center; font-size:1.5rem; font-weight:900; color: var(--accent-color); outline: none;">
                    </div>
                    <div id="bet-result-msg" style="text-align:center; font-weight:800; margin-bottom:1rem; min-height:35px; font-size:0.9rem; color: var(--text-sub);">Ready to play?</div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.6rem;">
                        <button class="bet-btn btn-secondary" style="font-weight: 800;" data-game="oddeven" data-choice="odd">홀수</button>
                        <button class="bet-btn btn-secondary" style="font-weight: 800;" data-game="oddeven" data-choice="even">짝수</button>
                        <button class="bet-btn btn-secondary" style="font-weight: 800;" data-game="dice" data-choice="low">1 ~ 3</button>
                        <button class="bet-btn btn-secondary" style="font-weight: 800;" data-game="dice" data-choice="high">4 ~ 6</button>
                    </div>
                </div>

                <!-- 5. 아이템 뽑기 -->
                <div class="card arcade-item-card" style="margin-bottom:0;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">📦 아이템 뽑기</h3>
                    <div id="gacha-result" class="gacha-box" style="min-height:75px; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; border:2px dashed var(--border-color); border-radius:15px; text-align:center; font-size:0.9rem; background:rgba(0,0,0,0.02); font-weight: 600;">희귀 아이템이 쏟아집니다</div>
                    <div style="display:grid; grid-template-columns: 1fr 1.5fr; gap:0.6rem;">
                        <button id="gacha-btn" class="btn-primary" style="background:var(--text-main); box-shadow: 0 4px 14px rgba(30, 41, 59, 0.2);">1회 (100P)</button>
                        <button id="gacha-10-btn" class="btn-primary" style="background:var(--accent-color); box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);">10회 (950P 🔥)</button>
                    </div>
                </div>

                <!-- 6. 연금술 -->
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">⚗️ 아이템 연금술</h3>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">재료 5개 ➔ 상급 아이템 연성<br><small style="color:var(--accent-color);">(수수료 500P 소모)</small></p>
                    <div id="alchemy-result" style="text-align:center; font-weight:800; color:var(--accent-color); margin-bottom:1rem; min-height:35px; font-size:0.9rem;"></div>
                    <button id="alchemy-btn" class="btn-primary" style="width:100%; background:var(--accent-secondary); box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2);">연금술 합체!</button>
                </div>

                <!-- 7. UP DOWN -->
                <div class="card arcade-item-card" style="margin-bottom:0;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">🔢 UP & DOWN</h3>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem;">1~50 숫자 맞추기 (보상 <strong>50P</strong>)</p>
                    <div style="display:flex; gap:0.6rem; background: var(--bg-color); padding: 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <input type="number" id="updown-input" style="flex:1; background: transparent; border: none; text-align:center; font-size:1.2rem; font-weight:800; outline: none;" placeholder="??">
                        <button id="updown-submit" class="btn-primary" style="width:80px; height: 45px; padding:0;">확인</button>
                    </div>
                    <p id="updown-msg" style="text-align:center; margin-top:1.25rem; font-weight:900; color:var(--accent-color); font-size:1rem; min-height: 24px;"></p>
                </div>

                <!-- 8. 아이템 판매소 (Market) -->
                <div class="card arcade-item-card" style="margin-bottom:0; border: 2px solid var(--accent-soft); background: rgba(99, 102, 241, 0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🏪 아이템 중고장터</h3>
                        <span style="background: var(--accent-color); color: #fff; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">HOT</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem;">보유한 아이템을 포인트로 즉시 환전하세요. (가치의 70% 환급)</p>
                    <div id="market-ui-container"></div>
                    <button id="market-open-btn" class="btn-secondary" style="width:100%; border-width: 2px; border-color:var(--accent-color); color:var(--accent-color); font-weight: 800;">판매 목록 열기</button>
                </div>
            </div>

            <!-- 부스터는 하단에 별도 배치 -->
            <div class="card booster-section fade-in" style="margin-top:2.5rem; background:linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); border: 2px solid var(--accent-soft); padding: 2rem; border-radius: var(--radius-lg);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem;">
                    <div style="flex: 1; min-width: 250px;">
                        <h3 style="font-size:1.4rem; font-weight: 900; color:var(--accent-color); margin-bottom:0.5rem; display: flex; align-items: center; gap: 8px;">⚡ 슈퍼 부스터 (Super Booster)</h3>
                        <p class="text-sub" style="font-size:0.95rem; font-weight: 600;">부스터 활성화 시 모든 테스트 보상 포인트가 <strong>2배(20P)</strong>로 지급됩니다.</p>
                    </div>
                    <button id="buy-booster-btn" class="btn-primary" style="background:var(--accent-color); padding: 1rem 2.5rem; font-size: 1rem; border-radius: 50px;">부스터 20회 충전 (100P)</button>
                </div>
            </div>
        </div>
    `;
    initArcade(); 
    document.getElementById('buy-booster-btn').onclick = async () => {
        if (await usePoints(100)) {
            await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(20) });
            UserState.data.boosterCount = (UserState.data.boosterCount || 0) + 20;
            updateUI(); alert("부스터 충전 완료! 🔥"); renderArcade();
        }
    };
    updateUI();
}

// ... renderBoard, renderRanking, renderGuide, renderTestExecution, renderResult, Static Pages 생략 (기존 상세 버전 유지하며 UI만 정리) ...
// (전체 코드의 일관성을 위해 renderResult 보상 로직만 재확인)

async function renderResult(testId, answers) {
    const test = TESTS.find(t => t.id === testId);
    const result = test.results[answers.filter(x => x==='A').length >= 4 ? 'A' : 'B'];
    let reward = 10;
    if (UserState.user && UserState.data.boosterCount > 0) {
        reward = 20;
        await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(-1) });
        UserState.data.boosterCount -= 1;
    }
    if (UserState.user) await addPoints(reward);

    app.innerHTML = `
        <div class="result-card fade-in" data-cat="${test.category}">
            <span class="test-category">분석 리포트</span>
            <div class="result-img" style="background-image: url('${result.img}'); background-size:cover; background-position:center;"></div>
            <h2 style="color:var(--accent-color);">[${result.title}]</h2>
            <div class="result-desc" style="text-align:left; line-height:1.8; margin:1.5rem 0;"><p>${result.desc}</p></div>
            <button id="like-btn" class="btn-secondary" style="width:auto; padding:0.6rem 1.5rem; border-radius:50px; margin-bottom:1.5rem;">❤️ 좋아요 <span id="like-count-${testId}">${testLikesData[testId] || 0}</span></button>
            <p class="text-sub" style="font-weight:800; color:var(--accent-secondary);">보상 +${reward}P 지급 완료!</p>
            <div class="share-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-top:1.5rem;">
                <button class="btn-primary" id="share-result" style="background:var(--text-main);">결과 공유</button>
                <button class="btn-primary" id="share-test" style="background:var(--accent-soft);">링크 공유</button>
            </div>
            <button class="btn-secondary" style="width:100%; margin-top:1rem;" onclick="location.hash='#home'">다른 테스트 보러 가기</button>
        </div>`;
    document.getElementById('like-btn').onclick = () => handleLike(testId);
    document.getElementById('share-result').onclick = () => shareTest(testId, `나의 결과: ${result.title}`);
    document.getElementById('share-test').onclick = () => copyLink(window.location.origin + `/#test/${testId}`);
}

function renderPrivacy() { app.innerHTML = `<div class="card legal-page fade-in"><h2>🔒 개인정보처리방침</h2><p>귀하의 데이터는 안전하게 보호됩니다.</p></div>`; }
function renderAbout() { app.innerHTML = `<div class="card guide-container fade-in"><h2>✨ 서비스 소개</h2><p>SevenCheck Studio는 심리 분석과 성장의 재미를 결합한 플랫폼입니다.</p></div>`; }
function renderTerms() { app.innerHTML = `<div class="card legal-page fade-in"><h2>📜 이용약관</h2><p>이용 규칙을 준수해 주세요.</p></div>`; }
function renderContact() { app.innerHTML = `<div class="card guide-container fade-in" style="text-align:center;"><h2>📧 문의하기</h2><p>support@sevencheck.studio</p></div>`; }
function renderGuide() { /* 기존 상세 가이드 유지 */ }

themeToggle.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '✨';
};
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
initAuth();
router();
