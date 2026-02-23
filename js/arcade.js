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
        if (target.id === 'alchemy-10-btn') await playAlchemy(10);
        
        if (target.id === 'click-game-btn') await playClickGame();
        if (target.id === 'updown-submit') await playUpDown();
        if (target.id === 'lotto-btn') await playLottery();
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

let upDownAnswer = Math.floor(Math.random() * 50) + 1;
async function playUpDown() {
    const input = document.getElementById('updown-input');
    const msg = document.getElementById('updown-msg');
    if (!input || !UserState.user) return;
    const guess = parseInt(input.value);
    if (isNaN(guess)) return;
    await updateArcadeStat('updown');
    if (guess === upDownAnswer) {
        await addPoints(50);
        msg.textContent = `정답! 50P 획득!`;
        upDownAnswer = Math.floor(Math.random() * 50) + 1;
        input.value = "";
    } else { msg.textContent = guess < upDownAnswer ? "UP!" : "DOWN!"; }
}

async function playAlchemy(count) {
    if (!UserState.user) return;
    
    const cost = count === 1 ? 500 : 4200;
    const gradeSelect = document.getElementById('alchemy-grade-select');
    if (!gradeSelect) return;
    
    const selectedGrade = gradeSelect.value;
    const itemsNeeded = count * 5;
    
    const targetItems = ITEM_GRADES[selectedGrade];
    const availableItems = UserState.data.inventory.filter(name => targetItems.includes(name));

    if (availableItems.length < itemsNeeded) {
        alert(`연금술을 위해 [${selectedGrade}] 등급 아이템이 ${itemsNeeded}개 필요합니다!\n(현재 해당 등급 보유: ${availableItems.length}개)`);
        return;
    }

    if (!confirm(`[${selectedGrade}] 등급 아이템 ${itemsNeeded}개와 ${cost.toLocaleString()}P를 사용하여 연금술(${count}회)을 진행하시겠습니까?\n(성공 확률: 70%)`)) return;

    if (await usePoints(cost)) {
        await updateArcadeStat('alchemy');
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            let currentInv = [...UserState.data.inventory];
            
            const consumedItems = [];
            let removedValue = 0;
            
            for (let i = 0; i < itemsNeeded; i++) {
                const idx = currentInv.findIndex(name => targetItems.includes(name));
                if (idx > -1) {
                    const item = currentInv.splice(idx, 1)[0];
                    consumedItems.push(item);
                    removedValue += ITEM_VALUES[item];
                }
            }

            const gradeOrder = ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY'];
            const nextGradeIdx = Math.min(gradeOrder.indexOf(selectedGrade) + 1, gradeOrder.length - 1);
            const nextGrade = gradeOrder[nextGradeIdx];
            const nextGradeItems = ITEM_GRADES[nextGrade];

            const results = [];
            let successCount = 0;
            let addedValue = 0;

            for (let i = 0; i < count; i++) {
                const isSuccess = Math.random() < 0.7;
                if (isSuccess) {
                    const reward = nextGradeItems[Math.floor(Math.random() * nextGradeItems.length)];
                    results.push(reward);
                    addedValue += ITEM_VALUES[reward];
                    successCount++;
                }
            }

            currentInv.push(...results);
            const newScore = Math.max(0, (UserState.data.totalScore || 0) + (addedValue - removedValue));
            const netProfit = addedValue - removedValue - cost;

            await updateDoc(userRef, {
                inventory: currentInv,
                totalScore: newScore
            });

            UserState.data.inventory = currentInv;
            UserState.data.totalScore = newScore;

            const resultEl = document.getElementById('alchemy-result');
            if (resultEl) {
                const resultSummary = results.length > 0 
                    ? results.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {})
                    : null;
                const resultText = resultSummary 
                    ? Object.entries(resultSummary).map(([name, num]) => `<strong>${name}x${num}</strong>`).join(' ')
                    : '<span style="color:#ef4444;">모두 소멸됨...</span>';

                const profitColor = netProfit >= 0 ? 'var(--accent-secondary)' : '#ef4444';
                const profitText = netProfit >= 0 ? `+${netProfit.toLocaleString()}점 이득! ✨` : `${netProfit.toLocaleString()}점 손해... 💀`;

                resultEl.innerHTML = `
                    <div style="font-size:0.75rem; color:var(--text-sub); margin-bottom:0.5rem;">${count}회 시도 중 ${successCount}회 성공! (확률 70%)</div>
                    <div style="font-size:0.9rem; margin-bottom:0.5rem;">연성 결과: ${resultText}</div>
                    <div style="font-weight:900; color:${profitColor}; font-size:1rem;">${profitText}</div>
                `;
            }
            updateUI();
        } catch (e) { console.error(e); alert("연금술 실패"); }
    }
}

async function playBettingGame(type, choice) {
    const amountInput = document.getElementById('bet-amount');
    const msgEl = document.getElementById('bet-result-msg');
    const betAmount = parseInt(amountInput.value);
    if (isNaN(betAmount) || betAmount < 10) { alert("최소 10P"); return; }
    if (UserState.data.points < betAmount) { alert("포인트 부족"); return; }
    if (await usePoints(betAmount)) {
        await updateArcadeStat('betting');
        msgEl.textContent = "결과 확인 중...";
        setTimeout(async () => {
            let win = false; let resultText = "";
            if (type === 'oddeven') {
                const num = Math.floor(Math.random() * 100) + 1;
                win = (choice === 'even' && num % 2 === 0) || (choice === 'odd' && num % 2 !== 0);
                resultText = `숫자 [${num}]!`;
            } else if (type === 'dice') {
                const dice = Math.floor(Math.random() * 6) + 1;
                win = (choice === 'high' && dice > 3) || (choice === 'low' && dice <= 3);
                resultText = `주사위 [${dice}]!`;
            }
            if (win) { await addPoints(betAmount * 2); msgEl.innerHTML = `<span style="color:var(--accent-secondary)">🎉 성공! ${betAmount*2}P 획득!</span><br><small>${resultText}</small>`; }
            else { msgEl.innerHTML = `<span style="color:#ff4757">💀 실패...</span><br><small>${resultText}</small>`; }
        }, 800);
    }
}

async function playLottery() {
    if (!UserState.user) return alert("로그인이 필요합니다.");
    const cost = 500;
    const resultEl = document.getElementById('lotto-result');
    if (!confirm(`복권 1장을 ${cost}P에 구매하시겠습니까?`)) return;
    if (await usePoints(cost)) {
        await updateArcadeStat('lottery');
        resultEl.innerHTML = `<div class="lotto-scratcher">긁는 중... ✨</div>`;
        setTimeout(async () => {
            const rand = Math.random() * 1000;
            let rewardMsg = ""; let rewardType = "none";
            if (rand < 1) {
                const winPoints = 30000; await addPoints(winPoints);
                rewardMsg = `🎊 1등 당첨!! 3만P!`; rewardType = "win";
            } else if (rand < 10) {
                const winItem = '💎 다이아몬드'; const itemScore = ITEM_VALUES[winItem];
                await updateDoc(doc(db, "users", UserState.user.uid), { inventory: arrayUnion(winItem), totalScore: increment(itemScore) });
                UserState.data.inventory.push(winItem); UserState.data.totalScore += itemScore;
                rewardMsg = `💎 2등! 다이아 획득!`; rewardType = "win";
            } else if (rand < 100) {
                const winPoints = 1500; await addPoints(winPoints);
                rewardMsg = `✨ 3등 당첨! 1500P!`; rewardType = "win";
            } else if (rand < 300) {
                const winPoints = 500; await addPoints(winPoints);
                rewardMsg = `🍀 4등! 500P (본전!)`; rewardType = "even";
            } else { rewardMsg = `💀 꽝! 다음 기회에..`; rewardType = "lose"; }
            resultEl.innerHTML = `<div class="lotto-final ${rewardType}">${rewardMsg}</div>`;
            updateUI();
        }, 1500);
    }
}

async function playDailyCheckin() {
    if (!UserState.user) return;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastCheckin = localStorage.getItem(`last_checkin_${UserState.user.uid}`);

    if (lastCheckin === today) return alert("오늘은 이미 출석체크를 완료했습니다!");

    if (await addPoints(100)) {
        await updateArcadeStat('checkin');
        localStorage.setItem(`last_checkin_${UserState.user.uid}`, today);
        alert("출석체크 완료! 100P가 지급되었습니다. ✨");
        updateUI();
    }
}

export async function openMarket() {
    if (!UserState.user) return;
    const container = document.getElementById('market-ui-container');
    if (!container) return;

    const inv = UserState.data.inventory || [];
    if (inv.length === 0) {
        container.innerHTML = '<p class="text-sub" style="font-size:0.85rem; text-align:center; padding: 1rem;">판매할 아이템이 없습니다.</p>';
        return;
    }

    const itemCounts = inv.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
    
    container.innerHTML = `
        <div style="background: var(--bg-color); border-radius: 12px; padding: 1rem; border: 1px solid var(--border-color); margin-bottom: 1rem;">
            <p style="font-size: 0.75rem; font-weight: 800; color: var(--accent-color); margin-bottom: 0.75rem; text-align: center;">👇 판매할 수량을 입력하고 [판매]를 누르세요</p>
            <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                ${Object.entries(itemCounts).map(([name, count]) => {
                    const val = ITEM_VALUES[name] || 0;
                    const sellPrice = Math.floor(val * 0.7);
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.8rem 0; border-bottom: 1px solid var(--border-color);">
                            <div style="display:flex; flex-direction:column; flex:1;">
                                <span style="font-size:0.85rem; font-weight:700;">${name}</span>
                                <small style="font-size:0.7rem; color:var(--text-sub);">가치: ${val}P | 보유: ${count}개</small>
                            </div>
                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                <input type="number" id="sell-qty-${name}" value="1" min="1" max="${count}" style="width:50px; padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:0.8rem; text-align:center;">
                                <button class="sell-item-btn btn-primary" data-name="${name}" style="padding: 6px 12px; font-size: 0.75rem; background: var(--accent-color); border-radius: 6px; box-shadow: none; white-space:nowrap;">판매</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        <button id="market-close-btn" class="btn-secondary" style="width:100%; padding: 0.6rem; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem;">장터 닫기</button>
    `;
    
    document.getElementById('market-open-btn').style.display = 'none';

    container.querySelectorAll('.sell-item-btn').forEach(btn => {
        btn.onclick = async () => {
            const itemName = btn.dataset.name;
            const qtyInput = document.getElementById(`sell-qty-${itemName}`);
            const qty = parseInt(qtyInput.value);
            if (isNaN(qty) || qty < 1) return;
            
            await sellItem(itemName, qty);
            openMarket(); // 목록 새로고침
        };
    });

    document.getElementById('market-close-btn').onclick = () => {
        container.innerHTML = '';
        document.getElementById('market-open-btn').style.display = 'block';
    };
}

async function sellItem(itemName, qty = 1) {
    const val = ITEM_VALUES[itemName];
    const totalSellPrice = Math.floor(val * 0.7) * qty;
    const totalScoreValue = val * qty;
    
    if (!confirm(`[${itemName}] ${qty}개를 판매하고 ${totalSellPrice.toLocaleString()}P를 받으시겠습니까?`)) return;

    try {
        const userRef = doc(db, "users", UserState.user.uid);
        let currentInv = [...UserState.data.inventory];
        
        // 입력된 수량만큼 아이템 제거
        let removedCount = 0;
        for (let i = 0; i < qty; i++) {
            const idx = currentInv.indexOf(itemName);
            if (idx > -1) {
                currentInv.splice(idx, 1);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            const finalPrice = Math.floor(val * 0.7) * removedCount;
            const finalScoreLoss = val * removedCount;
            
            const newPoints = Math.max(0, (UserState.data.points || 0) + finalPrice);
            const newScore = Math.max(0, (UserState.data.totalScore || 0) - finalScoreLoss);

            await updateDoc(userRef, {
                inventory: currentInv,
                points: newPoints,
                totalScore: newScore
            });
            
            UserState.data.inventory = currentInv;
            UserState.data.points = newPoints;
            UserState.data.totalScore = newScore;
            updateUI();
            alert(`${removedCount}개 판매 완료! +${finalPrice.toLocaleString()}P 획득`);
        }
    } catch (e) { alert("판매 실패"); }
}
