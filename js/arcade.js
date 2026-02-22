import { addPoints, usePoints, UserState, updateUI, ITEM_VALUES } from './auth.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

let arcadeInitialized = false;

export function initArcade() {
    if (arcadeInitialized) return;
    arcadeInitialized = true;

    document.addEventListener('click', async (e) => {
        if (e.target.id === 'gacha-btn') await playGacha();
        if (e.target.id === 'click-game-btn') await playClickGame();
        if (e.target.id === 'updown-submit') await playUpDown();
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
            if (resultEl) {
                resultEl.innerHTML = `<div class="gacha-pop"><strong>[${drawnItem}]</strong> 획득!<br><small>+${itemScore}점</small></div>`;
            }
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
    const earn = Math.floor(Math.random() * 15) + 5;
    btn.textContent = "채굴 중...";
    setTimeout(async () => {
        await addPoints(earn);
        btn.disabled = false;
        btn.textContent = "무료 포인트 채굴";
    }, 1000);
}

// 신규 게임: 숫자 업다운
let upDownAnswer = Math.floor(Math.random() * 50) + 1;
export async function playUpDown() {
    const input = document.getElementById('updown-input');
    const msg = document.getElementById('updown-msg');
    if (!input || !UserState.user) return;

    const guess = parseInt(input.value);
    if (isNaN(guess)) return;

    if (guess === upDownAnswer) {
        const reward = 50;
        await addPoints(reward);
        msg.textContent = `정답! ${reward}P 획득! 숫자가 초기화됩니다.`;
        msg.style.color = "var(--accent-secondary)";
        upDownAnswer = Math.floor(Math.random() * 50) + 1;
        input.value = "";
    } else if (guess < upDownAnswer) {
        msg.textContent = "UP! 더 큰 숫자입니다.";
        msg.style.color = "#ff4757";
    } else {
        msg.textContent = "DOWN! 더 작은 숫자입니다.";
        msg.style.color = "#ff4757";
    }
}
