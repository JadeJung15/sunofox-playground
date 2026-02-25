import { addPoints, usePoints, UserState, updateUI, ITEM_VALUES, ITEM_GRADES } from './auth.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

let arcadeInitialized = false;

export function initArcade() {
    if (arcadeInitialized) return;
    arcadeInitialized = true;

    document.addEventListener('click', async (e) => {
        const target = e.target.closest('button') || e.target;
        if (target.id === 'gacha-btn') await playGacha(1, 100);
        if (target.id === 'gacha-10-btn') await playGacha(10, 950);
        if (target.id === 'gacha-30-btn') await playGacha(30, 2700);
        
        if (target.id === 'alchemy-btn') await playAlchemy(1);
        if (target.id === 'alchemy-5-btn') await playAlchemy(5);
        if (target.id === 'alchemy-10-btn') await playAlchemy(10);
        
        if (target.id === 'fusion-btn') await playFusion();
        
        if (target.id === 'market-open-btn') renderMarketUI();
        
        if (target.id === 'click-game-btn') await playClickGame();
        if (target.id === 'slot-spin-btn') await playSlotMachine();
        if (target.id === 'bomb-start-btn') await startBombGame();
        if (target.classList.contains('wire-btn')) await cutWire(parseInt(target.dataset.wire));
        if (target.id === 'bomb-claim-btn') await claimBombPoints();
        if (target.id === 'daily-checkin-btn') await playDailyCheckin();
        if (target.id === 'market-open-btn') await openMarket();
        
        if (target.classList.contains('bet-btn')) {
            const gameType = target.dataset.game;
            const choice = target.dataset.choice;
            await playBettingGame(gameType, choice);
        }
    });
}

async function updateArcadeStat(statKey) {
    if (!UserState.user) return;
    try {
        const userRef = doc(db, "users", UserState.user.uid);
        await updateDoc(userRef, { [`arcadeStats.${statKey}`]: increment(1) });
        if (!UserState.data.arcadeStats) UserState.data.arcadeStats = {};
        UserState.data.arcadeStats[statKey] = (UserState.data.arcadeStats[statKey] || 0) + 1;
    } catch (e) { console.error(e); }
}

async function playGacha(count, cost) {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    if (await usePoints(cost)) {
        await updateArcadeStat('gacha');
        const exclusiveItems = ['🧪 현자의 돌', '🧬 인공 생명체', '⚡ 번개 병', '🌌 은하수 가루'];
        const itemNames = Object.keys(ITEM_VALUES).filter(name => !exclusiveItems.includes(name));
        const weights = [40, 20, 15, 10, 5, 8, 2];
        const drawnItems = [];
        let totalAddedScore = 0;
        for (let i = 0; i < count; i++) {
            const item = getRandomItem(itemNames, weights);
            drawnItems.push(item);
            totalAddedScore += ITEM_VALUES[item];
        }
        try {
            const userRef = doc(db, "users", UserState.user.uid);
            await updateDoc(userRef, {
                inventory: arrayUnion(...drawnItems),
                totalScore: increment(totalAddedScore)
            });
            UserState.data.inventory = [...(UserState.data.inventory || []), ...drawnItems];
            UserState.data.totalScore = (UserState.data.totalScore || 0) + totalAddedScore;
            const resultEl = document.getElementById('gacha-result');
            if (resultEl) {
                if (count === 1) { resultEl.innerHTML = `<strong>[${drawnItems[0]}]</strong> 획득!<br><small>+${totalAddedScore}점</small>`; }
                else {
                    const summary = drawnItems.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                    const resultText = Object.entries(summary).map(([name, num]) => `${name} x${num}`).join('<br>');
                    resultEl.innerHTML = `<div style="font-size:0.85rem; line-height:1.4;"><strong>${count}회 결과:</strong><br>${resultText}<br><span style="color:var(--accent-color); font-weight:800;">총 +${totalAddedScore}점</span></div>`;
                }
            }
            updateUI();
        } catch (e) { alert("저장 실패"); }
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
    const earn = Math.floor(Math.random() * 10) + 5;
    btn.textContent = "채굴 중...";
    setTimeout(async () => { await addPoints(earn); btn.disabled = false; btn.textContent = "채굴기 가동 시작"; }, 1000);
}

const SLOT_EMOJIS = ['🎰', '💎', '🔥', '✨', '🍒', '7️⃣'];
async function playSlotMachine() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    const cost = 300;
    if (await usePoints(cost)) {
        await updateArcadeStat('slot');
        const reels = [document.getElementById('slot-1'), document.getElementById('slot-2'), document.getElementById('slot-3')];
        const btn = document.getElementById('slot-spin-btn');
        if(!reels[0] || !btn) return;
        btn.disabled = true;
        
        let spinCount = 0;
        const spinInterval = setInterval(() => {
            reels.forEach(r => r.textContent = SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]);
            spinCount++;
            if (spinCount > 15) {
                clearInterval(spinInterval);
                const final = reels.map(() => SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]);
                reels.forEach((r, i) => r.textContent = final[i]);
                
                let winMsg = "💀 아쉬워요! 다시 도전해보세요.";
                let winPoints = 0;
                
                const unique = new Set(final).size;
                if (unique === 1) { winPoints = 5000; winMsg = "🎉 JACKPOT!!! 5,000P 획득!"; }
                else if (unique === 2) { winPoints = 600; winMsg = "✨ 2개 일치! 600P 획득!"; }
                
                setTimeout(async () => {
                    if (winPoints > 0) await addPoints(winPoints, "슬롯머신 당첨");
                    alert(winMsg);
                    btn.disabled = false;
                }, 500);
            }
        }, 100);
    }
}

let bombGameState = { active: false, bombIndex: -1, currentPool: 0, cutWires: [] };
async function startBombGame() {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    if (bombGameState.active) return;
    if (await usePoints(200)) {
        await updateArcadeStat('bomb');
        bombGameState = { active: true, bombIndex: Math.floor(Math.random() * 5), currentPool: 0, cutWires: [] };
        const msgEl = document.getElementById('bomb-msg');
        const startBtn = document.getElementById('bomb-start-btn');
        if(msgEl) msgEl.textContent = "전선을 끊으세요! (현재: 0P)";
        if(startBtn) startBtn.disabled = true;
        document.querySelectorAll('.wire-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        });
    }
}

async function cutWire(index) {
    if (!bombGameState.active || bombGameState.cutWires.includes(index)) return;
    const wireBtn = document.querySelector(`.wire-btn[data-wire="${index}"]`);
    const msgEl = document.getElementById('bomb-msg');
    const claimBtn = document.getElementById('bomb-claim-btn');
    const startBtn = document.getElementById('bomb-start-btn');

    bombGameState.cutWires.push(index);
    if(wireBtn) {
        wireBtn.style.opacity = '0.3';
        wireBtn.style.transform = 'scale(0.9)';
        wireBtn.disabled = true;
    }

    if (index === bombGameState.bombIndex) {
        bombGameState.active = false;
        alert("🧨 콰광!!! 폭탄이 터졌습니다!");
        if(msgEl) msgEl.textContent = "폭발했습니다! (0P)";
        if(startBtn) startBtn.disabled = false;
        if(claimBtn) claimBtn.disabled = true;
        document.querySelectorAll('.wire-btn').forEach(btn => btn.disabled = true);
    } else {
        const reward = [100, 300, 600, 1200][bombGameState.cutWires.length - 1];
        bombGameState.currentPool = reward;
        if(msgEl) msgEl.textContent = `성공! 현재 보상: ${reward}P (다음은 더 큽니다!)`;
        if(claimBtn) claimBtn.disabled = false;
        if (bombGameState.cutWires.length === 4) {
            alert("🎯 모든 안전한 전선을 제거했습니다!");
            await claimBombPoints();
        }
    }
}

async function claimBombPoints() {
    if (!bombGameState.active) return;
    const points = bombGameState.currentPool;
    const msgEl = document.getElementById('bomb-msg');
    const startBtn = document.getElementById('bomb-start-btn');
    const claimBtn = document.getElementById('bomb-claim-btn');

    bombGameState.active = false;
    await addPoints(points, "폭탄 돌리기 성공");
    alert(`🎉 안전하게 ${points}P를 챙겼습니다!`);
    if(msgEl) msgEl.textContent = "성공적으로 탈출!";
    if(startBtn) startBtn.disabled = false;
    if(claimBtn) claimBtn.disabled = true;
    document.querySelectorAll('.wire-btn').forEach(btn => btn.disabled = true);
}

async function playAlchemy(count) {
    if (!UserState.user) return alert("로그인이 필요합니다!");
    
    const resultEl = document.getElementById('alchemy-result');
    if (!resultEl) return;

    let cost = 300;
    if (count === 5) cost = 1350;
    else if (count === 10) cost = 2500;

    const gradeSelect = document.getElementById('alchemy-grade-select');
    if (!gradeSelect) return;

    const selectedGrade = gradeSelect.value;
    const itemsNeeded = count * 6;
    const targetItems = ITEM_GRADES[selectedGrade];
    const availableItems = UserState.data.inventory.filter(name => targetItems.includes(name));

    // [개선] 수량 부족 시 실패 노출 (팝업 X)
    if (availableItems.length < itemsNeeded) {
        resultEl.innerHTML = `
            <div style="color:#ef4444; animation: shake 0.5s;">
                <strong>⚠️ 연성 불가: 재료 부족</strong><br>
                <small>필요: ${itemsNeeded}개 / 보유: ${availableItems.length}개</small>
            </div>
        `;
        return;
    }

    // [개선] 포인트 부족 시 실패 노출 (팝업 X)
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

    // 연성 시작 효과
    resultEl.innerHTML = '<span class="loading-dots" style="color:#8b5cf6;">금단의 비술을 시전 중...</span>';

    if (await usePoints(cost, `연금술 시행 (${count}회)`)) {
        await updateArcadeStat('alchemy');
        
        setTimeout(async () => {
            try {
                const userRef = doc(db, "users", UserState.user.uid);
                let currentInv = [...UserState.data.inventory];
                
                // 1. 소모 아이템 처리 및 점수 계산 (-)
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

                // 2. 결과 아이템 생성 (확률형)
                const gradeOrder = ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY'];
                const nextGrade = gradeOrder[Math.min(gradeOrder.indexOf(selectedGrade) + 1, gradeOrder.length - 1)];
                
                const results = [];
                let bonusCount = 0;
                let scoreGained = 0;
                let upgradeSuccessCount = 0;

                for (let i = 0; i < count; i++) {
                    // [개선] 확률 로직: 70% 확률로 상위 등급, 30% 확률로 동급 아이템
                    const isUpgrade = Math.random() < 0.7;
                    const finalGrade = isUpgrade ? nextGrade : selectedGrade;
                    if(isUpgrade) upgradeSuccessCount++;

                    const pool = ITEM_GRADES[finalGrade];
                    const item = pool[Math.floor(Math.random() * pool.length)];
                    
                    results.push(item);
                    scoreGained += (ITEM_VALUES[item] || 0);

                    // 15% 보너스 (동일 아이템 1개 더)
                    if (Math.random() < 0.15) {
                        results.push(item);
                        scoreGained += (ITEM_VALUES[item] || 0);
                        bonusCount++;
                    }
                }

                currentInv.push(...results);
                const recalcScore = currentInv.reduce((acc, item) => acc + (ITEM_VALUES[item] || 0), 0);
                
                await updateDoc(userRef, { 
                    inventory: currentInv, 
                    totalScore: recalcScore, 
                    discoveredItems: arrayUnion(...results) 
                });

                UserState.data.inventory = currentInv;
                UserState.data.totalScore = recalcScore;

                // 3. 결과 UI 구성
                const resSummary = results.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                const resultItemsHTML = Object.entries(resSummary).map(([name, num]) => 
                    `<span style="display:inline-block; background:rgba(139, 92, 246, 0.1); color:#8b5cf6; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:800; margin:2px; border:1px solid rgba(139, 92, 246, 0.2);">${name} x${num}</span>`
                ).join('');

                const matSummary = sacrificed.reduce((acc, cur) => { acc[cur] = (acc[cur] || 0) + 1; return acc; }, {});
                const materialsHTML = Object.entries(matSummary).map(([name, num]) => 
                    `<span style="display:inline-block; background:rgba(0,0,0,0.05); color:var(--text-sub); padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:600; margin:2px;">${name} x${num}</span>`
                ).join('');

                resultEl.innerHTML = `
                    <div style="animation: bounce 0.5s; text-align:center; width:100%;">
                        <div style="margin-bottom:8px;">
                            <strong style="font-size:0.95rem; color:#8b5cf6;">✨ 연성 완료 (${upgradeSuccessCount}/${count} 진화 성공)</strong>
                        </div>
                        <div style="margin-bottom:12px; display:flex; flex-wrap:wrap; justify-content:center;">${resultItemsHTML}</div>
                        
                        <div style="background:rgba(0,0,0,0.02); padding:10px; border-radius:10px; font-size:0.75rem; text-align:left; border:1px solid var(--border-color);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                <span style="font-weight:700;">사용한 제물:</span>
                                <span style="color:#ef4444; font-weight:900;">-${scoreLost.toLocaleString()}점</span>
                            </div>
                            <div style="display:flex; flex-wrap:wrap; margin-bottom:10px; opacity:0.8;">${materialsHTML}</div>
                            
                            <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-color); padding-top:8px;">
                                <span style="font-weight:700;">총 획득 점수:</span>
                                <strong style="color:#10b981; font-size:0.9rem;">+${scoreGained.toLocaleString()}점</strong>
                            </div>
                            <div style="text-align:right; margin-top:4px;">
                                <small style="font-weight:800; color:var(--accent-color);">최종 점수 변동: ${ (scoreGained - scoreLost) >= 0 ? '+' : ''}${(scoreGained - scoreLost).toLocaleString()}점</small>
                            </div>
                        </div>
                    </div>
                `;
                
                if (window.location.hash === '#arcade') {
                    window._preventScroll = true; // 스크롤 유지
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                }
                updateUI();
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

// =================================================================
// 🏪 아이템 중고장터 (BULK SELL + CHECKBOX)
// =================================================================

function renderMarketUI() {
    const container = document.getElementById('market-ui-container');
    if (!container) return;
    
    const inv = UserState.data.inventory || [];
    if (inv.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:1rem; color:var(--text-sub);">판매할 아이템이 없습니다.</p>';
        return;
    }

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
                <td style="padding: 0.5rem; text-align:center;">
                    <input type="checkbox" class="market-item-check" data-name="${name}" checked>
                </td>
                <td style="padding: 0.75rem 0.5rem; font-weight: 700;">
                    <span style="display:block;">${name}</span>
                    <small style="color:var(--text-sub); font-size:0.65rem;">가치: ${ITEM_VALUES[name]}P</small>
                </td>
                <td style="padding: 0.5rem; text-align:center;">
                    <input type="number" class="market-qty-input" data-name="${name}" data-max="${count}" data-price="${refundVal}" 
                           value="${count}" min="1" max="${count}" 
                           style="width:100%; background:var(--card-bg); border:1px solid var(--border-color); border-radius:6px; color:var(--text-main); text-align:center; padding:4px; font-size:0.75rem;">
                </td>
                <td style="padding: 0.75rem 0.5rem; text-align:right; font-weight:900; color:var(--accent-secondary);">
                    <span class="row-refund-total">${(refundVal * count).toLocaleString()}P</span>
                </td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding-top:1rem; border-top:2px solid var(--border-color);">
                <div>
                    <small style="display:block; color:var(--text-sub); font-weight:800;">총 환급액</small>
                    <strong id="market-total-refund" style="font-size:1.3rem; color:var(--accent-color);">0P</strong>
                </div>
                <div style="display:flex; gap:0.4rem;">
                    <button id="market-cancel-btn" class="btn-secondary" style="padding:0.6rem 1rem; font-size:0.8rem;">취소</button>
                    <button id="market-sell-btn" class="btn-primary" style="background:var(--accent-secondary); padding:0.6rem 1.2rem; font-size:0.8rem;">선택 판매</button>
                </div>
            </div>
        </div>
    `;

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
        el.onchange = (e) => {
            if (el.id === 'market-select-all') {
                container.querySelectorAll('.market-item-check').forEach(c => c.checked = el.checked);
            }
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

    document.getElementById('market-cancel-btn').onclick = () => {
        container.innerHTML = '';
        if (openBtn) openBtn.style.display = 'block';
    };

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

    sellList.forEach(sell => {
        for (let i = 0; i < sell.qty; i++) {
            const idx = currentInv.indexOf(sell.name);
            if (idx > -1) currentInv.splice(idx, 1);
        }
    });

    const newScore = currentInv.reduce((acc, item) => acc + (ITEM_VALUES[item] || 0), 0);
    
    try {
        await updateDoc(userRef, { 
            inventory: currentInv, 
            points: increment(totalRefund), 
            totalScore: newScore 
        });

        UserState.data.inventory = currentInv;
        UserState.data.points += totalRefund;
        UserState.data.totalScore = newScore;

        alert(`💰 판매 완료! ${totalRefund.toLocaleString()}P가 지급되었습니다.`);
        
        window._preventScroll = true;
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        updateUI();
    } catch (e) {
        console.error(e);
        alert("판매 중 오류가 발생했습니다.");
    }
}

async function playDailyCheckin() {
    if (!UserState.user) return;
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem(`last_checkin_${UserState.user.uid}`) === today) return alert("이미 완료!");
    if (await addPoints(100)) {
        await updateArcadeStat('checkin');
        localStorage.setItem(`last_checkin_${UserState.user.uid}`, today);
        alert("100P 지급! ✨"); updateUI();
    }
}
