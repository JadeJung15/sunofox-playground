import { auth, db } from './firebase-init.js';
import { 
    EMOJI_SHOP, 
    ITEM_VALUES, 
    ITEM_GRADES, 
    getGrade, 
    TIERS, 
    getTier, 
    COLOR_SHOP 
} from './constants/shops.js';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
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

const ADJECTIVES = ['용감한', '신비로운', '행복한', '빛나는', '똑똑한', '우아한', '재빠른', '포근한', '화려한', '은은한', '날렵한', '든든한'];
const NOUNS = ['여우', '사자', '호랑이', '고양이', '팬더', '독수리', '돌고래', '토끼', '유니콘', '피닉스', '강아지', '늑대'];

function generateRandomNickname() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(1000 + Math.random() * 8999);
    return `${adj}${noun}_${num}`;
}

let authInitialized = false;

export function initAuth() {
    if (authInitialized) return;
    authInitialized = true;

    // 초기 상태 체크 (이미 로그인되어 있을 수 있음)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            UserState.user = user;
            // 중요: 데이터 로드 전이라도 UI를 즉시 '로그인됨' 상태로 고정 (깜빡임 방지)
            updateUI(true);

            const token = await user.getIdTokenResult();
            UserState.isMaster = user.uid === '6LVa2hs5ICSi4cgNjRBAx3dA2In2';
            UserState.isAdmin = !!token.claims.admin || UserState.isMaster;
            
            try {
                await loadUserData(user);
                updateUI(true); // 데이터 로드 후 상세 정보 갱신
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
            const originalText = target.textContent;
            target.disabled = true;
            target.textContent = "연결 중...";

            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            try {
                const result = await signInWithPopup(auth, provider);
                // 로그인 성공 시 상태 전파를 위해 약간의 대기 후 새로고침 (선택 사항이나 안정성 위해 유지)
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
            signOut(auth).then(() => { location.reload(); });
        }
        if (target.id === 'nickname-save') await changeNickname();
        if (target.classList.contains('emoji-btn')) await handleEmojiExchange(target.dataset.emoji);
        if (target.classList.contains('color-btn')) await changeNameColor(target.dataset.color);
    });
}

function handleAuthError(error) {
    let msg = "로그인 오류: " + error.code;
    if (error.code === 'auth/unauthorized-domain') msg = "승인되지 않은 도메인입니다. 관리자 설정을 확인해 주세요.";
    alert(msg);
}

export function updateUI(isLoggedIn = !!UserState.user) {
    const loginBtn = document.getElementById('login-btn');
    const headerProfile = document.getElementById('header-profile');
    
    // 이 함수가 호출될 때마다 요소가 있는지 확인
    if (!loginBtn || !headerProfile) return;

    if (isLoggedIn) {
        // [강력 제어] 스타일 직접 주입으로 클래스 캐시 무시
        loginBtn.style.display = 'none';
        loginBtn.classList.add('hidden');
        
        headerProfile.style.display = 'flex';
        headerProfile.classList.remove('hidden');
        
        const data = UserState.data || {};
        const tier = getTier(data.totalScore || 0);
        
        document.querySelectorAll('#user-name').forEach(el => {
            let prefix = UserState.isMaster ? '💎 ' : (UserState.isAdmin ? '👑 ' : '');
            el.textContent = prefix + (data.nickname || UserState.user?.displayName || '사용자');
            el.style.color = data.nameColor || 'var(--text-main)';
        });
        document.querySelectorAll('#user-points').forEach(el => el.textContent = (data.points || 0).toLocaleString());
        document.querySelectorAll('#user-total-score').forEach(el => el.textContent = `${(data.totalScore || 0).toLocaleString()} 점`);
        document.querySelectorAll('#user-emoji').forEach(el => el.textContent = data.emoji || '👤');
        
        document.querySelectorAll('.tier-display').forEach(el => {
            el.innerHTML = `<span class="tier-badge ${tier.class}">${tier.name}</span>`;
        });

        const footerAdmin = document.getElementById('footer-admin-link');
        if (footerAdmin) {
            footerAdmin.style.display = UserState.isMaster ? 'inline' : 'none';
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
            uid: user.uid, 
            nickname: generateRandomNickname(), 
            originalName: user.displayName || '알 수 없음',
            originalEmail: user.email || '이메일 없음',
            emoji: '👤', unlockedEmojis: ['👤'], points: 1000,
            inventory: [], totalScore: 0, discoveredItems: [],
            nicknameChanged: false, lastNicknameChange: null, 
            nameColor: '#333333', arcadeStats: { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 },
            quests: { date: null, list: {} }, createdAt: serverTimestamp()
        };
        await setDoc(userRef, newData);
        snap = await getDoc(userRef);
    }
    UserState.data = snap.data();
}

// 나머지 헬퍼 함수들 (상태 유지)
const profileCache = new Map();
export function updateProfileCache(uid, partialData) {
    if (!uid) return;
    const current = profileCache.get(uid) || { nickname: "익명", emoji: "👤", nameColor: "var(--text-main)", points: 0, totalScore: 0 };
    profileCache.set(uid, { ...current, ...partialData });
}

export async function fetchUserProfile(uid) {
    if (!uid) return null;
    if (profileCache.has(uid)) return profileCache.get(uid);
    try {
        const userSnap = await getDoc(doc(db, "users", uid));
        if (userSnap.exists()) {
            const data = userSnap.data();
            const profile = { ...data, nickname: data.nickname || "익명", emoji: data.emoji || "👤" };
            profileCache.set(uid, profile);
            return profile;
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

async function addLog(uid, type, amount, reason) {
    try { await addDoc(collection(db, "pointLogs"), { uid, type, amount, reason, timestamp: serverTimestamp() }); } catch (e) {}
}

async function handleEmojiExchange(emoji) {
    if (!UserState.user || !emoji || UserState.data.emoji === emoji) return;
    if (!confirm(`아이콘을 [${emoji}](으)로 변경하시겠습니까? (500P)`)) return;
    if (await usePoints(500, `아이콘 변경: ${emoji}`)) {
        await updateDoc(doc(db, "users", UserState.user.uid), { emoji: emoji });
        UserState.data.emoji = emoji;
        updateUI();
    }
}

async function changeNameColor(color) {
    if (!UserState.user || !color || UserState.data.nameColor === color) return;
    if (!confirm(`닉네임 색상을 변경하시겠습니까? (1,000P)`)) return;
    if (await usePoints(1000, `닉네임 색상 변경`)) {
        await updateDoc(doc(db, "users", UserState.user.uid), { nameColor: color });
        UserState.data.nameColor = color; 
        updateUI();
    }
}

async function changeNickname() {
    const input = document.getElementById('nickname-input');
    if (!UserState.user || !input?.value.trim()) return;
    const newName = input.value.trim();
    const cost = UserState.data.nicknameChanged ? 5000 : 0;
    if (!confirm(`닉네임을 [${newName}](으)로 변경하시겠습니까? (${cost}P)`)) return;
    try {
        if (cost === 0 || await usePoints(cost, `닉네임 변경`)) {
            await updateDoc(doc(db, "users", UserState.user.uid), { nickname: newName, nicknameChanged: true });
            UserState.data.nickname = newName; UserState.data.nicknameChanged = true;
            updateUI();
            alert("변경 완료!");
        }
    } catch (e) { alert("오류 발생"); }
}

export async function addPoints(amount, reason = "보상") {
    if (!UserState.user) return false;
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        const newPoints = (UserState.data.points || 0) + amount;
        await updateDoc(userRef, { points: newPoints });
        UserState.data.points = newPoints; updateUI();
        return true;
    } catch (e) { return false; }
}

export async function usePoints(amount, reason = "소모") {
    if (!UserState.user || UserState.data.points < amount) return false;
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        const newPoints = UserState.data.points - amount;
        await updateDoc(userRef, { points: newPoints });
        UserState.data.points = newPoints; updateUI();
        return true;
    } catch (e) { return false; }
}
