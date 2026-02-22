// js/app.js
import { Store } from './store.js';
import { ReactionGame, MemoryGame, RhythmGame, PuzzleGame, MathGame, RpsGame, PersonalityTest, NumberMemoryGame, TypingGame, ReflexGame, MazeGame, DodgeGame } from './games.js';
import { auth, db } from '../index.html'; // Import auth and db instances
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";


const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

let currentUser = null; // To store authenticated user info
let isAdmin = false;    // To store admin status

// Routing
const routes = {
  '#home': renderHome,
  '#games': renderGames,
  '#lounge': renderLounge,
  '#community': renderCommunity,
  '#profile': renderProfile,
  '#admin': renderAdmin
};

function router() {
  const hash = window.location.hash || '#home';
  const renderFn = routes[hash] || renderHome;
  
  // Update Nav
  navLinks.forEach(link => {
    if (link.getAttribute('href') === hash) link.classList.add('active');
    else link.classList.remove('active');
  });
  
  app.innerHTML = '';
  renderFn();
}

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  isAdmin = false; // Reset admin status
  if (currentUser) {
    // Get custom claims to check for admin role
    const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh token
    isAdmin = idTokenResult.claims.admin || false;
  }
  router(); // Re-render current view to reflect auth state or admin status
});

window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
  initTheme();
  router();
});

// Theme
function initTheme() {
  const theme = Store.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
  
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Store.setTheme(next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('.icon');
  if(icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Views
function renderHome() {
  app.innerHTML = `
    <section class="hero fade-in">
      <h1>SunoFox Playground</h1>
      <p>미니게임과 커뮤니티가 하나로! 지금 바로 시작하세요.</p>
    </section>

    <div class="notice-banner fade-in">
      <strong>📢 공지</strong> 2026.02.22 - 신규 미니게임과 심리테스트가 추가되었습니다!
    </div>

    <div class="card-grid fade-in">
      <a href="#games" class="card entry-card">
        <div class="card-icon">🎮</div>
        <h3>미니게임</h3>
        <p>반응속도, 기억력, 리듬, 퍼즐 + 신규 게임과 심리테스트까지!</p>
      </a>
      <a href="#lounge" class="card entry-card">
        <div class="card-icon">💬</div>
        <h3>라운지</h3>
        <p>다양한 주제로 자유롭게 대화하세요.</p>
      </a>
      <a href="#community" class="card entry-card">
        <div class="card-icon">📝</div>
        <h3>커뮤니티</h3>
        <p>정보 공유와 팁을 얻어가세요.</p>
      </a>
    </div>
  `;
}

function renderGames() {
  app.innerHTML = `
    <div class="fade-in">
      <h2 class="page-title">🕹️ 미니게임 아케이드</h2>
      <div class="game-tabs">
        <button class="tab-btn active" data-game="reaction">반응속도</button>
        <button class="tab-btn" data-game="memory">기억력</button>
        <button class="tab-btn" data-game="rhythm">리듬</button>
        <button class="tab-btn" data-game="puzzle">퍼즐</button>
        <button class="tab-btn" data-game="math">스피드 합산</button>
        <button class="tab-btn" data-game="rps">가위바위보</button>
        <button class="tab-btn" data-game="number">숫자 기억력</button>
        <button class="tab-btn" data-game="typing">타이핑</button>
        <button class="tab-btn" data-game="reflex">반사신경</button>
        <button class="tab-btn" data-game="maze">미로</button>
        <button class="tab-btn" data-game="dodge">낙하 피하기</button>
        <button class="tab-btn" data-game="test">심리테스트</button>
      </div>
      <div id="game-container" class="game-container"></div>
    </div>
  `;

  const container = document.getElementById('game-container');
  const tabs = document.querySelectorAll('.game-tabs .tab-btn');
  
  // Default game
  new ReactionGame(container);

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const gameType = e.target.dataset.game;
      
      container.innerHTML = ''; // Clear previous game
      if (gameType === 'reaction') new ReactionGame(container);
      if (gameType === 'memory') new MemoryGame(container);
      if (gameType === 'rhythm') new RhythmGame(container);
      if (gameType === 'puzzle') new PuzzleGame(container);
      if (gameType === 'math') new MathGame(container);
      if (gameType === 'rps') new RpsGame(container);
      if (gameType === 'number') new NumberMemoryGame(container);
      if (gameType === 'typing') new TypingGame(container);
      if (gameType === 'reflex') new ReflexGame(container);
      if (gameType === 'maze') new MazeGame(container);
      if (gameType === 'dodge') new DodgeGame(container);
      if (gameType === 'test') new PersonalityTest(container);
    });
  });
}

function renderLounge() {
  const categories = ['전체', '잡담', '질문', '정보', '후기', '유머', '창작', '게임', 'AI', '취미'];
  let currentCategory = '전체';

  app.innerHTML = `
    <div class="lounge-layout fade-in">
      <aside class="sidebar">
        <h3>토픽</h3>
        <div class="category-list" id="category-list"></div>
        <button id="write-lounge-btn" class="btn btn-primary full-width mt-4">글쓰기</button>
      </aside>
      <section class="content">
        <h2 class="page-title">라운지 <small id="current-cat-title">/ 전체</small></h2>
        <div id="lounge-list" class="post-list-grid"></div>
      </section>
    </div>
  `;

  const renderCategories = () => {
    const list = document.getElementById('category-list');
    list.innerHTML = categories.map(c => 
      `<button class="cat-btn ${c === currentCategory ? 'active' : ''}">${c}</button>`
    ).join('');
    
    list.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentCategory = e.target.textContent;
        document.getElementById('current-cat-title').textContent = `/ ${currentCategory}`;
        renderCategories(); // Re-render to update active class
        renderList();
      });
    });
  };

  const renderList = async () => {
    const posts = await Store.getPosts('lounge', currentCategory === '전체' ? null : currentCategory);
    const listHtml = posts.map(post => `
      <div class="post-card" data-id="${post.id}">
        <div class="post-header">
          <span class="chip small">${post.category}</span>
          <span class="date">${new Date(post.date).toLocaleDateString()}</span>
        </div>
        <h4 class="post-title">${post.title}</h4>
        <div class="post-footer">
          <span>${post.author}</span>
          <span>❤️ ${post.likes}</span>
        </div>
      </div>
    `).join('');
    
    document.getElementById('lounge-list').innerHTML = listHtml || '<div class="empty">글이 없습니다.</div>';
    
    document.querySelectorAll('.post-card').forEach(item => {
      item.addEventListener('click', () => openPostModal(item.dataset.id));
    });
  };

  renderCategories();
  renderList();
  document.getElementById('write-lounge-btn').addEventListener('click', () => openWriteModal('lounge', null, renderList));
}

function renderCommunity() {
  app.innerHTML = `
    <div class="community-layout fade-in">
      <div class="toolbar">
        <h2 class="page-title">자유 게시판</h2>
        <div class="actions">
          <button id="write-comm-btn" class="btn btn-primary">글쓰기</button>
        </div>
      </div>
      <div class="post-table-header">
        <span class="col-cat">분류</span>
        <span class="col-title">제목</span>
        <span class="col-author">작성자</span>
        <span class="col-meta">조회/추천</span>
      </div>
      <div id="community-list" class="post-list-table"></div>
    </div>
  `;

  const renderList = async () => {
    const posts = await Store.getPosts('community');
    const listHtml = posts.map(post => `
      <div class="post-row" data-id="${post.id}">
        <span class="col-cat"><span class="chip micro">${post.category}</span></span>
        <span class="col-title">${post.title} <span class="comment-count">[${Store.getComments(post.id).length}]</span></span>
        <span class="col-author">${post.author}</span>
        <span class="col-meta">${post.views} / ${post.likes}</span>
      </div>
    `).join('');
    document.getElementById('community-list').innerHTML = listHtml || '<div class="empty">게시글이 없습니다.</div>';

    document.querySelectorAll('.post-row').forEach(item => {
        item.addEventListener('click', () => openPostModal(item.dataset.id));
    });
  };

  renderList();
  document.getElementById('write-comm-btn').addEventListener('click', () => openWriteModal('community', null, renderList));
}

// NEW: Render Profile Page
function renderProfile() {
  if (currentUser) {
    // Logged in view
    app.innerHTML = `
      <section class="profile-section fade-in">
          <h2 class="page-title">👤 내 프로필</h2>
          <div class="profile-card card">
              <h3>환영합니다, ${currentUser.email}!</h3>
              <p>UID: ${currentUser.uid}</p>
              <p>가입일: ${new Date(currentUser.metadata.creationTime).toLocaleDateString()}</p>
              <button id="logout-btn" class="btn btn-secondary full-width mt-4">로그아웃</button>
          </div>
          <div class="profile-details card mt-4">
              <h3>나의 활동 (구현 예정)</h3>
              <p class="text-sub">로그인 후 활동 기록을 이곳에서 관리할 수 있습니다.</p>
          </div>
      </section>
    `;
    document.getElementById('logout-btn').addEventListener('click', async () => {
      try {
        await signOut(auth);
        alert('로그아웃 되었습니다.');
      } catch (error) {
        console.error('Logout error:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    });
  } else {
    // Logged out view
    app.innerHTML = `
      <section class="profile-section fade-in">
          <h2 class="page-title">👤 내 프로필</h2>
          <div class="profile-card card">
              <h3>로그인 / 회원가입</h3>
              <div class="form-group">
                  <label for="email">이메일</label>
                  <input type="email" id="email-input" class="input" placeholder="이메일">
              </div>
              <div class="form-group">
                  <label for="password">비밀번호</label>
                  <input type="password" id="password-input" class="input" placeholder="비밀번호">
              </div>
              <button id="login-btn" class="btn btn-primary full-width mt-4">로그인</button>
              <button id="signup-btn" class="btn btn-secondary full-width mt-2">회원가입</button>
          </div>
          <div class="profile-details card mt-4">
              <h3>나의 활동</h3>
              <p class="text-sub">로그인 후 활동 기록을 볼 수 있습니다.</p>
          </div>
      </section>
    `;

    document.getElementById('login-btn').addEventListener('click', async () => {
      const email = document.getElementById('email-input').value;
      const password = document.getElementById('password-input').value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('로그인 성공!');
      } catch (error) {
        console.error('Login error:', error);
        alert('로그인 실패: ' + error.message);
      }
    });

    document.getElementById('signup-btn').addEventListener('click', async () => {
      const email = document.getElementById('email-input').value;
      const password = document.getElementById('password-input').value;
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('회원가입 성공!');
      } catch (error) {
        console.error('Signup error:', error);
        alert('회원가입 실패: ' + error.message);
      }
    });
  }
}

// NEW: Render Admin Page (Now checking `isAdmin` flag)
function renderAdmin() {
  if (isAdmin) { // Check isAdmin flag from custom claims
    app.innerHTML = `
      <section class="admin-section fade-in">
          <h2 class="page-title">⚙️ 관리자 페이지</h2>
          <p class="text-sub">관리자 ${currentUser.email}님 환영합니다.</p>
          <div class="admin-dashboard">
              <div class="admin-card card">
                  <h3>게시글 관리</h3>
                  <p class="text-sub">여기에 게시글 목록을 불러와 삭제/공지 지정 등의 작업을 할 수 있습니다.</p>
                  <button class="btn btn-secondary full-width mt-2">게시글 목록</button>
                  <button class="btn btn-secondary full-width mt-2">신고된 글</button>
              </div>
              <div class="admin-card card">
                  <h3>댓글 관리</h3>
                  <p class="text-sub">여기에 댓글 목록을 불러와 삭제 등의 작업을 할 수 있습니다.</p>
                  <button class="btn btn-secondary full-width mt-2">댓글 목록</button>
              </div>
              <div class="admin-card card">
                  <h3>사용자 관리</h3>
                  <p class="text-sub">여기에 사용자 목록을 불러와 권한 변경 등의 작업을 할 수 있습니다.</p>
                  <button class="btn btn-secondary full-width mt-2">사용자 목록</button>
              </div>
          </div>
      </section>
    `;
  } else {
    app.innerHTML = `
      <section class="admin-section fade-in">
        <h2 class="page-title">⚙️ 관리자 페이지</h2>
        <p class="text-sub">관리자만 접근할 수 있는 페이지입니다.</p>
        <div class="profile-card card">
            <h3>접근 권한 없음</h3>
            <p>관리자 권한이 있는 계정으로 로그인해주세요.</p>
            <a href="#profile" class="btn btn-primary full-width mt-4">로그인 페이지로 이동</a>
        </div>
      </section>
    `;
  }
}


// Modals
async function openWriteModal(type, prefill = {}, refreshCallback = null) {
  if (!currentUser) {
    alert('로그인 후 이용 가능합니다.');
    window.location.hash = '#profile';
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-overlay fade-in';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${type === 'lounge' ? '라운지 글쓰기' : '게시글 작성'}</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <select id="post-category" class="input">
            ${type === 'lounge' 
                ? ['잡담', '질문', '정보', '후기', '유머', '창작', '게임', 'AI', '취미'].map(c => `<option value="${c}">${c}</option>`).join('')
                : ['일반', '질문', '공략', '팁', '게임 기록'].map(c => `<option value="${c}" ${prefill.category === c ? 'selected' : ''}>${c}</option>`).join('')
            }
        </select>
        <input type="text" id="post-title" class="input" placeholder="제목" value="${prefill.title || ''}">
        <input type="text" id="post-author" class="input" placeholder="닉네임" value="${currentUser.email.split('@')[0]}" disabled>
        <textarea id="post-content" class="input textarea" placeholder="내용을 입력하세요">${prefill.content || ''}</textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="submit-post">등록</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('.close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if(e.target === modal) close(); });

  modal.querySelector('#submit-post').addEventListener('click', async () => {
    const title = modal.querySelector('#post-title').value;
    const content = modal.querySelector('#post-content').value;
    const author = modal.querySelector('#post-author').value; // Get from disabled input
    const category = modal.querySelector('#post-category').value;

    if (!title || !content || !author) return alert('모든 항목을 입력해주세요.');

    await Store.addPost({ type, title, content, author, category, authorId: currentUser.uid });
    close();
    if (refreshCallback) refreshCallback();
    else router(); // Re-render current view to show new post
  });
}

async function openPostModal(id) { // Added async
  const post = await Store.getPost(id); // Await the post
  if (!post) {
      console.error("Post not found:", id);
      return;
  }
  
  await Store.viewPost(id); // Increment view count
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay fade-in';
  
  const renderModalContent = async (currentPost) => { // Added async
    const comments = await Store.getComments(id); // Await comments
    modal.innerHTML = `
      <div class="modal view-modal">
        <div class="modal-header">
          <span class="chip">${currentPost.category}</span>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <h2 class="view-title">${currentPost.title}</h2>
          <div class="view-meta">
            <span>${currentPost.author}</span> · <span>${new Date(currentPost.date).toLocaleDateString()}</span>
            <span class="right">👀 ${currentPost.views} ❤️ <span id="like-count">${currentPost.likes}</span></span>
          </div>
          <div class="view-content">${currentPost.content}</div>
          
          <div class="comments-section">
              <h4>댓글 (${comments.length})</h4>
              <div id="comment-list">
                ${comments.map(c => `
                  <div class="comment">
                      <strong>${c.author}</strong> <span class="date">${new Date(c.date).toLocaleTimeString()}</span>
                      <p>${c.content}</p>
                  </div>
                `).join('')}
              </div>
              <div class="comment-form">
                  <input type="text" id="comment-author" placeholder="닉네임" class="input small" value="${currentUser ? currentUser.email.split('@')[0] : ''}" ${currentUser ? 'disabled' : ''}>
                  <input type="text" id="comment-text" placeholder="댓글 내용" class="input">
                  <button id="submit-comment" class="btn btn-secondary" ${currentUser ? '' : 'disabled'}>등록</button>
              </div>
          </div>
        </div>
        <div class="modal-footer">
            <div class="modal-actions">
                ${(currentUser && (currentUser.uid === currentPost.authorId || isAdmin)) 
                    ? `<button id="delete-post-btn" class="btn btn-outline">🗑️ 글 삭제</button>` : ''}
                <button class="btn btn-outline" id="like-btn">❤️ 좋아요</button>
            </div>
        </div>
      </div>
    `;
    
    // Re-attach events
    const close = () => modal.remove();
    modal.querySelector('.close-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if(e.target === modal) close(); });
    
    const likeBtn = modal.querySelector('#like-btn');
    if (likeBtn) likeBtn.addEventListener('click', async () => {
       const newLikes = await Store.likePost(id);
       currentPost.likes = newLikes; // update local ref
       renderModalContent(currentPost); // re-render to update like count
    });

    const deletePostBtn = modal.querySelector('#delete-post-btn');
    if (deletePostBtn) {
        deletePostBtn.addEventListener('click', async () => {
            if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
                await Store.deletePost(id); // Need to implement deletePost in store.js
                close();
                router(); // Refresh current view
            }
        });
    }

    const submitCommentBtn = modal.querySelector('#submit-comment');
    if (submitCommentBtn) {
        if (!currentUser) submitCommentBtn.title = "로그인 후 댓글을 작성할 수 있습니다.";
        submitCommentBtn.addEventListener('click', async () => {
            if (!currentUser) {
                alert('로그인 후 댓글을 작성할 수 있습니다.');
                window.location.hash = '#profile';
                close();
                return;
            }

            const authorInput = modal.querySelector('#comment-author');
            const contentInput = modal.querySelector('#comment-text');
            
            if (!authorInput || !contentInput) {
                console.error("Comment input elements not found.");
                return;
            }

            const author = authorInput.value;
            const content = contentInput.value;
            if (!author || !content) return;
            
            await Store.addComment({ postId: id, author, content, authorId: currentUser.uid }); // Changed parseInt(id) to id
            contentInput.value = '';
            renderModalContent(currentPost);
        });
    }
  };

  document.body.appendChild(modal);
  // Initial render, then update views count
  Store.viewPost(id); // Increment view count via Store
  renderModalContent(post); // Pass the already awaited post
}

// Listen for game share events
window.addEventListener('gameShareRecord', (e) => {
    if (!currentUser) {
        alert('로그인 후 게임 기록을 공유할 수 있습니다.');
        window.location.hash = '#profile';
        return;
    }
    const { gameName, score } = e.detail;
    openWriteModal('community', {
        category: '게임 기록',
        title: `[${gameName}] 새로운 최고 기록 달성! ${score}`,
        authorId: currentUser.uid
    });
    window.location.hash = '#community'; 
});
