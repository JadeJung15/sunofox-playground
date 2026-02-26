import { db } from './firebase-init.js';
import { UserState, addPoints, ITEM_VALUES } from './auth.js';
import { copyLink, saveAsStoryImage } from './share.js';
import { TESTS } from './tests-data.js?v=3.1.0';
import { doc, updateDoc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const app = document.getElementById('app');

export function renderCategorySelection() {
    app.innerHTML = `
        <div class="category-selection-page fade-in">
            <div class="section-header" style="text-align:center; flex-direction:column; gap:1rem; margin-bottom:3.5rem; margin-top: 2rem;">
                <h2 class="section-title" style="font-size:2.2rem; width:100%; text-align:center;">✨ 어떤 분석을 원하시나요?</h2>
                <p class="text-sub" style="font-weight:600; font-size: 1.1rem;">당신의 본모습을 찾아줄 7가지 질문이 기다리고 있습니다.</p>
            </div>
            <div class="category-large-grid">
                <div class="cat-large-card" onclick="location.hash='#personality'" style="--cat-color: var(--color-personality);">
                    <div class="cat-card-inner">
                        <span class="cat-icon">🧠</span>
                        <h3>성격 분석</h3>
                        <p>내면의 심리와 숨겨진 성향을<br>심층 분석합니다.</p>
                        <span class="cat-go">시작하기 →</span>
                    </div>
                </div>
                <div class="cat-large-card" onclick="location.hash='#face'" style="--cat-color: var(--color-face);">
                    <div class="cat-card-inner">
                        <span class="cat-icon">✨</span>
                        <h3>비주얼/얼굴</h3>
                        <p>이목구비와 첫인상이 주는<br>고유한 매력을 진단합니다.</p>
                        <span class="cat-go">시작하기 →</span>
                    </div>
                </div>
                <div class="cat-large-card" onclick="location.hash='#fortune'" style="--cat-color: var(--color-fortune);">
                    <div class="cat-card-inner">
                        <span class="cat-icon">🔮</span>
                        <h3>오늘의 운세</h3>
                        <p>영적 타로와 사주 관법으로<br>오늘의 운을 점쳐봅니다.</p>
                        <span class="cat-go">시작하기 →</span>
                    </div>
                </div>
                <div class="cat-large-card" onclick="location.hash='#fun'" style="--cat-color: var(--color-fun);">
                    <div class="cat-card-inner">
                        <span class="cat-icon">🎨</span>
                        <h3>재미/심리</h3>
                        <p>일상의 소소한 취향과<br>재미있는 심리 테스트입니다.</p>
                        <span class="cat-go">시작하기 →</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderTestExecution(testId) {
    const test = TESTS.find(t => t.id === testId);
    if (!test) return;
    let step = 0;
    const traitScores = { energy: 0, logic: 0, empathy: 0, creativity: 0 };

    const updateStep = () => {
        if (step >= test.questions.length) { renderLoading(); return; }
        const q = test.questions[step];
        const progress = (step / test.questions.length) * 100;
        app.innerHTML = `
            <div class="test-progress-container" style="position:fixed; top:0; left:0; width:100%; border-radius:0; height:8px; margin-bottom:0; z-index:2000;">
                <div class="test-progress-bar" style="width: ${progress}%;"></div>
            </div>
            <div class="fade-in" style="padding: 4rem 1.5rem; max-width: 600px; margin: 0 auto; text-align: center; min-height: 90vh; display: flex; flex-direction: column; justify-content: center;">
                <div style="margin-bottom: 3rem;">
                    <span style="font-size: 1rem; font-weight: 900; color: var(--accent-color); letter-spacing: 0.1em; opacity: 0.8;">QUESTION ${step + 1}</span>
                    <h2 style="font-size: 1.7rem; margin-top: 1.5rem; line-height: 1.5; color: var(--text-main); font-weight: 800; word-break: keep-all;">${q.q}</h2>
                </div>
                <div class="test-options" style="display: grid; gap: 1rem;">
                    ${q.options.map((opt, i) => `<button class="test-option-btn slide-up" style="animation-delay: ${i * 0.1}s; padding: 1.5rem; border-radius: 20px; text-align: center; justify-content: center;" onclick="window.handleAnswer(${i})">${opt.text}</button>`).join('')}
                </div>
                <div style="margin-top: 3rem; font-size: 0.9rem; font-weight: 700; color: var(--text-sub); opacity: 0.5;">${step + 1} / ${test.questions.length}</div>
            </div>
        `;
        window.handleAnswer = (idx) => {
            const opt = q.options[idx];
            if (opt.scores) for (const k in opt.scores) traitScores[k] += opt.scores[k];
            step++; updateStep();
        };
    };

    const renderLoading = () => {
        app.innerHTML = `
            <div class="fade-in" style="padding: 4rem 1.5rem; max-width: 500px; margin: 0 auto; text-align: center; height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div class="alchemy-animation" style="margin-bottom: 2rem;"><span style="font-size: 4rem; display: block; animation: bounce 1s infinite;">🧪</span></div>
                <h2 style="font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem;">분석 리포트를 작성 중입니다...</h2>
                <p style="color: var(--text-sub); font-weight: 600;">당신의 답변을 바탕으로 인생 보고서를 생성하고 있습니다.</p>
            </div>
        `;
        setTimeout(() => renderResult(testId, traitScores), 2000);
    };

    app.innerHTML = `<div class="test-intro-container fade-in" style="padding: 2rem 1.5rem 4rem; max-width: 500px; margin: 0 auto; text-align: center;"><div class="test-visual-header" style="margin-top: 2rem; margin-bottom: 2.5rem;"><div class="test-thumb-wrapper" style="width: 140px; height: 140px; margin: 0 auto; border-radius: 35px; overflow: hidden; box-shadow: var(--shadow-lg); border: 4px solid var(--card-bg);"><img src="${test.thumb}" style="width:100%; height:100%; object-fit:cover;" onerror="window.handleImgError(this)"></div><span class="test-category-tag" style="margin-top: 1.5rem; display: inline-block;">${test.category} 분석 리포트</span><h2 style="font-size: 2.2rem; font-weight: 900; margin-top: 1rem;">${test.title}</h2></div><div class="card" style="padding: 2.5rem 1.5rem; margin-bottom: 2.5rem; border-radius: 30px;"><p style="font-size: 1.15rem; line-height: 1.8; font-weight: 600;">${test.desc}</p></div><button id="test-start-btn" class="btn-primary" style="height: 70px; font-size: 1.25rem; font-weight: 900; border-radius: 24px;">분석 시작하기</button></div>`;
    document.getElementById('test-start-btn').onclick = () => updateStep();
}

export async function renderResult(testId, traitScores) {
    const test = TESTS.find(t => t.id === testId);
    const traits = ['energy', 'logic', 'empathy', 'creativity'];
    const dominantTrait = traits.reduce((a, b) => (traitScores[a] >= traitScores[b] ? a : b));
    const result = test.results[dominantTrait] || test.results.A;
    const themeColor = result.color || '#6366f1';
    const stats = { energy: Math.min(Math.round((traitScores.energy / 14) * 100), 100), logic: Math.min(Math.round((traitScores.logic / 14) * 100), 100), empathy: Math.min(Math.round((traitScores.empathy / 14) * 100), 100), creativity: Math.min(Math.round((traitScores.creativity / 14) * 100), 100) };

    if (UserState.user) {
        const traitItems = { energy: '⚡ 번개 병', logic: '🧪 현자의 돌', empathy: '🌱 묘목', creativity: '🌌 은하수 가루' };
        const rewardedItem = traitItems[dominantTrait] || '💩 돌멩이';
        await updateDoc(doc(db, "users", UserState.user.uid), { inventory: arrayUnion(rewardedItem), totalScore: increment(ITEM_VALUES[rewardedItem] || 500), discoveredItems: arrayUnion(rewardedItem) });
        await addPoints(10, '분석 완료 보상');
    }

    app.innerHTML = `
        <div class="aura-bg-container"><div class="aura-sphere" style="background: ${themeColor}; top:-100px; left:-100px; opacity:0.2;"></div></div>
        <div class="result-page fade-in" style="padding: 1.5rem 0.75rem;">
            <div class="result-card" id="capture-target" style="max-width: 600px; margin: 0 auto; background: var(--card-bg); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-lg); border: 1px solid ${themeColor}22;">
                <div style="padding: 1.25rem;"><img src="${result.img}" style="width: 100%; border-radius: 18px; object-fit: cover; height: 220px; border: 2px solid #fff;" onerror="window.handleImgError(this)"></div>
                <div style="padding: 1.25rem; text-align: center;">
                    <div style="display:flex; justify-content:center; gap:6px; margin-bottom:1.25rem;">${(result.tags || []).map(tag => `<span style="background:${themeColor}15; color:${themeColor}; padding:4px 12px; border-radius:50px; font-size:0.75rem; font-weight:800;">${tag}</span>`).join('')}</div>
                    <h2 style="font-size: 2rem; font-weight: 900; color: ${themeColor};">${result.title}</h2>
                    <p id="typing-desc" style="margin-top: 1.5rem; font-size: 1rem; line-height: 1.7; font-weight: 600;"></p>
                    <div class="radar-chart-container" style="background: var(--bg-color); border-radius: 20px; padding: 2rem 0.5rem; margin-top: 2rem; border: 1px solid var(--border-color);">
                        <h4 style="margin-bottom: 1.5rem; font-size: 0.85rem; font-weight: 800;">7단계 심층 아우라 지표</h4>
                        <canvas id="radarChart" width="200" height="200" style="margin: 0 auto;"></canvas>
                    </div>
                    <div style="margin-top: 2.5rem; display: grid; gap: 1rem;" data-html2canvas-ignore="true">
                        <button id="result-share-btn" class="btn-primary" style="background: ${themeColor}; height: 60px; border-radius: 18px; font-weight:900;">테스트 공유하기</button>
                        <button id="save-story-btn" class="btn-secondary" style="height: 60px; border-radius: 18px; font-weight:800; border-color:${themeColor}; color:${themeColor};">이미지 저장하기</button>
                        <button onclick="location.hash='#home'" class="btn-secondary" style="height: 50px; border:none; color:var(--text-sub);">← 홈으로 돌아가기</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const descEl = document.getElementById('typing-desc');
    let i = 0;
    const type = () => { if (i < result.desc.length) { descEl.innerHTML = result.desc.substring(0, i + 1) + '<span class="typing-cursor"></span>'; i++; setTimeout(type, 35); } else { descEl.innerHTML = result.desc; } };
    setTimeout(type, 600);

    const canvas = document.getElementById('radarChart');
    if (canvas) {
        const ctx = canvas.getContext('2d'), cx = 100, cy = 100, r = 85;
        const labels = ['energy', 'logic', 'empathy', 'creativity'];
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
        [0.3, 0.6, 1].forEach(s => { ctx.beginPath(); labels.forEach((_, idx) => { const a = (idx * 90 - 90) * Math.PI / 180; const x = cx + Math.cos(a) * r * s, y = cy + Math.sin(a) * r * s; idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }); ctx.closePath(); ctx.stroke(); });
        ctx.fillStyle = themeColor + '44'; ctx.strokeStyle = themeColor; ctx.lineWidth = 3; ctx.beginPath();
        labels.forEach((label, idx) => { const a = (idx * 90 - 90) * Math.PI / 180; const val = stats[label] / 100; const x = cx + Math.cos(a) * r * val, y = cy + Math.sin(a) * r * val; idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    document.getElementById('result-share-btn').onclick = () => { copyLink(`${window.location.origin}/#test/${testId}`); alert("링크가 복사되었습니다! ✨"); };
    document.getElementById('save-story-btn').onclick = async () => { await saveAsStoryImage('capture-target', `7Check_${testId}.png`); };
}
