import { db } from './firebase-init.js';
import { UserState, usePoints, addPoints, getTier, fetchUserProfile, updateProfileCache } from './auth.js';
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
    getCountFromServer,
    increment,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export const AURA_SHOP = {
    'PLATINUM': { name: '플래티넘 오라', price: 5000, minScore: 5000000, class: 'aura-platinum' },
    'DIAMOND': { name: '다이아몬드 오라', price: 15000, minScore: 10000000, class: 'aura-diamond' }
};

export const BORDER_SHOP = {
    'B_RED': { name: '레드 보더', price: 1000, minScore: 0, class: 'border-red' },
    'B_BLUE': { name: '블루 보더', price: 1000, minScore: 0, class: 'border-blue' },
    'B_GREEN': { name: '그린 보더', price: 1000, minScore: 0, class: 'border-green' },
    'B_YELLOW': { name: '옐로우 보더', price: 1000, minScore: 0, class: 'border-yellow' },
    'B_PURPLE': { name: '퍼플 보더', price: 1000, minScore: 0, class: 'border-purple' },
    'B_PINK': { name: '핑크 보더', price: 1000, minScore: 0, class: 'border-pink' },
    'B_ORANGE': { name: '오렌지 보더', price: 1000, minScore: 0, class: 'border-orange' },
    'B_CYAN': { name: '시안 보더', price: 1000, minScore: 0, class: 'border-cyan' },
    'B_GRAY': { name: '그레이 보더', price: 1000, minScore: 0, class: 'border-gray' },
    'B_BLACK': { name: '블랙 보더', price: 1000, minScore: 0, class: 'border-black' },
    // 스페셜 3종 (점수 + 포인트)
    'S_LEGEND': { name: '🔱 전설의 증표', price: 30000, minScore: 5000000, class: 'border-s-legend' },
    'S_GALAXY': { name: '🌌 은하의 파동', price: 50000, minScore: 8000000, class: 'border-s-galaxy' },
    'S_GOD': { name: '💎 신의 광채', price: 100000, minScore: 15000000, class: 'border-s-god' }
};

export const BACKGROUND_SHOP = {
    'BG_SOFT_RED': { name: '소프트 레드', price: 1500, minScore: 0, class: 'bg-soft-red' },
    'BG_SOFT_BLUE': { name: '소프트 블루', price: 1500, minScore: 0, class: 'bg-soft-blue' },
    'BG_SOFT_GREEN': { name: '소프트 그린', price: 1500, minScore: 0, class: 'bg-soft-green' },
    'BG_SOFT_YELLOW': { name: '소프트 옐로우', price: 1500, minScore: 0, class: 'bg-soft-yellow' },
    'BG_SOFT_PURPLE': { name: '소프트 퍼플', price: 1500, minScore: 0, class: 'bg-soft-purple' },
    'BG_SOFT_PINK': { name: '소프트 핑크', price: 1500, minScore: 0, class: 'bg-soft-pink' },
    'BG_DARK_GRAY': { name: '다크 그레이', price: 1500, minScore: 0, class: 'bg-dark-gray' },
    'BG_MINT': { name: '민트 프레쉬', price: 1500, minScore: 0, class: 'bg-mint' },
    'BG_SKY': { name: '스카이 블루', price: 1500, minScore: 0, class: 'bg-sky' },
    'BG_SAND': { name: '샌드 베이지', price: 1500, minScore: 0, class: 'bg-sand' },
    // 스페셜 3종 (점수 + 포인트)
    'SBG_NEON': { name: '🎮 사이버 네온', price: 25000, minScore: 4000000, class: 'bg-s-neon' },
    'SBG_SPACE': { name: '🚀 심우주 탐사', price: 45000, minScore: 7000000, class: 'bg-s-space' },
    'SBG_PARADISE': { name: '🏝️ 무릉도원', price: 80000, minScore: 12000000, class: 'bg-s-paradise' }
};

export async function renderBoard(container) {
    container.innerHTML = `
        <div class="card board-container fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
                <h2>💬 자유 게시판</h2>
                <div style="display:flex; gap:0.5rem;">
                    <button id="btn-aura-shop" class="btn-secondary" style="width:auto; padding:0.5rem 0.8rem; font-size:0.75rem; border-color:var(--accent-color); color:var(--accent-color);">✨ 오라</button>
                    <button id="btn-border-shop" class="btn-secondary" style="width:auto; padding:0.5rem 0.8rem; font-size:0.75rem; border-color:var(--color-face); color:var(--color-face);">🖼️ 테두리</button>
                    <button id="btn-bg-shop" class="btn-secondary" style="width:auto; padding:0.5rem 0.8rem; font-size:0.75rem; border-color:var(--color-fortune); color:var(--color-fortune);">🎨 배경</button>
                </div>
            </div>

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
            
            <div id="post-form" class="post-form">
                <textarea id="post-content" placeholder="함께 나누고 싶은 이야기를 적어보세요." maxlength="200"></textarea>
                <div class="post-options" style="display:flex; align-items:center; gap:1rem; margin-top:0.5rem;">
                    <label style="font-size:0.85rem; cursor:pointer;">
                        <input type="checkbox" id="post-premium"> 📣 게시글 강조 (300P)
                    </label>
                    <button id="submit-post" class="btn-primary" style="width:100px; margin-left:auto;">등록</button>
                </div>
            </div>

            <div id="posts-list" class="posts-list">
                <div class="loading-spinner">불러오는 중...</div>
            </div>
        </div>
    `;

    function renderShopItems(shopData, type) {
        const unlockedKey = `unlocked${type}s`;
        const activeKey = `active${type}`;
        
        return Object.entries(shopData).map(([id, info]) => {
            const isOwned = UserState.data?.[unlockedKey]?.includes(id);
            const isActive = UserState.data?.[activeKey] === id;
            const previewStyle = type === 'Background' ? `background:var(--bg-color); border:1px solid var(--border-color);` : '';
            
            return `
                <div class="buy-card ${info.class}" style="background:var(--card-bg); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border-color); ${previewStyle}">
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

    // --- Event Bindings ---
    const listContainer = document.getElementById('posts-list');
    loadPosts(listContainer);

    const toggleShop = (shopId) => {
        document.querySelectorAll('.shop-panel').forEach(p => {
            if (p.id === shopId) p.style.display = p.style.display === 'none' ? 'block' : 'none';
            else p.style.display = 'none';
        });
    };

    document.getElementById('btn-aura-shop').onclick = () => toggleShop('aura-shop-ui');
    document.getElementById('btn-border-shop').onclick = () => toggleShop('border-shop-ui');
    document.getElementById('btn-bg-shop').onclick = () => toggleShop('bg-shop-ui');
    
    container.querySelectorAll('.close-shop').forEach(btn => {
        btn.onclick = () => document.getElementById(btn.dataset.target).style.display = 'none';
    });

    // 구매 및 장착 통합 처리
    container.addEventListener('click', async (e) => {
        const buyBtn = e.target.closest('.btn-buy-item');
        const equipBtn = e.target.closest('.btn-equip-item');
        
        if (buyBtn) {
            const { type, id } = buyBtn.dataset;
            const shop = type === 'Aura' ? AURA_SHOP : (type === 'Border' ? BORDER_SHOP : BACKGROUND_SHOP);
            const info = shop[id];
            const unlockedKey = `unlocked${type}s`;
            const activeKey = `active${type}`;

            if (UserState.data.totalScore < info.minScore) return alert(`아이템 점수가 부족합니다. (필요: ${info.minScore.toLocaleString()}점)`);
            if (await usePoints(info.price, `${type} 구매: ${info.name}`)) {
                const updateObj = {
                    [unlockedKey]: arrayUnion(id),
                    [activeKey]: id
                };
                await updateDoc(doc(db, "users", UserState.user.uid), updateObj);
                UserState.data[unlockedKey].push(id);
                UserState.data[activeKey] = id;
                
                // 캐시 업데이트
                updateProfileCache(UserState.user.uid, { [activeKey]: id });

                alert(`${info.name} 구매 및 장착 완료!`);
                renderBoard(container);
            }
        }

        if (equipBtn) {
            const { type, id } = equipBtn.dataset;
            const activeKey = `active${type}`;
            await updateDoc(doc(db, "users", UserState.user.uid), { [activeKey]: id });
            UserState.data[activeKey] = id;
            
            // 캐시 업데이트
            updateProfileCache(UserState.user.uid, { [activeKey]: id });

            renderBoard(container);
        }
    });

    const unequipIds = { 'btn-unequip-aura': 'Aura', 'btn-unequip-border': 'Border', 'btn-unequip-bg': 'Background' };
    Object.entries(unequipIds).forEach(([btnId, type]) => {
        document.getElementById(btnId).onclick = async () => {
            const activeKey = `active${type}`;
            await updateDoc(doc(db, "users", UserState.user.uid), { [activeKey]: 'NONE' });
            UserState.data[activeKey] = 'NONE';
            
            // 캐시 업데이트
            updateProfileCache(UserState.user.uid, { [activeKey]: 'NONE' });

            renderBoard(container);
        };
    });

    const submitBtn = document.getElementById('submit-post');
    const contentInput = document.getElementById('post-content');
    const premiumCheck = document.getElementById('post-premium');

    if (!UserState.user) {
        contentInput.disabled = true; submitBtn.disabled = true;
        contentInput.placeholder = "로그인 후 이용 가능합니다.";
    }

    submitBtn.onclick = async () => {
        if (!UserState.user) return alert("로그인이 필요합니다.");
        const content = contentInput.value.trim();
        if (!content) return alert("내용을 입력해주세요.");
        let isPremium = premiumCheck.checked;
        if (isPremium && !(await usePoints(300, "게시글 강조"))) return;

        try {
            submitBtn.disabled = true;
            await addDoc(collection(db, "posts"), {
                uid: UserState.user.uid,
                content: content,
                isPremium: isPremium,
                createdAt: serverTimestamp()
            });
            if (window.checkDailyQuests) window.checkDailyQuests('board'); 
            contentInput.value = ''; premiumCheck.checked = false;
            loadPosts(listContainer);
        } catch (e) { alert("등록 실패"); }
        finally { submitBtn.disabled = false; }
    };
}

async function loadPosts(container) {
    try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        if (snap.empty) { container.innerHTML = `<p class="text-sub" style="text-align:center; padding:3rem;">게시글이 없습니다.</p>`; return; }

        container.innerHTML = '';
        for (const docSnap of snap.docs) {
            const data = docSnap.data();
            const postId = docSnap.id;
            const date = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "방금 전";
            const canDelete = UserState.user && (data.uid === UserState.user.uid || UserState.isAdmin);
            
            // 실시간 프로필 정보 조회
            const profile = await fetchUserProfile(data.uid);

            const commentsRef = collection(db, "posts", postId, "comments");
            const countSnap = await getCountFromServer(commentsRef);
            const commentCount = countSnap.data().count;

            let auraClass = (profile.activeAura && profile.activeAura !== 'NONE') ? AURA_SHOP[profile.activeAura]?.class || '' : '';
            let borderClass = (profile.activeBorder && profile.activeBorder !== 'NONE') ? BORDER_SHOP[profile.activeBorder]?.class || '' : '';
            let bgClass = (profile.activeBackground && profile.activeBackground !== 'NONE') ? BACKGROUND_SHOP[profile.activeBackground]?.class || '' : '';

            const postEl = document.createElement('div');
            postEl.className = `post-item ${data.isPremium ? 'premium-post' : ''} ${auraClass} ${bgClass} fade-in`;
            
            const likedBy = data.likedBy || [];
            const likeCount = likedBy.length;
            const isLiked = UserState.user && likedBy.includes(UserState.user.uid);

            postEl.innerHTML = `
                <div class="post-header">
                    <div class="post-author-info">
                        <div class="author-emoji-circle ${borderClass}">${profile.emoji || '👤'}</div>
                        <span class="post-author" style="color:${profile.nameColor || 'var(--text-main)'}">${profile.nickname}</span>
                    </div>
                    <span class="post-date">${date}</span>
                </div>
                <div class="post-content">${data.content}</div>
                <div class="post-footer">
                    <div style="display:flex; gap:1rem; align-items:center;">
                        <button class="btn-like-post ${isLiked ? 'liked' : ''}" data-id="${postId}" data-uid="${data.uid}" style="background:none; border:none; color:${isLiked ? '#ef4444' : 'var(--text-sub)'}; font-size:0.85rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px;">
                            ${isLiked ? '❤️' : '🤍'} 좋아요 <b>${likeCount > 0 ? likeCount : ''}</b>
                        </button>
                        <button class="btn-toggle-comments" data-id="${postId}" style="background:none; border:none; color:var(--text-sub); font-size:0.85rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px;">
                            💬 댓글 ${commentCount > 0 ? `<b>(${commentCount})</b>` : ''}
                        </button>
                    </div>
                    ${canDelete ? `<button class="btn-delete" data-id="${postId}">삭제</button>` : ''}
                </div>
                <div id="comment-section-${postId}" class="comment-section" style="display:none;">
                    <div id="comments-list-${postId}" class="comments-list"></div>
                    <div class="comment-form">
                        <input type="text" id="comment-input-${postId}" placeholder="댓글을 입력하세요..." maxlength="100">
                        <button class="btn-submit-comment" data-id="${postId}">작성</button>
                    </div>
                </div>
            `;
            container.appendChild(postEl);

            // 이벤트 바인딩
            postEl.querySelector('.btn-like-post').onclick = () => handlePostLike(postId, data.uid, postEl);
            
            postEl.querySelector('.btn-delete')?.addEventListener('click', async () => {
                if (confirm("삭제하시겠습니까?")) {
                    await deleteDoc(doc(db, "posts", postId));
                    loadPosts(container);
                }
            });

            postEl.querySelector('.btn-toggle-comments').onclick = () => {
                const sec = postEl.querySelector(`#comment-section-${postId}`);
                const isOpen = sec.style.display === 'block';
                sec.style.display = isOpen ? 'none' : 'block';
                if (!isOpen) loadComments(postId, data.uid);
            };

            const submitCommentBtn = postEl.querySelector('.btn-submit-comment');
            submitCommentBtn.onclick = async () => {
                const cInput = postEl.querySelector(`#comment-input-${postId}`);
                const content = cInput.value.trim();
                if (!content || !UserState.user) return;
                try {
                    submitCommentBtn.disabled = true;
                    await addDoc(collection(db, "posts", postId, "comments"), {
                        uid: UserState.user.uid,
                        content, createdAt: serverTimestamp()
                    });
                    cInput.value = ''; loadComments(postId, data.uid);
                    if (data.uid !== UserState.user.uid) {
                        await addDoc(collection(db, "users", data.uid, "notifications"), {
                            type: "comment", message: `"${UserState.data.nickname}"님이 내 글에 댓글을 남겼습니다.`,
                            relatedId: postId, isRead: false, createdAt: serverTimestamp()
                        });
                    }
                } catch (e) { alert("오류"); }
                finally { submitCommentBtn.disabled = false; }
            };
        }
    } catch (e) { console.error(e); container.innerHTML = `<p class="error-msg">로드 오류</p>`; }
}

async function handlePostLike(postId, authorUid, postEl) {
    if (!UserState.user) return alert("로그인이 필요합니다.");
    if (UserState.user.uid === authorUid) return alert("자신의 글에는 좋아요를 누를 수 없습니다.");

    const likeBtn = postEl.querySelector('.btn-like-post');
    if (likeBtn.classList.contains('liked')) return alert("이미 좋아요를 누르셨습니다.");

    try {
        likeBtn.disabled = true;
        const postRef = doc(db, "posts", postId);
        
        // 1. 중복 체크 (트랜잭션 대신 멱등성 보장하는 arrayUnion 사용)
        await updateDoc(postRef, {
            likedBy: arrayUnion(UserState.user.uid)
        });

        // 2. 포인트 지급 (누른 사람 +1P)
        await addPoints(1, "게시글 좋아요 보상 (Liker)");

        // 3. 포인트 지급 (받은 사람 +1P)
        const authorRef = doc(db, "users", authorUid);
        await updateDoc(authorRef, {
            points: increment(1)
        });

        // 4. 알림 전송
        await addDoc(collection(db, "users", authorUid, "notifications"), {
            type: "like",
            message: `"${UserState.data.nickname}"님이 내 글을 좋아합니다. (+1P)`,
            relatedId: postId,
            isRead: false,
            createdAt: serverTimestamp()
        });

        // 5. UI 업데이트
        const countSpan = likeBtn.querySelector('b');
        const currentCount = parseInt(countSpan.textContent || "0");
        countSpan.textContent = currentCount + 1;
        likeBtn.innerHTML = `❤️ 좋아요 <b>${currentCount + 1}</b>`;
        likeBtn.style.color = '#ef4444';
        likeBtn.classList.add('liked');

    } catch (e) {
        console.error("Like failed:", e);
        alert("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
        likeBtn.disabled = false;
    }
}

async function loadComments(postId, postAuthorUid) {
    const listContainer = document.getElementById(`comments-list-${postId}`);
    if (!listContainer) return;
    try {
        const snap = await getDocs(query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc")));
        if (snap.empty) { listContainer.innerHTML = '<p class="text-sub" style="font-size:0.7rem; padding:0.5rem;">첫 댓글을 남겨보세요!</p>'; return; }
        
        const commentHtmls = [];
        for (const dSnap of snap.docs) {
            const d = dSnap.data();
            const canDelete = UserState.user && (d.uid === UserState.user.uid || UserState.isAdmin);
            
            // 댓글 작성자 프로필 조회
            const profile = await fetchUserProfile(d.uid);
            
            commentHtmls.push(`
                <div class="comment-item">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:0.9rem;">${profile.emoji || '👤'}</span>
                        <span style="font-weight:800; font-size:0.75rem; color:${profile.nameColor || 'inherit'}">${profile.nickname}</span>
                        ${canDelete ? `<button class="btn-comment-delete" data-id="${dSnap.id}" style="background:none; border:none; color:#ef4444; font-size:0.65rem; cursor:pointer;">삭제</button>` : ''}
                    </div>
                    <p style="font-size:0.8rem; margin-top:2px;">${d.content}</p>
                </div>
            `);
        }
        listContainer.innerHTML = commentHtmls.join('');
        
        listContainer.querySelectorAll('.btn-comment-delete').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("삭제하시겠습니까?")) {
                    await deleteDoc(doc(db, "posts", postId, "comments", btn.dataset.id));
                    loadComments(postId, postAuthorUid);
                }
            };
        });
    } catch (e) {}
}
