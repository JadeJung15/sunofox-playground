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
    });
}

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
            await updateDoc(userRef, {
                inventory: arrayUnion(drawnItem),
                totalScore: increment(itemScore)
            });
            UserState.data.inventory.push(drawnItem);
            UserState.data.totalScore = (UserState.data.totalScore || 0) + itemScore;
            const resultEl = document.getElementById('gacha-result');
            if (resultEl) resultEl.innerHTML = `<div class="gacha-pop"><strong>[${drawnItem}]</strong> 획득!<br><small>+${itemScore}점</small></div>`;
            updateUI();
        } catch (e) { alert("저장 실패"); }
    }
}

function getRandomItem(items, weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        if (random < weights[i]) return items[i];
        random -= weights[i];
    }
    return items[0];
}

async function playClickGame() {
    const btn = document.getElementById('click-game-btn');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    const earn = Math.floor(Math.random() * 10) + 5;
    btn.textContent = "채굴 중...";
    setTimeout(async () => {
        await addPoints(earn);
        btn.disabled = false;
        btn.textContent = "포인트 채굴";
    }, 1000);
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
    } else {
        msg.textContent = guess < upDownAnswer ? "UP!" : "DOWN!";
    }
}

// 아이템 연금술: 아이템 5개 + 500P -> 상급 아이템 1개
async function playAlchemy() {
    if (!UserState.user) return;
    const costPoints = 500;
    const costItemsCount = 5;

    if (UserState.data.inventory.length < costItemsCount) {
        alert("연금술을 위해 아이템이 5개 이상 필요합니다!");
        return;
    }

    if (!confirm(`아이템 5개와 ${costPoints}P를 사용하여 연금술을 진행하시겠습니까?\n무작위 상급 아이템 1개를 얻습니다.`)) return;

    if (await usePoints(costPoints)) {
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            let currentInv = [...UserState.data.inventory];
            
            // 소모할 아이템 5개 제거 (가장 낮은 것들)
            currentInv.sort((a, b) => ITEM_VALUES[a] - ITEM_VALUES[b]);
            let removedValue = 0;
            for (let i = 0; i < costItemsCount; i++) {
                removedValue += ITEM_VALUES[currentInv.shift()];
            }

            // 상급 아이템 목록 (동메달 이상)
            const highItems = ['🥈 은메달', '🥇 금메달', '💎 다이아몬드', '🍀 행운의 클로버'];
            const reward = highItems[Math.floor(Math.random() * highItems.length)];
            const rewardValue = ITEM_VALUES[reward];

            currentInv.push(reward);
            const scoreDelta = rewardValue - removedValue;

            await updateDoc(userRef, {
                inventory: currentInv,
                totalScore: increment(scoreDelta)
            });

            UserState.data.inventory = currentInv;
            UserState.data.totalScore += scoreDelta;

            const resultEl = document.getElementById('alchemy-result');
            if (resultEl) resultEl.innerHTML = `연금술 성공! <strong>[${reward}]</strong> 탄생! (점수 변동: ${scoreDelta > 0 ? '+' : ''}${scoreDelta})`;
            
            updateUI();
        } catch (e) { console.error(e); alert("연금술 실패"); }
    }
}
