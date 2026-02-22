import { addPoints, usePoints, UserState, updateUI, ITEM_VALUES } from './auth.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

let arcadeInitialized = false;

export function initArcade() {
    if (arcadeInitialized) return;
    arcadeInitialized = true;

    document.addEventListener('click', async (e) => {
        const target = e.target.closest('button') || e.target;
        if (target.id === 'gacha-btn') await playGacha(1, 100);
        if (target.id === 'gacha-5-btn') await playGacha(5, 500);
        if (target.id === 'gacha-10-btn') await playGacha(10, 950);
        
        if (target.id === 'alchemy-btn') await playAlchemy(1, 500);
        if (target.id === 'alchemy-5-btn') await playAlchemy(5, 2500);
        if (target.id === 'alchemy-10-btn') await playAlchemy(10, 4500); // 10회 할인
        
        if (target.id === 'click-game-btn') await playClickGame();
        if (target.id === 'updown-submit') await playUpDown();
        if (target.id === 'lotto-btn') await playLottery();
        
        if (target.classList.contains('bet-btn')) {
            const gameType = target.dataset.game;
            const choice = target.dataset.choice;
            await playBettingGame(gameType, choice);
        }
    });
}

// ... gacha, clickGame, updown 등 기존 코드 유지 ...
async function playGacha(count, cost) {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    if (await usePoints(cost)) {
        const itemNames = Object.keys(ITEM_VALUES);
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
    const earn = Math.floor(Math.random() * 10) + 5;
    btn.textContent = "채굴 중...";
    setTimeout(async () => { await addPoints(earn); btn.disabled = false; btn.textContent = "포인트 채굴"; }, 1000);
}
let upDownAnswer = Math.floor(Math.random() * 50) + 1;
async function playUpDown() {
    const input = document.getElementById('updown-input');
    const msg = document.getElementById('updown-msg');
    if (!input || !UserState.user) return;
    const guess = parseInt(input.value);
    if (isNaN(guess)) return;
    if (guess === upDownAnswer) {
        await addPoints(50);
        msg.textContent = `정답! 50P 획득!`;
        upDownAnswer = Math.floor(Math.random() * 50) + 1;
        input.value = "";
    } else { msg.textContent = guess < upDownAnswer ? "UP!" : "DOWN!"; }
}

// =================================================================
// 연금술(Alchemy) 멀티 합성 로직
// =================================================================

async function playAlchemy(count, cost) {
    if (!UserState.user) return;
    const itemsNeeded = count * 5;

    if (UserState.data.inventory.length < itemsNeeded) {
        alert(`연금술 ${count}회를 위해 아이템이 ${itemsNeeded}개 필요합니다!\n(현재 보유: ${UserState.data.inventory.length}개)`);
        return;
    }

    if (!confirm(`아이템 ${itemsNeeded}개와 ${cost}P를 사용하여 ${count}회 연금술을 진행하시겠습니까?`)) return;

    if (await usePoints(cost)) {
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            let currentInv = [...UserState.data.inventory];
            
            // 1. 재료 아이템 제거 (가치 낮은 순)
            currentInv.sort((a, b) => ITEM_VALUES[a] - ITEM_VALUES[b]);
            let removedValue = 0;
            for (let i = 0; i < itemsNeeded; i++) {
                removedValue += ITEM_VALUES[currentInv.shift()];
            }

            // 2. 상급 아이템 생성
            const highItems = ['🥈 은메달', '🥇 금메달', '💎 다이아몬드', '🍀 행운의 클로버'];
            const results = [];
            let addedValue = 0;
            for (let i = 0; i < count; i++) {
                const reward = highItems[Math.floor(Math.random() * highItems.length)];
                results.push(reward);
                addedValue += ITEM_VALUES[reward];
            }

            // 3. 인벤토리에 결과 추가 및 총점 갱신
            currentInv.push(...results);
            const scoreDelta = addedValue - removedValue;

            await updateDoc(userRef, {
                inventory: currentInv,
                totalScore: increment(scoreDelta)
            });

            UserState.data.inventory = currentInv;
            UserState.data.totalScore += scoreDelta;

            const resultEl = document.getElementById('alchemy-result');
            if (resultEl) {
                if (count === 1) {
                    resultEl.innerHTML = `연금술 성공! <strong>[${results[0]}]</strong> 탄생!`;
                } else {
                    const summary = results.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                    const resultText = Object.entries(summary).map(([name, num]) => `${name} x${num}`).join(', ');
                    resultEl.innerHTML = `<div style="font-size:0.85rem;"><strong>${count}회 합성 결과:</strong><br>${resultText}<br><span style="color:var(--accent-secondary);">가치 변동: ${scoreDelta > 0 ? '+' : ''}${scoreDelta}</span></div>`;
                }
            }
            updateUI();
        } catch (e) {
            console.error(e);
            alert("연금술 실패");
        }
    }
}

async function playBettingGame(type, choice) {
    const amountInput = document.getElementById('bet-amount');
    const msgEl = document.getElementById('bet-result-msg');
    const betAmount = parseInt(amountInput.value);
    if (isNaN(betAmount) || betAmount < 10) { alert("최소 10P"); return; }
    if (UserState.data.points < betAmount) { alert("포인트 부족"); return; }
    if (await usePoints(betAmount)) {
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
