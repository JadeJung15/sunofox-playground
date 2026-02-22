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
    doc
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

        container.innerHTML = snap.docs.map(docSnap => {
            const data = docSnap.data();
            const date = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString() : "방금 전";
            const isMine = UserState.user && data.uid === UserState.user.uid;
            
            return `
                <div class="post-item ${data.isPremium ? 'premium-post' : ''} fade-in">
                    <div class="post-header">
                        <div class="post-author-info">
                            <span class="author-emoji">${data.authorEmoji || '👤'}</span>
                            <span class="post-author" style="color:${data.authorColor || '#333'}">${data.author}</span>
                        </div>
                        <span class="post-date">${date}</span>
                    </div>
                    <div class="post-content">${data.content}</div>
                    ${isMine ? `<button class="btn-delete" data-id="${docSnap.id}">삭제</button>` : ''}
                </div>
            `;
        }).join('');

        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("삭제하시겠습니까?")) {
                    await deleteDoc(doc(db, "posts", btn.dataset.id));
                    loadPosts(container);
                }
            };
        });
    } catch (e) { container.innerHTML = `<p class="error-msg">로드 오류</p>`; }
}
