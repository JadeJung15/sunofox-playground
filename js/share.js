import { addPoints } from './auth.js?v=8.3.1';

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

    // 기존 속성 백업
    const originalStyle = {
        position: element.style.position,
        opacity: element.style.opacity,
        zIndex: element.style.zIndex,
        top: element.style.top,
        left: element.style.left,
        pointerEvents: element.style.pointerEvents,
        display: element.style.display
    };

    try {
        // 캡처를 위해 요소를 강제로 화면 최상단에 보이게 처리 (사용자 눈에 아주 짧게 깜빡일 수 있음)
        // 화면 바깥으로 밀어내면 안 되고, 투명하게 해도 안 되므로 최상단에 불투명하게 덮습니다.
        element.style.position = 'fixed';
        element.style.top = '0';
        element.style.left = '0';
        element.style.zIndex = '999999';
        element.style.opacity = '1';
        element.style.pointerEvents = 'none'; // 클릭 방해 방지
        element.style.display = 'flex'; // 혹은 block 등 원래 display 속성

        // 이미지들이 로드될 때까지 대기
        const images = element.getElementsByTagName('img');
        const loadPromises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; // 에러나도 진행
            });
        });
        await Promise.all(loadPromises);
        
        // 렌더링 안정화를 위해 살짝 대기
        await new Promise(r => setTimeout(r, 150));

        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2, // 고해상도 유지
            backgroundColor: null,
            logging: false,
            allowTaint: true,
            width: element.offsetWidth,
            height: element.offsetHeight
        });
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 보상 지급
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
    } finally {
        // 캡처 성공 여부와 상관없이 무조건 원래 상태로 복구
        element.style.position = originalStyle.position;
        element.style.opacity = originalStyle.opacity;
        element.style.zIndex = originalStyle.zIndex;
        element.style.top = originalStyle.top;
        element.style.left = originalStyle.left;
        element.style.pointerEvents = originalStyle.pointerEvents;
        element.style.display = originalStyle.display;
    }
}
