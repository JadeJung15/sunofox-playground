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
    arrayUnion,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export const UserState = {
    user: null,
    data: null,
    isAdmin: false,
    isMaster: false
};

let authResolve;
export const authReady = new Promise(resolve => authResolve = resolve);

// 랜덤 닉네임 생성용 데이터
const ADJECTIVES = ['용감한', '신비로운', '행복한', '빛나는', '똑똑한', '우아한', '재빠른', '포근한', '화려한', '은은한', '날렵한', '든든한'];
const NOUNS = ['여우', '사자', '호랑이', '고양이', '팬더', '독수리', '돌고래', '토끼', '유니콘', '피닉스', '강아지', '늑대'];

function generateRandomNickname() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(1000 + Math.random() * 8999);
    return `${adj}${noun}_${num}`;
}

// 상점 데이터 정규화
export const EMOJI_SHOP = {
    '귀여운 동물': { '🐱': 200, '🐶': 200, '🦊': 300, '🐰': 300, '🐼': 500, '🐨': 500, '🐹': 400, '🐣': 400, '🐧': 500 },
    '강력한 야수': { '🐯': 800, '🦁': 800, '🐺': 1000, '🐲': 2500, '🦖': 2000, '🦈': 1500 },
    '자연 & 날씨': { '🌸': 300, '🌻': 300, '🍀': 400, '☀️': 500, '🌙': 500, '🌈': 1000, '🔥': 1000, '🌌': 2000 },
    '스페셜 프리미엄': { '✨': 3000, '👑': 5000, '💎': 10000, '⚡': 4000, '🧿': 5000 }
};

export const ITEM_VALUES = {
    // COMMON
    '💩 돌멩이': 1, '💊 물약': 30, '🌱 묘목': 50,
    // UNCOMMON (Min 300 > 5*50=250)
    '🥉 동메달': 300, '🥈 은메달': 500, '🌳 일반 나무': 400,
    // RARE (Min 3000 > 5*500=2500)
    '🥇 금메달': 3000, '🍀 행운의 클로버': 5000, '🌲 전나무': 4000, '🍎 사과나무': 4500,
    // LEGENDARY (Min 30000 > 5*5000=25000)
    '💎 다이아몬드': 30000, '🧪 현자의 돌': 60000, '🧬 인공 생명체': 100000, '⚡ 번개 병': 45000, '🌌 은하수 가루': 200000, '✨ 생명의 나무': 80000
};

export const ITEM_GRADES = {
    'COMMON': ['💩 돌멩이', '💊 물약', '🌱 묘목'],
    'UNCOMMON': ['🥉 동메달', '🥈 은메달', '🌳 일반 나무'],
    'RARE': ['🥇 금메달', '🍀 행운의 클로버', '🌲 전나무', '🍎 사과나무'],
    'LEGENDARY': ['💎 다이아몬드', '🧪 현자의 돌', '🧬 인공 생명체', '⚡ 번개 병', '🌌 은하수 가루', '✨ 생명의 나무']
};

export function getGrade(itemName) {
    for (const [grade, items] of Object.entries(ITEM_GRADES)) {
        if (items.includes(itemName)) return grade;
    }
    return 'COMMON';
}

export const TIERS = [
    { name: 'ROOKIE', min: 0, class: 'tier-rookie' },
    { name: 'BRONZE', min: 100000, class: 'tier-bronze' },
    { name: 'SILVER', min: 500000, class: 'tier-silver' },
    { name: 'GOLD', min: 1500000, class: 'tier-gold' },
    { name: 'PLATINUM', min: 5000000, class: 'tier-platinum' },
    { name: 'DIAMOND', min: 10000000, class: 'tier-diamond' }
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
        authResolve(); // 인증 상태 확인 완료 신호
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
            uid: user.uid, 
            nickname: generateRandomNickname(), 
            originalName: user.displayName || '알 수 없음',
            originalEmail: user.email || '이메일 없음', // 구글 이메일 저장
            emoji: '👤', unlockedEmojis: ['👤'], points: 1000,
            inventory: [], totalScore: 0, 
            discoveredItems: [],     // 획득했던 모든 아이템 기록 (도감용)
            unlockedAuras: ['NONE'], // 구매한 오라 목록
            activeAura: 'NONE',      // 현재 장착 중인 오라
            unlockedBorders: ['NONE'], // 구매한 테두리 목록
            activeBorder: 'NONE',      // 현재 장착 중인 테두리
            unlockedBackgrounds: ['NONE'], // 구매한 배경 목록
            activeBackground: 'NONE',      // 현재 장착 중인 배경
            nicknameChanged: false, 
            lastNicknameChange: null, 
            boosterCount: 0, nameColor: '#333333', unlockedColors: ['#333333'],
            arcadeStats: { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 },
            quests: { date: null, list: {} }, // 퀘스트 데이터 초기화
            createdAt: serverTimestamp()
        };
        await setDoc(userRef, newData);
        snap = await getDoc(userRef);
    }
    UserState.data = snap.data();
    
    // 기존 유저 데이터 복구: originalName 또는 originalEmail이 없는 경우 채워넣음
    let needsUpdate = false;
    const updateObj = {};
    
    if (!UserState.data.originalName && user.displayName) {
        updateObj.originalName = user.displayName;
        UserState.data.originalName = user.displayName;
        needsUpdate = true;
    }
    if (!UserState.data.originalEmail && user.email) {
        updateObj.originalEmail = user.email;
        UserState.data.originalEmail = user.email;
        needsUpdate = true;
    }
    // 퀘스트 필드 없는 경우 추가
    if (!UserState.data.quests) {
        updateObj.quests = { date: null, list: {} };
        UserState.data.quests = updateObj.quests;
        needsUpdate = true;
    }
    if (!UserState.data.unlockedAuras) {
        updateObj.unlockedAuras = ['NONE'];
        UserState.data.unlockedAuras = ['NONE'];
        updateObj.activeAura = 'NONE';
        UserState.data.activeAura = 'NONE';
        needsUpdate = true;
    }
    if (!UserState.data.unlockedBorders) {
        updateObj.unlockedBorders = ['NONE'];
        UserState.data.unlockedBorders = ['NONE'];
        updateObj.activeBorder = 'NONE';
        UserState.data.activeBorder = 'NONE';
        needsUpdate = true;
    }
    if (!UserState.data.unlockedBackgrounds) {
        updateObj.unlockedBackgrounds = ['NONE'];
        UserState.data.unlockedBackgrounds = ['NONE'];
        updateObj.activeBackground = 'NONE';
        UserState.data.activeBackground = 'NONE';
        needsUpdate = true;
    }
    
    if (needsUpdate) {
        await updateDoc(userRef, updateObj);
    }

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
            el.textContent = prefix + (UserState.data.nickname || '익명');
            el.style.color = UserState.data.nameColor || 'var(--text-main)';
        });
        document.querySelectorAll('#user-points').forEach(el => el.textContent = (UserState.data.points || 0).toLocaleString());
        document.querySelectorAll('#user-total-score').forEach(el => el.textContent = `${(UserState.data.totalScore || 0).toLocaleString()} 점`);
        document.querySelectorAll('#user-emoji').forEach(el => el.textContent = UserState.data.emoji || '👤');
        
        document.querySelectorAll('.tier-display').forEach(el => {
            el.innerHTML = `<span class="tier-badge ${tier.class}">${tier.name}</span>`;
        });

        // 푸터 관리자 링크 제어
        const footerAdmin = document.getElementById('footer-admin-link');
        if (footerAdmin) footerAdmin.classList.toggle('hidden', !UserState.isMaster);
        
        // 버전 정보는 모두에게 공개
        const siteVersion = document.getElementById('site-version');
        if (siteVersion) siteVersion.classList.remove('hidden');
    } else {
        document.getElementById('login-btn')?.classList.remove('hidden');
        document.getElementById('header-profile')?.classList.add('hidden');
        document.getElementById('footer-admin-link')?.classList.add('hidden');
        // 비로그인 상태에서도 버전과 통계는 보이도록 유지
        document.getElementById('site-version')?.classList.remove('hidden');
    }
}

async function addLog(uid, type, amount, reason) {
    try {
        await addDoc(collection(db, "pointLogs"), {
            uid, type, amount, reason, timestamp: serverTimestamp()
        });
    } catch (e) { console.error("Log failed", e); }
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
        const newScore = currentInv.reduce((acc, item) => acc + (ITEM_VALUES[item] || 0), 0);
        await updateDoc(userRef, {
            unlockedEmojis: arrayUnion(emoji),
            inventory: currentInv,
            totalScore: newScore,
            emoji: emoji
        });
        addLog(UserState.user.uid, 'score', -(UserState.data.totalScore - newScore), `이모지 교환: ${emoji}`);
        UserState.data.unlockedEmojis.push(emoji); UserState.data.inventory = currentInv; UserState.data.totalScore = newScore; UserState.data.emoji = emoji;
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
    if (await usePoints(2000, `닉네임 색상 변경: ${color}`)) {
        await updateDoc(doc(db, "users", UserState.user.uid), { unlockedColors: arrayUnion(color), nameColor: color });
        UserState.data.unlockedColors.push(color); UserState.data.nameColor = color; updateUI();
    }
}

async function changeNickname() {
    const input = document.getElementById('nickname-input');
    const msg = document.getElementById('nickname-msg');
    if (!UserState.user || !input?.value.trim()) return;
    
    const newName = input.value.trim();
    if (newName.length < 2 || newName.length > 10) return alert("닉네임은 2~10자 사이로 입력해주세요.");
    
    // 최초 1회 무료 혜택 체크
    const isFree = UserState.data.nicknameChanged === false;
    const cost = isFree ? 0 : 5000;
    
    if (cost > 0 && !confirm(`닉네임을 [${newName}](으)로 변경하시겠습니까?\n변경 시 ${cost.toLocaleString()}P가 소모됩니다.`)) return;
    if (isFree && !confirm(`첫 닉네임 설정을 [${newName}](으)로 하시겠습니까?\n(최초 1회 무료)`)) return;

    try {
        const updateData = { 
            nickname: newName, 
            nicknameChanged: true,
            lastNicknameChange: serverTimestamp() 
        };

        const performUpdate = async () => {
            await updateDoc(doc(db, "users", UserState.user.uid), updateData);
            UserState.data.nickname = newName;
            UserState.data.nicknameChanged = true;
            updateUI();
            if (msg) msg.textContent = "성공적으로 변경되었습니다!";
            input.value = '';
            if (window.location.hash === '#profile') window.dispatchEvent(new HashChangeEvent('hashchange'));
        };

        if (cost === 0) {
            await performUpdate();
        } else if (await usePoints(cost, `닉네임 변경: ${newName}`)) {
            await performUpdate();
        }
    } catch (e) { 
        console.error(e);
        alert("변경 중 오류가 발생했습니다.");
    }
}

export async function chargeUserPoints(targetUid, amount, reason = "관리자 권한으로 집행") {
    if (!UserState.isAdmin) return false;
    const finalUid = targetUid || UserState.user.uid;
    try {
        const userRef = doc(db, "users", finalUid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return false;
        
        const currentPoints = userSnap.data().points || 0;
        const newPoints = Math.max(0, currentPoints + amount); // 0 미만 방지
        
        await updateDoc(userRef, { points: newPoints });
        addLog(finalUid, 'points', amount, reason);
        if (finalUid === UserState.user.uid) { UserState.data.points = newPoints; updateUI(); }
        return true;
    } catch (e) { return false; }
}

export async function chargeUserScore(targetUid, amount, reason = "관리자 권한으로 집행") {
    if (!UserState.isAdmin) return false;
    const finalUid = targetUid || UserState.user.uid;
    try {
        const userRef = doc(db, "users", finalUid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return false;

        const currentScore = userSnap.data().totalScore || 0;
        const newScore = Math.max(0, currentScore + amount); // 0 미만 방지

        await updateDoc(userRef, { totalScore: newScore });
        addLog(finalUid, 'score', amount, reason);
        if (finalUid === UserState.user.uid) { UserState.data.totalScore = newScore; updateUI(); }
        return true;
    } catch (e) { return false; }
}

export async function addPoints(amount, reason = "테스트 완료 보상") {
    if (!UserState.user) return false;
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        const newPoints = Math.max(0, (UserState.data.points || 0) + amount); // 0 미만 방지
        await updateDoc(userRef, { points: newPoints });
        addLog(UserState.user.uid, 'points', amount, reason);
        UserState.data.points = newPoints; updateUI(); return true;
    } catch (e) { return false; }
}

export async function usePoints(amount, reason = "서비스 이용") {
    if (!UserState.user || UserState.data.points < amount) { alert("포인트 부족"); return false; }
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        const newPoints = Math.max(0, (UserState.data.points || 0) - amount); // 0 미만 방지
        await updateDoc(userRef, { points: newPoints });
        addLog(UserState.user.uid, 'points', -amount, reason);
        UserState.data.points = newPoints; updateUI(); return true;
    } catch (e) { return false; }
}
