// js/app.js
import { Store } from './store.js';
import { auth } from './firebase-init.js'; // Import auth instance from new module
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

// Routing
const routes = {
  '#home': renderHome,
  '#personality': renderHome,
  '#face': renderHome,
  '#fun': renderHome,
  '#fortune': renderHome,
  '#tests': renderHome,
  '#profile': renderProfile,
  '#admin': renderAdmin
};

function router() {
  const hash = window.location.hash || '#home';
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
  if (hash === '#personality') document.querySelector('[data-filter=\"성격\"]')?.click();
  if (hash === '#face') document.querySelector('[data-filter=\"얼굴\"]')?.click();
  if (hash === '#fun') document.querySelector('[data-filter=\"그외\"]')?.click();
  if (hash === '#fortune') document.querySelector('[data-filter=\"사주\"]')?.click();
  if (hash === '#tests') document.getElementById('tests-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  const tests = [
    { category: '성격', title: '팬 감상 성향 테스트', desc: '콘텐츠를 감상하는 나만의 스타일을 확인해보세요.', href: 'tests-personality.html#fan-style' },
    { category: '성격', title: '커뮤니티 대화 타입', desc: '토론형/공감형/리뷰형 중 내 타입은?', href: 'tests-personality.html#community-talk' },
    { category: '성격', title: '콘텐츠 몰입도 체크', desc: '집중형 팬인지 라이트형 팬인지 분석합니다.', href: 'tests-personality.html#focus-level' },
    { category: '얼굴', title: '프로필 무드 추천', desc: '오늘의 팬 프로필 분위기를 추천받아보세요.', href: 'tests-face.html#profile-mood' },
    { category: '얼굴', title: '썸네일 반응 테스트', desc: '어떤 썸네일 스타일에 더 반응하는지 확인합니다.', href: 'tests-face.html#thumb-reaction' },
    { category: '그외', title: '밸런스 게임: 팬 생활', desc: '둘 중 하나를 고르며 취향을 확인합니다.', href: 'tests-fun.html#balance' },
    { category: '그외', title: '초간단 반응속도', desc: '빠르게 클릭해 내 반응 속도를 측정합니다.', href: 'tests-fun.html#speed' },
    { category: '그외', title: '오늘의 추천 루트', desc: '영상/커뮤니티/게임 중 추천 동선을 제공합니다.', href: 'tests-fun.html#route' },
    { category: '사주', title: '오늘의 팬 운세', desc: '팬 활동 운세를 가볍게 확인해보세요.', href: 'tests-fortune.html#daily-luck' },
    { category: '사주', title: '콘텐츠 궁합 운세', desc: '오늘 잘 맞는 장르/분위기를 안내합니다.', href: 'tests-fortune.html#content-luck' }
  ];
  const cards = tests.map((item) => `
    <a class="test-portal-card" href="${item.href}" data-category="${item.category}">
      <span class="test-chip">${item.category}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.desc)}</p>
    </a>
  `).join('');

  app.innerHTML = `
    <section class="portal-hero fade-in">
      <p class="portal-kicker">Simple Test Portal</p>
      <h1>심플 테스트 허브</h1>
      <p>성격 · 얼굴 · 그외 · 사주 카테고리별 테스트를 모아 제공합니다.</p>
      <div class="portal-top-sections">
        <a href="tests-personality.html" class="portal-section-link">성격</a>
        <a href="tests-face.html" class="portal-section-link">얼굴</a>
        <a href="tests-fun.html" class="portal-section-link">그외</a>
        <a href="tests-fortune.html" class="portal-section-link">사주</a>
      </div>
    </section>

    <section class="portal-toolbar fade-in">
      <input id="test-search-input" class="input" placeholder="테스트 제목 검색">
      <div class="portal-filter">
        <button class="tab-btn active" data-filter="전체">전체</button>
        <button class="tab-btn" data-filter="성격">성격</button>
        <button class="tab-btn" data-filter="얼굴">얼굴</button>
        <button class="tab-btn" data-filter="그외">그외</button>
        <button class="tab-btn" data-filter="사주">사주</button>
      </div>
    </section>

    <section class="portal-grid fade-in" id="test-cards-grid">
      ${cards}
    </section>
  `;
  setupTestLandingFilter();
}

function setupTestLandingFilter() {
  const searchInput = document.getElementById('test-search-input');
  const cards = Array.from(document.querySelectorAll('.test-portal-card'));
  const filterButtons = Array.from(document.querySelectorAll('.portal-filter .tab-btn'));
  let currentFilter = '전체';
  const applyFilter = () => {
    const keyword = (searchInput?.value || '').trim().toLowerCase();
    cards.forEach((card) => {
      const category = card.dataset.category || '';
      const text = (card.textContent || '').toLowerCase();
      const okCategory = currentFilter === '전체' || category === currentFilter;
      const okKeyword = !keyword || text.includes(keyword);
      card.classList.toggle('hidden', !(okCategory && okKeyword));
    });
  };
  searchInput?.addEventListener('input', applyFilter);
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter || '전체';
      filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
      applyFilter();
    });
  });
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
            <button class="tab-btn" data-panel="analytics">사이트 분석</button>
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
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const recent7 = now - (7 * dayMs);
      const recent30 = now - (30 * dayMs);
      const toDate = (value) => {
        const t = new Date(value || 0).getTime();
        return Number.isFinite(t) ? t : 0;
      };
      const fmt = (v) => Number(v || 0).toLocaleString();

      const posts7 = cache.posts.filter((p) => toDate(p.date) >= recent7);
      const comments7 = cache.comments.filter((c) => toDate(c.date) >= recent7);
      const posts30 = cache.posts.filter((p) => toDate(p.date) >= recent30);
      const comments30 = cache.comments.filter((c) => toDate(c.date) >= recent30);

      const categoryMap = posts30.reduce((acc, post) => {
        const key = post.category || '기타';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const topCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      const maxCategory = Math.max(...topCategories.map(([, count]) => count), 1);

      const dailyMap = {};
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(now - (i * dayMs));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dailyMap[key] = { posts: 0, comments: 0 };
      }
      posts7.forEach((p) => {
        const d = new Date(p.date || 0);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (dailyMap[key]) dailyMap[key].posts += 1;
      });
      comments7.forEach((c) => {
        const d = new Date(c.date || 0);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (dailyMap[key]) dailyMap[key].comments += 1;
      });
      const dailyRows = Object.entries(dailyMap);
      const maxDaily = Math.max(
        ...dailyRows.map(([, v]) => Math.max(v.posts, v.comments)),
        1
      );

      const estimatedPvMonth = (posts30.length * 18) + (comments30.length * 3) + (cache.users.length * 5);
      const adUnitCtr = 0.012;
      const rpm = 2.5;
      const estimatedRevenueMonth = (estimatedPvMonth * adUnitCtr * rpm) / 1000;

      analyticsPanel.innerHTML = `
        <div class="admin-analytics-wrap">
          <p class="text-sub">사이트 내부 활동 데이터를 기반으로 애드센스 운영용 지표를 보여줍니다.</p>
          <div class="admin-kpi-grid">
            <div class="stat-card"><span class="stat-label">7일 게시글</span><strong>${fmt(posts7.length)}</strong></div>
            <div class="stat-card"><span class="stat-label">7일 댓글</span><strong>${fmt(comments7.length)}</strong></div>
            <div class="stat-card"><span class="stat-label">30일 활동 사용자</span><strong>${fmt(cache.users.length)}</strong></div>
          </div>
          <div class="admin-kpi-grid">
            <div class="stat-card"><span class="stat-label">예상 월 페이지뷰</span><strong>${fmt(estimatedPvMonth)}</strong></div>
            <div class="stat-card"><span class="stat-label">가정 CTR</span><strong>${(adUnitCtr * 100).toFixed(2)}%</strong></div>
            <div class="stat-card"><span class="stat-label">예상 월 광고수익</span><strong>$${estimatedRevenueMonth.toFixed(2)}</strong></div>
          </div>
          <div class="admin-chart-card">
            <h4>최근 7일 활동 추이</h4>
            ${dailyRows.map(([date, v]) => `
              <div class="chart-row">
                <span class="chart-label">${date.slice(5)}</span>
                <div class="chart-bar-wrap"><div class="chart-bar" style="width:${(v.posts / maxDaily) * 100}%"></div></div>
                <span class="chart-value">글 ${v.posts}</span>
              </div>
              <div class="chart-row">
                <span class="chart-label"></span>
                <div class="chart-bar-wrap"><div class="chart-bar alt" style="width:${(v.comments / maxDaily) * 100}%"></div></div>
                <span class="chart-value">댓글 ${v.comments}</span>
              </div>
            `).join('')}
          </div>
          <div class="admin-chart-card">
            <h4>최근 30일 인기 카테고리</h4>
            ${topCategories.length ? topCategories.map(([name, count]) => `
              <div class="chart-row">
                <span class="chart-label">${escapeHTML(name)}</span>
                <div class="chart-bar-wrap"><div class="chart-bar" style="width:${(count / maxCategory) * 100}%"></div></div>
                <span class="chart-value">${count}</span>
              </div>
            `).join('') : '<div class="empty">데이터가 없습니다.</div>'}
          </div>
        </div>
      `;
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
    window.location.hash = '#home';
});

function escapeHTML(str = '') {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

function renderPostContent(raw = '') {
  const text = escapeHTML(raw).replace(/\n/g, '<br>');
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    const safeUrl = safeExternalUrl(url);
    if (!safeUrl) return escapeHTML(url);
    const encoded = escapeHTML(safeUrl);
    return `<a href="${encoded}" target="_blank" rel="noreferrer noopener">${encoded}</a>`;
  });
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
