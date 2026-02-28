import { UserState, addPoints } from '../auth.js?v=8.3.2';
import { ITEM_VALUES } from '../constants/shops.js';
import { db } from '../firebase-init.js?v=8.3.2';
import { doc, updateDoc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { copyLink, saveAsStoryImage } from '../share.js';
import { TESTS } from '../tests-data.js?v=8.3.2';
import { renderTestCard } from './home.js';

function getShareUrl(testId) {
    if (testId === 'p39') return `${window.location.origin}/share/p39`;
    return `${window.location.origin}/?test=${testId}`;
}

function scrollTestViewToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export async function renderResult(testId, traitScores) {
    const app = document.getElementById('app');
    const test = TESTS.find(t => t.id === testId);
    const traits = test.customTraits || ['energy', 'logic', 'empathy', 'creativity'];
    const dominantTrait = traits.reduce((a, b) => ((traitScores[a] || 0) >= (traitScores[b] || 0) ? a : b));

    const result = (test.results[dominantTrait]) ? test.results[dominantTrait] : (traitScores.energy >= 4 ? test.results.A : test.results.B);
    const themeColor = result.color || '#6366f1';
    const tags = result.tags || [];
    const maxScore = 14;
    const stats = {
        energy:     Math.min(Math.round(((traitScores.energy || 0)     / maxScore) * 100), 100),
        logic:      Math.min(Math.round(((traitScores.logic || 0)      / maxScore) * 100), 100),
        empathy:    Math.min(Math.round(((traitScores.empathy || 0)    / maxScore) * 100), 100),
        creativity: Math.min(Math.round(((traitScores.creativity || 0) / maxScore) * 100), 100),
    };

    const ingredientPool = {
        energy: [
            { title: "지치지 않는 에너자이저", desc: "주변까지 밝히는 긍정의 불꽃 세 스푼" },
            { title: "추진력 갑 불도저", desc: "생각나면 바로 실행하는 행동력 한 트럭" },
            { title: "인간 비타민", desc: "피로를 날려버리는 상큼함 한 방울" }
        ],
        logic: [
            { title: "냉철한 얼음 송곳", desc: "감정에 흔들리지 않는 팩트 폭력기 두 줌" },
            { title: "알파고 마인드", desc: "오차율 0%를 향한 완벽주의 세 스푼" },
            { title: "명탐정 코난", desc: "작은 단서도 놓치지 않는 관찰력 두 꼬집" }
        ],
        empathy: [
            { title: "걸어다니는 손난로", desc: "누구든 녹여버리는 따뜻한 공감 능력 두 스푼" },
            { title: "프로 리액셔너", desc: "상대방을 춤추게 하는 물개박수 세 줌" },
            { title: "포근한 솜이불", desc: "지친 마음을 덮어주는 포용력 한 웅큼" }
        ],
        creativity: [
            { title: "탱탱볼 마인드", desc: "예측 불가능한 엉뚱함 네 스푼" },
            { title: "아이디어 뱅크", desc: "남들과는 다른 시선으로 세상을 보는 안경 알" },
            { title: "마이웨이 개척자", desc: "남의 시선은 신경 쓰지 않는 뻔뻔함 두 꼬집" }
        ]
    };

    const weaponPool = {
        energy: { weaponIcon: "🔥", weapon: "무한 동력 모터", weaknessIcon: "🔋", weakness: "방전되면 말수 급감함" },
        logic: { weaponIcon: "🗡️", weapon: "팩트 체크 레이저", weaknessIcon: "🤖", weakness: "감성팔이에 취약함" },
        empathy: { weaponIcon: "🛡️", weapon: "천사표 방패", weaknessIcon: "🥺", weakness: "거절을 잘 못해서 손해 봄" },
        creativity: { weaponIcon: "✨", weapon: "기발한 발상 지팡이", weaknessIcon: "⏳", weakness: "반복적인 루틴에 쉽게 질림" }
    };

    // Determine the trait to use for the analysis (fallback to 'energy' if the dominant trait isn't in the pool)
    const poolTrait = ingredientPool[dominantTrait] ? dominantTrait : (['energy', 'logic', 'empathy', 'creativity'][Math.floor(Math.random() * 4)]);
    
    const mainIngredient = ingredientPool[poolTrait][Math.floor(Math.random() * ingredientPool[poolTrait].length)];
    const otherTraits = ['energy', 'logic', 'empathy', 'creativity'].filter(t => t !== poolTrait).sort(() => 0.5 - Math.random());
    const sub1Ingredient = ingredientPool[otherTraits[0]][Math.floor(Math.random() * ingredientPool[otherTraits[0]].length)];
    const sub2Ingredient = ingredientPool[otherTraits[1]][Math.floor(Math.random() * ingredientPool[otherTraits[1]].length)];
    
    const soulIngredients = { main: mainIngredient, sub1: sub1Ingredient, sub2: sub2Ingredient };
    const rpgStats = weaponPool[poolTrait];

    const { getPetBuff } = await import('../auth.js?v=8.3.2');
    const petBuff = getPetBuff();

    let basePointReward = 10 + petBuff.testBonus;
    if (UserState.user && UserState.data.boosterCount > 0) {
        basePointReward = (10 * 2) + petBuff.testBonus; // 부스터는 기본 보상에만 적용
        await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(-1) });
        UserState.data.boosterCount -= 1;
    }
    
    // 최종 배수 적용 (Legendary 펫 등)
    basePointReward = Math.floor(basePointReward * petBuff.multiplier);

    let rewardedItem = null;
    if (UserState.user) {
        const traitItems = {
            energy: '⚡ 번개 병',
            logic: '🧪 현자의 돌',
            empathy: '🌱 묘목',
            creativity: '🌌 은하수 가루'
        };
        const commonItems = ['⚡ 번개 병', '🧪 현자의 돌', '🌱 묘목', '🌌 은하수 가루', '🦊 여우 꼬리'];
        rewardedItem = traitItems[dominantTrait] || commonItems[Math.floor(Math.random() * commonItems.length)];
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
    const surpriseTest = recommendedTests[0];

    app.innerHTML = `
        <div class="aura-bg-container">
            <div class="aura-sphere" style="background: ${themeColor}; top: -100px; left: -100px; opacity: 0.2;"></div>
            <div class="aura-sphere" style="background: ${themeColor}; bottom: -100px; right: -100px; opacity: 0.1; animation-delay: -5s;"></div>
        </div>
        <div class="result-page fade-in" style="min-height: 100vh; padding: 1.5rem 0.75rem;">
            <div class="result-card" id="capture-target" style="max-width: 600px; margin: 0 auto; background: var(--card-bg); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-lg); border: 1px solid ${themeColor}22; backdrop-filter: blur(10px);">
                <div style="padding: 2.5rem 1.25rem 1.5rem; text-align: center; background: linear-gradient(180deg, ${themeColor}15 0%, transparent 100%);">
                    <div style="width: 100px; height: 100px; margin: 0 auto 1.5rem; border-radius: 50%; background: ${themeColor}22; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; box-shadow: 0 8px 24px ${themeColor}33; border: 4px solid #fff;">
                        ${tags[0]?.replace(/[^a-zA-Z0-9가-힣]/g, '') === '신뢰' ? '🤝' : (tags[0]?.replace(/[^a-zA-Z0-9가-힣]/g, '') === '유니크' ? '🎨' : '✨')}
                    </div>
                    <div style="display:flex; justify-content:center; gap:6px; margin-bottom:1.25rem;" class="result-tag-floating">
                        ${tags.map(tag => `<span style="background:${themeColor}15; color:${themeColor}; padding:4px 12px; border-radius:50px; font-size:0.75rem; font-weight:800; border:1px solid ${themeColor}22;">${tag}</span>`).join('')}
                    </div>
                    <h2 style="font-size: 2.2rem; font-weight: 900; color: ${themeColor}; margin-bottom: 0; letter-spacing: -0.04em; line-height: 1.2; word-break: keep-all;">${result.title}</h2>
                </div>
                <div style="padding: 0 1.25rem 2rem; text-align: center;">

                    <div style="min-height: 6rem; margin-bottom: 2rem; background: rgba(var(--accent-rgb), 0.03); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(0,0,0,0.03); box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">
                        <p id="typing-desc" style="font-size: 1.05rem; line-height: 1.8; color: var(--text-main); word-break: keep-all; font-weight: 600; text-align: center;"></p>
                    </div>

                                        <div class="soul-analysis-container" style="background: var(--bg-color); border-radius: 20px; padding: 2rem 1.5rem; margin-bottom: 2.5rem; border: 1px solid var(--border-color); position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                                            <h4 style="margin-bottom: 1.5rem; font-size: 1.05rem; color: var(--text-main); font-weight: 900; letter-spacing: 0.05em; display:flex; align-items:center; justify-content:center; gap:8px;">
                                                <span style="font-size:1.3rem;">🔮</span> 나의 영혼 분석서
                                            </h4>
                    
                                            <div style="background:rgba(0,0,0,0.02); padding:1.2rem; border-radius:16px; margin-bottom:1.5rem; border: 1px solid rgba(0,0,0,0.05);">
                                                <h5 style="font-size:0.85rem; color:var(--text-sub); margin-bottom:1.2rem; display:flex; align-items:center; gap:6px; font-weight:800;"><span style="font-size:1.1rem;">🧪</span> 나를 만든 연금술 레시피</h5>
                                                <div style="display:flex; flex-direction:column; gap:12px;">
                                                    <div style="display:flex; align-items:center; gap:12px;">
                                                        <div style="width:45px; height:45px; border-radius:12px; background:${themeColor}22; color:${themeColor}; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:900;">70%</div>
                                                        <div style="flex:1; text-align:left;">
                                                            <div style="font-weight:800; font-size:0.9rem; color:var(--text-main); margin-bottom:2px;">${soulIngredients?.main.title}</div>
                                                            <div style="font-size:0.75rem; color:var(--text-sub); line-height:1.4;">${soulIngredients?.main.desc}</div>
                                                        </div>
                                                    </div>
                                                    <div style="display:flex; align-items:center; gap:12px;">
                                                        <div style="width:45px; height:45px; border-radius:12px; background:rgba(0,0,0,0.05); color:var(--text-main); display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:800;">20%</div>
                                                        <div style="flex:1; text-align:left;">
                                                            <div style="font-weight:800; font-size:0.85rem; color:var(--text-main); margin-bottom:2px;">${soulIngredients?.sub1.title}</div>
                                                            <div style="font-size:0.75rem; color:var(--text-sub); line-height:1.4;">${soulIngredients?.sub1.desc}</div>
                                                        </div>
                                                    </div>
                                                    <div style="display:flex; align-items:center; gap:12px;">
                                                        <div style="width:45px; height:45px; border-radius:12px; background:rgba(0,0,0,0.03); color:var(--text-sub); display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:700;">10%</div>
                                                        <div style="flex:1; text-align:left;">
                                                            <div style="font-weight:800; font-size:0.85rem; color:var(--text-main); margin-bottom:2px;">${soulIngredients?.sub2.title}</div>
                                                            <div style="font-size:0.75rem; color:var(--text-sub); line-height:1.4;">${soulIngredients?.sub2.desc}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                    
                                            <div style="background:var(--card-bg); padding:1.2rem; border-radius:16px; border:1px solid ${themeColor}33; position:relative; overflow:hidden;">
                                                <div style="position:absolute; top:-10px; right:-10px; font-size:3rem; opacity:0.05;">⚔️</div>
                                                <h5 style="font-size:0.85rem; color:${themeColor}; margin-bottom:1.2rem; display:flex; align-items:center; gap:6px; font-weight:800; position:relative;"><span style="font-size:1.1rem;">🕹️</span> 현실 생존 가이드</h5>
                                                
                                                <div style="margin-bottom:12px; position:relative;">
                                                    <div style="font-size:0.75rem; color:var(--text-sub); margin-bottom:6px; font-weight:800; text-align:left;">가장 치명적인 무기 (장점)</div>
                                                    <div style="background:rgba(0,0,0,0.02); padding:12px 14px; border-radius:12px; font-size:0.9rem; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:10px; border:1px solid rgba(0,0,0,0.05);">
                                                        <span style="font-size:1.2rem;">${rpgStats?.weaponIcon}</span> <span>${rpgStats?.weapon}</span>
                                                    </div>
                                                </div>
                                                
                                                <div style="position:relative;">
                                                    <div style="font-size:0.75rem; color:var(--text-sub); margin-bottom:6px; font-weight:800; text-align:left;">조심해야 할 아킬레스건 (약점)</div>
                                                    <div style="background:rgba(0,0,0,0.02); padding:12px 14px; border-radius:12px; font-size:0.9rem; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:10px; border-left:4px solid #ef4444; border-top:1px solid rgba(0,0,0,0.05); border-right:1px solid rgba(0,0,0,0.05); border-bottom:1px solid rgba(0,0,0,0.05);">
                                                        <span style="font-size:1.2rem;">${rpgStats?.weaknessIcon}</span> <span style="opacity:0.9;">${rpgStats?.weakness}</span>
                                                    </div>
                                                </div>
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

                    <div style="margin-top: 1rem;" data-html2canvas-ignore="true">
                        <button id="result-random-test-btn" class="btn-primary" style="width:100%; height:56px; border:none; border-radius:18px; background:linear-gradient(135deg,#111827 0%, #334155 50%, ${themeColor} 100%); color:#fff; font-size:0.98rem; font-weight:850; display:flex; align-items:center; justify-content:center; gap:0.55rem; box-shadow:0 14px 28px rgba(15,23,42,0.16);">
                            <span>🎲</span> 나를 위한 다른 추천 보기
                        </button>
                    </div>

                    <div style="margin-top: 0.85rem;" data-html2canvas-ignore="true">
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

            <div id="story-capture-area" style="position: absolute; top: 0; left: 0; z-index: -100; opacity: 0; pointer-events: none; width: 600px; height: 600px; background: ${themeColor}; color: #fff; overflow: hidden; font-family: 'Pretendard', -apple-system, sans-serif; box-sizing: border-box;">
                <div style="width: 100%; height: 100%; position: relative; overflow: hidden; display: flex; flex-direction: column; box-shadow: inset 0 0 100px rgba(0,0,0,0.15);">
                    <!-- Decorative patterns -->
                    <div style="position: absolute; top: -60px; right: -60px; width: 250px; height: 250px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -40px; left: -40px; width: 180px; height: 180px; background: rgba(255,255,255,0.05); border-radius: 40px; transform: rotate(15deg);"></div>
                    
                    <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; padding: 35px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); color: #fff; padding: 6px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 900; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.3);">SEVEN CHECK REPORT</div>
                            <div style="color: rgba(255,255,255,0.8); font-size: 0.75rem; font-weight: 700;">No. ${testId.toUpperCase()}</div>
                        </div>

                        <div style="display: flex; gap: 25px; align-items: center; margin-bottom: 25px;">
                            <div style="width: 140px; height: 140px; flex-shrink: 0; border-radius: 35px; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 5.5rem; box-shadow: 0 15px 30px rgba(0,0,0,0.1); border: 4px solid rgba(255,255,255,0.5);">
                                ${tags[0]?.replace(/[^a-zA-Z0-9가-힣]/g, '') === '신뢰' ? '🤝' : (tags[0]?.replace(/[^a-zA-Z0-9가-힣]/g, '') === '유니크' ? '🎨' : '✨')}
                            </div>
                            <div style="text-align: left;">
                                <span style="color: rgba(255,255,255,0.9); font-size: 0.9rem; font-weight: 800; margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.05em;">Analysis Result</span>
                                <div style="color: rgba(255,255,255,0.82); font-size: 0.86rem; font-weight: 800; margin-bottom: 8px; line-height: 1.35; word-break: keep-all;">${test.title}</div>
                                <h2 style="font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 10px; line-height: 1.2; text-shadow: 0 2px 10px rgba(0,0,0,0.1); word-break: keep-all;">${result.title}</h2>
                                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                    ${tags.map(tag => `<span style="background:rgba(255,255,255,0.2); color:#fff; padding:4px 12px; border-radius:50px; font-size:0.8rem; font-weight:800; border: 1px solid rgba(255,255,255,0.1);">${tag}</span>`).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- 영혼 분석서 섹션 -->
                        <div style="background: rgba(255,255,255,0.15); border-radius: 24px; padding: 20px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.2);">
                            <div style="font-size: 0.9rem; font-weight: 900; color: #fff; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                🔮 나의 영혼 분석서
                            </div>
                            <div style="font-size: 0.85rem; color: #fff; font-weight: 600; line-height: 1.6; word-break: keep-all; opacity: 0.95;">
                                ${result.desc.length > 120 ? result.desc.substring(0, 117) + '...' : result.desc}
                            </div>
                        </div>

                        <!-- 현실 생존 가이드 섹션 -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                            <div style="background: rgba(255,255,255,0.15); border-radius: 20px; padding: 15px; border: 1px solid rgba(255,255,255,0.2);">
                                <div style="font-size: 0.75rem; font-weight: 900; color: rgba(255,255,255,0.8); margin-bottom: 8px;">🛡️ 핵심 무기</div>
                                <div style="font-size: 0.9rem; font-weight: 900; color: #fff;">${rpgStats?.weaponIcon} ${rpgStats?.weapon}</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.15); border-radius: 20px; padding: 15px; border: 1px solid rgba(255,255,255,0.2);">
                                <div style="font-size: 0.75rem; font-weight: 900; color: rgba(255,255,255,0.8); margin-bottom: 8px;">⚠️ 약점 주의</div>
                                <div style="font-size: 0.9rem; font-weight: 900; color: #fff;">${rpgStats?.weaknessIcon} ${rpgStats?.weakness}</div>
                            </div>
                        </div>

                        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end;">
                            <div style="text-align: left;">
                                <div style="color: #fff; font-size: 1.4rem; font-weight: 900; letter-spacing: -0.02em;">SevenCheck</div>
                                <div style="color: rgba(255,255,255,0.6); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">Premium Analysis</div>
                            </div>
                            <div style="width: 45px; height: 45px; border: 2px solid rgba(255,255,255,0.4); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; background: rgba(255,255,255,0.1);">🦊</div>
                        </div>
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

    const resultShareBtn = document.getElementById('result-share-btn');
    if (resultShareBtn) {
        resultShareBtn.onclick = async () => {
            const testUrl = getShareUrl(testId);
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

    const randomTestBtn = document.getElementById('result-random-test-btn');
    if (randomTestBtn && surpriseTest) {
        randomTestBtn.onclick = () => {
            location.hash = `#test/${surpriseTest.id}`;
        };
    }
}

export function renderTestExecution(testId) {
    const app = document.getElementById('app');
    const test = TESTS.find(t => t.id === testId);
    if (!test) return;
    const introSurpriseTest = TESTS
        .filter((candidate) => candidate.id !== testId)
        .sort(() => 0.5 - Math.random())[0];
    let step = 0;
    
    // Initialize traitScores dynamically based on test configuration or default to standard traits
    const traits = test.customTraits || ['energy', 'logic', 'empathy', 'creativity'];
    const traitScores = {};
    traits.forEach(t => traitScores[t] = 0);

    let history = [];

    const renderIntro = () => {
        const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradients = [
            'linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)', // Indigo light
            'linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)', // Green light
            'linear-gradient(135deg, #ffe4e6 0%, #ffffff 100%)', // Rose light
            'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)', // Amber light
            'linear-gradient(135deg, #ede9fe 0%, #ffffff 100%)', // Violet light
            'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)'  // Sky light
        ];
        const pageBg = gradients[seed % gradients.length];

        app.innerHTML = `
            <div class="test-page-wrapper" style="min-height: 100vh; background: ${pageBg};">
                <div class="test-intro-container fade-in" style="padding: 4rem 1.5rem 4rem; max-width: 500px; margin: 0 auto; text-align: center;">
                    <div style="display:flex; justify-content:center; margin-bottom:1.1rem;">
                        <button id="test-surprise-btn" class="btn-secondary" style="width:auto; max-width:100%; padding:0.9rem 1.2rem; border-radius:999px; font-size:0.9rem; font-weight:850; display:flex; align-items:center; justify-content:center; gap:0.45rem; background:rgba(255,255,255,0.72); border:1px solid rgba(0,0,0,0.05); box-shadow:0 10px 22px rgba(15,23,42,0.05);">
                            <span>🎲</span> 나를 위한 다른 추천 보기
                        </button>
                    </div>
                    <div class="test-visual-header" style="margin-top: 1rem; margin-bottom: 2.5rem; position: relative;">
                        <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.9;">✨</div>
                        <span class="test-category-tag" style="display: inline-block; font-size: 0.85rem; font-weight: 800; color: var(--accent-color); background: rgba(255, 255, 255, 0.7); padding: 6px 16px; border-radius: 50px; letter-spacing: 0.05em; margin-bottom: 1rem; border: 1px solid rgba(0,0,0,0.05);">
                            ${test.category} 분석 리포트
                        </span>
                        <h2 style="font-size: 2.2rem; font-weight: 900; line-height: 1.3; color: #1e293b; word-break: keep-all; margin: 0; letter-spacing: -0.02em;">${test.title}</h2>
                    </div>

                    <div class="card" style="padding: 2.5rem 2rem; margin-bottom: 3rem; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border-radius: 30px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 10px 30px rgba(0,0,0,0.04); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -10px; left: -10px; font-size: 5rem; opacity: 0.03; pointer-events: none;">💬</div>
                        <p style="font-size: 1.1rem; line-height: 1.8; color: #334155; font-weight: 600; word-break: keep-all; position: relative; z-index: 1;">${test.desc}</p>
                    </div>

                    <div style="display: grid; gap: 1rem;">
                        <button id="test-start-btn" class="btn-primary" style="height: 70px; font-size: 1.25rem; font-weight: 900; border-radius: 24px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);">분석 시작하기</button>
                        <button id="test-share-btn" class="btn-secondary" style="height: 60px; font-size: 1rem; font-weight: 800; border-radius: 24px; display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(255, 255, 255, 0.5); border: 1px solid rgba(0,0,0,0.05);">🔗 친구에게 공유하기</button>
                    </div>

                    <button onclick="location.hash='#7check'" style="margin-top: 2.5rem; background: none; border: none; color: #64748b; font-weight: 700; font-size: 0.95rem; text-decoration: underline; cursor: pointer; opacity: 0.8;">다른 테스트 둘러보기</button>
                </div>
            </div>
        `;

        const startBtn = document.getElementById('test-start-btn');
        if (startBtn) startBtn.onclick = () => {
            scrollTestViewToTop();
            updateStep();
        };

        const surpriseBtn = document.getElementById('test-surprise-btn');
        if (surpriseBtn && introSurpriseTest) {
            surpriseBtn.onclick = () => {
                location.hash = `#test/${introSurpriseTest.id}`;
            };
        }

        const shareBtn = document.getElementById('test-share-btn');
        if (shareBtn) {
            shareBtn.onclick = async () => {
                const siteUrl = getShareUrl(testId);
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
        const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradients = [
            'linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)',
            'linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)',
            'linear-gradient(135deg, #ffe4e6 0%, #ffffff 100%)',
            'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
            'linear-gradient(135deg, #ede9fe 0%, #ffffff 100%)',
            'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)'
        ];
        const pageBg = gradients[seed % gradients.length];

        if (step >= test.questions.length) {
            renderLoading();
            return;
        }

        const q = test.questions[step];
        const progress = (step / test.questions.length) * 100;

        app.innerHTML = `
            <div class="test-page-wrapper" style="min-height: 100vh; background: ${pageBg};">
                <div class="test-progress-container" style="position:fixed; top:0; left:0; width:100%; border-radius:0; height:8px; margin-bottom:0; z-index:2000;">
                    <div class="test-progress-bar" style="width: ${progress}%;"></div>
                </div>
                <div class="fade-in" style="padding: 4rem 1.5rem; max-width: 600px; margin: 0 auto; text-align: center; min-height: 90vh; display: flex; flex-direction: column; justify-content: center;">
                    <div style="margin-bottom: 3rem;">
                        <span style="font-size: 1rem; font-weight: 900; color: var(--accent-color); letter-spacing: 0.1em; opacity: 0.8;">QUESTION ${step + 1}</span>
                        <h2 style="font-size: 1.7rem; margin-top: 1.5rem; line-height: 1.5; color: #1e293b; font-weight: 800; word-break: keep-all;">${q.q}</h2>
                    </div>
                    <div class="test-options" style="display: grid; gap: 1rem;">
                        ${q.options.map((opt, i) => `
                            <button class="test-option-btn slide-up"
                                    style="animation-delay: ${i * 0.1}s; padding: 1.5rem; border-radius: 20px; text-align: center; justify-content: center; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.8); font-weight: 700; color: #334155; box-shadow: 0 4px 15px rgba(0,0,0,0.03);"
                                    onclick="window.handleAnswer(${i})">
                                ${opt.text}
                            </button>
                        `).join('')}
                    </div>
                    <div style="margin-top: 3rem; font-size: 0.9rem; font-weight: 700; color: #64748b; opacity: 0.6;">
                        ${step + 1} / ${test.questions.length}
                    </div>
                </div>
            </div>
        `;

        scrollTestViewToTop();

        window.handleAnswer = (idx) => {
            const opt = q.options[idx];
            history.push({ traitScores: { ...traitScores }, step: step });

            if (opt.scores) {
                for (const k in opt.scores) traitScores[k] += opt.scores[k];
            } else if (opt.type) {
                if (test.customTraits && test.customTraits.includes(opt.type)) {
                     traitScores[opt.type] = (traitScores[opt.type] || 0) + 1;
                } else {
                    if (opt.type === 'A') traitScores.energy = (traitScores.energy || 0) + 2;
                    else traitScores.empathy = (traitScores.empathy || 0) + 2;
                }
            }

            step++;
            scrollTestViewToTop();
            updateStep();
        };
    };

    const renderLoading = () => {
        app.innerHTML = `
            <div class="test-page-wrapper" style="min-height: 100vh; background: #ffffff; display: flex; align-items: center; justify-content: center;">
                <div class="fade-in" style="padding: 4rem 1.5rem; max-width: 500px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div class="alchemy-animation" style="margin-bottom: 2rem; background: none; border: none; box-shadow: none;">
                        <span style="font-size: 5rem; display: block; animation: bounce 1s infinite; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.05));">🧪</span>
                    </div>
                    <h2 style="font-size: 1.6rem; font-weight: 900; margin-bottom: 1rem; color: #1e293b; letter-spacing: -0.02em;">분석 리포트를 작성 중입니다...</h2>
                    <p style="color: #64748b; font-weight: 600; font-size: 1rem;">당신의 답변을 바탕으로 인생 보고서를 생성하고 있습니다.</p>
                    <div class="test-progress-container" style="width: 180px; margin-top: 2.5rem; background: rgba(0,0,0,0.03); height: 6px; border-radius: 10px; overflow: hidden;">
                        <div class="test-progress-bar" style="width: 100%; height: 100%; background: var(--accent-color); animation: pulse 1.5s infinite;"></div>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => renderResult(testId, traitScores), 2000);
    };

    renderIntro();
}
