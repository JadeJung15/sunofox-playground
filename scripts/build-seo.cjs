const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../js/tests-data.js');
const content = fs.readFileSync(dataPath, 'utf-8');

const titleRegex = /title:\s*'([^']+)'/g;
const descRegex = /desc:\s*'([^']+)'/g;

let html = '<div class="seo-directory" style="padding: 2rem; max-width: 800px; margin: 0 auto; color: #475569; font-size: 0.9rem; line-height: 1.6; border-top: 1px solid #e2e8f0; margin-top: 2rem; background: #fff;">';
html += '<h2 style="color: #0f172a; font-size: 1.2rem; margin-bottom: 1rem;">SevenCheck 전체 심리테스트 및 분석 리포트 디렉토리</h2>';
html += '<p style="margin-bottom: 1.5rem;">SevenCheck에서 제공하는 모든 프리미엄 심리테스트와 분석 결과 유형의 상세 요약입니다. 각 테스트는 사용자에게 독창적인 가치와 깊이 있는 통찰을 제공합니다.</p><ul>';

let titleMatch;
while ((titleMatch = titleRegex.exec(content)) !== null) {
    const descMatch = descRegex.exec(content);
    if (descMatch) {
        html += `<li style="margin-bottom: 1rem; list-style: none; padding: 1rem; background: #f8fafc; border-radius: 8px;"><strong style="color: #334155; font-size: 1rem; display: block; margin-bottom: 0.3rem;">${titleMatch[1]}</strong><span>${descMatch[1]}</span></li>`;
    }
}
html += '</ul></div>';

const replaceSeo = (filePath) => {
    let fileHtml = fs.readFileSync(filePath, 'utf-8');
    
    const fallbackStart = '<!-- 콘텐츠 주입 전에 크롤러가 읽을 수 있는 기본 콘텐츠 (SEO 및 애드센스용) -->';
    const fallbackRegex = new RegExp(`${fallbackStart}[\\s\\S]*?<\\/div>`);
    if (fileHtml.includes(fallbackStart)) {
        fileHtml = fileHtml.replace(fallbackRegex, '');
    }

    const seoStart = '<!-- SEO_DIRECTORY_START -->';
    const seoEnd = '<!-- SEO_DIRECTORY_END -->';

    if (fileHtml.includes(seoStart)) {
        const regex = new RegExp(`${seoStart}[\\s\\S]*?${seoEnd}`);
        fileHtml = fileHtml.replace(regex, `${seoStart}\n${html}\n${seoEnd}`);
    } else {
        fileHtml = fileHtml.replace('</main>', `</main>\n    ${seoStart}\n${html}\n${seoEnd}`);
    }

    fs.writeFileSync(filePath, fileHtml, 'utf-8');
};

replaceSeo(path.join(__dirname, '../index.html'));
replaceSeo(path.join(__dirname, '../daily/index.html'));

console.log('SEO directory injected successfully.');
