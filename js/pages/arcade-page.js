import { UserState, usePoints, updateUI } from '../auth.js?v=8.3.2';
import { initArcade } from '../arcade.js';
import { db } from '../firebase-init.js?v=8.3.2';
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export function renderArcade() {
    const app = document.getElementById('app');
    const isLoggedIn = !!UserState.user;
    const userData = UserState.data || {};
    const lastGrade = sessionStorage.getItem('last_alchemy_grade') || 'COMMON';

    app.innerHTML = `
        <div class="arcade-page fade-in">
            <div class="card arcade-header" style="text-align:center; padding: 2.5rem 1.5rem; background: linear-gradient(135deg, var(--accent-color), var(--accent-soft)); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                <h2 style="font-size: 2.2rem; font-weight: 900; margin-bottom: 0.5rem; position: relative;">🎰 SEVEN ARCADE</h2>
                <p style="opacity: 0.9; font-size: 1rem; font-weight: 600; position: relative;">매일 즐거운 게임과 포인트 혜택!</p>
                
                ${isLoggedIn ? `
                <div class="arcade-user-stats" style="display: inline-flex; justify-content: center; gap: 2rem; margin-top: 2rem; background: rgba(255,255,255,0.2); padding: 0.8rem 2rem; border-radius: 50px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); position: relative;">
                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:0.85rem; font-weight:700;">내 포인트:</span><span id="user-points" style="font-weight:900; font-size: 1.1rem;">0</span></div>
                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:0.85rem; font-weight:700;">부스터:</span><span style="font-weight:900; font-size: 1.1rem;">${userData.boosterCount || 0}회</span></div>
                </div>
                ` : `
                <button class="btn-primary" onclick="document.getElementById('login-btn')?.click()" style="margin-top: 1.5rem; background: #fff; color: var(--accent-color); font-weight: 800; border: none; padding: 0.6rem 2rem; border-radius: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">지금 로그인하고 포인트 받기 ➔</button>
                `}
            </div>

            ${isLoggedIn ? `
            <details class="profile-details quest-section fade-in" style="margin-bottom: 2rem; border: 2px solid var(--accent-soft);">
                <summary id="quest-summary" style="font-size:1.1rem; font-weight:800;">📜 일일 퀘스트 (로딩 중...)</summary>
                <div id="daily-quest-list" class="content-area"></div>
            </details>
            ` : ''}

            <div class="arcade-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">📅 일일 출석체크</h3>
                        <span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">FREE</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">하루 한 번, 클릭만으로 <strong>100P</strong>를 즉시 획득하세요.</p>
                    <button id="daily-checkin-btn" class="btn-primary" style="width:100%; background:#10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">출석체크 완료하기</button>
                </div>

                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">⛏️ 포인트 채굴</h3>
                        <span style="background: rgba(99, 102, 241, 0.1); color: var(--accent-color); padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">LIMITLESS</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">채굴기를 가동하여 무작위 포인트를 생산합니다. (5~15P)</p>
                    <button id="click-game-btn" class="btn-primary" style="width:100%; height:55px; background:linear-gradient(90deg, var(--accent-color), #8b5cf6);">채굴기 가동 시작</button>
                </div>

                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🎰 이모지 슬롯</h3>
                        <span style="background: rgba(253, 160, 133, 0.1); color: #fda085; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">JACKPOT</span>
                    </div>
                    <div id="slot-machine-container" style="height:100px; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:1.25rem; border:2px solid #fda085; border-radius:15px; background:rgba(253,160,133,0.05); font-size: 3rem; overflow: hidden;">
                        <div class="slot-reel" id="slot-1">🎰</div>
                        <div class="slot-reel" id="slot-2">🎰</div>
                        <div class="slot-reel" id="slot-3">🎰</div>
                    </div>
                    <button id="slot-spin-btn" class="btn-primary" style="width:100%; background:#fda085; box-shadow: 0 4px 14px rgba(253, 160, 133, 0.3); height:55px; font-weight: 800;">슬롯 돌리기 (300P)</button>
                </div>

                <div class="card arcade-item-card" style="margin-bottom:0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">📦 아이템 뽑기</h3>
                        <span style="background: rgba(var(--accent-rgb), 0.1); color: var(--accent-color); padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">GACHA</span>
                    </div>

                    <div id="gacha-result" class="gacha-box" style="min-height:75px; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; border:2px dashed var(--border-color); border-radius:15px; text-align:center; font-size:0.9rem; background:rgba(0,0,0,0.02); font-weight: 600; padding: 10px;">희귀 아이템이 쏟아집니다</div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.5rem; margin-top: 0.5rem;">
                        <div style="position:relative;">
                            <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--accent-color); color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">100P</span>
                            <button id="gacha-btn" class="btn-primary" style="background:var(--accent-color); font-size:0.8rem; width:100%; height:55px; font-weight:800; padding-top:5px; border:none;">1회 뽑기</button>
                        </div>
                        <div style="position:relative;">
                            <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--accent-color); color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">950P 🔥</span>
                            <button id="gacha-10-btn" class="btn-primary" style="background:var(--accent-color); font-size:0.8rem; width:100%; height:55px; font-weight:800; padding-top:5px; border:none;">10회 뽑기</button>
                        </div>
                        <div style="position:relative;">
                            <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#f43f5e; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">2,700P 🔥</span>
                            <button id="gacha-30-btn" class="btn-primary" style="background:#f43f5e; font-size:0.8rem; width:100%; height:55px; font-weight:800; padding-top:5px; border:none;">30회 뽑기</button>
                        </div>
                    </div>
                </div>

                <div class="card arcade-item-card dice-card" style="margin-bottom:0; border: 2px solid #10b981; background: rgba(16, 185, 129, 0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🎲 주사위 3개 베팅</h3>
                        <span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">BIG/SMALL</span>
                    </div>

                    <div style="background: var(--bg-color); padding: 1rem; border-radius: 15px; margin-bottom: 1.25rem; border: 1px solid var(--border-color); text-align:center;">
                        <label style="display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-sub); margin-bottom: 0.5rem; letter-spacing: 0.05em;">베팅 금액 (10P ~ 10,000P)</label>
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <span style="font-size:1.2rem; font-weight:900; color:#10b981;">₩</span>
                            <input type="number" id="bet-amount" value="100" min="10" max="10000" step="10"
                                   style="width:120px; background: transparent; border: none; text-align:center; font-size:1.8rem; font-weight:900; color: var(--text-main); outline: none; border-bottom: 2px solid #10b981; padding: 0;">
                            <span style="font-size:1.2rem; font-weight:900; color:var(--text-sub);">P</span>
                        </div>
                    </div>

                    <div id="bet-result-msg" style="text-align:center; font-weight:800; margin-bottom:1.25rem; min-height:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(16, 185, 129, 0.05); border-radius:12px; padding: 15px; border: 1px dashed #10b981;">
                        <div id="dice-display" style="display:flex; gap:20px; margin-bottom: 12px; transition: all 0.3s ease; height: 70px; align-items: center;">
                            <div class="dice-container">
                                <div class="dice show-1" id="dice-cube-1">
                                    <div class="dice-face face-1"><div class="dot"></div></div>
                                    <div class="dice-face face-2"><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-3"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-4"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-5"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-6"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                </div>
                            </div>
                            <div class="dice-container">
                                <div class="dice show-1" id="dice-cube-2">
                                    <div class="dice-face face-1"><div class="dot"></div></div>
                                    <div class="dice-face face-2"><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-3"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-4"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-5"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-6"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                </div>
                            </div>
                            <div class="dice-container">
                                <div class="dice show-1" id="dice-cube-3">
                                    <div class="dice-face face-1"><div class="dot"></div></div>
                                    <div class="dice-face face-2"><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-3"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-4"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-5"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                    <div class="dice-face face-6"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                </div>
                            </div>
                        </div>
                        <div id="dice-status-text" style="color:var(--text-sub); font-size: 0.85rem;">행운의 숫자를 기대하세요!</div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.6rem;">
                        <div style="position:relative;">
                            <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#10b981; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">3.5배 ✨</span>
                            <button class="bet-btn btn-primary" style="background:#10b981; font-weight: 900; width:100%; height:60px; padding-top:5px; border:none; border-radius:12px;" data-game="dice3" data-choice="small">소(3~8)</button>
                        </div>
                        <div style="position:relative;">
                            <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#3b82f6; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">2배 ✨</span>
                            <button class="bet-btn btn-primary" style="background:#3b82f6; font-weight: 900; width:100%; height:60px; padding-top:5px; border:none; border-radius:12px;" data-game="dice3" data-choice="middle">중(9~12)</button>
                        </div>
                        <div style="position:relative;">
                            <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#f59e0b; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">3.5배 ✨</span>
                            <button class="bet-btn btn-primary" style="background:#f59e0b; font-weight: 900; width:100%; height:60px; padding-top:5px; border:none; border-radius:12px;" data-game="dice3" data-choice="big">대(13~18)</button>
                        </div>
                    </div>
                </div>

                <div class="card arcade-item-card alchemy-card" style="margin-bottom:0; display: flex; flex-direction: column; border: 2px solid #8b5cf6; background: rgba(139, 92, 246, 0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">⚗️ 아이템 연금술</h3>
                        <span style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">UPGRADE</span>
                    </div>

                    <div style="background:var(--bg-color); padding:1.25rem 1rem; border-radius:12px; margin-bottom:1.25rem; border: 1px solid var(--border-color); text-align:center;">
                        <p style="font-size:0.75rem; font-weight:800; color:var(--text-sub); margin-bottom:1rem;">연성할 재료 등급 선택<br><span style="color:var(--accent-color); font-size:0.65rem;">(동일 등급 재료 6개 소모)</span></p>

                        <div class="alchemy-grade-boxes" id="alchemy-grade-boxes">
                            <div class="alchemy-grade-box ${lastGrade === 'COMMON' ? 'active' : ''}" data-grade="COMMON">
                                <span class="g-icon">💩</span>
                                <span class="g-name">일반</span>
                                <span class="g-count" id="count-COMMON">0</span>
                            </div>
                            <div class="alchemy-grade-box ${lastGrade === 'UNCOMMON' ? 'active' : ''}" data-grade="UNCOMMON">
                                <span class="g-icon">🥈</span>
                                <span class="g-name">고급</span>
                                <span class="g-count" id="count-UNCOMMON">0</span>
                            </div>
                            <div class="alchemy-grade-box ${lastGrade === 'RARE' ? 'active' : ''}" data-grade="RARE">
                                <span class="g-icon">💎</span>
                                <span class="g-name">희귀</span>
                                <span class="g-count" id="count-RARE">0</span>
                            </div>
                        </div>
                    </div>

                    <div id="alchemy-result" style="text-align:center; font-weight:800; color:#8b5cf6; margin-bottom:1.25rem; min-height:60px; font-size:0.85rem; display:flex; align-items:center; justify-content:center; background:rgba(139, 92, 246, 0.05); border-radius:10px; padding: 0.5rem;">금단의 연성법을 시전합니다</div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.5rem; margin-top: 0.5rem;">
                        <div style="position:relative;">
                            <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#8b5cf6; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">500P</span>
                            <button id="alchemy-btn" class="btn-primary" style="background:#8b5cf6; font-size:0.8rem; width:100%; height:55px; font-weight:800; padding-top:5px; border:none;">1회 연성</button>
                        </div>
                        <div style="position:relative;">
                            <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#7c3aed; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">2,200P 🔥</span>
                            <button id="alchemy-5-btn" class="btn-primary" style="background:#7c3aed; font-size:0.8rem; width:100%; height:55px; font-weight:800; padding-top:5px; border:none;">5회 연성</button>
                        </div>
                        <div style="position:relative;">
                            <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#6d28d9; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">4,000P 🔥</span>
                            <button id="alchemy-10-btn" class="btn-primary" style="background:#6d28d9; font-size:0.8rem; width:100%; height:55px; font-weight:800; padding-top:5px; border:none;">10회 연성</button>
                        </div>
                    </div>
                </div>

                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🧨 폭탄 돌리기</h3>
                        <span style="background: rgba(244, 63, 94, 0.1); color: #f43f5e; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">DANGER</span>
                    </div>
                    <p id="bomb-msg" class="text-sub" style="font-size:0.9rem; margin-bottom:1rem; text-align: center; min-height: 24px;">전선을 선택하세요! (현재 누적: 0P)</p>
                    <div id="bomb-wires" style="display:grid; grid-template-columns: repeat(5, 1fr); gap:0.5rem; margin-bottom:1.5rem;">
                        <button class="wire-btn" data-wire="0" style="height:60px; background:#ef4444; border:none; border-radius:8px;"></button>
                        <button class="wire-btn" data-wire="1" style="height:60px; background:#3b82f6; border:none; border-radius:8px;"></button>
                        <button class="wire-btn" data-wire="2" style="height:60px; background:#10b981; border:none; border-radius:8px;"></button>
                        <button class="wire-btn" data-wire="3" style="height:60px; background:#f59e0b; border:none; border-radius:8px;"></button>
                        <button class="wire-btn" data-wire="4" style="height:60px; background:#8b5cf6; border:none; border-radius:8px;"></button>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.6rem;">
                        <button id="bomb-start-btn" class="btn-primary" style="background:#f43f5e; font-size:0.8rem; height:50px;">게임 시작 (300P)</button>
                        <button id="bomb-claim-btn" class="btn-secondary" style="font-size:0.8rem; height:50px; border-color:#f43f5e; color:#f43f5e;" disabled>포인트 챙기기</button>
                    </div>
                </div>

                <div class="card arcade-item-card market-card" style="margin-bottom:0; border: 2px solid var(--accent-secondary); background: rgba(16, 185, 129, 0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🏪 아이템 중고장터</h3>
                        <span style="background: var(--accent-secondary); color: #fff; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">BULK SELL</span>
                    </div>
                    <p class="text-sub" style="font-size:0.85rem; margin-bottom:1.5rem; line-height:1.4;">보유한 아이템을 포인트로 대량 환전하세요.<br>(아이템 가치의 <strong>70%</strong> 환급)</p>
                    <div id="market-ui-container"></div>
                    <button id="market-open-btn" class="btn-secondary" style="width:100%; border-width: 2px; border-color:var(--accent-secondary); color:var(--accent-secondary); font-weight: 800;">아이템 일괄 판매 열기</button>
                </div>
            </div>

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

    // 기존 리스너들이 UserState.user를 체크하도록 오버라이드
    document.querySelectorAll('.arcade-item-card button, .bet-btn, .wire-btn, #buy-booster-btn').forEach(btn => {
        const originalOnClick = btn.onclick;
        btn.onclick = (e) => {
            if (!UserState.user) {
                alert("이 기능을 이용하려면 로그인이 필요합니다. 🎰");
                document.getElementById('login-btn')?.click();
                return;
            }
            if (originalOnClick) originalOnClick.call(btn, e);
        };
    });

    if (isLoggedIn) updateUI();
}
