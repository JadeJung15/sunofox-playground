export function copyLink(url = window.location.href) {
    navigator.clipboard.writeText(url).then(() => {
        alert("링크가 복사되었습니다! 친구들에게 공유해보세요.");
    }).catch(err => {
        console.error('Copy failed', err);
        alert("복사에 실패했습니다.");
    });
}

export function shareTest(testId, title) {
    const url = `${window.location.origin}/#test/${testId}`;
    if (navigator.share) {
        navigator.share({
            title: title,
            text: '이 테스트 한번 해볼래? 완전 신기해!',
            url: url
        }).catch(console.error);
    } else {
        copyLink(url);
    }
}
