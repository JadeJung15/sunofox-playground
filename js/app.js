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
  signInWithPopup,     // New import
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";


const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const adminNavLink = document.querySelector('.nav-link.admin-only');

let currentRoute = null;
let activeGame = null;

let currentUser = null; // To store authenticated user info
let isAdmin = false;    // To store admin status
let adminMaintenanceDone = false;

const TIERS = [
  { name: 'Rookie', label: '루키', min: 0, className: 'tier-rookie' },
  { name: 'Bronze', label: '브론즈', min: 80, className: 'tier-bronze' },
  { name: 'Silver', label: '실버', min: 200, className: 'tier-silver' },
  { name: 'Gold', label: '골드', min: 400, className: 'tier-gold' },
  { name: 'Platinum', label: '플래티넘', min: 700, className: 'tier-platinum' },
  { name: 'Diamond', label: '다이아', min: 1100, className: 'tier-diamond' },
];
const POINTS = {
  post: 15,
  comment: 5,
  like: 1,
  dailyLogin: 8
};

const CHANNEL_URL = 'https://youtube.com/@sunofox';
const FEATURED_PLAYLIST = 'PLP7_j0_nQXuEv-ny2l03vgreGyTvLhmD0';
const CHANNEL_ID = 'UC8M-2aXbknDT3tDcN1PMvuQ';

const LINKTREE_LINKS = [
  { label: 'YouTube | 수노폭스', url: 'https://www.youtube.com/@sunofox' },
  { label: 'Spotify | 수노폭스', url: 'https://open.spotify.com/artist/5fzr4xqw1e0c5cI8dVj11D?si=lYMzkqudQDmpVKgzkG18Kg' },
  { label: 'Apple Music | 수노폭스', url: 'https://music.apple.com/kr/artist/%EC%88%98%EB%85%B8%ED%8F%AD%EC%8A%A4/1874158480' },
  { label: 'SunoFox - Topic', url: 'https://music.youtube.com/channel/UCjPuy8z0pdzW3OVUXka0lMw?si=2ljpP0CVll5jXeQe' },
  { label: 'SoundCloud | 수노폭스', url: 'https://www.soundcloud.com/sunopogseu?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing' },
  { label: 'FLO | 수노폭스', url: 'https://www.music-flo.com/detail/artist/413342628/track?sortType=POPULARITY&roleType=ALL' },
  { label: 'Bugs | 수노폭스', url: 'https://music.bugs.co.kr/artist/14591489' },
  { label: 'VIBE (바이브)', url: 'https://vibe.naver.com/artist/10398991' },
  { label: 'TIDAL | 수노폭스', url: 'https://tidal.com/artist/73947996/u' }
];

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
  if (currentUser) {
    try {
      await Store.ensureUserProfile(currentUser.uid, getDisplayName());
      await awardDailyLoginPoints();
    } catch (error) {
      console.warn('Failed to ensure user profile:', error);
    }
  }
  if (isAdmin && !adminMaintenanceDone) {
    adminMaintenanceDone = true;
    try {
      await Store.cleanupDummyPosts();
      await Store.ensureAnnouncements();
    } catch (error) {
      console.warn('Admin maintenance failed:', error);
    }
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
  const linkButtons = LINKTREE_LINKS.map((item) => (
    `<a class="link-btn" href="${item.url}" target="_blank" rel="noreferrer">${item.label}</a>`
  )).join('');
  app.innerHTML = `
    <section class="stream-hero fade-in">
      <div class="stream-grid">
        <div class="stream-card">
          <div class="stream-header">
            <div>
              <div class="news-tag">SunoFox Fanpage</div>
              <h1 class="stream-title">수노폭스 유튜브 팬을 위한<br>스트리밍 허브</h1>
              <p class="stream-meta">최신 영상, 재생목록, 팬 토론을 한 화면에 모았습니다.</p>
            </div>
            <div class="badge"><strong>LIVE</strong> 팬클럽 뉴스룸</div>
          </div>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${CHANNEL_URL}" target="_blank" rel="noreferrer">유튜브 구독하기</a>
            <a class="btn btn-secondary" href="#videos">최신 영상 보기</a>
            <a class="btn btn-outline" href="#community">팬 토론 참여</a>
          </div>
          <div class="stat-grid mt-4">
            <div class="stat-card">
              <span class="stat-label">팬페이지</span>
              <strong>수노폭스 전용 허브</strong>
            </div>
            <div class="stat-card">
              <span class="stat-label">영상 업데이트</span>
              <strong>최신 업로드 자동 수집</strong>
            </div>
            <div class="stat-card">
              <span class="stat-label">팬클럽</span>
              <strong>리뷰 · 토론 · 질문</strong>
            </div>
          </div>
        </div>
        <div class="stream-card">
          <div class="section-head">
            <h2>Now Playing</h2>
            <span>대표 플레이리스트</span>
          </div>
          <div class="embed">
            <iframe
              class="frame"
              title="SunoFox Playlist"
              src="https://www.youtube.com/embed/videoseries?list=${FEATURED_PLAYLIST}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen></iframe>
          </div>
          <div class="hero-actions mt-2">
            <a class="btn btn-outline full-width" href="${CHANNEL_URL}" target="_blank" rel="noreferrer">채널 바로가기</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section fade-in">
      <div class="section-head">
        <h2>Latest Drops</h2>
        <span>팬들이 바로 확인하는 영상</span>
      </div>
      <div class="rail-grid">
        <div class="rail-tile">
          <strong>최신 업로드</strong>
          <span>신규 영상이 올라오면 가장 먼저 확인하세요.</span>
        </div>
        <div class="rail-tile">
          <strong>시리즈 재생목록</strong>
          <span>장기 시리즈를 한 번에 정주행합니다.</span>
        </div>
        <div class="rail-tile">
          <strong>팬 추천 클립</strong>
          <span>팬들이 추천한 장면을 큐레이션합니다.</span>
        </div>
        <div class="rail-tile">
          <strong>하이라이트 토론</strong>
          <span>감상 포인트를 뉴스룸처럼 공유합니다.</span>
        </div>
      </div>
    </section>

    <section class="section fade-in">
      <div class="section-head">
        <h2>Fanclub Newsroom</h2>
        <span>팬클럽 매거진 & 뉴스룸</span>
      </div>
      <div class="newsroom-grid">
        <a href="#community" class="news-card">
          <div class="news-tag">DISCUSSION</div>
          <h4>이번 주 팬 토론 스레드</h4>
          <p>인상 깊었던 장면, 사운드 포인트를 공유하세요.</p>
        </a>
        <a href="#community" class="news-card">
          <div class="news-tag">FEATURE</div>
          <h4>팬 추천 콘텐츠 모음</h4>
          <p>팬들이 선정한 베스트 영상 리스트입니다.</p>
        </a>
        <a href="#arcade" class="news-card">
          <div class="news-tag">EVENT</div>
          <h4>팬 챌린지 기록전</h4>
          <p>게임 기록을 공유하고 랭킹에 도전하세요.</p>
        </a>
        <a href="#tests" class="news-card">
          <div class="news-tag">POLL</div>
          <h4>다음 콘텐츠 아이디어 투표</h4>
          <p>팬들이 원하는 주제를 모아봅니다.</p>
        </a>
      </div>
    </section>

    <section class="section fade-in">
      <div class="section-head">
        <h2>Listen & Follow</h2>
        <span>수노폭스 공식 링크 모음</span>
      </div>
      <div class="link-grid">
        ${linkButtons}
      </div>
    </section>
  `;
}

function renderVideos() {
  const linkButtons = LINKTREE_LINKS.map((item) => (
    `<a class="link-btn" href="${item.url}" target="_blank" rel="noreferrer">${item.label}</a>`
  )).join('');
  app.innerHTML = `
    <div class="fade-in">
      <div class="section-head">
        <h2>🎬 수노폭스 유튜브 영상</h2>
        <span>${CHANNEL_URL.replace('https://', '')}</span>
      </div>
      <div class="stream-grid">
        <div class="stream-card">
          <div class="stream-header">
            <div>
              <div class="news-tag">FEATURED</div>
              <h3>대표 플레이리스트</h3>
              <p class="text-sub">팬들이 사랑하는 영상 모음입니다.</p>
            </div>
            <div class="badge"><strong>CURATED</strong> 팬 선택</div>
          </div>
          <div class="embed">
            <iframe
              class="frame"
              title="SunoFox Playlist"
              src="https://www.youtube.com/embed/videoseries?list=${FEATURED_PLAYLIST}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen></iframe>
          </div>
          <div class="hero-actions mt-2">
            <a class="btn btn-primary" href="${CHANNEL_URL}" target="_blank" rel="noreferrer">유튜브 채널 방문</a>
            <a class="btn btn-outline" href="#community">팬 토론 참여</a>
          </div>
        </div>
        <div class="stream-card">
          <div class="section-head">
            <h2>Fan Highlights</h2>
            <span>뉴스룸 하이라이트</span>
          </div>
          <div class="newsroom-grid">
            <a href="#community" class="news-card">
              <div class="news-tag">REVIEW</div>
              <h4>최신 영상 리뷰</h4>
              <p>팬들이 남긴 리뷰와 해석을 모읍니다.</p>
            </a>
            <a href="#videos" class="news-card">
              <div class="news-tag">ARCHIVE</div>
              <h4>시리즈 정주행</h4>
              <p>시리즈별 재생목록을 한 번에 확인하세요.</p>
            </a>
            <a href="#community" class="news-card">
              <div class="news-tag">REQUEST</div>
              <h4>다음 주제 제안</h4>
              <p>팬이 원하는 영상 주제를 투표합니다.</p>
            </a>
            <a href="#community" class="news-card">
              <div class="news-tag">MEMORY</div>
              <h4>명장면 기록</h4>
              <p>베스트 장면과 사운드 포인트를 공유합니다.</p>
            </a>
          </div>
        </div>
      </div>
      <div class="section-head">
        <h2>최신 업로드</h2>
        <span>자동 업데이트</span>
      </div>
      <div id="latest-videos" class="video-grid"></div>
      <div class="section-head">
        <h2>Listen & Follow</h2>
        <span>수노폭스 공식 링크 모음</span>
      </div>
      <div class="link-grid">
        ${linkButtons}
      </div>
    </div>
  `;
  loadLatestVideos();
}

function renderArcade() {
  app.innerHTML = `
    <div class="fade-in">
      <h2 class="page-title">🕹️ 팬클럽 챌린지</h2>
      <div class="game-intro">
        <p class="text-sub">팬들이 함께 즐기는 이벤트 공간입니다. 기록을 공유하고 하이라이트에 도전하세요.</p>
        <div class="badge"><strong>EVENT</strong> 이번 주 랭킹 도전전</div>
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
        <h2>🧪 팬클럽 테스트</h2>
        <span>팬 참여 콘텐츠</span>
      </div>
      <div class="panel test-panel">
        <div>
          <h3>나의 수노폭스 감상 타입</h3>
          <p class="text-sub">팬들이 함께 즐기는 짧은 참여형 테스트입니다.</p>
          <div class="badge"><strong>TIP</strong> 결과를 팬클럽에 공유하세요</div>
        </div>
        <div id="test-container" class="game-container"></div>
      </div>
      <div class="grid-three">
        <div class="card feature-card">
          <h3>🎼 팬 추천 카드</h3>
          <p>팬들이 추천한 콘텐츠를 확인합니다.</p>
        </div>
        <div class="card feature-card">
          <h3>📣 결과 공유</h3>
          <p>팬클럽 뉴스룸에 테스트 결과를 올려주세요.</p>
        </div>
        <div class="card feature-card">
          <h3>🗳️ 팬 투표</h3>
          <p>다음 콘텐츠 주제를 함께 정하세요.</p>
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
        <h2 class="page-title">팬 라운지 <small id="current-cat-title">/ 전체</small></h2>
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
        <h2 class="page-title">팬클럽 뉴스룸</h2>
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
    app.innerHTML = `
      <section class="profile-section fade-in">
        <h2 class="page-title">👤 내 프로필</h2>
        <div class="profile-card card" id="profile-card-loading">
          <p class="text-sub">프로필 정보를 불러오는 중...</p>
        </div>
      </section>
    `;
    loadProfileView();
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

async function loadProfileView() {
  if (!currentUser) return;
  const [profile, logs, leaderboard] = await Promise.all([
    Store.getUserProfile(currentUser.uid),
    Store.getPointLogs(currentUser.uid, 12),
    Store.getLeaderboard(8)
  ]);
  const points = profile?.points || 0;
  const tier = computeTier(points);
  const nextTier = TIERS.find(t => t.min > points);
  const progressText = nextTier ? `${nextTier.min - points}점 더 모으면 ${nextTier.label}` : '최고 등급입니다';

  const logHtml = logs.length
    ? logs.map(l => `
        <div class="log-row">
          <span>${formatReason(l.reason)}</span>
          <span class="${l.delta >= 0 ? 'log-plus' : 'log-minus'}">${l.delta >= 0 ? '+' : ''}${l.delta}P</span>
          <span class="log-date">${new Date(l.date).toLocaleDateString()}</span>
        </div>
      `).join('')
    : '<div class="empty">포인트 기록이 없습니다.</div>';

  const leaderboardHtml = leaderboard.length
    ? leaderboard.map((u, idx) => `
        <div class="leader-row">
          <span class="rank">#${idx + 1}</span>
          <span class="name">${u.displayName || u.uid?.slice(0, 6) || '팬'}</span>
          <span class="pts">${u.points || 0}P</span>
        </div>
      `).join('')
    : '<div class="empty">랭킹 데이터가 없습니다.</div>';

  document.getElementById('profile-card-loading').innerHTML = `
    <div class="tier-panel">
      <h3>환영합니다, ${getDisplayName()}!</h3>
      <p>UID: ${currentUser.uid}</p>
      ${isAdmin ? '<p class="text-sub highlight">✨ 관리자 권한 활성화됨</p>' : ''}
      <p>가입일: ${new Date(currentUser.metadata.creationTime).toLocaleDateString()}</p>
      <div class="mt-2">
        <span class="tier-badge ${tier.className}">${tier.label}</span>
      </div>
      <div class="stat-grid mt-4">
        <div class="stat-card">
          <span class="stat-label">포인트</span>
          <strong>${points} P</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">등급</span>
          <strong>${tier.label}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">다음 등급</span>
          <strong>${progressText}</strong>
        </div>
      </div>
    </div>
    <div class="card mt-4">
      <h4>포인트 규칙</h4>
      <p class="text-sub">게시글 +${POINTS.post} · 댓글 +${POINTS.comment} · 좋아요 +${POINTS.like} · 출석 +${POINTS.dailyLogin}</p>
    </div>
    <div class="card mt-4">
      <h4>포인트 히스토리</h4>
      <div class="log-list">${logHtml}</div>
    </div>
    <div class="card mt-4">
      <h4>팬클럽 리더보드</h4>
      <div class="leader-list">${leaderboardHtml}</div>
    </div>
    <div class="mt-4">
      <label for="nickname-input">닉네임</label>
      <input type="text" id="nickname-input" class="input" placeholder="닉네임" value="${currentUser.displayName || ''}">
      <button id="save-nickname-btn" class="btn btn-primary full-width mt-2">닉네임 변경</button>
    </div>
    <button id="logout-btn" class="btn btn-secondary full-width mt-4">로그아웃</button>
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
  document.getElementById('save-nickname-btn').addEventListener('click', async () => {
    const nickname = document.getElementById('nickname-input').value.trim();
    if (!nickname) return alert('닉네임을 입력해주세요.');
    try {
      await updateProfile(currentUser, { displayName: nickname });
      await Store.updateUserProfile(currentUser.uid, { displayName: nickname });
      alert('닉네임이 변경되었습니다.');
      router();
    } catch (error) {
      console.error('Update profile error:', error);
      alert('닉네임 변경에 실패했습니다.');
    }
  });
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
        <input type="text" id="post-author" class="input" placeholder="닉네임" value="${getDisplayName()}" disabled>
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
    await awardPoints(POINTS.post, 'post');
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
                  <input type="text" id="comment-author" placeholder="닉네임" class="input small" value="${currentUser ? getDisplayName() : ''}" ${currentUser ? 'disabled' : ''}>
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
       await awardPoints(POINTS.like, 'like');
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
            await awardPoints(POINTS.comment, 'comment');
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

function getDisplayName() {
  if (!currentUser) return '';
  return currentUser.displayName || currentUser.email?.split('@')[0] || '팬';
}

async function awardPoints(delta, reason = '') {
  if (!currentUser || !delta) return;
  const profile = await Store.getUserProfile(currentUser.uid);
  const currentPoints = profile?.points || 0;
  const newPoints = currentPoints + delta;
  const tier = computeTier(newPoints);
  await Store.addPoints(currentUser.uid, delta, tier.name);
  if (reason) {
    await Store.addPointLog({ uid: currentUser.uid, delta, reason });
  }
}

function computeTier(points) {
  let tier = TIERS[0];
  TIERS.forEach(t => {
    if (points >= t.min) tier = t;
  });
  return tier;
}

async function awardDailyLoginPoints() {
  if (!currentUser) return;
  const today = new Date().toISOString().slice(0, 10);
  const profile = await Store.getUserProfile(currentUser.uid);
  if (!profile) return;
  if (profile.lastLoginDate !== today) {
    await Store.updateUserProfile(currentUser.uid, { lastLoginDate: today });
    await awardPoints(POINTS.dailyLogin, 'daily_login');
  }
}

function formatReason(reason) {
  switch (reason) {
    case 'post': return '게시글 작성';
    case 'comment': return '댓글 작성';
    case 'like': return '좋아요';
    case 'daily_login': return '출석 보너스';
    default: return '포인트 적립';
  }
}
