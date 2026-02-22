import { addPoints } from './auth.js';

let lastShareTime = 0;

export async function copyLink(url = window.location.href) {
    try {
        await navigator.clipboard.writeText(url);
        alert("링크가 복사되었습니다! 친구들에게 공유해보세요.");
        
        // Reward 30 points for sharing (throttle 5 seconds)
        const now = Date.now();
        if (now - lastShareTime > 5000) {
            const success = await addPoints(30);
            if (success) lastShareTime = now;
        }
    } catch (err) {
        console.error('Copy failed', err);
        alert("복사에 실패했습니다.");
    }
}

export async function shareTest(testId, title) {
    const url = `${window.location.origin}/#test/${testId}`;
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: '이 테스트 한번 해볼래? 완전 신기해!',
                url: url
            });
            
            const now = Date.now();
            if (now - lastShareTime > 5000) {
                const success = await addPoints(30);
                if (success) lastShareTime = now;
            }
        } catch (e) {
            console.error(e);
        }
    } else {
        await copyLink(url);
    }
}
