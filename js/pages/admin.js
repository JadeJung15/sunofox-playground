import { UserState, chargeUserPoints, chargeUserScore } from '../auth.js?v=8.4.0';
import { db } from '../firebase-init.js?v=8.4.0';
import { collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

export async function renderAdmin() {
    const app = document.getElementById('app');
    
    // [개선] 마스터 권한 확인 대기 로직 (튕김 방지)
    if (!UserState.isMaster) {
        // 혹시라도 로딩 중일 수 있으니 아주 잠깐 대기 후 재확인
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!UserState.isMaster) {
            console.warn("Access denied: Not a master user.");
            location.hash = '#home'; 
            return; 
        }
    }

    app.innerHTML = `
        <div class="admin-page fade-in">
            <style>
                .admin-asset-actions {
                    display: grid;
                    grid-template-columns: minmax(0, 1.2fr) repeat(2, minmax(0, 1fr));
                    gap: 0.75rem;
                    align-items: stretch;
                }

                .admin-asset-actions > * {
                    min-width: 0;
                }

                @media (max-width: 768px) {
                    .admin-asset-actions {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            <div class="card admin-header" style="background: linear-gradient(135deg, var(--accent-color), #4f46e5); color:#fff; border:none; padding:3rem 1.5rem; text-align:center; border-radius: var(--radius-lg); margin-bottom:2rem;">
                <h2 style="font-size:2.2rem; font-weight:900; margin-bottom:0.5rem;">🛡️ MASTER CONSOLE</h2>
                <p style="opacity:0.9; font-weight:600;">사용자 관리 및 시스템 자산 조정 시스템</p>
            </div>

            <div class="card" style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.5rem; display:flex; align-items:center; gap:10px;">👤 사용자 데이터베이스</h3>
                <button id="admin-search-users" class="btn-primary" style="width:100%; margin-bottom:1.5rem; background: var(--accent-color);">모든 사용자 불러오기</button>

                <div id="admin-user-list-container" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:1rem; max-height: 600px; overflow-y: auto; padding: 0.5rem; border-radius: 12px; background: var(--bg-color); border: 1px solid var(--border-color); display:none;"></div>
            </div>

            <div id="admin-user-log-container" style="display:none; margin-bottom: 2rem; background: var(--card-bg); border-radius: var(--radius-lg); padding: 2rem; border: 2px solid var(--accent-soft); box-shadow: var(--shadow-lg);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h3 style="font-size: 1.2rem;">📋 활동 이력 조회: <span id="log-target-name" style="color:var(--accent-color);"></span></h3>
                    <button onclick="document.getElementById('admin-user-log-container').style.display='none'" class="btn-secondary" style="width:auto; padding: 0.4rem 1rem;">닫기 ✕</button>
                </div>
                <div id="log-list-content" style="display:flex; flex-direction:column; gap:0.75rem; max-height: 500px; overflow-y:auto;"></div>
            </div>

            <div class="card" style="background: rgba(99, 102, 241, 0.03); border: 2px dashed var(--accent-soft);">
                <h3 style="margin-bottom: 1.5rem;">💰 실시간 자산 집행</h3>
                <div style="display: grid; gap: 1.5rem;">
                    <div class="input-group">
                        <label style="display:block; font-size:0.85rem; font-weight:800; margin-bottom:0.5rem; color:var(--text-sub);">관리 대상 UID (사용자 목록에서 '선택' 클릭)</label>
                        <input type="text" id="admin-target-uid" style="width:100%; min-width:0; padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); font-family: monospace; box-sizing:border-box;" placeholder="대상 UID">
                    </div>
                    <div class="input-group">
                        <label style="display:block; font-size:0.85rem; font-weight:800; margin-bottom:0.5rem; color:var(--text-sub);">조정 수량 (+ 또는 -)</label>
                        <div class="admin-asset-actions">
                            <input type="number" id="admin-amount" style="width:100%; min-width:0; padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); font-size: 1.2rem; font-weight: 900; box-sizing:border-box;" placeholder="0">
                            <button id="admin-charge-points-btn" class="btn-primary" style="background: var(--accent-secondary); width:100%;">포인트 집행</button>
                            <button id="admin-charge-score-btn" class="btn-primary" style="background: var(--accent-color); width:100%;">점수 집행</button>
                        </div>
                    </div>
                </div>
                <p id="admin-msg" style="margin-top: 1.5rem; font-size: 0.9rem; font-weight: 800; text-align: center; min-height: 1.2rem; color: var(--accent-color);"></p>
            </div>
        </div>
    `;

    const setupAdminEvents = () => {
        document.getElementById('admin-charge-points-btn').onclick = async () => {
            const uid = document.getElementById('admin-target-uid').value.trim();
            const amount = parseInt(document.getElementById('admin-amount').value);
            const msg = document.getElementById('admin-msg');
            if (isNaN(amount)) return alert("금액을 정확히 입력하세요.");
            if (await chargeUserPoints(uid, amount)) {
                msg.textContent = `성공: ${uid}에게 ${amount}P 적용 완료.`;
                document.getElementById('admin-amount').value = '';
            } else { msg.textContent = "실패: 사용자 정보를 확인하세요."; }
        };

        document.getElementById('admin-charge-score-btn').onclick = async () => {
            const uid = document.getElementById('admin-target-uid').value.trim();
            const amount = parseInt(document.getElementById('admin-amount').value);
            const msg = document.getElementById('admin-msg');
            if (isNaN(amount)) return alert("수량을 정확히 입력하세요.");
            if (await chargeUserScore(uid, amount)) {
                msg.textContent = `성공: ${uid}에게 ${amount}점 적용 완료.`;
                document.getElementById('admin-amount').value = '';
            } else { msg.textContent = "실패: 사용자 정보를 확인하세요."; }
        };

        document.getElementById('admin-search-users').onclick = async () => {
            const listContainer = document.getElementById('admin-user-list-container');
            listContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:2rem;">로딩 중...</p>';
            listContainer.style.display = 'grid';

            try {
                const snap = await getDocs(collection(db, "users"));
                const users = [];
                snap.forEach(d => {
                    const data = d.data();
                    users.push(`
                        <div class="card user-admin-card" style="padding: 1.25rem; margin-bottom:0; display:flex; flex-direction:column; gap:1rem; border: 1px solid var(--border-color);">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div style="overflow:hidden;">
                                    <h4 style="font-size:1rem; font-weight:900; margin-bottom:0.2rem;">${data.nickname || '익명'}</h4>
                                    <p style="font-size:0.75rem; color:var(--accent-color); font-weight:600; margin-bottom:0.4rem;">${data.originalEmail ? `(${data.originalEmail})` : '<span style="color:var(--text-sub); font-weight:normal;">(미접속: 정보 업데이트 대기)</span>'}</p>
                                    <small style="font-size:0.65rem; color:var(--text-sub); font-family:monospace;">${d.id}</small>
                                </div>
                                <div style="display:flex; gap:0.4rem; flex-shrink:0;">
                                    <button class="admin-view-log-btn btn-secondary" data-uid="${d.id}" data-name="${data.nickname}" style="padding: 4px 8px; font-size: 0.7rem; border-color:var(--accent-color); color:var(--accent-color);">로그</button>
                                    <button class="admin-select-user-btn btn-secondary" data-uid="${d.id}" style="padding: 4px 8px; font-size: 0.7rem;">선택</button>
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; background:var(--bg-color); padding:0.75rem; border-radius:10px;">
                                <div style="text-align:center;">
                                    <small style="display:block; font-size:0.6rem; color:var(--text-sub); font-weight:800; margin-bottom:2px;">포인트</small>
                                    <span style="font-weight:900; color:var(--accent-secondary); font-size:0.9rem;">${(data.points || 0).toLocaleString()}</span>
                                </div>
                                <div style="text-align:center; border-left:1px solid var(--border-color);">
                                    <small style="display:block; font-size:0.6rem; color:var(--text-sub); font-weight:800; margin-bottom:2px;">랭킹점수</small>
                                    <span style="font-weight:900; color:var(--accent-color); font-size:0.9rem;">${(data.totalScore || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    `);
                });
                listContainer.innerHTML = users.join('');

                listContainer.querySelectorAll('.admin-select-user-btn').forEach(btn => {
                    btn.onclick = () => {
                        document.getElementById('admin-target-uid').value = btn.dataset.uid;
                        document.getElementById('admin-msg').textContent = `선택된 대상: ${btn.dataset.uid}`;
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    };
                });

                listContainer.querySelectorAll('.admin-view-log-btn').forEach(btn => {
                    btn.onclick = async () => {
                        const logContainer = document.getElementById('admin-user-log-container');
                        const logListContent = document.getElementById('log-list-content');
                        document.getElementById('log-target-name').textContent = `${btn.dataset.name} (${btn.dataset.uid})`;

                        logListContent.innerHTML = '<p class="text-sub" style="text-align:center; padding:2rem;">데이터 불러오는 중...</p>';
                        logContainer.style.display = 'block';
                        logContainer.scrollIntoView({ behavior: 'smooth' });

                        try {
                            const q = query(collection(db, "pointLogs"), where("uid", "==", btn.dataset.uid), orderBy("timestamp", "desc"), limit(50));
                            const logSnap = await getDocs(q);

                            if (logSnap.empty) {
                                logListContent.innerHTML = '<p class="text-sub" style="text-align:center; padding:2rem;">기록된 내역이 없습니다.</p>';
                                return;
                            }

                            const logs = [];
                            logSnap.forEach(ld => {
                                const l = ld.data();
                                const date = l.timestamp ? new Date(l.timestamp.toMillis()).toLocaleString() : '진행 중...';
                                const color = l.amount > 0 ? '#10b981' : '#ef4444';

                                logs.push(`
                                    <div style="background:var(--bg-color); padding:1rem; border-radius:12px; border:1px solid var(--border-color);">
                                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                                            <span style="font-weight:900; color:var(--accent-color); font-size:0.7rem; letter-spacing:0.05em;">${l.type.toUpperCase()}</span>
                                            <span style="font-size:0.7rem; color:var(--text-sub); font-weight:600;">${date}</span>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span style="font-weight:700; font-size:0.9rem;">${l.reason}</span>
                                            <span style="font-weight:900; color:${color}; font-size:1rem;">${l.amount > 0 ? '+' : ''}${l.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                `);
                            });
                            logListContent.innerHTML = logs.join('');
                        } catch (err) {
                            logListContent.innerHTML = `<p style="color:#ef4444; font-size:0.85rem; text-align:center; padding:2rem;">오류: 색인 생성 전이거나 권한이 없습니다.</p>`;
                        }
                    };
                });
            } catch (e) { alert("목록 로드 실패"); }
        };
    };

    setupAdminEvents();
}
