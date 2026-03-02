import { UserState, addPoints, postEconomyAction } from '../auth.js?v=8.5.2';
import { ITEM_VALUES } from '../constants/shops.js';
import { copyLink, saveAsStoryImage } from '../share.js';
import { TESTS } from '../tests-data.js?v=8.5.2';
import { renderTestCard } from './home.js';
import { renderBadge, renderButton, renderCard, renderChip, renderSectionHeader } from '../ui/components.js?v=8.5.2';

function getShareUrl(testId) {
    if (testId === 'p39') return `${window.location.origin}/share/p39`;
    return `${window.location.origin}/?test=${testId}`;
}

function scrollTestViewToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getResultData(test, traitScores) {
    const traits = test.customTraits || ['energy', 'logic', 'empathy', 'creativity'];
    const dominantTrait = traits.reduce((a, b) => ((traitScores[a] || 0) >= (traitScores[b] || 0) ? a : b));
    const fallbackKey = (traitScores.energy || 0) >= 4 ? 'A' : 'B';
    const result = test.results[dominantTrait] || test.results[fallbackKey];

    return {
        dominantTrait,
        result,
        themeColor: result.color || '#1d4ed8',
        tags: result.tags || []
    };
}

async function grantResultReward(dominantTrait) {
    const { getPetBuff } = await import('../auth.js?v=8.5.2');
    const petBuff = getPetBuff();

    let pointReward = 10 + petBuff.testBonus;
    if (UserState.user && UserState.data.boosterCount > 0) {
        pointReward = 20 + petBuff.testBonus;
        await postEconomyAction('consumeBooster', { amount: 1 });
        UserState.data.boosterCount -= 1;
    }
    pointReward = Math.floor(pointReward * petBuff.multiplier);

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
        await addPoints(pointReward, '분석 완료 보상');
        window.checkDailyQuests?.('test');
    }

    return { pointReward, rewardedItem };
}

export async function renderResult(testId, traitScores) {
    const app = document.getElementById('app');
    const test = TESTS.find((item) => item.id === testId);
    if (!test) return;

    const { dominantTrait, result, themeColor, tags } = getResultData(test, traitScores);
    const recommendedTests = TESTS.filter((item) => item.id !== testId).sort(() => 0.5 - Math.random()).slice(0, 3);
    const { pointReward, rewardedItem } = await grantResultReward(dominantTrait);

    app.innerHTML = `
        <section class="simple-page fade-in">
            <div class="result-shell" style="--result-accent:${themeColor};">
                <div class="result-shell__hero">
                    ${renderBadge(test.category, 'muted')}
                    <h1>${result.title}</h1>
                    <p>${result.desc}</p>
                    <div class="result-shell__chips">
                        ${tags.map((tag) => renderChip(tag, 'accent')).join('')}
                    </div>
                </div>

                <div class="result-shell__grid">
                    ${renderCard({
                        eyebrow: 'SUMMARY',
                        title: '결과 요약',
                        description: result.desc,
                        className: 'result-panel'
                    })}
                    ${renderCard({
                        eyebrow: 'REWARD',
                        title: rewardedItem || `${pointReward}P 획득`,
                        description: rewardedItem ? '아이템이 인벤토리에 추가되었습니다.' : '포인트 보상이 지급되었습니다.',
                        className: 'result-panel'
                    })}
                </div>

                <div class="result-actions">
                    ${renderButton({ label: '결과 공유', attrs: 'id="result-share-btn"' })}
                    ${renderButton({ label: '이미지 저장', variant: 'secondary', attrs: 'id="save-story-btn"' })}
                    ${renderButton({ label: '홈으로', variant: 'ghost', attrs: `onclick="location.hash='#home'"` })}
                </div>

                <section class="result-recommend">
                    ${renderSectionHeader({
                        eyebrow: 'NEXT',
                        title: '다른 테스트 이어서 하기',
                        description: '흐름은 유지하고 화면만 단순하게 다시 구성했습니다.'
                    })}
                    <div class="test-grid-simple">
                        ${recommendedTests.map((item) => renderTestCard(item)).join('')}
                    </div>
                </section>
            </div>

            <div id="story-capture-area" class="story-capture-card" style="--result-accent:${themeColor};">
                <span>${test.title}</span>
                <strong>${result.title}</strong>
                <p>${result.desc}</p>
            </div>
        </section>
    `;

    const resultShareBtn = document.getElementById('result-share-btn');
    if (resultShareBtn) {
        resultShareBtn.onclick = async () => {
            const testUrl = getShareUrl(testId);
            const shareText = `[${test.title}] 당신도 한번 도전해보세요.`;

            if (navigator.share) {
                try {
                    await navigator.share({ title: 'SevenCheck 심리테스트', text: shareText, url: testUrl });
                    await addPoints(30, '테스트 추천 보상');
                } catch (error) {
                    console.error(error);
                }
            } else {
                await copyLink(testUrl);
            }
        };
    }

    const storyBtn = document.getElementById('save-story-btn');
    if (storyBtn) {
        storyBtn.onclick = async () => {
            storyBtn.disabled = true;
            storyBtn.textContent = '이미지 생성 중...';
            const success = await saveAsStoryImage('story-capture-area', `7Check_${testId}.png`);
            if (success) {
                alert('공유용 이미지를 저장했습니다.');
            }
            storyBtn.disabled = false;
            storyBtn.textContent = '이미지 저장';
        };
    }
}

export function renderTestExecution(testId) {
    const app = document.getElementById('app');
    const test = TESTS.find((item) => item.id === testId);
    if (!test) return;

    let step = -1;
    const traits = test.customTraits || ['energy', 'logic', 'empathy', 'creativity'];
    const traitScores = Object.fromEntries(traits.map((trait) => [trait, 0]));

    const renderIntro = () => {
        app.innerHTML = `
            <section class="simple-page fade-in">
                <div class="test-flow">
                    <div class="test-intro-card">
                        ${renderBadge(test.category, 'muted')}
                        <h1>${test.title}</h1>
                        <p>${test.desc}</p>
                        <div class="test-intro-meta">
                            ${renderChip(`${test.questions.length}문항`, 'accent')}
                            ${renderChip('모바일 우선', 'muted')}
                            ${renderChip('결과 공유 가능', 'muted')}
                        </div>
                        <div class="test-intro-actions">
                            ${renderButton({ label: '시작하기', attrs: 'id="test-start-btn"' })}
                            ${renderButton({ label: '공유하기', variant: 'secondary', attrs: 'id="test-share-btn"' })}
                        </div>
                    </div>
                </div>
            </section>
        `;

        document.getElementById('test-start-btn')?.addEventListener('click', () => {
            step = 0;
            updateStep();
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
    };

    const updateStep = () => {
        if (step >= test.questions.length) {
            renderLoading();
            return;
        }

        const question = test.questions[step];
        const progress = Math.round(((step + 1) / test.questions.length) * 100);

        app.innerHTML = `
            <section class="simple-page fade-in">
                <div class="test-flow">
                    <div class="test-progress-box">
                        <div class="test-progress-box__meta">
                            <span>${step + 1} / ${test.questions.length}</span>
                            <strong>${progress}%</strong>
                        </div>
                        <div class="progress-track-simple">
                            <div class="progress-track-simple__fill" style="width:${progress}%"></div>
                        </div>
                    </div>

                    <div class="question-card">
                        ${renderBadge(test.category, 'accent')}
                        <h2>${question.q}</h2>
                        <div class="question-options">
                            ${question.options.map((option, index) => `
                                <button class="question-option" data-index="${index}">
                                    <span>${index + 1}</span>
                                    <strong>${option.text}</strong>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </section>
        `;

        document.querySelectorAll('.question-option').forEach((button) => {
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
                scrollTestViewToTop();
                updateStep();
            });
        });
    };

    const renderLoading = () => {
        app.innerHTML = `
            <section class="simple-page fade-in">
                <div class="loading-card">
                    <div class="loading-card__dot"></div>
                    <h2>결과를 정리하는 중입니다</h2>
                    <p>답변을 바탕으로 최종 결과를 만들고 있습니다.</p>
                </div>
            </section>
        `;

        setTimeout(() => renderResult(testId, traitScores), 1400);
    };

    renderIntro();
}
