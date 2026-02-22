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
const YT_API_KEY_STORAGE = 'sunofox_youtube_api_key';

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
  '#videos': renderHome,
  '#community': renderHome,
  '#arcade': renderHome,
  '#profile': renderProfile,
  '#admin': renderAdmin
};

function router() {
  const hash = window.location.hash || '#home';
  const homeHashes = new Set(['#home', '#videos', '#community', '#arcade']);
  if (!homeHashes.has(hash) && activeGame?.destroy) {
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
  if (hash === '#videos') document.getElementById('live-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (hash === '#community') document.getElementById('community-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (hash === '#arcade') document.getElementById('play-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    try {
      // Get custom claims to check for admin role
      const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh token
      isAdmin = idTokenResult.claims.admin || false;
    } catch (error) {
      console.warn('Failed to load auth claims:', error);
      isAdmin = false;
    }
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
    <section class="sf-hero fade-in">
      <p class="sf-kicker">SunoFox Community Hub</p>
      <h1>수노폭스 팬을 위한<br>공식 커뮤니티 허브</h1>
      <p class="sf-sub">최신 콘텐츠 탐색, 팬 토론, 커뮤니티 참여를 한 곳에서 연결합니다.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${CHANNEL_URL}" target="_blank" rel="noreferrer">유튜브 채널</a>
        <a class="btn btn-outline" href="#community">커뮤니티 참여</a>
      </div>
    </section>

    <section class="sf-grid fade-in">
      <article class="sf-card sf-main">
        <h2>대표 플레이리스트</h2>
        <div class="embed">
          <iframe class="frame" title="SunoFox Playlist" src="https://www.youtube.com/embed/videoseries?list=${FEATURED_PLAYLIST}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
      </article>
      <article class="sf-card">
        <h3>커뮤니티 가이드</h3>
        <ul class="sf-list">
          <li><a href="#videos">최신 영상 아카이브 확인</a></li>
          <li><a href="#community">팬 게시글 작성 및 토론 참여</a></li>
          <li><a href="${CHANNEL_URL}/community" target="_blank" rel="noreferrer">유튜브 커뮤니티 공지 확인</a></li>
        </ul>
      </article>
    </section>

    <section class="section fade-in">
      <div class="section-head">
        <h2>오늘의 코멘트</h2>
        <span>팬 메시지</span>
      </div>
      <div id="advice-section" class="sf-card">
        <p id="advice-text">로딩 중...</p>
      </div>
    </section>

    <section id="live-section" class="section fade-in">
      <div class="section-head">
        <h2>Live</h2>
        <span>최신 영상</span>
      </div>
      <div id="latest-videos" class="video-grid"></div>
    </section>

    <section id="community-section" class="section fade-in">
      <div class="toolbar sf-card">
        <h2 class="page-title">Community</h2>
        <div class="actions">
          <button id="write-comm-btn-home" class="btn btn-primary">글쓰기</button>
        </div>
      </div>
      <div class="post-table-header">
        <span class="col-cat">분류</span>
        <span class="col-title">제목</span>
        <span class="col-author">작성자</span>
        <span class="col-meta">조회/추천</span>
      </div>
      <div id="community-list-home" class="post-list-table sf-card"></div>
    </section>

    <section id="play-section" class="section fade-in">
      <div class="section-head">
        <h2>Play</h2>
        <span>팬 챌린지 아케이드</span>
      </div>
      <div class="arcade-meta sf-card">
        <div>
          <h3 id="arcade-meta-title">반응속도 테스트</h3>
          <p id="arcade-meta-desc" class="text-sub">신호가 뜨는 순간 반응하세요. 최근 평균 기록까지 확인할 수 있어요.</p>
        </div>
        <div class="arcade-meta-grid">
          <div class="stat-card"><span class="stat-label">난이도</span><strong id="arcade-meta-level">입문</strong></div>
          <div class="stat-card"><span class="stat-label">조작</span><strong id="arcade-meta-control">클릭 / 스페이스바</strong></div>
        </div>
      </div>
      <div class="game-tabs">
        <button class="tab-btn active" data-game="reaction">반응속도</button>
        <button class="tab-btn" data-game="memory">기억력</button>
        <button class="tab-btn" data-game="rhythm">리듬</button>
        <button class="tab-btn" data-game="puzzle">퍼즐</button>
        <button class="tab-btn" data-game="math">스피드 합산</button>
        <button class="tab-btn" data-game="rps">블랙잭</button>
        <button class="tab-btn" data-game="number">숫자 기억력</button>
        <button class="tab-btn" data-game="typing">타이핑</button>
        <button class="tab-btn" data-game="reflex">반사신경</button>
        <button class="tab-btn" data-game="maze">미로</button>
        <button class="tab-btn" data-game="dodge">낙하 피하기</button>
      </div>
      <div id="game-container" class="game-container"></div>
    </section>

    <section class="section fade-in">
      <div class="section-head">
        <h2>공식 링크</h2>
      </div>
      <div class="hub-link-list">
        ${linkButtons}
      </div>
    </section>
  `;
  fetchAdvice();
  loadLatestVideos();
  setupHomeCommunityList();
  setupHomeArcade();
}

function setupHomeCommunityList() {
  const renderList = async () => {
    try {
      const posts = await Store.getPosts('community');
      const commentCounts = await Promise.all(
        posts.map(p => Store.getComments(p.id, p.legacyId).then(c => c.length).catch(() => 0))
      );
      const listHtml = posts.map((post, idx) => `
        <div class="post-row" data-id="${post.id}">
          <span class="col-cat"><span class="chip micro">${escapeHTML(post.category || '')}</span></span>
          <span class="col-title">${escapeHTML(post.title || '')} <span class="comment-count">[${commentCounts[idx]}]</span></span>
          <span class="col-author">${escapeHTML(post.author || '')}</span>
          <span class="col-meta">${post.views} / ${post.likes}</span>
        </div>
      `).join('');
      const container = document.getElementById('community-list-home');
      if (!container) return;
      container.innerHTML = listHtml || '<div class="empty">게시글이 없습니다.</div>';
      container.querySelectorAll('.post-row').forEach(item => {
        item.addEventListener('click', () => openPostModal(item.dataset.id));
      });
    } catch (error) {
      const container = document.getElementById('community-list-home');
      if (container) container.innerHTML = '<div class="empty">게시글을 불러오지 못했습니다.</div>';
    }
  };
  renderList();
  document.getElementById('write-comm-btn-home')?.addEventListener('click', () => openWriteModal('community', null, renderList));
}

function setupHomeArcade() {
  const gameMeta = {
    reaction: { title: '반응속도 테스트', level: '입문', control: '클릭 / 스페이스바', desc: '신호가 뜨는 순간 반응하세요. 최근 평균 기록까지 확인할 수 있어요.' },
    memory: { title: '기억력', level: '입문', control: '마우스 클릭', desc: '카드를 맞추며 기억력과 정확도를 테스트합니다.' },
    rhythm: { title: '리듬 레인 러시', level: '중급', control: 'A / S / D', desc: '3개 레인을 정확한 타이밍으로 타격해 콤보를 유지하세요.' },
    puzzle: { title: '2048 챌린지', level: '중급', control: '방향키', desc: '타일을 합쳐 256 목표를 달성하세요.' },
    math: { title: '스피드 합산', level: '중급', control: '키보드 입력', desc: '수학 문제를 빠르게 풀어 점수를 올리세요.' },
    rps: { title: '블랙잭 러시', level: '중급', control: '히트 / 스탠드', desc: '21을 넘기지 않으면서 딜러를 이겨보세요.' },
    number: { title: '숫자 기억력', level: '중급', control: '키보드 입력', desc: '점점 길어지는 숫자 시퀀스를 기억하세요.' },
    typing: { title: '타이핑', level: '중급', control: '키보드 입력', desc: '정확도와 WPM을 동시에 겨루는 타이핑 게임입니다.' },
    reflex: { title: '리플렉스 듀얼', level: '중급', control: '← / →', desc: '표시된 방향을 빠르게 입력하세요.' },
    maze: { title: '미로', level: '중급', control: '방향키 / 버튼', desc: '최단 동선으로 미로를 탈출하세요.' },
    dodge: { title: '낙하 피하기', level: '상급', control: '좌/우 방향키', desc: '떨어지는 장애물을 오래 피하세요.' }
  };

  const container = document.getElementById('game-container');
  const tabs = document.querySelectorAll('.game-tabs .tab-btn');
  const metaTitle = document.getElementById('arcade-meta-title');
  const metaDesc = document.getElementById('arcade-meta-desc');
  const metaLevel = document.getElementById('arcade-meta-level');
  const metaControl = document.getElementById('arcade-meta-control');
  if (!container || !metaTitle || !metaDesc || !metaLevel || !metaControl) return;

  const setGame = (type) => {
    if (activeGame?.destroy) activeGame.destroy();
    container.innerHTML = '';
    const meta = gameMeta[type];
    if (meta) {
      metaTitle.textContent = meta.title;
      metaDesc.textContent = meta.desc;
      metaLevel.textContent = meta.level;
      metaControl.textContent = meta.control;
    }
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

  setGame('reaction');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      setGame(e.target.dataset.game);
    });
  });
}

async function fetchAdvice() {
  const el = document.getElementById('advice-text');
  if (!el) return;
  const comments = [
    '오늘도 수노폭스와 함께 좋은 리듬으로 시작해요.',
    '짧게 웃고 길게 즐기자, 팬 허브 오픈!',
    '좋아하는 장면은 커뮤니티에 바로 공유해 주세요.',
    '이번 주 목표: 영상 1편 감상 + 게임 1판 클리어.',
    '응원 한마디가 팬 허브 분위기를 바꿉니다.'
  ];
  const idx = Math.floor(Math.random() * comments.length);
  el.textContent = comments[idx];
}

function renderVideos() {
  const linkButtons = LINKTREE_LINKS.map((item) => (
    `<a class="link-btn" href="${item.url}" target="_blank" rel="noreferrer">${item.label}</a>`
  )).join('');
  app.innerHTML = `
    <section class="sf-hero sf-hero-slim fade-in">
      <p class="sf-kicker">Live</p>
      <h1>최신 영상 모아보기</h1>
      <p class="sf-sub">수노폭스 최신 업로드를 팬페이지에서 바로 확인합니다.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${CHANNEL_URL}" target="_blank" rel="noreferrer">채널 방문</a>
        <a class="btn btn-outline" href="#community">팬 후기 보기</a>
      </div>
    </section>

    <section class="section fade-in">
      <div class="section-head">
        <h2>최신 업로드</h2>
        <span>YouTube 자동 동기화 · 더 많은 목록</span>
      </div>
      <div id="latest-videos" class="video-grid"></div>
    </section>

    <section class="section fade-in">
      <div class="sf-card">
        <h2>대표 플레이리스트</h2>
        <div class="embed">
          <iframe class="frame" title="SunoFox Playlist" src="https://www.youtube.com/embed/videoseries?list=${FEATURED_PLAYLIST}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
      </div>
    </section>

    <section class="section fade-in">
      <div class="section-head">
        <h2>공식 링크</h2>
        <span>공식 링크</span>
      </div>
      <div class="hub-link-list">
        ${linkButtons}
      </div>
    </section>
  `;
  loadLatestVideos();
}

function renderArcade() {
  const gameMeta = {
    reaction: { title: '반응속도', level: '입문', control: '클릭 / 스페이스바', desc: '신호가 뜨는 순간 반응하세요. 최근 평균 기록까지 확인할 수 있어요.' },
    memory: { title: '기억력', level: '입문', control: '마우스 클릭', desc: '카드를 맞추며 기억력과 정확도를 테스트합니다.' },
    rhythm: { title: '리듬 레인 러시', level: '중급', control: 'A / S / D', desc: '3개 레인을 정확한 타이밍으로 타격해 콤보를 유지하세요.' },
    puzzle: { title: '2048 챌린지', level: '중급', control: '방향키', desc: '타일을 합쳐 256 목표를 달성하세요. 적은 이동 수가 핵심입니다.' },
    math: { title: '스피드 합산', level: '중급', control: '키보드 입력', desc: '덧셈/뺄셈/곱셈을 빠르게 풀어 콤보 점수를 획득하세요.' },
    rps: { title: '블랙잭 러시', level: '중급', control: '히트 / 스탠드', desc: '21을 넘기지 않으면서 딜러를 이겨 연승 기록을 쌓아보세요.' },
    number: { title: '숫자 기억력', level: '중급', control: '키보드 입력', desc: '레벨이 오를수록 숫자 노출 속도가 빨라집니다.' },
    typing: { title: '타이핑', level: '중급', control: '키보드 입력', desc: '정확도와 WPM을 동시에 끌어올리는 집중형 게임입니다.' },
    reflex: { title: '리플렉스 듀얼', level: '중급', control: '← / →', desc: '표시된 방향을 제한 시간 안에 빠르게 입력해 점수를 쌓으세요.' },
    maze: { title: '미로', level: '중급', control: '방향키 / 버튼', desc: '이동 횟수와 시간 효율을 함께 고려한 미로 탈출 챌린지.' },
    dodge: { title: '낙하 피하기', level: '상급', control: '좌/우 방향키', desc: '시간이 지날수록 속도가 빨라지는 장애물을 회피하세요.' }
  };

  app.innerHTML = `
    <div class="fade-in fan-arcade">
      <div class="pulse-hero pulse-hero-slim">
      <div class="pulse-mark">Play</div>
        <h1>실시간 팬 챌린지 아레나</h1>
        <p>각 게임 최고 기록을 만들고 커뮤니티에서 결과를 공유하세요.</p>
        <div class="pulse-cta">
          <a class="btn btn-outline" href="#community">기록 공유하기</a>
          <a class="btn btn-outline" href="#community">전략 이야기</a>
        </div>
      </div>
      <div class="arcade-meta pulse-panel">
        <div>
          <h3 id="arcade-meta-title">반응속도 테스트</h3>
          <p id="arcade-meta-desc" class="text-sub">신호가 뜨는 순간 반응하세요. 최근 평균 기록까지 확인할 수 있어요.</p>
        </div>
        <div class="arcade-meta-grid">
          <div class="stat-card"><span class="stat-label">난이도</span><strong id="arcade-meta-level">입문</strong></div>
          <div class="stat-card"><span class="stat-label">조작</span><strong id="arcade-meta-control">클릭 / 스페이스바</strong></div>
        </div>
      </div>
      <div class="game-tabs">
        <button class="tab-btn active" data-game="reaction">반응속도</button>
        <button class="tab-btn" data-game="memory">기억력</button>
        <button class="tab-btn" data-game="rhythm">리듬</button>
        <button class="tab-btn" data-game="puzzle">퍼즐</button>
        <button class="tab-btn" data-game="math">스피드 합산</button>
        <button class="tab-btn" data-game="rps">블랙잭</button>
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
  const metaTitle = document.getElementById('arcade-meta-title');
  const metaDesc = document.getElementById('arcade-meta-desc');
  const metaLevel = document.getElementById('arcade-meta-level');
  const metaControl = document.getElementById('arcade-meta-control');
  
  const setGame = (type) => {
    if (activeGame?.destroy) activeGame.destroy();
    container.innerHTML = '';
    const meta = gameMeta[type];
    if (meta) {
      metaTitle.textContent = meta.title;
      metaDesc.textContent = meta.desc;
      metaLevel.textContent = meta.level;
      metaControl.textContent = meta.control;
    }
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
      <section class="pulse-hero pulse-hero-slim">
        <div class="pulse-mark">Test Lab</div>
        <h1>팬 성향 리포트</h1>
        <p>테스트 결과를 라운지/뉴스룸에 공유하고 비슷한 취향 팬을 찾아보세요.</p>
      </section>
      <div class="section-head">
        <h2>🧪 팬클럽 테스트</h2>
        <span>팬 참여형 인터랙션</span>
      </div>
      <div class="panel test-panel pulse-panel">
        <div>
          <h3>나의 수노폭스 감상 타입</h3>
          <p class="text-sub">팬들이 함께 즐기는 짧은 참여형 테스트입니다.</p>
          <div class="badge"><strong>TIP</strong> 결과를 팬클럽에 공유하세요</div>
        </div>
        <div id="test-container" class="game-container"></div>
      </div>
      <div class="grid-three fan-feature-grid">
        <div class="card feature-card pulse-panel">
          <h3>🎼 팬 추천 카드</h3>
          <p>팬들이 추천한 콘텐츠를 확인합니다.</p>
        </div>
        <div class="card feature-card pulse-panel">
          <h3>📣 결과 공유</h3>
          <p>팬클럽 뉴스룸에 테스트 결과를 올려주세요.</p>
        </div>
        <div class="card feature-card pulse-panel">
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
      <aside class="sidebar pulse-panel">
        <div class="sidebar-box dog-api-box pulse-mini">
            <span class="news-tag">Daily Mood</span>
            <div id="dog-img-container" class="dog-img-container">로딩 중...</div>
        </div>
        <div class="sidebar-box advice-box pulse-mini">
            <span class="news-tag">Daily Quote</span>
            <p id="kanye-quote" class="text-sub" style="font-style: italic; margin-top: 0.5rem;">로딩 중...</p>
        </div>
        <h3>토픽</h3>
        <div class="category-list" id="category-list"></div>
        <button id="write-lounge-btn" class="btn btn-primary full-width mt-4">팬 라운지 글쓰기</button>
      </aside>
      <section class="content pulse-panel">
        <h2 class="page-title">팬 라운지 <small id="current-cat-title">/ 전체</small></h2>
        <p class="text-sub">팬들이 자유롭게 소통하고 놀이 콘텐츠를 공유하는 공간입니다.</p>
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
            <span class="chip small">${escapeHTML(post.category || '')}</span>
            <span class="date">${new Date(post.date).toLocaleDateString()}</span>
          </div>
          <h4 class="post-title">${escapeHTML(post.title || '')}</h4>
          <div class="post-footer">
            <span>${escapeHTML(post.author || '')}</span>
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
  fetchDogImg();
  fetchKanyeQuote();
}

async function fetchKanyeQuote() {
    const el = document.getElementById('kanye-quote');
    if (!el) return;
    try {
        const res = await fetch('https://api.kanye.rest/');
        const data = await res.json();
        el.textContent = `"${data.quote}"`;
    } catch (e) {
        el.textContent = "Be the best version of yourself.";
    }
}

async function fetchDogImg() {
    const container = document.getElementById('dog-img-container');
    if (!container) return;
    try {
        const res = await fetch('https://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true');
        const data = await res.json();
        const imageUrl = safeExternalUrl(data[0]);
        if (!imageUrl) throw new Error('Invalid image URL');
        container.innerHTML = `<img src="${escapeHTML(imageUrl)}" alt="Dog" style="width:100%; border-radius:12px; margin-top:0.5rem; border:1px solid var(--border-color);">`;
    } catch (e) {
        container.innerHTML = "멍멍! 이미지를 불러오지 못했습니다.";
    }
}

function renderCommunity() {
  app.innerHTML = `
    <div class="community-layout fade-in sf-community">
      <section class="sf-hero sf-hero-slim">
        <p class="sf-kicker">Community</p>
        <h1>수노폭스 팬 게시판</h1>
        <p class="sf-sub">팬 글을 모아보는 커뮤니티 공간입니다.</p>
      </section>
      <div class="toolbar sf-card">
        <h2 class="page-title">팬 커뮤니티</h2>
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
      <div id="community-list" class="post-list-table sf-card"></div>
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
          <span class="col-cat"><span class="chip micro">${escapeHTML(post.category || '')}</span></span>
        <span class="col-title">${escapeHTML(post.title || '')} <span class="comment-count">[${commentCounts[idx]}]</span></span>
          <span class="col-author">${escapeHTML(post.author || '')}</span>
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
        <div class="profile-card card fan-card" id="profile-card-loading">
          <p class="text-sub">프로필 정보를 불러오는 중...</p>
        </div>
      </section>
    `;
    loadProfileView();
  } else {
    // Logged out view
    app.innerHTML = `
      <section class="profile-section fade-in">
          <section class="pulse-hero pulse-hero-slim">
            <div class="pulse-mark">Account</div>
            <h1>팬 계정으로 로그인하고<br>포인트를 쌓아보세요</h1>
            <p>커뮤니티 글쓰기, 댓글, 게임 활동으로 팬 등급이 올라갑니다.</p>
          </section>
          <h2 class="page-title">👤 내 프로필</h2>
          <div class="profile-card card fan-card">
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
          <div class="profile-details card fan-card mt-4">
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
          <span>${escapeHTML(formatReason(l.reason))}</span>
          <span class="${l.delta >= 0 ? 'log-plus' : 'log-minus'}">${l.delta >= 0 ? '+' : ''}${l.delta}P</span>
          <span class="log-date">${new Date(l.date).toLocaleDateString()}</span>
        </div>
      `).join('')
    : '<div class="empty">포인트 기록이 없습니다.</div>';

  const leaderboardHtml = leaderboard.length
    ? leaderboard.map((u, idx) => `
        <div class="leader-row">
          <span class="rank">#${idx + 1}</span>
          <span class="name">${escapeHTML(u.displayName || u.uid?.slice(0, 6) || '팬')}</span>
          <span class="pts">${u.points || 0}P</span>
        </div>
      `).join('')
    : '<div class="empty">랭킹 데이터가 없습니다.</div>';

  document.getElementById('profile-card-loading').innerHTML = `
    <div class="tier-panel">
      <h3>환영합니다, ${escapeHTML(getDisplayName())}!</h3>
      <p>UID: ${escapeHTML(currentUser.uid)}</p>
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
      <input type="text" id="nickname-input" class="input" placeholder="닉네임" value="${escapeHTML(currentUser.displayName || '')}">
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
  if (isAdmin) {
    app.innerHTML = `
      <section class="admin-section fade-in">
        <div class="admin-console sf-card">
          <div class="admin-console-head">
            <div>
              <h2 class="page-title">⚙️ 운영 센터</h2>
              <p class="text-sub">관리자 ${escapeHTML(currentUser.email || '')} · 콘텐츠/댓글/사용자 통합 관리</p>
            </div>
            <div class="admin-console-actions">
              <input id="admin-search" class="input admin-search" placeholder="제목·작성자·UID 검색">
              <button id="admin-refresh" class="btn btn-secondary">새로고침</button>
            </div>
          </div>

          <div class="admin-kpi-grid">
            <div class="stat-card"><span class="stat-label">게시글</span><strong id="admin-kpi-posts">-</strong></div>
            <div class="stat-card"><span class="stat-label">댓글</span><strong id="admin-kpi-comments">-</strong></div>
            <div class="stat-card"><span class="stat-label">사용자</span><strong id="admin-kpi-users">-</strong></div>
          </div>

          <div class="admin-tabs">
            <button class="tab-btn active" data-panel="posts">게시글</button>
            <button class="tab-btn" data-panel="comments">댓글</button>
            <button class="tab-btn" data-panel="users">사용자</button>
            <button class="tab-btn" data-panel="analytics">채널 분석</button>
          </div>

          <div id="admin-panel-posts" class="admin-panel"></div>
          <div id="admin-panel-comments" class="admin-panel hidden"></div>
          <div id="admin-panel-users" class="admin-panel hidden"></div>
          <div id="admin-panel-analytics" class="admin-panel hidden"></div>
        </div>
      </section>
    `;

    const postsPanel = document.getElementById('admin-panel-posts');
    const commentsPanel = document.getElementById('admin-panel-comments');
    const usersPanel = document.getElementById('admin-panel-users');
    const analyticsPanel = document.getElementById('admin-panel-analytics');
    const searchInput = document.getElementById('admin-search');
    const refreshBtn = document.getElementById('admin-refresh');
    const kpiPosts = document.getElementById('admin-kpi-posts');
    const kpiComments = document.getElementById('admin-kpi-comments');
    const kpiUsers = document.getElementById('admin-kpi-users');

    let activePanel = 'posts';
    let currentKeyword = '';
    const cache = { posts: [], comments: [], users: [] };

    const renderPosts = () => {
      if (!postsPanel) return;
      const keyword = currentKeyword.toLowerCase();
      const rows = cache.posts
        .filter((p) => !keyword || `${p.title || ''} ${p.author || ''} ${p.category || ''}`.toLowerCase().includes(keyword))
        .slice(0, 120)
        .map((p) => `
          <div class="post-row">
            <span class="col-cat"><span class="chip micro">${escapeHTML(p.category || '일반')}</span></span>
            <span class="col-title">${escapeHTML(p.title || '')}</span>
            <span class="col-author">${escapeHTML(p.author || '')}</span>
            <span class="col-meta">
              <button class="btn btn-danger btn-sm admin-del-post" data-id="${p.id}">삭제</button>
            </span>
          </div>
        `).join('');
      postsPanel.innerHTML = rows || '<div class="empty">조건에 맞는 게시글이 없습니다.</div>';
      postsPanel.querySelectorAll('.admin-del-post').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (!id) return;
          if (!confirm('이 게시글을 삭제하시겠습니까?')) return;
          await Store.deletePost(id);
          await reloadAll();
        });
      });
    };

    const renderComments = () => {
      if (!commentsPanel) return;
      const keyword = currentKeyword.toLowerCase();
      const rows = cache.comments
        .filter((c) => !keyword || `${c.content || ''} ${c.author || ''} ${c.postId || ''}`.toLowerCase().includes(keyword))
        .slice(0, 120)
        .map((c) => `
          <div class="post-row">
            <span class="col-cat"><span class="chip micro">댓글</span></span>
            <span class="col-title">${escapeHTML((c.content || '').slice(0, 80))}</span>
            <span class="col-author">${escapeHTML(c.author || '')}</span>
            <span class="col-meta">
              <button class="btn btn-danger btn-sm admin-del-comment" data-id="${c.id}">삭제</button>
            </span>
          </div>
        `).join('');
      commentsPanel.innerHTML = rows || '<div class="empty">조건에 맞는 댓글이 없습니다.</div>';
      commentsPanel.querySelectorAll('.admin-del-comment').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (!id) return;
          if (!confirm('이 댓글을 삭제하시겠습니까?')) return;
          await Store.deleteComment(id);
          await reloadAll();
        });
      });
    };

    const renderUsers = () => {
      if (!usersPanel) return;
      const keyword = currentKeyword.toLowerCase();
      const rows = cache.users
        .filter((u) => !keyword || `${u.displayName || ''} ${u.uid || ''} ${u.tier || ''}`.toLowerCase().includes(keyword))
        .slice(0, 120)
        .map((u, idx) => `
          <div class="post-row">
            <span class="col-cat"><span class="chip micro">#${idx + 1}</span></span>
            <span class="col-title">${escapeHTML(u.displayName || u.uid || '팬')}</span>
            <span class="col-author">${escapeHTML(u.uid || '')}</span>
            <span class="col-meta">${u.points || 0}P / ${escapeHTML(u.tier || 'Rookie')}</span>
          </div>
        `).join('');
      usersPanel.innerHTML = rows || '<div class="empty">조건에 맞는 사용자가 없습니다.</div>';
    };

    const renderAnalyticsShell = () => {
      if (!analyticsPanel) return;
      const savedKey = localStorage.getItem(YT_API_KEY_STORAGE) || '';
      analyticsPanel.innerHTML = `
        <div class="admin-analytics-wrap">
          <p class="text-sub">
            공개 통계 기반 채널 분석입니다.
            <a href="https://studio.youtube.com/channel/${CHANNEL_ID}/analytics" target="_blank" rel="noreferrer noopener">YouTube Studio Analytics 열기</a>
          </p>
          <div class="admin-analytics-controls">
            <input id="admin-yt-api-key" class="input" type="password" placeholder="YouTube Data API Key 입력" value="${escapeHTML(savedKey)}">
            <button id="admin-yt-save-key" class="btn btn-secondary">키 저장</button>
            <button id="admin-yt-load" class="btn btn-primary">분석 불러오기</button>
          </div>
          <div class="text-sub" id="admin-yt-key-hint">${savedKey ? '저장된 API 키가 있어 자동으로 분석을 불러옵니다.' : '한 번 저장하면 이후에는 다시 입력하지 않아도 됩니다.'}</div>
          <div id="admin-yt-summary" class="admin-yt-summary empty">API 키를 입력한 후 분석 불러오기를 눌러주세요.</div>
          <div id="admin-yt-advanced" class="admin-yt-advanced"></div>
          <div id="admin-yt-charts" class="admin-yt-charts"></div>
          <div id="admin-yt-videos" class="admin-yt-videos"></div>
        </div>
      `;

      const keyInput = document.getElementById('admin-yt-api-key');
      const saveBtn = document.getElementById('admin-yt-save-key');
      const loadBtn = document.getElementById('admin-yt-load');
      const keyHint = document.getElementById('admin-yt-key-hint');
      const summary = document.getElementById('admin-yt-summary');
      const advanced = document.getElementById('admin-yt-advanced');
      const charts = document.getElementById('admin-yt-charts');
      const videos = document.getElementById('admin-yt-videos');

      const fetchJSON = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json();
      };
      const toNum = (v) => Number(v || 0);
      const fmt = (v) => Number(v || 0).toLocaleString();

      const loadAnalytics = async () => {
        if (!summary || !videos || !advanced || !charts) return;
        const apiKey = (keyInput?.value || '').trim();
        if (!apiKey) {
          summary.innerHTML = '<div class="empty">API 키를 먼저 입력해주세요.</div>';
          advanced.innerHTML = '';
          charts.innerHTML = '';
          return;
        }
        summary.innerHTML = '<div class="empty">채널 통계를 불러오는 중...</div>';
        advanced.innerHTML = '';
        charts.innerHTML = '';
        videos.innerHTML = '';
        try {
          const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${CHANNEL_ID}&key=${apiKey}`;
          const channelData = await fetchJSON(channelUrl);
          const channel = channelData?.items?.[0];
          if (!channel) throw new Error('채널 데이터를 찾을 수 없습니다.');

          const stats = channel.statistics || {};
          const subCount = fmt(stats.subscriberCount);
          const viewCount = fmt(stats.viewCount);
          const videoCount = fmt(stats.videoCount);

          summary.innerHTML = `
            <div class="admin-kpi-grid">
              <div class="stat-card"><span class="stat-label">구독자</span><strong>${subCount}</strong></div>
              <div class="stat-card"><span class="stat-label">총 조회수</span><strong>${viewCount}</strong></div>
              <div class="stat-card"><span class="stat-label">전체 영상 수</span><strong>${videoCount}</strong></div>
            </div>
          `;

          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=10&key=${apiKey}`;
          const searchData = await fetchJSON(searchUrl);
          const ids = (searchData.items || []).map((item) => item?.id?.videoId).filter(Boolean);
          if (!ids.length) {
            videos.innerHTML = '<div class="empty">최신 영상 데이터를 불러오지 못했습니다.</div>';
            return;
          }

          const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(',')}&key=${apiKey}`;
          const videosData = await fetchJSON(videosUrl);
          const items = videosData.items || [];
          if (!items.length) {
            videos.innerHTML = '<div class="empty">영상 성과 데이터를 불러오지 못했습니다.</div>';
            return;
          }

          const enriched = items.map((v) => {
            const views = toNum(v?.statistics?.viewCount);
            const likes = toNum(v?.statistics?.likeCount);
            const comments = toNum(v?.statistics?.commentCount);
            const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
            return {
              id: v.id,
              title: v?.snippet?.title || '',
              publishedAt: v?.snippet?.publishedAt || '',
              date: v?.snippet?.publishedAt ? new Date(v.snippet.publishedAt).toLocaleDateString() : '',
              views,
              likes,
              comments,
              engagement
            };
          }).sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

          const totalViews = enriched.reduce((sum, v) => sum + v.views, 0);
          const totalLikes = enriched.reduce((sum, v) => sum + v.likes, 0);
          const totalComments = enriched.reduce((sum, v) => sum + v.comments, 0);
          const avgViews = enriched.length ? Math.round(totalViews / enriched.length) : 0;
          const avgEngagement = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
          const topVideo = [...enriched].sort((a, b) => b.views - a.views)[0];

          advanced.innerHTML = `
            <div class="admin-kpi-grid">
              <div class="stat-card"><span class="stat-label">최근 10개 평균 조회수</span><strong>${fmt(avgViews)}</strong></div>
              <div class="stat-card"><span class="stat-label">최근 10개 평균 참여율</span><strong>${avgEngagement.toFixed(2)}%</strong></div>
              <div class="stat-card"><span class="stat-label">조회수 최고 영상</span><strong>${escapeHTML((topVideo?.title || '-').slice(0, 20))}</strong></div>
            </div>
          `;

          const maxViews = Math.max(...enriched.map((v) => v.views), 1);
          const maxEng = Math.max(...enriched.map((v) => v.engagement), 0.01);
          const viewBars = enriched.map((v) => `
            <div class="chart-row">
              <span class="chart-label">${escapeHTML((v.title || '').slice(0, 18))}</span>
              <div class="chart-bar-wrap"><div class="chart-bar" style="width:${(v.views / maxViews) * 100}%"></div></div>
              <span class="chart-value">${fmt(v.views)}</span>
            </div>
          `).join('');
          const engBars = [...enriched]
            .sort((a, b) => b.engagement - a.engagement)
            .slice(0, 5)
            .map((v) => `
              <div class="chart-row">
                <span class="chart-label">${escapeHTML((v.title || '').slice(0, 18))}</span>
                <div class="chart-bar-wrap"><div class="chart-bar alt" style="width:${(v.engagement / maxEng) * 100}%"></div></div>
                <span class="chart-value">${v.engagement.toFixed(2)}%</span>
              </div>
            `).join('');
          charts.innerHTML = `
            <div class="admin-chart-card">
              <h4>조회수 추이 (최근 10개)</h4>
              ${viewBars}
            </div>
            <div class="admin-chart-card">
              <h4>참여율 상위 영상 (좋아요+댓글/조회수)</h4>
              ${engBars}
            </div>
          `;

          const rows = enriched.slice().reverse().map((v) => {
            const href = `https://www.youtube.com/watch?v=${v.id}`;
            return `
              <a class="post-row" href="${href}" target="_blank" rel="noreferrer noopener">
                <span class="col-cat"><span class="chip micro">영상</span></span>
                <span class="col-title">${escapeHTML(v.title)}</span>
                <span class="col-author">${v.date}</span>
                <span class="col-meta">조회 ${fmt(v.views)} · 좋아요 ${fmt(v.likes)} · 댓글 ${fmt(v.comments)} · 참여율 ${v.engagement.toFixed(2)}%</span>
              </a>
            `;
          }).join('');
          videos.innerHTML = rows || '<div class="empty">영상 성과 데이터를 불러오지 못했습니다.</div>';
        } catch (error) {
          console.error(error);
          summary.innerHTML = '<div class="empty">분석 데이터를 불러오지 못했습니다. API 키/할당량/권한을 확인해주세요.</div>';
          advanced.innerHTML = '';
          charts.innerHTML = '';
          videos.innerHTML = '';
        }
      };

      saveBtn?.addEventListener('click', () => {
        const key = (keyInput?.value || '').trim();
        if (!key) {
          alert('API 키를 입력해주세요.');
          return;
        }
        localStorage.setItem(YT_API_KEY_STORAGE, key);
        if (keyHint) keyHint.textContent = 'API 키가 저장되었습니다. 다음부터 자동으로 분석을 불러옵니다.';
        alert('API 키가 저장되었습니다.');
      });
      loadBtn?.addEventListener('click', loadAnalytics);
      if (savedKey) loadAnalytics();
    };

    const renderAllPanels = () => {
      renderPosts();
      renderComments();
      renderUsers();
    };

    const setPanel = (panel) => {
      activePanel = panel;
      document.querySelectorAll('.admin-tabs .tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.panel === panel));
      postsPanel?.classList.toggle('hidden', panel !== 'posts');
      commentsPanel?.classList.toggle('hidden', panel !== 'comments');
      usersPanel?.classList.toggle('hidden', panel !== 'users');
      analyticsPanel?.classList.toggle('hidden', panel !== 'analytics');
      if (panel === 'analytics') renderAnalyticsShell();
    };

    const reloadAll = async () => {
      if (postsPanel) postsPanel.innerHTML = '<div class="empty">불러오는 중...</div>';
      if (commentsPanel) commentsPanel.innerHTML = '<div class="empty">불러오는 중...</div>';
      if (usersPanel) usersPanel.innerHTML = '<div class="empty">불러오는 중...</div>';
      try {
        const [posts, comments, users] = await Promise.all([
          Store.getPosts('community'),
          Store.getAllComments(200),
          Store.getAllUsers()
        ]);
        cache.posts = posts || [];
        cache.comments = comments || [];
        cache.users = users || [];
        if (kpiPosts) kpiPosts.textContent = String(cache.posts.length);
        if (kpiComments) kpiComments.textContent = String(cache.comments.length);
        if (kpiUsers) kpiUsers.textContent = String(cache.users.length);
        renderAllPanels();
        setPanel(activePanel);
      } catch (error) {
        console.error(error);
        if (postsPanel) postsPanel.innerHTML = '<div class="empty">데이터를 불러오지 못했습니다.</div>';
        if (commentsPanel) commentsPanel.innerHTML = '<div class="empty">데이터를 불러오지 못했습니다.</div>';
        if (usersPanel) usersPanel.innerHTML = '<div class="empty">데이터를 불러오지 못했습니다.</div>';
      }
    };

    document.querySelectorAll('.admin-tabs .tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => setPanel(btn.dataset.panel || 'posts'));
    });
    searchInput?.addEventListener('input', () => {
      currentKeyword = (searchInput.value || '').trim();
      renderAllPanels();
      setPanel(activePanel);
    });
    refreshBtn?.addEventListener('click', reloadAll);
    reloadAll();
  } else {
    app.innerHTML = `
      <section class="admin-section fade-in">
        <h2 class="page-title">⚙️ 운영 센터</h2>
        <p class="text-sub">관리자만 접근할 수 있는 페이지입니다.</p>
        <div class="profile-card card fan-card">
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
        <input type="text" id="post-title" class="input" placeholder="제목" value="${escapeHTML(prefill && prefill.title || '')}">
        <input type="text" id="post-author" class="input" placeholder="닉네임" value="${escapeHTML(getDisplayName())}" disabled>
        <textarea id="post-content" class="input textarea" placeholder="내용을 입력하세요">${escapeHTML(prefill && prefill.content || '')}</textarea>
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
  
  try {
    await Store.viewPost(id); // Increment view count
  } catch (error) {
    console.warn('Failed to increment views:', error);
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay fade-in';
  
  const renderModalContent = async (currentPost) => { // Added async
    const comments = await Store.getComments(id, currentPost.legacyId); // Await comments
    modal.innerHTML = `
      <div class="modal view-modal">
        <div class="modal-header">
          <span class="chip">${escapeHTML(currentPost.category || '')}</span>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <h2 class="view-title">${escapeHTML(currentPost.title || '')}</h2>
          <div class="view-meta">
            <span>${escapeHTML(currentPost.author || '')}</span> · <span>${new Date(currentPost.date).toLocaleDateString()}</span>
            <span class="right">👀 ${currentPost.views} ❤️ <span id="like-count">${currentPost.likes}</span></span>
          </div>
          <div class="view-content">${renderPostContent(currentPost.content)}</div>
          
          <div class="comments-section">
              <h4>댓글 (${comments.length})</h4>
              <div id="comment-list">
                ${comments.map(c => `
                  <div class="comment">
                      <strong>${escapeHTML(c.author || '')}</strong> <span class="date">${new Date(c.date).toLocaleTimeString()}</span>
                      <p>${escapeHTML(c.content || '')}</p>
                      ${(currentUser && (currentUser.uid === c.authorId || isAdmin)) 
                        ? `<button class="btn btn-danger btn-sm delete-comment-btn" data-comment-id="${c.id}">삭제</button>` : ''}
                  </div>
                `).join('')}
              </div>
              <div class="comment-form">
                  <input type="text" id="comment-author" placeholder="닉네임" class="input small" value="${currentUser ? escapeHTML(getDisplayName()) : ''}" ${currentUser ? 'disabled' : ''}>
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
       try {
         const newLikes = await Store.likePost(id);
         currentPost.likes = newLikes; // update local ref
         await awardPoints(POINTS.like, 'like');
         renderModalContent(currentPost); // re-render to update like count
       } catch (error) {
         alert('좋아요 처리에 실패했습니다. 로그인 상태를 확인해주세요.');
       }
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
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    const items = (data.items || []).slice(0, 12);
    const cards = items.map((item) => {
      const title = item.title || 'Untitled';
      const link = safeExternalUrl(item.link) || CHANNEL_URL;
      const published = item.pubDate || '';
      const thumb = safeExternalUrl(item.thumbnail) || '';
      const dateText = published ? new Date(published).toLocaleDateString() : '';
      return `
        <a class="video-card" href="${escapeHTML(link)}" target="_blank" rel="noreferrer noopener">
          <div class="thumb" style="background-image:url('${escapeHTML(thumb)}')"></div>
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
  const text = escapeHTML(raw).replace(/\n/g, '<br>');
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = raw.match(urlRegex) || [];
  let html = text.replace(urlRegex, (url) => {
    const safeUrl = safeExternalUrl(url);
    if (!safeUrl) return escapeHTML(url);
    const encoded = escapeHTML(safeUrl);
    return `<a href="${encoded}" target="_blank" rel="noreferrer noopener">${encoded}</a>`;
  });
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
    const host = u.hostname.toLowerCase();
    const isShortHost = host === 'youtu.be' || host.endsWith('.youtu.be');
    const isYouTubeHost = host === 'youtube.com' || host === 'www.youtube.com' || host.endsWith('.youtube.com');
    let id = '';
    if (isShortHost) {
      id = u.pathname.slice(1);
    } else if (isYouTubeHost && u.searchParams.get('v')) {
      id = u.searchParams.get('v');
    }
    if (id && !/^[A-Za-z0-9_-]{11}$/.test(id)) return '';
    if (!id) return '';
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return '';
  }
}

function safeExternalUrl(value = '') {
  try {
    const parsed = new URL(String(value));
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString();
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
