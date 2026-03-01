import { fetchDailyTest, fetchDailyTests, getDailyPath, requestDailyResult } from '../services/daily.js?v=8.5.1';
import { saveAsStoryImage } from '../share.js?v=8.5.1';

function setDailyMeta(title, description, path) {
  document.title = title ? `${title} | 오늘의 테스트 | SevenCheck` : '오늘의 테스트 | SevenCheck';
  const desc = description || '10초 안에 끝나는 오늘의 테스트. 오늘 기분 그대로 바로 확인해보세요.';
  const url = `${window.location.origin}${path || '/daily/'}`;

  const ensureMeta = (selector, key, value) => {
    let node = document.querySelector(selector);
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(key, selector.includes('property=') ? selector.match(/property="([^"]+)"/)?.[1] || '' : selector.match(/name="([^"]+)"/)?.[1] || '');
      document.head.appendChild(node);
    }
    node.setAttribute('content', value);
  };

  ensureMeta('meta[name="description"]', 'name', desc);
  ensureMeta('meta[property="og:title"]', 'property', title || '오늘의 테스트 | SevenCheck');
  ensureMeta('meta[property="og:description"]', 'property', desc);
  ensureMeta('meta[property="og:url"]', 'property', url);
}

function renderLoading(message = '불러오는 중...') {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="fade-in daily-page-shell" style="max-width:1080px; margin:0 auto; padding:1.5rem 1rem 5rem;">
      <div class="daily-message-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:28px; padding:2.8rem 1.2rem; text-align:center; color:#475569; font-weight:800;">
        ${message}
      </div>
    </div>
  `;
}

function renderError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="fade-in daily-page-shell" style="max-width:1080px; margin:0 auto; padding:1.5rem 1rem 5rem;">
      <div class="daily-message-card" style="background:#fff; border:1px solid #fecaca; border-radius:28px; padding:2rem 1.2rem; text-align:center;">
        <div style="font-size:1.05rem; font-weight:900; color:#b91c1c; margin-bottom:0.6rem;">불러오지 못했습니다</div>
        <div style="color:#475569; font-weight:700; margin-bottom:1rem;">${message}</div>
        <button onclick="window.goToDaily('/daily/')" style="border:none; border-radius:14px; padding:0.8rem 1rem; background:#0f172a; color:#fff; font-weight:900; cursor:pointer;">목록으로</button>
      </div>
    </div>
  `;
}

function buildShareText(test, result) {
  return `[오늘의 테스트] ${test.title}\n${result.headline} · ${result.subline}\n${result.comment}\n${window.location.origin}${getDailyPath(test.slug)}`;
}

async function copyResultText(test, result) {
  await navigator.clipboard.writeText(buildShareText(test, result));
  const status = document.getElementById('daily-copy-status');
  if (status) {
    status.textContent = '결과 문구를 복사했습니다.';
  }
}

function renderResultSection(test, payload) {
  const result = payload.resultPayload;
  const templateLabel = result.template === 'probability' ? '확률형 판정' : result.template === 'index' ? '지수형 판정' : '등급형 판정';
  return `
    <section class="daily-result-section" style="margin-top:1.15rem;">
      <div class="daily-result-card" style="background:#fff; border:1px solid ${result.accent}22; border-radius:30px; padding:1.15rem; box-shadow:0 20px 40px rgba(15,23,42,0.06);">
        <div class="daily-result-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; margin-bottom:0.9rem;">
          <div>
            <div style="font-size:0.74rem; font-weight:900; letter-spacing:0.12em; color:${result.accent}; margin-bottom:0.25rem;">TODAY RESULT</div>
            <h2 style="margin:0; font-size:1.4rem; line-height:1.25; letter-spacing:-0.03em; color:#0f172a;">${test.title}</h2>
          </div>
          <div style="padding:0.45rem 0.72rem; border-radius:999px; background:${result.accent}12; color:${result.accent}; border:1px solid ${result.accent}28; font-size:0.76rem; font-weight:900;">
            ${payload.cached ? '오늘 결과 불러옴' : '오늘 결과 생성됨'}
          </div>
        </div>

        <div class="daily-result-meta" style="display:flex; flex-wrap:wrap; gap:0.55rem; margin-bottom:0.85rem;">
          <span style="padding:0.38rem 0.68rem; border-radius:999px; background:${result.accent}12; color:${result.accent}; border:1px solid ${result.accent}22; font-size:0.74rem; font-weight:900;">${templateLabel}</span>
          <span style="padding:0.38rem 0.68rem; border-radius:999px; background:#f8fafc; color:#475569; border:1px solid #e2e8f0; font-size:0.74rem; font-weight:900;">${payload.dateKey}</span>
          <span style="padding:0.38rem 0.68rem; border-radius:999px; background:#f8fafc; color:#475569; border:1px solid #e2e8f0; font-size:0.74rem; font-weight:900;">오늘 1회 고정</span>
        </div>

        <div id="daily-capture-card" class="daily-capture-card" style="background:linear-gradient(145deg,#ffffff 0%, ${result.accent}12 100%); border:1px solid ${result.accent}22; border-radius:28px; padding:1.5rem 1.2rem; margin-bottom:1rem;">
          <div style="font-size:0.72rem; letter-spacing:0.12em; font-weight:900; color:${result.accent}; margin-bottom:0.5rem;">공유용 카드</div>
          <div class="daily-capture-headline" style="font-size:2.35rem; font-weight:950; color:${result.accent}; line-height:1; letter-spacing:-0.05em; margin-bottom:0.6rem;">${result.headline}</div>
          <div style="font-size:0.95rem; font-weight:900; color:#0f172a; margin-bottom:0.45rem;">${result.subline}</div>
          <div class="daily-capture-comment" style="font-size:1.02rem; font-weight:800; color:#1e293b; line-height:1.58; word-break:keep-all;">${result.comment}</div>
          <div style="margin-top:1rem; padding-top:0.8rem; border-top:1px dashed ${result.accent}33; font-size:0.82rem; color:#475569; font-weight:800;">7Check 오늘의 테스트</div>
        </div>

        <div class="daily-result-actions" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:0.7rem; margin-bottom:0.55rem;">
          <button id="daily-copy-btn" class="daily-action-btn daily-action-btn--primary" style="border:none; border-radius:16px; min-height:58px; background:${result.accent}; color:#fff; font-weight:900; cursor:pointer;">결과 복사</button>
          <button id="daily-save-btn" class="daily-action-btn daily-action-btn--ghost" style="border:1px solid ${result.accent}; border-radius:16px; min-height:58px; background:#fff; color:${result.accent}; font-weight:900; cursor:pointer;">이미지 저장</button>
          <button onclick="window.goToDaily('/daily/')" class="daily-action-btn daily-action-btn--dark" style="border:none; border-radius:16px; min-height:58px; background:#0f172a; color:#fff; font-weight:900; cursor:pointer;">다른 테스트</button>
        </div>
        <div id="daily-copy-status" style="min-height:1.1rem; color:#64748b; font-size:0.8rem; font-weight:700;"></div>
      </div>
    </section>
  `;
}

export async function renderDailyList() {
  setDailyMeta('오늘의 테스트', '10초 안에 끝나는 오늘의 테스트 목록', '/daily/');
  renderLoading('오늘의 테스트를 불러오는 중...');

  try {
    const tests = await fetchDailyTests();
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="fade-in daily-page-shell daily-list-shell" style="max-width:1120px; margin:0 auto; padding:1.35rem 1rem 5rem;">
        <section class="daily-hero-shell" style="margin-bottom:1.2rem; border-radius:34px; padding:1.25rem; background:linear-gradient(145deg,#f8fafc 0%,#dbeafe 42%,#ecfeff 100%); border:1px solid #dbeafe; box-shadow:0 22px 48px rgba(15,23,42,0.08);">
          <div class="daily-hero-grid" style="display:grid; grid-template-columns:minmax(0,1.15fr) minmax(260px,0.85fr); gap:1rem; align-items:stretch;">
            <div class="daily-hero-primary" style="background:linear-gradient(135deg,#111827 0%,#1d4ed8 55%,#0ea5e9 100%); border-radius:28px; padding:1.5rem; color:#fff;">
              <div style="font-size:0.74rem; font-weight:900; letter-spacing:0.16em; color:rgba(255,255,255,0.76); margin-bottom:0.75rem;">TODAY'S TEST</div>
              <h1 style="font-size:clamp(1.8rem,5vw,2.6rem); line-height:1.04; letter-spacing:-0.05em; margin:0 0 0.8rem;">지금 기분으로<br>바로 찍는 테스트</h1>
              <p style="margin:0; max-width:92%; font-size:0.95rem; line-height:1.68; color:rgba(226,232,240,0.95); font-weight:650;">질문 길게 안 갑니다. 하나 누르고 오늘 상태만 바로 확인하는 초단기 결과 모음입니다.</p>
              <div class="daily-hero-tags" style="display:flex; flex-wrap:wrap; gap:0.48rem; margin-top:1rem;">
                <span style="padding:0.42rem 0.72rem; border-radius:999px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.16); font-size:0.76rem; font-weight:850;">10초 컷</span>
                <span style="padding:0.42rem 0.72rem; border-radius:999px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.16); font-size:0.76rem; font-weight:850;">오늘 1회 고정</span>
                <span style="padding:0.42rem 0.72rem; border-radius:999px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.16); font-size:0.76rem; font-weight:850;">결과 캡처용</span>
              </div>
            </div>
            <div class="daily-hero-side" style="display:grid; gap:0.8rem;">
              <div class="daily-info-card" style="background:#fff; border-radius:24px; border:1px solid #dbeafe; padding:1rem; box-shadow:0 14px 28px rgba(15,23,42,0.04);">
                <div style="font-size:0.72rem; font-weight:900; color:#2563eb; letter-spacing:0.12em; margin-bottom:0.35rem;">HOW IT WORKS</div>
                <div style="font-size:0.92rem; color:#334155; font-weight:750; line-height:1.6;">하루 한 번 같은 결과로 고정됩니다. 오늘 기분을 캡처해서 바로 친구한테 보내기 좋은 구조로 만들었습니다.</div>
              </div>
              <div class="daily-stat-grid" style="display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0.7rem;">
                <div class="daily-stat-card" style="background:#fff; border-radius:22px; border:1px solid #e2e8f0; padding:0.95rem;">
                  <div style="font-size:1.4rem; font-weight:950; color:#0f172a;">${tests.length}</div>
                  <div style="font-size:0.82rem; font-weight:800; color:#64748b;">오늘의 테스트 수</div>
                </div>
                <div class="daily-stat-card" style="background:#fff; border-radius:22px; border:1px solid #e2e8f0; padding:0.95rem;">
                  <div style="font-size:1.4rem; font-weight:950; color:#0f172a;">10초</div>
                  <div style="font-size:0.82rem; font-weight:800; color:#64748b;">평균 완료 시간</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div class="daily-card-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:0.9rem;">
            ${tests.map((test, index) => `
              <article class="daily-test-card" style="background:#fff; border-radius:24px; border:1px solid #e2e8f0; padding:1rem; box-shadow:0 14px 30px rgba(15,23,42,0.05); display:flex; flex-direction:column; gap:0.85rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.8rem;">
                  <span style="padding:0.34rem 0.62rem; border-radius:999px; background:#eff6ff; color:#2563eb; font-size:0.72rem; font-weight:900;">TODAY ${String(index + 1).padStart(2, '0')}</span>
                  <span style="font-size:0.75rem; color:#64748b; font-weight:800;">${test.type === 'probability' ? '확률형' : test.type === 'index' ? '지수형' : '등급형'}</span>
                </div>
                <h3 style="margin:0; font-size:1.05rem; line-height:1.45; color:#0f172a; font-weight:900; letter-spacing:-0.02em; word-break:keep-all;">${test.title}</h3>
                <div style="display:flex; flex-wrap:wrap; gap:0.42rem;">
                  <span style="padding:0.34rem 0.56rem; border-radius:999px; background:#f8fafc; color:#475569; font-size:0.72rem; font-weight:850;">하루 1회 고정</span>
                  <span style="padding:0.34rem 0.56rem; border-radius:999px; background:#f8fafc; color:#475569; font-size:0.72rem; font-weight:850;">캡처 공유용</span>
                </div>
                <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center; gap:0.7rem;">
                  <span style="font-size:0.8rem; color:#64748b; font-weight:800;">오늘 한 번 고정</span>
                  <button class="daily-start-btn" onclick="window.goToDaily('${getDailyPath(test.slug)}')" style="border:none; border-radius:14px; padding:0.75rem 0.95rem; background:linear-gradient(135deg,#2563eb,#0ea5e9); color:#fff; font-weight:900; cursor:pointer;">시작하기</button>
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  } catch (error) {
    renderError(error.message || '목록을 불러오지 못했습니다.');
  }
}

export async function renderDailyDetail(slug) {
  renderLoading('테스트를 준비하는 중...');

  try {
    const test = await fetchDailyTest(slug);
    if (!test || test.category !== 'daily' || !test.isActive) {
      renderError('해당 테스트를 찾을 수 없습니다.');
      return;
    }

    setDailyMeta(test.title, `${test.title} 결과를 오늘 바로 확인해보세요.`, getDailyPath(slug));

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="fade-in daily-page-shell daily-detail-shell" style="max-width:860px; margin:0 auto; padding:1.4rem 1rem 5rem;">
        <section class="daily-detail-card" style="background:linear-gradient(145deg,#ffffff 0%,#f8fafc 52%,#eff6ff 100%); border:1px solid #dbeafe; border-radius:34px; padding:1.2rem; box-shadow:0 22px 44px rgba(15,23,42,0.06);">
          <div class="daily-detail-header" style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; margin-bottom:0.95rem;">
            <div>
              <div style="font-size:0.74rem; font-weight:900; letter-spacing:0.12em; color:#2563eb; margin-bottom:0.28rem;">TODAY'S TEST</div>
              <h1 style="margin:0; font-size:clamp(1.8rem,5vw,2.4rem); line-height:1.16; letter-spacing:-0.04em; color:#0f172a; word-break:keep-all;">${test.title}</h1>
            </div>
            <button class="daily-back-btn" onclick="window.goToDaily('/daily/')" style="border:none; border-radius:14px; padding:0.75rem 0.95rem; background:#fff; color:#0f172a; font-weight:900; cursor:pointer; border:1px solid #cbd5e1;">목록 보기</button>
          </div>

          <div class="daily-detail-hero" style="background:#0f172a; color:#fff; border-radius:28px; padding:1.4rem 1.2rem; margin-bottom:1rem;">
            <div style="font-size:0.84rem; font-weight:900; color:rgba(255,255,255,0.7); margin-bottom:0.55rem;">오늘 기준으로 한 번 고정</div>
            <div style="font-size:1rem; line-height:1.68; color:rgba(226,232,240,0.94); font-weight:700;">질문 없이 바로 나옵니다. 오늘 같은 계정으로 다시 들어오면 같은 결과가 그대로 보입니다.</div>
            <div class="daily-detail-tags" style="display:flex; flex-wrap:wrap; gap:0.45rem; margin-top:0.95rem;">
              <span style="padding:0.38rem 0.68rem; border-radius:999px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.14); font-size:0.74rem; font-weight:850;">${test.type === 'probability' ? '확률형' : test.type === 'index' ? '지수형' : '등급형'}</span>
              <span style="padding:0.38rem 0.68rem; border-radius:999px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.14); font-size:0.74rem; font-weight:850;">오늘 1회 고정</span>
              <span style="padding:0.38rem 0.68rem; border-radius:999px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.14); font-size:0.74rem; font-weight:850;">즉시 결과</span>
            </div>
          </div>

          <div class="daily-detail-stat-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:0.7rem; margin-bottom:1rem;">
            <div class="daily-detail-stat-card" style="background:#fff; border-radius:20px; border:1px solid #e2e8f0; padding:0.95rem;">
              <div style="font-size:0.82rem; color:#64748b; font-weight:800; margin-bottom:0.25rem;">방식</div>
              <div style="font-size:1rem; color:#0f172a; font-weight:950;">${test.type === 'probability' ? '확률형' : test.type === 'index' ? '지수형' : '등급형'}</div>
            </div>
            <div class="daily-detail-stat-card" style="background:#fff; border-radius:20px; border:1px solid #e2e8f0; padding:0.95rem;">
              <div style="font-size:0.82rem; color:#64748b; font-weight:800; margin-bottom:0.25rem;">소요 시간</div>
              <div style="font-size:1rem; color:#0f172a; font-weight:950;">약 10초</div>
            </div>
            <div class="daily-detail-stat-card" style="background:#fff; border-radius:20px; border:1px solid #e2e8f0; padding:0.95rem;">
              <div style="font-size:0.82rem; color:#64748b; font-weight:800; margin-bottom:0.25rem;">결과 보관</div>
              <div style="font-size:1rem; color:#0f172a; font-weight:950;">오늘 1회 고정</div>
            </div>
          </div>

          <button id="daily-run-btn" class="daily-run-btn" style="width:100%; border:none; border-radius:18px; padding:1rem 1.1rem; background:linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%); color:#fff; font-size:1rem; font-weight:950; cursor:pointer; box-shadow:0 16px 28px rgba(37,99,235,0.25);">결과 보기</button>
          <div id="daily-run-status" style="min-height:1.2rem; margin-top:0.8rem; color:#64748b; font-size:0.82rem; font-weight:700;"></div>
          <div id="daily-result-slot"></div>
        </section>
      </div>
    `;

    const runBtn = document.getElementById('daily-run-btn');
    const status = document.getElementById('daily-run-status');
    const resultSlot = document.getElementById('daily-result-slot');

    runBtn?.addEventListener('click', async () => {
      runBtn.disabled = true;
      runBtn.textContent = '결과 확인 중...';
      if (status) status.textContent = '오늘 결과를 가져오는 중입니다.';

      try {
        const payload = await requestDailyResult(slug);
        resultSlot.innerHTML = renderResultSection(test, payload);
        if (status) status.textContent = '';

        document.getElementById('daily-copy-btn')?.addEventListener('click', async () => {
          try {
            await copyResultText(test, payload.resultPayload);
          } catch (error) {
            const node = document.getElementById('daily-copy-status');
            if (node) node.textContent = '복사에 실패했습니다.';
          }
        });

        document.getElementById('daily-save-btn')?.addEventListener('click', async () => {
          await saveAsStoryImage('daily-capture-card', `${test.slug}-today.png`);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        if (status) status.textContent = error.message || '결과를 가져오지 못했습니다.';
      } finally {
        runBtn.disabled = false;
        runBtn.textContent = '결과 다시 보기';
      }
    });
  } catch (error) {
    renderError(error.message || '테스트를 불러오지 못했습니다.');
  }
}
