// js/app.js
import { Store } from './store.js';
import { ReactionGame, MemoryGame, RhythmGame, PuzzleGame } from './games.js';

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

// Routing
const routes = {
  '#home': renderHome,
  '#games': renderGames,
  '#lounge': renderLounge,
  '#community': renderCommunity
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
  if(icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Views
function renderHome() {
  app.innerHTML = `
    <section class="hero fade-in">
      <h1>SunoFox Playground</h1>
      <p>미니게임과 커뮤니티가 하나로! 지금 바로 시작하세요.</p>
    </section>

    <div class="notice-banner fade-in">
      <strong>📢 공지</strong> 2026.02.22 - 새로운 미니게임 4종이 추가되었습니다!
    </div>

    <div class="card-grid fade-in">
      <a href="#games" class="card entry-card">
        <div class="card-icon">🎮</div>
        <h3>미니게임</h3>
        <p>반응속도, 기억력, 리듬, 퍼즐 게임을 즐겨보세요.</p>
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

  const renderList = () => {
    const posts = Store.getPosts('lounge', currentCategory === '전체' ? null : currentCategory);
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

  const renderList = () => {
    const posts = Store.getPosts('community');
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

// Modals
function openWriteModal(type, prefill = {}, refreshCallback = null) {
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
        <input type="text" id="post-author" class="input" placeholder="닉네임">
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

  modal.querySelector('#submit-post').addEventListener('click', () => {
    const title = modal.querySelector('#post-title').value;
    const content = modal.querySelector('#post-content').value;
    const author = modal.querySelector('#post-author').value;
    const category = modal.querySelector('#post-category').value;

    if (!title || !content || !author) return alert('모든 항목을 입력해주세요.');

    Store.addPost({ type, title, content, author, category });
    close();
    if (refreshCallback) refreshCallback();
    else router(); // Re-render current view to show new post
  });
}

function openPostModal(id) {
  const post = Store.getPost(id);
  if (!post) return;
  Store.viewPost(id);
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay fade-in';
  
  const renderModalContent = () => {
    const comments = Store.getComments(id);
    modal.innerHTML = `
      <div class="modal view-modal">
        <div class="modal-header">
          <span class="chip">${post.category}</span>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <h2 class="view-title">${post.title}</h2>
          <div class="view-meta">
            <span>${post.author}</span> · <span>${new Date(post.date).toLocaleDateString()}</span>
            <span class="right">👀 ${post.views} ❤️ <span id="like-count">${post.likes}</span></span>
          </div>
          <div class="view-content">${post.content}</div>
          
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
                  <input type="text" id="comment-author" placeholder="닉네임" class="input small">
                  <input type="text" id="comment-text" placeholder="댓글 내용" class="input">
                  <button id="submit-comment" class="btn btn-secondary">등록</button>
              </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="like-btn">❤️ 좋아요</button>
        </div>
      </div>
    `;
    
    // Re-attach events
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
    
    const likeBtn = modal.querySelector('#like-btn');
    if (likeBtn) likeBtn.addEventListener('click', () => {
       const newLikes = Store.likePost(id);
       post.likes = newLikes; // update local ref
       renderModalContent(); // re-render to update like count
    });

    const submitCommentBtn = modal.querySelector('#submit-comment');
    if (submitCommentBtn) submitCommentBtn.addEventListener('click', () => {
        const authorInput = modal.querySelector('#comment-author');
        const contentInput = modal.querySelector('#comment-text');
        
        if (!authorInput || !contentInput) {
            console.error("Comment input elements not found.");
            return;
        }

        const author = authorInput.value;
        const content = contentInput.value;
        if (!author || !content) return;
        
        Store.addComment({ postId: parseInt(id), author, content });
        contentInput.value = '';
        renderModalContent();
    });
  };

  document.body.appendChild(modal);
  renderModalContent();
  modal.addEventListener('click', (e) => { if(e.target === modal) modal.remove(); });
}

// Listen for game share events
window.addEventListener('gameShareRecord', (e) => {
    const { gameName, score } = e.detail;
    openWriteModal('community', {
        category: '게임 기록',
        title: `[${gameName}] 새로운 최고 기록 달성! ${score}`
    });
    // Automatically navigate to community tab after sharing
    window.location.hash = '#community'; 
});
