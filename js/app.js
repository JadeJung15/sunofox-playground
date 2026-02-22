// js/app.js
import { Store } from './store.js';
import { ReactionGame, MemoryGame, RhythmGame, PuzzleGame, MathGame, RpsGame, PersonalityTest, NumberMemoryGame, TypingGame, ReflexGame, MazeGame, DodgeGame } from './games.js';
import { auth, db } from './firebase-init.js'; // Import auth and db instances from new module
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider, // New import
  signInWithPopup     // New import
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";


const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const adminNavLink = document.querySelector('.nav-link.admin-only');

let currentRoute = null;
let activeGame = null;

let currentUser = null; // To store authenticated user info
let isAdmin = false;    // To store admin status

const CHANNEL_URL = 'https://youtube.com/@sunofox';
const FEATURED_PLAYLIST = 'PLP7_j0_nQXuEv-ny2l03vgreGyTvLhmD0';
const CHANNEL_ID = '';

// Routing
const routes = {
  '#home': renderHome,
  '#games': renderArcade,
  '#arcade': renderArcade,
  '#videos': renderVideos,
  '#tests': renderTests,
  '#lounge': renderLounge,
  '#community': renderCommunity,
  '#profile': renderProfile,
  '#admin': renderAdmin
};

function router() {
  const hash = window.location.hash || '#home';
  if ((currentRoute === '#games' || currentRoute === '#arcade' || currentRoute === '#tests') && hash !== currentRoute && activeGame?.destroy) {
    activeGame.destroy();
    activeGame = null;
  }
  if (hash === '#admin' && !isAdmin) {
    window.location.hash = '#home';
  }
  const renderFn = routes[hash] || renderHome;
  
  // Update Nav
  navLinks.forEach(link => {
    if (link.getAttribute('href') === hash) link.classList.add('active');
    else link.classList.remove('active');
  });
  
  app.innerHTML = '';
  renderFn();
  currentRoute = hash;
}

function updateAdminNav() {
  if (!adminNavLink) return;
  if (isAdmin) adminNavLink.classList.remove('hidden');
  else adminNavLink.classList.add('hidden');
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
  updateAdminNav();
  router(); // Re-render current view to reflect auth state or admin status
});

window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
  initTheme();
  updateAdminNav();
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
    <section class="hero-grid fade-in">
      <div class="panel hero-main">
        <div class="hero-banner">
          <strong>SunoFox Fanpage</strong>
          <div class="hero-pill">🎬 유튜브 수노폭스 팬페이지</div>
        </div>
        <p class="section-kicker">SunoFox Fan Lounge</p>
        <h1 class="headline">수노폭스 유튜브 팬들을 위한<br>영상 허브 & 팬 커뮤니티.</h1>
        <p class="lead">
          최신 영상, 플레이리스트, 팬 토론을 한 곳에서 모았습니다.
          팬들이 직접 만든 리뷰와 기록도 공유하세요.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${CHANNEL_URL}" target="_blank" rel="noreferrer">유튜브 구독하기</a>
          <a class="btn btn-secondary" href="#videos">최신 영상 보기</a>
          <a class="btn btn-outline" href="#community">팬 토론 참여</a>
        </div>
        <div class="stat-grid">
          <div class="stat-card">
            <span class="stat-label">팬페이지 소개</span>
            <strong>수노폭스 팬 전용 허브</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">최신 업데이트</span>
            <strong>영상 & 토론 자동 모음</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">팬 참여</span>
            <strong>리뷰 · 토론 · 기록 공유</strong>
          </div>
        </div>
      </div>
      <div class="panel hero-side">
        <div class="spotlight">
          <div>
            <p class="section-kicker">Featured</p>
            <h3>수노폭스 대표 플레이리스트</h3>
            <p class="text-sub">팬들이 가장 좋아하는 영상 모음입니다.</p>
          </div>
          <div class="embed">
            <iframe
              class="frame"
              title="SunoFox Playlist"
              src="https://www.youtube.com/embed/videoseries?list=${FEATURED_PLAYLIST}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen></iframe>
          </div>
          <a class="btn btn-outline full-width" href="${CHANNEL_URL}" target="_blank" rel="noreferrer">유튜브 채널로</a>
        </div>
      </div>
    </section>

    <section class="section fade-in">
      <div class="section-head">
        <h2>팬페이지에서 하는 일</h2>
        <span>영상 · 토론 · 기록</span>
      </div>
      <div class="grid-three">
        <a href="#videos" class="card feature-card">
          <div class="card-icon">🎬</div>
          <h3>영상 모아보기</h3>
          <p>최신 영상과 플레이리스트를 한눈에 정리합니다.</p>
        </a>
        <a href="#community" class="card feature-card">
          <div class="card-icon">💬</div>
          <h3>팬 토론</h3>
          <p>감상 포인트, 다음 콘텐츠 아이디어를 나눠보세요.</p>
        </a>
        <a href="#arcade" class="card feature-card">
          <div class="card-icon">🕹️</div>
          <h3>팬 챌린지</h3>
          <p>기록 공유와 이벤트 참여로 팬덤을 키워요.</p>
        </a>
      </div>
    </section>

    <section class="section fade-in">
      <div class="section-head">
        <h2>팬페이지 흐름</h2>
        <span>수노폭스 팬을 위한 루트</span>
      </div>
      <div class="channel-map">
        <div class="map-card">
          <small>01</small>
          <h4>영상 시청</h4>
          <p class="text-sub">유튜브 최신 영상과 추천 재생목록을 봅니다.</p>
        </div>
        <div class="map-card">
          <small>02</small>
          <h4>팬 토론</h4>
          <p class="text-sub">감상 포인트, 인상 깊은 장면을 나눕니다.</p>
        </div>
        <div class="map-card">
          <small>03</small>
          <h4>팬 챌린지</h4>
          <p class="text-sub">이벤트와 기록 공유로 팬 활동을 이어갑니다.</p>
        </div>
        <div class="map-card">
          <small>04</small>
          <h4>커뮤니티 확장</h4>
          <p class="text-sub">리뷰, 추천, 질문을 통해 팬덤을 키웁니다.</p>
        </div>
      </div>
    </section>
  `;
}

function renderVideos() {
  app.innerHTML = `
    <div class="fade-in">
      <div class="section-head">
        <h2>🎬 수노폭스 유튜브 영상</h2>
        <span>${CHANNEL_URL.replace('https://', '')}</span>
      </div>
      <div class="panel video-panel">
        <div class="video-copy">
          <h3>최신 영상과 플레이리스트</h3>
          <p class="text-sub">
            수노폭스 채널의 최신 영상과 추천 재생목록을 모아 보여줍니다.
            팬들의 감상 포인트도 함께 모아보세요.
          </p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${CHANNEL_URL}" target="_blank" rel="noreferrer">유튜브 채널 방문</a>
            <a class="btn btn-outline" href="#community">팬 토론 참여</a>
          </div>
        </div>
        <div class="embed">
          <iframe
            class="frame"
            title="SunoFox Playlist"
            src="https://www.youtube.com/embed/videoseries?list=${FEATURED_PLAYLIST}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
        </div>
      </div>
      <div class="section-head">
        <h2>팬페이지 하이라이트</h2>
        <span>토론 & 추천</span>
      </div>
      <div class="grid-three">
        <div class="card feature-card">
          <h3>🎧 추천 영상 토론</h3>
          <p>이번 주 인기 영상 감상평을 모아봅니다.</p>
        </div>
        <div class="card feature-card">
          <h3>📌 다음 콘텐츠 제안</h3>
          <p>보고 싶은 주제를 팬들이 직접 제안합니다.</p>
        </div>
        <div class="card feature-card">
          <h3>💬 팬 토론 모음</h3>
          <p>영상별 스레드를 만들어 함께 이야기해요.</p>
        </div>
      </div>
      <div class="section-head">
        <h2>최신 업로드</h2>
        <span>자동 업데이트 (채널 ID 설정 필요)</span>
      </div>
      <div id="latest-videos" class="video-grid"></div>
    </div>
  `;
  loadLatestVideos();
}

function renderArcade() {
  app.innerHTML = `
    <div class="fade-in">
      <h2 class="page-title">🕹️ 미니게임 아케이드</h2>
      <div class="game-intro">
        <p class="text-sub">기록을 세우고 커뮤니티에 공유해보세요. 상위 랭킹은 주간 하이라이트에 노출됩니다.</p>
        <div class="badge"><strong>CHALLENGE</strong> 반응속도 0.20s 미만 달성하기</div>
      </div>
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
      </div>
      <div id="game-container" class="game-container"></div>
    </div>
  `;

  const container = document.getElementById('game-container');
  const tabs = document.querySelectorAll('.game-tabs .tab-btn');
  
  const setGame = (type) => {
    if (activeGame?.destroy) activeGame.destroy();
    container.innerHTML = '';
    if (type === 'reaction') activeGame = new ReactionGame(container);
    if (type === 'memory') activeGame = new MemoryGame(container);
    if (type === 'rhythm') activeGame = new RhythmGame(container);
    if (type === 'puzzle') activeGame = new PuzzleGame(container);
    if (type === 'math') activeGame = new MathGame(container);
    if (type === 'rps') activeGame = new RpsGame(container);
    if (type === 'number') activeGame = new NumberMemoryGame(container);
    if (type === 'typing') activeGame = new TypingGame(container);
    if (type === 'reflex') activeGame = new ReflexGame(container);
    if (type === 'maze') activeGame = new MazeGame(container);
    if (type === 'dodge') activeGame = new DodgeGame(container);
  };

  // Default game
  setGame('reaction');

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const gameType = e.target.dataset.game;
      setGame(gameType);
    });
  });
}

function renderTests() {
  app.innerHTML = `
    <div class="fade-in">
      <div class="section-head">
        <h2>🧪 심리테스트</h2>
        <span>짧고 공유 가능한 결과</span>
      </div>
      <div class="panel test-panel">
        <div>
          <h3>나의 OST 무드 타입</h3>
          <p class="text-sub">10문항으로 알아보는 감정선 타입 테스트입니다.</p>
          <div class="badge"><strong>TIP</strong> 결과 카드를 커뮤니티에 공유하세요</div>
        </div>
        <div id="test-container" class="game-container"></div>
      </div>
      <div class="grid-three">
        <div class="card feature-card">
          <h3>🎼 추천 OST 카드</h3>
          <p>결과에 맞는 추천 OST를 받아보세요.</p>
        </div>
        <div class="card feature-card">
          <h3>📣 결과 공유</h3>
          <p>커뮤니티에 테스트 결과를 공유할 수 있습니다.</p>
        </div>
        <div class="card feature-card">
          <h3>🗳️ 팬 취향 투표</h3>
          <p>다음 테스트 주제를 함께 정하세요.</p>
        </div>
      </div>
    </div>
  `;
  const container = document.getElementById('test-container');
  if (activeGame?.destroy) activeGame.destroy();
  container.innerHTML = '';
  activeGame = new PersonalityTest(container);
}

function renderLounge() {
  const categories = ['전체', '영상', '게임', '심리테스트', '잡담', '질문', '정보', '후기', '유머', '창작', '추천'];
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
    try {
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
    } catch (error) {
      console.error('Failed to load lounge posts:', error);
      document.getElementById('lounge-list').innerHTML = '<div class="empty">글을 불러오지 못했습니다.</div>';
    }
  };

  renderCategories();
  renderList();
  document.getElementById('write-lounge-btn').addEventListener('click', () => openWriteModal('lounge', null, renderList));
}

function renderCommunity() {
  app.innerHTML = `
    <div class="community-layout fade-in">
      <div class="toolbar">
        <h2 class="page-title">커뮤니티</h2>
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
    try {
      const posts = await Store.getPosts('community');
      const commentCounts = await Promise.all(
        posts.map(p => Store.getComments(p.id, p.legacyId).then(c => c.length).catch(() => 0))
      );
      const listHtml = posts.map((post, idx) => `
        <div class="post-row" data-id="${post.id}">
          <span class="col-cat"><span class="chip micro">${post.category}</span></span>
        <span class="col-title">${post.title} <span class="comment-count">[${commentCounts[idx]}]</span></span>
          <span class="col-author">${post.author}</span>
          <span class="col-meta">${post.views} / ${post.likes}</span>
        </div>
      `).join('');
      document.getElementById('community-list').innerHTML = listHtml || '<div class="empty">게시글이 없습니다.</div>';

      document.querySelectorAll('.post-row').forEach(item => {
          item.addEventListener('click', () => openPostModal(item.dataset.id));
      });
    } catch (error) {
      console.error('Failed to load community posts:', error);
      document.getElementById('community-list').innerHTML = '<div class="empty">게시글을 불러오지 못했습니다.</div>';
    }
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
              ${isAdmin ? '<p class="text-sub highlight">✨ 관리자 권한 활성화됨</p>' : ''}
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
              <button id="login-btn" class="btn btn-primary full-width mt-4">이메일/비밀번호로 로그인</button>
              <button id="signup-btn" class="btn btn-secondary full-width mt-2">이메일/비밀번호로 회원가입</button>
              <div class="divider">또는</div>
              <button id="google-login-btn" class="btn btn-outline full-width mt-2">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" style="height: 1.2em; vertical-align: middle; margin-right: 8px;">
                  Google로 로그인
              </button>
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
    
    document.getElementById('google-login-btn').addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            alert('Google 로그인 성공!');
        } catch (error) {
            console.error('Google login error:', error);
            alert('Google 로그인 실패: ' + error.message);
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
                ? ['영상', '게임', '심리테스트', '잡담', '질문', '정보', '후기', '유머', '창작', '추천'].map(c => `<option value="${c}">${c}</option>`).join('')
                : ['영상', '게임 기록', '심리테스트', '추천', '질문', '공지'].map(c => `<option value="${c}" ${prefill && prefill.category && prefill.category === c ? 'selected' : ''}>${c}</option>`).join('')
            }
        </select>
        <input type="text" id="post-title" class="input" placeholder="제목" value="${prefill && prefill.title || ''}">
        <input type="text" id="post-author" class="input" placeholder="닉네임" value="${currentUser.email.split('@')[0]}" disabled>
        <textarea id="post-content" class="input textarea" placeholder="내용을 입력하세요">${prefill && prefill.content || ''}</textarea>
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
      alert('해당 게시글을 찾을 수 없습니다. 목록을 새로고침합니다.');
      router();
      return;
  }
  
  await Store.viewPost(id); // Increment view count
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay fade-in';
  
  const renderModalContent = async (currentPost) => { // Added async
    const comments = await Store.getComments(id, currentPost.legacyId); // Await comments
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
          <div class="view-content">${renderPostContent(currentPost.content)}</div>
          
          <div class="comments-section">
              <h4>댓글 (${comments.length})</h4>
              <div id="comment-list">
                ${comments.map(c => `
                  <div class="comment">
                      <strong>${c.author}</strong> <span class="date">${new Date(c.date).toLocaleTimeString()}</span>
                      <p>${c.content}</p>
                      ${(currentUser && (currentUser.uid === c.authorId || isAdmin)) 
                        ? `<button class="btn btn-danger btn-sm delete-comment-btn" data-comment-id="${c.id}">삭제</button>` : ''}
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
                    ? `<button id="delete-post-btn" class="btn btn-danger">🗑️ 글 삭제</button>` : ''}
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
                try {
                    await Store.deletePost(id); 
                    alert('게시글이 삭제되었습니다.');
                    close();
                    router(); // Refresh current view
                } catch (error) {
                    console.error("Error deleting post:", error);
                    alert("게시글 삭제에 실패했습니다. 관리자 권한이 있는지, 보안 규칙이 올바른지 확인해주세요.");
                }
            }
        });
    }

    modal.querySelectorAll('.delete-comment-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const commentId = e.target.dataset.commentId;
            if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
                try {
                    await Store.deleteComment(commentId);
                    alert('댓글이 삭제되었습니다.');
                    renderModalContent(currentPost); // Re-render comments
                } catch (error) {
                    console.error("Error deleting comment:", error);
                    alert("댓글 삭제에 실패했습니다. 관리자 권한이 있는지, 보안 규칙이 올바른지 확인해주세요.");
                }
            }
        });
    });

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
  // Store.viewPost(id); // Increment view count via Store
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

async function loadLatestVideos() {
  const container = document.getElementById('latest-videos');
  if (!container) return;
  if (!CHANNEL_ID) {
    container.innerHTML = '<div class="empty">채널 ID 설정이 필요합니다. (YouTube RSS)</div>';
    return;
  }
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const res = await fetch(rssUrl);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, 'text/xml');
    const entries = Array.from(xml.getElementsByTagName('entry')).slice(0, 6);
    const cards = entries.map((entry) => {
      const title = entry.getElementsByTagName('title')[0]?.textContent || 'Untitled';
      const link = entry.getElementsByTagName('link')[0]?.getAttribute('href') || CHANNEL_URL;
      const published = entry.getElementsByTagName('published')[0]?.textContent || '';
      const videoId = entry.getElementsByTagName('yt:videoId')[0]?.textContent || link.split('v=')[1] || '';
      const thumb = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
      const dateText = published ? new Date(published).toLocaleDateString() : '';
      return `
        <a class="video-card" href="${link}" target="_blank" rel="noreferrer">
          <div class="thumb" style="background-image:url('${thumb}')"></div>
          <div class="video-meta">
            <h4>${escapeHTML(title)}</h4>
            <span>${dateText}</span>
          </div>
        </a>
      `;
    }).join('');
    container.innerHTML = cards || '<div class="empty">영상이 없습니다.</div>';
  } catch (error) {
    console.error('Failed to load YouTube RSS:', error);
    container.innerHTML = '<div class="empty">최신 영상을 불러오지 못했습니다.</div>';
  }
}

function escapeHTML(str = '') {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

function renderPostContent(raw = '') {
  const text = escapeHTML(raw);
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = raw.match(urlRegex) || [];
  let html = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`);
  const embeds = urls
    .map((u) => buildYouTubeEmbed(u))
    .filter(Boolean)
    .map((src) => `<div class="post-embed"><iframe class="frame" src="${src}" allowfullscreen></iframe></div>`)
    .join('');
  return `${html}${embeds ? `<div class="post-embeds">${embeds}</div>` : ''}`;
}

function buildYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    let id = '';
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1);
    } else if (u.searchParams.get('v')) {
      id = u.searchParams.get('v');
    }
    if (!id) return '';
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return '';
  }
}
