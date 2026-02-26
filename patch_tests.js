import fs from 'fs';

let content = fs.readFileSync('js/pages/tests.js', 'utf8');

// 1. 레이더 차트 컨테이너 부분 교체
const newUi = `                    <div class="soul-analysis-container" style="background: var(--bg-color); border-radius: 20px; padding: 2rem 1.5rem; margin-bottom: 2.5rem; border: 1px solid var(--border-color); position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        <h4 style="margin-bottom: 1.5rem; font-size: 1rem; color: var(--text-main); font-weight: 900; letter-spacing: 0.05em; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <span style="font-size:1.2rem;">🔮</span> 나의 영혼 분석서
                        </h4>

                        <!-- Part 1: 연금술 레시피 -->
                        <div style="background:rgba(0,0,0,0.02); padding:1.2rem; border-radius:16px; margin-bottom:1.5rem;">
                            <h5 style="font-size:0.8rem; color:var(--text-sub); margin-bottom:1rem; display:flex; align-items:center; gap:6px;"><span style="font-size:1rem;">🧪</span> 나를 만든 연금술 레시피</h5>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="width:40px; height:40px; border-radius:10px; background:\${themeColor}22; color:\${themeColor}; display:flex; align-items:center; justify-content:center; font-size:1.2rem; font-weight:900;">70%</div>
                                    <div style="flex:1;">
                                        <div style="font-weight:800; font-size:0.9rem; color:var(--text-main);">\${soulIngredients.main.title}</div>
                                        <div style="font-size:0.75rem; color:var(--text-sub);">\${soulIngredients.main.desc}</div>
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="width:40px; height:40px; border-radius:10px; background:rgba(0,0,0,0.05); color:var(--text-main); display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:800;">20%</div>
                                    <div style="flex:1;">
                                        <div style="font-weight:800; font-size:0.85rem; color:var(--text-main);">\${soulIngredients.sub1.title}</div>
                                        <div style="font-size:0.75rem; color:var(--text-sub);">\${soulIngredients.sub1.desc}</div>
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="width:40px; height:40px; border-radius:10px; background:rgba(0,0,0,0.03); color:var(--text-sub); display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:700;">10%</div>
                                    <div style="flex:1;">
                                        <div style="font-weight:800; font-size:0.85rem; color:var(--text-main);">\${soulIngredients.sub2.title}</div>
                                        <div style="font-size:0.75rem; color:var(--text-sub);">\${soulIngredients.sub2.desc}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Part 2: RPG 생존 무기 -->
                        <div style="background:var(--card-bg); padding:1.2rem; border-radius:16px; border:1px solid var(--border-color);">
                            <h5 style="font-size:0.8rem; color:\${themeColor}; margin-bottom:1rem; display:flex; align-items:center; gap:6px;"><span style="font-size:1rem;">⚔️</span> 현실 생존 가이드</h5>
                            
                            <div style="margin-bottom:12px;">
                                <div style="font-size:0.75rem; color:var(--text-sub); margin-bottom:4px; font-weight:700;">가장 치명적인 무기 (장점)</div>
                                <div style="background:rgba(0,0,0,0.02); padding:10px 12px; border-radius:10px; font-size:0.85rem; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:8px;">
                                    <span>\${rpgStats.weaponIcon}</span> <span>\${rpgStats.weapon}</span>
                                </div>
                            </div>
                            
                            <div>
                                <div style="font-size:0.75rem; color:var(--text-sub); margin-bottom:4px; font-weight:700;">조심해야 할 아킬레스건 (약점)</div>
                                <div style="background:rgba(0,0,0,0.02); padding:10px 12px; border-radius:10px; font-size:0.85rem; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:8px; border-left:3px solid #ef4444;">
                                    <span>\${rpgStats.weaknessIcon}</span> <span style="opacity:0.9;">\${rpgStats.weakness}</span>
                                </div>
                            </div>
                        </div>
                    </div>`;

// 정규식으로 레이더 차트 컨테이너 찾아서 교체
content = content.replace(/<div class="radar-chart-container"[\s\S]*?<\/div>\s*<\/div>/, newUi);

// 2. stats 객체 바로 아래에 새로운 데이터풀(ingredientPool, weaponPool) 삽입
const dataPools = `
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

    const mainIngredient = ingredientPool[dominantTrait][Math.floor(Math.random() * ingredientPool[dominantTrait].length)];
    const otherTraits = traits.filter(t => t !== dominantTrait).sort(() => 0.5 - Math.random());
    const sub1Ingredient = ingredientPool[otherTraits[0]][Math.floor(Math.random() * ingredientPool[otherTraits[0]].length)];
    const sub2Ingredient = ingredientPool[otherTraits[1]][Math.floor(Math.random() * ingredientPool[otherTraits[1]].length)];
    
    const soulIngredients = { main: mainIngredient, sub1: sub1Ingredient, sub2: sub2Ingredient };
    const rpgStats = weaponPool[dominantTrait];
`;

content = content.replace(/const stats = {[\s\S]*?};\n/, `$&${dataPools}\n`);

// 3. 더 이상 쓰이지 않는 레이더 캔버스 그리는 부분 지우기
content = content.replace(/const canvas = document\.getElementById\('radarChart'\);[\s\S]*?ctx\.stroke\(\);\n\s+}/, '');

// 4. 더 이상 쓰이지 않는 프로그레스 바 setTimeout 코드 지우기 (파일 끝부분에 있을 확률이 큼)
content = content.replace(/\/\/ 프로그레스 바 애니메이션 실행[\s\S]*?\}, 100\);/, '');

fs.writeFileSync('js/pages/tests.js', content, 'utf8');
