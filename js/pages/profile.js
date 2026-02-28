import { UserState, getPetBuff, updateUI, updateProfileCache } from '../auth.js?v=8.4.0';
import { getGrade, getTier, TIERS, EMOJI_SHOP, COLOR_SHOP, AURA_SHOP, BORDER_SHOP, BACKGROUND_SHOP, PET_SHOP } from '../constants/shops.js';
import { db } from '../firebase-init.js?v=8.4.0';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { soundManager } from '../sound.js';

function getPetTheme(grade) {
    const themes = {
        NORMAL: {
            tone: '#22c55e',
            bg: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(255,255,255,0.96))',
            ring: 'rgba(34,197,94,0.26)',
            badge: 'rgba(34,197,94,0.14)'
        },
        RARE: {
            tone: '#3b82f6',
            bg: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(255,255,255,0.96))',
            ring: 'rgba(59,130,246,0.28)',
            badge: 'rgba(59,130,246,0.14)'
        },
        EPIC: {
            tone: '#a855f7',
            bg: 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(255,255,255,0.96))',
            ring: 'rgba(168,85,247,0.3)',
            badge: 'rgba(168,85,247,0.15)'
        },
        LEGENDARY: {
            tone: '#f59e0b',
            bg: 'linear-gradient(135deg, rgba(245,158,11,0.24), rgba(255,248,220,0.98))',
            ring: 'rgba(245,158,11,0.36)',
            badge: 'rgba(245,158,11,0.18)'
        }
    };
    return themes[grade] || themes.NORMAL;
}

function getTierTheme(tierClass) {
    const themes = {
        'tier-bronze': {
            bg: 'linear-gradient(135deg, #7c4a2d, #c08457)',
            glow: 'rgba(192,132,87,0.35)',
            border: 'rgba(146,90,52,0.45)',
            text: '#fff7ed'
        },
        'tier-silver': {
            bg: 'linear-gradient(135deg, #64748b, #cbd5e1)',
            glow: 'rgba(148,163,184,0.35)',
            border: 'rgba(100,116,139,0.35)',
            text: '#f8fafc'
        },
        'tier-gold': {
            bg: 'linear-gradient(135deg, #ca8a04, #facc15)',
            glow: 'rgba(250,204,21,0.35)',
            border: 'rgba(202,138,4,0.35)',
            text: '#422006'
        },
        'tier-platinum': {
            bg: 'linear-gradient(135deg, #0f766e, #5eead4)',
            glow: 'rgba(45,212,191,0.35)',
            border: 'rgba(13,148,136,0.35)',
            text: '#ecfeff'
        },
        'tier-diamond': {
            bg: 'linear-gradient(135deg, #2563eb, #93c5fd)',
            glow: 'rgba(96,165,250,0.35)',
            border: 'rgba(37,99,235,0.35)',
            text: '#eff6ff'
        },
        'tier-master': {
            bg: 'linear-gradient(135deg, #7c3aed, #f472b6)',
            glow: 'rgba(236,72,153,0.35)',
            border: 'rgba(147,51,234,0.35)',
            text: '#fff7fb'
        }
    };
    return themes[tierClass] || themes['tier-bronze'];
}

function showProfileToast(message, tone = 'var(--accent-color)') {
    const toast = document.createElement('div');
    toast.className = 'profile-floating-toast';
    toast.textContent = message;
    toast.style.borderColor = tone;
    toast.style.color = tone;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 240);
    }, 1500);
}

function showPetUnlockOverlay(info) {
    const theme = getPetTheme(info.grade);
    const overlay = document.createElement('div');
    overlay.className = 'pet-unlock-overlay';
    overlay.innerHTML = `
        <div class="pet-unlock-card" style="background: ${theme.bg}; border-color: ${theme.ring}; box-shadow: 0 24px 60px ${theme.ring};">
            <div class="pet-unlock-badge" style="background: ${theme.badge}; color: ${theme.tone}; border-color: ${theme.ring};">${info.grade}</div>
            <div class="pet-unlock-emoji" style="border-color: ${theme.ring}; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 16px 36px ${theme.ring};">${info.emoji}</div>
            <h3 style="color: ${theme.tone};">${info.name}</h3>
            <p>${info.effect}</p>
            <button type="button" class="pet-unlock-close" style="background: ${theme.tone};">같이 놀기 시작</button>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    overlay.querySelector('.pet-unlock-close')?.addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 220);
    });
}

export function renderProfile() {
    const app = document.getElementById('app');
    
    // 비로그인 상태 UI 처리
    if (!UserState.user) {
        app.innerHTML = `
            <div class="profile-page fade-in">
                <div class="profile-stage">
                    <section class="profile-guest-hero">
                        <div class="profile-guest-icon">👤</div>
                        <div class="profile-hero-kicker">PERSONAL HUB</div>
                        <h2>나만의 분석 프로필</h2>
                        <p>로그인하면 펫, 인벤토리, 오락실 기록, 꾸미기 상태까지 한 번에 관리할 수 있습니다.</p>
                        <button class="btn-primary profile-hero-login" onclick="document.getElementById('login-btn')?.click()">지금 로그인하기</button>
                    </section>

                    <div class="profile-guest-grid">
                        <div class="profile-ghost-card">
                            <strong>🎒 인벤토리</strong>
                            <span>수집한 아이템과 희귀도 확인</span>
                        </div>
                        <div class="profile-ghost-card">
                            <strong>🐾 펫 파트너</strong>
                            <span>장착 펫과 보너스 효과 관리</span>
                        </div>
                        <div class="profile-ghost-card">
                            <strong>📊 오락실 통계</strong>
                            <span>내 플레이 기록과 누적 활동량 보기</span>
                        </div>
                    </div>
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
    const petBuff = getPetBuff();
    const ownedPetCount = (UserState.data.unlockedPets || []).length;
    const activePetTheme = getPetTheme(activePet.grade);

    const activeBorderClass = UserState.data.activeBorder !== 'NONE' ? BORDER_SHOP[UserState.data.activeBorder]?.class || '' : '';
    const activeBackgroundClass = UserState.data.activeBackground !== 'NONE' ? BACKGROUND_SHOP[UserState.data.activeBackground]?.class || '' : '';
    const activeAuraClass = UserState.data.activeAura !== 'NONE' ? AURA_SHOP[UserState.data.activeAura]?.class || '' : '';
    const discoveredCount = (UserState.data.discoveredItems || []).length;
    const inventoryCount = inv.length;
    const totalPets = Object.keys(PET_SHOP).length;
    const progressTarget = nextTier.min || currentScore;
    const tierTheme = getTierTheme(tier.class);

    app.innerHTML = `
        <div class="profile-page fade-in">
            <div class="profile-stage">
                <div id="profile-feedback" class="profile-inline-feedback" style="display:none;"></div>
                <section class="profile-hero-shell ${activeBackgroundClass}">
                    <div class="profile-hero-main">
                        <div class="profile-hero-kicker">PLAYER PROFILE</div>
                        <div class="profile-hero-avatar-row">
                            <div id="user-emoji" class="author-emoji-circle profile-hero-avatar ${activeBorderClass} ${activeAuraClass}">👤</div>
                            <div class="profile-hero-copy">
                                <div class="tier-badge profile-tier-pill ${tier.class}" style="background:${tierTheme.bg}; border-color:${tierTheme.border}; color:${tierTheme.text}; box-shadow:0 14px 28px ${tierTheme.glow};">${tier.name}</div>
                                <h2 id="user-name">닉네임</h2>
                                <p>${UserState.data.points?.toLocaleString() || '0'}P 보유 · ${currentScore.toLocaleString()} 누적 점수 · 발견 아이템 ${discoveredCount}종</p>
                            </div>
                        </div>
                        <div class="profile-progress-panel">
                            <div class="profile-progress-copy">
                                <strong>등급 성장도</strong>
                                <span>${currentScore.toLocaleString()} / ${progressTarget.toLocaleString()}</span>
                            </div>
                            <div class="progress-track">
                                <div class="progress-fill" style="width: ${progress}%;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="profile-hero-side">
                        <div class="profile-partner-mini" style="background:${activePetTheme.bg}; border-color:${activePetTheme.ring}; box-shadow:0 18px 36px ${activePetTheme.ring};">
                            <div class="profile-partner-mini-top">
                                <span>MY PARTNER</span>
                                <strong style="color:${activePetTheme.tone};">${activePet.grade || 'NORMAL'}</strong>
                            </div>
                            <div class="profile-partner-mini-emoji">${activePet.emoji}</div>
                            <h3 style="color:${activePetTheme.tone};">${activePet.name}</h3>
                            <p>${activePet.effect}</p>
                        </div>
                        <div class="profile-summary-stack">
                            <div class="profile-quick-stat"><strong>${inventoryCount}</strong><span>보유 아이템</span></div>
                            <div class="profile-quick-stat"><strong>${ownedPetCount}/${totalPets}</strong><span>펫 컬렉션</span></div>
                            <div class="profile-quick-stat"><strong>${stats.checkin || 0}</strong><span>누적 출석</span></div>
                        </div>
                    </div>
                </section>

                <section class="profile-summary-grid">
                    <article class="profile-summary-card">
                        <small>POINTS</small>
                        <strong>${(UserState.data.points || 0).toLocaleString()}P</strong>
                        <span>꾸미기, 반응, 오락실에서 사용하는 현재 포인트</span>
                    </article>
                    <article class="profile-summary-card">
                        <small>INVENTORY</small>
                        <strong>${inventoryCount.toLocaleString()}</strong>
                        <span>수집한 전체 아이템 수량</span>
                    </article>
                    <article class="profile-summary-card">
                        <small>DISCOVERY</small>
                        <strong>${discoveredCount.toLocaleString()}</strong>
                        <span>처음 발견한 아이템 종류 수</span>
                    </article>
                    <article class="profile-summary-card">
                        <small>ARCADE</small>
                        <strong>${((stats.mining || 0) + (stats.gacha || 0) + (stats.alchemy || 0) + (stats.lottery || 0) + (stats.betting || 0) + (stats.checkin || 0)).toLocaleString()}</strong>
                        <span>오락실 총 활동 횟수</span>
                    </article>
                </section>

                <section class="profile-detail-grid">
                    <div class="profile-main-column">
                        <details class="profile-details" open>
                            <summary>🐾 나의 펫 파트너</summary>
                            <div class="content-area">
                                <div class="pet-active-hero" style="background: ${activePetTheme.bg}; border-color: ${activePetTheme.ring}; box-shadow: 0 16px 36px ${activePetTheme.ring};">
                                    <div class="pet-active-avatar" style="border-color: ${activePetTheme.ring}; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 24px ${activePetTheme.ring};">
                                        ${activePet.emoji}
                                    </div>
                                    <div style="flex: 1;">
                                        <div class="pet-grade-badge" style="background: ${activePetTheme.badge}; color: ${activePetTheme.tone}; border-color: ${activePetTheme.ring};">${activePet.grade || 'NORMAL'}</div>
                                        <h4 style="font-size: 1.2rem; font-weight: 900; color: ${activePetTheme.tone}; margin-bottom: 4px;">${activePet.name}</h4>
                                        <p style="font-size: 0.85rem; font-weight: 700; color: var(--text-sub);">${activePet.effect}</p>
                                        <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-sub); margin-top: 6px;">보유 펫 ${ownedPetCount} / ${totalPets}</p>
                                    </div>
                                </div>

                                <div class="profile-bonus-grid">
                                    <div class="profile-bonus-card">
                                        <div>채굴 보너스</div>
                                        <strong>+${petBuff.mineBonus}P</strong>
                                    </div>
                                    <div class="profile-bonus-card">
                                        <div>테스트 보너스</div>
                                        <strong>+${petBuff.testBonus}P</strong>
                                    </div>
                                    <div class="profile-bonus-card">
                                        <div>출석 보너스</div>
                                        <strong>+${petBuff.checkinBonus}P</strong>
                                    </div>
                                    <div class="profile-bonus-card">
                                        <div>전체 배수</div>
                                        <strong>x${petBuff.multiplier.toFixed(2)}</strong>
                                    </div>
                                </div>

                                <h4 class="profile-section-mini-title">🥚 펫 입양/보유 목록</h4>
                                <div class="profile-pet-grid">
                                    ${Object.entries(PET_SHOP).map(([id, info]) => {
                                        const isOwned = (UserState.data.unlockedPets || []).includes(id);
                                        const isActive = activePetId === id;
                                        const theme = getPetTheme(info.grade);
                                        return `
                                            <div class="pet-card ${isActive ? 'is-active' : ''}" style="background: ${theme.bg}; border-color: ${isActive ? theme.tone : theme.ring}; box-shadow: ${isActive ? `0 16px 32px ${theme.ring}` : '0 8px 20px rgba(15,23,42,0.05)'};">
                                                <div class="pet-grade-badge" style="background: ${theme.badge}; color: ${theme.tone}; border-color: ${theme.ring};">${info.grade}</div>
                                                <div class="pet-emoji-shell" style="border-color: ${theme.ring}; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 24px ${theme.ring};">${info.emoji}</div>
                                                <div style="font-weight: 900; font-size: 0.9rem; margin-bottom: 4px; color: ${theme.tone};">${info.name}</div>
                                                <div style="font-size: 0.65rem; color: var(--text-sub); margin-bottom: 12px; min-height: 2.6rem; display: flex; align-items: center; justify-content: center;">${info.effect}</div>
                                                ${isOwned ? `
                                                    <button class="btn-pet-equip" data-id="${id}" style="width: 100%; padding: 8px; border-radius: 10px; font-size: 0.75rem; border: 1px solid ${theme.tone}; background: ${isActive ? theme.tone : 'rgba(255,255,255,0.8)'}; color: ${isActive ? '#fff' : theme.tone}; font-weight: 900;">${isActive ? '함께하는 중' : '함께하기'}</button>
                                                ` : `
                                                    <button class="btn-pet-buy" data-id="${id}" style="width: 100%; padding: 8px; border-radius: 10px; font-size: 0.75rem; border: none; background: ${theme.tone}; color: #fff; font-weight: 900;">${info.price.toLocaleString()}P</button>
                                                `}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </details>

                        <details class="profile-details">
                            <summary>🎒 내 인벤토리</summary>
                            <div class="content-area"><div class="inventory-grid">${invHTML}</div></div>
                        </details>

                        <details class="profile-details">
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
                    </div>

                    <div class="profile-side-column">
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

                        <details class="profile-details">
                            <summary>📊 오락실 이용 통계</summary>
                            <div class="content-area">
                                <div class="profile-stats-grid">
                                    <div class="profile-stat-card"><small>⛏️ 채굴</small><strong>${stats.mining || 0}</strong></div>
                                    <div class="profile-stat-card"><small>📦 가챠</small><strong>${stats.gacha || 0}</strong></div>
                                    <div class="profile-stat-card"><small>⚗️ 연금술</small><strong>${stats.alchemy || 0}</strong></div>
                                    <div class="profile-stat-card"><small>🎫 복권</small><strong>${stats.lottery || 0}</strong></div>
                                    <div class="profile-stat-card"><small>🎲 베팅</small><strong>${stats.betting || 0}</strong></div>
                                    <div class="profile-stat-card"><small>📅 출석</small><strong>${stats.checkin || 0}</strong></div>
                                </div>
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
                </section>
            </div>
    `;

    const feedbackEl = document.getElementById('profile-feedback');
    const setProfileFeedback = (message, type = 'info') => {
        if (!feedbackEl) return;
        feedbackEl.textContent = message;
        feedbackEl.className = `profile-inline-feedback ${type}`;
        feedbackEl.style.display = message ? 'block' : 'none';
    };

    app.querySelectorAll('.btn-pet-equip').forEach(btn => {
        btn.onclick = async () => {
            const { id } = btn.dataset;
            const { changePet } = await import('../auth.js?v=8.4.0');
            if (await changePet(id)) {
                soundManager.playSuccess();
                renderProfile();
                showProfileToast(`${PET_SHOP[id]?.name || '펫'} 출전 완료`, getPetTheme(PET_SHOP[id]?.grade).tone);
            } else {
                setProfileFeedback("펫 변경 중 오류가 발생했습니다.", 'error');
            }
        };
    });

    app.querySelectorAll('.btn-pet-buy').forEach(btn => {
        btn.onclick = async () => {
            const { id } = btn.dataset;
            const info = PET_SHOP[id];
            const { usePoints, updateUI } = await import('../auth.js?v=8.4.0');

            if (btn.dataset.confirming !== 'true') {
                btn.dataset.confirming = 'true';
                btn.textContent = '한 번 더 누르면 입양';
                setProfileFeedback(`${info.name} 입양 확인: ${info.price.toLocaleString()}P 사용`, 'warning');
                setTimeout(() => {
                    const currentBtn = app.querySelector(`.btn-pet-buy[data-id="${id}"]`);
                    if (currentBtn && currentBtn.dataset.confirming === 'true') {
                        currentBtn.dataset.confirming = 'false';
                        currentBtn.textContent = `${info.price.toLocaleString()}P`;
                    }
                }, 2500);
                return;
            }

            if (await usePoints(info.price, `펫 ${info.name} 입양`)) {
                try {
                    const unlocked = [...(UserState.data.unlockedPets || []), id];
                    await updateDoc(doc(db, "users", UserState.user.uid), { 
                        unlockedPets: unlocked,
                        activePet: id 
                    });
                    UserState.data.unlockedPets = unlocked;
                    UserState.data.activePet = id;
                    soundManager.playSuccess();
                    renderProfile();
                    updateUI();
                    showPetUnlockOverlay(info);
                } catch (e) {
                    setProfileFeedback("입양 처리 중 오류가 발생했습니다.", 'error');
                }
            } else {
                setProfileFeedback("포인트가 부족합니다.", 'error');
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
                renderProfile();
                updateUI();
                showProfileToast("장착이 완료되었습니다!");
            } catch (e) {
                setProfileFeedback("업데이트 중 오류가 발생했습니다.", 'error');
            }
        };
    });

    // 닉네임 색상 변경 리스너 직접 등록
    app.querySelectorAll('.color-btn').forEach(btn => {
        btn.onclick = async () => {
            const color = btn.dataset.color;
            const { changeNameColor } = await import('../auth.js?v=8.4.0');
            await changeNameColor(color);
        };
    });

    // 아이콘 변경 리스너 직접 등록
    app.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.onclick = async () => {
            const emoji = btn.dataset.emoji;
            const { handleEmojiExchange } = await import('../auth.js?v=8.4.0');
            await handleEmojiExchange(emoji);
        };
    });

    // 닉네임 저장 리스너 직접 등록
    const nickSaveBtn = document.getElementById('nickname-save');
    if (nickSaveBtn) {
        nickSaveBtn.onclick = async () => {
            const { changeNickname } = await import('../auth.js?v=8.4.0');
            await changeNickname();
        };
    }

    // 로그아웃 리스너 직접 등록
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (logoutBtn.dataset.confirming !== 'true') {
                logoutBtn.dataset.confirming = 'true';
                logoutBtn.textContent = '한 번 더 누르면 로그아웃';
                setProfileFeedback("로그아웃하려면 버튼을 한 번 더 눌러주세요.", 'warning');
                setTimeout(() => {
                    const currentBtn = document.getElementById('logout-btn');
                    if (currentBtn && currentBtn.dataset.confirming === 'true') {
                        currentBtn.dataset.confirming = 'false';
                        currentBtn.textContent = '로그아웃';
                    }
                }, 2500);
                return;
            }

            const logoutBtnInAuth = document.createElement('button');
            logoutBtnInAuth.id = 'logout-btn';
            document.body.appendChild(logoutBtnInAuth);
            logoutBtnInAuth.click();
            logoutBtnInAuth.remove();
        };
    }

    updateUI();
}
