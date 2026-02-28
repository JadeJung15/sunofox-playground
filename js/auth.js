import { auth, db } from './firebase-init.js?v=8.4.0';
import { 
    EMOJI_SHOP, 
    ITEM_VALUES, 
    ITEM_GRADES, 
    getGrade, 
    TIERS, 
    getTier, 
    COLOR_SHOP,
    PET_SHOP 
} from './constants/shops.js';

export async function changePet(petId) {
    if (!UserState.user || !UserState.data.unlockedPets?.includes(petId)) return false;
    try {
        await updateDoc(doc(db, "users", UserState.user.uid), { activePet: petId });
        UserState.data.activePet = petId;
        updateUI();
        return true;
    } catch (e) { return false; }
}

export function getPetBuff() {
    const defaultBuff = { mineBonus: 0, testBonus: 0, checkinBonus: 0, multiplier: 1 };
    if (!UserState.data?.activePet) return defaultBuff;

    const petBuffs = {
        F_NORMAL: { mineBonus: 0, testBonus: 1, checkinBonus: 10, multiplier: 1 },
        F_WHITE: { mineBonus: 2, testBonus: 0, checkinBonus: 20, multiplier: 1 },
        F_FIRE: { mineBonus: 4, testBonus: 2, checkinBonus: 0, multiplier: 1 },
        F_SHADOW: { mineBonus: 1, testBonus: 6, checkinBonus: 0, multiplier: 1 },
        F_AURORA: { mineBonus: 0, testBonus: 4, checkinBonus: 40, multiplier: 1 },
        F_CELESTIAL: { mineBonus: 2, testBonus: 5, checkinBonus: 50, multiplier: 1.15 }
    };

    return petBuffs[UserState.data.activePet] || defaultBuff;
}
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    increment, 
    serverTimestamp,
    arrayUnion,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export const UserState = {
    user: null,
    data: null,
    isAdmin: false,
    isMaster: false
};

let authResolve;
export const authReady = new Promise(resolve => authResolve = resolve);

// [추가] 세션 보호를 위한 플래그
let isManualLogout = false;

const ADJECTIVES = ['용감한', '신비로운', '행복한', '빛나는', '똑똑한', '우아한', '재빠른', '포근한', '화려한', '은은한', '날렵한', '든든한'];
const NOUNS = ['여우', '사자', '호랑이', '고양이', '팬더', '독수리', '돌고래', '토끼', '유니콘', '피닉스', '강아지', '늑대'];

function generateRandomNickname() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(1000 + Math.random() * 8999);
    return `${adj}${noun}_${num}`;
}

let authInitialized = false;

export async function initAuth() {
    if (authInitialized) return;
    authInitialized = true;

    try {
        // [강력 조치] 세션 지속성을 로컬 브라우저에 고정
        await setPersistence(auth, browserLocalPersistence);
    } catch (e) { console.error("Persistence error", e); }

    onAuthStateChanged(auth, async (user) => {
        console.log("Auth State Changed:", user ? "User Logged In" : "User Logged Out");
        
        // [세션 가드] 예기치 않은 튕김 방지
        if (!user && UserState.user && !isManualLogout) {
            console.warn("Session dropped unexpectedly. Protecting state...");
            return; 
        }

        if (user) {
            UserState.user = user;
            updateUI(true);

            const token = await user.getIdTokenResult();
            UserState.isMaster = user.uid === '6LVa2hs5ICSi4cgNjRBAx3dA2In2';
            UserState.isAdmin = !!token.claims.admin || UserState.isMaster;
            
            try {
                await loadUserData(user);
                updateUI(true); 
                if (UserState.isMaster) {
                    setTimeout(() => updateUI(true), 500);
                }
            } catch (e) {
                console.error("Load user data error:", e);
                updateUI(true);
            }
            if (typeof setupNotificationListener === 'function') setupNotificationListener(user.uid);
        } else {
            UserState.user = null; UserState.data = null; UserState.isAdmin = false; UserState.isMaster = false;
            if (window.unsubNotifications) window.unsubNotifications();
            updateUI(false);
        }
        authResolve();
    });

    document.addEventListener('click', async (e) => {
        const target = e.target.closest('button') || e.target;
        if (target.id === 'login-btn') {
            if (target.disabled) return;
            isManualLogout = false;
            const originalText = target.textContent;
            target.disabled = true;
            target.textContent = "연결 중...";

            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            try {
                await signInWithPopup(auth, provider);
                setTimeout(() => { location.reload(); }, 500);
            } catch (error) {
                if (error.code === 'auth/popup-blocked') {
                    await signInWithRedirect(auth, provider);
                } else if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
                    handleAuthError(error);
                }
            } finally {
                target.disabled = false;
                target.textContent = originalText;
            }
        }
        if (target.id === 'logout-btn') {
            isManualLogout = true;
            signOut(auth).then(() => { location.reload(); });
        }
        if (target.id === 'nickname-save') await changeNickname();
        if (target.classList.contains('emoji-btn')) await handleEmojiExchange(target.dataset.emoji);
        if (target.classList.contains('color-btn')) await changeNameColor(target.dataset.color);
    });
}

function handleAuthError(error) {
    let msg = "로그인 오류: " + error.code;
    if (error.code === 'auth/unauthorized-domain') msg = "승인되지 않은 도메인입니다.";
    alert(msg);
}

export function updateUI(isLoggedIn = !!UserState.user) {
    const loginBtn = document.getElementById('login-btn');
    const headerProfile = document.getElementById('header-profile');
    if (!loginBtn || !headerProfile) return;

    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        loginBtn.classList.add('hidden');
        headerProfile.style.display = 'flex';
        headerProfile.classList.remove('hidden');
        
        const data = UserState.data || {};
        const tier = getTier(data.totalScore || 0);
        
        document.querySelectorAll('#user-name').forEach(el => {
            let prefix = UserState.isMaster ? '💎 ' : (UserState.isAdmin ? '👑 ' : '');
            const petEmoji = data.activePet && PET_SHOP[data.activePet] ? PET_SHOP[data.activePet].emoji : '';
            el.innerHTML = `${prefix}${data.nickname || UserState.user?.displayName || '사용자'} <span style="font-size: 0.8em; margin-left: 4px;">${petEmoji}</span>`;
            el.style.color = data.nameColor || 'var(--text-main)';
        });
        document.querySelectorAll('#user-points').forEach(el => el.textContent = (data.points || 0).toLocaleString());
        document.querySelectorAll('#user-total-score').forEach(el => el.textContent = `${(data.totalScore || 0).toLocaleString()} 점`);
        document.querySelectorAll('#user-emoji').forEach(el => el.textContent = data.emoji || '👤');
        
        document.querySelectorAll('.tier-display').forEach(el => {
            el.innerHTML = `<span class="tier-badge ${tier.class}">${tier.name}</span>`;
        });

        const footerAdmin = document.getElementById('footer-admin-link');
        if (footerAdmin && UserState.isMaster) {
            footerAdmin.classList.remove('hidden');
            footerAdmin.style.display = 'inline';
        }
    } else {
        loginBtn.style.display = 'flex';
        loginBtn.classList.remove('hidden');
        headerProfile.style.display = 'none';
        headerProfile.classList.add('hidden');
        const footerAdmin = document.getElementById('footer-admin-link');
        if (footerAdmin) footerAdmin.style.display = 'none';
    }
}

async function loadUserData(user) {
    const userRef = doc(db, "users", user.uid);
    let snap = await getDoc(userRef);
    if (!snap.exists()) {
        const newData = {
            uid: user.uid, nickname: generateRandomNickname(), 
            originalName: user.displayName || '알 수 없음',
            originalEmail: user.email || '이메일 없음',
            emoji: '👤', unlockedEmojis: ['👤'], points: 1000,
            inventory: [], totalScore: 0, discoveredItems: [],
            activePet: 'F_NORMAL', unlockedPets: ['F_NORMAL'],
            nicknameChanged: false, lastNicknameChange: null, nameColor: '#333333',
            arcadeStats: {
                mining: 0,
                gacha: 0,
                alchemy: 0,
                lottery: 0,
                betting: 0,
                checkin: 0,
                luckyDraw: 0,
                slot: 0,
                coinFlip: 0,
                timingRush: 0,
                bomb: 0
            },
            arcadeWeekly: { weekKey: null, plays: 0, claimedMilestones: [] },
            quests: { date: null, list: {} }, createdAt: serverTimestamp()
        };
        await setDoc(userRef, newData);
        snap = await getDoc(userRef);
    }
    UserState.data = snap.data();
}

const profileCache = new Map();
export function updateProfileCache(uid, partialData) {
    if (!uid) return;
    const current = profileCache.get(uid) || { nickname: "익명", emoji: "👤", points: 0, totalScore: 0 };
    profileCache.set(uid, { ...current, ...partialData });
}

export async function fetchUserProfile(uid) {
    if (!uid) return null;
    if (profileCache.has(uid)) return profileCache.get(uid);
    try {
        const userSnap = await getDoc(doc(db, "users", uid));
        if (userSnap.exists()) {
            const data = userSnap.data();
            profileCache.set(uid, data);
            return data;
        }
    } catch (e) {}
    return { nickname: "익명", emoji: "👤" };
}

export async function fetchUserRank(uid) {
    try {
        const q = query(collection(db, "users"), orderBy("totalScore", "desc"), limit(100));
        const snap = await getDocs(q);
        const rankList = snap.docs.map(d => d.id);
        const idx = rankList.findIndex(id => id === uid);
        return idx !== -1 ? idx + 1 : ">100";
    } catch (e) { return "-"; }
}

export async function handleEmojiExchange(emoji) {
    if (!UserState.user || !emoji || UserState.data.emoji === emoji) return;
    if (await usePoints(500, `아이콘 변경`)) {
        await updateDoc(doc(db, "users", UserState.user.uid), { emoji: emoji });
        UserState.data.emoji = emoji; 
        alert("아이콘이 변경되었습니다!");
        updateUI();
        if (location.hash === '#profile') {
            const { renderProfile } = await import('./pages/profile.js?v=8.4.0');
            renderProfile();
        }
    }
}

let isColorChanging = false;
export async function changeNameColor(color) {
    if (isColorChanging || !UserState.user || !color || UserState.data.nameColor === color) return;
    isColorChanging = true;
    if (await usePoints(1000, `닉네임 색상 변경`)) {
        try {
            await updateDoc(doc(db, "users", UserState.user.uid), { nameColor: color });
            UserState.data.nameColor = color; 
            alert("닉네임 색상이 변경되었습니다!");
            updateUI();
            if (location.hash === '#profile') {
                const { renderProfile } = await import('./pages/profile.js?v=8.4.0');
                renderProfile();
            }
        } catch (e) {
            alert("색상 변경 중 오류가 발생했습니다.");
        }
    } else {
        alert("포인트가 부족합니다 (1,000P 필요)");
    }
    isColorChanging = false;
}

export async function changeNickname() {
    const input = document.getElementById('nickname-input');
    if (!UserState.user || !input?.value.trim()) return;
    const newName = input.value.trim();
    if (newName.length < 2 || newName.length > 10) return alert("닉네임은 2~10자 사이여야 합니다.");
    
    const cost = UserState.data.nicknameChanged ? 5000 : 0;
    if (cost === 0 || await usePoints(cost, `닉네임 변경`)) {
        try {
            await updateDoc(doc(db, "users", UserState.user.uid), { nickname: newName, nicknameChanged: true });
            UserState.data.nickname = newName; UserState.data.nicknameChanged = true; 
            alert("닉네임이 변경되었습니다!");
            updateUI();
            if (location.hash === '#profile') {
                const { renderProfile } = await import('./pages/profile.js?v=8.4.0');
                renderProfile();
            }
        } catch (e) {
            alert("닉네임 변경 중 오류가 발생했습니다.");
        }
    } else {
        alert("포인트가 부족합니다 (5,000P 필요)");
    }
}

export async function addPoints(amount, reason = "보상") {
    if (!UserState.user) return false;
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { points: increment(amount) });
        UserState.data.points = (UserState.data.points || 0) + amount;
        updateUI();
        return true;
    } catch (e) { return false; }
}

export async function usePoints(amount, reason = "소모") {
    if (!UserState.user || (UserState.data.points || 0) < amount) return false;
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { points: increment(-amount) });
        UserState.data.points -= amount;
        updateUI();
        return true;
    } catch (e) { return false; }
}

export async function chargeUserPoints(uid, amount) {
    if (!UserState.isMaster || !uid || !Number.isFinite(amount)) return false;
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, { points: increment(amount) });
        await addDoc(collection(db, "pointLogs"), {
            uid,
            type: "points",
            amount,
            reason: "관리자 집행",
            timestamp: serverTimestamp()
        });
        if (UserState.user?.uid === uid) {
            UserState.data.points = (UserState.data.points || 0) + amount;
            updateUI();
        }
        return true;
    } catch (e) { return false; }
}

export async function chargeUserScore(uid, amount) {
    if (!UserState.isMaster || !uid || !Number.isFinite(amount)) return false;
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, { totalScore: increment(amount) });
        await addDoc(collection(db, "pointLogs"), {
            uid,
            type: "score",
            amount,
            reason: "관리자 집행",
            timestamp: serverTimestamp()
        });
        if (UserState.user?.uid === uid) {
            UserState.data.totalScore = (UserState.data.totalScore || 0) + amount;
            updateUI();
        }
        return true;
    } catch (e) { return false; }
}
