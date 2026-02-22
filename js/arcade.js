import { addPoints, usePoints, UserState, updateUI, ITEM_VALUES } from './auth.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

let arcadeInitialized = false;

export function initArcade() {
    if (arcadeInitialized) return;
    arcadeInitialized = true;

    document.addEventListener('click', async (e) => {
        const target = e.target.closest('button') || e.target;
        if (target.id === 'gacha-btn') await playGacha();
        if (target.id === 'click-game-btn') await playClickGame();
        if (target.id === 'updown-submit') await playUpDown();
        if (target.id === 'alchemy-btn') await playAlchemy();
        if (target.id === 'lotto-btn') await playLottery();
        
        if (target.classList.contains('bet-btn')) {
            const gameType = target.dataset.game;
            const choice = target.dataset.choice;
            await playBettingGame(gameType, choice);
        }
    });
}

// ... 기존 게임 로직들 생략 (유지됨) ...
async function playGacha() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const cost = 100;
    if (await usePoints(cost)) {
        const itemNames = Object.keys(ITEM_VALUES);
        const weights = [40, 20, 15, 10, 5, 8, 2];
        const drawnItem = getRandomItem(itemNames, weights);
        const itemScore = ITEM_VALUES[drawnItem];
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            await updateDoc(userRef, { inventory: arrayUnion(drawnItem), totalScore: increment(itemScore) });
            UserState.data.inventory.push(drawnItem);
            UserState.data.totalScore = (UserState.data.totalScore || 0) + itemScore;
            const resultEl = document.getElementById('gacha-result');
            if (resultEl) resultEl.innerHTML = `<strong>[${drawnItem}]</strong> 획득!<br><small>+${itemScore}점</small>`;
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
async function playAlchemy() {
    if (!UserState.user) return;
    const costPoints = 500;
    if (UserState.data.inventory.length < 5) { alert("아이템 5개 필요!"); return; }
    if (!confirm(`아이템 5개와 ${costPoints}P로 연금술?`)) return;
    if (await usePoints(costPoints)) {
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            let currentInv = [...UserState.data.inventory];
            currentInv.sort((a, b) => ITEM_VALUES[a] - ITEM_VALUES[b]);
            let removedValue = 0;
            for (let i = 0; i < 5; i++) { removedValue += ITEM_VALUES[currentInv.shift()]; }
            const highItems = ['🥈 은메달', '🥇 금메달', '💎 다이아몬드', '🍀 행운의 클로버'];
            const reward = highItems[Math.floor(Math.random() * highItems.length)];
            const rewardValue = ITEM_VALUES[reward];
            currentInv.push(reward);
            const scoreDelta = rewardValue - removedValue;
            await updateDoc(userRef, { inventory: currentInv, totalScore: increment(scoreDelta) });
            UserState.data.inventory = currentInv; UserState.data.totalScore += scoreDelta;
            const resultEl = document.getElementById('alchemy-result');
            if (resultEl) resultEl.innerHTML = `[${reward}] 탄생! (${scoreDelta > 0 ? '+' : ''}${scoreDelta})`;
            updateUI();
        } catch (e) { alert("연금술 실패"); }
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

// =================================================================
// 🎫 복권(Lottery) 로직 추가
// =================================================================

async function playLottery() {
    if (!UserState.user) return alert("로그인이 필요합니다.");
    const cost = 500;
    const resultEl = document.getElementById('lotto-result');

    if (!confirm(`복권 1장을 ${cost}P에 구매하시겠습니까?\n대박 당첨의 기회!`)) return;

    if (await usePoints(cost)) {
        resultEl.innerHTML = `<div class="lotto-scratcher">긁는 중... ✨</div>`;
        
        setTimeout(async () => {
            const rand = Math.random() * 1000; // 0~999
            let rewardMsg = "";
            let rewardType = "none"; // points or item

            if (rand < 1) { // 0.1% 대박 1등
                const winPoints = 30000;
                await addPoints(winPoints);
                rewardMsg = `🎊 1등 당첨!! ${winPoints}P 획득!`;
                rewardType = "win";
            } else if (rand < 10) { // 1% 2등
                const winItem = '💎 다이아몬드';
                const itemScore = ITEM_VALUES[winItem];
                const userRef = doc(db, "users", UserState.user.uid);
                await updateDoc(userRef, { inventory: arrayUnion(winItem), totalScore: increment(itemScore) });
                UserState.data.inventory.push(winItem);
                UserState.data.totalScore += itemScore;
                rewardMsg = `💎 2등 당첨! [${winItem}] 획득!`;
                rewardType = "win";
            } else if (rand < 100) { // 10% 3등
                const winPoints = 1500;
                await addPoints(winPoints);
                rewardMsg = `✨ 3등 당첨! ${winPoints}P 획득!`;
                rewardType = "win";
            } else if (rand < 300) { // 20% 4등
                const winPoints = 500; // 본전
                await addPoints(winPoints);
                rewardMsg = `🍀 4등! ${winPoints}P (본전!)`;
                rewardType = "even";
            } else {
                rewardMsg = `💀 아쉽네요.. 다음 기회에!`;
                rewardType = "lose";
            }

            resultEl.innerHTML = `<div class="lotto-final ${rewardType}">${rewardMsg}</div>`;
            updateUI();
        }, 1500);
    }
}
