import { addPoints, usePoints, UserState, updateUI } from './auth.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export const ITEMS = {
    '💩 돌멩이': 1,
    '💊 물약': 20,
    '🥉 동메달': 50,
    '🥈 은메달': 150,
    '🥇 금메달': 500,
    '🍀 행운의 클로버': 100,
    '💎 다이아몬드': 2000
};

export function initArcade() {
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'gacha-btn') await playGacha();
        if (e.target.id === 'click-game-btn') await playClickGame();
    });
}

async function playGacha() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    
    const cost = 100;
    if (await usePoints(cost)) {
        const itemNames = Object.keys(ITEMS);
        const weights = [40, 20, 15, 10, 5, 8, 2]; // Probability weights
        const drawnItem = getRandomItem(itemNames, weights);
        const itemScore = ITEMS[drawnItem];

        try {
            const userRef = doc(db, "users", UserState.user.uid);
            await updateDoc(userRef, {
                inventory: arrayUnion(drawnItem),
                totalScore: increment(itemScore)
            });

            // Update local state
            UserState.data.inventory.push(drawnItem);
            UserState.data.totalScore = (UserState.data.totalScore || 0) + itemScore;

            const resultEl = document.getElementById('gacha-result');
            resultEl.innerHTML = `<div class="gacha-pop">축하합니다!<br><strong>[${drawnItem}]</strong> 획득!<br><span style="font-size:0.8rem; color:var(--text-sub);">아이템 점수 +${itemScore}</span></div>`;
            
            updateUI();
        } catch (e) {
            console.error(e);
            alert("아이템 획득 저장에 실패했습니다.");
        }
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
    const earn = Math.floor(Math.random() * 20) + 5;
    btn.textContent = "채굴 중...";
    
    setTimeout(async () => {
        await addPoints(earn);
        btn.disabled = false;
        btn.textContent = "포인트 채굴하기 (무료)";
    }, 800);
}
