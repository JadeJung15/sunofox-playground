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
    isAdmin: false,
    isMaster: false
};

// 상점 데이터 정규화
export const EMOJI_SHOP = {
    '귀여운 동물': { '🐱': 200, '🐶': 200, '🦊': 300, '🐰': 300, '🐼': 500, '🐨': 500, '🐹': 400, '🐣': 400, '🐧': 500 },
    '강력한 야수': { '🐯': 800, '🦁': 800, '🐺': 1000, '🐲': 2500, '🦖': 2000, '🦈': 1500 },
    '자연 & 날씨': { '🌸': 300, '🌻': 300, '🍀': 400, '☀️': 500, '🌙': 500, '🌈': 1000, '🔥': 1000, '🌌': 2000 },
    '스페셜 프리미엄': { '✨': 3000, '👑': 5000, '💎': 10000, '⚡': 4000, '🧿': 5000 }
};

export const ITEM_VALUES = {
    '💩 돌멩이': 1, '💊 물약': 20, '🥉 동메달': 50, '🥈 은메달': 150, '🥇 금메달': 500, '🍀 행운의 클로버': 100, '💎 다이아몬드': 2000,
    '🧪 현자의 돌': 5000, '🧬 인공 생명체': 8000, '⚡ 번개 병': 3500, '🌌 은하수 가루': 12000
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
            UserState.isMaster = user.uid === '6LVa2hs5ICSi4cgNjRBAx3dA2In2';
            UserState.isAdmin = !!token.claims.admin || UserState.isMaster;
            await loadUserData(user);
            updateUI(true);
        } else {
            UserState.user = null; UserState.data = null; UserState.isAdmin = false; UserState.isMaster = false;
            updateUI(false);
        }
    });

    // Delegated clicks for reliability
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
            arcadeStats: { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 },
            createdAt: serverTimestamp()
        };
        await setDoc(userRef, newData);
        snap = await getDoc(userRef);
    }
    UserState.data = snap.data();
    if (!UserState.data.arcadeStats) UserState.data.arcadeStats = { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 };
}

export function updateUI(isLoggedIn = !!UserState.user) {
    if (isLoggedIn && UserState.data) {
        document.getElementById('login-btn')?.classList.add('hidden');
        document.getElementById('header-profile')?.classList.remove('hidden');
        
        const tier = getTier(UserState.data.totalScore || 0);
        
        document.querySelectorAll('#user-name').forEach(el => {
            let prefix = '';
            if (UserState.isMaster) prefix = '💎 ';
            else if (UserState.isAdmin) prefix = '👑 ';
            el.textContent = prefix + UserState.data.nickname;
            el.style.color = UserState.data.nameColor || 'var(--text-main)';
        });
        document.querySelectorAll('#user-points').forEach(el => el.textContent = (UserState.data.points || 0).toLocaleString());
        document.querySelectorAll('#user-total-score').forEach(el => el.textContent = `${(UserState.data.totalScore || 0).toLocaleString()} 점`);
        document.querySelectorAll('#user-emoji').forEach(el => el.textContent = UserState.data.emoji || '👤');
        
        document.querySelectorAll('.tier-display').forEach(el => {
            el.innerHTML = `<span class="tier-badge ${tier.class}">${tier.name}</span>`;
        });
    } else {
        document.getElementById('login-btn')?.classList.remove('hidden');
        document.getElementById('header-profile')?.classList.add('hidden');
    }
}

async function handleEmojiExchange(emoji) {
    if (!UserState.user || !emoji) return;
    const unlocked = UserState.data.unlockedEmojis || ['👤'];
    if (unlocked.includes(emoji)) {
        await updateDoc(doc(db, "users", UserState.user.uid), { emoji: emoji });
        UserState.data.emoji = emoji;
        updateUI(); return;
    }
    let price = 0;
    for (const cat in EMOJI_SHOP) { if (EMOJI_SHOP[cat][emoji]) { price = EMOJI_SHOP[cat][emoji]; break; } }
    if (UserState.data.totalScore < price) return alert("아이템 점수가 부족합니다.");
    if (!confirm(`[${emoji}] 교환 시 아이템 가치 ${price}점이 소모됩니다.`)) return;

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
            unlockedEmojis: arrayUnion(emoji),
            inventory: currentInv,
            totalScore: increment(-price),
            emoji: emoji
        });
        UserState.data.unlockedEmojis.push(emoji); UserState.data.inventory = currentInv; UserState.data.totalScore -= price; UserState.data.emoji = emoji;
        updateUI(); alert("교환 완료!");
        if (window.location.hash === '#profile') window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (e) { alert("오류 발생"); }
}

async function changeNameColor(color) {
    const unlocked = UserState.data.unlockedColors || ['#333333'];
    if (unlocked.includes(color)) {
        await updateDoc(doc(db, "users", UserState.user.uid), { nameColor: color });
        UserState.data.nameColor = color; updateUI(); return;
    }
    if (await usePoints(2000)) {
        await updateDoc(doc(db, "users", UserState.user.uid), { unlockedColors: arrayUnion(color), nameColor: color });
        UserState.data.unlockedColors.push(color); UserState.data.nameColor = color; updateUI();
    }
}

async function changeNickname() {
    const input = document.getElementById('nickname-input');
    const msg = document.getElementById('nickname-msg');
    if (!UserState.user || !input?.value.trim()) return;
    const newName = input.value.trim();
    const now = Date.now();
    const lastChange = UserState.data.lastNicknameChange ? (UserState.data.lastNicknameChange.toMillis ? UserState.data.lastNicknameChange.toMillis() : UserState.data.lastNicknameChange) : 0;
    if (!UserState.isAdmin && (now - lastChange < 30 * 24 * 60 * 60 * 1000)) {
        const days = Math.ceil((lastChange + 30*24*60*60*1000 - now) / (24*60*60*1000));
        if (msg) msg.textContent = `${days}일 후 변경 가능합니다.`; return;
    }
    try {
        await updateDoc(doc(db, "users", UserState.user.uid), { nickname: newName, lastNicknameChange: serverTimestamp() });
        UserState.data.nickname = newName; UserState.data.lastNicknameChange = now; updateUI();
        if (msg) msg.textContent = "변경되었습니다.";
    } catch (e) { console.error(e); }
}

export async function chargeUserPoints(targetUid, amount) {
    if (!UserState.isAdmin) return false;
    const finalUid = targetUid || UserState.user.uid;
    try {
        await updateDoc(doc(db, "users", finalUid), { points: increment(amount) });
        if (finalUid === UserState.user.uid) { UserState.data.points += amount; updateUI(); }
        return true;
    } catch (e) { return false; }
}

export async function addPoints(amount) {
    if (!UserState.user) return false;
    try {
        await updateDoc(doc(db, "users", UserState.user.uid), { points: increment(amount) });
        UserState.data.points += amount; updateUI(); return true;
    } catch (e) { return false; }
}

export async function usePoints(amount) {
    if (!UserState.user || UserState.data.points < amount) { alert("포인트 부족"); return false; }
    try {
        await updateDoc(doc(db, "users", UserState.user.uid), { points: increment(-amount) });
        UserState.data.points -= amount; updateUI(); return true;
    } catch (e) { return false; }
}
