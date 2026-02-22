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
            signInWithPopup(auth, provider).catch((error) => {
                console.error("Login failed:", error);
                alert("로그인에 실패했습니다.");
            });
        }
        if (e.target.id === 'logout-btn') {
            signOut(auth).then(() => { location.hash = '#home'; });
        }
        if (e.target.id === 'nickname-save') {
            await changeNickname();
        }
        if (e.target.classList.contains('emoji-btn')) {
            await changeEmoji(e.target.dataset.emoji);
        }
    });
}

async function loadUserData(user) {
    const userRef = doc(db, "users", user.uid);
    let snap = await getDoc(userRef);

    if (!snap.exists()) {
        const newData = {
            uid: user.uid,
            nickname: user.displayName || '익명',
            emoji: '👤',
            points: 1000,
            inventory: [],
            totalScore: 0,
            lastNicknameChange: null,
            createdAt: serverTimestamp()
        };
        await setDoc(userRef, newData);
        snap = await getDoc(userRef);
    } else {
        const data = snap.data();
        if (data.emoji === undefined) {
            await updateDoc(userRef, { emoji: '👤' });
            data.emoji = '👤';
        }
        UserState.data = data;
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
    const nicknameInput = document.getElementById('nickname-input');

    if (isLoggedIn && UserState.data) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        userNameEls.forEach(el => el.textContent = UserState.data.nickname);
        userPointsEls.forEach(el => el.textContent = `${(UserState.data.points || 0).toLocaleString()} P`);
        userScoreEls.forEach(el => el.textContent = `${(UserState.data.totalScore || 0).toLocaleString()} 점`);
        userEmojiEls.forEach(el => el.textContent = UserState.data.emoji || '👤');
        if (nicknameInput && !nicknameInput.value) nicknameInput.value = UserState.data.nickname;
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
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
        if (nicknameMsg) {
            nicknameMsg.textContent = `닉네임은 30일에 한 번만 변경 가능합니다. (${daysLeft}일 남음)`;
            nicknameMsg.className = 'error-msg';
        }
        return;
    }

    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { nickname: newName, lastNicknameChange: serverTimestamp() });
        UserState.data.nickname = newName;
        UserState.data.lastNicknameChange = now; 
        updateUI();
        if (nicknameMsg) {
            nicknameMsg.textContent = "닉네임이 성공적으로 변경되었습니다!";
            nicknameMsg.className = "success-msg";
        }
    } catch (e) {
        if (nicknameMsg) { nicknameMsg.textContent = "오류가 발생했습니다."; nicknameMsg.className = "error-msg"; }
    }
}

async function changeEmoji(newEmoji) {
    if (!UserState.user) return;
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { emoji: newEmoji });
        UserState.data.emoji = newEmoji;
        updateUI();
    } catch (e) {
        console.error("Emoji update failed:", e);
    }
}

export async function addPoints(amount) {
    if (!UserState.user) return false;
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { points: increment(amount) });
        UserState.data.points = (UserState.data.points || 0) + amount;
        updateUI();
        return true;
    } catch (e) { return false; }
}

export async function usePoints(amount) {
    if (!UserState.user || (UserState.data.points || 0) < amount) {
        alert("포인트가 부족합니다!");
        return false;
    }
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { points: increment(-amount) });
        UserState.data.points -= (UserState.data.points || 0) < amount ? 0 : amount;
        updateUI();
        return true;
    } catch (e) { return false; }
}
