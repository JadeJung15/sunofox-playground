import { db, storage } from './firebase-init.js?v=8.5.0';
import { UserState, usePoints, addPoints, fetchUserProfile, updateProfileCache, fetchUserRank } from './auth.js?v=8.5.0';
import { getTier, AURA_SHOP, BORDER_SHOP, BACKGROUND_SHOP } from './constants/shops.js';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    getDocs, 
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getCountFromServer,
    increment,
    getDoc,
    startAfter,
    onSnapshot,
    where
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js";

export const CATEGORIES = {
    'ALL': { name: '전체', icon: '🌐', class: 'cat-all' },
    'FREE': { name: '자유', icon: '💬', class: 'cat-free' },
    'INFO': { name: '정보', icon: '💡', class: 'cat-info' },
    'BRAG': { name: '인증', icon: '💎', class: 'cat-brag' },
    'EVENT': { name: '이벤트', icon: '🎁', class: 'cat-event' }
};

export const REACTION_TYPES = [
    { emoji: '🔥', label: '핫해요', color: '#f97316' },
    { emoji: '👏', label: '박수', color: '#f59e0b' },
    { emoji: '💡', label: '유익해요', color: '#3b82f6' },
    { emoji: '💎', label: '최고예요', color: '#ec4899' },
    { emoji: '🤣', label: '웃겨요', color: '#10b981' }
];

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

let lastVisiblePost = null;
let currentSort = 'desc'; 
let currentCategory = 'ALL';
let currentSearch = '';
let postUnsubscribe = null;
let isLoadingMore = false;
let boardObserver = null; // 메모리 누수 방지용
let boardFlashMessage = '';
let boardFlashType = 'info';

function withTimeout(promise, ms = 8000) {
    let timerId;
    const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => reject(new Error('timeout')), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timerId));
}

async function getPostsSnapshotWithFallback(isLoadMore = false) {
    const postsRef = collection(db, "posts");
    const primaryConstraints = [];

    if (currentSort === 'popular') {
        primaryConstraints.push(orderBy("likeCount", "desc"));
    } else {
        primaryConstraints.push(orderBy("createdAt", "desc"));
    }

    primaryConstraints.push(limit(isLoadMore ? 24 : 36));
    if (isLoadMore && lastVisiblePost) primaryConstraints.push(startAfter(lastVisiblePost));

    try {
        return await withTimeout(getDocs(query(postsRef, ...primaryConstraints)), 8000);
    } catch (primaryError) {
        console.warn('Primary board query failed, falling back:', primaryError);

        const fallbackConstraints = [limit(isLoadMore ? 24 : 36)];
        if (isLoadMore && lastVisiblePost) fallbackConstraints.push(startAfter(lastVisiblePost));
        return withTimeout(getDocs(query(postsRef, ...fallbackConstraints)), 8000);
    }
}

export async function renderBoard(container) {
    // [상태 초기화] 홈에서 진입하거나 페이지 이동 시 항상 최신순/전체 카테고리로 시작
    currentSort = 'desc';
    currentCategory = 'ALL';
    currentSearch = '';
    lastVisiblePost = null;

    const canPost = !!UserState.user;
    const quickStatus = canPost ? `지금 바로 글 작성 가능 · 보상 10P` : '로그인 후 글 작성 · 댓글 · 반응 가능';

    container.innerHTML = `
        <div class="board-stage fade-in">
            <section class="board-hero-shell">
                <div class="board-hero-main">
                    <div class="board-hero-kicker">COMMUNITY LOUNGE</div>
                    <h2>💬 떠들 거리 많은 게시판</h2>
                    <p>자유글, 정보글, 인증글, 이벤트까지 한 화면에서 빠르게 훑고 바로 반응할 수 있게 정리했습니다.</p>
                    <div class="board-hero-pills">
                        <span>🔥 인기글 스크롤</span>
                        <span>💎 강조글 상단 노출</span>
                        <span>📝 ${quickStatus}</span>
                    </div>
                </div>
                <div class="board-hero-side">
                    <div class="board-stat-card">
                        <strong>탐색 모드</strong>
                        <span>${currentCategory === 'ALL' ? '전체 게시글 탐색 중' : `${CATEGORIES[currentCategory]?.name || '전체'} 집중 탐색 중`}</span>
                    </div>
                    <div class="board-shop-pills">
                        <button id="btn-aura-shop" class="board-action-pill">✨ 오라 상점</button>
                        <button id="btn-border-shop" class="board-action-pill">🖼️ 테두리 상점</button>
                        <button id="btn-bg-shop" class="board-action-pill">🎨 배경 상점</button>
                    </div>
                </div>
            </section>

            <div class="card board-container">

            <!-- Best Posts Section -->
            <div id="best-posts-section" style="margin-bottom:2rem; display:none;">
                <div class="board-section-head">
                    <div>
                        <small>HOT LOOP</small>
                        <h3>🔥 실시간 인기 게시글</h3>
                    </div>
                </div>
                <div id="best-posts-list" class="best-posts-slider"></div>
            </div>

            <!-- Category Tabs -->
            <div class="board-tabs">
                ${Object.entries(CATEGORIES).map(([key, cat]) => `
                    <div class="board-tab ${currentCategory === key ? 'active' : ''}" data-category="${key}">
                        ${cat.icon} ${cat.name}
                    </div>
                `).join('')}
            </div>

            <div id="board-global-feedback" class="board-global-feedback" style="display:none;"></div>

            <!-- Shop UIs -->
            <div id="aura-shop-ui" class="card shop-panel" style="display:none; margin-bottom:2rem; background:rgba(99, 102, 241, 0.05); border:1px dashed var(--accent-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 style="font-size:1rem;">✨ 프로필 오라 상점</h3>
                    <button class="close-shop" data-target="aura-shop-ui" style="background:none; border:none; cursor:pointer;">✕</button>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                    ${renderShopItems(AURA_SHOP, 'Aura')}
                </div>
                <button id="btn-unequip-aura" class="btn-secondary" style="width:100%; margin-top:1rem; font-size:0.75rem; padding:0.5rem;">오라 해제하기</button>
            </div>

            <div id="border-shop-ui" class="card shop-panel" style="display:none; margin-bottom:2rem; background:rgba(236, 72, 153, 0.05); border:1px dashed var(--color-face);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 style="font-size:1rem;">🖼️ 아이콘 테두리 상점</h3>
                    <button class="close-shop" data-target="border-shop-ui" style="background:none; border:none; cursor:pointer;">✕</button>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:1rem;">
                    ${renderShopItems(BORDER_SHOP, 'Border')}
                </div>
                <button id="btn-unequip-border" class="btn-secondary" style="width:100%; margin-top:1rem; font-size:0.75rem; padding:0.5rem;">테두리 해제하기</button>
            </div>

            <div id="bg-shop-ui" class="card shop-panel" style="display:none; margin-bottom:2rem; background:rgba(245, 158, 11, 0.05); border:1px dashed var(--color-fortune);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 style="font-size:1rem;">🎨 프로필 배경 상점</h3>
                    <button class="close-shop" data-target="bg-shop-ui" style="background:none; border:none; cursor:pointer;">✕</button>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:1rem;">
                    ${renderShopItems(BACKGROUND_SHOP, 'Background')}
                </div>
                <button id="btn-unequip-bg" class="btn-secondary" style="width:100%; margin-top:1rem; font-size:0.75rem; padding:0.5rem;">배경 해제하기</button>
            </div>
            
            <div class="board-toolbar">
                <input type="text" id="board-search" value="${currentSearch}" placeholder="검색어로 글 찾기" class="board-search-input">
                <select id="board-sort" class="board-sort-select">
                    <option value="desc" ${currentSort === 'desc' ? 'selected' : ''}>🕒 최신순</option>
                    <option value="popular" ${currentSort === 'popular' ? 'selected' : ''}>🔥 인기순</option>
                </select>
            </div>

            <div id="post-form" class="post-form board-compose-shell">
                <div class="board-section-head" style="margin-bottom:1rem;">
                    <div>
                        <small>WRITE ZONE</small>
                        <h3>오늘의 한마디 남기기</h3>
                    </div>
                    <span class="board-compose-reward">작성 보상 +10P</span>
                </div>
                <div style="display:flex; gap:0.5rem; margin-bottom:0.8rem; flex-wrap:wrap;">
                    <select id="post-category-select" class="board-category-select">
                        <option value="FREE">💬 자유글</option>
                        <option value="INFO">💡 정보공유</option>
                        <option value="BRAG">💎 자랑하기</option>
                        <option value="EVENT">🎁 이벤트</option>
                    </select>
                    <div class="board-compose-note">${canPost ? '사진과 강조 옵션을 붙여 더 눈에 띄게 올릴 수 있습니다.' : '로그인하면 바로 글을 작성할 수 있습니다.'}</div>
                </div>
                <textarea id="post-content" placeholder="함께 나누고 싶은 이야기를 적어보세요. (작성 시 10P 지급!)" maxlength="500"></textarea>
                <div id="post-image-preview" style="display:none; margin-top:0.5rem; max-height:200px; overflow:hidden; border-radius:8px;"></div>
                <div id="board-post-feedback" class="board-post-feedback" style="display:none;"></div>
                <div class="post-options board-compose-actions">
                    <label class="board-attach-pill">
                        📷 사진
                        <input type="file" id="post-image" accept="image/*" style="display:none;">
                    </label>
                    <label style="font-size:0.8rem; cursor:pointer; color:var(--text-sub); font-weight:700;">
                        <input type="checkbox" id="post-premium"> 📣 강조 (+300P)
                    </label>
                    <button id="submit-post" class="btn-primary board-submit-btn">등록하기</button>
                </div>
            </div>

            <div id="posts-list" class="posts-list">
                <div class="loading-spinner">불러오는 중...</div>
            </div>
            
            <div id="scroll-trigger"></div>
            
            <div id="load-more-container" style="text-align:center; margin-top:1rem; display:none;">
                <button id="btn-load-more" class="btn-secondary" style="width:100%; max-width:300px; padding:0.8rem;">글 더 보기</button>
            </div>
        </div>
        </div>

        <!-- Profile Card Modal Overlay -->
        <div id="profile-modal-overlay" class="modal-overlay">
            <div class="profile-card-modal">
                <div class="profile-card-banner"></div>
                <div class="profile-card-content">
                    <div id="pm-avatar" class="profile-card-avatar">👤</div>
                    <div id="pm-nickname" class="profile-card-nickname">닉네임</div>
                    <div id="pm-tier" class="profile-card-tier">ROOKIE</div>
                    <p id="pm-bio" style="font-size:0.85rem; color:var(--text-sub); margin-bottom:1.5rem;">작성된 자기소개가 없습니다.</p>
                    <button id="btn-edit-bio" class="btn-secondary profile-edit-bio-btn" style="display:none;">자기소개 수정</button>
                    <div id="pm-bio-editor" class="profile-bio-editor" style="display:none;">
                        <textarea id="pm-bio-input" maxlength="50" placeholder="자기소개를 입력해주세요."></textarea>
                        <div class="profile-bio-editor-actions">
                            <button id="pm-bio-cancel" type="button" class="btn-secondary">취소</button>
                            <button id="pm-bio-save" type="button" class="btn-primary">저장</button>
                        </div>
                    </div>
                    <div id="pm-feedback" class="profile-modal-feedback" style="display:none;"></div>
                    <div class="profile-card-stats">
                        <div class="pc-stat-item"><span>랭킹</span><span id="pm-rank">-</span></div>
                        <div class="pc-stat-item"><span>포인트</span><span id="pm-points">0</span></div>
                        <div class="pc-stat-item"><span>전체점수</span><span id="pm-score">0</span></div>
                        <div class="pc-stat-item"><span>아이템</span><span id="pm-items">0</span></div>
                    </div>
                </div>
                <button id="close-profile-modal" style="position:absolute; top:15px; right:15px; background:rgba(255,255,255,0.2); border:none; color:#fff; width:30px; height:30px; border-radius:50%; cursor:pointer;">✕</button>
            </div>
        </div>
    `;

    function renderShopItems(shopData, type) {
        const unlockedKey = `unlocked${type}s`;
        const activeKey = `active${type}`;
        
        return Object.entries(shopData).map(([id, info]) => {
            const isOwned = UserState.data?.[unlockedKey]?.includes(id);
            const isActive = UserState.data?.[activeKey] === id;
            return `
                <div class="buy-card ${info.class}" style="background:var(--card-bg); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border-color);">
                    <div style="width:40px; height:40px; border-radius:50%; margin:0 auto 0.5rem; background:#eee; display:flex; align-items:center; justify-content:center; border: 2px solid transparent;">👤</div>
                    <h4 style="font-size:0.8rem; margin-bottom:0.2rem;">${info.name}</h4>
                    <p style="font-size:0.65rem; color:var(--text-sub); margin-bottom:0.6rem;">${info.price.toLocaleString()}P<br><small>(필수: ${info.minScore.toLocaleString()}점)</small></p>
                    ${isOwned ? 
                        `<button class="btn-equip-item" data-type="${type}" data-id="${id}" style="width:100%; padding:0.3rem; font-size:0.7rem; border-radius:6px; border:1px solid var(--accent-color); background:${isActive ? 'var(--accent-color)' : 'none'}; color:${isActive ? '#fff' : 'var(--accent-color)'}">${isActive ? '장착 중' : '장착하기'}</button>` :
                        `<button class="btn-buy-item" data-type="${type}" data-id="${id}" style="width:100%; padding:0.3rem; font-size:0.7rem; border-radius:6px; background:var(--text-main); color:#fff; border:none;">구매</button>`
                    }
                </div>
            `;
        }).join('');
    }

    const listContainer = document.getElementById('posts-list');
    const globalFeedbackEl = document.getElementById('board-global-feedback');
    const setBoardGlobalFeedback = (message, type = 'info') => {
        if (!globalFeedbackEl) return;
        globalFeedbackEl.textContent = message;
        globalFeedbackEl.className = `board-global-feedback ${type}`;
        globalFeedbackEl.style.display = message ? 'block' : 'none';
    };
    if (boardFlashMessage) {
        setBoardGlobalFeedback(boardFlashMessage, boardFlashType);
        boardFlashMessage = '';
        boardFlashType = 'info';
    }
    
    // Initial Load
    loadPosts(listContainer, false);
    loadBestPosts();

    // Infinite Scroll via IntersectionObserver
    if (boardObserver) boardObserver.disconnect();
    boardObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && lastVisiblePost) {
            loadPosts(listContainer, true);
        }
    }, { threshold: 1.0 });
    boardObserver.observe(document.getElementById('scroll-trigger'));

    // Category Tab Events
    container.querySelectorAll('.board-tab').forEach(tab => {
        tab.onclick = () => {
            currentCategory = tab.dataset.category;
            container.querySelectorAll('.board-tab').forEach(t => t.classList.toggle('active', t === tab));
            lastVisiblePost = null;
            loadPosts(listContainer, false);
        };
    });

    document.getElementById('board-search').oninput = (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        lastVisiblePost = null;
        loadPosts(listContainer, false);
    };

    document.getElementById('board-sort').onchange = (e) => {
        currentSort = e.target.value;
        lastVisiblePost = null;
        loadPosts(listContainer, false);
    };

    const toggleShop = (shopId) => {
        document.querySelectorAll('.shop-panel').forEach(p => {
            p.style.display = p.id === shopId && p.style.display === 'none' ? 'block' : 'none';
        });
    };
    document.getElementById('btn-aura-shop').onclick = () => toggleShop('aura-shop-ui');
    document.getElementById('btn-border-shop').onclick = () => toggleShop('border-shop-ui');
    document.getElementById('btn-bg-shop').onclick = () => toggleShop('bg-shop-ui');
    container.querySelectorAll('.close-shop').forEach(btn => btn.onclick = () => document.getElementById(btn.dataset.target).style.display = 'none');

    // Profile Modal Events
    document.getElementById('close-profile-modal').onclick = () => document.getElementById('profile-modal-overlay').style.display = 'none';
    document.getElementById('profile-modal-overlay').onclick = (e) => { if(e.target.id === 'profile-modal-overlay') e.target.style.display = 'none'; };

    // Image Preview
    const imageInput = document.getElementById('post-image');
    const imagePreview = document.getElementById('post-image-preview');
    const feedbackEl = document.getElementById('board-post-feedback');
    let selectedImageFile = null;

    const setPostFeedback = (message, type = 'info') => {
        if (!feedbackEl) return;
        feedbackEl.textContent = message;
        feedbackEl.className = `board-post-feedback ${type}`;
        feedbackEl.style.display = message ? 'block' : 'none';
    };

    imageInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setPostFeedback("이미지 크기는 5MB 이하여야 합니다.", 'error');
                return;
            }
            selectedImageFile = file;
            setPostFeedback(`이미지 준비 완료: ${file.name}`, 'info');
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" style="width:100%; object-fit:contain; border-radius:8px;"> <button id="remove-image" style="margin-top:4px; font-size:0.75rem; color:#ef4444; border:none; background:none; cursor:pointer;">이미지 삭제</button>`;
                imagePreview.style.display = 'block';
                document.getElementById('remove-image').onclick = () => {
                    selectedImageFile = null; imageInput.value = ''; imagePreview.style.display = 'none';
                    setPostFeedback('', 'info');
                };
            };
            reader.readAsDataURL(file);
        }
    };

    // Shop Item Actions (중복 등록 방지)
    const boardContainer = container.querySelector('.board-container');
    boardContainer.addEventListener('click', async (e) => {
        const buyBtn = e.target.closest('.btn-buy-item');
        const equipBtn = e.target.closest('.btn-equip-item');
        if (buyBtn) {
            const { type, id } = buyBtn.dataset;
            const info = (type === 'Aura' ? AURA_SHOP : (type === 'Border' ? BORDER_SHOP : BACKGROUND_SHOP))[id];
            if (UserState.data.totalScore < info.minScore) {
                return setBoardGlobalFeedback(`아이템 점수가 부족합니다. 필요 점수: ${info.minScore.toLocaleString()}점`, 'error');
            }
            if (await usePoints(info.price, `${type} 구매: ${info.name}`)) {
                await updateDoc(doc(db, "users", UserState.user.uid), { [`unlocked${type}s`]: arrayUnion(id), [`active${type}`]: id });
                UserState.data[`unlocked${type}s`].push(id); UserState.data[`active${type}`] = id;
                updateProfileCache(UserState.user.uid, { [`active${type}`]: id });
                boardFlashMessage = `${info.name} 구매 및 장착 완료`;
                boardFlashType = 'success';
                renderBoard(container);
            } else {
                setBoardGlobalFeedback(`포인트가 부족해 ${info.name} 구매에 실패했습니다.`, 'error');
            }
        }
        if (equipBtn) {
            const { type, id } = equipBtn.dataset;
            await updateDoc(doc(db, "users", UserState.user.uid), { [`active${type}`]: id });
            UserState.data[`active${type}`] = id;
            updateProfileCache(UserState.user.uid, { [`active${type}`]: id });
            const info = (type === 'Aura' ? AURA_SHOP : (type === 'Border' ? BORDER_SHOP : BACKGROUND_SHOP))[id];
            boardFlashMessage = `${info?.name || type} 장착 완료`;
            boardFlashType = 'success';
            renderBoard(container);
        }
    });

    // Unequip Actions
    ['aura', 'border', 'bg'].forEach(t => {
        const btn = document.getElementById(`btn-unequip-${t}`);
        if(btn) btn.onclick = async () => {
            const type = t === 'bg' ? 'Background' : (t.charAt(0).toUpperCase() + t.slice(1));
            await updateDoc(doc(db, "users", UserState.user.uid), { [`active${type}`]: 'NONE' });
            UserState.data[`active${type}`] = 'NONE';
            updateProfileCache(UserState.user.uid, { [`active${type}`]: 'NONE' });
            boardFlashMessage = `${type === 'Aura' ? '오라' : type === 'Border' ? '테두리' : '배경'}를 해제했습니다.`;
            boardFlashType = 'info';
            renderBoard(container);
        };
    });

    // Submit Post
    const submitBtn = document.getElementById('submit-post');
    const contentInput = document.getElementById('post-content');
    const premiumCheck = document.getElementById('post-premium');
    const categorySelect = document.getElementById('post-category-select');

    if (!UserState.user) {
        contentInput.disabled = true; submitBtn.disabled = true;
        contentInput.placeholder = "로그인 후 이용 가능합니다.";
    }

    submitBtn.onclick = async () => {
        if (!UserState.user) return setPostFeedback("로그인이 필요합니다.", 'error');
        const now = Date.now();
        const lastPost = sessionStorage.getItem('lastPostTime');
        if (lastPost && now - parseInt(lastPost) < 15000) return setPostFeedback("15초 후에 다시 작성 가능합니다.", 'error');

        const content = contentInput.value.trim();
        if (!content && !selectedImageFile) return setPostFeedback("내용을 입력해주세요.", 'error');
        let isPremium = premiumCheck.checked;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = '등록 중...';
            setPostFeedback('게시글을 등록하고 있습니다...', 'loading');
            let imageUrl = null;
            
            // 이미지 업로드 대기
            if (selectedImageFile) {
                const storageRef = ref(storage, `posts/${UserState.user.uid}_${now}_${selectedImageFile.name}`);
                await uploadBytes(storageRef, selectedImageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            // [버그수정] 결제는 이미지 업로드 성공 후 마지막에 수행하여 포인트 증발 방지
            if (isPremium && !(await usePoints(300, "게시글 강조"))) {
                submitBtn.disabled = false;
                submitBtn.textContent = '등록하기';
                setPostFeedback('강조글 포인트가 부족합니다.', 'error');
                return;
            }

            await addDoc(collection(db, "posts"), {
                uid: UserState.user.uid,
                content,
                imageUrl,
                isPremium,
                category: categorySelect.value,
                likedBy: [],
                reactions: {},
                reports: [],
                searchContent: content.toLowerCase(),
                likeCount: 0,
                createdAt: serverTimestamp()
            });

            // 작성 글 횟수 추가
            await updateDoc(doc(db, "users", UserState.user.uid), {
                postCount: increment(1)
            });

            sessionStorage.setItem('lastPostTime', now.toString());
            await addPoints(10, '게시글 작성 보상');
            contentInput.value = ''; premiumCheck.checked = false;
            selectedImageFile = null; imageInput.value = ''; imagePreview.style.display = 'none';
            setPostFeedback('게시글이 등록되었습니다. +10P 지급 완료', 'success');
            lastVisiblePost = null; loadPosts(listContainer, false);
        } catch (e) {
            setPostFeedback("등록에 실패했습니다. 잠시 후 다시 시도해 주세요.", 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '등록하기';
        }
    };
}

async function loadBestPosts() {
    const bestList = document.getElementById('best-posts-list');
    const section = document.getElementById('best-posts-section');
    if(!bestList) return;
    try {
        const q = query(collection(db, "posts"), orderBy("likeCount", "desc"), limit(5));
        const snap = await withTimeout(getDocs(q), 8000);
        if(snap.empty) return;
        section.style.display = 'block';
        bestList.innerHTML = '';
        for(const d of snap.docs) {
            const data = d.data();
            const profile = await fetchUserProfile(data.uid);
            const div = document.createElement('div');
            div.className = 'best-post-mini fade-in';
            div.innerHTML = `
                <div class="best-post-topline">
                    <span class="post-category-badge ${CATEGORIES[data.category]?.class || 'cat-free'}">${CATEGORIES[data.category]?.name || '자유'}</span>
                    <span>❤️ ${data.likeCount || 0}</span>
                </div>
                <div class="best-post-copy">${escapeHTML(data.content || '')}</div>
                <div class="best-post-meta">
                    <span>${profile.nickname}</span>
                    <span>${profile.emoji || '👤'}</span>
                </div>
            `;
            bestList.appendChild(div);
        }
    } catch(e) {
        console.warn('Best posts skipped:', e);
    }
}

async function loadPosts(container, isLoadMore = false) {
    if(isLoadingMore) return;
    if (!isLoadMore) {
        container.innerHTML = `<div class="loading-spinner">불러오는 중...</div>`;
        if(postUnsubscribe) postUnsubscribe();
    }
    isLoadingMore = true;

    try {
        const snap = await getPostsSnapshotWithFallback(isLoadMore);
        
        if (snap.empty) { 
            if (!isLoadMore) container.innerHTML = `<p class="text-sub" style="text-align:center; padding:3rem;">게시글이 없습니다.</p>`; 
            isLoadingMore = false; return; 
        }

        if (!isLoadMore) container.innerHTML = '';
        lastVisiblePost = snap.docs[snap.docs.length - 1];
        
        // --- 클라이언트 사이드 정밀 정렬 및 필터링 ---
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 1. 필터링 (검색어 & 카테고리)
        if (currentSearch) {
            docs = docs.filter(d => d.searchContent?.includes(currentSearch));
        }
        if (currentCategory !== 'ALL') {
            docs = docs.filter(d => d.category === currentCategory);
        }

        // 2. 최종 정렬 로직
        docs.sort((a, b) => {
            // 인기순일 경우
            if (currentSort === 'popular') {
                if (a.likeCount !== b.likeCount) return b.likeCount - a.likeCount;
            } 
            
            // 최신순일 경우 또는 인기순 내에서 같은 좋아요 수일 때
            // 프리미엄 게시글(강조)을 최상단에 고정
            const aPremium = !!a.isPremium;
            const bPremium = !!b.isPremium;
            if (aPremium !== bPremium) return aPremium ? -1 : 1;

            // 시간순 정렬 (createdAt이 null이면 '방금 전'이므로 가장 최신으로 취급)
            const getTime = (t) => {
                if (!t) return Date.now();
                if (typeof t.toMillis === 'function') return t.toMillis();
                if (t.seconds) return t.seconds * 1000;
                if (t instanceof Date) return t.getTime();
                if (typeof t === 'number') return t;
                return Date.now();
            };
            const timeA = getTime(a.createdAt);
            const timeB = getTime(b.createdAt);
            return timeB - timeA;
        });

        let displayCount = 0;
        
        // 전체 탭에서 프로필 조회가 길어져 첫 화면이 멈추는 문제를 막기 위해
        // 각 프로필 조회에 짧은 타임아웃을 두고 실패 시 기본 프로필로 폴백합니다.
        const profileResults = await Promise.allSettled(
            docs.map((d) => withTimeout(fetchUserProfile(d.uid), 1500))
        );
        
        for (let i = 0; i < docs.length; i++) {
            const docData = docs[i];
            const profile = profileResults[i]?.status === 'fulfilled'
                ? profileResults[i].value
                : { nickname: "익명", emoji: "👤" };
            renderSinglePostSync(container, docData.id, docData, profile);
            displayCount++;
        }
        
        if (!isLoadMore && displayCount === 0) {
            container.innerHTML = `<p class="text-sub" style="text-align:center; padding:3rem;">조건에 맞는 게시글이 없습니다.</p>`;
        }
    } catch (e) { 
        console.error("게시물 로드 에러:", e);
        if (!isLoadMore) {
            container.innerHTML = `<p style="text-align:center; padding:2rem; color:#ef4444;">데이터를 불러오는 중 오류가 발생했습니다.</p>`;
        }
    }
    finally { isLoadingMore = false; }
}

function renderSinglePostSync(container, postId, data, profile) {
    const getMillis = (t) => t ? (typeof t.toMillis === 'function' ? t.toMillis() : (t.seconds ? t.seconds * 1000 : (t instanceof Date ? t.getTime() : (typeof t === 'number' ? t : Date.now())))) : null;
    const ms = getMillis(data.createdAt);
    const date = ms ? new Date(ms).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "방금 전";
    
    let auraClass = (profile.activeAura && profile.activeAura !== 'NONE') ? AURA_SHOP[profile.activeAura]?.class || '' : '';
    let borderClass = (profile.activeBorder && profile.activeBorder !== 'NONE') ? BORDER_SHOP[profile.activeBorder]?.class || '' : '';
    let bgClass = (profile.activeBackground && profile.activeBackground !== 'NONE') ? BACKGROUND_SHOP[profile.activeBackground]?.class || '' : '';

    const postEl = document.createElement('div');
    postEl.className = `post-item ${data.isPremium ? 'premium-post' : ''} ${auraClass} ${bgClass} fade-in`;
    
    const likedBy = data.likedBy || [];
    const isLiked = UserState.user && likedBy.includes(UserState.user.uid);
    const reactions = data.reactions || {};

    postEl.innerHTML = `
        <div class="post-header">
            <div class="post-author-info" style="cursor:pointer;" onclick="showProfileModal('${data.uid}')">
                <div class="author-emoji-circle ${borderClass}">${profile.emoji || '👤'}</div>
                <div style="display:flex; flex-direction:column;">
                    <span class="post-author" style="color:${profile.nameColor || 'inherit'}">${profile.nickname}</span>
                    <span class="post-date">${date}</span>
                </div>
            </div>
            <div class="post-header-tools">
                <span class="post-category-badge ${CATEGORIES[data.category]?.class || 'cat-free'}">${CATEGORIES[data.category]?.name || '자유'}</span>
                <button class="btn-report-post" data-id="${postId}" style="background:none; border:none; opacity:0.3; cursor:pointer;">🚨</button>
            </div>
        </div>
        <div class="post-content">${escapeHTML(data.content || '')}</div>
        ${data.imageUrl ? `<div class="post-image-frame"><img src="${data.imageUrl}" style="max-width:100%; border-radius:16px; cursor:pointer;" onclick="window.open('${data.imageUrl}', '_blank')"></div>` : ''}
        
        <div class="reaction-bar">
            ${REACTION_TYPES.map(r => {
                const count = (reactions[r.emoji] || []).length;
                const isReacted = UserState.user && (reactions[r.emoji] || []).includes(UserState.user.uid);
                return `<button class="reaction-btn ${isReacted ? 'reacted' : ''}" data-post="${postId}" data-emoji="${r.emoji}" onclick="handlePostReaction('${postId}', '${r.emoji}')">
                    <span>${r.emoji}</span> <span class="reaction-count">${count || ''}</span>
                </button>`;
            }).join('')}
        </div>

        <div class="post-footer">
            <button class="btn-toggle-comments" onclick="toggleComments('${postId}', '${data.uid}')">💬 댓글</button>
            <div class="post-footer-tools">
                ${UserState.isAdmin ? `
                <select onchange="changePostCategory('${postId}', this.value)" style="padding:0.2rem 0.5rem; font-size:0.7rem; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main); cursor:pointer;">
                    ${Object.keys(CATEGORIES).filter(k => k !== 'ALL').map(k => `<option value="${k}" ${data.category === k ? 'selected' : ''}>${CATEGORIES[k].name}로 이동</option>`).join('')}
                </select>
                ` : ''}
                ${(UserState.user && (data.uid === UserState.user.uid || UserState.isAdmin)) ? `<button class="btn-delete" data-post-id="${postId}" onclick="deletePost('${postId}')">삭제</button>` : ''}
            </div>
        </div>
        <div id="post-feedback-${postId}" class="post-inline-feedback" style="display:none;"></div>
        <div id="comment-section-${postId}" class="comment-section" style="display:none;">
            <div id="comments-list-${postId}" class="comments-list"></div>
            <div class="comment-form">
                <input type="text" id="comment-input-${postId}" placeholder="댓글 입력... (+2P)" maxlength="100">
                <button class="btn-submit-comment" onclick="submitComment('${postId}', '${data.uid}')">작성</button>
            </div>
        </div>
    `;
    container.appendChild(postEl);
}

function setPostFeedback(postId, message, type = 'info') {
    const el = document.getElementById(`post-feedback-${postId}`);
    if (!el) return;
    el.textContent = message;
    el.className = `post-inline-feedback ${type}`;
    el.style.display = message ? 'block' : 'none';
}

window.changePostCategory = async (postId, newCategory) => {
    if (!UserState.isAdmin) return setPostFeedback(postId, "권한이 없습니다.", 'error');
    try {
        await updateDoc(doc(db, "posts", postId), { category: newCategory });
        
        // 화면 리프레시 없이 UI 즉각 반영 (DOM 국소 조작)
        const badge = document.querySelector(`.btn-report-post[data-id="${postId}"]`).previousElementSibling;
        if(badge) {
            badge.className = `post-category-badge ${CATEGORIES[newCategory]?.class || 'cat-free'}`;
            badge.textContent = CATEGORIES[newCategory]?.name || '자유';
        }
        setPostFeedback(postId, `${CATEGORIES[newCategory]?.name || '자유'} 카테고리로 이동했습니다.`, 'success');
    } catch(e) { 
        console.error(e);
        setPostFeedback(postId, "이동 중 오류가 발생했습니다.", 'error'); 
    }
};

window.showProfileModal = async (uid) => {
    const overlay = document.getElementById('profile-modal-overlay');
    const profile = await fetchUserProfile(uid);
    const tier = getTier(profile.totalScore || 0);
    const isMasterUser = profile.isMaster;

    const modal = overlay.querySelector('.profile-card-modal');
    const avatarEl = document.getElementById('pm-avatar');
    const statsContainer = overlay.querySelector('.profile-card-stats');
    const editBioBtn = document.getElementById('btn-edit-bio');
    const bioEditor = document.getElementById('pm-bio-editor');
    const bioInput = document.getElementById('pm-bio-input');
    const bioSaveBtn = document.getElementById('pm-bio-save');
    const bioCancelBtn = document.getElementById('pm-bio-cancel');
    const modalFeedback = document.getElementById('pm-feedback');

    const setModalFeedback = (message, type = 'info') => {
        if (!modalFeedback) return;
        modalFeedback.textContent = message;
        modalFeedback.className = `profile-modal-feedback ${type}`;
        modalFeedback.style.display = message ? 'block' : 'none';
    };

    // 스킨 효과 적용
    const auraClass = (profile.activeAura && profile.activeAura !== 'NONE') ? AURA_SHOP[profile.activeAura]?.class || '' : '';
    const borderClass = (profile.activeBorder && profile.activeBorder !== 'NONE') ? BORDER_SHOP[profile.activeBorder]?.class || '' : '';
    const bgClass = (profile.activeBackground && profile.activeBackground !== 'NONE') ? BACKGROUND_SHOP[profile.activeBackground]?.class || '' : '';

    modal.className = `profile-card-modal ${bgClass}`;
    avatarEl.className = `profile-card-avatar ${borderClass} ${auraClass}`;
    
    document.getElementById('pm-avatar').textContent = profile.emoji || '👤';
    document.getElementById('pm-nickname').textContent = (isMasterUser ? '💎 ' : '') + profile.nickname;
    document.getElementById('pm-nickname').style.color = profile.nameColor || 'inherit';
    document.getElementById('pm-tier').textContent = isMasterUser ? 'MASTER' : tier.name;
    document.getElementById('pm-bio').textContent = profile.bio || "작성된 자기소개가 없습니다.";

    // 마스터인 경우 통계 숨기기
    if (isMasterUser) {
        statsContainer.style.display = 'none';
    } else {
        statsContainer.style.display = 'grid';
        document.getElementById('pm-points').textContent = (profile.points || 0).toLocaleString();
        document.getElementById('pm-score').textContent = (profile.totalScore || 0).toLocaleString();
        document.getElementById('pm-items').textContent = (profile.inventory || []).length;
        
        // 랭킹 표시 (비동기 로드)
        const rankEl = document.getElementById('pm-rank');
        rankEl.textContent = "Loading...";
        fetchUserRank(uid).then(rank => {
            rankEl.textContent = typeof rank === 'number' ? `${rank}위` : rank;
        });
    }
    
    // 자기소개 수정 버튼 처리 (본인인 경우만 표시)
    if (UserState.user && UserState.user.uid === uid) {
        editBioBtn.style.display = 'block';
        bioInput.value = profile.bio || '';
        bioEditor.style.display = 'none';
        setModalFeedback('', 'info');
        editBioBtn.onclick = async () => {
            bioEditor.style.display = 'grid';
            bioInput.value = profile.bio || '';
            bioInput.focus();
            setModalFeedback('', 'info');
        };
        bioCancelBtn.onclick = () => {
            bioEditor.style.display = 'none';
            bioInput.value = profile.bio || '';
            setModalFeedback('', 'info');
        };
        bioSaveBtn.onclick = async () => {
            const newBio = bioInput.value.trim();
            if (newBio.length > 50) return setModalFeedback("자기소개는 50자 이내로 작성해주세요.", 'error');
            try {
                bioSaveBtn.disabled = true;
                setModalFeedback("자기소개를 저장하고 있습니다...", 'info');
                await updateDoc(doc(db, "users", uid), { bio: newBio });
                profile.bio = newBio;
                if (UserState.user.uid === uid) UserState.data.bio = newBio;
                updateProfileCache(uid, { bio: newBio });
                document.getElementById('pm-bio').textContent = newBio || "작성된 자기소개가 없습니다.";
                bioEditor.style.display = 'none';
                setModalFeedback("자기소개가 수정되었습니다.", 'success');
            } catch (e) {
                setModalFeedback("자기소개 수정에 실패했습니다.", 'error');
            } finally {
                bioSaveBtn.disabled = false;
            }
        };
    } else {
        editBioBtn.style.display = 'none';
        bioEditor.style.display = 'none';
        setModalFeedback('', 'info');
    }

    overlay.style.display = 'flex';
};

window.handlePostReaction = async (postId, emoji) => {
    if (!UserState.user) return setPostFeedback(postId, "로그인이 필요합니다.", 'error');
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return setPostFeedback(postId, "존재하지 않는 게시글입니다.", 'error');
    
    const data = postSnap.data();
    const reactions = data.reactions || {};
    const userList = reactions[emoji] || [];
    const isReacted = userList.includes(UserState.user.uid);

    if (isReacted) {
        await updateDoc(postRef, { [`reactions.${emoji}`]: arrayRemove(UserState.user.uid) });
        setPostFeedback(postId, `${emoji} 반응을 취소했습니다.`, 'info');
    } else {
        if (!(await usePoints(5, "반응 남기기"))) return setPostFeedback(postId, "포인트가 부족해 반응을 남길 수 없습니다.", 'error');
        await updateDoc(postRef, { [`reactions.${emoji}`]: arrayUnion(UserState.user.uid) });
        // Award 1P to author (자기 자신에게는 보상하지 않음)
        if (data.uid !== UserState.user.uid) {
            await updateDoc(doc(db, "users", data.uid), { points: increment(1) });
        }
        setPostFeedback(postId, `${emoji} 반응을 남겼습니다. -5P`, 'success');
    }
    
    // [버그수정] 전체 보드 리렌더링으로 인한 스크롤 초기화 방지
    // 해당 게시물의 반응 버튼 UI만 부분적으로 업데이트
    const reactionBtn = document.querySelector(`.reaction-btn[data-post="${postId}"][data-emoji="${emoji}"]`);
    if (reactionBtn) {
        const countEl = reactionBtn.querySelector('.reaction-count');
        let currentCount = parseInt(countEl.textContent || '0');
        if (isReacted) {
            reactionBtn.classList.remove('reacted');
            countEl.textContent = Math.max(0, currentCount - 1) || '';
        } else {
            reactionBtn.classList.add('reacted');
            countEl.textContent = currentCount + 1;
        }
    }
};

window.toggleComments = async (postId, authorUid) => {
    const sec = document.getElementById(`comment-section-${postId}`);
    const isOpen = sec.style.display === 'block';
    sec.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) loadComments(postId);
};

window.submitComment = async (postId, authorUid) => {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!UserState.user) return setPostFeedback(postId, "로그인이 필요합니다.", 'error');
    if (!content) return setPostFeedback(postId, "댓글 내용을 입력해주세요.", 'error');
    try {
        await addDoc(collection(db, "posts", postId, "comments"), {
            uid: UserState.user.uid, content, createdAt: serverTimestamp()
        });
        await addPoints(2, '댓글 작성 보상');
        input.value = '';
        loadComments(postId);
        setPostFeedback(postId, "댓글이 등록되었습니다. +2P", 'success');
    } catch(e) {
        setPostFeedback(postId, "댓글 등록에 실패했습니다.", 'error');
    }
};

window.deletePost = async (postId) => {
    const btn = document.querySelector(`.btn-delete[data-post-id="${postId}"]`);
    if (btn && btn.dataset.confirming !== 'true') {
        btn.dataset.confirming = 'true';
        btn.textContent = '한 번 더 누르면 삭제';
        setPostFeedback(postId, "삭제하려면 버튼을 한 번 더 누르세요.", 'warning');
        setTimeout(() => {
            const currentBtn = document.querySelector(`.btn-delete[data-post-id="${postId}"]`);
            if (currentBtn && currentBtn.dataset.confirming === 'true') {
                currentBtn.dataset.confirming = 'false';
                currentBtn.textContent = '삭제';
                setPostFeedback(postId, '', 'info');
            }
        }, 2500);
        return;
    }

    try {
        await deleteDoc(doc(db, "posts", postId));
        if (btn) {
            btn.closest('.post-item').remove();
        } else {
            renderBoard(document.querySelector('.board-container').parentElement);
        }
    } catch (e) {
        setPostFeedback(postId, "삭제 중 오류가 발생했습니다.", 'error');
    }
};

async function loadComments(postId) {
    const list = document.getElementById(`comments-list-${postId}`);
    const snap = await getDocs(query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc")));
    list.innerHTML = snap.empty ? '<p style="font-size:0.7rem; color:var(--text-sub);">첫 댓글을 남겨보세요!</p>' : '';
    for(const d of snap.docs) {
        const c = d.data();
        const profile = await fetchUserProfile(c.uid);
        const div = document.createElement('div');
        div.className = 'comment-item';
        const getMillis = (t) => t ? (typeof t.toMillis === 'function' ? t.toMillis() : (t.seconds ? t.seconds * 1000 : (t instanceof Date ? t.getTime() : (typeof t === 'number' ? t : Date.now())))) : null;
        const ms = getMillis(c.createdAt);
        const cDate = ms ? new Date(ms).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "방금 전";
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:800; font-size:0.75rem; color:${profile.nameColor || 'inherit'}">${profile.nickname}</span>
                <span style="font-size:0.6rem; color:var(--text-sub);">${cDate}</span>
            </div>
            <p style="font-size:0.8rem; margin-top:2px;">${escapeHTML(c.content)}</p>
        `;
        list.appendChild(div);
    }
}
