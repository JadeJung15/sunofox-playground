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
        if (target.id === 'updown-submit') await playUpDown();
        if (target.id === 'lotto-btn') await playLottery(1, 500);
        if (target.id === 'lotto-5-btn') await playLottery(5, 2200);
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
    
    // 연금술 비용 조정 (가챠의 3배 가격으로 벨런스 상향)
    let cost = 300;
    if (count === 5) cost = 1350;
    else if (count === 10) cost = 2500;

    const gradeSelect = document.getElementById('alchemy-grade-select');
    if (!gradeSelect) return;
    
    const selectedGrade = gradeSelect.value;
    const itemsNeeded = count * 6;
    
    const targetItems = ITEM_GRADES[selectedGrade];
    const availableItems = UserState.data.inventory.filter(name => targetItems.includes(name));

    if (availableItems.length < itemsNeeded) {
        alert(`연금술을 위해 [${selectedGrade}] 등급 아이템이 ${itemsNeeded}개 필요합니다!\n(현재 해당 등급 보유: ${availableItems.length}개)`);
        return;
    }

    if (!confirm(`[${selectedGrade}] 등급 아이템 ${itemsNeeded}개와 ${cost.toLocaleString()}P를 사용하여 연금술(${count}회)을 진행하시겠습니까?\n(성공률 100% + 대성공 확률 존재)`)) return;

    if (await usePoints(cost)) {
        await updateArcadeStat('alchemy');
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            let currentInv = [...UserState.data.inventory];
            
            const consumedItems = [];
            
            for (let i = 0; i < itemsNeeded; i++) {
                const idx = currentInv.findIndex(name => targetItems.includes(name));
                if (idx > -1) {
                    const item = currentInv.splice(idx, 1)[0];
                    consumedItems.push(item);
                }
            }

            const gradeOrder = ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY'];
            const nextGradeIdx = Math.min(gradeOrder.indexOf(selectedGrade) + 1, gradeOrder.length - 1);
            const nextGrade = gradeOrder[nextGradeIdx];
            const nextGradeItems = ITEM_GRADES[nextGrade];

            const results = [];
            let greatSuccessCount = 0;

            for (let i = 0; i < count; i++) {
                // 기본 보상
                const reward = nextGradeItems[Math.floor(Math.random() * nextGradeItems.length)];
                results.push(reward);
                
                // 15% 확률로 대성공 (보상 2배)
                if (Math.random() < 0.15) {
                    const bonus = nextGradeItems[Math.floor(Math.random() * nextGradeItems.length)];
                    results.push(bonus);
                    greatSuccessCount++;
                }
            }

            currentInv.push(...results);
            
            // 통합 아이템 점수(totalScore) 정확하게 재계산
            const recalcScore = currentInv.reduce((acc, item) => acc + (ITEM_VALUES[item] || 0), 0);
            const netProfit = recalcScore - (UserState.data.totalScore || 0) - cost;

            // 도감(discoveredItems) 업데이트 준비
            const newDiscovered = [...new Set(results)];

            await updateDoc(userRef, {
                inventory: currentInv,
                totalScore: recalcScore,
                discoveredItems: arrayUnion(...newDiscovered)
            });

            UserState.data.inventory = currentInv;
            UserState.data.totalScore = recalcScore;
            // 로컬 도감 데이터도 업데이트
            if (!UserState.data.discoveredItems) UserState.data.discoveredItems = [];
            newDiscovered.forEach(item => {
                if (!UserState.data.discoveredItems.includes(item)) UserState.data.discoveredItems.push(item);
            });

            const resultEl = document.getElementById('alchemy-result');
            if (resultEl) {
                const consumedSummary = consumedItems.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                const consumedText = Object.entries(consumedSummary).map(([name, num]) => `${name}x${num}`).join(' ');
                
                const resultSummary = results.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                const resultText = Object.entries(resultSummary).map(([name, num]) => `<strong>${name}x${num}</strong>`).join(' ');

                const profitColor = netProfit >= 0 ? 'var(--accent-secondary)' : '#ef4444';
                const profitText = netProfit >= 0 ? `+${netProfit.toLocaleString()}점 이득! ✨` : `${Math.abs(netProfit).toLocaleString()}점 손해... 💀`;

                resultEl.innerHTML = `
                    <div style="font-size:0.7rem; color:var(--text-sub); margin-bottom:0.4rem;">재료 소모: ${consumedText}</div>
                    <div style="font-size:0.85rem; margin-bottom:0.4rem;">연성 결과: ${resultText}${greatSuccessCount > 0 ? `<br><span style="color:#f59e0b; font-weight:800;">✨ 대성공 ${greatSuccessCount}회 발생! ✨</span>` : ''}</div>
                    <div style="font-weight:900; color:${profitColor}; font-size:0.95rem;">${profitText}</div>
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
        msgEl.textContent = "주사위를 흔드는 중...";
        setTimeout(async () => {
            let win = false; 
            let resultText = "";
            let winMultiplier = 2;

            if (type === 'dice3') {
                const d1 = Math.floor(Math.random() * 6) + 1;
                const d2 = Math.floor(Math.random() * 6) + 1;
                const d3 = Math.floor(Math.random() * 6) + 1;
                const sum = d1 + d2 + d3;
                
                if (choice === 'small') {
                    win = sum >= 3 && sum <= 8;
                    winMultiplier = 3.5;
                } else if (choice === 'middle') {
                    win = sum >= 9 && sum <= 12;
                    winMultiplier = 2;
                } else if (choice === 'big') {
                    win = sum >= 13 && sum <= 18;
                    winMultiplier = 3.5;
                }
                resultText = `🎲 [${d1}] [${d2}] [${d3}] = 합계 [${sum}]`;
            } else {
                // Fallback for old types if any
                const dice = Math.floor(Math.random() * 6) + 1;
                win = (choice === 'high' && dice > 3) || (choice === 'low' && dice <= 3);
                resultText = `주사위 [${dice}]!`;
            }

            if (win) { 
                const winAmount = Math.floor(betAmount * winMultiplier);
                await addPoints(winAmount); 
                msgEl.innerHTML = `<span style="color:var(--accent-secondary)">🎉 성공! ${winAmount.toLocaleString()}P 획득!</span><br><small>${resultText}</small>`; 
            } else { 
                msgEl.innerHTML = `<span style="color:#ff4757">💀 실패...</span><br><small>${resultText}</small>`; 
            }
        }, 1000);
    }
}

async function playLottery(count = 1, cost = 500) {
    if (!UserState.user) return alert("로그인이 필요합니다.");
    const resultEl = document.getElementById('lotto-result');
    if (!confirm(`복권 ${count}장을 ${cost.toLocaleString()}P에 구매하시겠습니까?`)) return;
    if (await usePoints(cost)) {
        await updateArcadeStat('lottery');
        resultEl.innerHTML = `<div class="lotto-scratcher">긁는 중... ✨</div>`;
        
        setTimeout(async () => {
            let totalWinPoints = 0;
            let winItems = [];
            let logs = [];
            let rewardType = "none";

            for (let i = 0; i < count; i++) {
                const rand = Math.random() * 1000;
                if (rand < 1) {
                    totalWinPoints += 30000;
                    logs.push(`🎊 1등 당첨!! 3만P!`);
                    rewardType = "win";
                } else if (rand < 10) {
                    const winItem = '💎 다이아몬드';
                    winItems.push(winItem);
                    logs.push(`💎 2등! 다이아 획득!`);
                    rewardType = "win";
                } else if (rand < 100) {
                    totalWinPoints += 1500;
                    logs.push(`✨ 3등 당첨! 1500P!`);
                    if (rewardType !== "win") rewardType = "win";
                } else if (rand < 300) {
                    totalWinPoints += 500;
                    logs.push(`🍀 4등! 500P (본전!)`);
                    if (rewardType === "none" || rewardType === "lose") rewardType = "even";
                } else {
                    logs.push(`💀 꽝!`);
                    if (rewardType === "none") rewardType = "lose";
                }
            }

            if (totalWinPoints > 0) await addPoints(totalWinPoints, `복권 당첨 (${count}장)`);
            
            if (winItems.length > 0) {
                let totalItemScore = winItems.reduce((acc, item) => acc + ITEM_VALUES[item], 0);
                try {
                    await updateDoc(doc(db, "users", UserState.user.uid), {
                        inventory: arrayUnion(...winItems),
                        totalScore: increment(totalItemScore)
                    });
                    UserState.data.inventory.push(...winItems);
                    UserState.data.totalScore += totalItemScore;
                } catch (e) { console.error("아이템 지급 실패", e); }
            }

            if (count === 1) {
                resultEl.innerHTML = `<div class="lotto-final ${rewardType}">${logs[0]}</div>`;
            } else {
                const summary = logs.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                const summaryText = Object.entries(summary).map(([msg, num]) => `${msg} x${num}`).join('<br>');
                resultEl.innerHTML = `<div class="lotto-final ${rewardType}" style="font-size:0.75rem; padding: 5px; line-height:1.3;"><strong>${count}장 결과:</strong><br>${summaryText}</div>`;
            }
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
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                <label style="font-size:0.8rem; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:5px;">
                    <input type="checkbox" id="market-select-all"> 전체 선택
                </label>
                <button id="sell-selected-btn" class="btn-primary" style="padding: 6px 15px; font-size: 0.75rem; background: var(--accent-secondary); border-radius: 6px; box-shadow: none; opacity:0.5;" disabled>선택 판매</button>
            </div>
            <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                ${Object.entries(itemCounts).map(([name, count]) => {
                    const val = ITEM_VALUES[name] || 0;
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.8rem 0; border-bottom: 1px solid var(--border-color);">
                            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                                <input type="checkbox" class="item-checkbox" data-name="${name}">
                                <div style="display:flex; flex-direction:column;">
                                    <span style="font-size:0.85rem; font-weight:700;">${name}</span>
                                    <small style="font-size:0.7rem; color:var(--text-sub);">가치: ${val}P | 보유: ${count}개</small>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                <input type="number" id="sell-qty-${name}" value="${count}" min="1" max="${count}" style="width:50px; padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:0.8rem; text-align:center;">
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        <button id="market-close-btn" class="btn-secondary" style="width:100%; padding: 0.6rem; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem;">장터 닫기</button>
    `;
    
    document.getElementById('market-open-btn').style.display = 'none';

    const selectAll = document.getElementById('market-select-all');
    const sellSelectedBtn = document.getElementById('sell-selected-btn');
    const checkboxes = container.querySelectorAll('.item-checkbox');

    const updateSellBtn = () => {
        const checked = container.querySelectorAll('.item-checkbox:checked').length;
        sellSelectedBtn.disabled = checked === 0;
        sellSelectedBtn.style.opacity = checked === 0 ? '0.5' : '1';
        sellSelectedBtn.textContent = checked > 0 ? `선택 판매 (${checked})` : '선택 판매';
    };

    selectAll.onchange = (e) => {
        checkboxes.forEach(cb => cb.checked = e.target.checked);
        updateSellBtn();
    };

    checkboxes.forEach(cb => {
        cb.onchange = updateSellBtn;
    });

    sellSelectedBtn.onclick = async () => {
        const itemsToSell = [];
        checkboxes.forEach(cb => {
            if (cb.checked) {
                const name = cb.dataset.name;
                const qty = parseInt(document.getElementById(`sell-qty-${name}`).value);
                itemsToSell.push({ name, qty });
            }
        });
        
        if (itemsToSell.length > 0) {
            await sellItems(itemsToSell);
            openMarket();
        }
    };

    document.getElementById('market-close-btn').onclick = () => {
        container.innerHTML = '';
        document.getElementById('market-open-btn').style.display = 'block';
    };
}

async function sellItems(itemsToSell) {
    let totalScoreLoss = 0;
    let totalPointsGain = 0;
    let itemsDescription = [];

    itemsToSell.forEach(({ name, qty }) => {
        const val = ITEM_VALUES[name];
        totalScoreLoss += val * qty;
        totalPointsGain += Math.floor(val * 0.7) * qty;
        itemsDescription.push(`${name} x${qty}`);
    });

    if (!confirm(`선택한 아이템들을 판매하여 ${totalPointsGain.toLocaleString()}P를 받으시겠습니까?\n(${itemsDescription.join(', ')})`)) return;

    try {
        const userRef = doc(db, "users", UserState.user.uid);
        let currentInv = [...UserState.data.inventory];
        
        itemsToSell.forEach(({ name, qty }) => {
            for (let i = 0; i < qty; i++) {
                const idx = currentInv.indexOf(name);
                if (idx > -1) currentInv.splice(idx, 1);
            }
        });

        const newPoints = Math.max(0, (UserState.data.points || 0) + totalPointsGain);
        const newScore = Math.max(0, (UserState.data.totalScore || 0) - totalScoreLoss);

        await updateDoc(userRef, {
            inventory: currentInv,
            points: newPoints,
            totalScore: newScore
        });
        
        UserState.data.inventory = currentInv;
        UserState.data.points = newPoints;
        UserState.data.totalScore = newScore;
        updateUI();
        alert(`판매 완료! +${totalPointsGain.toLocaleString()}P 획득`);
    } catch (e) { console.error(e); alert("판매 실패"); }
}

async function sellItem(itemName, qty = 1) {
    // This function is kept for backward compatibility or individual calls if any, 
    // but the main UI now uses sellItems.
    await sellItems([{ name: itemName, qty }]);
}
