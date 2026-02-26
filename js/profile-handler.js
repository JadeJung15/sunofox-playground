import { db } from './firebase-init.js';
import { UserState, updateUI, TIERS, getTier, getGrade, COLOR_SHOP, chargeUserPoints, chargeUserScore, updateProfileCache, EMOJI_SHOP } from './auth.js';
import { BORDER_SHOP, BACKGROUND_SHOP, AURA_SHOP } from './board.js';
import { doc, updateDoc, getDocs, collection, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const app = document.getElementById('app');

export function renderProfile() {
    if (!UserState.user) {
        app.innerHTML = `<div class="card" style="text-align:center; padding:4rem;">👤<h2>로그인이 필요합니다</h2></div>`;
        return;
    }
    const inv = UserState.data.inventory || [];
    const groupedInv = inv.reduce((acc, item) => { acc[item] = (acc[item] || 0) + 1; return acc; }, {});
    const invHTML = Object.entries(groupedInv).map(([name, count]) => {
        const grade = getGrade(name);
        return `<div class="inv-card grade-${grade.toLowerCase()}"><span class="inv-grade-badge">${grade[0]}</span><span class="inv-icon">${name.split(' ')[0]}</span><span class="inv-name">${name.split(' ')[1] || ''}</span><span class="inv-badge">${count}</span></div>`;
    }).join('') || '<p class="text-sub">수집한 아이템이 없습니다.</p>';

    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);

    const activeBorderClass = UserState.data.activeBorder !== 'NONE' ? BORDER_SHOP[UserState.data.activeBorder]?.class || '' : '';
    const activeBackgroundClass = UserState.data.activeBackground !== 'NONE' ? BACKGROUND_SHOP[UserState.data.activeBackground]?.class || '' : '';
    const activeAuraClass = UserState.data.activeAura !== 'NONE' ? AURA_SHOP[UserState.data.activeAura]?.class || '' : '';

    app.innerHTML = `
        <div class="profile-page fade-in">
            <div class="card profile-header-card ${activeBackgroundClass}" style="text-align: center; padding: 2.5rem 1.5rem; position: relative; overflow:hidden;">
                <div id="user-emoji" class="author-emoji-circle ${activeBorderClass} ${activeAuraClass}" style="font-size: 5rem; margin: 0 auto 1.5rem; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; background: var(--card-bg); border-radius: 50%; box-shadow: var(--shadow-md);">👤</div>
                <div class="tier-badge" style="background: var(--accent-color); color: #fff; display: inline-block; padding: 4px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 800;">${tier.name}</div>
                <h2 style="font-size: 2rem; font-weight: 800; margin-top: 1rem;">닉네임</h2>
                <div class="progress-container" style="max-width: 400px; margin: 2rem auto 0;">
                    <div class="progress-label" style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 800; margin-bottom: 0.6rem; background: rgba(0,0,0,0.4); color: #fff; padding: 4px 12px; border-radius: 50px;">
                        <span>등급 성장도</span><span>${currentScore.toLocaleString()} / ${nextTier.min.toLocaleString()}</span>
                    </div>
                    <div class="progress-track" style="height: 12px; background: rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;"><div class="progress-fill" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--accent-color), var(--accent-soft));"></div></div>
                </div>
            </div>
            <details class="profile-details" open><summary>🎨 내 꾸미기 관리</summary><div class="content-area">
                <h4 style="font-size:0.9rem; margin-bottom:1rem; color:var(--accent-color);">🎨 닉네임 색상 변경 (1,000P)</h4>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    ${Object.entries(COLOR_SHOP).map(([name, code]) => `<button class="color-btn ${UserState.data.nameColor === code ? 'active' : ''}" data-color="${code}" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:2px solid ${code}; background:${UserState.data.nameColor === code ? code : 'none'}; color:${UserState.data.nameColor === code ? '#fff' : code}; font-weight:800;">${name}</button>`).join('')}
                </div>
                <h4 style="font-size:0.9rem; margin:1.5rem 0 1rem; color:var(--accent-secondary);">🖼️ 보유한 장착 아이템</h4>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <button class="btn-equip-profile ${UserState.data.activeBorder === 'NONE' ? 'active' : ''}" data-type="Border" data-id="NONE">해제</button>
                    ${(UserState.data.unlockedBorders || []).filter(id => id !== 'NONE').map(id => `<button class="btn-equip-profile ${UserState.data.activeBorder === id ? 'active' : ''}" data-type="Border" data-id="${id}">${BORDER_SHOP[id]?.name || id}</button>`).join('')}
                </div>
            </div></details>
            <details class="profile-details" open><summary>🎒 내 인벤토리</summary><div class="content-area"><div class="inventory-grid">${invHTML}</div></div></details>
            <details class="profile-details"><summary>⚙️ 계정 설정</summary><div class="content-area"><button id="logout-btn" class="btn-secondary" style="width: 100%; padding: 1rem; color: #ef4444; font-weight: 700;">로그아웃</button></div></details>
        </div>
    `;

    app.querySelectorAll('.btn-equip-profile').forEach(btn => {
        btn.onclick = async () => {
            const { type, id } = btn.dataset;
            const activeKey = `active${type}`;
            await updateDoc(doc(db, "users", UserState.user.uid), { [activeKey]: id });
            UserState.data[activeKey] = id;
            updateProfileCache(UserState.user.uid, { [activeKey]: id });
            renderProfile(); updateUI();
        };
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.onclick = () => { if(confirm("로그아웃 하시겠습니까?")) { UserState.user = null; location.hash = '#home'; location.reload(); } };
    updateUI();
}

export function renderAdmin() {
    if (!UserState.isMaster) { location.hash = '#home'; return; }
    app.innerHTML = `<div class="admin-page fade-in"><div class="card admin-header" style="background: linear-gradient(135deg, var(--accent-color), #4f46e5); color:#fff; padding:3rem 1.5rem; text-align:center; border-radius: var(--radius-lg);">🛡️ MASTER CONSOLE</div><div class="card" style="margin-top:2rem;"><h3>💰 실시간 자산 집행</h3><div style="display: grid; gap: 1rem; margin-top:1.5rem;"><input type="text" id="admin-target-uid" placeholder="대상 UID"><input type="number" id="admin-amount" placeholder="수량"><button id="admin-charge-points-btn" class="btn-primary">포인트 지급</button></div></div></div>`;
    document.getElementById('admin-charge-points-btn').onclick = async () => {
        const uid = document.getElementById('admin-target-uid').value.trim();
        const amount = parseInt(document.getElementById('admin-amount').value);
        if (await chargeUserPoints(uid, amount)) alert("지급 완료");
    };
}
