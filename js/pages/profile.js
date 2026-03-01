import { UserState, updateUI, setProfileStyle } from '../auth.js?v=8.5.4';
import { getTier, TIERS, EMOJI_SHOP, COLOR_SHOP, AURA_SHOP, BORDER_SHOP, BACKGROUND_SHOP } from '../constants/shops.js';

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
                        <p>로그인하면 닉네임, 프로필 스타일, 계정 설정을 한 화면에서 빠르게 관리할 수 있습니다.</p>
                        <button class="btn-primary profile-hero-login" onclick="document.getElementById('login-btn')?.click()">지금 로그인하기</button>
                    </section>

                    <div class="profile-guest-grid">
                        <div class="profile-ghost-card">
                            <strong>🎨 스타일</strong>
                            <span>닉네임 색상과 프로필 외형 관리</span>
                        </div>
                        <div class="profile-ghost-card">
                            <strong>👤 닉네임</strong>
                            <span>원하는 이름으로 바로 변경</span>
                        </div>
                        <div class="profile-ghost-card">
                            <strong>⚙️ 계정</strong>
                            <span>로그인 상태와 기본 설정 관리</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);
    const activeBorderClass = UserState.data.activeBorder !== 'NONE' ? BORDER_SHOP[UserState.data.activeBorder]?.class || '' : '';
    const activeBackgroundClass = UserState.data.activeBackground !== 'NONE' ? BACKGROUND_SHOP[UserState.data.activeBackground]?.class || '' : '';
    const activeAuraClass = UserState.data.activeAura !== 'NONE' ? AURA_SHOP[UserState.data.activeAura]?.class || '' : '';
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
                                <p>${UserState.data.points?.toLocaleString() || '0'}P 보유 · ${currentScore.toLocaleString()} 누적 점수</p>
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
                        <div class="profile-summary-stack">
                            <div class="profile-quick-stat"><strong>${(UserState.data.points || 0).toLocaleString()}P</strong><span>현재 포인트</span></div>
                            <div class="profile-quick-stat"><strong>${currentScore.toLocaleString()}</strong><span>누적 점수</span></div>
                            <div class="profile-quick-stat"><strong>${tier.name}</strong><span>현재 티어</span></div>
                        </div>
                    </div>
                </section>

                <section class="profile-summary-grid">
                    <article class="profile-summary-card">
                        <small>POINTS</small>
                        <strong>${(UserState.data.points || 0).toLocaleString()}P</strong>
                        <span>현재 사용할 수 있는 포인트</span>
                    </article>
                    <article class="profile-summary-card">
                        <small>TIER</small>
                        <strong>${tier.name}</strong>
                        <span>현재 도달한 티어</span>
                    </article>
                    <article class="profile-summary-card">
                        <small>PROGRESS</small>
                        <strong>${progress}%</strong>
                        <span>다음 티어까지 진행률</span>
                    </article>
                    <article class="profile-summary-card">
                        <small>STYLE</small>
                        <strong>${UserState.data.nameColor ? 'Active' : 'Default'}</strong>
                        <span>닉네임/프로필 스타일 관리</span>
                    </article>
                </section>

                <section class="profile-detail-grid">
                    <div class="profile-main-column">
                        <details class="profile-details" open>
                            <summary>🎨 프로필 스타일</summary>
                            <div class="content-area">
                                <div style="display: grid; gap: 1.5rem;">
                                    <div>
                                        <h4 style="font-size:0.9rem; margin-bottom:0.8rem; color:var(--accent-color);">🏪 아이콘 변경</h4>
                                        <div class="emoji-grid" style="margin-top:0.8rem;">
                                            ${Object.entries(EMOJI_SHOP).flatMap(([, emojis]) => Object.keys(emojis).map(e => `
                                                <button class="emoji-btn ${UserState.data.emoji === e ? 'active' : ''}" data-emoji="${e}">
                                                    <span class="e-icon">${e}</span>
                                                    <span class="e-price">${Number(emojis[e] || 0).toLocaleString()}P</span>
                                                </button>`)).join('')}
                                        </div>
                                    </div>

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
                    </div>

                    <div class="profile-side-column">
                        <details class="profile-details" open>
                            <summary>⚙️ 빠른 설정</summary>
                            <div class="content-area">
                                <p style="font-size:0.9rem; color:var(--text-sub); line-height:1.7; margin-bottom:1rem;">계정과 닉네임만 가장 빠르게 관리할 수 있도록 핵심 설정만 남겼습니다.</p>
                                <button id="logout-btn-top" class="btn-secondary" style="width: 100%; padding: 1rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.2); font-weight: 700;">로그아웃</button>
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

    app.querySelectorAll('.btn-equip-profile').forEach(btn => {
        btn.onclick = async () => {
            const { type, id } = btn.dataset;
            try {
                await setProfileStyle(type, id);
                renderProfile();
                updateUI();
                showProfileToast("장착이 완료되었습니다!");
            } catch (e) {
                setProfileFeedback(e.message || "업데이트 중 오류가 발생했습니다.", 'error');
            }
        };
    });

    // 로그아웃 리스너 직접 등록
    const logoutButtons = [document.getElementById('logout-btn'), document.getElementById('logout-btn-top')].filter(Boolean);
    logoutButtons.forEach((logoutBtn) => {
        logoutBtn.onclick = () => {
            const defaultLabel = logoutBtn.id === 'logout-btn-top' ? '로그아웃' : '로그아웃';
            if (logoutBtn.dataset.confirming !== 'true') {
                logoutBtn.dataset.confirming = 'true';
                logoutBtn.textContent = '한 번 더 누르면 로그아웃';
                setProfileFeedback("로그아웃하려면 버튼을 한 번 더 눌러주세요.", 'warning');
                setTimeout(() => {
                    if (logoutBtn && logoutBtn.dataset.confirming === 'true') {
                        logoutBtn.dataset.confirming = 'false';
                        logoutBtn.textContent = defaultLabel;
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
    });

    updateUI();
}
