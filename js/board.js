import { db } from './firebase-init.js';
import { UserState, usePoints } from './auth.js';
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
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export async function renderBoard(container) {
    container.innerHTML = `
        <div class="card board-container fade-in">
            <h2>💬 자유 게시판</h2>
            
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
        contentInput.disabled = true;
        submitBtn.disabled = true;
        contentInput.placeholder = "로그인 후 이용 가능합니다.";
    }

    loadPosts(listContainer);

    submitBtn.onclick = async () => {
        const content = contentInput.value.trim();
        if (!content) return alert("내용을 입력해주세요.");
        
        let isPremium = premiumCheck.checked;
        if (isPremium) {
            const ok = await usePoints(300);
            if (!ok) return;
        }

        try {
            submitBtn.disabled = true;
            await addDoc(collection(db, "posts"), {
                uid: UserState.user.uid,
                author: UserState.data.nickname,
                authorEmoji: UserState.data.emoji || "👤",
                authorColor: UserState.data.nameColor || "#333",
                content: content,
                isPremium: isPremium,
                createdAt: serverTimestamp()
            });
            contentInput.value = "";
            premiumCheck.checked = false;
            await loadPosts(listContainer);
        } catch (e) {
            alert("등록 실패");
        } finally {
            submitBtn.disabled = false;
        }
    };
}

async function loadPosts(container) {
    try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        if (snap.empty) { container.innerHTML = `<p class="text-sub" style="text-align:center; padding:3rem;">게시글이 없습니다.</p>`; return; }

        container.innerHTML = ''; // 초기화

        for (const docSnap of snap.docs) {
            const data = docSnap.data();
            const postId = docSnap.id;
            const date = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "방금 전";
            const canDelete = UserState.user && (data.uid === UserState.user.uid || UserState.isAdmin);
            
            const postEl = document.createElement('div');
            postEl.className = `post-item ${data.isPremium ? 'premium-post' : ''} fade-in`;
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
                    <button class="btn-toggle-comments" data-id="${postId}">💬 댓글</button>
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

            // 삭제 버튼 이벤트
            const deleteBtn = postEl.querySelector('.btn-delete');
            if (deleteBtn) {
                deleteBtn.onclick = async () => {
                    if (confirm("게시글을 삭제하시겠습니까?")) {
                        await deleteDoc(doc(db, "posts", postId));
                        loadPosts(container);
                    }
                };
            }

            // 댓글창 토글
            const toggleCommentsBtn = postEl.querySelector('.btn-toggle-comments');
            const commentSection = postEl.querySelector(`#comment-section-${postId}`);
            toggleCommentsBtn.onclick = () => {
                const isOpen = commentSection.style.display === 'block';
                commentSection.style.display = isOpen ? 'none' : 'block';
                if (!isOpen) loadComments(postId);
            };

            // 댓글 등록 버튼
            const submitCommentBtn = postEl.querySelector('.btn-submit-comment');
            const commentInput = postEl.querySelector(`#comment-input-${postId}`);
            submitCommentBtn.onclick = async () => {
                if (!UserState.user) return alert("로그인이 필요합니다.");
                const content = commentInput.value.trim();
                if (!content) return;

                try {
                    submitCommentBtn.disabled = true;
                    await addDoc(collection(db, "posts", postId, "comments"), {
                        uid: UserState.user.uid,
                        author: UserState.data.nickname,
                        authorEmoji: UserState.data.emoji || "👤",
                        content: content,
                        createdAt: serverTimestamp()
                    });
                    commentInput.value = '';
                    loadComments(postId);
                } catch (e) {
                    alert("댓글 등록 실패");
                } finally {
                    submitCommentBtn.disabled = false;
                }
            };
        }
    } catch (e) { container.innerHTML = `<p class="error-msg">로드 오류</p>`; }
}

async function loadComments(postId) {
    const listContainer = document.getElementById(`comments-list-${postId}`);
    if (!listContainer) return;

    try {
        const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            listContainer.innerHTML = '<p class="text-sub" style="font-size:0.75rem; padding:0.5rem;">첫 댓글을 남겨보세요!</p>';
            return;
        }

        listContainer.innerHTML = snap.docs.map(dSnap => {
            const d = dSnap.data();
            const date = d.createdAt ? new Date(d.createdAt.toMillis()).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "방금 전";
            const canDelete = UserState.user && (d.uid === UserState.user.uid || UserState.isAdmin);

            return `
                <div class="comment-item">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1rem;">${d.authorEmoji || '👤'}</span>
                        <span style="font-weight:800; font-size:0.8rem;">${d.author}</span>
                        <span style="font-size:0.7rem; color:var(--text-sub);">${date}</span>
                        ${canDelete ? `<button class="btn-comment-delete" data-postid="${postId}" data-id="${dSnap.id}" style="background:none; border:none; color:#ef4444; font-size:0.7rem; cursor:pointer; padding:0;">삭제</button>` : ''}
                    </div>
                    <p style="font-size:0.85rem; margin-top:0.25rem; color:var(--text-main);">${d.content}</p>
                </div>
            `;
        }).join('');

        // 댓글 삭제 이벤트
        listContainer.querySelectorAll('.btn-comment-delete').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("댓글을 삭제하시겠습니까?")) {
                    await deleteDoc(doc(db, "posts", postId, "comments", btn.dataset.id));
                    loadComments(postId);
                }
            };
        });
    } catch (e) {
        console.error(e);
    }
}
