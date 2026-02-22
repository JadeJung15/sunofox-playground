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

// UI Elements
const loginBtn = document.getElementById('login-btn');
const userProfile = document.getElementById('user-profile');
const userNameEl = document.getElementById('user-name');
const userPointsEl = document.getElementById('user-points');
const logoutBtn = document.getElementById('logout-btn');
const nicknameInput = document.getElementById('nickname-input');
const nicknameSaveBtn = document.getElementById('nickname-save');
const nicknameMsg = document.getElementById('nickname-msg');

export function initAuth() {
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

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider).catch((error) => {
                console.error("Login failed:", error);
                alert("로그인에 실패했습니다.");
            });
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => signOut(auth));
    }

    if (nicknameSaveBtn) {
        nicknameSaveBtn.addEventListener('click', changeNickname);
    }
}

async function loadUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        UserState.data = snap.data();
    } else {
        // Initialize new user
        const newData = {
            nickname: user.displayName || '익명',
            points: 1000, // Welcome bonus
            items: [],
            lastNicknameChange: null,
            createdAt: serverTimestamp()
        };
        await setDoc(userRef, newData);
        UserState.data = newData;
    }
}

function updateUI(isLoggedIn) {
    if (isLoggedIn && UserState.data) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userNameEl.textContent = UserState.data.nickname;
        userPointsEl.textContent = `${UserState.data.points.toLocaleString()} P`;
        nicknameInput.value = UserState.data.nickname;
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
}

async function changeNickname() {
    if (!UserState.user || !nicknameInput.value.trim()) return;
    
    const newName = nicknameInput.value.trim();
    const now = Date.now();
    const lastChange = UserState.data.lastNicknameChange ? UserState.data.lastNicknameChange.toMillis() : 0;
    const cooldown = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (now - lastChange < cooldown) {
        const daysLeft = Math.ceil((lastChange + cooldown - now) / (24 * 60 * 60 * 1000));
        nicknameMsg.textContent = `닉네임은 30일에 한 번만 변경 가능합니다. (${daysLeft}일 남음)`;
        nicknameMsg.className = 'error-msg';
        return;
    }

    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, {
            nickname: newName,
            lastNicknameChange: serverTimestamp()
        });
        UserState.data.nickname = newName;
        // Update local timestamp roughly to prevent immediate retry without reload
        UserState.data.lastNicknameChange = { toMillis: () => Date.now() }; 
        
        userNameEl.textContent = newName;
        nicknameMsg.textContent = "닉네임이 변경되었습니다!";
        nicknameMsg.className = 'success-msg';
    } catch (e) {
        console.error(e);
        nicknameMsg.textContent = "오류가 발생했습니다.";
    }
}

export async function addPoints(amount) {
    if (!UserState.user) return false;
    const userRef = doc(db, "users", UserState.user.uid);
    await updateDoc(userRef, { points: increment(amount) });
    UserState.data.points += amount;
    userPointsEl.textContent = `${UserState.data.points.toLocaleString()} P`;
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
    userPointsEl.textContent = `${UserState.data.points.toLocaleString()} P`;
    return true;
}
