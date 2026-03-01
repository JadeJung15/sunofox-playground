import { addPoints, usePoints, UserState, updateUI } from './auth.js?v=8.5.0';
import { ITEM_VALUES, ITEM_GRADES, getGrade } from './constants/shops.js';
import { db } from './firebase-init.js?v=8.5.0';
import { doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { soundManager } from './sound.js';

let arcadeInitialized = false;
let timingRushState = { active: false, intervalId: null, value: 0, direction: 1 };
const LUCKY_DRAW_COOLDOWN_MS = 5 * 60 * 1000;
const MINING_COOLDOWN_MS = 2200;
const WEEKLY_ARCADE_MILESTONES = [
    { goal: 5, reward: 150, label: '워밍업 달성', desc: '한 주에 오락실 5판 플레이' },
    { goal: 12, reward: 400, label: '루팡 루틴 완성', desc: '오락실 12판 달성 후 중간 보너스 수령' },
    { goal: 25, reward: 1000, label: '주간 오락실 지배자', desc: '오락실 25판 달성 후 대형 보너스 수령' }
];

export function initArcade() {
    if (!arcadeInitialized) {
        arcadeInitialized = true;

        document.addEventListener('click', async (e) => {
            const target = e.target.closest('button') || e.target.closest('.alchemy-grade-box') || e.target;
            
            // 연금술 등급 선택 박스 처리
            if (target.classList && target.classList.contains('alchemy-grade-box')) {
                const boxes = document.querySelectorAll('.alchemy-grade-box');
                boxes.forEach(box => box.classList.remove('active'));
                target.classList.add('active');
                
                const selectedGrade = target.dataset.grade;
                sessionStorage.setItem('last_alchemy_grade', selectedGrade);
                return;
            }

            if (target.id === 'gacha-btn') await playGacha(1, 100);
            if (target.id === 'gacha-10-btn') await playGacha(10, 950);
            if (target.id === 'gacha-30-btn') await playGacha(30, 2700);
            
            if (target.id === 'alchemy-btn') await playAlchemy(1);
            if (target.id === 'alchemy-5-btn') await playAlchemy(5);
            if (target.id === 'alchemy-10-btn') await playAlchemy(10);
            
            if (target.id === 'fusion-btn') await playFusion();
            
            if (target.id === 'market-open-btn') renderMarketUI();
            
            if (target.id === 'click-game-btn') await playClickGame();
            if (target.id === 'lucky-draw-btn') await playLuckyDraw();
            if (target.id === 'slot-spin-btn') await playSlotMachine();
            if (target.id === 'coin-heads-btn') await playCoinFlip('heads');
            if (target.id === 'coin-tails-btn') await playCoinFlip('tails');
            if (target.id === 'timing-rush-btn') await playTimingRush();
            if (target.id === 'bomb-start-btn') await startBombGame();
            if (target.classList && target.classList.contains('wire-btn')) await cutWire(parseInt(target.dataset.wire));
            if (target.id === 'bomb-claim-btn') await claimBombPoints();
            if (target.id === 'daily-checkin-btn') await playDailyCheckin();
            if (target.id === 'buy-booster-btn') await buyBoosterPack();
            if (target.classList && target.classList.contains('weekly-claim-btn')) {
                await claimWeeklyArcadeReward(parseInt(target.dataset.goal, 10));
            }
            
            if (target.classList && target.classList.contains('bet-btn')) {
                const gameType = target.dataset.game;
                const choice = target.dataset.choice;
                await playBettingGame(gameType, choice);
            }
        });

        // 퀘스트 로드 호출
        renderDailyQuests();
    }
    
    // 페이지가 다시 그려질 때마다 수량 동기화 (초기화 여부 무관)
    updateAlchemyCounts();
}

// 연금술 재료 수량 업데이트 로직 (독립 함수로 분리)
export function updateAlchemyCounts() {
    const inv = UserState.data?.inventory || [];
    const counts = { COMMON: 0, UNCOMMON: 0, RARE: 0 };
    inv.forEach(item => {
        const grade = getGrade(item);
        if (counts[grade] !== undefined) counts[grade]++;
    });
    
    // 3개 선택 박스 숫자 업데이트
    Object.entries(counts).forEach(([grade, count]) => {
        const el = document.getElementById(`count-${grade}`);
        if (el) el.textContent = count;
    });
}

async function updateArcadeStat(statKey) {
    if (!UserState.user) return;
    try {
        const weeklyState = getWeeklyArcadeState();
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, {
            [`arcadeStats.${statKey}`]: increment(1),
            'arcadeWeekly.weekKey': weeklyState.weekKey,
            'arcadeWeekly.plays': increment(1),
            'arcadeWeekly.claimedMilestones': weeklyState.claimedMilestones
        });
        if (!UserState.data.arcadeStats) UserState.data.arcadeStats = {};
        UserState.data.arcadeStats[statKey] = (UserState.data.arcadeStats[statKey] || 0) + 1;
        UserState.data.arcadeWeekly = {
            weekKey: weeklyState.weekKey,
            plays: weeklyState.plays + 1,
            claimedMilestones: [...weeklyState.claimedMilestones]
        };
        renderDailyQuests();
    } catch (e) { console.error(e); }
}

function getSeoulDateParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date);
    const get = (type) => parts.find(part => part.type === type)?.value;
    return {
        year: Number(get('year')),
        month: Number(get('month')),
        day: Number(get('day'))
    };
}

function formatWeekDateKey(date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function getCurrentArcadeWeekKey() {
    const { year, month, day } = getSeoulDateParts();
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = utcDate.getUTCDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    utcDate.setUTCDate(utcDate.getUTCDate() - mondayOffset);
    return formatWeekDateKey(utcDate);
}

function getWeeklyArcadeState() {
    const currentWeekKey = getCurrentArcadeWeekKey();
    const saved = UserState.data?.arcadeWeekly || {};
    const claimedMilestones = Array.isArray(saved.claimedMilestones) ? saved.claimedMilestones.map(Number) : [];
    if (saved.weekKey !== currentWeekKey) {
        return {
            weekKey: currentWeekKey,
            plays: 0,
            claimedMilestones: []
        };
    }
    return {
        weekKey: currentWeekKey,
        plays: Number(saved.plays || 0),
        claimedMilestones
    };
}

function renderWeeklyArcadeBonus() {
    const weeklyEl = document.getElementById('weekly-arcade-bonus');
    if (!weeklyEl || !UserState.user || !UserState.data) return;

    const weeklyState = getWeeklyArcadeState();
    const maxGoal = WEEKLY_ARCADE_MILESTONES[WEEKLY_ARCADE_MILESTONES.length - 1].goal;
    const progressRatio = Math.min(100, Math.round((weeklyState.plays / maxGoal) * 100));
    const nextMilestone = WEEKLY_ARCADE_MILESTONES.find(item => weeklyState.plays < item.goal);

    weeklyEl.innerHTML = `
        <div style="border-radius:22px; padding:1.05rem; background:linear-gradient(145deg,#0f172a,#312e81 55%,#0f766e); color:#fff; box-shadow:0 18px 34px rgba(15,23,42,0.16);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.9rem; flex-wrap:wrap; margin-bottom:0.9rem;">
                <div>
                    <div style="font-size:0.74rem; letter-spacing:0.12em; font-weight:900; color:rgba(255,255,255,0.7); margin-bottom:0.24rem;">WEEKLY BONUS LOOP</div>
                    <h4 style="margin:0 0 0.28rem; font-size:1.2rem; font-weight:950; letter-spacing:-0.03em;">주간 오락실 보너스</h4>
                    <p style="margin:0; font-size:0.84rem; line-height:1.6; color:rgba(240,253,250,0.92); font-weight:650;">이번 주 오락실 플레이 수를 모아 단계별 포인트를 챙기세요. 로그인 회원만 누적과 수령이 기록됩니다.</p>
                </div>
                <div style="padding:0.8rem 0.95rem; border-radius:18px; background:rgba(255,255,255,0.12); min-width:180px;">
                    <div style="font-size:0.72rem; color:rgba(255,255,255,0.72); font-weight:900; margin-bottom:0.18rem;">이번 주 진행도</div>
                    <div style="font-size:1.35rem; font-weight:950;">${weeklyState.plays} / ${maxGoal}판</div>
                    <div style="font-size:0.74rem; color:rgba(255,255,255,0.78); font-weight:700; margin-top:0.2rem;">${nextMilestone ? `다음 보상까지 ${nextMilestone.goal - weeklyState.plays}판` : '모든 주간 보상 수령 가능'}</div>
                </div>
            </div>
            <div style="height:12px; border-radius:999px; background:rgba(255,255,255,0.14); overflow:hidden; margin-bottom:1rem;">
                <div style="width:${progressRatio}%; height:100%; background:linear-gradient(90deg,#facc15,#fb7185,#22d3ee); border-radius:999px;"></div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:0.75rem;">
                ${WEEKLY_ARCADE_MILESTONES.map((milestone) => {
                    const isClaimed = weeklyState.claimedMilestones.includes(milestone.goal);
                    const isReady = weeklyState.plays >= milestone.goal && !isClaimed;
                    const remaining = Math.max(0, milestone.goal - weeklyState.plays);
                    return `
                        <div style="border-radius:18px; padding:0.95rem; background:${isReady ? 'rgba(250,204,21,0.16)' : 'rgba(255,255,255,0.1)'}; border:1px solid ${isReady ? 'rgba(250,204,21,0.35)' : 'rgba(255,255,255,0.12)'};">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.55rem;">
                                <div>
                                    <div style="font-size:0.72rem; color:rgba(255,255,255,0.72); font-weight:900; letter-spacing:0.08em;">${milestone.goal} PLAY BONUS</div>
                                    <div style="font-size:1rem; font-weight:900; margin-top:0.18rem;">${milestone.label}</div>
                                </div>
                                <div style="font-size:0.92rem; font-weight:950; color:#fde68a;">+${milestone.reward}P</div>
                            </div>
                            <div style="font-size:0.8rem; line-height:1.55; color:rgba(240,253,250,0.9); font-weight:650; margin-bottom:0.8rem;">${milestone.desc}</div>
                            <button class="weekly-claim-btn" data-goal="${milestone.goal}" ${isReady ? '' : 'disabled'} style="width:100%; height:46px; border:none; border-radius:14px; font-weight:900; background:${isClaimed ? 'rgba(255,255,255,0.16)' : isReady ? 'linear-gradient(135deg,#facc15,#fb7185)' : 'rgba(255,255,255,0.16)'}; color:${isReady || isClaimed ? '#0f172a' : 'rgba(255,255,255,0.7)'}; cursor:${isReady ? 'pointer' : 'default'};">
                                ${isClaimed ? '수령 완료' : isReady ? '보상 받기' : `${remaining}판 남음`}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

async function claimWeeklyArcadeReward(goal) {
    if (!UserState.user || !Number.isFinite(goal)) return;
    const milestone = WEEKLY_ARCADE_MILESTONES.find(item => item.goal === goal);
    if (!milestone) return;

    const weeklyState = getWeeklyArcadeState();
    if (weeklyState.plays < goal || weeklyState.claimedMilestones.includes(goal)) {
        renderDailyQuests();
        return;
    }

    const nextClaimed = [...weeklyState.claimedMilestones, goal].sort((a, b) => a - b);
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, {
            points: increment(milestone.reward),
            'arcadeWeekly.weekKey': weeklyState.weekKey,
            'arcadeWeekly.plays': weeklyState.plays,
            'arcadeWeekly.claimedMilestones': nextClaimed
        });
        UserState.data.points = (UserState.data.points || 0) + milestone.reward;
        UserState.data.arcadeWeekly = {
            weekKey: weeklyState.weekKey,
            plays: weeklyState.plays,
            claimedMilestones: nextClaimed
        };
        soundManager.playSuccess();
        updateUI();
        renderDailyQuests();
    } catch (e) {
        console.error(e);
        soundManager.playFailure();
    }
}

async function playGacha(count, cost) {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    
    const resultEl = document.getElementById('gacha-result');
    if (!resultEl) return;

    if (UserState.data.points < cost) {
        resultEl.innerHTML = `
            <div style="color:#ef4444; animation: shake 0.5s;">
                <strong>⚠️ 뽑기 불가: 포인트 부족</strong><br>
                <small>필요: ${cost}P / 보유: ${UserState.data.points}P</small>
            </div>
        `;
        return;
    }

    const buttons = [document.getElementById('gacha-btn'), document.getElementById('gacha-10-btn'), document.getElementById('gacha-30-btn')];
    buttons.forEach(btn => { if(btn) btn.disabled = true; });

    resultEl.innerHTML = '<span class="loading-dots" style="color:var(--accent-color);">상자를 여는 중...</span>';
    soundManager.playNoise(0.5, 'brown', 0.15); // 상자 여는 소리

    if (await usePoints(cost, `아이템 뽑기 (${count}회)`)) {
        await updateArcadeStat('gacha');
        
        setTimeout(async () => {
            try {
                soundManager.playSuccess(); // 아이템 획득 성공 소리
                const exclusiveItems = ['🧪 현자의 돌', '🧬 인공 생명체', '⚡ 번개 병', '🌌 은하수 가루'];
                const itemNames = Object.keys(ITEM_VALUES).filter(name => !exclusiveItems.includes(name));
                const weights = [40, 20, 15, 10, 5, 8, 2];
                const drawnItems = [];
                let totalAddedScore = 0;

                for (let i = 0; i < count; i++) {
                    const item = getRandomItem(itemNames, weights);
                    drawnItems.push(item);
                    totalAddedScore += (ITEM_VALUES[item] || 0);
                }

                const userRef = doc(db, "users", UserState.user.uid);
                await updateDoc(userRef, {
                    inventory: arrayUnion(...drawnItems),
                    totalScore: increment(totalAddedScore),
                    discoveredItems: arrayUnion(...drawnItems)
                });

                UserState.data.inventory = [...(UserState.data.inventory || []), ...drawnItems];
                UserState.data.totalScore = (UserState.data.totalScore || 0) + totalAddedScore;

                if (window.location.hash === '#arcade') {
                    window._preventScroll = true;
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                }
                updateUI();

                setTimeout(() => {
                    const newResultEl = document.getElementById('gacha-result');
                    if (!newResultEl) return;

                    const summary = drawnItems.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                    const resultTagsHTML = Object.entries(summary).map(([name, num]) => {
                        const grade = getGrade(name);
                        let color = '#94a3b8';
                        let bg = 'rgba(148, 163, 184, 0.1)';
                        if (grade === 'LEGENDARY') { color = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.1)'; }
                        else if (grade === 'RARE') { color = '#3b82f6'; bg = 'rgba(59, 130, 246, 0.1)'; }
                        else if (grade === 'UNCOMMON') { color = '#10b981'; bg = 'rgba(16, 185, 129, 0.1)'; }
                        return `<span style="display:inline-block; background:${bg}; color:${color}; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:800; margin:2px; border:1px solid ${color}33;">${name} x${num}</span>`;
                    }).join('');

                    newResultEl.innerHTML = `
                        <div style="animation: bounce 0.5s; text-align:center; width:100%;">
                            <div style="margin-bottom:8px;">
                                <strong style="font-size:0.95rem; color:var(--accent-color);">📦 뽑기 완료 (${count}회 개봉)</strong>
                            </div>
                            <div style="margin-bottom:12px; display:flex; flex-wrap:wrap; justify-content:center;">${resultTagsHTML}</div>
                            <div style="background:rgba(0,0,0,0.02); padding:10px; border-radius:10px; font-size:0.75rem; text-align:left; border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                    <span style="font-weight:700; color:var(--text-sub);">사용 포인트:</span>
                                    <span style="color:#ef4444; font-weight:900;">-${cost.toLocaleString()}P</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-color); padding-top:8px;">
                                    <span style="font-weight:700; color:var(--text-sub);">총 획득 가치:</span>
                                    <strong style="color:#10b981; font-size:0.9rem;">+${totalAddedScore.toLocaleString()}점</strong>
                                </div>
                            </div>
                        </div>
                    `;
                }, 50);
            } catch (e) {
                console.error(e);
                resultEl.innerHTML = '<span style="color:#ef4444;">상자가 손상되었습니다!</span>';
            } finally {
                buttons.forEach(btn => { if(btn) btn.disabled = false; });
            }
        }, 1000);
    } else {
        buttons.forEach(btn => { if(btn) btn.disabled = false; });
        resultEl.innerHTML = '<span style="color:#ef4444;">뽑기 계약이 취소되었습니다.</span>';
    }
}

function getRandomItem(items, weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) { if (random < weights[i]) return items[i]; random -= weights[i]; }
    return items[0];
}

async function playClickGame() {
    const btn = document.getElementById('click-game-btn');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    await updateArcadeStat('mining');
    
    // 펫 보너스 적용
    const { getPetBuff } = await import('./auth.js?v=8.5.0');
    const petBuff = getPetBuff();
    const baseEarn = Math.floor(Math.random() * 7) + 4;
    const earn = Math.floor(baseEarn * petBuff.multiplier) + petBuff.mineBonus;

    btn.textContent = "채굴 중...";
    soundManager.playThud(0.1); // 채굴 타격음
    setTimeout(async () => { await addPoints(earn); btn.disabled = false; btn.textContent = "채굴기 가동 시작"; }, MINING_COOLDOWN_MS);
}

async function playLuckyDraw() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const btn = document.getElementById('lucky-draw-btn');
    const resultEl = document.getElementById('lucky-draw-result');
    if (!btn || !resultEl || btn.disabled) return;

    const cooldownKey = `lucky_draw_cooldown_${UserState.user.uid}`;
    const lastPlayedAt = parseInt(localStorage.getItem(cooldownKey) || '0', 10);
    const remainingMs = LUCKY_DRAW_COOLDOWN_MS - (Date.now() - lastPlayedAt);
    if (remainingMs > 0) {
        const remainingMin = Math.ceil(remainingMs / 60000);
        resultEl.innerHTML = `<span style="color:#ef4444; font-weight:800;">행운 캡슐은 ${remainingMin}분 후 다시 열 수 있습니다.</span>`;
        return;
    }

    btn.disabled = true;
    btn.textContent = '캡슐 오픈 중...';
    resultEl.innerHTML = '<span class="loading-dots" style="color:#0f766e;">오늘의 운빨을 확인하는 중...</span>';
    soundManager.playNoise(0.35, 'white', 0.08);
    await updateArcadeStat('luckyDraw');

    const rewards = [12, 18, 25, 35, 50];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const reactions = [
        '사무실 서랍에서 간식 찾은 기분',
        '오늘은 은근 운이 붙는 날',
        '숨겨둔 잔돈을 발견한 느낌',
        '점심 메뉴가 성공할 예감',
        '오늘 루팡 기운 최고조'
    ];

    setTimeout(async () => {
        localStorage.setItem(cooldownKey, String(Date.now()));
        await addPoints(reward, '행운 캡슐 오픈');
        resultEl.innerHTML = `
            <div style="text-align:center; width:100%;">
                <div style="font-size:0.78rem; color:#0f766e; font-weight:900; letter-spacing:0.08em; margin-bottom:0.3rem;">LUCKY DRAW</div>
                <div style="font-size:1.5rem; font-weight:950; color:#065f46; margin-bottom:0.2rem;">+${reward}P</div>
                <div style="font-size:0.8rem; color:#475569; font-weight:700; margin-bottom:0.25rem;">${reactions[Math.floor(Math.random() * reactions.length)]}</div>
                <div style="font-size:0.72rem; color:#64748b; font-weight:700;">다음 캡슐 오픈까지 5분 대기</div>
            </div>
        `;
        soundManager.playSuccess();
        updateUI();
        btn.disabled = false;
        btn.textContent = '행운 캡슐 다시 열기';
    }, 900);
}

const SLOT_EMOJIS = ['🎰', '💎', '🔥', '✨', '🍒', '7️⃣'];
async function playSlotMachine() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const cost = 300;
    const resultEl = document.getElementById('slot-machine-container');
    if (!resultEl) return;

    if (await usePoints(cost, "이모지 슬롯")) {
        await updateArcadeStat('slot');
        const reels = [document.getElementById('slot-1'), document.getElementById('slot-2'), document.getElementById('slot-3')];
        const btn = document.getElementById('slot-spin-btn');
        if(!reels[0] || !btn) return;
        btn.disabled = true;
        const oldResult = document.getElementById('slot-result-display');
        if(oldResult) oldResult.remove();

        let spinCount = 0;
        const spinInterval = setInterval(() => {
            reels.forEach(r => r.textContent = SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]);
            soundManager.playSlotTick(); // 회전음
            spinCount++;
            if (spinCount > 15) {
                clearInterval(spinInterval);
                const final = reels.map(() => SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]);
                reels.forEach((r, i) => r.textContent = final[i]);
                let winPoints = 0;
                let winMsg = "";
                let subMsg = "아쉽네요, 다음 기회를 노려보세요!";
                let statusColor = "var(--text-sub)";
                const unique = new Set(final).size;
                if (unique === 1) { 
                    winPoints = 4000; winMsg = "🎉 JACKPOT!!!"; subMsg = "축하합니다! 4,000P 잭팟에 당첨되셨습니다!"; statusColor = "#f59e0b"; 
                    soundManager.playSuccess();
                }
                else if (unique === 2) { 
                    winPoints = 450; winMsg = "✨ 2개 일치!"; subMsg = "나이스! 450P를 획득하셨습니다."; statusColor = "#10b981"; 
                    soundManager.playSuccess();
                }
                else { 
                    winMsg = "💀 꽝"; 
                    soundManager.playFailure();
                }
                
                setTimeout(async () => {
                    if (winPoints > 0) await addPoints(winPoints, "슬롯머신 당첨");
                    const resultDiv = document.createElement('div');
                    resultDiv.id = 'slot-result-display';
                    resultDiv.style.cssText = "margin-top:15px; animation:bounce 0.5s; text-align:center; width:100%;";
                    resultDiv.innerHTML = `
                        <div style="background:rgba(0,0,0,0.02); padding:12px; border-radius:12px; font-size:0.8rem; text-align:left; border:1px solid var(--border-color); max-width: 320px; margin: 0 auto;">
                            <div style="text-align:center; margin-bottom:8px;"><strong style="font-size:1rem; color:${statusColor};">${winMsg}</strong></div>
                            <p style="text-align:center; font-size:0.75rem; color:var(--text-sub); margin-bottom:10px;">${subMsg}</p>
                            <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="font-weight:700; color:var(--text-sub);">사용 포인트:</span><span style="color:#ef4444; font-weight:900;">-300P</span></div>
                            <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-color); padding-top:8px;"><span style="font-weight:700; color:var(--text-sub);">최종 획득:</span><strong style="color:#10b981; font-size:0.95rem;">+${winPoints.toLocaleString()}P</strong></div>
                        </div>
                    `;
                    resultEl.parentNode.insertBefore(resultDiv, resultEl.nextSibling);
                    updateUI();
                    btn.disabled = false;
                }, 500);
            }
        }, 100);
    }
}

async function playCoinFlip(choice) {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const statusEl = document.getElementById('coin-flip-status');
    const coinEl = document.getElementById('coin-flip-coin');
    const headsBtn = document.getElementById('coin-heads-btn');
    const tailsBtn = document.getElementById('coin-tails-btn');
    if (!statusEl || !coinEl || !headsBtn || !tailsBtn) return;

    const cost = 150;
    const winReward = 280;
    if ((UserState.data.points || 0) < cost) {
        statusEl.innerHTML = '<span style="color:#ef4444;">포인트가 부족합니다. (필요: 150P)</span>';
        return;
    }

    headsBtn.disabled = true;
    tailsBtn.disabled = true;
    coinEl.textContent = '🪙';
    statusEl.innerHTML = '<span style="color:#2563eb; font-weight:800;">동전을 튕기는 중...</span>';
    soundManager.playSlotTick();
    await updateArcadeStat('coinFlip');

    if (!(await usePoints(cost, `코인 플립 (${choice})`))) {
        headsBtn.disabled = false;
        tailsBtn.disabled = false;
        statusEl.innerHTML = '<span style="color:#ef4444;">베팅이 취소되었습니다.</span>';
        return;
    }

    setTimeout(async () => {
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const isWin = result === choice;
        coinEl.textContent = result === 'heads' ? '🙂' : '🦊';
        if (isWin) {
            await addPoints(winReward, '코인 플립 승리');
            statusEl.innerHTML = `<strong style="color:#10b981;">적중! ${result === 'heads' ? '앞면' : '뒷면'} · +${winReward}P</strong><br><span style="font-size:0.76rem; color:#475569;">150P 베팅, 실수령 +130P</span>`;
            soundManager.playSuccess();
        } else {
            statusEl.innerHTML = `<span style="color:#ef4444; font-weight:800;">실패... ${result === 'heads' ? '앞면' : '뒷면'}이 나왔습니다.</span><br><span style="font-size:0.76rem; color:#64748b;">이번 판은 150P 손실</span>`;
            soundManager.playFailure();
        }
        updateUI();
        headsBtn.disabled = false;
        tailsBtn.disabled = false;
    }, 1000);
}

async function playTimingRush() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const btn = document.getElementById('timing-rush-btn');
    const fillEl = document.getElementById('timing-rush-fill');
    const markerEl = document.getElementById('timing-rush-marker');
    const statusEl = document.getElementById('timing-rush-status');
    if (!btn || !fillEl || !markerEl || !statusEl) return;

    if (!timingRushState.active) {
        const entryCost = 80;
        if ((UserState.data.points || 0) < entryCost) {
            statusEl.innerHTML = '<span style="color:#ef4444; font-weight:800;">참가비 80P가 필요합니다.</span>';
            return;
        }
        if (!(await usePoints(entryCost, '타이밍 챌린지 참가'))) {
            statusEl.innerHTML = '<span style="color:#ef4444; font-weight:800;">타이밍 챌린지 시작에 실패했습니다.</span>';
            return;
        }
        timingRushState.active = true;
        timingRushState.value = 0;
        timingRushState.direction = 1;
        fillEl.style.width = '0%';
        markerEl.textContent = '🎯';
        btn.textContent = '지금 멈추기';
        statusEl.innerHTML = '<span style="color:#7c3aed; font-weight:800;">참가비 80P 차감 완료. 보라색 구간에 최대한 가깝게 멈추세요.</span>';
        await updateArcadeStat('timingRush');
        soundManager.playNoise(0.25, 'white', 0.05);

        timingRushState.intervalId = setInterval(() => {
            timingRushState.value += timingRushState.direction * 4;
            if (timingRushState.value >= 100) {
                timingRushState.value = 100;
                timingRushState.direction = -1;
            }
            if (timingRushState.value <= 0) {
                timingRushState.value = 0;
                timingRushState.direction = 1;
            }
            fillEl.style.width = `${timingRushState.value}%`;
        }, 40);
        return;
    }

    clearInterval(timingRushState.intervalId);
    timingRushState.active = false;
    btn.textContent = '타이밍 챌린지 시작';
    const target = 72;
    const diff = Math.abs(timingRushState.value - target);
    let reward = 0;
    let label = '타이밍 미스';
    if (diff <= 4) { reward = 220; label = '완벽한 타이밍'; }
    else if (diff <= 9) { reward = 140; label = '거의 근접'; }
    else if (diff <= 16) { reward = 90; label = '무난한 감각'; }
    else if (diff <= 24) { reward = 40; label = '간발의 차'; }

    if (reward > 0) {
        await addPoints(reward, '타이밍 챌린지');
        soundManager.playSuccess();
    } else {
        soundManager.playFailure();
    }
    markerEl.textContent = '🎯';
    statusEl.innerHTML = `<strong style="color:${reward > 0 ? '#7c3aed' : '#ef4444'};">${label}</strong><br><span style="font-size:0.82rem; color:#475569;">멈춘 위치 ${Math.round(timingRushState.value)} / 목표 72 · ${reward > 0 ? `+${reward}P` : '보상 없음'}</span>`;
    updateUI();
}

let bombGameState = { active: false, bombIndex: -1, currentPool: 0, cutWires: [] };
async function startBombGame() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    if (bombGameState.active) return;
    const oldResult = document.getElementById('bomb-result-box');
    if(oldResult) oldResult.remove();

    if (await usePoints(300, "폭탄 돌리기 시작")) {
        await updateArcadeStat('bomb');
        bombGameState = { active: true, bombIndex: Math.floor(Math.random() * 5), currentPool: 0, cutWires: [] };
        const msgEl = document.getElementById('bomb-msg');
        const startBtn = document.getElementById('bomb-start-btn');
        if(msgEl) msgEl.textContent = "전선을 끊으세요! (현재: 0P)";
        if(startBtn) startBtn.disabled = true;
        document.querySelectorAll('.wire-btn').forEach(btn => { btn.disabled = false; btn.style.opacity = '1'; btn.style.transform = 'scale(1)'; });
        soundManager.playNoise(0.2, 'white', 0.05); // 전선 준비 소리
    }
}

async function cutWire(index) {
    if (!bombGameState.active || bombGameState.cutWires.includes(index)) return;
    const wireBtn = document.querySelector(`.wire-btn[data-wire="${index}"]`);
    const msgEl = document.getElementById('bomb-msg');
    const claimBtn = document.getElementById('bomb-claim-btn');
    const startBtn = document.getElementById('bomb-start-btn');
    bombGameState.cutWires.push(index);
    if(wireBtn) { wireBtn.style.opacity = '0.3'; wireBtn.style.transform = 'scale(0.9)'; wireBtn.disabled = true; }

    if (index === bombGameState.bombIndex) {
        bombGameState.active = false;
        soundManager.playFailure(); // 폭발음 대체
        soundManager.playNoise(0.8, 'white', 0.2); // 폭발 느낌
        const finalPool = bombGameState.currentPool;
        const resultBox = document.createElement('div');
        resultBox.id = 'bomb-result-box';
        resultBox.style.cssText = "margin-top:15px; animation:shake 0.5s; text-align:center; width:100%;";
        resultBox.innerHTML = `
            <div style="background:rgba(244,63,94,0.05); padding:12px; border-radius:12px; font-size:0.8rem; text-align:left; border:1px solid #f43f5e; max-width: 320px; margin: 0 auto;">
                <div style="text-align:center; margin-bottom:8px;"><strong style="font-size:1.1rem; color:#f43f5e;">🧨 콰광!!! 폭발함</strong></div>
                <p style="text-align:center; font-size:0.75rem; color:var(--text-sub); margin-bottom:10px;">운이 나빴네요. 누적된 포인트가 모두 사라졌습니다.</p>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="font-weight:700; color:var(--text-sub);">누적했던 포인트:</span><span style="color:#ef4444; font-weight:900; text-decoration:line-through;">${finalPool.toLocaleString()}P</span></div>
                <div style="display:flex; justify-content:space-between; border-top:1px dashed #f43f5e; padding-top:8px;"><span style="font-weight:700; color:var(--text-sub);">최종 획득:</span><strong style="color:#ef4444; font-size:0.95rem;">0P</strong></div>
            </div>
        `;
        document.getElementById('bomb-wires').parentNode.appendChild(resultBox);
        if(msgEl) msgEl.textContent = "폭발했습니다! (0P)";
        if(startBtn) startBtn.disabled = false;
        if(claimBtn) claimBtn.disabled = true;
        document.querySelectorAll('.wire-btn').forEach(btn => btn.disabled = true);
    } else {
        soundManager.playSlotTick(); // 틱 소리
        const reward = [80, 220, 500, 1000][bombGameState.cutWires.length - 1];
        bombGameState.currentPool = reward;
        if(msgEl) msgEl.textContent = `성공! 현재 보상: ${reward}P (다음은 더 큽니다!)`;
        if(claimBtn) claimBtn.disabled = false;
        if (bombGameState.cutWires.length === 4) { await claimBombPoints(); }
    }
}

async function claimBombPoints() {
    if (!bombGameState.active) return;
    const points = bombGameState.currentPool;
    const msgEl = document.getElementById('bomb-msg');
    const startBtn = document.getElementById('bomb-start-btn');
    const claimBtn = document.getElementById('bomb-claim-btn');
    bombGameState.active = false;
    soundManager.playSuccess(); // 탈출 성공음
    await addPoints(points, "폭탄 돌리기 성공");
    const resultBox = document.createElement('div');
    resultBox.id = 'bomb-result-box';
    resultBox.style.cssText = "margin-top:15px; animation:bounce 0.5s; text-align:center; width:100%;";
    resultBox.innerHTML = `
        <div style="background:rgba(16,185,129,0.05); padding:12px; border-radius:12px; font-size:0.8rem; text-align:left; border:1px solid #10b981; max-width: 320px; margin: 0 auto;">
            <div style="text-align:center; margin-bottom:8px;"><strong style="font-size:1.1rem; color:#10b981;">🎉 안전하게 탈출 성공!</strong></div>
            <p style="text-align:center; font-size:0.75rem; color:var(--text-sub); margin-bottom:10px;">현명한 판단입니다. 포인트를 챙겨 퇴근합니다.</p>
            <div style="display:flex; justify-content:space-between; border-top:1px dashed #10b981; padding-top:8px;"><span style="font-weight:700; color:var(--text-sub);">최종 획득:</span><strong style="color:#10b981; font-size:0.95rem;">+${points.toLocaleString()}P</strong></div>
        </div>
    `;
    document.getElementById('bomb-wires').parentNode.appendChild(resultBox);
    if(msgEl) msgEl.textContent = "성공적으로 탈출!";
    if(startBtn) startBtn.disabled = false;
    if(claimBtn) claimBtn.disabled = true;
    document.querySelectorAll('.wire-btn').forEach(btn => btn.disabled = true);
    updateUI();
}

async function playAlchemy(count) {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const resultEl = document.getElementById('alchemy-result');
    if (!resultEl) return;

    let cost = 500;
    if (count === 5) cost = 2200;
    else if (count === 10) cost = 4000;

    // [개선] 드롭다운 대신 active 박스에서 등급 가져오기
    const activeBox = document.querySelector('.alchemy-grade-box.active');
    if (!activeBox) return alert("연성할 등급을 선택해주세요!");

    const selectedGrade = activeBox.dataset.grade;
    const itemsNeeded = count * 6;
    const targetItems = ITEM_GRADES[selectedGrade];
    const availableItems = UserState.data.inventory.filter(name => targetItems.includes(name));

    if (availableItems.length < itemsNeeded) {
        resultEl.innerHTML = `
            <div style="color:#ef4444; animation: shake 0.5s;">
                <strong>⚠️ 연성 불가: 재료 부족</strong><br>
                <small>필요: ${itemsNeeded}개 / 보유: ${availableItems.length}개</small>
            </div>
        `;
        return;
    }

    if (UserState.data.points < cost) {
        resultEl.innerHTML = `
            <div style="color:#ef4444; animation: shake 0.5s;">
                <strong>⚠️ 연성 불가: 포인트 부족</strong><br>
                <small>필요: ${cost}P / 보유: ${UserState.data.points}P</small>
            </div>
        `;
        return;
    }

    const buttons = [document.getElementById('alchemy-btn'), document.getElementById('alchemy-5-btn'), document.getElementById('alchemy-10-btn')];
    buttons.forEach(btn => { if(btn) btn.disabled = true; });
    resultEl.innerHTML = '<span class="loading-dots" style="color:#8b5cf6;">금단의 비술을 시전 중...</span>';
    soundManager.playNoise(1.0, 'brown', 0.1); // 연성 배경 소음

    if (await usePoints(cost, `연금술 시행 (${count}회)`)) {
        await updateArcadeStat('alchemy');
        setTimeout(async () => {
            try {
                soundManager.playSuccess(); // 연성 성공 소리
                const userRef = doc(db, "users", UserState.user.uid);
                let currentInv = [...UserState.data.inventory];
                const sacrificed = [];
                let scoreLost = 0;
                for (let i = 0; i < itemsNeeded; i++) {
                    const idx = currentInv.findIndex(name => targetItems.includes(name));
                    if (idx > -1) {
                        const item = currentInv.splice(idx, 1)[0];
                        sacrificed.push(item);
                        scoreLost += (ITEM_VALUES[item] || 0);
                    }
                }

                const gradeOrder = ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY'];
                const nextGrade = gradeOrder[Math.min(gradeOrder.indexOf(selectedGrade) + 1, gradeOrder.length - 1)];
                const results = [];
                let scoreGained = 0;
                let upgradeSuccessCount = 0;

                for (let i = 0; i < count; i++) {
                    const isUpgrade = Math.random() < 0.5;
                    const finalGrade = isUpgrade ? nextGrade : selectedGrade;
                    if(isUpgrade) upgradeSuccessCount++;
                    const pool = ITEM_GRADES[finalGrade];
                    const item = pool[Math.floor(Math.random() * pool.length)];
                    results.push(item);
                    scoreGained += (ITEM_VALUES[item] || 0);
                    if (Math.random() < 0.15) { results.push(item); scoreGained += (ITEM_VALUES[item] || 0); }
                }

                currentInv.push(...results);
                const recalcScore = currentInv.reduce((acc, item) => acc + (ITEM_VALUES[item] || 0), 0);
                await updateDoc(userRef, { inventory: currentInv, totalScore: recalcScore, discoveredItems: arrayUnion(...results) });
                UserState.data.inventory = currentInv;
                UserState.data.totalScore = recalcScore;

                if (window.location.hash === '#arcade') {
                    window._preventScroll = true; 
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                }
                updateUI();

                setTimeout(() => {
                    const newResultEl = document.getElementById('alchemy-result');
                    if (!newResultEl) return;
                    const resSummary = results.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                    const resultItemsHTML = Object.entries(resSummary).map(([name, num]) => 
                        `<span style="display:inline-block; background:rgba(139, 92, 246, 0.1); color:#8b5cf6; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:800; margin:2px; border:1px solid rgba(139, 92, 246, 0.2);">${name} x${num}</span>`
                    ).join('');
                    const matSummary = sacrificed.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                    const materialsHTML = Object.entries(matSummary).map(([name, num]) => 
                        `<span style="display:inline-block; background:rgba(0,0,0,0.05); color:var(--text-sub); padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:600; margin:2px;">${name} x${num}</span>`
                    ).join('');

                    newResultEl.innerHTML = `
                        <div style="animation: bounce 0.5s; text-align:center; width:100%;">
                            <div style="margin-bottom:8px;"><strong style="font-size:0.95rem; color:#8b5cf6;">✨ 연성 완료 (${upgradeSuccessCount}/${count} 진화 성공)</strong></div>
                            <div style="margin-bottom:12px; display:flex; flex-wrap:wrap; justify-content:center;">${resultItemsHTML}</div>
                            <div style="background:rgba(0,0,0,0.02); padding:10px; border-radius:10px; font-size:0.75rem; text-align:left; border:1px solid var(--border-color);">
                                <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="font-weight:700;">사용한 제물:</span><span style="color:#ef4444; font-weight:900;">-${scoreLost.toLocaleString()}점</span></div>
                                <div style="display:flex; flex-wrap:wrap; margin-bottom:10px; opacity:0.8;">${materialsHTML}</div>
                                <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-color); padding-top:8px;"><span style="font-weight:700;">획득한 보물:</span><strong style="color:#10b981; font-size:0.9rem;">+${scoreGained.toLocaleString()}점</strong></div>
                            </div>
                        </div>
                    `;
                }, 50);
            } catch (e) {
                console.error(e);
                resultEl.innerHTML = '<span style="color:#ef4444;">연성 중 사고가 발생했습니다!</span>';
            } finally {
                buttons.forEach(btn => { if(btn) btn.disabled = false; });
            }
        }, 1500);
    } else {
        buttons.forEach(btn => { if(btn) btn.disabled = false; });
        resultEl.innerHTML = '<span style="color:#ef4444;">연성 계약이 취소되었습니다.</span>';
    }
}

// 퀘스트 렌더링 함수 정의
async function renderDailyQuests() {
    const listEl = document.getElementById('daily-quest-list');
    const summaryEl = document.getElementById('quest-summary');
    if (!listEl || !summaryEl || !UserState.user || !UserState.data) return;

    const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
    const qData = UserState.data.quests || { date: today, list: { login: true, test: false, board: false } };
    
    if (qData.date !== today) {
        summaryEl.textContent = "📜 일일 퀘스트 (갱신 필요)";
        listEl.innerHTML = `
            <div class="quest-item">
                <div class="quest-info">
                    <h4>새로운 하루 준비 중</h4>
                    <p>일일 퀘스트 데이터가 아직 오늘 날짜로 갱신되지 않았습니다.</p>
                </div>
                <div class="quest-status">잠시 후 갱신</div>
            </div>
        `;
        renderWeeklyArcadeBonus();
        return;
    }

    const quests = [
        { key: 'login', name: '오늘의 첫 발걸음', desc: '세븐체크 접속하기', reward: '50P' },
        { key: 'test', name: '자아 탐구 생활', desc: '심리 테스트 1회 완료', reward: '50P' },
        { key: 'board', name: '활발한 소통가', desc: '게시글 작성하기', reward: '50P' }
    ];

    let doneCount = 0;
    listEl.innerHTML = quests.map(q => {
        const isDone = qData.list[q.key];
        if (isDone) doneCount++;
        return `
            <div class="quest-item">
                <div class="quest-info">
                    <h4>${q.name}</h4>
                    <p>${q.desc}</p>
                </div>
                <div class="quest-status ${isDone ? 'done' : ''}">
                    ${isDone ? '완료 ✓' : `보상: ${q.reward}`}
                </div>
            </div>
        `;
    }).join('');

    summaryEl.textContent = `📜 일일 퀘스트 (${doneCount}/3 완료)`;
    renderWeeklyArcadeBonus();
}

function renderMarketUI() {
    const container = document.getElementById('market-ui-container');
    if (!container) return;
    const inv = UserState.data.inventory || [];
    if (inv.length === 0) { container.innerHTML = '<p style="text-align:center; padding:1rem; color:var(--text-sub);">판매할 아이템이 없습니다.</p>'; return; }
    const itemCounts = inv.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
    const openBtn = document.getElementById('market-open-btn');
    if (openBtn) openBtn.style.display = 'none';

    let html = `
        <div class="market-bulk-sell fade-in" style="background:var(--bg-color); padding:1rem; border-radius:15px; border:1px solid var(--border-color); margin-bottom:1.5rem;">
            <div style="max-height: 280px; overflow-y: auto; margin-bottom: 1.5rem;" class="custom-scroll">
                <table style="width:100%; border-collapse: collapse; font-size:0.8rem;">
                    <thead style="position: sticky; top: 0; background: var(--bg-color); z-index: 1;">
                        <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-sub);">
                            <th style="padding: 0.5rem; width:30px;"><input type="checkbox" id="market-select-all" checked></th>
                            <th style="text-align:left; padding: 0.5rem;">아이템</th>
                            <th style="text-align:center; padding: 0.5rem; width: 60px;">수량</th>
                            <th style="text-align:right; padding: 0.5rem;">환급액</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    Object.entries(itemCounts).forEach(([name, count]) => {
        const refundVal = Math.floor((ITEM_VALUES[name] || 0) * 0.7);
        html += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.5rem; text-align:center;"><input type="checkbox" class="market-item-check" data-name="${name}" checked></td>
                <td style="padding: 0.75rem 0.5rem; font-weight: 700;"><span style="display:block;">${name}</span><small style="color:var(--text-sub); font-size:0.65rem;">가치: ${ITEM_VALUES[name]}P</small></td>
                <td style="padding: 0.5rem; text-align:center;"><input type="number" class="market-qty-input" data-name="${name}" data-max="${count}" data-price="${refundVal}" value="${count}" min="1" max="${count}" style="width:100%; background:var(--card-bg); border:1px solid var(--border-color); border-radius:6px; color:var(--text-main); text-align:center; padding:4px; font-size:0.75rem;"></td>
                <td style="padding: 0.75rem 0.5rem; text-align:right; font-weight:900; color:var(--accent-secondary);"><span class="row-refund-total">${(refundVal * count).toLocaleString()}P</span></td>
            </tr>
        `;
    });
    html += `</tbody></table></div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding-top:1rem; border-top:2px solid var(--border-color);">
                <div><small style="display:block; color:var(--text-sub); font-weight:800;">총 환급액</small><strong id="market-total-refund" style="font-size:1.3rem; color:var(--accent-color);">0P</strong></div>
                <div style="display:flex; gap:0.4rem;"><button id="market-cancel-btn" class="btn-secondary" style="padding:0.6rem 1rem; font-size:0.8rem;">취소</button><button id="market-sell-btn" class="btn-primary" style="background:var(--accent-secondary); padding:0.6rem 1.2rem; font-size:0.8rem;">선택 판매</button></div>
            </div></div>`;
    container.innerHTML = html;

    const updateTotals = () => {
        let total = 0;
        container.querySelectorAll('tr').forEach(row => {
            const check = row.querySelector('.market-item-check');
            const input = row.querySelector('.market-qty-input');
            const rowTotalEl = row.querySelector('.row-refund-total');
            if (check && input && rowTotalEl) {
                const qty = check.checked ? (parseInt(input.value) || 0) : 0;
                const price = parseInt(input.dataset.price);
                const rowTotal = qty * price;
                rowTotalEl.textContent = rowTotal.toLocaleString() + 'P';
                rowTotalEl.style.opacity = check.checked ? '1' : '0.3';
                input.disabled = !check.checked;
                total += rowTotal;
            }
        });
        document.getElementById('market-total-refund').textContent = total.toLocaleString() + 'P';
    };

    container.querySelectorAll('.market-qty-input, .market-item-check, #market-select-all').forEach(el => {
        el.onchange = () => {
            if (el.id === 'market-select-all') container.querySelectorAll('.market-item-check').forEach(c => c.checked = el.checked);
            updateTotals();
        };
        if (el.classList.contains('market-qty-input')) {
            el.oninput = () => {
                const max = parseInt(el.dataset.max);
                if (parseInt(el.value) > max) el.value = max;
                if (parseInt(el.value) < 1) el.value = 1;
                updateTotals();
            };
        }
    });
    updateTotals();

    document.getElementById('market-cancel-btn').onclick = () => { container.innerHTML = ''; if (openBtn) openBtn.style.display = 'block'; };
    document.getElementById('market-sell-btn').onclick = async () => {
        const sellList = [];
        container.querySelectorAll('tr').forEach(row => {
            const check = row.querySelector('.market-item-check');
            const input = row.querySelector('.market-qty-input');
            if (check && check.checked) {
                const qty = parseInt(input.value) || 0;
                if (qty > 0) sellList.push({ name: input.dataset.name, qty, price: parseInt(input.dataset.price) });
            }
        });
        if (sellList.length === 0) return alert("판매할 아이템을 선택해주세요.");
        const totalRefund = sellList.reduce((acc, cur) => acc + (cur.qty * cur.price), 0);
        if (!confirm(`${sellList.length}종의 아이템을 판매하여 총 ${totalRefund.toLocaleString()}P를 받으시겠습니까?`)) return;
        await playBulkSell(sellList, totalRefund);
    };
}

async function playBulkSell(sellList, totalRefund) {
    if (!UserState.user) return;
    const userRef = doc(db, "users", UserState.user.uid);
    let currentInv = [...UserState.data.inventory];
    sellList.forEach(sell => { for (let i = 0; i < sell.qty; i++) { const idx = currentInv.indexOf(sell.name); if (idx > -1) currentInv.splice(idx, 1); } });
    const newScore = currentInv.reduce((acc, item) => acc + (ITEM_VALUES[item] || 0), 0);
    try {
        await updateDoc(userRef, { inventory: currentInv, points: increment(totalRefund), totalScore: newScore });
        UserState.data.inventory = currentInv; UserState.data.points += totalRefund; UserState.data.totalScore = newScore;
        alert(`💰 판매 완료! ${totalRefund.toLocaleString()}P가 지급되었습니다.`);
        window._preventScroll = true; window.dispatchEvent(new HashChangeEvent('hashchange')); updateUI();
    } catch (e) { console.error(e); alert("판매 중 오류가 발생했습니다."); }
}

async function playDailyCheckin() {
    if (!UserState.user) return;
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem(`last_checkin_${UserState.user.uid}`) === today) return alert("이미 완료!");
    const { getPetBuff } = await import('./auth.js?v=8.5.0');
    const petBuff = getPetBuff();
    const reward = Math.floor(100 * petBuff.multiplier) + petBuff.checkinBonus;

    if (await addPoints(reward)) {
        await updateArcadeStat('checkin');
        soundManager.playSuccess(); // 출석 성공음
        localStorage.setItem(`last_checkin_${UserState.user.uid}`, today);
        alert(`${reward}P 지급! ✨`); updateUI();
    }
}

async function buyBoosterPack() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const button = document.getElementById('buy-booster-btn');
    if (!button || button.disabled) return;

    const cost = 100;
    if ((UserState.data.points || 0) < cost) {
        soundManager.playFailure();
        button.textContent = '포인트 부족';
        setTimeout(() => {
            const currentButton = document.getElementById('buy-booster-btn');
            if (currentButton) currentButton.textContent = '부스터 20회 충전 (100P)';
        }, 1200);
        return;
    }

    button.disabled = true;
    button.textContent = '충전 중...';

    try {
        const spent = await usePoints(cost, '슈퍼 부스터 충전');
        if (!spent) {
            alert("부스터 충전에 실패했습니다.");
            return;
        }

        await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(20) });
        UserState.data.boosterCount = (UserState.data.boosterCount || 0) + 20;
        soundManager.playSuccess();
        updateUI();

        if (window.location.hash === '#arcade') {
            window._preventScroll = true;
            window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
    } catch (e) {
        console.error(e);
        soundManager.playFailure();
        button.textContent = '충전 실패';
    } finally {
        if (document.getElementById('buy-booster-btn')) {
            const refreshedButton = document.getElementById('buy-booster-btn');
            refreshedButton.disabled = false;
            refreshedButton.textContent = '부스터 20회 충전 (100P)';
        }
    }
}

async function playBettingGame(type, choice) {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const amountInput = document.getElementById('bet-amount');
    const statusEl = document.getElementById('dice-status-text');
    const diceCubes = [document.getElementById('dice-cube-1'), document.getElementById('dice-cube-2'), document.getElementById('dice-cube-3')];
    if (!amountInput || !statusEl || !diceCubes[0]) return;
    const betAmount = parseInt(amountInput.value);
    if (isNaN(betAmount) || betAmount < 10) { statusEl.innerHTML = '<span style="color:#ef4444;">최소 10P 이상 베팅해야 합니다.</span>'; return; }
    if (betAmount > UserState.data.points) { statusEl.innerHTML = `<span style="color:#ef4444;">포인트가 부족합니다! (보유: ${UserState.data.points}P)</span>`; return; }
    const buttons = document.querySelectorAll('.bet-btn');
    buttons.forEach(btn => btn.disabled = true);
    statusEl.innerHTML = '<span style="color:var(--accent-color); font-weight:800;">주사위를 흔드는 중...</span>';
    soundManager.playNoise(1.2, 'brown', 0.15); // 주사위 굴리는 소리
    diceCubes.forEach(dice => { dice.classList.remove('show-1','show-2','show-3','show-4','show-5','show-6'); dice.classList.add('rolling'); });

    if (await usePoints(betAmount, `주사위 베팅 (${choice})`)) {
        await updateArcadeStat('betting');
        setTimeout(async () => {
            const d1 = Math.floor(Math.random() * 6) + 1; const d2 = Math.floor(Math.random() * 6) + 1; const d3 = Math.floor(Math.random() * 6) + 1;
            const results = [d1, d2, d3]; const sum = d1 + d2 + d3;
            const sumRange = choice === 'small' ? '소(3~8)' : (choice === 'middle' ? '중(9~12)' : '대(13~18)');
            let win = false; let multiplier = choice === 'middle' ? 1.9 : 3.2;
            if (choice === 'small' && sum <= 8) win = true;
            else if (choice === 'middle' && sum >= 9 && sum <= 12) win = true;
            else if (choice === 'big' && sum >= 13) win = true;
            const winAmount = Math.floor(betAmount * multiplier);
            diceCubes.forEach((dice, idx) => { 
                dice.classList.remove('rolling'); 
                setTimeout(() => { 
                    dice.classList.add(`show-${results[idx]}`); 
                    soundManager.playThud(0.15); // 주사위 착지 소리
                }, idx * 100); 
            });
            setTimeout(async () => {
                if (win) {
                    soundManager.playSuccess(); // 승리음
                    await addPoints(winAmount, "주사위 베팅 승리");
                    statusEl.innerHTML = `<div style="animation: bounce 0.5s; text-align:center;"><strong style="color:#10b981; font-size: 1rem;">🎉 승리! 합계 ${sum} (${sumRange})</strong><br><span style="font-size:1.2rem; color:#10b981; font-weight:900;">+${winAmount.toLocaleString()}P 획득!</span></div>`;
                } else {
                    soundManager.playFailure(); // 패배음
                    statusEl.innerHTML = `<div style="opacity:0.8; text-align:center;"><strong style="color:var(--text-sub);">패배... 합계 ${sum}</strong><br><small>조건: ${sumRange} 미충족</small></div>`;
                }
                updateUI(); buttons.forEach(btn => btn.disabled = false);
            }, 600);
        }, 1500);
    } else {
        diceCubes.forEach(dice => dice.classList.remove('rolling')); buttons.forEach(btn => btn.disabled = false);
        statusEl.innerHTML = '<span style="color:#ef4444;">베팅이 취소되었습니다.</span>';
    }
}
