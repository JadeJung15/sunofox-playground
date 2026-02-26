/**
 * SevenCheck 배포 전 무결성 검사 스크립트 (Fixed)
 */
const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
    'index.html',
    'js/app.js',
    'js/auth.js',
    'js/board.js',
    'js/games.js',
    'js/arcade.js',
    'js/ranking.js',
    'js/share.js',
    'js/sound.js',
    'js/store.js',
    'js/firebase-init.js',
    'js/tests-data.js'
];

console.log("🔍 배포 전 무결성 검사 시작...");

let hasError = false;

// 1. 필수 파일 존재 확인
REQUIRED_FILES.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ 파일 누락: ${file}`);
        hasError = true;
    } else {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
            console.error(`❌ 파일 내용 없음 (0 byte): ${file}`);
            hasError = true;
        }
    }
});

// 2. Git 충돌 표식 확인
REQUIRED_FILES.filter(f => f.endsWith('.js') || f.endsWith('.html')).forEach(file => {
    try {
        const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
        // 단순히 포함 여부가 아니라, 줄 시작 부분에 있는 실제 Git 충돌 표식 패턴을 확인
        const conflictRegex = /^(<<<<<<<|=======|>>>>>>>)($| )/m;
        if (conflictRegex.test(content)) {
            console.error(`❌ Git 충돌 표식 발견: ${file}`);
            hasError = true;
        }
    } catch (e) {}
});

if (hasError) {
    console.log("\n⚠️ 검사 실패: 문제가 발견되었습니다. 수정 후 다시 시도하세요.");
    process.exit(1);
} else {
    console.log("\n✅ 모든 검사 통과! 안전하게 배포할 수 있는 상태입니다.");
    process.exit(0);
}
