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

// 이모지 등급 및 가격 (필요 점수 가치)
export const EMOJI_SHOP = {
    '기본': { '👤': 0 },
    '귀여운 동물': { '🐱': 200, '🐶': 200, '🦊': 300, '🐰': 300, '🐼': 500, '🐨': 500, '🐹': 400, '🐣': 400 },
    '강력한 야수': { '🐯': 800, '🦁': 800, '🐺': 1000, '🐲': 2500 },
    '판타지 & 감성': { '🦄': 1500, '🌈': 1200, '🌙': 1000, '🪐': 1500, '🦋': 800, '🔮': 1200 },
    '스페셜 프리미엄': { '✨': 3000, '🍀': 3000, '👑': 5000, '💎': 10000, '🌋': 7000, '⚡': 4000 }
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
        if (e.target.id === 'login-btn') {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider).catch(console.error);
        }
        if (e.target.id === 'logout-btn') {
            signOut(auth).then(() => { location.hash = '#home'; });
        }
        if (e.target.id === 'nickname-save') {
            await changeNickname();
        }
        if (e.target.classList.contains('emoji-btn')) {
            const emoji = e.target.dataset.emoji;
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
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userNameEls = document.querySelectorAll('#user-name');
    const userPointsEls = document.querySelectorAll('#user-points');
    const userScoreEls = document.querySelectorAll('#user-total-score');
    const userEmojiEls = document.querySelectorAll('#user-emoji');

    if (isLoggedIn && UserState.data) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        userNameEls.forEach(el => el.textContent = UserState.data.nickname);
        userPointsEls.forEach(el => el.textContent = `${(UserState.data.points || 0).toLocaleString()} P`);
        userScoreEls.forEach(el => el.textContent = `${(UserState.data.totalScore || 0).toLocaleString()} 점`);
        userEmojiEls.forEach(el => el.textContent = UserState.data.emoji || '👤');
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
    }
}

async function handleEmojiExchange(emoji) {
    if (!UserState.user) return;
    const isUnlocked = (UserState.data.unlockedEmojis || []).includes(emoji);

    if (isUnlocked) {
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            await updateDoc(userRef, { emoji: emoji });
            UserState.data.emoji = emoji;
            updateUI();
        } catch (e) { console.error(e); }
    } else {
        // 아이템 교환 로직
        let price = 0;
        Object.values(EMOJI_SHOP).forEach(cat => { if (cat[emoji]) price = cat[emoji]; });

        if (UserState.data.totalScore < price) {
            alert(`아이템 점수가 부족하여 교환할 수 없습니다.\n필요 가치: ${price}점\n현재 보유 가치: ${UserState.data.totalScore}점\n\n오락실에서 아이템을 더 모아보세요!`);
            return;
        }

        if (confirm(`[${emoji}] 이모지로 교환하시겠습니까?\n보유 아이템 가치 중 ${price}점이 차감되며, 랭킹 순위가 하락할 수 있습니다.`)) {
            try {
                // 인벤토리에서 가격만큼 아이템 제거 로직 (단순화를 위해 점수 차감 및 아이템 배열 조정)
                let remainingToDeduct = price;
                const newInventory = [...UserState.data.inventory];
                
                // 가치가 낮은 아이템부터 우선 소모
                newInventory.sort((a, b) => ITEM_VALUES[a] - ITEM_VALUES[b]);
                
                while (remainingToDeduct > 0 && newInventory.length > 0) {
                    const item = newInventory.shift();
                    remainingToDeduct -= ITEM_VALUES[item];
                }

                const userRef = doc(db, "users", UserState.user.uid);
                await updateDoc(userRef, {
                    unlockedEmojis: [...UserState.data.unlockedEmojis, emoji],
                    totalScore: increment(-price),
                    inventory: newInventory,
                    emoji: emoji
                });

                UserState.data.unlockedEmojis.push(emoji);
                UserState.data.totalScore -= price;
                UserState.data.inventory = newInventory;
                UserState.data.emoji = emoji;
                
                updateUI();
                alert("이모지 교환 성공! 프로필에 적용되었습니다.");
                if (window.location.hash === '#profile') window.dispatchEvent(new HashChangeEvent('hashchange'));
            } catch (e) {
                console.error(e);
                alert("교환 처리 중 오류가 발생했습니다.");
            }
        }
    }
}

async function changeNickname() {
    const nicknameInput = document.getElementById('nickname-input');
    const nicknameMsg = document.getElementById('nickname-msg');
    if (!UserState.user || !nicknameInput || !nicknameInput.value.trim()) return;
    const newName = nicknameInput.value.trim();
    if (newName === UserState.data.nickname) return;

    const now = Date.now();
    const lastChangeTs = UserState.data.lastNicknameChange;
    const lastChange = lastChangeTs ? (lastChangeTs.toMillis ? lastChangeTs.toMillis() : lastChangeTs) : 0;
    const cooldown = 30 * 24 * 60 * 60 * 1000;

    if (now - lastChange < cooldown) {
        const daysLeft = Math.ceil((lastChange + cooldown - now) / (24 * 60 * 60 * 1000));
        if (nicknameMsg) { nicknameMsg.textContent = `닉네임은 30일에 한 번만 변경 가능합니다. (${daysLeft}일 남음)`; nicknameMsg.className = 'error-msg'; }
        return;
    }

    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { nickname: newName, lastNicknameChange: serverTimestamp() });
        UserState.data.nickname = newName;
        UserState.data.lastNicknameChange = now; 
        updateUI();
        if (nicknameMsg) { nicknameMsg.textContent = "닉네임이 변경되었습니다!"; nicknameMsg.className = "success-msg"; }
    } catch (e) { if (nicknameMsg) nicknameMsg.textContent = "오류 발생"; }
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
