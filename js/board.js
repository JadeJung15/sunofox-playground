import { db } from './firebase-init.js';
import { UserState, usePoints, getTier, addPoints } from './auth.js';
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
    getCountFromServer
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

let currentTab = 'board'; // 'notice' or 'board'

export async function renderBoard(container) {
    container.innerHTML = `
        <div class="card community-container fade-in">
            <div class="community-tabs" style="display:flex; gap:0.5rem; margin-bottom:2rem; background:var(--bg-color); padding:0.5rem; border-radius:15px; border:1px solid var(--border-color);">
                <button class="tab-btn ${currentTab === 'notice' ? 'active' : ''}" data-tab="notice" style="flex:1; padding:0.8rem; border-radius:10px; border:none; font-weight:800; cursor:pointer; transition:all 0.3s;">📢 공지사항</button>
                <button class="tab-btn ${currentTab === 'board' ? 'active' : ''}" data-tab="board" style="flex:1; padding:0.8rem; border-radius:10px; border:none; font-weight:800; cursor:pointer; transition:all 0.3s;">💬 자유게시판</button>
            </div>

            <div id="community-content">
                <div class="loading-spinner">불러오는 중...</div>
            </div>
        </div>
    `;

    // 탭 클릭 이벤트
    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            currentTab = btn.dataset.tab;
            renderBoard(container); // 재귀 호출로 UI 갱신
        };
    });

    const contentArea = document.getElementById('community-content');
    if (currentTab === 'notice') {
        await renderNoticeTab(contentArea);
    } else {
        await renderBoardTab(contentArea);
    }
}

// --- 공지사항 탭 ---
async function renderNoticeTab(container) {
    container.innerHTML = `
        ${UserState.isMaster ? `
        <div class="card admin-news-form" style="margin-bottom: 2rem; border: 2px dashed #f59e0b; background: rgba(245,158,11,0.02);">
            <h3 style="margin-bottom: 1rem; font-size:1.1rem;">✍️ 신규 공지 작성</h3>
            <input type="text" id="news-title" placeholder="공지 제목" style="width:100%; padding:0.8rem; margin-bottom:0.5rem; border-radius:8px; border:1px solid var(--border-color); background:var(--card-bg); color:var(--text-main);">
            <textarea id="news-content" placeholder="업데이트 내용을 상세히 적어주세요." style="width:100%; height:120px; padding:0.8rem; border-radius:8px; border:1px solid var(--border-color); background:var(--card-bg); color:var(--text-main); font-family:inherit;"></textarea>
            <button id="submit-news" class="btn-primary" style="width:100%; margin-top:0.5rem; background:#f59e0b; border:none;">공지 등록하기</button>
        </div>
        ` : ''}
        <div id="news-list" class="news-list"></div>
    `;

    const listContainer = document.getElementById('news-list');
    
    // 공지 로드
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(20));
    const snap = await getDocs(q);
    if (snap.empty) {
        listContainer.innerHTML = '<p class="text-sub" style="text-align:center; padding:4rem;">등록된 소식이 없습니다.</p>';
    } else {
        listContainer.innerHTML = snap.docs.map(docSnap => {
            const data = docSnap.data();
            const date = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString() : "방금 전";
            return `
                <div class="card news-item fade-in" style="margin-bottom:1rem; padding:1.5rem; border:1px solid var(--border-color);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                        <span style="background:rgba(245,158,11,0.1); color:#d97706; padding:3px 10px; border-radius:50px; font-size:0.7rem; font-weight:800;">NOTICE</span>
                        <span style="font-size:0.75rem; color:var(--text-sub); font-weight:600;">${date}</span>
                    </div>
                    <h3 style="font-size:1.1rem; font-weight:900; margin-bottom:0.8rem;">${data.title}</h3>
                    <div style="font-size:0.9rem; line-height:1.7; color:var(--text-main); white-space:pre-wrap;">${data.content}</div>
                    ${UserState.isMaster ? `<button class="btn-delete-news" data-id="${docSnap.id}" style="margin-top:1rem; background:none; border:none; color:#ef4444; font-size:0.75rem; cursor:pointer; font-weight:700;">삭제 ✕</button>` : ''}
                </div>
            `;
        }).join('');

        // 공지 삭제
        listContainer.querySelectorAll('.btn-delete-news').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("공지를 삭제하시겠습니까?")) {
                    await deleteDoc(doc(db, "announcements", btn.dataset.id));
                    renderNoticeTab(container);
                }
            };
        });
    }

    // 공지 등록
    if (UserState.isMaster) {
        const submitBtn = document.getElementById('submit-news');
        submitBtn.onclick = async () => {
            const title = document.getElementById('news-title').value.trim();
            const content = document.getElementById('news-content').value.trim();
            if (!title || !content) return alert("내용을 입력하세요.");
            try {
                submitBtn.disabled = true;
                await addDoc(collection(db, "announcements"), { title, content, createdAt: serverTimestamp() });
                alert("등록 완료");
                renderNoticeTab(container);
            } catch (e) { alert("등록 실패"); }
            finally { submitBtn.disabled = false; }
        };
    }
}

// --- 자유게시판 탭 ---
async function renderBoardTab(container) {
    container.innerHTML = `
        <div id="post-form" class="post-form">
            <textarea id="post-content" placeholder="함께 나누고 싶은 이야기를 적어보세요." maxlength="200"></textarea>
            <div class="post-options" style="display:flex; align-items:center; gap:1rem; margin-top:0.5rem;">
                <label style="font-size:0.85rem; cursor:pointer;">
                    <input type="checkbox" id="post-premium"> 📣 게시글 강조 (300P)
                </label>
                <button id="submit-post" class="btn-primary" style="width:100px; margin-left:auto;">등록</button>
            </div>
        </div>
        <div id="posts-list" class="posts-list"></div>
    `;

    const submitBtn = document.getElementById('submit-post');
    const contentInput = document.getElementById('post-content');
    const premiumCheck = document.getElementById('post-premium');
    const listContainer = document.getElementById('posts-list');

    if (!UserState.user) {
        contentInput.disabled = true; submitBtn.disabled = true;
        contentInput.placeholder = "로그인 후 이용 가능합니다.";
    }

    // 게시글 로드
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(q);
    if (snap.empty) {
        listContainer.innerHTML = '<p class="text-sub" style="text-align:center; padding:4rem;">게시글이 없습니다.</p>';
    } else {
        for (const docSnap of snap.docs) {
            const data = docSnap.data();
            const postId = docSnap.id;
            const date = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "방금 전";
            const canDelete = UserState.user && (data.uid === UserState.user.uid || UserState.isAdmin);
            
            const commentsRef = collection(db, "posts", postId, "comments");
            const countSnap = await getCountFromServer(commentsRef);
            const commentCount = countSnap.data().count;

            let auraClass = '';
            if (data.userTier === 'DIAMOND') auraClass = 'aura-diamond';
            else if (data.userTier === 'PLATINUM') auraClass = 'aura-platinum';

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
            listContainer.appendChild(postEl);

            // 삭제 및 댓글 이벤트 바인딩 (기존 로직 유지)
            postEl.querySelector('.btn-delete')?.addEventListener('click', async () => {
                if (confirm("삭제하시겠습니까?")) {
                    await deleteDoc(doc(db, "posts", postId));
                    renderBoardTab(container);
                }
            });

            postEl.querySelector('.btn-toggle-comments').onclick = () => {
                const sec = postEl.querySelector(`#comment-section-${postId}`);
                const isOpen = sec.style.display === 'block';
                sec.style.display = isOpen ? 'none' : 'block';
                if (!isOpen) loadComments(postId);
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
                    cInput.value = ''; loadComments(postId);
                    // 알림 전송 (생략 가능하나 기존 기능 유지 권장)
                } catch (e) { alert("오류"); }
                finally { submitCommentBtn.disabled = false; }
            };
        }
    }

    // 게시글 등록
    submitBtn.onclick = async () => {
        if (!UserState.user) return alert("로그인이 필요합니다.");
        const content = contentInput.value.trim();
        if (!content) return alert("내용을 입력해주세요.");
        
        let isPremium = premiumCheck.checked;
        if (isPremium && !(await usePoints(300, "게시글 강조"))) return;

        try {
            submitBtn.disabled = true;
            const currentTier = getTier(UserState.data.totalScore || 0);
            
            await addDoc(collection(db, "posts"), {
                uid: UserState.user.uid, 
                author: UserState.data.nickname || "익명", 
                authorEmoji: UserState.data.emoji || "👤",
                authorColor: UserState.data.nameColor || "#333", 
                userTier: currentTier ? currentTier.name : "ROOKIE",
                content: content, 
                isPremium: isPremium, 
                createdAt: serverTimestamp()
            });

            // 퀘스트 체크 (전역 함수 checkDailyQuests 호출 시도)
            if (window.checkDailyQuests) window.checkDailyQuests('board'); 

            contentInput.value = ''; 
            premiumCheck.checked = false;
            // renderBoardTab 대신 최상위 renderBoard 호출하여 탭 상태 유지하며 갱신
            const mainContainer = document.querySelector('.community-container')?.parentElement;
            if (mainContainer) renderBoard(mainContainer);
            else renderBoardTab(container);
            
        } catch (e) { 
            console.error(e);
            alert("등록 실패: " + e.message); 
        } finally { 
            submitBtn.disabled = false; 
        }
    };
}

async function loadComments(postId) {
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
                        ${canDelete ? `<button class="btn-comment-delete" data-postid="${postId}" data-id="${dSnap.id}" style="background:none; border:none; color:#ef4444; font-size:0.65rem; cursor:pointer;">삭제</button>` : ''}
                    </div>
                    <p style="font-size:0.8rem; margin-top:2px;">${d.content}</p>
                </div>
            `;
        }).join('');
        
        listContainer.querySelectorAll('.btn-comment-delete').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("삭제하시겠습니까?")) {
                    await deleteDoc(doc(db, "posts", postId, "comments", btn.dataset.id));
                    loadComments(postId);
                }
            };
        });
    } catch (e) {}
}
