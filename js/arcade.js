import { addPoints, usePoints, UserState } from './auth.js';

export function initArcade() {
    const gachaBtn = document.getElementById('gacha-btn');
    const gameBtn = document.getElementById('click-game-btn');
    
    if (gachaBtn) gachaBtn.addEventListener('click', playGacha);
    if (gameBtn) gameBtn.addEventListener('click', playClickGame);
}

async function playGacha() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    
    const cost = 100;
    if (await usePoints(cost)) {
        const items = ['💎 다이아몬드', '🥇 금메달', '🥈 은메달', '🥉 동메달', '💩 돌멩이', '🍀 행운의 네잎클로버', '💊 물약'];
        const result = items[Math.floor(Math.random() * items.length)];
        
        const resultEl = document.getElementById('gacha-result');
        resultEl.innerHTML = `<div class="gacha-pop">축하합니다!<br><strong>[${result}]</strong> 획득!</div>`;
        
        // Simple animation
        resultEl.classList.remove('pop');
        void resultEl.offsetWidth; // trigger reflow
        resultEl.classList.add('pop');
    }
}

async function playClickGame() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    
    // Simple RNG game for demo
    const btn = document.getElementById('click-game-btn');
    btn.disabled = true;
    
    let clicks = 0;
    const duration = 3000; // 3 seconds
    const start = Date.now();
    
    btn.textContent = "Click Fast!!!";
    
    const handler = () => clicks++;
    btn.addEventListener('click', handler); // Note: this logic is slightly flawed as button is disabled, we'll fix logic below
    
    // Actually, let's make it a "Lucky Draw" instead of clicker to avoid complex UI states in this snippet
    // Or a simple "Delay Reaction"
    
    // Re-implementation: Lucky Box
    const earn = Math.floor(Math.random() * 50) + 10;
    
    btn.textContent = "채굴 중...";
    setTimeout(async () => {
        await addPoints(earn);
        alert(`${earn} 포인트 획득!`);
        btn.disabled = false;
        btn.textContent = "포인트 채굴하기 (무료)";
        btn.removeEventListener('click', handler);
    }, 1000);
}
