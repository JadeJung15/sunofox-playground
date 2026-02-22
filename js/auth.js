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
    serverTimestamp,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export const UserState = {
    user: null,
    data: null,
    isAdmin: false
};

export const EMOJI_SHOP = {
    '귀여운 동물': { '🐱': 200, '🐶': 200, '🦊': 300, '🐰': 300, '🐼': 500, '🐨': 500 },
    '강력한 야수': { '🐯': 800, '🦁': 800, '🐺': 1000, '🐲': 2500 },
    '판타지 & 감성': { '🦄': 1500, '🌈': 1200, '🌙': 1000, '🪐': 1500 },
    '스페셜 프리미엄': { '✨': 3000, '🍀': 3000, '👑': 5000, '💎': 10000 }
};

export const ITEM_VALUES = {
    '💩 돌멩이': 1, '💊 물약': 20, '🥉 동메달': 50, '🥈 은메달': 150, '🥇 금메달': 500, '🍀 행운의 클로버': 100, '💎 다이아몬드': 2000
};

export const TIERS = [
    { name: 'ROOKIE', min: 0, class: 'tier-rookie' },
    { name: 'BRONZE', min: 1000, class: 'tier-bronze' },
    { name: 'SILVER', min: 5000, class: 'tier-silver' },
    { name: 'GOLD', min: 15000, class: 'tier-gold' },
    { name: 'PLATINUM', min: 50000, class: 'tier-platinum' },
    { name: 'DIAMOND', min: 100000, class: 'tier-diamond' }
];

export function getTier(score) {
    for (let i = TIERS.length - 1; i >= 0; i--) { if (score >= TIERS[i].min) return TIERS[i]; }
    return TIERS[0];
}

let authInitialized = false;

export function initAuth() {
    if (authInitialized) return;
    authInitialized = true;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            UserState.user = user;
            const token = await user.getIdTokenResult();
            UserState.isAdmin = !!token.claims.admin;
            await loadUserData(user);
            updateUI(true);
        } else {
            UserState.user = null; UserState.data = null; UserState.isAdmin = false;
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
        if (target.id === 'nickname-save') await changeNickname();
        if (target.classList.contains('emoji-btn')) await handleEmojiExchange(target.dataset.emoji);
        if (target.classList.contains('color-btn')) await changeNameColor(target.dataset.color);
    });
}

async function loadUserData(user) {
    const userRef = doc(db, "users", user.uid);
    let snap = await getDoc(userRef);

    if (!snap.exists()) {
        const newData = {
            uid: user.uid, nickname: user.displayName || '익명',
            emoji: '👤', unlockedEmojis: ['👤'], points: 1000,
            inventory: [], totalScore: 0, lastNicknameChange: null, 
            boosterCount: 0, nameColor: '#333333', unlockedColors: ['#333333'],
            createdAt: serverTimestamp()
        };
        await setDoc(userRef, newData);
        snap = await getDoc(userRef);
    }
    UserState.data = snap.data();
}

export function updateUI(isLoggedIn = !!UserState.user) {
    const headerProfile = document.getElementById('header-profile');
    const userPointsEls = document.querySelectorAll('#user-points');
    const userNameEls = document.querySelectorAll('#user-name');
    const userScoreEls = document.querySelectorAll('#user-total-score');
    const userEmojiEls = document.querySelectorAll('#user-emoji');

    if (isLoggedIn && UserState.data) {
        document.getElementById('login-btn')?.classList.add('hidden');
        if (headerProfile) headerProfile.classList.remove('hidden');
        
        const tier = getTier(UserState.data.totalScore || 0);
        
        userNameEls.forEach(el => {
            el.textContent = (UserState.isAdmin ? '👑 ' : '') + UserState.data.nickname;
            el.style.color = UserState.data.nameColor || 'var(--text-main)';
        });
        userPointsEls.forEach(el => el.textContent = (UserState.data.points || 0).toLocaleString());
        userScoreEls.forEach(el => el.textContent = `${(UserState.data.totalScore || 0).toLocaleString()} 점`);
        userEmojiEls.forEach(el => el.textContent = UserState.data.emoji || '👤');
        
        document.querySelectorAll('.tier-display').forEach(el => {
            el.innerHTML = `<span class="tier-badge ${tier.class}">${tier.name}</span>`;
        });
    } else {
        document.getElementById('login-btn')?.classList.remove('hidden');
        if (headerProfile) headerProfile.classList.add('hidden');
    }
}

async function handleEmojiExchange(emoji) {
    if (!UserState.user || !emoji) return;
    const unlocked = UserState.data.unlockedEmojis || ['👤'];
    if (unlocked.includes(emoji)) {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { emoji: emoji });
        UserState.data.emoji = emoji;
        updateUI();
        return;
    }
    let price = 0;
    for (const cat in EMOJI_SHOP) { if (EMOJI_SHOP[cat][emoji]) { price = EMOJI_SHOP[cat][emoji]; break; } }
    if (UserState.data.totalScore < price) return alert("아이템 점수 부족");
    if (!confirm(`아이템 가치 ${price}점이 차감됩니다. 교환하시겠습니까?`)) return;

    try {
        const userRef = doc(db, "users", UserState.user.uid);
        let currentInv = [...UserState.data.inventory];
        let scoreToDeduct = price;
        currentInv.sort((a, b) => ITEM_VALUES[a] - ITEM_VALUES[b]);
        while (scoreToDeduct > 0 && currentInv.length > 0) {
            const item = currentInv.shift();
            scoreToDeduct -= ITEM_VALUES[item];
        }
        await updateDoc(userRef, {
            unlockedEmojis: [...unlocked, emoji],
            inventory: currentInv,
            totalScore: increment(-price),
            emoji: emoji
        });
        UserState.data.unlockedEmojis = [...unlocked, emoji];
        UserState.data.inventory = currentInv;
        UserState.data.totalScore -= price;
        UserState.data.emoji = emoji;
        updateUI();
        alert("교환 성공!");
        if (window.location.hash === '#profile') window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (e) { alert("오류 발생"); }
}

async function changeNameColor(color) {
    const unlocked = UserState.data.unlockedColors || ['#333333'];
    if (unlocked.includes(color)) {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { nameColor: color });
        UserState.data.nameColor = color;
        updateUI();
        return;
    }
    if (await usePoints(2000)) {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { unlockedColors: [...unlocked, color], nameColor: color });
        UserState.data.unlockedColors.push(color);
        UserState.data.nameColor = color;
        updateUI();
    }
}

async function changeNickname() {
    const input = document.getElementById('nickname-input');
    const msg = document.getElementById('nickname-msg');
    if (!UserState.user || !input?.value.trim()) return;
    const newName = input.value.trim();
    if (newName === UserState.data.nickname) return;
    const now = Date.now();
    const lastChange = UserState.data.lastNicknameChange ? (UserState.data.lastNicknameChange.toMillis ? UserState.data.lastNicknameChange.toMillis() : UserState.data.lastNicknameChange) : 0;
    if (!UserState.isAdmin && (now - lastChange < 30 * 24 * 60 * 60 * 1000)) { alert("30일 제한"); return; }
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { nickname: newName, lastNicknameChange: serverTimestamp() });
        UserState.data.nickname = newName; UserState.data.lastNicknameChange = now;
        updateUI();
        if (msg) msg.textContent = "변경완료!";
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
        alert("포인트가 부족합니다!"); return false;
    }
    const userRef = doc(db, "users", UserState.user.uid);
    await updateDoc(userRef, { points: increment(-amount) });
    UserState.data.points -= amount;
    updateUI();
    return true;
}
