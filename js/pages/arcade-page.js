import { UserState, updateUI } from '../auth.js?v=8.5.1';
import { initArcade } from '../arcade.js';

function renderArcadeCardShell({ title, icon, badge, badgeStyle, desc, body, tone = 'neutral' }) {
    return `
        <article class="card arcade-item-card arcade-tone-${tone}" style="margin-bottom:0; display:flex; flex-direction:column; border-radius:26px; overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.9rem; margin-bottom:0.95rem;">
                <div style="display:flex; align-items:center; gap:0.78rem; min-width:0;">
                    <div style="width:52px; height:52px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:1.55rem; background:rgba(255,255,255,0.9); box-shadow:0 10px 18px rgba(15,23,42,0.08); flex-shrink:0;">
                        ${icon}
                    </div>
                    <div style="min-width:0;">
                        <h3 style="font-size:1.14rem; font-weight:900; color:#0f172a; margin:0 0 0.2rem; letter-spacing:-0.03em; line-height:1.2;">${title}</h3>
                        <p style="font-size:0.84rem; color:#475569; line-height:1.55; font-weight:650; margin:0;">${desc}</p>
                    </div>
                </div>
                <span style="${badgeStyle}">${badge}</span>
            </div>
            <div style="margin-top:auto;">
                ${body}
            </div>
        </article>
    `;
}

function renderBalanceRows() {
    const rows = [
        ['출석체크', '무료', '100P + 펫 보너스', '안정', '하루 1회 고정'],
        ['포인트 채굴', '무료', '4~10P', '낮음', '2.2초 대기'],
        ['행운 캡슐', '무료', '12~50P', '낮음', '5분 쿨타임'],
        ['코인 플립', '150P', '280P 또는 0', '중간', '50:50'],
        ['슬롯', '300P', '450P / 4000P / 0', '높음', '잭팟형'],
        ['주사위 베팅', '가변', '1.9x ~ 3.2x', '중간', '선택형'],
        ['폭탄 돌리기', '300P', '80~1000P 또는 0', '높음', '중간 탈출 가능'],
        ['타이밍 챌린지', '80P', '0~220P', '중간', '실력형']
    ];

    const riskTone = {
        안정: { bg: 'rgba(16,185,129,0.12)', color: '#047857' },
        낮음: { bg: 'rgba(14,165,233,0.12)', color: '#0369a1' },
        중간: { bg: 'rgba(99,102,241,0.12)', color: '#4338ca' },
        높음: { bg: 'rgba(244,63,94,0.12)', color: '#be123c' }
    };

    return rows.map(([name, cost, reward, risk, note]) => `
        <tr>
            <td style="padding:0.95rem 0.9rem; border-bottom:1px solid #e2e8f0;">
                <div style="font-size:0.92rem; font-weight:900; color:#0f172a; letter-spacing:-0.02em;">${name}</div>
            </td>
            <td style="padding:0.95rem 0.9rem; border-bottom:1px solid #e2e8f0;">
                <span style="display:inline-flex; align-items:center; min-height:30px; padding:0.35rem 0.68rem; border-radius:999px; background:#f8fafc; border:1px solid #e2e8f0; font-size:0.8rem; font-weight:800; color:#334155;">${cost}</span>
            </td>
            <td style="padding:0.95rem 0.9rem; border-bottom:1px solid #e2e8f0;">
                <div style="font-size:0.87rem; font-weight:850; color:#1e293b; line-height:1.5;">${reward}</div>
            </td>
            <td style="padding:0.95rem 0.9rem; border-bottom:1px solid #e2e8f0;">
                <span style="display:inline-flex; align-items:center; min-height:30px; padding:0.35rem 0.68rem; border-radius:999px; background:${riskTone[risk].bg}; color:${riskTone[risk].color}; font-size:0.78rem; font-weight:900;">${risk}</span>
            </td>
            <td style="padding:0.95rem 0.9rem; border-bottom:1px solid #e2e8f0;">
                <div style="font-size:0.82rem; font-weight:700; color:#64748b; line-height:1.55;">${note}</div>
            </td>
        </tr>
    `).join('');
}

function renderBalanceHighlights() {
    const highlights = [
        { label: '무료 루프', value: '출석 + 채굴 + 캡슐', desc: '리스크 없이 하루 기본 포인트를 모으는 구간', tone: 'rgba(16,185,129,0.1)', color: '#047857' },
        { label: '중간 승부', value: '코인 플립 / 타이밍', desc: '손실과 보상이 모두 있는 반복형 구간', tone: 'rgba(79,70,229,0.1)', color: '#4338ca' },
        { label: '고위험 한방', value: '슬롯 / 폭탄 / 주사위', desc: '기대값보다 연출과 긴장감이 큰 구간', tone: 'rgba(244,114,182,0.1)', color: '#be185d' }
    ];

    return highlights.map((item) => `
        <div style="padding:0.95rem 1rem; border-radius:20px; background:${item.tone}; border:1px solid rgba(148,163,184,0.14);">
            <div style="font-size:0.72rem; font-weight:900; letter-spacing:0.08em; color:${item.color}; margin-bottom:0.28rem;">${item.label}</div>
            <div style="font-size:1rem; font-weight:950; color:#0f172a; margin-bottom:0.24rem;">${item.value}</div>
            <div style="font-size:0.82rem; line-height:1.55; color:#475569; font-weight:650;">${item.desc}</div>
        </div>
    `).join('');
}

export function renderArcade() {
    const app = document.getElementById('app');
    const isLoggedIn = !!UserState.user;
    const userData = UserState.data || {};
    const lastGrade = sessionStorage.getItem('last_alchemy_grade') || 'COMMON';
    const inventoryCount = (userData.inventory || []).length;
    const totalScore = userData.totalScore || 0;

    app.innerHTML = `
        <div class="arcade-page fade-in" style="max-width:1120px; margin:0 auto; padding:1.2rem 1rem 5rem;">
            <section class="arcade-command-hero" style="position:relative; overflow:hidden; border-radius:36px; padding:1.3rem; margin-bottom:1.4rem; background:linear-gradient(145deg,#0f172a 0%, #312e81 40%, #0f766e 100%); color:#fff; box-shadow:0 24px 50px rgba(15,23,42,0.22);">
                <div style="position:absolute; width:380px; height:380px; top:-200px; right:-120px; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 72%);"></div>
                <div style="position:absolute; width:280px; height:280px; bottom:-160px; left:-90px; border-radius:50%; background:radial-gradient(circle, rgba(45,212,191,0.26) 0%, rgba(45,212,191,0) 72%);"></div>
                <div style="position:relative; z-index:1; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; align-items:stretch;">
                    <div style="display:flex; flex-direction:column; justify-content:space-between; min-height:320px;">
                        <div>
                            <div style="font-size:0.76rem; font-weight:900; letter-spacing:0.16em; color:rgba(255,255,255,0.72); margin-bottom:0.85rem;">SEVEN ARCADE CONTROL ROOM</div>
                            <div style="font-size:3rem; margin-bottom:0.75rem;">🎰</div>
                            <h2 style="font-size:clamp(2rem, 6vw, 3rem); line-height:1.03; letter-spacing:-0.05em; font-weight:950; margin:0 0 0.8rem;">한 판만 하려다<br>계속 눌러보는 곳</h2>
                            <p style="font-size:0.98rem; line-height:1.72; color:rgba(240,253,250,0.92); font-weight:650; max-width:95%;">무료 보상부터 한방 승부, 수집/정리 콘텐츠까지 흐름을 나눠서 다시 정리했습니다. 처음 들어와도 무엇부터 해야 할지 바로 보이는 오락실로 바꿨습니다.</p>
                        </div>
                        <div style="display:flex; gap:0.55rem; flex-wrap:wrap; margin-top:1.15rem;">
                            <span style="padding:0.5rem 0.8rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.16); font-size:0.77rem; font-weight:850;">무료 입문 존</span>
                            <span style="padding:0.5rem 0.8rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.16); font-size:0.77rem; font-weight:850;">리스크/한방 존</span>
                            <span style="padding:0.5rem 0.8rem; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.16); font-size:0.77rem; font-weight:850;">수집/정리 존</span>
                        </div>
                    </div>

                    <div style="display:grid; gap:0.85rem; align-content:start;">
                        <div style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.16); border-radius:28px; padding:1rem 1.05rem; backdrop-filter:blur(10px);">
                            <div style="font-size:0.74rem; font-weight:900; letter-spacing:0.1em; color:rgba(255,255,255,0.72); margin-bottom:0.55rem;">PLAYER STATUS</div>
                            <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:0.7rem;">
                                <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.12);">
                                    <div style="font-size:0.74rem; font-weight:800; color:rgba(255,255,255,0.72); margin-bottom:0.24rem;">보유 포인트</div>
                                    <div style="font-size:1.3rem; font-weight:950;">${(userData.points || 0).toLocaleString()}P</div>
                                </div>
                                <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.12);">
                                    <div style="font-size:0.74rem; font-weight:800; color:rgba(255,255,255,0.72); margin-bottom:0.24rem;">부스터</div>
                                    <div style="font-size:1.3rem; font-weight:950;">${userData.boosterCount || 0}회</div>
                                </div>
                                <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.12);">
                                    <div style="font-size:0.74rem; font-weight:800; color:rgba(255,255,255,0.72); margin-bottom:0.24rem;">인벤토리</div>
                                    <div style="font-size:1.3rem; font-weight:950;">${inventoryCount.toLocaleString()}개</div>
                                </div>
                                <div style="padding:0.9rem; border-radius:18px; background:rgba(255,255,255,0.12);">
                                    <div style="font-size:0.74rem; font-weight:800; color:rgba(255,255,255,0.72); margin-bottom:0.24rem;">아이템 점수</div>
                                    <div style="font-size:1.3rem; font-weight:950;">${totalScore.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div style="background:#f8fafc; color:#0f172a; border-radius:28px; padding:1rem; border:1px solid rgba(255,255,255,0.2); box-shadow:0 18px 30px rgba(15,23,42,0.12);">
                            <div style="font-size:0.74rem; font-weight:900; color:#4f46e5; letter-spacing:0.1em; margin-bottom:0.55rem;">STARTING ROUTE</div>
                            <div style="display:grid; gap:0.55rem;">
                                <div style="font-size:0.9rem; color:#334155; font-weight:750;">무료 보상 챙기기: <strong>출석체크</strong> → <strong>포인트 채굴</strong></div>
                                <div style="font-size:0.9rem; color:#334155; font-weight:750;">한방 노리기: <strong>이모지 슬롯</strong> → <strong>주사위 베팅</strong> → <strong>폭탄 돌리기</strong></div>
                                <div style="font-size:0.9rem; color:#334155; font-weight:750;">수집/정리 루프: <strong>아이템 뽑기</strong> → <strong>연금술</strong> → <strong>중고장터</strong></div>
                            </div>
                            ${isLoggedIn ? '' : `
                                <button class="btn-primary" onclick="document.getElementById('login-btn')?.click()" style="margin-top:0.9rem; width:100%; background:linear-gradient(135deg,#4f46e5,#7c3aed); border:none; height:52px; font-weight:900;">로그인하고 포인트 흐름 시작</button>
                            `}
                        </div>
                    </div>
                </div>
            </section>

            ${isLoggedIn ? `
                <details class="profile-details quest-section fade-in" style="margin-bottom: 1.5rem; border: 2px solid var(--accent-soft); border-radius:24px; overflow:hidden;">
                    <summary id="quest-summary" style="font-size:1.04rem; font-weight:900; padding:1rem 1.2rem; background:linear-gradient(135deg,#eef2ff,#ffffff);">📜 오늘의 오락실 미션 (로딩 중...)</summary>
                    <div class="content-area" style="display:grid; gap:1rem;">
                        <div id="daily-quest-list"></div>
                        <div id="weekly-arcade-bonus"></div>
                    </div>
                </details>
            ` : ''}

            <details class="card arcade-balance-card" style="margin-bottom:1.2rem; border-radius:28px; padding:0; border:1px solid rgba(226,232,240,0.95); background:linear-gradient(180deg,#ffffff,#f8fafc); overflow:hidden;">
                <summary style="list-style:none; cursor:pointer; padding:1.2rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
                        <div style="min-width:0;">
                            <div style="font-size:0.76rem; color:#2563eb; font-weight:900; letter-spacing:0.14em; margin-bottom:0.22rem;">BALANCE SHEET</div>
                            <h3 style="font-size:1.35rem; font-weight:950; letter-spacing:-0.03em; color:#0f172a; margin:0 0 0.35rem;">게임별 수익 / 손실 기준표</h3>
                            <div style="font-size:0.84rem; color:#475569; line-height:1.6; font-weight:650;">자주 돌릴 게임과 한방용 게임의 성격만 빠르게 확인하고, 필요할 때만 상세 표를 펼쳐보는 구조로 바꿨습니다.</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:0.55rem; flex-wrap:wrap;">
                            <span style="padding:0.46rem 0.78rem; border-radius:999px; background:#dbeafe; color:#1d4ed8; font-size:0.74rem; font-weight:900;">기본 접힘</span>
                            <span style="padding:0.46rem 0.78rem; border-radius:999px; background:#ecfeff; color:#0f766e; font-size:0.74rem; font-weight:900;">펼치면 상세 표</span>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem; margin-top:0.95rem;">
                        ${renderBalanceHighlights()}
                    </div>
                    <div style="display:flex; justify-content:flex-end; margin-top:0.9rem;">
                        <span style="font-size:0.8rem; color:#64748b; font-weight:800;">눌러서 상세 기준표 펼치기</span>
                    </div>
                </summary>
                <div style="padding:0 1.2rem 1.2rem; border-top:1px solid rgba(226,232,240,0.95);">
                    <div style="font-size:0.8rem; color:#64748b; font-weight:700; margin:0.95rem 0 0.85rem;">무료 루프와 고위험 게임의 기대값을 다시 조정한 상세 기준표</div>
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:separate; border-spacing:0; min-width:720px;">
                            <thead>
                                <tr style="background:#eff6ff; color:#1d4ed8;">
                                    <th style="text-align:left; padding:0.8rem 0.9rem; font-size:0.78rem; font-weight:900;">게임</th>
                                    <th style="text-align:left; padding:0.8rem 0.9rem; font-size:0.78rem; font-weight:900;">진입 비용</th>
                                    <th style="text-align:left; padding:0.8rem 0.9rem; font-size:0.78rem; font-weight:900;">보상 구조</th>
                                    <th style="text-align:left; padding:0.8rem 0.9rem; font-size:0.78rem; font-weight:900;">리스크</th>
                                    <th style="text-align:left; padding:0.8rem 0.9rem; font-size:0.78rem; font-weight:900;">메모</th>
                                </tr>
                            </thead>
                            <tbody style="background:#fff;">
                                ${renderBalanceRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </details>

            <section style="margin-bottom:1.2rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:0.9rem; flex-wrap:wrap;">
                    <div>
                        <div style="font-size:0.76rem; color:#10b981; font-weight:900; letter-spacing:0.14em; margin-bottom:0.22rem;">FREE ENTRY</div>
                        <h3 style="font-size:1.45rem; font-weight:950; letter-spacing:-0.03em; color:#0f172a; margin:0;">가볍게 시작하는 무료 존</h3>
                    </div>
                    <div style="font-size:0.86rem; color:#64748b; font-weight:700;">리스크 없이 포인트를 모으는 첫 루프</div>
                </div>
                <div class="arcade-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
                    ${renderArcadeCardShell({
                        title: '일일 출석체크',
                        icon: '📅',
                        badge: 'FREE',
                        tone: 'mint',
                        badgeStyle: 'background: rgba(16,185,129,0.12); color:#059669; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '하루 한 번, 가장 빠르게 포인트를 챙기는 입장권입니다.',
                        body: `
                            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.12); border-radius:18px; padding:0.95rem; margin-bottom:1rem; min-height:88px; display:flex; flex-direction:column; justify-content:center;">
                                <div style="font-size:0.76rem; color:#059669; font-weight:900; letter-spacing:0.08em; margin-bottom:0.25rem;">TODAY REWARD</div>
                                <div style="font-size:1.4rem; font-weight:950; color:#065f46;">100P</div>
                                <div style="font-size:0.84rem; color:#475569; font-weight:650;">눌러두면 오늘의 기본 보상 확보</div>
                            </div>
                            <button id="daily-checkin-btn" class="btn-primary" style="width:100%; background:#10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3); height:55px; border:none; font-weight:900;">출석체크 완료하기</button>
                        `
                    })}

                    ${renderArcadeCardShell({
                        title: '포인트 채굴',
                        icon: '⛏️',
                        badge: 'LIMITLESS',
                        tone: 'indigo',
                        badgeStyle: 'background: rgba(79,70,229,0.1); color:#4f46e5; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '버튼 한 번으로 랜덤 포인트를 뽑아내는 무한 반복 구간입니다.',
                        body: `
                            <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:0.65rem; margin-bottom:1rem;">
                                <div style="padding:0.95rem; border-radius:18px; background:#eef2ff; text-align:center;">
                                    <div style="font-size:0.73rem; color:#4f46e5; font-weight:900; margin-bottom:0.2rem;">획득 범위</div>
                                    <div style="font-size:1.2rem; font-weight:950; color:#312e81;">4~10P</div>
                                </div>
                                <div style="padding:0.95rem; border-radius:18px; background:#eef2ff; text-align:center;">
                                    <div style="font-size:0.73rem; color:#4f46e5; font-weight:900; margin-bottom:0.2rem;">재사용 대기</div>
                                    <div style="font-size:1.2rem; font-weight:950; color:#312e81;">2.2초</div>
                                </div>
                            </div>
                            <button id="click-game-btn" class="btn-primary" style="width:100%; height:55px; background:linear-gradient(90deg, var(--accent-color), #8b5cf6); border:none; font-weight:900;">채굴기 가동 시작</button>
                        `
                    })}

                    ${renderArcadeCardShell({
                        title: '행운 캡슐',
                        icon: '🎁',
                        badge: 'FREE',
                        tone: 'mint',
                        badgeStyle: 'background: rgba(16,185,129,0.12); color:#059669; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '5분마다 한 번 열 수 있는 가벼운 무료 캡슐입니다.',
                        body: `
                            <div id="lucky-draw-result" style="min-height:88px; display:flex; align-items:center; justify-content:center; margin-bottom:1rem; border:2px dashed rgba(16,185,129,0.18); border-radius:18px; text-align:center; font-size:0.88rem; background:rgba(16,185,129,0.04); font-weight:700; padding:12px;">보상 범위 12~50P · 5분 쿨타임</div>
                            <button id="lucky-draw-btn" class="btn-primary" style="width:100%; background:#0f766e; box-shadow:0 4px 14px rgba(15,118,110,0.24); height:55px; border:none; font-weight:900;">행운 캡슐 열기</button>
                        `
                    })}
                </div>
            </section>

            <section style="margin-bottom:1.2rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:0.9rem; flex-wrap:wrap;">
                    <div>
                        <div style="font-size:0.76rem; color:#ef4444; font-weight:900; letter-spacing:0.14em; margin-bottom:0.22rem;">HIGH RISK / HIGH FUN</div>
                        <h3 style="font-size:1.45rem; font-weight:950; letter-spacing:-0.03em; color:#0f172a; margin:0;">한 번 더 누르게 되는 승부 존</h3>
                    </div>
                    <div style="font-size:0.86rem; color:#64748b; font-weight:700;">한방 잭팟과 긴장감 있는 게임 구간</div>
                </div>
                <div class="arcade-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1rem;">
                    ${renderArcadeCardShell({
                        title: '코인 플립',
                        icon: '🪙',
                        badge: '50:50',
                        tone: 'indigo',
                        badgeStyle: 'background: rgba(79,70,229,0.1); color:#4f46e5; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '앞면과 뒷면 중 하나를 고르는 가장 직관적인 반반 베팅입니다.',
                        body: `
                            <div style="display:grid; place-items:center; min-height:114px; margin-bottom:1rem; border:2px solid rgba(99,102,241,0.16); border-radius:18px; background:linear-gradient(145deg, rgba(238,242,255,0.8), rgba(255,255,255,0.95));">
                                <div id="coin-flip-coin" style="font-size:3rem; line-height:1; margin-bottom:0.35rem;">🪙</div>
                                <div id="coin-flip-status" style="font-size:0.82rem; font-weight:800; color:#475569;">150P 베팅 · 맞히면 280P 지급</div>
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem;">
                                <button id="coin-heads-btn" class="btn-primary" style="background:#2563eb; height:55px; border:none; font-weight:900;">앞면 베팅</button>
                                <button id="coin-tails-btn" class="btn-primary" style="background:#7c3aed; height:55px; border:none; font-weight:900;">뒷면 베팅</button>
                            </div>
                        `
                    })}

                    ${renderArcadeCardShell({
                        title: '이모지 슬롯',
                        icon: '🎰',
                        badge: 'JACKPOT',
                        tone: 'peach',
                        badgeStyle: 'background: rgba(253,160,133,0.12); color:#ea580c; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '짧지만 가장 드라마틱한 당첨 연출을 보는 게임입니다.',
                        body: `
                            <div id="slot-machine-container" style="height:108px; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:1.1rem; border:2px solid #fdba74; border-radius:18px; background:linear-gradient(145deg, rgba(253,160,133,0.1), rgba(255,255,255,0.7)); font-size:3rem; overflow:hidden;">
                                <div class="slot-reel" id="slot-1">🎰</div>
                                <div class="slot-reel" id="slot-2">🎰</div>
                                <div class="slot-reel" id="slot-3">🎰</div>
                            </div>
                            <div style="display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:0.55rem; margin-bottom:1rem;">
                                <div style="padding:0.7rem; border-radius:14px; background:#fff7ed; text-align:center;"><div style="font-size:0.7rem; color:#c2410c; font-weight:900;">비용</div><div style="font-size:1rem; font-weight:950; color:#9a3412;">300P</div></div>
                                <div style="padding:0.7rem; border-radius:14px; background:#fff7ed; text-align:center;"><div style="font-size:0.7rem; color:#c2410c; font-weight:900;">2개 일치</div><div style="font-size:1rem; font-weight:950; color:#9a3412;">450P</div></div>
                                <div style="padding:0.7rem; border-radius:14px; background:#fff7ed; text-align:center;"><div style="font-size:0.7rem; color:#c2410c; font-weight:900;">잭팟</div><div style="font-size:1rem; font-weight:950; color:#9a3412;">4000P</div></div>
                            </div>
                            <button id="slot-spin-btn" class="btn-primary" style="width:100%; background:#fda085; box-shadow: 0 4px 14px rgba(253, 160, 133, 0.3); height:55px; font-weight: 900; border:none;">슬롯 돌리기 (300P)</button>
                        `
                    })}

                    ${renderArcadeCardShell({
                        title: '주사위 3개 베팅',
                        icon: '🎲',
                        badge: 'BIG / SMALL',
                        tone: 'emerald',
                        badgeStyle: 'background: rgba(16,185,129,0.12); color:#059669; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '금액을 직접 정하고, 한 번의 선택으로 판을 가르는 승부입니다.',
                        body: `
                            <div style="background: var(--bg-color); padding: 1rem; border-radius: 18px; margin-bottom: 1rem; border: 1px solid var(--border-color); text-align:center;">
                                <label style="display: block; font-size: 0.7rem; font-weight: 900; color: var(--text-sub); margin-bottom: 0.5rem; letter-spacing: 0.08em;">베팅 금액 (10P ~ 10,000P)</label>
                                <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                                    <span style="font-size:1.2rem; font-weight:900; color:#10b981;">₩</span>
                                    <input type="number" id="bet-amount" value="100" min="10" max="10000" step="10"
                                        style="width:120px; background: transparent; border: none; text-align:center; font-size:1.8rem; font-weight:900; color: var(--text-main); outline: none; border-bottom: 2px solid #10b981; padding: 0;">
                                    <span style="font-size:1.2rem; font-weight:900; color:var(--text-sub);">P</span>
                                </div>
                            </div>
                            <div id="bet-result-msg" style="text-align:center; font-weight:800; margin-bottom:1rem; min-height:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(16, 185, 129, 0.05); border-radius:16px; padding: 15px; border: 1px dashed #10b981;">
                                <div id="dice-display" style="display:flex; gap:20px; margin-bottom: 12px; transition: all 0.3s ease; height: 70px; align-items: center;">
                                    <div class="dice-container">
                                        <div class="dice show-1" id="dice-cube-1">
                                            <div class="dice-face face-1"><div class="dot"></div></div>
                                            <div class="dice-face face-2"><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-3"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-4"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-5"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-6"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                        </div>
                                    </div>
                                    <div class="dice-container">
                                        <div class="dice show-1" id="dice-cube-2">
                                            <div class="dice-face face-1"><div class="dot"></div></div>
                                            <div class="dice-face face-2"><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-3"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-4"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-5"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-6"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                        </div>
                                    </div>
                                    <div class="dice-container">
                                        <div class="dice show-1" id="dice-cube-3">
                                            <div class="dice-face face-1"><div class="dot"></div></div>
                                            <div class="dice-face face-2"><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-3"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-4"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-5"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                            <div class="dice-face face-6"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                                        </div>
                                    </div>
                                </div>
                                <div id="dice-status-text" style="color:var(--text-sub); font-size: 0.85rem;">행운의 숫자를 기대하세요!</div>
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.6rem;">
                                <div style="position:relative;">
                                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#10b981; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">3.2배</span>
                                    <button class="bet-btn btn-primary" style="background:#10b981; font-weight: 900; width:100%; height:60px; padding-top:5px; border:none; border-radius:14px;" data-game="dice3" data-choice="small">소(3~8)</button>
                                </div>
                                <div style="position:relative;">
                                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#3b82f6; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">1.9배</span>
                                    <button class="bet-btn btn-primary" style="background:#3b82f6; font-weight: 900; width:100%; height:60px; padding-top:5px; border:none; border-radius:14px;" data-game="dice3" data-choice="middle">중(9~12)</button>
                                </div>
                                <div style="position:relative;">
                                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#f59e0b; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">3.2배</span>
                                    <button class="bet-btn btn-primary" style="background:#f59e0b; font-weight: 900; width:100%; height:60px; padding-top:5px; border:none; border-radius:14px;" data-game="dice3" data-choice="big">대(13~18)</button>
                                </div>
                            </div>
                        `
                    })}

                    ${renderArcadeCardShell({
                        title: '폭탄 돌리기',
                        icon: '🧨',
                        badge: 'DANGER',
                        tone: 'rose',
                        badgeStyle: 'background: rgba(244,63,94,0.12); color:#e11d48; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '멈출지 더 갈지 고민하게 만드는 긴장형 적립 게임입니다.',
                        body: `
                            <p id="bomb-msg" class="text-sub" style="font-size:0.9rem; margin-bottom:1rem; text-align: center; min-height: 24px; font-weight:700;">전선을 선택하세요! (현재 누적: 0P)</p>
                            <div id="bomb-wires" style="display:grid; grid-template-columns: repeat(5, 1fr); gap:0.5rem; margin-bottom:1.1rem;">
                                <button class="wire-btn" data-wire="0" style="height:60px; background:#ef4444; border:none; border-radius:12px;"></button>
                                <button class="wire-btn" data-wire="1" style="height:60px; background:#3b82f6; border:none; border-radius:12px;"></button>
                                <button class="wire-btn" data-wire="2" style="height:60px; background:#10b981; border:none; border-radius:12px;"></button>
                                <button class="wire-btn" data-wire="3" style="height:60px; background:#f59e0b; border:none; border-radius:12px;"></button>
                                <button class="wire-btn" data-wire="4" style="height:60px; background:#8b5cf6; border:none; border-radius:12px;"></button>
                            </div>
                            <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:0.4rem; margin-bottom:1rem;">
                                <div style="padding:0.55rem; border-radius:12px; background:#fff1f2; text-align:center;"><div style="font-size:0.68rem; color:#be123c; font-weight:900;">1선 성공</div><div style="font-size:0.9rem; font-weight:950; color:#9f1239;">80P</div></div>
                                <div style="padding:0.55rem; border-radius:12px; background:#fff1f2; text-align:center;"><div style="font-size:0.68rem; color:#be123c; font-weight:900;">2선 성공</div><div style="font-size:0.9rem; font-weight:950; color:#9f1239;">220P</div></div>
                                <div style="padding:0.55rem; border-radius:12px; background:#fff1f2; text-align:center;"><div style="font-size:0.68rem; color:#be123c; font-weight:900;">3선 성공</div><div style="font-size:0.9rem; font-weight:950; color:#9f1239;">500P</div></div>
                                <div style="padding:0.55rem; border-radius:12px; background:#fff1f2; text-align:center;"><div style="font-size:0.68rem; color:#be123c; font-weight:900;">4선 성공</div><div style="font-size:0.9rem; font-weight:950; color:#9f1239;">1000P</div></div>
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.6rem;">
                                <button id="bomb-start-btn" class="btn-primary" style="background:#f43f5e; font-size:0.84rem; height:52px; border:none; font-weight:900;">게임 시작 (300P)</button>
                                <button id="bomb-claim-btn" class="btn-secondary" style="font-size:0.84rem; height:52px; border-color:#f43f5e; color:#f43f5e; font-weight:900;" disabled>포인트 챙기기</button>
                            </div>
                        `
                    })}
                </div>
            </section>

            <section style="margin-bottom:1.2rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:0.9rem; flex-wrap:wrap;">
                    <div>
                        <div style="font-size:0.76rem; color:#7c3aed; font-weight:900; letter-spacing:0.14em; margin-bottom:0.22rem;">REFLEX / TIMING</div>
                        <h3 style="font-size:1.45rem; font-weight:950; letter-spacing:-0.03em; color:#0f172a; margin:0;">순발력으로 포인트 챙기는 집중 존</h3>
                    </div>
                    <div style="font-size:0.86rem; color:#64748b; font-weight:700;">짧게 켜고 집중력으로 보상 차이를 만드는 구간</div>
                </div>
                <div class="arcade-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1rem;">
                    ${renderArcadeCardShell({
                        title: '타이밍 챌린지',
                        icon: '🎯',
                        badge: 'SKILL',
                        tone: 'violet',
                        badgeStyle: 'background: rgba(139,92,246,0.12); color:#7c3aed; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '80P 참가비를 내고, 목표 구간에 얼마나 가깝게 멈추는지로 보상이 갈리는 순발력 게임입니다.',
                        body: `
                            <div style="padding:1rem; border-radius:20px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.14); margin-bottom:1rem;">
                                <div style="position:relative; height:18px; border-radius:999px; background:#ede9fe; overflow:hidden; margin-bottom:0.9rem;">
                                    <div style="position:absolute; left:66%; width:12%; top:0; bottom:0; background:rgba(168,85,247,0.32);"></div>
                                    <div id="timing-rush-fill" style="width:0%; height:100%; background:linear-gradient(90deg,#6366f1,#8b5cf6); border-radius:999px;"></div>
                                    <div id="timing-rush-marker" style="position:absolute; left:72%; top:50%; transform:translate(-50%,-50%); font-size:0.85rem;">🎯</div>
                                </div>
                                <div id="timing-rush-status" style="font-size:0.82rem; color:#475569; font-weight:700; min-height:40px; text-align:center;">참가비 80P · 목표 구간 근접 시 최대 220P</div>
                            </div>
                            <button id="timing-rush-btn" class="btn-primary" style="width:100%; background:#7c3aed; height:55px; border:none; font-weight:900;">타이밍 챌린지 시작</button>
                        `
                    })}
                </div>
            </section>

            <section style="margin-bottom:1.2rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:0.9rem; flex-wrap:wrap;">
                    <div>
                        <div style="font-size:0.76rem; color:#8b5cf6; font-weight:900; letter-spacing:0.14em; margin-bottom:0.22rem;">COLLECT / UPGRADE / CLEANUP</div>
                        <h3 style="font-size:1.45rem; font-weight:950; letter-spacing:-0.03em; color:#0f172a; margin:0;">수집과 정리에 빠지는 루프 존</h3>
                    </div>
                    <div style="font-size:0.86rem; color:#64748b; font-weight:700;">가챠, 연성, 장터를 한 흐름으로 정리</div>
                </div>
                <div class="arcade-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1rem;">
                    ${renderArcadeCardShell({
                        title: '아이템 뽑기',
                        icon: '📦',
                        badge: 'GACHA',
                        tone: 'violet',
                        badgeStyle: 'background: rgba(99,102,241,0.12); color:#4f46e5; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '포인트를 태워 인벤토리를 불리는 가장 직관적인 수집 루트입니다.',
                        body: `
                            <div id="gacha-result" class="gacha-box" style="min-height:80px; display:flex; align-items:center; justify-content:center; margin-bottom:1rem; border:2px dashed var(--border-color); border-radius:18px; text-align:center; font-size:0.9rem; background:rgba(99,102,241,0.03); font-weight: 600; padding: 12px;">희귀 아이템이 쏟아집니다</div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.5rem;">
                                <div style="position:relative;">
                                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--accent-color); color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">100P</span>
                                    <button id="gacha-btn" class="btn-primary" style="background:var(--accent-color); font-size:0.8rem; width:100%; height:55px; font-weight:900; padding-top:5px; border:none;">1회 뽑기</button>
                                </div>
                                <div style="position:relative;">
                                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--accent-color); color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">950P</span>
                                    <button id="gacha-10-btn" class="btn-primary" style="background:var(--accent-color); font-size:0.8rem; width:100%; height:55px; font-weight:900; padding-top:5px; border:none;">10회 뽑기</button>
                                </div>
                                <div style="position:relative;">
                                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#f43f5e; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">2,700P</span>
                                    <button id="gacha-30-btn" class="btn-primary" style="background:#f43f5e; font-size:0.8rem; width:100%; height:55px; font-weight:900; padding-top:5px; border:none;">30회 뽑기</button>
                                </div>
                            </div>
                        `
                    })}

                    ${renderArcadeCardShell({
                        title: '아이템 연금술',
                        icon: '⚗️',
                        badge: 'UPGRADE',
                        tone: 'violet',
                        badgeStyle: 'background: rgba(139,92,246,0.12); color:#7c3aed; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '같은 등급 재료를 태워 상위 등급으로 밀어 올리는 핵심 업그레이드 구간입니다.',
                        body: `
                            <div style="background:var(--bg-color); padding:1rem; border-radius:16px; margin-bottom:1rem; border: 1px solid var(--border-color); text-align:center;">
                                <p style="font-size:0.75rem; font-weight:900; color:var(--text-sub); margin-bottom:1rem;">연성할 재료 등급 선택<br><span style="color:var(--accent-color); font-size:0.66rem;">동일 등급 재료 6개 소모</span></p>
                                <div class="alchemy-grade-boxes" id="alchemy-grade-boxes">
                                    <div class="alchemy-grade-box ${lastGrade === 'COMMON' ? 'active' : ''}" data-grade="COMMON">
                                        <span class="g-icon">💩</span>
                                        <span class="g-name">일반</span>
                                        <span class="g-count" id="count-COMMON">0</span>
                                    </div>
                                    <div class="alchemy-grade-box ${lastGrade === 'UNCOMMON' ? 'active' : ''}" data-grade="UNCOMMON">
                                        <span class="g-icon">🥈</span>
                                        <span class="g-name">고급</span>
                                        <span class="g-count" id="count-UNCOMMON">0</span>
                                    </div>
                                    <div class="alchemy-grade-box ${lastGrade === 'RARE' ? 'active' : ''}" data-grade="RARE">
                                        <span class="g-icon">💎</span>
                                        <span class="g-name">희귀</span>
                                        <span class="g-count" id="count-RARE">0</span>
                                    </div>
                                </div>
                            </div>
                            <div id="alchemy-result" style="text-align:center; font-weight:800; color:#8b5cf6; margin-bottom:1rem; min-height:60px; font-size:0.85rem; display:flex; align-items:center; justify-content:center; background:rgba(139, 92, 246, 0.05); border-radius:14px; padding: 0.5rem;">금단의 연성법을 시전합니다</div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.5rem;">
                                <div style="position:relative;">
                                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#8b5cf6; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">500P</span>
                                    <button id="alchemy-btn" class="btn-primary" style="background:#8b5cf6; font-size:0.8rem; width:100%; height:55px; font-weight:900; padding-top:5px; border:none;">1회 연성</button>
                                </div>
                                <div style="position:relative;">
                                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#7c3aed; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">2,200P</span>
                                    <button id="alchemy-5-btn" class="btn-primary" style="background:#7c3aed; font-size:0.8rem; width:100%; height:55px; font-weight:900; padding-top:5px; border:none;">5회 연성</button>
                                </div>
                                <div style="position:relative;">
                                    <span style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#6d28d9; color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:900; white-space:nowrap; border:1px solid rgba(255,255,255,0.3); z-index:1;">4,000P</span>
                                    <button id="alchemy-10-btn" class="btn-primary" style="background:#6d28d9; font-size:0.8rem; width:100%; height:55px; font-weight:900; padding-top:5px; border:none;">10회 연성</button>
                                </div>
                            </div>
                        `
                    })}

                    ${renderArcadeCardShell({
                        title: '아이템 중고장터',
                        icon: '🏪',
                        badge: 'BULK SELL',
                        tone: 'emerald',
                        badgeStyle: 'background: rgba(16,185,129,0.12); color:#059669; padding:5px 12px; border-radius:999px; font-size:0.72rem; font-weight:900; white-space:nowrap;',
                        desc: '가치가 낮은 아이템을 정리해 다시 포인트 흐름으로 되돌리는 회수 구간입니다.',
                        body: `
                            <div style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.12); border-radius:16px; padding:1rem; margin-bottom:1rem;">
                                <div style="font-size:0.76rem; color:#059669; font-weight:900; letter-spacing:0.08em; margin-bottom:0.22rem;">REFUND RULE</div>
                                <div style="font-size:1.1rem; font-weight:950; color:#065f46; margin-bottom:0.18rem;">아이템 가치의 70%</div>
                                <div style="font-size:0.84rem; color:#475569; font-weight:650;">인벤토리를 한 번에 정리하고 포인트를 회수합니다.</div>
                            </div>
                            <div id="market-ui-container"></div>
                            <button id="market-open-btn" class="btn-secondary" style="width:100%; border-width: 2px; border-color:var(--accent-secondary); color:var(--accent-secondary); font-weight: 900; height:55px;">아이템 일괄 판매 열기</button>
                        `
                    })}
                </div>
            </section>

            <section>
                <div class="card booster-section fade-in" style="background:linear-gradient(125deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12) 55%, rgba(34, 211, 238, 0.12)); border: 2px solid var(--accent-soft); padding: 1.4rem; border-radius: 28px;">
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem; align-items:center;">
                        <div>
                            <div style="font-size:0.78rem; color:#4f46e5; font-weight:900; letter-spacing:0.12em; margin-bottom:0.35rem;">BOOSTER LAB</div>
                            <h3 style="font-size:1.5rem; font-weight:950; color:var(--accent-color); margin-bottom:0.4rem; letter-spacing:-0.03em;">⚡ 슈퍼 부스터 충전소</h3>
                            <p class="text-sub" style="font-size:0.95rem; font-weight: 650; line-height:1.7;">부스터를 활성화하면 모든 테스트 보상이 <strong>2배(20P)</strong>로 뛰어오릅니다. 테스트를 몰아서 돌릴 때 가장 효율적인 업그레이드입니다.</p>
                        </div>
                        <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:0.75rem;">
                            <div style="padding:1rem; border-radius:20px; background:#fff; border:1px solid rgba(99,102,241,0.12); text-align:center;">
                                <div style="font-size:0.74rem; color:#4f46e5; font-weight:900; margin-bottom:0.2rem;">현재 부스터</div>
                                <div style="font-size:1.35rem; font-weight:950; color:#312e81;">${userData.boosterCount || 0}회</div>
                            </div>
                            <div style="padding:1rem; border-radius:20px; background:#fff; border:1px solid rgba(99,102,241,0.12); text-align:center;">
                                <div style="font-size:0.74rem; color:#4f46e5; font-weight:900; margin-bottom:0.2rem;">충전 가격</div>
                                <div style="font-size:1.35rem; font-weight:950; color:#312e81;">100P</div>
                            </div>
                        </div>
                    </div>
                    <button id="buy-booster-btn" class="btn-primary" style="margin-top:1rem; width:100%; background:linear-gradient(135deg,#4f46e5,#7c3aed); padding: 1rem 2rem; font-size: 1rem; border-radius: 18px; border:none; font-weight:950;">부스터 20회 충전 (100P)</button>
                </div>
            </section>
        </div>
    `;

    initArcade();

    document.querySelectorAll('.arcade-item-card button, .bet-btn, .wire-btn, #buy-booster-btn').forEach(btn => {
        const originalOnClick = btn.onclick;
        btn.onclick = (e) => {
            if (!UserState.user) {
                alert("이 기능을 이용하려면 로그인이 필요합니다. 🎰");
                document.getElementById('login-btn')?.click();
                return;
            }
            if (originalOnClick) originalOnClick.call(btn, e);
        };
    });

    if (isLoggedIn) updateUI();
}
