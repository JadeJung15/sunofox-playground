import { UserState, updateUI, updateProfileCache } from '../auth.js?v=8.2.0';
import { getGrade, getTier, TIERS, EMOJI_SHOP, COLOR_SHOP, AURA_SHOP, BORDER_SHOP, BACKGROUND_SHOP, PET_SHOP } from '../constants/shops.js';
import { db } from '../firebase-init.js?v=8.2.0';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export function renderProfile() {
    const app = document.getElementById('app');
    
    // 비로그인 상태 UI 처리
    if (!UserState.user) {
        app.innerHTML = `
            <div class="profile-page fade-in">
                <div class="card profile-header-card" style="padding: 4rem 1.5rem; text-align: center; overflow: hidden; position: relative;">
                    <div class="profile-accent-bg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, var(--accent-color), var(--accent-soft)); opacity: 0.05;"></div>
                    <div style="font-size: 5rem; margin-bottom: 1.5rem; position: relative; opacity: 0.3;">👤</div>
                    <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem; position: relative;">나만의 분석 프로필</h2>
                    <p class="text-sub" style="margin-bottom: 2rem; position: relative; font-weight: 600;">로그인하시면 수집한 아이템과<br>나의 등급을 확인할 수 있습니다.</p>
                    <button class="btn-primary" onclick="document.getElementById('login-btn')?.click()" style="padding: 1rem 3rem; border-radius: 50px; font-weight: 800; position: relative; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);">지금 로그인하기</button>
                </div>

                <div style="opacity: 0.4; pointer-events: none; filter: grayscale(1);">
                    <details class="profile-details" open>
                        <summary>🎒 내 인벤토리 (로그인 필요)</summary>
                        <div class="content-area"><p class="text-sub">수집한 아이템이 이곳에 표시됩니다.</p></div>
                    </details>
                    <details class="profile-details">
                        <summary>📊 오락실 이용 통계 (로그인 필요)</summary>
                    </details>
                </div>
            </div>
        `;
        return;
    }
    
    const inv = UserState.data.inventory || [];
    const groupedInv = inv.reduce((acc, item) => { acc[item] = (acc[item] || 0) + 1; return acc; }, {});
    const invHTML = Object.entries(groupedInv).map(([name, count]) => {
        const grade = getGrade(name);
        return `
            <div class="inv-card grade-${grade.toLowerCase()}">
                <span class="inv-grade-badge">${grade[0]}</span>
                <span class="inv-icon">${name.split(' ')[0]}</span>
                <span class="inv-name">${name.split(' ')[1] || ''}</span>
                <span class="inv-badge">${count}</span>
            </div>
        `;
    }).join('') || '<p class="text-sub">수집한 아이템이 없습니다.</p>';

    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);
    const stats = UserState.data.arcadeStats || { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 };

    const activePetId = UserState.data.activePet || 'NONE';
    const activePet = PET_SHOP[activePetId] || { emoji: '🐾', name: '없음', effect: '파트너를 등록해보세요.' };

    const activeBorderClass = UserState.data.activeBorder !== 'NONE' ? BORDER_SHOP[UserState.data.activeBorder]?.class || '' : '';
    const activeBackgroundClass = UserState.data.activeBackground !== 'NONE' ? BACKGROUND_SHOP[UserState.data.activeBackground]?.class || '' : '';
    const activeAuraClass = UserState.data.activeAura !== 'NONE' ? AURA_SHOP[UserState.data.activeAura]?.class || '' : '';

    app.innerHTML = `
        <div class="profile-page fade-in">
            <div class="card profile-header-card ${activeBackgroundClass}" style="padding: 2.5rem 1.5rem; text-align: center; overflow: hidden; position: relative;">
                <div class="profile-accent-bg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100px; background: linear-gradient(135deg, var(--accent-color), var(--accent-soft)); opacity: 0.1;"></div>
                
                <!-- 펫 파트너 노출 -->
                <div style="position: absolute; top: 20px; right: 20px; text-align: center;">
                    <div style="font-size: 2.5rem; animation: float 3s ease-in-out infinite;">${activePet.emoji}</div>
                    <div style="font-size: 0.6rem; font-weight: 900; background: rgba(0,0,0,0.5); color: #fff; padding: 2px 8px; border-radius: 4px; margin-top: 4px;">MY PARTNER</div>
                </div>

                <div id="user-emoji" class="author-emoji-circle ${activeBorderClass} ${activeAuraClass}" style="font-size: 5rem; margin: 0 auto 1rem; position: relative; display: flex; background: var(--card-bg); border-radius: 50%; width: 120px; height: 120px; align-items: center; justify-content: center; box-shadow: var(--shadow-md);">👤</div>
                <div class="tier-badge" style="background: var(--accent-color); color: #fff; display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem; position: relative;">${tier.name}</div>
                <h2 id="user-name" style="font-size: 2rem; font-weight: 800; margin-bottom: 1.5rem;">닉네임</h2>

                <div class="progress-container" style="max-width: 400px; margin: 0 auto 2rem; position:relative; z-index:1;">
                    <div class="progress-label" style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 800; margin-bottom: 0.5rem; background: rgba(0,0,0,0.4); color: #fff; padding: 4px 12px; border-radius: 50px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                        <span>등급 성장도</span>
                        <span>${currentScore.toLocaleString()} / ${nextTier.min.toLocaleString()}</span>
                    </div>
                    <div class="progress-track" style="height: 12px; background: rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
                        <div class="progress-fill" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--accent-color), var(--accent-soft)); border-radius: 10px; box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);"></div>
                    </div>
                </div>
            </div>

            <details class="profile-details" open>
                <summary>🐾 나의 펫 파트너</summary>
                <div class="content-area">
                    <div style="background: rgba(var(--accent-rgb), 0.05); padding: 1.5rem; border-radius: 20px; border: 1px solid var(--accent-soft); display: flex; align-items: center; gap: 20px; margin-bottom: 2rem;">
                        <div style="font-size: 3.5rem;">${activePet.emoji}</div>
                        <div>
                            <h4 style="font-size: 1.2rem; font-weight: 900; color: var(--accent-color); margin-bottom: 4px;">${activePet.name}</h4>
                            <p style="font-size: 0.85rem; font-weight: 700; color: var(--text-sub);">${activePet.effect}</p>
                        </div>
                    </div>

                    <h4 style="font-size:0.9rem; margin-bottom:1rem; color:var(--text-main); font-weight: 800;">🥚 펫 입양/보유 목록</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;">
                        ${Object.entries(PET_SHOP).map(([id, info]) => {
                            const isOwned = (UserState.data.unlockedPets || []).includes(id);
                            const isActive = activePetId === id;
                            return `
                                <div class="pet-card" style="background: #fff; padding: 1.2rem 1rem; border-radius: 16px; border: 2px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}; text-align: center; position: relative; transition: all 0.2s;">
                                    <div style="font-size: 2rem; margin-bottom: 10px;">${info.emoji}</div>
                                    <div style="font-weight: 800; font-size: 0.85rem; margin-bottom: 4px;">${info.name}</div>
                                    <div style="font-size: 0.65rem; color: var(--text-sub); margin-bottom: 12px; height: 2.4rem; display: flex; align-items: center; justify-content: center;">${info.effect}</div>
                                    ${isOwned ? `
                                        <button class="btn-pet-equip" data-id="${id}" style="width: 100%; padding: 6px; border-radius: 8px; font-size: 0.75rem; border: 1px solid var(--accent-color); background: ${isActive ? 'var(--accent-color)' : 'none'}; color: ${isActive ? '#fff' : 'var(--accent-color)'}; font-weight: 800;">${isActive ? '함께하는 중' : '함께하기'}</button>
                                    ` : `
                                        <button class="btn-pet-buy" data-id="${id}" style="width: 100%; padding: 6px; border-radius: 8px; font-size: 0.75rem; border: none; background: var(--text-main); color: #fff; font-weight: 800;">${info.price.toLocaleString()}P</button>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>🎨 내 꾸미기 관리</summary>
                <div class="content-area">
                    <div style="display: grid; gap: 1.5rem;">
                        <div>
                            <h4 style="font-size:0.9rem; margin-bottom:0.8rem; color:var(--accent-color);">🎨 닉네임 색상 변경 (1,000P)</h4>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                                ${Object.entries(COLOR_SHOP).map(([name, code]) => {
                                    const isDefault = name === '기본';
                                    const displayColor = isDefault ? 'var(--text-main)' : code;
                                    const isActive = UserState.data.nameColor === code;
                                    return `
                                        <button class="color-btn ${isActive ? 'active' : ''}" data-color="${code}"
                                                style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px;
                                                border:2px solid ${isActive ? displayColor : 'var(--border-color)'};
                                                background:${isActive ? displayColor : 'rgba(255,255,255,0.05)'};
                                                color:${isActive ? (isDefault ? 'var(--card-bg)' : '#fff') : displayColor};
                                                font-weight:800; transition:all 0.2s;">
                                            ${name}
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        <div>
                            <h4 style="font-size:0.9rem; margin-bottom:0.8rem; color:var(--accent-secondary);">🖼️ 보유한 테두리</h4>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                                <button class="btn-equip-profile ${UserState.data.activeBorder === 'NONE' ? 'active' : ''}" data-type="Border" data-id="NONE" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--border-color); background:none;">해제</button>
                                ${(UserState.data.unlockedBorders || []).filter(id => id !== 'NONE').map(id => `
                                    <button class="btn-equip-profile ${UserState.data.activeBorder === id ? 'active' : ''}" data-type="Border" data-id="${id}" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--accent-color); background:${UserState.data.activeBorder === id ? 'var(--accent-color)' : 'none'}; color:${UserState.data.activeBorder === id ? '#fff' : 'inherit'}">${BORDER_SHOP[id]?.name || id}</button>
                                `).join('')}
                            </div>
                        </div>
                        <div>
                            <h4 style="font-size:0.9rem; margin-bottom:0.8rem; color:var(--accent-secondary);">🎨 보유한 배경</h4>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                                <button class="btn-equip-profile ${UserState.data.activeBackground === 'NONE' ? 'active' : ''}" data-type="Background" data-id="NONE" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--border-color); background:none;">해제</button>
                                ${(UserState.data.unlockedBackgrounds || []).filter(id => id !== 'NONE').map(id => `
                                    <button class="btn-equip-profile ${UserState.data.activeBackground === id ? 'active' : ''}" data-type="Background" data-id="${id}" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--accent-color); background:${UserState.data.activeBackground === id ? 'var(--accent-color)' : 'none'}; color:${UserState.data.activeBackground === id ? '#fff' : 'inherit'}">${BACKGROUND_SHOP[id]?.name || id}</button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>📊 오락실 이용 통계</summary>
                <div class="content-area">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                        <div><small class="text-sub">⛏️ 채굴</small><p><strong>${stats.mining || 0}</strong></p></div>
                        <div><small class="text-sub">📦 가챠</small><p><strong>${stats.gacha || 0}</strong></p></div>
                        <div><small class="text-sub">⚗️ 연금술</small><p><strong>${stats.alchemy || 0}</strong></p></div>
                        <div><small class="text-sub">🎫 복권</small><p><strong>${stats.lottery || 0}</strong></p></div>
                        <div><small class="text-sub">🎲 베팅</small><p><strong>${stats.betting || 0}</strong></p></div>
                        <div><small class="text-sub">📅 출석</small><p><strong>${stats.checkin || 0}</strong></p></div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>🎒 내 인벤토리</summary>
                <div class="content-area"><div class="inventory-grid">${invHTML}</div></div>
            </details>

            <details class="profile-details" open>
                <summary>🏪 아이콘 상점 (변경 시 500P)</summary>
                <div class="content-area shop-wrapper">
                    ${Object.entries(EMOJI_SHOP).map(([cat, emojis]) => `
                        <h4 style="margin-top:1rem; font-size:0.9rem; color:var(--accent-color);">${cat}</h4>
                        <div class="emoji-grid" style="margin-top:0.8rem;">
                            ${Object.keys(emojis).map(e => `
                                <button class="emoji-btn ${UserState.data.emoji === e ? 'active' : ''}" data-emoji="${e}">
                                    <span class="e-icon">${e}</span>
                                    <span class="e-price">500P</span>
                                </button>`).join('')}
                        </div>
                    `).join('')}
                </div>
            </details>

            <details class="profile-details">
                <summary>⚙️ 계정 설정</summary>
                <div class="content-area">
                    <div class="setting-group" style="background: var(--bg-color); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.9rem; font-weight: 800; margin-bottom: 0.25rem;">닉네임 변경 ${UserState.data.nicknameChanged ? '(소모: 5,000P)' : '<span style="color:var(--accent-secondary);">(최초 1회 무료)</span>'}</label>
                        <p style="font-size: 0.75rem; color: var(--text-sub); margin-bottom: 0.75rem;">${UserState.data.nicknameChanged ? '닉네임 변경 시 포인트가 차감됩니다.' : '현재 랜덤 닉네임 상태입니다. 원하는 이름으로 변경해 보세요!'}</p>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="nickname-input" style="flex: 1; padding: 0.8rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.95rem;" placeholder="새 닉네임 (2~10자)">
                            <button id="nickname-save" class="btn-primary" style="padding: 0 1.5rem; font-size: 0.9rem;">변경</button>
                        </div>
                        <p id="nickname-msg" style="margin-top: 0.75rem; font-size: 0.8rem; font-weight: 600;"></p>
                    </div>
                    <button id="logout-btn" class="btn-secondary" style="width: 100%; padding: 1rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.2); font-weight: 700;">로그아웃</button>
                </div>
            </details>
        </div>
    `;

    app.querySelectorAll('.btn-pet-equip').forEach(btn => {
        btn.onclick = async () => {
            const { id } = btn.dataset;
            const { changePet } = await import('../auth.js?v=8.2.0');
            if (await changePet(id)) {
                alert("펫 파트너가 변경되었습니다! 🐾");
                renderProfile();
            } else {
                alert("변경 중 오류가 발생했습니다.");
            }
        };
    });

    app.querySelectorAll('.btn-pet-buy').forEach(btn => {
        btn.onclick = async () => {
            const { id } = btn.dataset;
            const info = PET_SHOP[id];
            const { usePoints, updateUI } = await import('../auth.js?v=8.2.0');
            
            if (confirm(`${info.name}을(를) 입양하시겠습니까?\n(${info.price.toLocaleString()}P 소모)`)) {
                if (await usePoints(info.price, `펫 ${info.name} 입양`)) {
                    try {
                        const unlocked = [...(UserState.data.unlockedPets || []), id];
                        await updateDoc(doc(db, "users", UserState.user.uid), { 
                            unlockedPets: unlocked,
                            activePet: id 
                        });
                        UserState.data.unlockedPets = unlocked;
                        UserState.data.activePet = id;
                        alert(`${info.name}이(가) 새로운 가족이 되었습니다! 🎉`);
                        renderProfile();
                        updateUI();
                    } catch (e) {
                        alert("입양 처리 중 오류가 발생했습니다.");
                    }
                } else {
                    alert("포인트가 부족합니다.");
                }
            }
        };
    });

    app.querySelectorAll('.btn-equip-profile').forEach(btn => {
        btn.onclick = async () => {
            const { type, id } = btn.dataset;
            const activeKey = `active${type}`;
            try {
                await updateDoc(doc(db, "users", UserState.user.uid), { [activeKey]: id });
                UserState.data[activeKey] = id;
                updateProfileCache(UserState.user.uid, { [activeKey]: id });
                alert("장착이 완료되었습니다!");
                renderProfile();
                updateUI();
            } catch (e) {
                alert("업데이트 중 오류가 발생했습니다.");
            }
        };
    });

    // 닉네임 색상 변경 리스너 직접 등록
    app.querySelectorAll('.color-btn').forEach(btn => {
        btn.onclick = async () => {
            const color = btn.dataset.color;
            const { changeNameColor } = await import('../auth.js?v=8.2.0');
            await changeNameColor(color);
        };
    });

    // 아이콘 변경 리스너 직접 등록
    app.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.onclick = async () => {
            const emoji = btn.dataset.emoji;
            const { handleEmojiExchange } = await import('../auth.js?v=8.2.0');
            await handleEmojiExchange(emoji);
        };
    });

    // 닉네임 저장 리스너 직접 등록
    const nickSaveBtn = document.getElementById('nickname-save');
    if (nickSaveBtn) {
        nickSaveBtn.onclick = async () => {
            const { changeNickname } = await import('../auth.js?v=8.2.0');
            await changeNickname();
        };
    }

    // 로그아웃 리스너 직접 등록
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            const logoutConfirm = confirm("로그아웃 하시겠습니까?");
            if (logoutConfirm) {
                const logoutBtnInAuth = document.createElement('button');
                logoutBtnInAuth.id = 'logout-btn';
                document.body.appendChild(logoutBtnInAuth);
                logoutBtnInAuth.click();
                logoutBtnInAuth.remove();
            }
        };
    }

    updateUI();
}
