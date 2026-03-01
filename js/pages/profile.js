import { UserState, updateUI } from '../auth.js?v=8.5.7';
import { db } from '../firebase-init.js?v=8.5.7';
import { collection, getDocs, limit, orderBy, query, where } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

function escapeHTML(value) {
    if (value == null) return '';
    return String(value).replace(/[&<>'"]/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[char] || char));
}

function formatDate(value) {
    const millis = typeof value?.toMillis === 'function' ? value.toMillis() : Date.now();
    return new Date(millis).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

async function loadOwnPosts() {
    if (!UserState.user) return [];
    const postsRef = collection(db, 'posts');
    const postsQuery = query(
        postsRef,
        where('uid', '==', UserState.user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
    );
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map((post) => ({ id: post.id, ...post.data() }));
}

function renderOwnPostList(posts) {
    if (!posts.length) {
        return `
            <div class="profile-simple-empty">
                <strong>작성한 글이 없습니다.</strong>
                <span>게시판에서 첫 글을 작성해 보세요.</span>
                <button class="btn-secondary" onclick="location.hash='#board'">게시판 가기</button>
            </div>
        `;
    }

    return `
        <div class="profile-post-list">
            ${posts.map((post) => `
                <article class="profile-post-item">
                    <div class="profile-post-copy">
                        <strong>${escapeHTML(post.content || '내용 없음').slice(0, 90)}</strong>
                        <span>${formatDate(post.createdAt)}</span>
                    </div>
                    <div class="profile-post-actions">
                        <button class="btn-secondary" onclick="location.hash='#board'">게시판</button>
                        <button class="btn-secondary profile-danger-btn" onclick="window.deletePost && window.deletePost('${post.id}')">삭제</button>
                    </div>
                </article>
            `).join('')}
        </div>
    `;
}

export async function renderProfile() {
    const app = document.getElementById('app');

    if (!UserState.user) {
        app.innerHTML = `
            <div class="profile-page fade-in">
                <div class="profile-stage profile-stage-simple">
                    <section class="profile-guest-hero">
                        <div class="profile-guest-icon">👤</div>
                        <div class="profile-hero-kicker">Account</div>
                        <h2>프로필</h2>
                        <p>로그인 후 닉네임과 내 글을 관리할 수 있습니다.</p>
                        <button class="btn-primary profile-hero-login" onclick="document.getElementById('login-btn')?.click()">로그인</button>
                    </section>
                </div>
            </div>
        `;
        return;
    }

    app.innerHTML = `
        <div class="profile-page fade-in">
            <div class="profile-stage profile-stage-simple">
                <section class="profile-hero-shell profile-simple-hero">
                    <div class="profile-hero-main">
                        <div class="profile-hero-kicker">Account</div>
                        <div class="profile-hero-avatar-row">
                            <div id="user-emoji" class="author-emoji-circle profile-hero-avatar">${UserState.data?.emoji || '👤'}</div>
                            <div class="profile-hero-copy">
                                <h2 id="user-name">${escapeHTML(UserState.data?.nickname || '닉네임')}</h2>
                                <p>${escapeHTML(UserState.user.email || '')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="profile-detail-grid profile-detail-grid-simple">
                    <div class="profile-main-column">
                        <details class="profile-details" open>
                            <summary>닉네임</summary>
                            <div class="content-area">
                                <div class="setting-group profile-setting-group">
                                    <label>닉네임 변경</label>
                                    <p>지금 표시되는 이름을 새 닉네임으로 바꿉니다.</p>
                                    <div class="profile-inline-form">
                                        <input type="text" id="nickname-input" placeholder="새 닉네임 (2~10자)">
                                        <button id="nickname-save" class="btn-primary">변경</button>
                                    </div>
                                    <p id="nickname-msg" class="profile-form-message"></p>
                                </div>
                            </div>
                        </details>

                        <details class="profile-details" open>
                            <summary>내 글</summary>
                            <div class="content-area" id="profile-posts-panel">
                                <div class="profile-simple-loading">불러오는 중...</div>
                            </div>
                        </details>
                    </div>

                    <div class="profile-side-column">
                        <details class="profile-details" open>
                            <summary>계정</summary>
                            <div class="content-area">
                                <div class="profile-account-box">
                                    <strong>${escapeHTML(UserState.data?.nickname || '닉네임')}</strong>
                                    <span>${escapeHTML(UserState.user.email || '')}</span>
                                </div>
                                <button id="logout-btn-top" class="btn-secondary profile-danger-btn profile-logout-btn">로그아웃</button>
                            </div>
                        </details>
                    </div>
                </section>
            </div>
        </div>
    `;

    const logoutBtn = document.getElementById('logout-btn-top');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (logoutBtn.dataset.confirming !== 'true') {
                logoutBtn.dataset.confirming = 'true';
                logoutBtn.textContent = '한 번 더 누르면 로그아웃';
                setTimeout(() => {
                    if (logoutBtn.dataset.confirming === 'true') {
                        logoutBtn.dataset.confirming = 'false';
                        logoutBtn.textContent = '로그아웃';
                    }
                }, 2500);
                return;
            }

            const proxyBtn = document.createElement('button');
            proxyBtn.id = 'logout-btn';
            document.body.appendChild(proxyBtn);
            proxyBtn.click();
            proxyBtn.remove();
        };
    }

    const postsPanel = document.getElementById('profile-posts-panel');
    try {
        const posts = await loadOwnPosts();
        if (postsPanel) postsPanel.innerHTML = renderOwnPostList(posts);
    } catch (error) {
        if (postsPanel) {
            postsPanel.innerHTML = `
                <div class="profile-simple-empty">
                    <strong>내 글을 불러오지 못했습니다.</strong>
                    <span>잠시 후 다시 시도해 주세요.</span>
                </div>
            `;
        }
    }

    updateUI();
}
