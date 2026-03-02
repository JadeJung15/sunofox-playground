import { UserState, getPetBuff, updateUI, adoptPet, setProfileStyle } from '../auth.js?v=8.5.2';
import { getGrade, getTier, TIERS, EMOJI_SHOP, COLOR_SHOP, BORDER_SHOP, BACKGROUND_SHOP, PET_SHOP } from '../constants/shops.js';
import { soundManager } from '../sound.js?v=8.5.2';
import { renderBadge, renderButton, renderChip, renderSectionHeader, renderStatCard } from '../ui/components.js?v=8.5.2';

function getPetTheme(grade) {
    const tones = {
        NORMAL: '#16a34a',
        RARE: '#2563eb',
        EPIC: '#7c3aed',
        LEGENDARY: '#ea580c'
    };
    return tones[grade] || tones.NORMAL;
}

function showProfileToast(message) {
    const toast = document.createElement('div');
    toast.className = 'profile-toast-lite';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    }, 1400);
}

function showPetUnlockOverlay(info) {
    const overlay = document.createElement('div');
    overlay.className = 'profile-modal-lite';
    overlay.innerHTML = `
        <div class="profile-modal-lite__card">
            ${renderBadge(info.grade || 'NORMAL', 'accent')}
            <strong>${info.emoji} ${info.name}</strong>
            <p>${info.effect}</p>
            <button type="button" class="ui-button ui-button--primary profile-modal-lite__close">확인</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.profile-modal-lite__close')?.addEventListener('click', () => overlay.remove());
}

function renderGuestProfile(app) {
    app.innerHTML = `
        <div class="site-page fade-in profile-dashboard-page">
            <section class="ui-surface ui-panel profile-guest-board">
                ${renderSectionHeader({
                    eyebrow: 'Profile',
                    title: '내 활동과 보상을 관리하는 공간',
                    description: '로그인하면 테스트 보상, 펫, 인벤토리, 꾸미기 상태를 한 번에 관리할 수 있습니다.'
                })}
                <div class="report-action-row">
                    ${renderButton({ label: '로그인하기', variant: 'primary', tag: 'button', attrs: "type=\"button\" onclick=\"document.getElementById('login-btn')?.click()\"" })}
                </div>
            </section>

            <section class="ui-grid ui-grid--3">
                ${renderStatCard({ label: 'Inventory', value: 'Items', caption: '획득한 아이템 정리' })}
                ${renderStatCard({ label: 'Pets', value: 'Partner', caption: '보너스 펫 관리' })}
                ${renderStatCard({ label: 'Style', value: 'Profile', caption: '닉네임/배경 변경' })}
            </section>
        </div>
    `;
}

function renderInventory(inv) {
    const grouped = inv.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});

    const entries = Object.entries(grouped);
    if (!entries.length) {
        return `<div class="ui-empty-state"><strong>수집한 아이템이 없습니다.</strong><p>테스트 결과와 오락실 보상으로 아이템이 채워집니다.</p></div>`;
    }

    return `
        <div class="profile-card-grid">
            ${entries.map(([name, count]) => `
                <article class="profile-mini-card">
                    <div class="profile-mini-card__top">
                        ${renderBadge(getGrade(name), 'soft')}
                        <strong>${name}</strong>
                    </div>
                    <span>${count}개 보유</span>
                </article>
            `).join('')}
        </div>
    `;
}

function renderPetCards(activePetId, unlockedPets) {
    return `
        <div class="profile-card-grid">
            ${Object.entries(PET_SHOP).map(([id, info]) => {
                const isOwned = unlockedPets.includes(id);
                const isActive = activePetId === id;
                const tone = getPetTheme(info.grade);
                return `
                    <article class="profile-pet-card${isActive ? ' is-active' : ''}" style="--pet-tone:${tone};">
                        <div class="profile-pet-card__head">
                            <span class="profile-pet-card__emoji">${info.emoji}</span>
                            ${renderBadge(info.grade, isActive ? 'accent' : 'soft')}
                        </div>
                        <strong>${info.name}</strong>
                        <p>${info.effect}</p>
                        ${isOwned
                            ? renderButton({
                                label: isActive ? '사용 중' : '장착',
                                variant: isActive ? 'primary' : 'secondary',
                                tag: 'button',
                                attrs: `type="button" class="btn-pet-equip" data-id="${id}"`
                            })
                            : renderButton({
                                label: `${info.price.toLocaleString()}P 입양`,
                                variant: 'primary',
                                tag: 'button',
                                attrs: `type="button" class="btn-pet-buy" data-id="${id}"`
                            })}
                    </article>
                `;
            }).join('')}
        </div>
    `;
}

function renderStyleButtons(type, activeValue, items) {
    return `
        <div class="profile-token-row">
            <button class="profile-token-button${activeValue === 'NONE' ? ' is-active' : ''} btn-equip-profile" type="button" data-type="${type}" data-id="NONE">해제</button>
            ${items.map(([id, info]) => `
                <button class="profile-token-button${activeValue === id ? ' is-active' : ''} btn-equip-profile" type="button" data-type="${type}" data-id="${id}">${info.name || id}</button>
            `).join('')}
        </div>
    `;
}

export function renderProfile() {
    const app = document.getElementById('app');
    if (!UserState.user) {
        renderGuestProfile(app);
        return;
    }

    const data = UserState.data;
    const inv = data.inventory || [];
    const tier = getTier(data.totalScore || 0);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progressTarget = nextTier.min || data.totalScore || 0;
    const progress = tier === nextTier ? 100 : Math.min(100, ((data.totalScore || 0) / progressTarget) * 100);
    const stats = data.arcadeStats || { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 };
    const activePetId = data.activePet || 'F_NORMAL';
    const activePet = PET_SHOP[activePetId] || { emoji: '🐾', name: '기본 파트너', effect: '파트너가 없습니다.', grade: 'NORMAL' };
    const petBuff = getPetBuff();
    const unlockedPets = data.unlockedPets || [];
    const discoveredCount = (data.discoveredItems || []).length;

    app.innerHTML = `
        <div class="site-page fade-in profile-dashboard-page">
            <section class="ui-surface ui-panel profile-dashboard-hero">
                <div class="profile-dashboard-hero__main">
                    <div class="profile-dashboard-hero__identity">
                        <div id="user-emoji" class="profile-avatar-display">${data.emoji || '👤'}</div>
                        <div class="ui-stack ui-stack--xs">
                            ${renderBadge(tier.name, 'accent')}
                            <h1 id="user-name" class="page-title">${data.nickname || '사용자'}</h1>
                            <p class="page-copy">${(data.points || 0).toLocaleString()}P 보유 · ${(data.totalScore || 0).toLocaleString()} 누적 점수 · 발견 아이템 ${discoveredCount}종</p>
                        </div>
                    </div>
                    <div class="profile-progress-block">
                        <div class="profile-progress-block__meta">
                            <strong>등급 진행도</strong>
                            <span>${(data.totalScore || 0).toLocaleString()} / ${progressTarget.toLocaleString()}</span>
                        </div>
                        <div class="test-progress-shell" aria-label="등급 진행도">
                            <div class="test-progress-shell__bar" style="width:${progress}%;"></div>
                        </div>
                    </div>
                </div>

                <aside class="profile-dashboard-hero__side">
                    ${renderBadge('Partner', 'soft')}
                    <strong>${activePet.emoji} ${activePet.name}</strong>
                    <p>${activePet.effect}</p>
                    <div class="profile-partner-metrics">
                        <span>채굴 +${petBuff.mineBonus}P</span>
                        <span>테스트 +${petBuff.testBonus}P</span>
                        <span>출석 +${petBuff.checkinBonus}P</span>
                        <span>x${petBuff.multiplier.toFixed(2)}</span>
                    </div>
                </aside>
            </section>

            <section class="ui-grid ui-grid--cards">
                ${renderStatCard({ label: 'POINTS', value: (data.points || 0).toLocaleString(), caption: '현재 포인트' })}
                ${renderStatCard({ label: 'INVENTORY', value: inv.length.toLocaleString(), caption: '전체 수량' })}
                ${renderStatCard({ label: 'PETS', value: unlockedPets.length.toLocaleString(), caption: '보유 파트너' })}
                ${renderStatCard({ label: 'ACTIVITY', value: Object.values(stats).reduce((sum, value) => sum + value, 0).toLocaleString(), caption: '오락실 총 활동' })}
            </section>

            <section class="ui-grid ui-grid--2">
                <div class="ui-surface ui-panel">
                    ${renderSectionHeader({
                        eyebrow: 'Partner',
                        title: '펫 관리',
                        description: '보유 펫을 장착하거나 새 파트너를 입양할 수 있습니다.'
                    })}
                    ${renderPetCards(activePetId, unlockedPets)}
                </div>

                <div class="ui-surface ui-panel">
                    ${renderSectionHeader({
                        eyebrow: 'Inventory',
                        title: '내 인벤토리',
                        description: '테스트와 오락실에서 모은 아이템입니다.'
                    })}
                    ${renderInventory(inv)}
                </div>
            </section>

            <section class="ui-grid ui-grid--2">
                <div class="ui-surface ui-panel">
                    ${renderSectionHeader({
                        eyebrow: 'Style',
                        title: '프로필 꾸미기',
                        description: '닉네임 색상과 보유 스타일을 변경합니다.'
                    })}
                    <div class="ui-stack ui-stack--sm">
                        <div>
                            <div class="profile-label-row">
                                <strong>닉네임 색상</strong>
                                <span>1,000P</span>
                            </div>
                            <div class="profile-token-row">
                                ${Object.entries(COLOR_SHOP).map(([name, code]) => `
                                    <button class="profile-token-button color-btn${data.nameColor === code ? ' is-active' : ''}" type="button" data-color="${code}">${name}</button>
                                `).join('')}
                            </div>
                        </div>
                        <div>
                            <div class="profile-label-row">
                                <strong>보유 테두리</strong>
                            </div>
                            ${renderStyleButtons('Border', data.activeBorder || 'NONE', Object.entries(BORDER_SHOP).filter(([id]) => (data.unlockedBorders || []).includes(id) && id !== 'NONE'))}
                        </div>
                        <div>
                            <div class="profile-label-row">
                                <strong>보유 배경</strong>
                            </div>
                            ${renderStyleButtons('Background', data.activeBackground || 'NONE', Object.entries(BACKGROUND_SHOP).filter(([id]) => (data.unlockedBackgrounds || []).includes(id) && id !== 'NONE'))}
                        </div>
                    </div>
                </div>

                <div class="ui-surface ui-panel">
                    ${renderSectionHeader({
                        eyebrow: 'Account',
                        title: '설정과 활동',
                        description: '닉네임 변경, 계정 설정, 오락실 이용량을 확인합니다.'
                    })}
                    <div class="ui-stack ui-stack--sm">
                        <div class="profile-card-grid">
                            ${Object.entries({
                                '채굴': stats.mining || 0,
                                '가챠': stats.gacha || 0,
                                '연금술': stats.alchemy || 0,
                                '복권': stats.lottery || 0,
                                '베팅': stats.betting || 0,
                                '출석': stats.checkin || 0
                            }).map(([label, value]) => `
                                <article class="profile-mini-card">
                                    <strong>${label}</strong>
                                    <span>${value.toLocaleString()}회</span>
                                </article>
                            `).join('')}
                        </div>
                        <label class="ui-stack ui-stack--xs" for="nickname-input">
                            <span class="ui-section-meta">닉네임 변경</span>
                            <div class="profile-inline-form">
                                <input id="nickname-input" class="search-field" type="text" placeholder="새 닉네임 (2~10자)">
                                <button id="nickname-save" class="ui-button ui-button--primary" type="button">변경</button>
                            </div>
                        </label>
                        <p id="nickname-msg" class="ui-section-meta"></p>
                        <button id="logout-btn" class="ui-button ui-button--secondary" type="button">로그아웃</button>
                    </div>
                </div>
            </section>

            <section class="ui-surface ui-panel">
                ${renderSectionHeader({
                    eyebrow: 'Emoji Shop',
                    title: '아이콘 상점',
                    description: '보유 포인트로 프로필 이모지를 교체할 수 있습니다.'
                })}
                <div class="profile-card-grid">
                    ${Object.entries(EMOJI_SHOP).flatMap(([category, emojis]) =>
                        Object.keys(emojis).map((emoji) => `
                            <button class="profile-emoji-card emoji-btn${data.emoji === emoji ? ' is-active' : ''}" type="button" data-emoji="${emoji}">
                                ${renderChip(category, 'soft')}
                                <strong>${emoji}</strong>
                                <span>${Number(emojis[emoji] || 0).toLocaleString()}P</span>
                            </button>
                        `)
                    ).join('')}
                </div>
            </section>
        </div>
    `;

    app.querySelectorAll('.btn-pet-equip').forEach((button) => {
        button.addEventListener('click', async () => {
            const { id } = button.dataset;
            const { changePet } = await import('../auth.js?v=8.5.2');
            if (await changePet(id)) {
                soundManager.playSuccess();
                renderProfile();
                showProfileToast('펫이 변경되었습니다.');
            }
        });
    });

    app.querySelectorAll('.btn-pet-buy').forEach((button) => {
        button.addEventListener('click', async () => {
            const { id } = button.dataset;
            try {
                await adoptPet(id);
                soundManager.playSuccess();
                renderProfile();
                updateUI();
                showPetUnlockOverlay(PET_SHOP[id]);
            } catch (error) {
                alert(error.message || '펫 입양 중 오류가 발생했습니다.');
            }
        });
    });

    app.querySelectorAll('.btn-equip-profile').forEach((button) => {
        button.addEventListener('click', async () => {
            const { type, id } = button.dataset;
            try {
                await setProfileStyle(type, id);
                renderProfile();
                updateUI();
                showProfileToast('프로필 스타일이 변경되었습니다.');
            } catch (error) {
                alert(error.message || '프로필 적용 중 오류가 발생했습니다.');
            }
        });
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        const logoutBtnInAuth = document.createElement('button');
        logoutBtnInAuth.id = 'logout-btn';
        document.body.appendChild(logoutBtnInAuth);
        logoutBtnInAuth.click();
        logoutBtnInAuth.remove();
    });

    updateUI();
}
