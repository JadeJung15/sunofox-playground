import { addPoints } from './auth.js';

let lastShareTime = 0;

export async function copyLink(url = window.location.href, silent = false) {
    try {
        await navigator.clipboard.writeText(url);
        if (!silent) alert("링크가 복사되었습니다! 친구들에게 공유해보세요.");
        
        // Reward 30 points for sharing (throttle 10 seconds)
        const now = Date.now();
        if (now - lastShareTime > 10000) {
            const success = await addPoints(30, '콘텐츠 공유 보상');
            if (success) {
                lastShareTime = now;
                return true;
            }
        }
    } catch (err) {
        console.error('Copy failed', err);
    }
    return false;
}

export async function shareResult(title, testId) {
    const url = `${window.location.origin}/#test/${testId}`;
    const shareText = `나의 결과는 [${title}]! 딱 7번의 질문으로 찾는 나의 본모습, SevenCheck에서 확인해보세요.`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'SevenCheck 심리분석 리포트',
                text: shareText,
                url: url
            });
            await copyLink(url, true); // 보상 지급을 위해 호출
            return true;
        } catch (e) {
            return await copyLink(url);
        }
    } else {
        return await copyLink(url);
    }
}
