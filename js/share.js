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

export async function saveAsStoryImage(elementId, fileName = '7Check_Result.png') {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2, // 고해상도
            backgroundColor: null
        });
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 보상 지급 (링크 공유와 동일한 로직)
        const now = Date.now();
        if (now - lastShareTime > 10000) {
            await addPoints(30, '이미지 저장 보상');
            lastShareTime = now;
        }
        return true;
    } catch (err) {
        console.error('Image save failed', err);
        alert('이미지 저장에 실패했습니다.');
        return false;
    }
}
