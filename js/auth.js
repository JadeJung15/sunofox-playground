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

export function initAuth() {
    // Listen for auth state
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

    // Event Delegation for dynamic elements
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'login-btn') {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider).catch((error) => {
                console.error("Login failed:", error);
                alert("로그인에 실패했습니다.");
            });
        }

        if (e.target.id === 'logout-btn') {
            signOut(auth);
        }

        if (e.target.id === 'nickname-save') {
            await changeNickname();
        }
    });
}

async function loadUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        UserState.data = snap.data();
    } else {
        const newData = {
            nickname: user.displayName || '익명',
            points: 1000,
            items: [],
            lastNicknameChange: null,
            createdAt: serverTimestamp()
        };
        await setDoc(userRef, newData);
        UserState.data = newData;
    }
}

export function updateUI(isLoggedIn = !!UserState.user) {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userNameEl = document.getElementById('user-name');
    const userPointsEl = document.getElementById('user-points');
    const nicknameInput = document.getElementById('nickname-input');

    if (isLoggedIn && UserState.data) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        if (userNameEl) userNameEl.textContent = UserState.data.nickname;
        if (userPointsEl) userPointsEl.textContent = `${UserState.data.points.toLocaleString()} P`;
        if (nicknameInput) nicknameInput.value = UserState.data.nickname;
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
    }
}

async function changeNickname() {
    const nicknameInput = document.getElementById('nickname-input');
    const nicknameMsg = document.getElementById('nickname-msg');
    const userNameEl = document.getElementById('user-name');

    if (!UserState.user || !nicknameInput || !nicknameInput.value.trim()) return;
    
    const newName = nicknameInput.value.trim();
    const now = Date.now();
    const lastChange = UserState.data.lastNicknameChange ? UserState.data.lastNicknameChange.toMillis() : 0;
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
        await updateDoc(userRef, {
            nickname: newName,
            lastNicknameChange: serverTimestamp()
        });
        UserState.data.nickname = newName;
        UserState.data.lastNicknameChange = { toMillis: () => Date.now() }; 
        
        if (userNameEl) userNameEl.textContent = newName;
        if (nicknameMsg) {
            nicknameMsg.textContent = "닉네임이 변경되었습니다!";
            nicknameMsg.className = 'success-msg';
        }
    } catch (e) {
        console.error(e);
        if (nicknameMsg) nicknameMsg.textContent = "오류가 발생했습니다.";
    }
}

export async function addPoints(amount) {
    if (!UserState.user) return false;
    const userRef = doc(db, "users", UserState.user.uid);
    await updateDoc(userRef, { points: increment(amount) });
    UserState.data.points += amount;
    updateUI();
    return true;
}

export async function usePoints(amount) {
    if (!UserState.user || UserState.data.points < amount) {
        alert("포인트가 부족합니다!");
        return false;
    }
    const userRef = doc(db, "users", UserState.user.uid);
    await updateDoc(userRef, { points: increment(-amount) });
    UserState.data.points -= amount;
    updateUI();
    return true;
}
