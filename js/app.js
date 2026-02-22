// js/app.js
import { Store } from './store.js';
import { ReactionGame, MemoryGame, RhythmGame, PuzzleGame, MathGame, RpsGame, PersonalityTest, NumberMemoryGame, TypingGame, ReflexGame, MazeGame, DodgeGame } from './games.js';
import { auth, db } from './firebase-init.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";


const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const adminNavLink = document.querySelector('.nav-link.admin-only');

let currentRoute = null;
let activeGame = null;

let currentUser = null; 
let isAdmin = false;    

const TIERS = [
  { name: 'Rookie', label: '루키', min: 0, className: 'tier-rookie' },
  { name: 'Bronze', label: '브론즈', min: 80, className: 'tier-bronze' },
  { name: 'Silver', label: '실버', min: 200, className: 'tier-silver' },
  { name: 'Gold', label: '골드', min: 400, className: 'tier-gold' },
  { name: 'Platinum', label: '플래티넘', min: 700, className: 'tier-platinum' },
  { name: 'Diamond', label: '다이아', min: 1100, className: 'tier-diamond' },
];
const POINTS = { post: 15, comment: 5, like: 1, dailyLogin: 8 };

const CHANNEL_URL = 'https://youtube.com/@sunofox';
const FEATURED_PLAYLIST = 'PLP7_j0_nQXuEv-ny2l03vgreGyTvLhmD0';
const CHANNEL_ID = 'UC8M-2aXbknDT3tDcN1PMvuQ';

const LINKTREE_LINKS = [
  { label: 'YouTube | 수노폭스', url: 'https://www.youtube.com/@sunofox' },
  { label: 'Spotify | 수노폭스', url: 'https://open.spotify.com/artist/5fzr4xqw1e0c5cI8dVj11D' },
  { label: 'Apple Music', url: 'https://music.apple.com/kr/artist/%EC%88%98%EB%85%B8%ED%8F%AD%EC%8A%A4/1874158480' }
];

// Routing Table
const routes = {
  '#home': renderHome,
  '#videos': renderVideos,
  '#community': renderCommunity,
  '#arcade': renderArcade,
  '#games': renderArcade,
  '#tests': renderTests,
  '#profile': renderProfile,
  '#admin': renderAdmin
};

function router() {
  const hash = window.location.hash || '#home';
  if (activeGame && activeGame.destroy) { activeGame.destroy(); activeGame = null; }
  if (hash === '#admin' && !isAdmin) { window.location.hash = '#home'; return; }

  const renderFn = routes[hash] || renderHome;
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === hash));
  
  app.innerHTML = '';
  renderFn();
  currentRoute = hash;
}

// Auth State
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    const idToken = await user.getIdTokenResult();
    isAdmin = !!idToken.claims.admin;
    await Store.ensureUserProfile(user.uid, getDisplayName());
    await awardDailyLoginPoints();
  } else { isAdmin = false; }
  if (adminNavLink) adminNavLink.classList.toggle('hidden', !isAdmin);
  router();
});

window.addEventListener('hashchange', router);
window.addEventListener('load', () => { initTheme(); router(); });

function initTheme() {
  const theme = Store.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Store.setTheme(next);
  };
}

function getDisplayName() { return currentUser?.displayName || currentUser?.email?.split('@')[0] || '팬'; }

// Views Implementation
function renderHome() {
  app.innerHTML = `
    <section class="stream-hero fade-in">
      <div class="stream-grid">
        <div class="stream-card">
          <div class="stream-header">
            <div>
              <div class="news-tag">SunoFox Fanpage</div>
              <h1 class="stream-title">수노폭스 유튜브 팬을<br>위한 스트리밍 허브</h1>
            </div>
            <div class="badge"><strong>LIVE</strong> 팬클럽 뉴스룸</div>
          </div>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${CHANNEL_URL}" target="_blank">유튜브 구독하기</a>
            <a class="btn btn-secondary" href="#videos">최신 영상 보기</a>
          </div>
        </div>
        <div class="stream-card">
          <iframe class="frame" src="https://www.youtube.com/embed/videoseries?list=${FEATURED_PLAYLIST}" allowfullscreen></iframe>
        </div>
      </div>
    </section>

    <div id="advice-section" class="section fade-in">
        <div class="advice-card"><span class="news-tag">Today's Advice</span><p id="advice-text">로딩 중...</p></div>
    </div>

    <section class="section fade-in">
      <div class="section-head"><h2>Latest Drops</h2><span>신규 영상 바로가기</span></div>
      <div class="rail-grid">
        <a href="#videos" class="rail-tile clickable"><strong>최신 업로드</strong><span>신규 영상 확인</span></a>
        <a href="#community" class="rail-tile clickable"><strong>팬 추천 클립</strong><span>베스트 장면 모음</span></a>
      </div>
    </section>

    <section class="section fade-in">
      <div class="section-head"><h2>Fanclub Newsroom</h2><span>실시간 소식</span></div>
      <div class="newsroom-feed">
        <div class="feed-item" onclick="location.hash='#community'">
          <div class="feed-header"><div class="feed-user"><span class="user-avatar">🦊</span><span>관리자</span></div></div>
          <h4>팬클럽 뉴스룸 개편!</h4>
          <p>자유롭게 토론하고 영상을 공유하세요.</p>
        </div>
      </div>
    </section>
  `;
  fetchAdvice();
}

async function fetchAdvice() {
    try {
        const res = await fetch('https://api.adviceslip.com/advice');
        const data = await res.json();
        document.getElementById('advice-text').textContent = `"${data.slip.advice}"`;
    } catch (e) { document.getElementById('advice-text').textContent = "행복한 하루 되세요!"; }
}

function renderVideos() {
  app.innerHTML = `<div class="fade-in"><div class="section-head"><h2>🎬 수노폭스 영상</h2></div><div id="latest-videos" class="video-grid">로딩 중...</div></div>`;
  loadLatestVideos();
}

async function loadLatestVideos() {
  const container = document.getElementById('latest-videos');
  if (!container) return;
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    container.innerHTML = (data.items || []).slice(0, 6).map(item => `
      <a class="video-card" href="${item.link}" target="_blank">
        <div class="thumb" style="background-image:url('${item.thumbnail}')"></div>
        <div class="video-meta"><h4>${item.title}</h4><span>${new Date(item.pubDate).toLocaleDateString()}</span></div>
      </a>
    `).join('') || '<div class="empty">영상이 없습니다.</div>';
  } catch (e) { container.innerHTML = '<div class="empty">로딩 실패</div>'; }
}

function renderArcade() {
  app.innerHTML = `
    <div class="fade-in">
      <h2 class="page-title">🕹️ 팬클럽 아케이드</h2>
      <div class="game-tabs">
        <button class="tab-btn active" data-game="reaction">⚡ 반응속도</button>
        <button class="tab-btn" data-game="memory">🧠 카드기억</button>
        <button class="tab-btn" data-game="rhythm">🎵 비트탭</button>
        <button class="tab-btn" data-game="math">🔢 연산왕</button>
        <button class="tab-btn" data-game="rps">✊ 가위바위보</button>
        <button class="tab-btn" data-game="dodge">☄️ 낙하피하기</button>
      </div>
      <div id="game-container" class="game-container"></div>
    </div>
  `;
  const container = document.getElementById('game-container');
  const tabs = document.querySelectorAll('.tab-btn');
  const setGame = (type) => {
    if (activeGame?.destroy) activeGame.destroy();
    container.innerHTML = '';
    if (type === 'reaction') activeGame = new ReactionGame(container);
    if (type === 'memory') activeGame = new MemoryGame(container);
    if (type === 'rhythm') activeGame = new RhythmGame(container);
    if (type === 'math') activeGame = new MathGame(container);
    if (type === 'rps') activeGame = new RpsGame(container);
    if (type === 'dodge') activeGame = new DodgeGame(container);
    tabs.forEach(t => t.classList.toggle('active', t.dataset.game === type));
  };
  setGame('reaction');
  tabs.forEach(tab => tab.onclick = () => setGame(tab.dataset.game));
}

function renderTests() {
  app.innerHTML = `<div class="fade-in"><h2 class="page-title">🧪 심리테스트</h2><div id="test-container" class="game-container"></div></div>`;
  activeGame = new PersonalityTest(document.getElementById('test-container'));
}

function renderCommunity() {
  app.innerHTML = `<div class="fade-in"><div class="toolbar"><h2 class="page-title">뉴스룸</h2><button id="write-btn" class="btn btn-primary">글쓰기</button></div><div id="list" class="post-list-table">로딩 중...</div></div>`;
  Store.getPosts('community').then(posts => {
    document.getElementById('list').innerHTML = posts.map(p => `<div class="post-row" onclick="openPostModal('${p.id}')"><span>${p.title}</span><small>${p.author}</small></div>`).join('') || '<div class="empty">글이 없습니다.</div>';
  });
  document.getElementById('write-btn').onclick = () => openWriteModal('community');
}

function renderProfile() {
  if (!currentUser) { app.innerHTML = `<div class="card"><h3>로그인이 필요합니다.</h3><button class="btn btn-primary" onclick="location.hash='#home'">홈으로</button></div>`; return; }
  app.innerHTML = `<div class="card"><h3>👤 ${getDisplayName()} 님</h3><p>${currentUser.email}</p><button id="logout" class="btn btn-secondary mt-4">로그아웃</button></div>`;
  document.getElementById('logout').onclick = () => signOut(auth);
}

function renderAdmin() { app.innerHTML = `<h2>⚙️ 관리자</h2>`; }

// Helpers
async function awardDailyLoginPoints() { if (currentUser) await Store.addPoints(currentUser.uid, 8); }
async function openWriteModal(type) {
  const title = prompt('제목:'); const content = prompt('내용:');
  if (title && content) { await Store.addPost({ type, title, content, author: getDisplayName(), authorId: currentUser.uid }); router(); }
}
async function openPostModal(id) {
  const post = await Store.getPost(id);
  if (post) alert(`[${post.title}]\n\n${post.content}`);
}
