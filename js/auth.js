import { auth, db } from './firebase-init.js';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    increment, 
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export const UserState = {
    user: null,
    data: null
};

export const EMOJI_SHOP = {
    '귀여운 동물 (200~500점)': { '🐱': 200, '🐶': 200, '🦊': 300, '🐰': 300, '🐼': 500, '🐨': 500, '🐹': 400, '🐣': 400 },
    '강력한 야수 (800~2500점)': { '🐯': 800, '🦁': 800, '🐺': 1000, '🐲': 2500 },
    '판타지 & 감성 (800~1500점)': { '🦄': 1500, '🌈': 1200, '🌙': 1000, '🪐': 1500, '🦋': 800, '🔮': 1200 },
    '스페셜 프리미엄 (3000~10000점)': { '✨': 3000, '🍀': 3000, '👑': 5000, '💎': 10000, '🌋': 7000, '⚡': 4000 }
};

export const ITEM_VALUES = {
    '💩 돌멩이': 1, '💊 물약': 20, '🥉 동메달': 50, '🥈 은메달': 150, '🥇 금메달': 500, '🍀 행운의 클로버': 100, '💎 다이아몬드': 2000
};

let authInitialized = false;

export function initAuth() {
    if (authInitialized) return;
    authInitialized = true;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            UserState.user = user;
            await loadUserData(user);
            updateUI(true);
        } else {
            UserState.user = null;
            UserState.data = null;
            updateUI(false);
        }
    });

    document.addEventListener('click', async (e) => {
        const target = e.target.closest('button') || e.target;
        
        if (target.id === 'login-btn') {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider).catch(console.error);
        }
        if (target.id === 'logout-btn') {
            signOut(auth).then(() => { location.hash = '#home'; });
        }
        if (target.id === 'nickname-save') {
            await changeNickname();
        }
        if (target.classList.contains('emoji-btn')) {
            const emoji = target.dataset.emoji;
            await handleEmojiExchange(emoji);
        }
    });
}

async function loadUserData(user) {
    const userRef = doc(db, "users", user.uid);
    let snap = await getDoc(userRef);

    if (!snap.exists()) {
        const newData = {
            uid: user.uid, nickname: user.displayName || '익명',
            emoji: '👤', unlockedEmojis: ['👤'], points: 1000,
            inventory: [], totalScore: 0, lastNicknameChange: null, createdAt: serverTimestamp()
        };
        await setDoc(userRef, newData);
        snap = await getDoc(userRef);
    }
    UserState.data = snap.data();
}

export function updateUI(isLoggedIn = !!UserState.user) {
    const userNameEls = document.querySelectorAll('#user-name');
    const userPointsEls = document.querySelectorAll('#user-points');
    const userScoreEls = document.querySelectorAll('#user-total-score');
    const userEmojiEls = document.querySelectorAll('#user-emoji');

    if (isLoggedIn && UserState.data) {
        document.getElementById('login-btn')?.classList.add('hidden');
        document.getElementById('user-profile')?.classList.remove('hidden');
        
        userNameEls.forEach(el => el.textContent = UserState.data.nickname);
        userPointsEls.forEach(el => el.textContent = `${(UserState.data.points || 0).toLocaleString()} P`);
        userScoreEls.forEach(el => el.textContent = `${(UserState.data.totalScore || 0).toLocaleString()} 점`);
        userEmojiEls.forEach(el => {
            if (el.tagName === 'IMG') el.src = UserState.data.emoji; // If we use images
            else el.textContent = UserState.data.emoji || '👤';
        });
    } else {
        document.getElementById('login-btn')?.classList.remove('hidden');
        document.getElementById('user-profile')?.classList.add('hidden');
    }
}

async function handleEmojiExchange(emoji) {
    if (!UserState.user || !emoji) return;
    
    const unlocked = UserState.data.unlockedEmojis || ['👤'];
    if (unlocked.includes(emoji)) {
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            await updateDoc(userRef, { emoji: emoji });
            UserState.data.emoji = emoji;
            updateUI();
            return;
        } catch (e) { console.error(e); return; }
    }

    // Find price
    let price = 0;
    for (const cat in EMOJI_SHOP) {
        if (EMOJI_SHOP[cat][emoji]) { price = EMOJI_SHOP[cat][emoji]; break; }
    }

    if (UserState.data.totalScore < price) {
        alert(`아이템 가치(점수)가 부족합니다!\n필요: ${price}점 / 보유: ${UserState.data.totalScore}점`);
        return;
    }

    if (!confirm(`[${emoji}] 이모지를 교환하시겠습니까?\n아이템 점수 ${price}점이 차감됩니다.`)) return;

    try {
        const userRef = doc(db, "users", UserState.user.uid);
        let currentInv = [...UserState.data.inventory];
        let scoreToDeduct = price;

        // 아이템 소모 로직: 가치가 낮은 아이템부터 제거
        currentInv.sort((a, b) => ITEM_VALUES[a] - ITEM_VALUES[b]);
        while (scoreToDeduct > 0 && currentInv.length > 0) {
            const item = currentInv.shift();
            scoreToDeduct -= ITEM_VALUES[item];
        }

        // 실제 서버 업데이트 (배열과 점수 동시 업데이트)
        await updateDoc(userRef, {
            unlockedEmojis: [...unlocked, emoji],
            inventory: currentInv,
            totalScore: increment(-price),
            emoji: emoji
        });

        // 로컬 데이터 갱신
        UserState.data.unlockedEmojis = [...unlocked, emoji];
        UserState.data.inventory = currentInv;
        UserState.data.totalScore -= price;
        UserState.data.emoji = emoji;

        updateUI();
        alert("성공적으로 교환되었습니다!");
        // Refresh profile page to update list state
        if (window.location.hash === '#profile') window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (e) {
        console.error("Exchange error:", e);
        alert("교환 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
}

async function changeNickname() {
    const input = document.getElementById('nickname-input');
    const msg = document.getElementById('nickname-msg');
    if (!UserState.user || !input?.value.trim()) return;
    
    const newName = input.value.trim();
    const now = Date.now();
    const lastChange = UserState.data.lastNicknameChange ? 
        (UserState.data.lastNicknameChange.toMillis ? UserState.data.lastNicknameChange.toMillis() : UserState.data.lastNicknameChange) : 0;
    
    if (now - lastChange < 30 * 24 * 60 * 60 * 1000) {
        const days = Math.ceil((lastChange + (30*24*60*60*1000) - now) / (24*60*60*1000));
        if (msg) msg.textContent = `닉네임은 30일마다 변경 가능합니다. (${days}일 남음)`;
        return;
    }

    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { nickname: newName, lastNicknameChange: serverTimestamp() });
        UserState.data.nickname = newName;
        UserState.data.lastNicknameChange = now;
        updateUI();
        if (msg) { msg.textContent = "변경되었습니다!"; msg.style.color = "green"; }
    } catch (e) { console.error(e); }
}

export async function addPoints(amount) {
    if (!UserState.user) return false;
    const userRef = doc(db, "users", UserState.user.uid);
    await updateDoc(userRef, { points: increment(amount) });
    UserState.data.points = (UserState.data.points || 0) + amount;
    updateUI();
    return true;
}

export async function usePoints(amount) {
    if (!UserState.user || (UserState.data.points || 0) < amount) {
        alert("포인트가 부족합니다!");
        return false;
    }
    const userRef = doc(db, "users", UserState.user.uid);
    await updateDoc(userRef, { points: increment(-amount) });
    UserState.data.points -= amount;
    updateUI();
    return true;
}
