import fs from 'fs';

let content = fs.readFileSync('js/pages/tests.js', 'utf8');

const oldCaptureAreaRegex = /<div id="story-capture-area"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newCaptureArea = `
            <div id="story-capture-area" style="position: absolute; top: 0; left: 0; z-index: -100; opacity: 0; pointer-events: none; width: 420px; background: #fff; color: var(--text-main); overflow: hidden; font-family: 'Pretendard', -apple-system, sans-serif; display: flex; flex-direction: column; box-sizing: border-box; border-radius: 24px; box-shadow: 0 0 40px rgba(0,0,0,0.1);">
                <div style="background: \${themeColor}; padding: 30px 25px; text-align: center; color: #fff; border-radius: 0 0 24px 24px;">
                    <div style="font-size: 0.8rem; font-weight: 800; letter-spacing: 0.05em; opacity: 0.9; margin-bottom: 10px;">\${test.title}</div>
                    <h2 style="font-size: 2rem; font-weight: 900; margin: 0 0 15px 0; line-height: 1.2; word-break: keep-all;">\${result.title}</h2>
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
                        \${tags.map(tag => \`<span style="background:rgba(255,255,255,0.2); padding:4px 12px; border-radius:50px; font-size:0.75rem; font-weight:700;">\${tag}</span>\`).join('')}
                    </div>
                </div>
                
                <div style="padding: 25px;">
                    <div style="background: rgba(0,0,0,0.03); padding: 15px; border-radius: 12px; margin-bottom: 25px; font-size: 0.9rem; line-height: 1.6; font-weight: 600; color: #475569; text-align: center; word-break: keep-all;">
                        \${result.desc}
                    </div>

                    <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 15px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 1rem; color: #1e293b; font-weight: 900; text-align: center;">🔮 나의 영혼 분석서</h4>
                        
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 0.8rem; font-weight: 800; color: \${themeColor}; margin-bottom: 10px;">🧪 나를 만든 연금술 레시피</div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.02); padding: 8px 10px; border-radius: 8px;">
                                    <div style="font-weight: 900; color: \${themeColor}; font-size: 0.9rem;">70%</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 800; font-size: 0.8rem; color: #334155;">\${soulIngredients.main.title}</div>
                                        <div style="font-size: 0.7rem; color: #64748b;">\${soulIngredients.main.desc}</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.02); padding: 8px 10px; border-radius: 8px;">
                                    <div style="font-weight: 800; color: #64748b; font-size: 0.85rem;">20%</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 800; font-size: 0.8rem; color: #334155;">\${soulIngredients.sub1.title}</div>
                                        <div style="font-size: 0.7rem; color: #64748b;">\${soulIngredients.sub1.desc}</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.02); padding: 8px 10px; border-radius: 8px;">
                                    <div style="font-weight: 700; color: #94a3b8; font-size: 0.8rem;">10%</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 800; font-size: 0.8rem; color: #334155;">\${soulIngredients.sub2.title}</div>
                                        <div style="font-size: 0.7rem; color: #64748b;">\${soulIngredients.sub2.desc}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style="font-size: 0.8rem; font-weight: 800; color: \${themeColor}; margin-bottom: 10px;">⚔️ 현실 생존 가이드</div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="background: rgba(0,0,0,0.02); padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 1.1rem;">\${rpgStats.weaponIcon}</span>
                                    <div>
                                        <div style="font-size: 0.65rem; color: #64748b; font-weight: 700; margin-bottom: 2px;">치명적인 무기 (장점)</div>
                                        <div style="font-size: 0.85rem; font-weight: 800; color: #334155;">\${rpgStats.weapon}</div>
                                    </div>
                                </div>
                                <div style="background: rgba(239,68,68,0.05); padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 8px; border-left: 3px solid #ef4444;">
                                    <span style="font-size: 1.1rem;">\${rpgStats.weaknessIcon}</span>
                                    <div>
                                        <div style="font-size: 0.65rem; color: #ef4444; font-weight: 700; margin-bottom: 2px;">아킬레스건 (약점)</div>
                                        <div style="font-size: 0.85rem; font-weight: 800; color: #334155;">\${rpgStats.weakness}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 15px 0 25px 0; background: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 24px 24px;">
                    <div style="font-size: 0.85rem; font-weight: 900; color: #cbd5e1; letter-spacing: 0.2em;">7CHECK REPORT</div>
                </div>
            </div>
        </div>`;

content = content.replace(oldCaptureAreaRegex, newCaptureArea);

fs.writeFileSync('js/pages/tests.js', content, 'utf8');
