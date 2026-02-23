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
        // 마스터 자동 공지 등록 (1회성)
        if (UserState.isMaster) {
            autoPostGrandUpdate();
        }
    } else {
        await renderBoardTab(contentArea);
    }
}

// 마스터 자동 공지 등록 함수
async function autoPostGrandUpdate() {
    const title = "✨ SevenCheck 그랜드 업데이트: 더 깊어진 분석과 소통의 시작";
    try {
        const q = query(collection(db, "announcements"), where("title", "==", title));
        const snap = await getDocs(q);
        if (!snap.empty) return; // 이미 등록됨

        const content = `안녕하세요, SevenCheck 이용자 여러분!
더욱 풍성하고 즐거운 서비스 경험을 위해 진행된 '그랜드 업데이트' 내역을 안내해 드립니다.

1. 📸 결과 이미지 저장 & 실시간 통계 도입
이제 테스트 결과를 예쁜 카드 형태로 소장할 수 있습니다!
- '이미지 저장' 버튼을 통해 나의 분석 리포트를 갤러리에 저장해 보세요.
- 내가 얻은 결과가 참여자 중 상위 몇 %인지 실시간 통계 그래프로 확인할 수 있습니다.

2. 💬 통합 커뮤니티 센터 오픈
공지사항과 자유게시판이 하나로 합쳐졌습니다!
- 상단 탭을 통해 새로운 소식과 유저들의 이야기를 더 간편하게 오갈 수 있습니다.
- 이제 게시판에 글을 쓰면 일일 퀘스트 포인트도 받을 수 있어요!

3. 🔔 실시간 알림 시스템
내 글에 댓글이 달리면 상단 🔔 아이콘이 알려드립니다!
- 중요한 반응을 놓치지 말고 실시간으로 소통해 보세요.

4. 📜 일일 퀘스트 & 보상 강화
세븐 오락실에 '일일 퀘스트'가 추가되었습니다.
- 매일 출석하기, 테스트 참여하기, 게시글 작성하기를 완료하고 추가 포인트를 획득하세요.

5. ✨ 명예로운 티어 오라(Aura) 효과
높은 등급의 수집가들에게 걸맞은 특별한 효과가 적용됩니다!
- 플래티넘 및 다이아몬드 등급 유저가 게시판에 글을 쓰면 이름 테두리에 화려한 애니메이션 오라가 나타납니다.

6. 📱 모바일 최적화 및 UI 개선
스마트폰에서도 모든 기능을 쾌적하게 이용할 수 있도록 대시보드 배치를 최적화했습니다.

---
SevenCheck은 여러분의 피드백을 바탕으로 매일 성장하고 있습니다. 
지금 바로 새로운 기능들을 체험해 보세요! 

감사합니다.
- SevenCheck Studio -`;

        await addDoc(collection(db, "announcements"), {
            title, content, createdAt: serverTimestamp()
        });
        console.log("자동 공지 등록 완료!");
        // UI 갱신을 위해 탭 다시 렌더링 (옵션)
        const container = document.getElementById('community-content');
        if (container) renderNoticeTab(container);
    } catch (e) { console.error("Auto-post failed", e); }
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
