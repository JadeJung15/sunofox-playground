import { updateUI, UserState, addPoints } from '../auth.js?v=8.5.2';
import { db } from '../firebase-init.js?v=8.5.2';
import { doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { TESTS } from '../tests-data.js?v=8.5.2';
import { renderBadge, renderButton, renderEmptyState, renderSectionHeader, renderStatCard } from '../ui/components.js?v=8.5.2';

export const testLikesData = {};

export async function fetchAllLikes() {
    if (Object.keys(testLikesData).length > 0) return;
    try {
        const snap = await getDocs(collection(db, 'testStats'));
        snap.forEach((entry) => {
            testLikesData[entry.id] = entry.data().likes || 0;
        });
    } catch (error) {
        console.error('Fetch likes failed:', error);
    }
}
window.fetchAllLikes = fetchAllLikes;

function getPlayCount(testId) {
    const seed = testId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (seed * 87) % 7000 + 800;
}

function formatCount(num) {
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return String(num);
}

function getDisplayLikeCount(testId) {
    const likes = testLikesData[testId] || 0;
    return likes + Math.floor(getPlayCount(testId) * 0.18);
}

async function handleLike(testId) {
    if (!UserState.user) {
        alert('로그인 후 사용할 수 있습니다.');
        return;
    }

    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
    const likeKey = `liked_${testId}_${today}`;
    if (localStorage.getItem(likeKey)) {
        alert('오늘은 이미 추천했습니다.');
        return;
    }

    try {
        await setDoc(doc(db, 'testStats', testId), { likes: increment(1) }, { merge: true });
        localStorage.setItem(likeKey, 'true');
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5, '테스트 추천 보상');
        const counter = document.getElementById(`like-count-${testId}`);
        if (counter) counter.textContent = formatCount(getDisplayLikeCount(testId));
    } catch (error) {
        console.error('Like operation failed:', error);
        alert('추천 처리 중 오류가 발생했습니다.');
    }
}
window.handleLike = handleLike;

export function renderTestCard(test) {
    return `
        <article class="test-card" onclick="location.hash='#test/${test.id}'" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();location.hash='#test/${test.id}';}" role="button" tabindex="0" aria-label="${test.title} 테스트 시작">
            <div class="test-card__header">
                <div class="ui-stack ui-stack--xs">
                    ${renderBadge(test.category, 'accent')}
                    <h3 class="test-card__title">${test.title}</h3>
                </div>
                <span class="test-card__metric">${formatCount(getPlayCount(test.id))} plays</span>
            </div>
            <p class="test-card__desc">${test.desc}</p>
            <div class="test-card__footer">
                <button class="test-card__like" type="button" onclick="event.stopPropagation(); handleLike('${test.id}')" aria-label="${test.title} 추천">
                    <span aria-hidden="true">♥</span>
                    <span id="like-count-${test.id}">${formatCount(getDisplayLikeCount(test.id))}</span>
                </button>
                <span class="test-card__action">시작</span>
            </div>
        </article>
    `;
}

export function renderCategorySelection() {
    const app = document.getElementById('app');
    const featured = TESTS.slice(0, 10);

    app.innerHTML = `
        <div class="site-page fade-in">
            <section class="ui-surface ui-panel">
                ${renderSectionHeader({
                    eyebrow: 'Tests',
                    title: '심리테스트 10선',
                    description: '부가 콘텐츠 없이 심리테스트 10개만 남긴 단순한 라이브러리입니다.',
                    meta: '10 tests'
                })}
                <label class="ui-stack ui-stack--xs" for="tests-search">
                    <span class="ui-section-meta">검색</span>
                    <input id="tests-search" class="search-field" type="search" placeholder="테스트 제목 검색" aria-label="테스트 검색">
                </label>
            </section>

            <section id="tests-search-grid" class="test-grid">
                ${featured.map((test) => renderTestCard(test)).join('')}
            </section>
        </div>
    `;

    const input = document.getElementById('tests-search');
    const grid = document.getElementById('tests-search-grid');
    if (!input || !grid) return;

    input.addEventListener('input', (event) => {
        const term = event.target.value.toLowerCase().trim();
        const filtered = TESTS.filter((test) => test.title.toLowerCase().includes(term) || test.category.toLowerCase().includes(term));
        grid.innerHTML = filtered.length
            ? filtered.map((test) => renderTestCard(test)).join('')
            : renderEmptyState({ title: '검색 결과가 없습니다.', description: '다른 키워드로 다시 찾아보세요.' });
    });
}

export async function renderHome() {
    const app = document.getElementById('app');
    await fetchAllLikes();
    const userName = UserState.user ? UserState.data?.nickname || '사용자' : '방문자';
    const featured = TESTS.slice(0, 3);

    app.innerHTML = `
        <div class="site-page fade-in">
            <section class="ui-surface ui-panel">
                ${renderSectionHeader({
                    eyebrow: 'Home',
                    title: `${userName}님을 위한 심리테스트 10선`,
                    description: '설명을 줄이고 선택만 빠르게 할 수 있도록 가장 단순한 구조로 정리했습니다.',
                    meta: 'Simple'
                })}
                <div class="ui-grid ui-grid--3">
                    ${renderStatCard({ label: 'TESTS', value: '10', caption: '전체 테스트 수' })}
                    ${renderStatCard({ label: 'FORMAT', value: '7', caption: '각 테스트 질문 수' })}
                    ${renderStatCard({ label: 'FLOW', value: 'FAST', caption: '바로 시작 가능' })}
                </div>
                <div class="report-action-row">
                    ${renderButton({ label: '테스트 전체 보기', variant: 'primary', tag: 'button', attrs: "type=\"button\" onclick=\"location.hash='#7check'\"" })}
                </div>
            </section>

            <section class="ui-surface ui-panel">
                ${renderSectionHeader({
                    eyebrow: 'Featured',
                    title: '바로 시작하기',
                    description: '가장 먼저 해보기 좋은 테스트 3개입니다.'
                })}
                <div class="test-grid">
                    ${featured.map((test) => renderTestCard(test)).join('')}
                </div>
            </section>
        </div>
    `;

    updateUI();
}
