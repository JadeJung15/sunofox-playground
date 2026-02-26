import { UserState, addPoints } from '../auth.js';
import { ITEM_VALUES } from '../constants/shops.js';
import { db } from '../firebase-init.js';
import { doc, updateDoc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { copyLink, saveAsStoryImage } from '../share.js';
import { TESTS } from '../tests-data.js?v=4.0.0';
import { renderTestCard } from './home.js';

export async function renderResult(testId, traitScores) {
    const app = document.getElementById('app');
    const test = TESTS.find(t => t.id === testId);
    const traits = ['energy', 'logic', 'empathy', 'creativity'];
    const dominantTrait = traits.reduce((a, b) => (traitScores[a] >= traitScores[b] ? a : b));

    const result = (test.results[dominantTrait]) ? test.results[dominantTrait] : (traitScores.energy >= 4 ? test.results.A : test.results.B);
    const themeColor = result.color || '#6366f1';
    const tags = result.tags || [];
    const maxScore = 14;
    const stats = {
        energy:     Math.min(Math.round((traitScores.energy     / maxScore) * 100), 100),
        logic:      Math.min(Math.round((traitScores.logic      / maxScore) * 100), 100),
        empathy:    Math.min(Math.round((traitScores.empathy    / maxScore) * 100), 100),
        creativity: Math.min(Math.round((traitScores.creativity / maxScore) * 100), 100),
    };

    let basePointReward = 10;
    if (UserState.user && UserState.data.boosterCount > 0) {
        basePointReward = 20;
        await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(-1) });
        UserState.data.boosterCount -= 1;
    }

    let rewardedItem = null;
    if (UserState.user) {
        const traitItems = {
            energy: '⚡ 번개 병',
            logic: '🧪 현자의 돌',
            empathy: '🌱 묘목',
            creativity: '🌌 은하수 가루'
        };
        rewardedItem = traitItems[dominantTrait] || '💩 돌멩이';
        const itemVal = ITEM_VALUES[rewardedItem] || 500;

        await updateDoc(doc(db, "users", UserState.user.uid), {
            inventory: arrayUnion(rewardedItem),
            totalScore: increment(itemVal),
            discoveredItems: arrayUnion(rewardedItem)
        });
        UserState.data.inventory.push(rewardedItem);
        UserState.data.totalScore = (UserState.data.totalScore || 0) + itemVal;
        await addPoints(basePointReward, '분석 완료 보상');
        window.checkDailyQuests?.('test');
    }

    const recommendedTests = TESTS
        .filter(t => t.id !== testId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    app.innerHTML = `
        <div class="aura-bg-container">
            <div class="aura-sphere" style="background: ${themeColor}; top: -100px; left: -100px; opacity: 0.2;"></div>
            <div class="aura-sphere" style="background: ${themeColor}; bottom: -100px; right: -100px; opacity: 0.1; animation-delay: -5s;"></div>
        </div>
        <div class="result-page fade-in" style="min-height: 100vh; padding: 1.5rem 0.75rem;">
            <div class="result-card" id="capture-target" style="max-width: 600px; margin: 0 auto; background: var(--card-bg); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-lg); border: 1px solid ${themeColor}22; backdrop-filter: blur(10px);">
                <div style="padding: 1.25rem 1.25rem 0;">
                    <div class="result-img-wrapper" style="height: 220px; position: relative; border-radius: 18px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.12); border: 2px solid #fff;">
                        <img src="${result.img}" alt="${result.title}"
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="window.handleImgError(this)">
                    </div>
                </div>
                <div style="padding: 1.25rem 1.25rem 2rem; text-align: center;">
                    <div style="display:flex; justify-content:center; gap:6px; margin-bottom:1.25rem;" class="result-tag-floating">
                        ${tags.map(tag => `<span style="background:${themeColor}15; color:${themeColor}; padding:4px 12px; border-radius:50px; font-size:0.75rem; font-weight:800; border:1px solid ${themeColor}22;">${tag}</span>`).join('')}
                    </div>
                    <h2 style="font-size: 2rem; font-weight: 900; color: ${themeColor}; margin-bottom: 1.25rem; letter-spacing: -0.04em; line-height: 1.2; word-break: keep-all;">${result.title}</h2>

                    <div style="min-height: 6rem; margin-bottom: 2rem; background: rgba(var(--accent-rgb), 0.03); padding: 1.25rem; border-radius: 16px; border: 1px solid rgba(0,0,0,0.03); box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">
                        <p id="typing-desc" style="font-size: 1rem; line-height: 1.7; color: var(--text-main); word-break: keep-all; font-weight: 600; text-align: center;"></p>
                    </div>

                    <div class="radar-chart-container" style="background: var(--bg-color); border-radius: 20px; padding: 2rem 0.5rem; margin-bottom: 2.5rem; border: 1px solid var(--border-color); position: relative;">
                        <h4 style="margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--text-sub); font-weight: 800; letter-spacing: 0.05em;">7단계 심층 아우라 지표</h4>
                        <canvas id="radarChart" width="200" height="200" style="margin: 0 auto; max-width: 100%;"></canvas>
                        <div class="radar-stats-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1.25rem; padding: 0 1rem;">
                            <div style="font-size: 0.7rem; color: ${themeColor}; font-weight: 800; background:rgba(0,0,0,0.03); padding:6px; border-radius:4px;">에너지 ${Math.round(stats.energy)}%</div>
                            <div style="font-size: 0.7rem; color: ${themeColor}; font-weight: 800; background:rgba(0,0,0,0.03); padding:6px; border-radius:4px;">논리 ${Math.round(stats.logic)}%</div>
                            <div style="font-size: 0.7rem; color: ${themeColor}; font-weight: 800; background:rgba(0,0,0,0.03); padding:6px; border-radius:4px;">공감 ${Math.round(stats.empathy)}%</div>
                            <div style="font-size: 0.7rem; color: ${themeColor}; font-weight: 800; background:rgba(0,0,0,0.03); padding:6px; border-radius:4px;">독창성 ${Math.round(stats.creativity)}%</div>
                        </div>
                    </div>

                    <div class="reward-box" style="background: linear-gradient(135deg, #1e293b, #334155); color: #fff; padding: 1.5rem; border-radius: 20px; margin-bottom: 2rem; box-shadow: 0 8px 20px rgba(0,0,0,0.12); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -5px; right: -5px; font-size: 3rem; opacity: 0.1;">✨</div>
                        <span style="font-size: 0.7rem; font-weight: 800; opacity: 0.8; display: block; margin-bottom: 0.5rem; letter-spacing: 0.05em;">🎁 당신만을 위한 전용 보상</span>
                        <div style="font-size: 1.5rem; font-weight: 900; color: #fbbf24; margin-bottom: 0.3rem; text-shadow: 0 0 12px rgba(251, 191, 36, 0.3);">${rewardedItem || '20P 획득'}</div>
                        <p style="opacity: 0.7; font-size: 0.75rem; font-weight: 600;">아이템 도감에 기록되었습니다.</p>
                    </div>

                    <div class="result-button-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" data-html2canvas-ignore="true">
                        <button id="result-share-btn" class="btn-primary" style="background: ${themeColor}; border: none; height: 55px; font-weight: 800; font-size: 1rem; border-radius: 18px; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;"><span>🔗</span> 테스트 공유</button>
                        <button id="save-story-btn" class="btn-secondary" style="height: 55px; font-weight: 800; font-size: 1rem; border-radius: 18px; border-color: ${themeColor}; color: ${themeColor}; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;"><span>📸</span> 이미지 저장</button>
                    </div>

                    <div style="margin-top: 1.5rem;" data-html2canvas-ignore="true">
                        <button class="btn-secondary" style="width:100%; border:none; color:var(--text-sub); font-size:0.9rem; font-weight:700;" onclick="location.hash='#home'">← 홈으로 돌아가기</button>
                    </div>

                    <div class="recommended-section" style="margin-top: 4rem; padding-top: 3rem; border-top: 1px dashed var(--border-color);" data-html2canvas-ignore="true">
                        <h3 style="text-align:center; margin-bottom: 2.5rem; font-size: 1.4rem; font-weight: 900; color: var(--text-main);">✨ 이런 분석은 어때요?</h3>
                        <div class="test-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                            ${recommendedTests.map(t => renderTestCard(t)).join('')}
                        </div>
                        <div style="text-align: center; margin-top: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                            <button class="btn-secondary" style="padding: 1rem 3rem; font-weight: 800; border-radius: 50px; width: auto; border-color: var(--border-color); color: var(--text-sub);" onclick="location.hash='#7check'">📋 전체 리스트 보기</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="story-capture-area" style="position: absolute; left: -9999px; width: 360px; height: 640px; background: ${themeColor}; color: #fff; overflow: hidden; font-family: 'Pretendard', sans-serif; display: block;">
                <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%); z-index: 1;"></div>
                <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; padding: 40px 30px; box-sizing: border-box;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em;">SEVEN CHECK REPORT</span>
                    </div>
                    <div class="story-img-wrapper" style="width: 300px; height: 300px; border-radius: 20px; overflow:hidden; margin: 0 auto 30px; border: 4px solid #fff; box-shadow: 0 15px 30px rgba(0,0,0,0.3); background-image: url('${result.img}'); background-size: cover; background-position: center; flex-shrink: 0;"></div>
                    <div style="text-align: center; width: 100%;">
                        <h2 style="font-size: 2rem; font-weight: 900; margin-bottom: 15px; line-height: 1.2; text-shadow: 0 4px 10px rgba(0,0,0,0.3); word-break: keep-all;">${result.title}</h2>
                        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 25px;">
                            ${tags.map(tag => `<span style="background:rgba(255,255,255,0.2); padding:5px 12px; border-radius:50px; font-size:0.7rem; font-weight:700; backdrop-filter:blur(5px);">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div style="margin-top: auto; text-align: center; background: rgba(255,255,255,0.15); padding: 20px; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);">
                        <div style="font-size: 2rem; margin-bottom: 5px;">🦊</div>
                        <div style="font-size: 1.6rem; font-weight: 900; letter-spacing: -0.02em; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">SevenCheck</div>
                        <div style="font-size: 0.65rem; opacity: 0.8; margin-top: 8px; letter-spacing: 0.1em; font-weight: 700;">PREMIUM ANALYSIS REPORT</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const descEl = document.getElementById('typing-desc');
    let i = 0;
    const type = () => {
        if (i < result.desc.length) {
            descEl.innerHTML = result.desc.substring(0, i + 1) + '<span class="typing-cursor"></span>';
            i++;
            setTimeout(type, 35);
        } else {
            descEl.innerHTML = result.desc;
        }
    };
    setTimeout(type, 600);

    const canvas = document.getElementById('radarChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const cx = 110, cy = 110, r = 85;
        const labels = ['energy', 'logic', 'empathy', 'creativity'];

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        [0.3, 0.6, 1].forEach(scale => {
            ctx.beginPath();
            labels.forEach((_, idx) => {
                const angle = (idx * 90 - 90) * Math.PI / 180;
                const x = cx + Math.cos(angle) * r * scale;
                const y = cy + Math.sin(angle) * r * scale;
                idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.stroke();
        });

        ctx.fillStyle = themeColor + '44';
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        labels.forEach((label, idx) => {
            const angle = (idx * 90 - 90) * Math.PI / 180;
            const val = stats[label] / 100;
            const x = cx + Math.cos(angle) * r * val;
            const y = cy + Math.sin(angle) * r * val;
            idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    const resultShareBtn = document.getElementById('result-share-btn');
    if (resultShareBtn) {
        resultShareBtn.onclick = async () => {
            const testUrl = `${window.location.origin}/#test/${testId}`;
            const shareText = `[${test.title}] 당신도 한번 도전해보세요! 딱 7번의 질문으로 찾는 나의 본모습 ✨`;

            if (navigator.share) {
                try {
                    await navigator.share({ title: 'SevenCheck 심리분석', text: shareText, url: testUrl });
                    await addPoints(30, '테스트 추천 보상');
                } catch (e) {}
            } else {
                await copyLink(testUrl);
            }
        };
    }

    const storyBtn = document.getElementById('save-story-btn');
    if (storyBtn) {
        storyBtn.onclick = async () => {
            storyBtn.disabled = true;
            storyBtn.textContent = "이미지 생성 중...";
            const success = await saveAsStoryImage('story-capture-area', `7Check_${testId}.png`);
            if (success) alert("공유용 고해상도 리포트가 저장되었습니다! 📸\n30P가 적립되었습니다.");
            storyBtn.disabled = false;
            storyBtn.innerHTML = "<span>📸</span> 공유이미지 저장";
        };
    }
}

export function renderTestExecution(testId) {
    const app = document.getElementById('app');
    const test = TESTS.find(t => t.id === testId);
    if (!test) return;
    let step = 0;
    const traitScores = { energy: 0, logic: 0, empathy: 0, creativity: 0 };
    let history = [];

    const renderIntro = () => {
        app.innerHTML = `
            <div class="test-intro-container fade-in" style="padding: 2rem 1.5rem 4rem; max-width: 500px; margin: 0 auto; text-align: center;">
                <div class="test-visual-header" style="margin-top: 2rem; margin-bottom: 2.5rem;">
                    <div class="test-thumb-wrapper" style="width: 140px; height: 140px; margin: 0 auto; border-radius: 35px; overflow: hidden; box-shadow: var(--shadow-lg); border: 4px solid var(--card-bg);">
                        <img src="${test.thumb}" alt="" style="width:100%; height:100%; object-fit:cover;" onerror="window.handleImgError(this)">
                    </div>
                    <span class="test-category-tag" style="margin-top: 1.5rem; display: inline-block;">${test.category} 분석 리포트</span>
                    <h2 style="font-size: 2.2rem; font-weight: 900; margin-top: 1rem; line-height: 1.2;">${test.title}</h2>
                </div>

                <div class="card" style="padding: 2.5rem 1.5rem; margin-bottom: 2.5rem; background: var(--card-bg); border-radius: 30px; border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">
                    <p style="font-size: 1.15rem; line-height: 1.8; color: var(--text-main); font-weight: 600; word-break: keep-all;">${test.desc}</p>
                </div>

                <div style="display: grid; gap: 1rem;">
                    <button id="test-start-btn" class="btn-primary" style="height: 70px; font-size: 1.25rem; font-weight: 900; border-radius: 24px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);">분석 시작하기</button>
                    <button id="test-share-btn" class="btn-secondary" style="height: 60px; font-size: 1rem; font-weight: 800; border-radius: 24px; display: flex; align-items: center; justify-content: center; gap: 8px;">🔗 친구에게 공유하기</button>
                </div>

                <button onclick="location.hash='#7check'" style="margin-top: 2.5rem; background: none; border: none; color: var(--text-sub); font-weight: 700; font-size: 0.95rem; text-decoration: underline; cursor: pointer; opacity: 0.7;">다른 테스트 둘러보기</button>
            </div>
        `;

        const startBtn = document.getElementById('test-start-btn');
        if (startBtn) startBtn.onclick = () => updateStep();

        const shareBtn = document.getElementById('test-share-btn');
        if (shareBtn) {
            shareBtn.onclick = async () => {
                const siteUrl = window.location.href;
                if (navigator.share) {
                    try {
                        await navigator.share({ title: `7Check - ${test.title}`, text: test.desc, url: siteUrl });
                        await addPoints(30, '테스트 공유 보상');
                    } catch (e) {}
                } else {
                    await copyLink(siteUrl);
                }
            };
        }
    };

    const updateStep = () => {
        if (step >= test.questions.length) {
            renderLoading();
            return;
        }

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
                    ${q.options.map((opt, i) => `
                        <button class="test-option-btn slide-up"
                                style="animation-delay: ${i * 0.1}s; padding: 1.5rem; border-radius: 20px; text-align: center; justify-content: center;"
                                onclick="window.handleAnswer(${i})">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
                <div style="margin-top: 3rem; font-size: 0.9rem; font-weight: 700; color: var(--text-sub); opacity: 0.5;">
                    ${step + 1} / ${test.questions.length}
                </div>
            </div>
        `;

        window.handleAnswer = (idx) => {
            const opt = q.options[idx];
            history.push({ traitScores: { ...traitScores }, step: step });

            if (opt.scores) {
                for (const k in opt.scores) traitScores[k] += opt.scores[k];
            } else if (opt.type) {
                if (opt.type === 'A') traitScores.energy += 2;
                else traitScores.empathy += 2;
            }

            step++;
            updateStep();
        };
    };

    const renderLoading = () => {
        app.innerHTML = `
            <div class="fade-in" style="padding: 4rem 1.5rem; max-width: 500px; margin: 0 auto; text-align: center; height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div class="alchemy-animation" style="margin-bottom: 2rem;">
                    <span style="font-size: 4rem; display: block; animation: bounce 1s infinite;">🧪</span>
                </div>
                <h2 style="font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem;">분석 리포트를 작성 중입니다...</h2>
                <p style="color: var(--text-sub); font-weight: 600;">당신의 답변을 바탕으로 인생 보고서를 생성하고 있습니다.</p>
                <div class="test-progress-container" style="width: 200px; margin-top: 2rem;">
                    <div class="test-progress-bar" style="width: 100%; animation: pulse 1.5s infinite;"></div>
                </div>
            </div>
        `;
        setTimeout(() => renderResult(testId, traitScores), 2000);
    };

    renderIntro();
}
