import { UserState, getPetBuff, updateUI, adoptPet, setProfileStyle } from '../auth.js?v=8.5.11';
import { getGrade, getTier, TIERS, EMOJI_SHOP, COLOR_SHOP, AURA_SHOP, BORDER_SHOP, BACKGROUND_SHOP, PET_SHOP } from '../constants/shops.js';
import { soundManager } from '../sound.js?v=8.5.11';
import { renderBadge, renderButton, renderChip, renderEmptyState, renderSectionHeader, renderStatCard } from '../ui/components.js?v=8.5.11';

function getPetTheme(grade) {
    const themes = {
        NORMAL: { tone: 'var(--accent1)', ring: 'var(--border2)', panel: 'var(--panel2)' },
        RARE: { tone: 'var(--accent2)', ring: 'var(--border2)', panel: 'var(--panel2)' },
        EPIC: { tone: 'var(--accent3)', ring: 'var(--border2)', panel: 'var(--panel2)' },
        LEGENDARY: { tone: 'var(--text)', ring: 'var(--border2)', panel: 'var(--panel)' }
    };
    return themes[grade] || themes.NORMAL;
}

function getTierTheme(tierClass) {
    const themes = {
        'tier-bronze': { tone: 'var(--text)', bg: 'var(--panel2)' },
        'tier-silver': { tone: 'var(--accent2)', bg: 'var(--panel2)' },
        'tier-gold': { tone: 'var(--accent1)', bg: 'var(--panel2)' },
        'tier-platinum': { tone: 'var(--accent3)', bg: 'var(--panel2)' },
        'tier-diamond': { tone: 'var(--accent2)', bg: 'var(--panel2)' },
        'tier-master': { tone: 'var(--accent3)', bg: 'var(--panel2)' }
    };
    return themes[tierClass] || themes['tier-bronze'];
}

function showProfileToast(message, tone = 'var(--accent1)') {
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
        <div class="pet-unlock-card" style="background:${theme.panel}; border-color:${theme.ring};">
            <div class="pet-unlock-badge" style="background:${theme.panel}; color:${theme.tone}; border-color:${theme.ring};">${info.grade}</div>
            <div class="pet-unlock-emoji" style="border-color:${theme.ring};">${info.emoji}</div>
            <h3 style="color:${theme.tone};">${info.name}</h3>
            <p>${info.effect}</p>
            <button type="button" class="pet-unlock-close" style="background:${theme.tone};">같이 놀기 시작</button>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    overlay.querySelector('.pet-unlock-close')?.addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 220);
    });
}

function renderChoiceButton({ label, isActive, className, attrs = '', tone = 'var(--accent1)' }) {
    return `
        <button class="${className} ui-choice-button ${isActive ? 'active' : ''}" ${attrs}
            style="--choice-tone:${tone}; --choice-bg:${isActive ? tone : 'var(--panel)'}; --choice-text:${isActive ? '#fff' : tone};">
            ${label}
        </button>
    `;
}

function renderInventory(groupedInv) {
    const items = Object.entries(groupedInv);
    if (!items.length) {
        return renderEmptyState({ title: '수집한 아이템이 없습니다.', description: '오락실과 테스트 결과에서 아이템을 모아보세요.' });
    }

    return `
        <div class="inventory-grid">
            ${items.map(([name, count]) => {
                const grade = getGrade(name);
                return `
                    <div class="inv-card grade-${grade.toLowerCase()}">
                        <span class="inv-grade-badge">${grade[0]}</span>
                        <span class="inv-icon">${name.split(' ')[0]}</span>
                        <span class="inv-name">${name.split(' ')[1] || ''}</span>
                        <span class="inv-badge">${count}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderPetCollection(activePetId) {
    return `
        <div class="profile-pet-grid">
            ${Object.entries(PET_SHOP).map(([id, info]) => {
                const isOwned = (UserState.data.unlockedPets || []).includes(id);
                const isActive = activePetId === id;
                const theme = getPetTheme(info.grade);
                return `
                    <article class="ui-card pet-card ${isActive ? 'is-active' : ''}" style="--card-accent:${theme.tone}; --card-accent-alt:${theme.tone}; border-color:${isActive ? theme.tone : theme.ring};">
                        <div class="ui-card-head">
                            ${renderBadge(info.grade, 'soft')}
                            <span class="pet-emoji-shell" style="border-color:${theme.ring};">${info.emoji}</span>
                        </div>
                        <div class="ui-stack ui-stack--xs">
                            <strong>${info.name}</strong>
                            <p class="ui-card-copy">${info.effect}</p>
                        </div>
                        ${isOwned
                            ? renderButton({ label: isActive ? '함께하는 중' : '함께하기', variant: isActive ? 'primary' : 'ghost', className: 'btn-pet-equip', attrs: `data-id="${id}"` })
                            : renderButton({ label: `${info.price.toLocaleString()}P`, variant: 'primary', className: 'btn-pet-buy', attrs: `data-id="${id}"` })
                        }
                    </article>
                `;
            }).join('')}
        </div>
    `;
}

function renderStatGrid(stats) {
    return `
        <div class="profile-stats-grid">
            ${[
                ['⛏️ 채굴', stats.mining || 0],
                ['📦 가챠', stats.gacha || 0],
                ['⚗️ 연금술', stats.alchemy || 0],
                ['🎫 복권', stats.lottery || 0],
                ['🎲 베팅', stats.betting || 0],
                ['📅 출석', stats.checkin || 0]
            ].map(([label, value]) => `
                <article class="ui-stat-card">
                    <small>${label}</small>
                    <strong>${value}</strong>
                </article>
            `).join('')}
        </div>
    `;
}

function renderEquipSection({ title, type, activeValue, items }) {
    return `
        <div class="ui-stack ui-stack--sm">
            <h4 class="profile-section-mini-title">${title}</h4>
            <div class="profile-choice-wrap">
                ${renderChoiceButton({
                    label: '해제',
                    isActive: activeValue === 'NONE',
                    className: 'btn-equip-profile',
                    attrs: `data-type="${type}" data-id="NONE"`,
                    tone: 'var(--text)'
                })}
                ${items.map((id) => renderChoiceButton({
                    label: type === 'Border' ? (BORDER_SHOP[id]?.name || id) : (BACKGROUND_SHOP[id]?.name || id),
                    isActive: activeValue === id,
                    className: 'btn-equip-profile',
                    attrs: `data-type="${type}" data-id="${id}"`,
                    tone: 'var(--accent1)'
                })).join('')}
            </div>
        </div>
    `;
}

export function renderProfile() {
    const app = document.getElementById('app');

    if (!UserState.user) {
        app.innerHTML = `
            <div class="page-shell fade-in">
                <section class="ui-section">
                    <div class="ui-hero ui-hero--compact">
                        <div class="ui-stack ui-stack--md">
                            ${renderBadge('PERSONAL HUB', 'soft')}
                            <h1>로그인 후 프로필과 수집 상태를 한 번에 관리합니다.</h1>
                            <p class="ui-hero-copy">펫, 인벤토리, 꾸미기, 오락실 기록까지 같은 구조 안에서 정리해 보여줍니다.</p>
                            ${renderButton({ label: '지금 로그인하기', variant: 'primary', className: 'profile-hero-login', attrs: `onclick="document.getElementById('login-btn')?.click()"` })}
                        </div>
                        <div class="ui-grid ui-grid--3">
                            ${[
                                { label: '인벤토리', value: '아이템', caption: '수집 상태 확인' },
                                { label: '펫 파트너', value: '파트너', caption: '보너스와 장착 관리' },
                                { label: '오락실', value: '기록', caption: '누적 활동 보기' }
                            ].map((item) => renderStatCard(item)).join('')}
                        </div>
                    </div>
                </section>
            </div>
        `;
        return;
    }

    const inv = UserState.data.inventory || [];
    const groupedInv = inv.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});

    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);
    const progressTarget = nextTier.min || currentScore;
    const stats = UserState.data.arcadeStats || { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 };
    const activePetId = UserState.data.activePet || 'NONE';
    const activePet = PET_SHOP[activePetId] || { emoji: '🐾', name: '없음', effect: '파트너를 등록해보세요.' };
    const petBuff = getPetBuff();
    const ownedPetCount = (UserState.data.unlockedPets || []).length;
    const totalPets = Object.keys(PET_SHOP).length;
    const discoveredCount = (UserState.data.discoveredItems || []).length;
    const inventoryCount = inv.length;
    const activePetTheme = getPetTheme(activePet.grade);
    const tierTheme = getTierTheme(tier.class);
    const activeBorderClass = UserState.data.activeBorder !== 'NONE' ? BORDER_SHOP[UserState.data.activeBorder]?.class || '' : '';
    const activeBackgroundClass = UserState.data.activeBackground !== 'NONE' ? BACKGROUND_SHOP[UserState.data.activeBackground]?.class || '' : '';
    const activeAuraClass = UserState.data.activeAura !== 'NONE' ? AURA_SHOP[UserState.data.activeAura]?.class || '' : '';

    app.innerHTML = `
        <div class="page-shell fade-in">
            <section class="ui-section">
                <div id="profile-feedback" class="profile-inline-feedback" style="display:none;"></div>
                <div class="ui-card profile-hero-shell ${activeBackgroundClass}">
                    <div class="profile-hero-main">
                        <div class="ui-stack ui-stack--sm">
                            ${renderBadge('PLAYER PROFILE', 'soft')}
                            <div class="profile-hero-avatar-row">
                                <div id="user-emoji" class="author-emoji-circle profile-hero-avatar ${activeBorderClass} ${activeAuraClass}">👤</div>
                                <div class="ui-stack ui-stack--xs">
                                    <div class="tier-badge profile-tier-pill ${tier.class}" style="background:${tierTheme.bg}; color:${tierTheme.tone};">${tier.name}</div>
                                    <h2 id="user-name">닉네임</h2>
                                    <p class="ui-card-copy">${(UserState.data.points || 0).toLocaleString()}P 보유 · ${currentScore.toLocaleString()} 누적 점수 · 발견 아이템 ${discoveredCount}종</p>
                                </div>
                            </div>
                        </div>
                        <div class="profile-progress-panel">
                            <div class="profile-progress-copy">
                                <strong>등급 성장도</strong>
                                <span>${currentScore.toLocaleString()} / ${progressTarget.toLocaleString()}</span>
                            </div>
                            <div class="progress-track">
                                <div class="progress-fill" style="width:${progress}%;"></div>
                            </div>
                        </div>
                    </div>

                    <aside class="profile-hero-side">
                        <article class="ui-card profile-partner-mini" style="border-color:${activePetTheme.ring};">
                            <div class="ui-card-head">
                                <span class="ui-card-index">MY PARTNER</span>
                                ${renderChip(activePet.grade || 'NORMAL', 'soft')}
                            </div>
                            <div class="profile-partner-mini-emoji">${activePet.emoji}</div>
                            <h3 style="color:${activePetTheme.tone};">${activePet.name}</h3>
                            <p class="ui-card-copy">${activePet.effect}</p>
                        </article>
                        <div class="ui-grid ui-grid--3 profile-summary-mini">
                            ${[
                                { label: '보유 아이템', value: inventoryCount, caption: '수량 기준' },
                                { label: '펫 컬렉션', value: `${ownedPetCount}/${totalPets}`, caption: '보유/전체' },
                                { label: '누적 출석', value: stats.checkin || 0, caption: '오락실 기록' }
                            ].map((item) => renderStatCard(item)).join('')}
                        </div>
                    </aside>
                </div>
            </section>

            <section class="ui-section">
                <div class="ui-grid ui-grid--3 profile-summary-grid">
                    ${[
                        { label: 'POINTS', value: `${(UserState.data.points || 0).toLocaleString()}P`, caption: '현재 보유 포인트' },
                        { label: 'INVENTORY', value: inventoryCount.toLocaleString(), caption: '수집한 전체 아이템' },
                        { label: 'DISCOVERY', value: discoveredCount.toLocaleString(), caption: '발견한 종류 수' },
                        { label: 'ARCADE', value: ((stats.mining || 0) + (stats.gacha || 0) + (stats.alchemy || 0) + (stats.lottery || 0) + (stats.betting || 0) + (stats.checkin || 0)).toLocaleString(), caption: '오락실 총 활동 횟수' }
                    ].map((item) => renderStatCard(item)).join('')}
                </div>
            </section>

            <section class="ui-section profile-detail-grid">
                <div class="profile-main-column">
                    <details class="profile-details" open>
                        <summary>🐾 나의 펫 파트너</summary>
                        <div class="content-area ui-stack ui-stack--md">
                            <article class="ui-card pet-active-hero" style="border-color:${activePetTheme.ring};">
                                <div class="pet-active-avatar" style="border-color:${activePetTheme.ring};">${activePet.emoji}</div>
                                <div class="ui-stack ui-stack--xs">
                                    ${renderBadge(activePet.grade || 'NORMAL', 'soft')}
                                    <h4 style="color:${activePetTheme.tone};">${activePet.name}</h4>
                                    <p class="ui-card-copy">${activePet.effect}</p>
                                    <p class="ui-card-copy">보유 펫 ${ownedPetCount} / ${totalPets}</p>
                                </div>
                            </article>

                            <div class="ui-grid ui-grid--3 profile-bonus-grid">
                                ${[
                                    { label: '채굴 보너스', value: `+${petBuff.mineBonus}P` },
                                    { label: '테스트 보너스', value: `+${petBuff.testBonus}P` },
                                    { label: '출석 보너스', value: `+${petBuff.checkinBonus}P` },
                                    { label: '전체 배수', value: `x${petBuff.multiplier.toFixed(2)}` }
                                ].map((item) => renderStatCard(item)).join('')}
                            </div>

                            ${renderSectionHeader({
                                eyebrow: 'PET COLLECTION',
                                title: '펫 입양/보유 목록',
                                description: '같은 카드 구조 안에서 입양과 장착 상태를 함께 관리합니다.'
                            })}
                            ${renderPetCollection(activePetId)}
                        </div>
                    </details>

                    <details class="profile-details">
                        <summary>🎒 내 인벤토리</summary>
                        <div class="content-area">
                            ${renderInventory(groupedInv)}
                        </div>
                    </details>

                    <details class="profile-details">
                        <summary>🏪 아이콘 상점 (변경 시 500P)</summary>
                        <div class="content-area ui-stack ui-stack--md">
                            ${Object.entries(EMOJI_SHOP).map(([category, emojis]) => `
                                <section class="ui-stack ui-stack--sm">
                                    <h4 class="profile-section-mini-title">${category}</h4>
                                    <div class="emoji-grid">
                                        ${Object.keys(emojis).map((emoji) => renderChoiceButton({
                                            label: `<span class="e-icon">${emoji}</span><span class="e-price">${Number(emojis[emoji] || 0).toLocaleString()}P</span>`,
                                            isActive: UserState.data.emoji === emoji,
                                            className: 'emoji-btn',
                                            attrs: `data-emoji="${emoji}"`,
                                            tone: 'var(--accent2)'
                                        })).join('')}
                                    </div>
                                </section>
                            `).join('')}
                        </div>
                    </details>
                </div>

                <aside class="profile-side-column">
                    <details class="profile-details" open>
                        <summary>🎨 내 꾸미기 관리</summary>
                        <div class="content-area ui-stack ui-stack--md">
                            <section class="ui-stack ui-stack--sm">
                                <h4 class="profile-section-mini-title">🎨 닉네임 색상 변경 (1,000P)</h4>
                                <div class="profile-choice-wrap">
                                    ${Object.entries(COLOR_SHOP).map(([name, code]) => {
                                        const isDefault = name === '기본';
                                        const displayColor = isDefault ? 'var(--text)' : code;
                                        return renderChoiceButton({
                                            label: name,
                                            isActive: UserState.data.nameColor === code,
                                            className: 'color-btn',
                                            attrs: `data-color="${code}"`,
                                            tone: displayColor
                                        });
                                    }).join('')}
                                </div>
                            </section>

                            ${renderEquipSection({
                                title: '🖼️ 보유한 테두리',
                                type: 'Border',
                                activeValue: UserState.data.activeBorder,
                                items: (UserState.data.unlockedBorders || []).filter((id) => id !== 'NONE')
                            })}

                            ${renderEquipSection({
                                title: '🎨 보유한 배경',
                                type: 'Background',
                                activeValue: UserState.data.activeBackground,
                                items: (UserState.data.unlockedBackgrounds || []).filter((id) => id !== 'NONE')
                            })}
                        </div>
                    </details>

                    <details class="profile-details">
                        <summary>📊 오락실 이용 통계</summary>
                        <div class="content-area">
                            ${renderStatGrid(stats)}
                        </div>
                    </details>

                    <details class="profile-details">
                        <summary>⚙️ 계정 설정</summary>
                        <div class="content-area ui-stack ui-stack--md">
                            <section class="ui-card account-card">
                                <label class="profile-field-label">닉네임 변경 ${UserState.data.nicknameChanged ? '(소모: 5,000P)' : '(최초 1회 무료)'}</label>
                                <p class="ui-card-copy">${UserState.data.nicknameChanged ? '닉네임 변경 시 포인트가 차감됩니다.' : '현재 랜덤 닉네임 상태입니다. 원하는 이름으로 변경해 보세요.'}</p>
                                <div class="profile-inline-form">
                                    <input type="text" id="nickname-input" class="ui-input" placeholder="새 닉네임 (2~10자)">
                                    ${renderButton({ label: '변경', variant: 'primary', attrs: `id="nickname-save"` })}
                                </div>
                                <p id="nickname-msg" class="profile-helper-text"></p>
                            </section>
                            ${renderButton({ label: '로그아웃', variant: 'ghost', className: 'profile-logout-button', attrs: `id="logout-btn"` })}
                        </div>
                    </details>
                </aside>
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

    app.querySelectorAll('.btn-pet-equip').forEach((btn) => {
        btn.onclick = async () => {
            const { id } = btn.dataset;
            const { changePet } = await import('../auth.js?v=8.5.11');
            if (await changePet(id)) {
                soundManager.playSuccess();
                renderProfile();
                showProfileToast(`${PET_SHOP[id]?.name || '펫'} 출전 완료`, getPetTheme(PET_SHOP[id]?.grade).tone);
            } else {
                setProfileFeedback("펫 변경 중 오류가 발생했습니다.", 'error');
            }
        };
    });

    app.querySelectorAll('.btn-pet-buy').forEach((btn) => {
        btn.onclick = async () => {
            const { id } = btn.dataset;
            const info = PET_SHOP[id];

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

            try {
                await adoptPet(id);
                soundManager.playSuccess();
                renderProfile();
                updateUI();
                showPetUnlockOverlay(info);
            } catch (error) {
                setProfileFeedback(error.message || "펫 입양 중 오류가 발생했습니다.", 'error');
            }
        };
    });

    app.querySelectorAll('.btn-equip-profile').forEach((btn) => {
        btn.onclick = async () => {
            const { type, id } = btn.dataset;
            try {
                await setProfileStyle(type, id);
                renderProfile();
                updateUI();
                showProfileToast("장착이 완료되었습니다!");
            } catch (error) {
                setProfileFeedback(error.message || "업데이트 중 오류가 발생했습니다.", 'error');
            }
        };
    });

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
