/**
 * SevenCheck 배포 전 무결성 검사 스크립트
 */
const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
    'index.html',
    'js/app.js',
    'js/store.js',
    'js/test-handler.js',
    'js/profile-handler.js',
    'js/ui-utils.js',
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

// 2. JS 파일 기본 구문 체크 (간이 방식)
REQUIRED_FILES.filter(f => f.endsWith('.js')).forEach(file => {
    try {
        const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
        if (content.includes('<<<<<<<') || content.includes('=======') || content.includes('>>>>>>>')) {
            console.error(`❌ Git 충돌 표식 발견: ${file}`);
            hasError = true;
        }
    } catch (e) {
        hasError = true;
    }
});

if (hasError) {
    console.log("
⚠️ 검사 실패: 문제가 발견되었습니다. 수정 후 다시 시도하세요.");
    process.exit(1);
} else {
    console.log("
✅ 모든 검사 통과! 안전하게 배포할 수 있는 상태입니다.");
    process.exit(0);
}
