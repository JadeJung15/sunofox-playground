import { UserState, updateUI, setProfileStyle } from '../auth.js?v=8.5.6';
import { EMOJI_SHOP, COLOR_SHOP, AURA_SHOP, BORDER_SHOP, BACKGROUND_SHOP } from '../constants/shops.js';

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

function getCurrentStyleSummary() {
    const colorEntry = Object.entries(COLOR_SHOP).find(([, code]) => code === UserState.data?.nameColor);
    return {
        emoji: UserState.data?.emoji || '👤',
        color: colorEntry?.[0] || '기본',
        border: UserState.data?.activeBorder && UserState.data.activeBorder !== 'NONE' ? BORDER_SHOP[UserState.data.activeBorder]?.name || '선택됨' : '없음',
        background: UserState.data?.activeBackground && UserState.data.activeBackground !== 'NONE' ? BACKGROUND_SHOP[UserState.data.activeBackground]?.name || '선택됨' : '없음'
    };
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
                        <div class="profile-hero-kicker">Profile</div>
                        <h2>프로필</h2>
                        <p>닉네임과 스타일만 가볍게 관리할 수 있습니다.</p>
                        <button class="btn-primary profile-hero-login" onclick="document.getElementById('login-btn')?.click()">지금 로그인하기</button>
                    </section>

                    <div class="profile-guest-grid">
                        <div class="profile-ghost-card">
                            <strong>🎨 스타일</strong>
                            <span>아이콘과 프로필 외형 설정</span>
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

    const activeBorderClass = UserState.data.activeBorder !== 'NONE' ? BORDER_SHOP[UserState.data.activeBorder]?.class || '' : '';
    const activeBackgroundClass = UserState.data.activeBackground !== 'NONE' ? BACKGROUND_SHOP[UserState.data.activeBackground]?.class || '' : '';
    const activeAuraClass = UserState.data.activeAura !== 'NONE' ? AURA_SHOP[UserState.data.activeAura]?.class || '' : '';
    const styleSummary = getCurrentStyleSummary();

    app.innerHTML = `
        <div class="profile-page fade-in">
            <div class="profile-stage">
                <div id="profile-feedback" class="profile-inline-feedback" style="display:none;"></div>
                <section class="profile-hero-shell ${activeBackgroundClass}">
                    <div class="profile-hero-main">
                        <div class="profile-hero-kicker">It's simple</div>
                        <div class="profile-hero-avatar-row">
                            <div id="user-emoji" class="author-emoji-circle profile-hero-avatar ${activeBorderClass} ${activeAuraClass}">${styleSummary.emoji}</div>
                            <div class="profile-hero-copy">
                                <h2 id="user-name">닉네임</h2>
                                <p>${UserState.user.email || 'SevenCheck user'}</p>
                            </div>
                        </div>
                    </div>

                    <div class="profile-hero-side">
                        <div class="profile-summary-stack">
                            <div class="profile-quick-stat"><strong>${styleSummary.color}</strong><span>닉네임 색상</span></div>
                            <div class="profile-quick-stat"><strong>${styleSummary.border}</strong><span>테두리</span></div>
                            <div class="profile-quick-stat"><strong>${styleSummary.background}</strong><span>배경</span></div>
                        </div>
                    </div>
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
                                        <h4 style="font-size:0.9rem; margin-bottom:0.8rem; color:var(--accent-color);">🎨 닉네임 색상</h4>
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
                                        <h4 style="font-size:0.9rem; margin-bottom:0.8rem; color:var(--accent-secondary);">🖼️ 테두리</h4>
                                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                                            <button class="btn-equip-profile ${UserState.data.activeBorder === 'NONE' ? 'active' : ''}" data-type="Border" data-id="NONE" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--border-color); background:none;">해제</button>
                                            ${(UserState.data.unlockedBorders || []).filter(id => id !== 'NONE').map(id => `
                                                <button class="btn-equip-profile ${UserState.data.activeBorder === id ? 'active' : ''}" data-type="Border" data-id="${id}" style="padding:0.5rem 1rem; font-size:0.8rem; border-radius:8px; border:1px solid var(--accent-color); background:${UserState.data.activeBorder === id ? 'var(--accent-color)' : 'none'}; color:${UserState.data.activeBorder === id ? '#fff' : 'inherit'}">${BORDER_SHOP[id]?.name || id}</button>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style="font-size:0.9rem; margin-bottom:0.8rem; color:var(--accent-secondary);">🎨 배경</h4>
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
                            <summary>미리보기</summary>
                            <div class="content-area">
                                <div class="profile-mini-preview ${activeBackgroundClass}">
                                    <div class="author-emoji-circle profile-mini-avatar ${activeBorderClass} ${activeAuraClass}" style="color:${UserState.data.nameColor || 'var(--text-main)'}">${styleSummary.emoji}</div>
                                    <strong style="color:${UserState.data.nameColor || 'var(--text-main)'}">${UserState.data.nickname || '닉네임'}</strong>
                                    <span>${styleSummary.color} · ${styleSummary.border} · ${styleSummary.background}</span>
                                </div>
                            </div>
                        </details>

                        <details class="profile-details" open>
                            <summary>계정</summary>
                            <div class="content-area">
                                <div class="setting-group" style="background: var(--bg-color); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1rem;">
                                    <label style="display: block; font-size: 0.9rem; font-weight: 800; margin-bottom: 0.25rem;">닉네임 변경</label>
                                    <p style="font-size: 0.75rem; color: var(--text-sub); margin-bottom: 0.75rem;">지금 표시되는 이름을 원하는 닉네임으로 바꿀 수 있습니다.</p>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <input type="text" id="nickname-input" style="flex: 1; padding: 0.8rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.95rem;" placeholder="새 닉네임 (2~10자)">
                                        <button id="nickname-save" class="btn-primary" style="padding: 0 1.5rem; font-size: 0.9rem;">변경</button>
                                    </div>
                                    <p id="nickname-msg" style="margin-top: 0.75rem; font-size: 0.8rem; font-weight: 600;"></p>
                                </div>
                                <button id="logout-btn-top" class="btn-secondary" style="width: 100%; padding: 1rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.2); font-weight: 700;">로그아웃</button>
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
