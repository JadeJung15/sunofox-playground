import { db } from './firebase-init.js';
import { UserState } from './auth.js';
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
            <p class="text-sub">테스트 후기나 의견을 자유롭게 남겨주세요!</p>
            
            <div id="post-form" class="post-form">
                <textarea id="post-content" placeholder="로그인 후 따뜻한 한마디를 남겨주세요." maxlength="200"></textarea>
                <button id="submit-post" class="btn-primary">등록하기</button>
            </div>

            <div id="posts-list" class="posts-list">
                <div class="loading-spinner">게시글을 불러오는 중...</div>
            </div>
        </div>
    `;

    const submitBtn = document.getElementById('submit-post');
    const contentInput = document.getElementById('post-content');
    const listContainer = document.getElementById('posts-list');

    if (!UserState.user) {
        contentInput.disabled = true;
        submitBtn.disabled = true;
        contentInput.placeholder = "로그인 후 이용 가능합니다.";
    }

    loadPosts(listContainer);

    submitBtn.onclick = async () => {
        if (!UserState.user) return alert("로그인이 필요합니다.");
        const content = contentInput.value.trim();
        if (!content) return alert("내용을 입력해주세요.");
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "등록 중...";
            
            await addDoc(collection(db, "posts"), {
                uid: UserState.user.uid,
                author: UserState.data.nickname || "익명",
                content: content,
                createdAt: serverTimestamp()
            });
            
            contentInput.value = "";
            await loadPosts(listContainer);
        } catch (e) {
            console.error("Post creation error:", e);
            alert("게시글 등록에 실패했습니다. (권한 문제일 수 있습니다)");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "등록하기";
        }
    };
}

async function loadPosts(container) {
    try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            container.innerHTML = `<p class="text-sub" style="text-align:center; padding:3rem;">첫 번째 게시글을 남겨보세요! ✨</p>`;
            return;
        }

        container.innerHTML = snap.docs.map(docSnap => {
            const data = docSnap.data();
            const date = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString() : "방금 전";
            const isMine = UserState.user && data.uid === UserState.user.uid;
            
            return `
                <div class="post-item fade-in">
                    <div class="post-header">
                        <span class="post-author">${data.author}</span>
                        <span class="post-date">${date}</span>
                    </div>
                    <div class="post-content">${data.content}</div>
                    ${isMine ? `<button class="btn-delete" data-id="${docSnap.id}">삭제</button>` : ''}
                </div>
            `;
        }).join('');

        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("정말 삭제하시겠습니까?")) {
                    try {
                        await deleteDoc(doc(db, "posts", btn.dataset.id));
                        loadPosts(container);
                    } catch (e) {
                        alert("삭제 권한이 없습니다.");
                    }
                }
            };
        });

    } catch (e) {
        console.error("Load posts error:", e);
        container.innerHTML = `<p class="error-msg" style="text-align:center; padding:2rem;">게시글을 불러오는 중 오류가 발생했습니다.</p>`;
    }
}
