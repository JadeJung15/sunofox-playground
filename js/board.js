import { db } from './firebase-init.js';
import { UserState, usePoints, getTier } from './auth.js';
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
    getCountFromServer
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const AURA_SHOP = {
    'PLATINUM': { name: '플래티넘 오라', price: 5000, minScore: 30000, class: 'aura-platinum' },
    'DIAMOND': { name: '다이아몬드 오라', price: 15000, minScore: 80000, class: 'aura-diamond' }
};

export async function renderBoard(container) {
    container.innerHTML = `
        <div class="card board-container fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                <h2>💬 자유 게시판</h2>
                <button id="btn-aura-shop" class="btn-secondary" style="width:auto; padding:0.5rem 1rem; font-size:0.8rem; border-color:var(--accent-color); color:var(--accent-color);">✨ 오라 상점</button>
            </div>

            <div id="aura-shop-ui" class="card" style="display:none; margin-bottom:2rem; background:rgba(99, 102, 241, 0.05); border:1px dashed var(--accent-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 style="font-size:1rem;">✨ 프로필 오라 상점</h3>
                    <button onclick="document.getElementById('aura-shop-ui').style.display='none'" style="background:none; border:none; cursor:pointer;">✕</button>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                    ${Object.entries(AURA_SHOP).map(([id, info]) => {
                        const isOwned = UserState.data?.unlockedAuras?.includes(id);
                        const isActive = UserState.data?.activeAura === id;
                        return `
                            <div class="aura-buy-card" style="background:var(--card-bg); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border-color);">
                                <div class="${info.class}" style="width:50px; height:50px; border-radius:50%; margin:0 auto 0.5rem; background:#eee; display:flex; align-items:center; justify-content:center;">👤</div>
                                <h4 style="font-size:0.9rem; margin-bottom:0.3rem;">${info.name}</h4>
                                <p style="font-size:0.75rem; color:var(--text-sub); margin-bottom:0.8rem;">${info.price.toLocaleString()}P<br>(필수: ${info.minScore.toLocaleString()}점)</p>
                                ${isOwned ? 
                                    `<button class="btn-equip-aura ${isActive ? 'active' : ''}" data-id="${id}" style="width:100%; padding:0.4rem; font-size:0.75rem; border-radius:6px; border:1px solid var(--accent-color); background:${isActive ? 'var(--accent-color)' : 'none'}; color:${isActive ? '#fff' : 'var(--accent-color)'}">${isActive ? '장착 중' : '장착하기'}</button>` :
                                    `<button class="btn-buy-aura" data-id="${id}" style="width:100%; padding:0.4rem; font-size:0.75rem; border-radius:6px; background:var(--text-main); color:#fff; border:none;">구매하기</button>`
                                }
                            </div>
                        `;
                    }).join('')}
                </div>
                <button id="btn-unequip-aura" class="btn-secondary" style="width:100%; margin-top:1rem; font-size:0.75rem; padding:0.5rem;">오라 해제하기</button>
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

    const submitBtn = document.getElementById('submit-post');
    const contentInput = document.getElementById('post-content');
    const premiumCheck = document.getElementById('post-premium');
    const listContainer = document.getElementById('posts-list');

    if (!UserState.user) {
        contentInput.disabled = true; submitBtn.disabled = true;
        contentInput.placeholder = "로그인 후 이용 가능합니다.";
    }

    loadPosts(listContainer);

    // 오라 상점 토글
    document.getElementById('btn-aura-shop').onclick = () => {
        const shop = document.getElementById('aura-shop-ui');
        shop.style.display = shop.style.display === 'none' ? 'block' : 'none';
    };

    // 오라 구매 이벤트
    container.querySelectorAll('.btn-buy-aura').forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            const info = AURA_SHOP[id];
            if (UserState.data.totalScore < info.minScore) return alert(`아이템 점수가 부족합니다. (필요: ${info.minScore.toLocaleString()}점)`);
            if (await usePoints(info.price, `오라 구매: ${info.name}`)) {
                await updateDoc(doc(db, "users", UserState.user.uid), {
                    unlockedAuras: arrayUnion(id),
                    activeAura: id
                });
                UserState.data.unlockedAuras.push(id);
                UserState.data.activeAura = id;
                alert(`${info.name} 구매 및 장착 완료!`);
                renderBoard(container);
            }
        };
    });

    // 오라 장착 이벤트
    container.querySelectorAll('.btn-equip-aura').forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            await updateDoc(doc(db, "users", UserState.user.uid), { activeAura: id });
            UserState.data.activeAura = id;
            renderBoard(container);
        };
    });

    // 오라 해제 이벤트
    document.getElementById('btn-unequip-aura').onclick = async () => {
        await updateDoc(doc(db, "users", UserState.user.uid), { activeAura: 'NONE' });
        UserState.data.activeAura = 'NONE';
        renderBoard(container);
    };

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
                author: UserState.data.nickname || "익명",
                authorEmoji: UserState.data.emoji || "👤",
                authorColor: UserState.data.nameColor || "#333",
                appliedAura: UserState.data.activeAura || 'NONE', // 현재 장착 중인 오라 저장
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
            
            const commentsRef = collection(db, "posts", postId, "comments");
            const countSnap = await getCountFromServer(commentsRef);
            const commentCount = countSnap.data().count;

            // 저장된 오라 효과 적용
            let auraClass = '';
            if (data.appliedAura === 'DIAMOND') auraClass = 'aura-diamond';
            else if (data.appliedAura === 'PLATINUM') auraClass = 'aura-platinum';

            const postEl = document.createElement('div');
            postEl.className = `post-item ${data.isPremium ? 'premium-post' : ''} ${auraClass} fade-in`;
            postEl.innerHTML = `
                <div class="post-header">
                    <div class="post-author-info">
                        <div class="author-emoji-circle">${data.authorEmoji || '👤'}</div>
                        <span class="post-author" style="color:${data.authorColor || 'var(--text-main)'}">${data.author}</span>
                    </div>
                    <span class="post-date">${date}</span>
                </div>
                <div class="post-content">${data.content}</div>
                <div class="post-footer">
                    <button class="btn-toggle-comments" data-id="${postId}">💬 댓글 ${commentCount > 0 ? `<b>(${commentCount})</b>` : ''}</button>
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
                        uid: UserState.user.uid, author: UserState.data.nickname, authorEmoji: UserState.data.emoji || "👤",
                        content, createdAt: serverTimestamp()
                    });
                    cInput.value = ''; loadComments(postId, data.uid);
                    // 알림 전송
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
    } catch (e) { container.innerHTML = `<p class="error-msg">로드 오류</p>`; }
}

async function loadComments(postId, postAuthorUid) {
    const listContainer = document.getElementById(`comments-list-${postId}`);
    if (!listContainer) return;
    try {
        const snap = await getDocs(query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc")));
        if (snap.empty) { listContainer.innerHTML = '<p class="text-sub" style="font-size:0.7rem; padding:0.5rem;">첫 댓글을 남겨보세요!</p>'; return; }
        listContainer.innerHTML = snap.docs.map(dSnap => {
            const d = dSnap.data();
            const canDelete = UserState.user && (d.uid === UserState.user.uid || UserState.isAdmin);
            return `
                <div class="comment-item">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:0.9rem;">${d.authorEmoji || '👤'}</span>
                        <span style="font-weight:800; font-size:0.75rem;">${d.author}</span>
                        ${canDelete ? `<button class="btn-comment-delete" data-id="${dSnap.id}" style="background:none; border:none; color:#ef4444; font-size:0.65rem; cursor:pointer;">삭제</button>` : ''}
                    </div>
                    <p style="font-size:0.8rem; margin-top:2px;">${d.content}</p>
                </div>
            `;
        }).join('');
        
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
