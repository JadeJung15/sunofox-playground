// =================================================================
// 상점 & 아이템 상수 (모든 상수 데이터를 한 곳에 모음)
// =================================================================

// ── 이모지 상점 ──────────────────────────────────────────────────
export const EMOJI_SHOP = {
    '귀여운 동물': { '🐱': 200, '🐶': 200, '🦊': 300, '🐰': 300, '🐼': 500, '🐨': 500, '🐹': 400, '🐣': 400, '🐧': 500 },
    '강력한 야수': { '🐯': 800, '🦁': 800, '🐺': 1000, '🐲': 2500, '🦖': 2000, '🦈': 1500 },
    '자연 & 날씨': { '🌸': 300, '🌻': 300, '🍀': 400, '☀️': 500, '🌙': 500, '🌈': 1000, '🔥': 1000, '🌌': 2000 },
    '스페셜 프리미엄': { '✨': 3000, '👑': 5000, '💎': 10000, '⚡': 4000, '🧿': 5000 }
};

// ── 닉네임 색상 상점 ─────────────────────────────────────────────
export const COLOR_SHOP = {
    '기본': '#333333',
    '네이비': '#1e293b',
    '로얄 블루': '#3b82f6',
    '바이올렛': '#8b5cf6',
    '에메랄드': '#10b981',
    '골드': '#f59e0b',
    '선셋': '#f97316',
    '로즈': '#f43f5e',
    '핑크': '#ec4899',
    '스카이': '#0ea5e9'
};

// ── 아이템 등급 & 가치 ───────────────────────────────────────────
export const ITEM_VALUES = {
    // COMMON
    '💩 돌멩이': 1, '💊 물약': 30, '🌱 묘목': 50, '🦴 뼛조각': 10, '🪵 나뭇가지': 15, '🐚 조개껍데기': 20,
    // UNCOMMON
    '🥉 동메달': 300, '🥈 은메달': 500, '🌳 일반 나무': 400, '⚔️ 녹슨 칼': 350, '🛡️ 낡은 방패': 450, '🏹 연습용 활': 380,
    // RARE
    '🥇 금메달': 3000, '🍀 행운의 클로버': 5000, '🌲 전나무': 4000, '🍎 사과나무': 4500, '🔮 신비한 수정': 5500, '🗝️ 황금 열쇠': 6000, '📖 마법 서적': 7000, '🏺 고대 유물': 8000,
    // LEGENDARY
    '💎 다이아몬드': 30000, '🧪 현자의 돌': 60000, '🧬 인공 생명체': 100000, '⚡ 번개 병': 45000, '🌌 은하수 가루': 200000, '✨ 생명의 나무': 80000, '👑 제왕의 왕관': 150000, '🗡️ 엑스칼리버': 250000, '🐉 용의 심장': 500000, '🪐 성운의 조각': 1000000
};

export const ITEM_GRADES = {
    'COMMON':    ['💩 돌멩이', '💊 물약', '🌱 묘목', '🦴 뼛조각', '🪵 나뭇가지', '🐚 조개껍데기'],
    'UNCOMMON':  ['🥉 동메달', '🥈 은메달', '🌳 일반 나무', '⚔️ 녹슨 칼', '🛡️ 낡은 방패', '🏹 연습용 활'],
    'RARE':      ['🥇 금메달', '🍀 행운의 클로버', '🌲 전나무', '🍎 사과나무', '🔮 신비한 수정', '🗝️ 황금 열쇠', '📖 마법 서적', '🏺 고대 유물'],
    'LEGENDARY': ['💎 다이아몬드', '🧪 현자의 돌', '🧬 인공 생명체', '⚡ 번개 병', '🌌 은하수 가루', '✨ 생명의 나무', '👑 제왕의 왕관', '🗡️ 엑스칼리버', '🐉 용의 심장', '🪐 성운의 조각']
};

export function getGrade(itemName) {
    for (const [grade, items] of Object.entries(ITEM_GRADES)) {
        if (items.includes(itemName)) return grade;
    }
    return 'COMMON';
}

// ── 티어 ─────────────────────────────────────────────────────────
export const TIERS = [
    { name: 'ROOKIE',   min: 0,        class: 'tier-rookie' },
    { name: 'BRONZE',   min: 100000,   class: 'tier-bronze' },
    { name: 'SILVER',   min: 500000,   class: 'tier-silver' },
    { name: 'GOLD',     min: 1500000,  class: 'tier-gold' },
    { name: 'PLATINUM', min: 5000000,  class: 'tier-platinum' },
    { name: 'DIAMOND',  min: 10000000, class: 'tier-diamond' }
];

export function getTier(score) {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (score >= TIERS[i].min) return TIERS[i];
    }
    return TIERS[0];
}

// ── 오라 상점 ────────────────────────────────────────────────────
export const AURA_SHOP = {
    'PLATINUM': { name: '플래티넘 오라', price: 5000,  minScore: 5000000,  class: 'aura-platinum' },
    'DIAMOND':  { name: '다이아몬드 오라', price: 15000, minScore: 10000000, class: 'aura-diamond' }
};

// ── 테두리 상점 ──────────────────────────────────────────────────
export const BORDER_SHOP = {
    'B_RED':    { name: '레드 보더',    price: 1000,  minScore: 0,        class: 'border-red' },
    'B_BLUE':   { name: '블루 보더',    price: 1000,  minScore: 0,        class: 'border-blue' },
    'B_GREEN':  { name: '그린 보더',    price: 1000,  minScore: 0,        class: 'border-green' },
    'B_YELLOW': { name: '옐로우 보더',  price: 1000,  minScore: 0,        class: 'border-yellow' },
    'B_PURPLE': { name: '퍼플 보더',    price: 1000,  minScore: 0,        class: 'border-purple' },
    'B_PINK':   { name: '핑크 보더',    price: 1000,  minScore: 0,        class: 'border-pink' },
    'B_ORANGE': { name: '오렌지 보더',  price: 1000,  minScore: 0,        class: 'border-orange' },
    'B_CYAN':   { name: '시안 보더',    price: 1000,  minScore: 0,        class: 'border-cyan' },
    'B_GRAY':   { name: '그레이 보더',  price: 1000,  minScore: 0,        class: 'border-gray' },
    'B_BLACK':  { name: '블랙 보더',    price: 1000,  minScore: 0,        class: 'border-black' },
    'S_LEGEND': { name: '🔱 전설의 증표', price: 30000, minScore: 5000000,  class: 'border-s-legend' },
    'S_GALAXY': { name: '🌌 은하의 파동', price: 50000, minScore: 8000000,  class: 'border-s-galaxy' },
    'S_GOD':    { name: '💎 신의 광채',  price: 100000, minScore: 15000000, class: 'border-s-god' }
};

// ── 배경 상점 ────────────────────────────────────────────────────
export const BACKGROUND_SHOP = {
    'BG_SOFT_RED':    { name: '소프트 레드',    price: 1500,  minScore: 0,        class: 'bg-soft-red' },
    'BG_SOFT_BLUE':   { name: '소프트 블루',    price: 1500,  minScore: 0,        class: 'bg-soft-blue' },
    'BG_SOFT_GREEN':  { name: '소프트 그린',    price: 1500,  minScore: 0,        class: 'bg-soft-green' },
    'BG_SOFT_YELLOW': { name: '소프트 옐로우',  price: 1500,  minScore: 0,        class: 'bg-soft-yellow' },
    'BG_SOFT_PURPLE': { name: '소프트 퍼플',    price: 1500,  minScore: 0,        class: 'bg-soft-purple' },
    'BG_SOFT_PINK':   { name: '소프트 핑크',    price: 1500,  minScore: 0,        class: 'bg-soft-pink' },
    'BG_DARK_GRAY':   { name: '다크 그레이',    price: 1500,  minScore: 0,        class: 'bg-dark-gray' },
    'BG_MINT':        { name: '민트 프레쉬',    price: 1500,  minScore: 0,        class: 'bg-mint' },
    'BG_SKY':         { name: '스카이 블루',    price: 1500,  minScore: 0,        class: 'bg-sky' },
    'BG_SAND':        { name: '샌드 베이지',    price: 1500,  minScore: 0,        class: 'bg-sand' },
    'SBG_NEON':       { name: '🎮 사이버 네온', price: 25000, minScore: 4000000,  class: 'bg-s-neon' },
    'SBG_SPACE':      { name: '🚀 심우주 탐사', price: 45000, minScore: 7000000,  class: 'bg-s-space' },
    'SBG_PARADISE':   { name: '🏝️ 무릉도원',   price: 80000, minScore: 12000000, class: 'bg-s-paradise' }
};

// ── 펫 상점 ──────────────────────────────────────────────────────
export const PET_SHOP = {
    'F_NORMAL':   { name: '복실 토끼',   emoji: '🐰', grade: 'NORMAL',    price: 1000,  effect: '테스트 +1P / 출석 +10P' },
    'F_WHITE':    { name: '솜사탕 고양이', emoji: '🐱', grade: 'RARE',      price: 5000,  effect: '채굴 +2P / 출석 +20P' },
    'F_FIRE':     { name: '해피 강아지', emoji: '🐶', grade: 'RARE',      price: 5000,  effect: '채굴 +4P / 테스트 +2P' },
    'F_SHADOW':   { name: '말랑 판다',   emoji: '🐼', grade: 'EPIC',      price: 15000, effect: '테스트 +6P / 채굴 +1P' },
    'F_AURORA':   { name: '무지개 유니콘', emoji: '🦄', grade: 'EPIC',      price: 15000, effect: '테스트 +4P / 출석 +40P' },
    'F_CELESTIAL':{ name: '전설의 여우', emoji: '🦊', grade: 'LEGENDARY', price: 50000, effect: '모든 보상 +15% / 출석 +50P' }
};
