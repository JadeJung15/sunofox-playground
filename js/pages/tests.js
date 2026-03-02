import { UserState, addPoints, postEconomyAction } from '../auth.js?v=8.6.2';
import { ITEM_VALUES } from '../constants/shops.js';
import { copyLink, saveAsStoryImage } from '../share.js?v=8.6.2';
import { TESTS } from '../tests-data.js?v=8.6.2';
import { renderTestCard } from './home.js?v=8.6.2';
import { renderBadge, renderButton, renderChip, renderSectionHead } from '../ui/components.js?v=8.6.2';

function getShareUrl(testId) {
    if (testId === 'p39') return `${window.location.origin}/share/p39`;
    return `${window.location.origin}/?test=${testId}`;
}

function scrollTopInstant() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resolveResult(test, traitScores) {
    const traits = test.customTraits || ['energy', 'logic', 'empathy', 'creativity'];
    const dominantTrait = traits.reduce((a, b) => ((traitScores[a] || 0) >= (traitScores[b] || 0) ? a : b));
    const fallback = (traitScores.energy || 0) >= 4 ? 'A' : 'B';
    return {
        dominantTrait,
        result: test.results[dominantTrait] || test.results[fallback]
    };
}

async function rewardResult(dominantTrait) {
    const { getPetBuff } = await import('../auth.js?v=8.6.2');
    const petBuff = getPetBuff();
    let pointReward = Math.floor((10 + petBuff.testBonus) * petBuff.multiplier);

    if (UserState.user && UserState.data.boosterCount > 0) {
        pointReward = Math.floor((20 + petBuff.testBonus) * petBuff.multiplier);
        await postEconomyAction('consumeBooster', { amount: 1 });
        UserState.data.boosterCount -= 1;
    }

    let rewardedItem = null;
    if (UserState.user) {
        const itemByTrait = {
            energy: '⚡ 번개 병',
            logic: '🧪 현자의 돌',
            empathy: '🌱 묘목',
            creativity: '🌌 은하수 가루'
        };
        const fallbackItems = ['⚡ 번개 병', '🧪 현자의 돌', '🌱 묘목', '🌌 은하수 가루', '🦊 여우 꼬리'];
        rewardedItem = itemByTrait[dominantTrait] || fallbackItems[Math.floor(Math.random() * fallbackItems.length)];
        const itemValue = ITEM_VALUES[rewardedItem] || 500;

        await postEconomyAction('grantItems', { items: [rewardedItem] });
        UserState.data.inventory.push(rewardedItem);
        UserState.data.totalScore = (UserState.data.totalScore || 0) + itemValue;
        UserState.data.discoveredItems = [...new Set([...(UserState.data.discoveredItems || []), rewardedItem])];
        await addPoints(pointReward, '분석 완료 보상');
        window.checkDailyQuests?.('test');
    }

    return { pointReward, rewardedItem };
}

export async function renderResult(testId, traitScores) {
    const app = document.getElementById('app');
    const test = TESTS.find((item) => item.id === testId);
    if (!test) return;

    const { dominantTrait, result } = resolveResult(test, traitScores);
    const { pointReward, rewardedItem } = await rewardResult(dominantTrait);
    const recommended = TESTS.filter((item) => item.id !== testId).sort(() => 0.5 - Math.random()).slice(0, 3);
    const color = result.color || '#2f6fed';

    app.innerHTML = `
        <section class="page-shell">
            <article class="result-card" style="--result-color:${color}">
                <div class="result-card__hero">
                    ${renderBadge(test.category)}
                    <h1>${result.title}</h1>
                    <p>${result.desc}</p>
                    <div class="chip-row">
                        ${(result.tags || []).map((tag) => renderChip(tag)).join('')}
                    </div>
                </div>

                <div class="result-grid">
                    <section class="panel">
                        ${renderSectionHead({
                            eyebrow: 'Summary',
                            title: '당신의 핵심 결과',
                            description: result.desc
                        })}
                    </section>
                    <section class="panel">
                        ${renderSectionHead({
                            eyebrow: 'Reward',
                            title: rewardedItem || `${pointReward}P 지급`,
                            description: rewardedItem ? '아이템이 인벤토리에 추가되었습니다.' : '포인트 보상이 지급되었습니다.'
                        })}
                    </section>
                </div>

                <div class="result-actions">
                    ${renderButton({ label: '결과 공유', attrs: 'id="result-share-btn"' })}
                    ${renderButton({ label: '이미지 저장', variant: 'secondary', attrs: 'id="result-save-btn"' })}
                    ${renderButton({ label: '다시 선택', variant: 'ghost', attrs: `onclick="location.hash='#home'"` })}
                </div>
            </article>

            <section>
                ${renderSectionHead({
                    eyebrow: 'Next',
                    title: '다른 테스트',
                    description: '결과 보고 바로 이어서 진행'
                })}
                <div class="test-grid">
                    ${recommended.map((item) => renderTestCard(item)).join('')}
                </div>
            </section>

            <div id="story-capture-area" class="story-capture" style="--result-color:${color}">
                <span>${test.title}</span>
                <strong>${result.title}</strong>
                <p>${result.desc}</p>
            </div>
        </section>
    `;

    document.getElementById('result-share-btn')?.addEventListener('click', async () => {
        const url = getShareUrl(testId);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `SevenCheck - ${result.title}`,
                    text: result.desc,
                    url
                });
                await addPoints(30, '테스트 공유 보상');
            } catch (error) {
                console.error(error);
            }
        } else {
            await copyLink(url);
        }
    });

    document.getElementById('result-save-btn')?.addEventListener('click', async () => {
        const button = document.getElementById('result-save-btn');
        if (!button) return;
        button.disabled = true;
        button.textContent = '저장 중...';
        await saveAsStoryImage('story-capture-area', `7Check_${testId}.png`);
        button.disabled = false;
        button.textContent = '이미지 저장';
    });
}

export function renderTestExecution(testId) {
    const app = document.getElementById('app');
    const test = TESTS.find((item) => item.id === testId);
    if (!test) return;

    const traits = test.customTraits || ['energy', 'logic', 'empathy', 'creativity'];
    const traitScores = Object.fromEntries(traits.map((trait) => [trait, 0]));
    let step = -1;

    const renderIntro = () => {
        app.innerHTML = `
            <section class="page-shell">
                <div class="test-flow">
                    <article class="question-card">
                        ${renderBadge(test.category)}
                        <h2>${test.title}</h2>
                        <p class="question-card__meta">${test.desc}</p>
                        <div class="chip-row">
                            ${renderChip(`${test.questions.length}문항`)}
                            ${renderChip('간결한 진행')}
                            ${renderChip('결과 공유')}
                        </div>
                        <div class="hero__actions">
                            ${renderButton({ label: '시작하기', attrs: 'id="test-start-btn"' })}
                            ${renderButton({ label: '공유하기', variant: 'secondary', attrs: 'id="test-share-btn"' })}
                        </div>
                    </article>
                </div>
            </section>
        `;

        document.getElementById('test-start-btn')?.addEventListener('click', () => {
            step = 0;
            updateStep();
        });

        document.getElementById('test-share-btn')?.addEventListener('click', async () => {
            const url = getShareUrl(testId);
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `SevenCheck - ${test.title}`,
                        text: test.desc,
                        url
                    });
                    await addPoints(30, '테스트 공유 보상');
                } catch (error) {
                    console.error(error);
                }
            } else {
                await copyLink(url);
            }
        });
    };

    const updateStep = () => {
        if (step >= test.questions.length) {
            renderLoading();
            return;
        }

        const question = test.questions[step];
        const progress = Math.round(((step + 1) / test.questions.length) * 100);

        app.innerHTML = `
            <section class="page-shell">
                <div class="test-flow">
                    <div class="progress-card">
                        <div class="progress-card__top">
                            <span>${step + 1} / ${test.questions.length}</span>
                            <strong>${progress}%</strong>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-bar__fill" style="width:${progress}%"></div>
                        </div>
                    </div>

                    <article class="question-card">
                        ${renderBadge(test.category)}
                        <h2>${question.q}</h2>
                        <p class="question-card__meta">가장 가까운 선택 하나만 누르면 됩니다.</p>
                        <div class="answer-list">
                            ${question.options.map((option, index) => `
                                <button class="answer-button" data-index="${index}">
                                    <span class="answer-button__index">${index + 1}</span>
                                    ${option.text}
                                </button>
                            `).join('')}
                        </div>
                    </article>
                </div>
            </section>
        `;

        document.querySelectorAll('.answer-button').forEach((button) => {
            button.addEventListener('click', () => {
                const option = question.options[Number(button.dataset.index)];

                if (option.scores) {
                    Object.entries(option.scores).forEach(([key, value]) => {
                        traitScores[key] = (traitScores[key] || 0) + value;
                    });
                } else if (option.type) {
                    if (test.customTraits && test.customTraits.includes(option.type)) {
                        traitScores[option.type] = (traitScores[option.type] || 0) + 1;
                    } else if (option.type === 'A') {
                        traitScores.energy = (traitScores.energy || 0) + 2;
                    } else {
                        traitScores.empathy = (traitScores.empathy || 0) + 2;
                    }
                }

                step += 1;
                scrollTopInstant();
                updateStep();
            });
        });
    };

    const renderLoading = () => {
        app.innerHTML = `
            <section class="page-shell">
                <div class="test-flow">
                    <div class="empty-state">
                        <div class="loading-dot"></div>
                        <strong>결과를 정리하는 중입니다.</strong>
                        <p>답변을 바탕으로 최종 결과를 계산하고 있습니다.</p>
                    </div>
                </div>
            </section>
        `;

        setTimeout(() => renderResult(testId, traitScores), 1200);
    };

    renderIntro();
}
