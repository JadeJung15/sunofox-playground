import { UserState } from '../auth.js?v=8.6.3';
import { renderButton, renderSectionHead } from '../ui/components.js?v=8.6.3';

export function renderProfileShell() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!UserState.user) {
        app.innerHTML = `
            <section class="page-shell">
                <section class="profile-shell">
                    ${renderSectionHead({
                        eyebrow: 'Profile',
                        title: '로그인하면 기록이 쌓입니다',
                        description: '포인트, 누적 점수, 테스트 보상과 내 프로필 상태를 저장할 수 있습니다.'
                    })}
                    <div class="profile-shell__actions">
                        ${renderButton({ label: '로그인', attrs: `onclick="document.getElementById('login-btn')?.click()"` })}
                        ${renderButton({ label: '홈으로', variant: 'ghost', attrs: `onclick="location.hash='#home'"` })}
                    </div>
                </section>
            </section>
        `;
        return;
    }

    const data = UserState.data || {};
    const inventoryCount = (data.inventory || []).length;
    const discoveredCount = (data.discoveredItems || []).length;

    app.innerHTML = `
        <section class="page-shell">
            <section class="profile-shell">
                ${renderSectionHead({
                    eyebrow: 'Profile',
                    title: `${data.nickname || '사용자'}의 기록`,
                    description: '포인트와 누적 점수, 보유 아이템 상태를 빠르게 확인합니다.'
                })}
                <div class="profile-grid">
                    <div class="profile-stat">
                        <small>포인트</small>
                        <strong>${(data.points || 0).toLocaleString()}P</strong>
                    </div>
                    <div class="profile-stat">
                        <small>누적 점수</small>
                        <strong>${(data.totalScore || 0).toLocaleString()}</strong>
                    </div>
                    <div class="profile-stat">
                        <small>보유 아이템</small>
                        <strong>${inventoryCount}</strong>
                    </div>
                    <div class="profile-stat">
                        <small>발견 아이템</small>
                        <strong>${discoveredCount}</strong>
                    </div>
                    <div class="profile-stat">
                        <small>활성 펫</small>
                        <strong>${data.activePet || 'F_NORMAL'}</strong>
                    </div>
                    <div class="profile-stat">
                        <small>저장 상태</small>
                        <strong>동기화 중</strong>
                    </div>
                </div>
                <div class="profile-shell__actions">
                    ${renderButton({ label: '홈으로', variant: 'ghost', attrs: `onclick="location.hash='#home'"` })}
                </div>
            </section>
        </section>
    `;
}
