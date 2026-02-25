import { addPoints, usePoints, UserState, updateUI, ITEM_VALUES, ITEM_GRADES } from './auth.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

let arcadeInitialized = false;

export function initArcade() {
    if (arcadeInitialized) return;
    arcadeInitialized = true;

    document.addEventListener('click', async (e) => {
        const target = e.target.closest('button') || e.target;
        if (target.id === 'gacha-btn') await playGacha(1, 100);
        if (target.id === 'gacha-10-btn') await playGacha(10, 950);
        if (target.id === 'gacha-30-btn') await playGacha(30, 2700);
        
        if (target.id === 'alchemy-btn') await playAlchemy(1);
        if (target.id === 'alchemy-5-btn') await playAlchemy(5);
        if (target.id === 'alchemy-10-btn') await playAlchemy(10);
        
        if (target.id === 'click-game-btn') await playClickGame();
        if (target.id === 'slot-spin-btn') await playSlotMachine();
        if (target.id === 'bomb-start-btn') await startBombGame();
        if (target.classList.contains('wire-btn')) await cutWire(parseInt(target.dataset.wire));
        if (target.id === 'bomb-claim-btn') await claimBombPoints();
        if (target.id === 'daily-checkin-btn') await playDailyCheckin();
        if (target.id === 'market-open-btn') await openMarket();
        
        if (target.classList.contains('bet-btn')) {
            const gameType = target.dataset.game;
            const choice = target.dataset.choice;
            await playBettingGame(gameType, choice);
        }
    });
}

async function updateArcadeStat(statKey) {
    if (!UserState.user) return;
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { [`arcadeStats.${statKey}`]: increment(1) });
        if (!UserState.data.arcadeStats) UserState.data.arcadeStats = {};
        UserState.data.arcadeStats[statKey] = (UserState.data.arcadeStats[statKey] || 0) + 1;
    } catch (e) { console.error(e); }
}

async function playGacha(count, cost) {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    if (await usePoints(cost)) {
        await updateArcadeStat('gacha');
        const exclusiveItems = ['🧪 현자의 돌', '🧬 인공 생명체', '⚡ 번개 병', '🌌 은하수 가루'];
        const itemNames = Object.keys(ITEM_VALUES).filter(name => !exclusiveItems.includes(name));
        const weights = [40, 20, 15, 10, 5, 8, 2];
        const drawnItems = [];
        let totalAddedScore = 0;
        for (let i = 0; i < count; i++) {
            const item = getRandomItem(itemNames, weights);
            drawnItems.push(item);
            totalAddedScore += ITEM_VALUES[item];
        }
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            await updateDoc(userRef, {
                inventory: arrayUnion(...drawnItems),
                totalScore: increment(totalAddedScore)
            });
            UserState.data.inventory = [...(UserState.data.inventory || []), ...drawnItems];
            UserState.data.totalScore = (UserState.data.totalScore || 0) + totalAddedScore;
            const resultEl = document.getElementById('gacha-result');
            if (resultEl) {
                if (count === 1) { resultEl.innerHTML = `<strong>[${drawnItems[0]}]</strong> 획득!<br><small>+${totalAddedScore}점</small>`; }
                else {
                    const summary = drawnItems.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                    const resultText = Object.entries(summary).map(([name, num]) => `${name} x${num}`).join('<br>');
                    resultEl.innerHTML = `<div style="font-size:0.85rem; line-height:1.4;"><strong>${count}회 결과:</strong><br>${resultText}<br><span style="color:var(--accent-color); font-weight:800;">총 +${totalAddedScore}점</span></div>`;
                }
            }
            updateUI();
        } catch (e) { alert("저장 실패"); }
    }
}

function getRandomItem(items, weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) { if (random < weights[i]) return items[i]; random -= weights[i]; }
    return items[0];
}

async function playClickGame() {
    const btn = document.getElementById('click-game-btn');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    await updateArcadeStat('mining');
    const earn = Math.floor(Math.random() * 10) + 5;
    btn.textContent = "채굴 중...";
    setTimeout(async () => { await addPoints(earn); btn.disabled = false; btn.textContent = "채굴기 가동 시작"; }, 1000);
}

const SLOT_EMOJIS = ['🎰', '💎', '🔥', '✨', '🍒', '7️⃣'];
async function playSlotMachine() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const cost = 300;
    if (await usePoints(cost)) {
        await updateArcadeStat('slot');
        const reels = [document.getElementById('slot-1'), document.getElementById('slot-2'), document.getElementById('slot-3')];
        const btn = document.getElementById('slot-spin-btn');
        if(!reels[0] || !btn) return;
        btn.disabled = true;
        
        let spinCount = 0;
        const spinInterval = setInterval(() => {
            reels.forEach(r => r.textContent = SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]);
            spinCount++;
            if (spinCount > 15) {
                clearInterval(spinInterval);
                const final = reels.map(() => SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]);
                reels.forEach((r, i) => r.textContent = final[i]);
                
                let winMsg = "💀 아쉬워요! 다시 도전해보세요.";
                let winPoints = 0;
                
                const unique = new Set(final).size;
                if (unique === 1) { winPoints = 5000; winMsg = "🎉 JACKPOT!!! 5,000P 획득!"; }
                else if (unique === 2) { winPoints = 600; winMsg = "✨ 2개 일치! 600P 획득!"; }
                
                setTimeout(async () => {
                    if (winPoints > 0) await addPoints(winPoints, "슬롯머신 당첨");
                    alert(winMsg);
                    btn.disabled = false;
                }, 500);
            }
        }, 100);
    }
}

let bombGameState = { active: false, bombIndex: -1, currentPool: 0, cutWires: [] };
async function startBombGame() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    if (bombGameState.active) return;
    if (await usePoints(200)) {
        await updateArcadeStat('bomb');
        bombGameState = { active: true, bombIndex: Math.floor(Math.random() * 5), currentPool: 0, cutWires: [] };
        const msgEl = document.getElementById('bomb-msg');
        const startBtn = document.getElementById('bomb-start-btn');
        if(msgEl) msgEl.textContent = "전선을 끊으세요! (현재: 0P)";
        if(startBtn) startBtn.disabled = true;
        document.querySelectorAll('.wire-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        });
    }
}

async function cutWire(index) {
    if (!bombGameState.active || bombGameState.cutWires.includes(index)) return;
    const wireBtn = document.querySelector(`.wire-btn[data-wire="${index}"]`);
    const msgEl = document.getElementById('bomb-msg');
    const claimBtn = document.getElementById('bomb-claim-btn');
    const startBtn = document.getElementById('bomb-start-btn');

    bombGameState.cutWires.push(index);
    if(wireBtn) {
        wireBtn.style.opacity = '0.3';
        wireBtn.style.transform = 'scale(0.9)';
        wireBtn.disabled = true;
    }

    if (index === bombGameState.bombIndex) {
        bombGameState.active = false;
        alert("🧨 콰광!!! 폭탄이 터졌습니다!");
        if(msgEl) msgEl.textContent = "폭발했습니다! (0P)";
        if(startBtn) startBtn.disabled = false;
        if(claimBtn) claimBtn.disabled = true;
        document.querySelectorAll('.wire-btn').forEach(btn => btn.disabled = true);
    } else {
        const reward = [100, 300, 600, 1200][bombGameState.cutWires.length - 1];
        bombGameState.currentPool = reward;
        if(msgEl) msgEl.textContent = `성공! 현재 보상: ${reward}P (다음은 더 큽니다!)`;
        if(claimBtn) claimBtn.disabled = false;
        if (bombGameState.cutWires.length === 4) {
            alert("🎯 모든 안전한 전선을 제거했습니다!");
            await claimBombPoints();
        }
    }
}

async function claimBombPoints() {
    if (!bombGameState.active) return;
    const points = bombGameState.currentPool;
    const msgEl = document.getElementById('bomb-msg');
    const startBtn = document.getElementById('bomb-start-btn');
    const claimBtn = document.getElementById('bomb-claim-btn');

    bombGameState.active = false;
    await addPoints(points, "폭탄 돌리기 성공");
    alert(`🎉 안전하게 ${points}P를 챙겼습니다!`);
    if(msgEl) msgEl.textContent = "성공적으로 탈출!";
    if(startBtn) startBtn.disabled = false;
    if(claimBtn) claimBtn.disabled = true;
    document.querySelectorAll('.wire-btn').forEach(btn => btn.disabled = true);
}

async function playAlchemy(count) {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    
    let cost = 300;
    if (count === 5) cost = 1350;
    else if (count === 10) cost = 2500;

    const gradeSelect = document.getElementById('alchemy-grade-select');
    const resultEl = document.getElementById('alchemy-result');
    if (!gradeSelect || !resultEl) return;

    const selectedGrade = gradeSelect.value;
    const itemsNeeded = count * 6;
    const targetItems = ITEM_GRADES[selectedGrade];
    const availableItems = UserState.data.inventory.filter(name => targetItems.includes(name));

    if (availableItems.length < itemsNeeded) {
        alert(`재료가 부족합니다! (필요: ${selectedGrade} ${itemsNeeded}개 / 보유: ${availableItems.length}개)`);
        return;
    }

    if (!confirm(`${selectedGrade} 아이템 ${itemsNeeded}개를 소모하여 연금술을 진행하시겠습니까? (비용: ${cost}P)`)) return;

    const buttons = [document.getElementById('alchemy-btn'), document.getElementById('alchemy-5-btn'), document.getElementById('alchemy-10-btn')];
    buttons.forEach(btn => { if(btn) btn.disabled = true; });

    if (await usePoints(cost, `연금술 시행 (${count}회)`)) {
        await updateArcadeStat('alchemy');
        resultEl.innerHTML = '<span class="loading-dots">신비로운 약물을 배합 중...</span>';
        
        setTimeout(async () => {
            try {
                const userRef = doc(db, "users", UserState.user.uid);
                let currentInv = [...UserState.data.inventory];
                
                // 재료 제거
                for (let i = 0; i < itemsNeeded; i++) {
                    const idx = currentInv.findIndex(name => targetItems.includes(name));
                    if (idx > -1) currentInv.splice(idx, 1);
                }

                const gradeOrder = ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY'];
                const nextGrade = gradeOrder[Math.min(gradeOrder.indexOf(selectedGrade) + 1, gradeOrder.length - 1)];
                const nextGradeItems = ITEM_GRADES[nextGrade];
                
                const results = [];
                let bonusCount = 0;
                for (let i = 0; i < count; i++) {
                    const item = nextGradeItems[Math.floor(Math.random() * nextGradeItems.length)];
                    results.push(item);
                    // 15% 보너스 확률
                    if (Math.random() < 0.15) {
                        const bonus = nextGradeItems[Math.floor(Math.random() * nextGradeItems.length)];
                        results.push(bonus);
                        bonusCount++;
                    }
                }

                currentInv.push(...results);
                const recalcScore = currentInv.reduce((acc, item) => acc + (ITEM_VALUES[item] || 0), 0);
                
                await updateDoc(userRef, { 
                    inventory: currentInv, 
                    totalScore: recalcScore, 
                    discoveredItems: arrayUnion(...results) 
                });

                UserState.data.inventory = currentInv;
                UserState.data.totalScore = recalcScore;

                const summary = results.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                const resultText = Object.entries(summary).map(([name, num]) => `[${name}] x${num}`).join(', ');
                
                resultEl.innerHTML = `<div style="animation: bounce 0.5s;"><strong>${nextGrade} 연성 성공!</strong><br><small>${resultText}${bonusCount > 0 ? ` (보너스 +${bonusCount})` : ''}</small></div>`;
                
                // UI 즉시 업데이트를 위해 다시 렌더링 또는 카운트 함수 호출
                if (window.location.hash === '#arcade') {
                    // 해시를 새로고침하여 renderArcade 다시 트리거 (간편한 방법)
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                }
                updateUI();
            } catch (e) {
                console.error(e);
                resultEl.textContent = "연성 중 사고가 발생했습니다!";
            } finally {
                buttons.forEach(btn => { if(btn) btn.disabled = false; });
            }
        }, 1500);
    } else {
        buttons.forEach(btn => { if(btn) btn.disabled = false; });
    }
}

async function playBettingGame(type, choice) {
    const amountInput = document.getElementById('bet-amount');
    const msgEl = document.getElementById('bet-result-msg');
    const betAmount = parseInt(amountInput.value);
    if (isNaN(betAmount) || betAmount < 10) return alert("최소 10P");
    if (await usePoints(betAmount)) {
        await updateArcadeStat('betting');
        msgEl.textContent = "흔드는 중...";
        setTimeout(async () => {
            const d1 = Math.floor(Math.random() * 6) + 1, d2 = Math.floor(Math.random() * 6) + 1, d3 = Math.floor(Math.random() * 6) + 1;
            const sum = d1 + d2 + d3;
            let win = (choice === 'small' && sum <= 8) || (choice === 'middle' && sum >= 9 && sum <= 12) || (choice === 'big' && sum >= 13);
            let multi = choice === 'middle' ? 2 : 3.5;
            if (win) { await addPoints(betAmount * multi); msgEl.innerHTML = `성공! ${betAmount * multi}P! (합계 ${sum})`; }
            else { msgEl.innerHTML = `실패... (합계 ${sum})`; }
        }, 1000);
    }
}

export async function openMarket() {
    if (!UserState.user) return;
    const container = document.getElementById('market-ui-container');
    if (!container) return;
    const inv = UserState.data.inventory || [];
    const itemCounts = inv.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
    container.innerHTML = `
        <div style="background: var(--bg-color); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
            ${Object.entries(itemCounts).map(([name, count]) => `
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span>${name} (${count})</span>
                    <button class="sell-one-btn" data-name="${name}" style="background:var(--accent-color); color:#fff; border:none; padding:2px 8px; border-radius:4px; font-size:0.7rem;">1개 판매</button>
                </div>`).join('')}
        </div>
        <button id="market-close-btn" class="btn-secondary" style="width:100%;">닫기</button>
    `;
    document.getElementById('market-open-btn').style.display = 'none';
    container.querySelectorAll('.sell-one-btn').forEach(btn => {
        btn.onclick = async () => {
            const name = btn.dataset.name;
            const val = Math.floor((ITEM_VALUES[name] || 0) * 0.7);
            if(confirm(`${name}을 ${val}P에 판매하시겠습니까?`)) {
                const userRef = doc(db, "users", UserState.user.uid);
                let currentInv = [...UserState.data.inventory];
                const idx = currentInv.indexOf(name);
                if(idx > -1) currentInv.splice(idx, 1);
                const newScore = currentInv.reduce((acc, item) => acc + (ITEM_VALUES[item] || 0), 0);
                await updateDoc(userRef, { inventory: currentInv, points: increment(val), totalScore: newScore });
                UserState.data.inventory = currentInv; UserState.data.points += val; UserState.data.totalScore = newScore;
                updateUI(); openMarket();
            }
        };
    });
    document.getElementById('market-close-btn').onclick = () => { container.innerHTML = ''; document.getElementById('market-open-btn').style.display = 'block'; };
}

async function playDailyCheckin() {
    if (!UserState.user) return;
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem(`last_checkin_${UserState.user.uid}`) === today) return alert("이미 완료!");
    if (await addPoints(100)) {
        await updateArcadeStat('checkin');
        localStorage.setItem(`last_checkin_${UserState.user.uid}`, today);
        alert("100P 지급! ✨"); updateUI();
    }
}
