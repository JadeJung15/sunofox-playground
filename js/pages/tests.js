import { UserState, addPoints, postEconomyAction } from '../auth.js?v=8.5.2';
import { ITEM_VALUES } from '../constants/shops.js';
import { copyLink, saveAsStoryImage } from '../share.js?v=8.5.2';
import { TESTS } from '../tests-data.js?v=8.5.2';
import { renderBadge, renderButton, renderChip, renderSectionHeader, renderStatCard } from '../ui/components.js?v=8.5.2';
import { renderTestCard } from './home.js?v=8.5.2';

function getShareUrl(testId) {
    if (testId === 'p39') return `${window.location.origin}/share/p39`;
    return `${window.location.origin}/?test=${testId}`;
}

function scrollTestViewToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getProgressStats(traitScores, traits) {
    const maxScore = 14;
    return traits.slice(0, 4).map((trait) => ({
        key: trait,
        label: trait,
        value: Math.min(Math.round(((traitScores[trait] || 0) / maxScore) * 100), 100)
    }));
}

function getResultData(test, traitScores) {
    const traits = test.customTraits || ['energy', 'logic', 'empathy', 'creativity'];
    const dominantTrait = traits.reduce((a, b) => ((traitScores[a] || 0) >= (traitScores[b] || 0) ? a : b));
    const fallbackKey = traitScores.energy >= 4 ? 'A' : 'B';
    const result = test.results[dominantTrait] || test.results[fallbackKey] || Object.values(test.results)[0];
    return { traits, dominantTrait, result };
}

function getAnalysisIngredients(dominantTrait) {
    const ingredientPool = {
        energy: [
            { title: '즉시 실행력', desc: '생각보다 행동이 먼저 나가는 추진력' },
            { title: '분위기 리드', desc: '공간의 텐션을 끌어올리는 힘' },
            { title: '회복 탄성', desc: '지쳐도 다시 시작하는 반등력' }
        ],
        logic: [
            { title: '패턴 분석', desc: '정보를 구조화해서 보는 시선' },
            { title: '상황 분리', desc: '감정과 사실을 나눠 보는 힘' },
            { title: '판단 정밀도', desc: '결정을 늦추더라도 정확히 고르는 감각' }
        ],
        empathy: [
            { title: '정서 감지', desc: '상대의 상태를 빠르게 읽는 능력' },
            { title: '관계 완충', desc: '갈등을 부드럽게 완화하는 힘' },
            { title: '온도 유지', desc: '차갑지 않게 대화를 이어가는 감각' }
        ],
        creativity: [
            { title: '시선 전환', desc: '정답이 아닌 다른 해석을 찾는 힘' },
            { title: '아이디어 점프', desc: '연결되지 않던 것을 묶는 사고' },
            { title: '캐릭터 감도', desc: '평범한 것을 다르게 보이게 하는 센스' }
        ]
    };

    const weaponPool = {
        energy: { weapon: '즉시 실행', weakness: '과속 판단' },
        logic: { weapon: '구조화 사고', weakness: '감정 표현 지연' },
        empathy: { weapon: '관계 감각', weakness: '과몰입 피로' },
        creativity: { weapon: '새로운 해석', weakness: '루틴 유지 피로' }
    };

    const normalized = ingredientPool[dominantTrait] ? dominantTrait : 'energy';
    return {
        ingredients: ingredientPool[normalized],
        weapon: weaponPool[normalized]
    };
}

async function rewardResult(dominantTrait) {
    const { getPetBuff } = await import('../auth.js?v=8.5.2');
    const petBuff = getPetBuff();

    let basePointReward = 10 + petBuff.testBonus;
    if (UserState.user && UserState.data.boosterCount > 0) {
        basePointReward = (10 * 2) + petBuff.testBonus;
        await postEconomyAction('consumeBooster', { amount: 1 });
        UserState.data.boosterCount -= 1;
    }

    basePointReward = Math.floor(basePointReward * petBuff.multiplier);

    let rewardedItem = null;
    if (UserState.user) {
        const traitItems = {
            energy: '⚡ 번개 병',
            logic: '🧪 현자의 돌',
            empathy: '🌱 묘목',
            creativity: '🌌 은하수 가루'
        };
        const commonItems = ['⚡ 번개 병', '🧪 현자의 돌', '🌱 묘목', '🌌 은하수 가루', '🦊 여우 꼬리'];
        rewardedItem = traitItems[dominantTrait] || commonItems[Math.floor(Math.random() * commonItems.length)];
        const itemVal = ITEM_VALUES[rewardedItem] || 500;

        await postEconomyAction('grantItems', { items: [rewardedItem] });
        UserState.data.inventory.push(rewardedItem);
        UserState.data.totalScore = (UserState.data.totalScore || 0) + itemVal;
        UserState.data.discoveredItems = [...new Set([...(UserState.data.discoveredItems || []), rewardedItem])];
        await addPoints(basePointReward, '분석 완료 보상');
        window.checkDailyQuests?.('test');
    }

    return { basePointReward, rewardedItem };
}

export async function renderResult(testId, traitScores) {
    const app = document.getElementById('app');
    const test = TESTS.find((entry) => entry.id === testId);
    if (!test) return;

    const { traits, dominantTrait, result } = getResultData(test, traitScores);
    const { ingredients, weapon } = getAnalysisIngredients(dominantTrait);
    const progressStats = getProgressStats(traitScores, traits);
    const themeColor = result.color || '#2563eb';
    const recommendedTests = TESTS.filter((entry) => entry.id !== testId).sort(() => 0.5 - Math.random()).slice(0, 3);
    const surpriseTest = recommendedTests[0];
    const tags = result.tags || [];
    const reward = await rewardResult(dominantTrait);

    app.innerHTML = `
        <div class="site-page fade-in test-report-page" style="--report-accent:${themeColor};">
            <section class="ui-surface report-hero">
                <div class="report-hero__media">
                    <img src="${result.img || test.thumb}" alt="${result.title}" loading="lazy">
                </div>
                <div class="report-hero__content">
                    <div class="report-hero__eyebrow">
                        ${renderBadge('Result', 'accent')}
                        ${renderBadge(test.category, 'soft')}
                    </div>
                    <h1 class="page-title">${result.title}</h1>
                    <p class="page-copy">${result.desc}</p>
                    <div class="report-chip-row">
                        ${tags.map((tag) => renderChip(tag, 'soft')).join('')}
                    </div>
                    <div class="report-action-row">
                        ${renderButton({ label: '테스트 공유', variant: 'primary', tag: 'button', attrs: 'type="button" id="result-share-btn"' })}
                        ${renderButton({ label: '이미지 저장', variant: 'secondary', tag: 'button', attrs: 'type="button" id="save-story-btn"' })}
                        ${renderButton({ label: '다른 테스트', variant: 'ghost', tag: 'button', attrs: `type="button" id="result-random-test-btn"${surpriseTest ? '' : ' disabled'}` })}
                    </div>
                </div>
            </section>

            <section class="ui-grid ui-grid--2 report-grid">
                <article class="ui-surface ui-panel">
                    ${renderSectionHeader({
                        eyebrow: 'Summary',
                        title: '이번 결과에서 강하게 드러난 성향',
                        description: '답변 패턴을 기준으로 핵심 특징만 요약했습니다.'
                    })}
                    <div class="report-ingredient-list">
                        ${ingredients.map((entry, index) => `
                            <div class="report-ingredient-item">
                                <strong>0${index + 1}. ${entry.title}</strong>
                                <p>${entry.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div class="report-weapon-grid">
                        <div class="report-weapon-card">
                            <small>강점</small>
                            <strong>${weapon.weapon}</strong>
                        </div>
                        <div class="report-weapon-card">
                            <small>주의 포인트</small>
                            <strong>${weapon.weakness}</strong>
                        </div>
                    </div>
                </article>

                <aside class="ui-surface ui-panel">
                    ${renderSectionHeader({
                        eyebrow: 'Reward',
                        title: '완료 보상',
                        description: '결과 확인과 동시에 적립된 보상입니다.'
                    })}
                    <div class="report-reward-box">
                        <strong>${reward.rewardedItem || `${reward.basePointReward}P`}</strong>
                        <p>테스트 완료 보상이 적용되었습니다.</p>
                    </div>
                    <div class="ui-grid">
                        ${progressStats.map((stat) => renderStatCard({
                            label: stat.label.toUpperCase(),
                            value: `${stat.value}%`,
                            caption: 'response mix'
                        })).join('')}
                    </div>
                    ${renderButton({
                        label: '홈으로 돌아가기',
                        variant: 'secondary',
                        tag: 'button',
                        attrs: "type=\"button\" onclick=\"location.hash='#home'\""
                    })}
                </aside>
            </section>

            <section class="ui-surface ui-panel">
                ${renderSectionHeader({
                    eyebrow: 'More',
                    title: '이어서 하기 좋은 테스트',
                    description: '현재 결과와 결이 비슷한 다른 테스트를 추천합니다.'
                })}
                <div class="test-grid">
                    ${recommendedTests.map((entry) => renderTestCard(entry)).join('')}
                </div>
            </section>

            <div id="story-capture-area" class="story-capture-sheet" aria-hidden="true">
                <div class="story-capture-sheet__inner">
                    <div class="story-capture-sheet__media">
                        <img src="${result.img || test.thumb}" alt="">
                    </div>
                    <div class="story-capture-sheet__body">
                        <div class="story-capture-sheet__top">
                            <span>SEVENCHECK REPORT</span>
                            <strong>${test.category}</strong>
                        </div>
                        <h2>${result.title}</h2>
                        <p>${result.desc}</p>
                        <div class="report-chip-row">
                            ${tags.slice(0, 3).map((tag) => renderChip(tag, 'soft')).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('result-share-btn')?.addEventListener('click', async () => {
        const testUrl = getShareUrl(testId);
        const shareText = `[${test.title}] 당신도 한번 도전해보세요.`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'SevenCheck 심리분석', text: shareText, url: testUrl });
                await addPoints(30, '테스트 추천 보상');
            } catch (error) {
                console.error(error);
            }
        } else {
            await copyLink(testUrl);
        }
    });

    document.getElementById('save-story-btn')?.addEventListener('click', async (event) => {
        const button = event.currentTarget;
        button.disabled = true;
        button.textContent = '이미지 생성 중';
        const success = await saveAsStoryImage('story-capture-area', `7Check_${testId}.png`);
        if (success) alert('공유용 리포트 이미지가 저장되었습니다.');
        button.disabled = false;
        button.textContent = '이미지 저장';
    });

    if (surpriseTest) {
        document.getElementById('result-random-test-btn')?.addEventListener('click', () => {
            location.hash = `#test/${surpriseTest.id}`;
        });
    }
}

function getQuestionValue(test, option) {
    if (option.scores) {
        return option.scores;
    }
    if (option.type) {
        if (test.customTraits && test.customTraits.includes(option.type)) {
            return { [option.type]: 1 };
        }
        return option.type === 'A' ? { energy: 2 } : { empathy: 2 };
    }
    return {};
}

export function renderTestExecution(testId) {
    const app = document.getElementById('app');
    const test = TESTS.find((entry) => entry.id === testId);
    if (!test) return;

    const traits = test.customTraits || ['energy', 'logic', 'empathy', 'creativity'];
    const traitScores = {};
    traits.forEach((trait) => {
        traitScores[trait] = 0;
    });

    let step = -1;
    const introSurpriseTest = TESTS.filter((entry) => entry.id !== testId).sort(() => 0.5 - Math.random())[0];

    const renderIntro = () => {
        app.innerHTML = `
            <div class="site-page fade-in test-runner-page">
                <section class="ui-surface test-intro-hero">
                    <div class="test-intro-hero__media">
                        <img src="${test.thumb || test.results?.A?.img || ''}" alt="${test.title}" loading="lazy">
                    </div>
                    <div class="test-intro-hero__content">
                        <div class="report-hero__eyebrow">
                            ${renderBadge('Test', 'accent')}
                            ${renderBadge(test.category, 'soft')}
                        </div>
                        <h1 class="page-title">${test.title}</h1>
                        <p class="page-copy">${test.desc}</p>
                        <div class="report-chip-row">
                            ${renderChip(`${test.questions.length} questions`, 'soft')}
                            ${renderChip('result report', 'soft')}
                            ${renderChip('share ready', 'soft')}
                        </div>
                        <div class="report-action-row">
                            ${renderButton({ label: '분석 시작', variant: 'primary', tag: 'button', attrs: 'type="button" id="test-start-btn"' })}
                            ${renderButton({ label: '공유하기', variant: 'secondary', tag: 'button', attrs: 'type="button" id="test-share-btn"' })}
                            ${renderButton({ label: '다른 추천', variant: 'ghost', tag: 'button', attrs: 'type="button" id="test-surprise-btn"' })}
                        </div>
                    </div>
                </section>

                <section class="ui-grid ui-grid--3">
                    ${renderStatCard({ label: 'Flow', value: `${test.questions.length}`, caption: '7문항 중심' })}
                    ${renderStatCard({ label: 'Format', value: '2-4', caption: '선택지 기반' })}
                    ${renderStatCard({ label: 'Output', value: '1 report', caption: '결과 카드 제공' })}
                </section>
            </div>
        `;

        document.getElementById('test-start-btn')?.addEventListener('click', () => {
            step = 0;
            renderQuestion();
        });

        document.getElementById('test-share-btn')?.addEventListener('click', async () => {
            const siteUrl = getShareUrl(testId);
            if (navigator.share) {
                try {
                    await navigator.share({ title: `7Check - ${test.title}`, text: test.desc, url: siteUrl });
                    await addPoints(30, '테스트 공유 보상');
                } catch (error) {
                    console.error(error);
                }
            } else {
                await copyLink(siteUrl);
            }
        });

        document.getElementById('test-surprise-btn')?.addEventListener('click', () => {
            if (introSurpriseTest) location.hash = `#test/${introSurpriseTest.id}`;
        });
    };

    const renderQuestion = () => {
        if (step >= test.questions.length) {
            renderLoading();
            return;
        }

        const question = test.questions[step];
        const progress = Math.round((step / test.questions.length) * 100);

        app.innerHTML = `
            <div class="site-page fade-in test-runner-page">
                <section class="ui-surface ui-panel test-question-panel">
                    <div class="test-question-panel__top">
                        <div class="ui-stack ui-stack--xs">
                            ${renderBadge(`Question ${step + 1}`, 'accent')}
                            <h1 class="page-title">${question.q}</h1>
                            <p class="page-copy">${step + 1} / ${test.questions.length} 진행 중</p>
                        </div>
                        <div class="test-progress-shell" aria-label="진행률">
                            <div class="test-progress-shell__bar" style="width:${progress}%;"></div>
                        </div>
                    </div>
                    <div class="test-answer-grid">
                        ${question.options.map((option, index) => `
                            <button class="test-answer-card" type="button" data-index="${index}">
                                <span class="test-answer-card__index">0${index + 1}</span>
                                <strong>${option.text}</strong>
                            </button>
                        `).join('')}
                    </div>
                </section>
            </div>
        `;

        scrollTestViewToTop();

        app.querySelectorAll('.test-answer-card').forEach((button) => {
            button.addEventListener('click', () => {
                const index = Number(button.dataset.index);
                const value = getQuestionValue(test, question.options[index]);
                Object.entries(value).forEach(([key, amount]) => {
                    traitScores[key] = (traitScores[key] || 0) + amount;
                });
                step += 1;
                renderQuestion();
            });
        });
    };

    const renderLoading = () => {
        app.innerHTML = `
            <div class="site-page fade-in test-loading-page">
                <section class="ui-surface ui-panel test-loading-card">
                    ${renderBadge('Processing', 'accent')}
                    <h1 class="page-title">결과 리포트를 생성하고 있습니다.</h1>
                    <p class="page-copy">답변 패턴을 정리해 결과, 보상, 추천 테스트까지 한 번에 준비합니다.</p>
                    <div class="test-progress-shell" aria-hidden="true">
                        <div class="test-progress-shell__bar test-progress-shell__bar--animated"></div>
                    </div>
                </section>
            </div>
        `;
        setTimeout(() => renderResult(testId, traitScores), 1200);
    };

    renderIntro();
}
