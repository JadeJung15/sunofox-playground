import { UserState, usePoints, updateUI } from '../auth.js?v=7.1.0';
import { initArcade } from '../arcade.js';
import { db } from '../firebase-init.js?v=7.1.0';
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
                <!-- ... 게임 카드 섹션들 ... -->
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
                        <div style="position:relative;"><button id="gacha-btn" class="btn-primary" style="background:var(--accent-color); font-size:0.8rem; width:100%; height:55px; font-weight:800; padding-top:5px; border:none;">1회 뽑기</button></div>
                        <div style="position:relative;"><button id="gacha-10-btn" class="btn-primary" style="background:var(--accent-color); font-size:0.8rem; width:100%; height:55px; font-weight:800; padding-top:5px; border:none;">10회 뽑기</button></div>
                        <div style="position:relative;"><button id="gacha-30-btn" class="btn-primary" style="background:#f43f5e; font-size:0.8rem; width:100%; height:55px; font-weight:800; padding-top:5px; border:none;">30회 뽑기</button></div>
                    </div>
                </div>

                <div class="card arcade-item-card dice-card" style="margin-bottom:0; border: 2px solid #10b981; background: rgba(16, 185, 129, 0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🎲 주사위 3개 베팅</h3>
                        <span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">BIG/SMALL</span>
                    </div>
                    <div id="bet-result-msg" style="text-align:center; font-weight:800; margin-bottom:1.25rem; min-height:100px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(16, 185, 129, 0.05); border-radius:12px; border: 1px dashed #10b981;">
                        <div id="dice-status-text" style="color:var(--text-sub); font-size: 0.85rem;">행운의 숫자를 기대하세요!</div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.6rem;">
                        <button class="bet-btn btn-primary" style="background:#10b981; font-weight: 900; width:100%; height:60px; border:none; border-radius:12px;" data-game="dice3" data-choice="small">소</button>
                        <button class="bet-btn btn-primary" style="background:#3b82f6; font-weight: 900; width:100%; height:60px; border:none; border-radius:12px;" data-game="dice3" data-choice="middle">중</button>
                        <button class="bet-btn btn-primary" style="background:#f59e0b; font-weight: 900; width:100%; height:60px; border:none; border-radius:12px;" data-game="dice3" data-choice="big">대</button>
                    </div>
                </div>
                
                <!-- ... 추가적인 카드 생략 (initArcade에서 핸들링) ... -->
                <div class="card arcade-item-card alchemy-card" style="margin-bottom:0; display: flex; flex-direction: column; border: 2px solid #8b5cf6; background: rgba(139, 92, 246, 0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">⚗️ 아이템 연금술</h3>
                        <span style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">UPGRADE</span>
                    </div>
                    <button id="alchemy-btn" class="btn-primary" style="background:#8b5cf6; font-size:0.9rem; width:100%; height:55px; font-weight:800; border:none;">아이템 연성하기</button>
                </div>
            </div>

            <div class="card booster-section fade-in" style="margin-top:2.5rem; background:linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); border: 2px solid var(--accent-soft); padding: 2rem; border-radius: var(--radius-lg);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem;">
                    <div style="flex: 1; min-width: 250px;">
                        <h3 style="font-size:1.4rem; font-weight: 900; color:var(--accent-color); margin-bottom:0.5rem;">⚡ 슈퍼 부스터</h3>
                        <p class="text-sub" style="font-size:0.95rem; font-weight: 600;">모든 테스트 보상 포인트가 <strong>2배</strong>로 지급됩니다.</p>
                    </div>
                    <button id="buy-booster-btn" class="btn-primary" style="background:var(--accent-color); padding: 1rem 2.5rem; font-size: 1rem; border-radius: 50px;">부스터 충전 (100P)</button>
                </div>
            </div>
        </div>
    `;
    
    // 이벤트 리스너 통합 관리
    const handleGameClick = (callback) => {
        return (e) => {
            if (!UserState.user) {
                alert("게임 참여를 위해 로그인이 필요합니다. ❤️");
                document.getElementById('login-btn')?.click();
                return;
            }
            callback(e);
        };
    };

    initArcade();

    // 기존 리스너들이 UserState.user를 체크하도록 오버라이드
    document.querySelectorAll('.arcade-item-card button, .bet-btn, #buy-booster-btn').forEach(btn => {
        const originalOnClick = btn.onclick;
        btn.onclick = (e) => {
            if (!UserState.user) {
                alert("이 기능을 이용하려면 로그인이 필요합니다. 🎰");
                document.getElementById('login-btn')?.click();
                return;
            }
            // 원래 리스너가 있다면 실행 (initArcade에서 등록한 것들)
            if (originalOnClick) originalOnClick.call(btn, e);
        };
    });

    if (isLoggedIn) updateUI();
}
