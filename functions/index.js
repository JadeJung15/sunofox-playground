const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const WEEKLY_ARCADE_MILESTONES = {
  5: 150,
  12: 400,
  25: 1000
};

const SALARY_GAME_FIELDS = {
  tabShift: 'salaryGames.tabShift',
  inboxZero: 'salaryGames.inboxZero'
};

const ARCADE_STAT_KEYS = new Set([
  'mining',
  'gacha',
  'alchemy',
  'lottery',
  'betting',
  'checkin',
  'luckyDraw',
  'slot',
  'coinFlip',
  'timingRush',
  'bomb'
]);

const QUEST_TYPES = new Set(['login', 'test', 'board']);
const BOOSTER_PACK_COST = 100;
const BOOSTER_PACK_AMOUNT = 20;

const ITEM_VALUES = {
  '💩 돌멩이': 1,
  '💊 물약': 30,
  '🌱 묘목': 50,
  '🦴 뼛조각': 10,
  '🪵 나뭇가지': 15,
  '🐚 조개껍데기': 20,
  '🥉 동메달': 300,
  '🥈 은메달': 500,
  '🌳 일반 나무': 400,
  '⚔️ 녹슨 칼': 350,
  '🛡️ 낡은 방패': 450,
  '🏹 연습용 활': 380,
  '🥇 금메달': 3000,
  '🍀 행운의 클로버': 5000,
  '🌲 전나무': 4000,
  '🍎 사과나무': 4500,
  '🔮 신비한 수정': 5500,
  '🗝️ 황금 열쇠': 6000,
  '📖 마법 서적': 7000,
  '🏺 고대 유물': 8000,
  '💎 다이아몬드': 30000,
  '🧪 현자의 돌': 60000,
  '🧬 인공 생명체': 100000,
  '⚡ 번개 병': 45000,
  '🌌 은하수 가루': 200000,
  '✨ 생명의 나무': 80000,
  '👑 제왕의 왕관': 150000,
  '🗡️ 엑스칼리버': 250000,
  '🐉 용의 심장': 500000,
  '🪐 성운의 조각': 1000000,
  '🦊 여우 꼬리': 500
};

const EMOJI_PRICES = {
  '🐱': 200, '🐶': 200, '🦊': 300, '🐰': 300, '🐼': 500, '🐨': 500, '🐹': 400, '🐣': 400, '🐧': 500,
  '🐯': 800, '🦁': 800, '🐺': 1000, '🐲': 2500, '🦖': 2000, '🦈': 1500,
  '🌸': 300, '🌻': 300, '🍀': 400, '☀️': 500, '🌙': 500, '🌈': 1000, '🔥': 1000, '🌌': 2000,
  '✨': 3000, '👑': 5000, '💎': 10000, '⚡': 4000, '🧿': 5000
};

const ALLOWED_NAME_COLORS = new Set([
  '#333333', '#1e293b', '#3b82f6', '#8b5cf6', '#10b981',
  '#f59e0b', '#f97316', '#f43f5e', '#ec4899', '#0ea5e9'
]);

const PET_CONFIG = {
  F_NORMAL: { price: 1000 },
  F_WHITE: { price: 5000 },
  F_FIRE: { price: 5000 },
  F_SHADOW: { price: 15000 },
  F_AURORA: { price: 15000 },
  F_CELESTIAL: { price: 50000 }
};

const PROFILE_SHOP_CONFIG = {
  Aura: {
    activeKey: 'activeAura',
    unlockedKey: 'unlockedAuras',
    noneValue: 'NONE',
    items: {
      PLATINUM: { price: 5000, minScore: 5000000 },
      DIAMOND: { price: 15000, minScore: 10000000 }
    }
  },
  Border: {
    activeKey: 'activeBorder',
    unlockedKey: 'unlockedBorders',
    noneValue: 'NONE',
    items: {
      B_RED: { price: 1000, minScore: 0 },
      B_BLUE: { price: 1000, minScore: 0 },
      B_GREEN: { price: 1000, minScore: 0 },
      B_YELLOW: { price: 1000, minScore: 0 },
      B_PURPLE: { price: 1000, minScore: 0 },
      B_PINK: { price: 1000, minScore: 0 },
      B_ORANGE: { price: 1000, minScore: 0 },
      B_CYAN: { price: 1000, minScore: 0 },
      B_GRAY: { price: 1000, minScore: 0 },
      B_BLACK: { price: 1000, minScore: 0 },
      S_LEGEND: { price: 30000, minScore: 5000000 },
      S_GALAXY: { price: 50000, minScore: 8000000 },
      S_GOD: { price: 100000, minScore: 15000000 }
    }
  },
  Background: {
    activeKey: 'activeBackground',
    unlockedKey: 'unlockedBackgrounds',
    noneValue: 'NONE',
    items: {
      BG_SOFT_RED: { price: 1500, minScore: 0 },
      BG_SOFT_BLUE: { price: 1500, minScore: 0 },
      BG_SOFT_GREEN: { price: 1500, minScore: 0 },
      BG_SOFT_YELLOW: { price: 1500, minScore: 0 },
      BG_SOFT_PURPLE: { price: 1500, minScore: 0 },
      BG_SOFT_PINK: { price: 1500, minScore: 0 },
      BG_DARK_GRAY: { price: 1500, minScore: 0 },
      BG_MINT: { price: 1500, minScore: 0 },
      BG_SKY: { price: 1500, minScore: 0 },
      BG_SAND: { price: 1500, minScore: 0 },
      SBG_NEON: { price: 25000, minScore: 4000000 },
      SBG_SPACE: { price: 45000, minScore: 7000000 },
      SBG_PARADISE: { price: 80000, minScore: 12000000 }
    }
  }
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function getDateKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

function hashString(input) {
  let hash = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return hash >>> 0;
  };
}

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rand, items) {
  return items[Math.floor(rand() * items.length)];
}

function buildProbabilityResult(title, rand) {
  const value = Math.floor(rand() * 101);
  const band = value < 34 ? '낮음' : value < 68 ? '보통' : '높음';
  const comments = {
    낮음: ['오늘은 생각보다 멀쩡합니다.', '의외로 큰 사고는 안 낼 분위기예요.', '지금은 그냥 조용히 지나갈 확률이 큽니다.'],
    보통: ['반쯤은 괜찮고 반쯤은 위험합니다.', '입 열기 전에 한 번만 더 생각하세요.', '조심하면 무난하게 넘어갈 수 있어요.'],
    높음: ['오늘은 살짝 위험 신호입니다.', '지금 텐션이면 한 번쯤 터질 수 있어요.', '괜히 나서면 피곤해질 확률이 높습니다.']
  };

  return {
    template: 'probability',
    headline: `${value}%`,
    subline: band,
    comment: pick(rand, comments[band]),
    shareText: `${title} 결과 ${value}% · ${band} · ${pick(rand, comments[band])}`,
    accent: value < 34 ? '#10b981' : value < 68 ? '#f59e0b' : '#ef4444'
  };
}

function buildIndexResult(title, rand) {
  const useTenScale = rand() > 0.5;
  const max = useTenScale ? 10 : 100;
  const raw = useTenScale ? Math.max(1, Math.ceil(rand() * 10)) : Math.floor(rand() * 101);
  const ratio = raw / max;
  const tier = ratio < 0.26 ? 'EASY' : ratio < 0.51 ? 'NORMAL' : ratio < 0.76 ? 'HARD' : 'EXTREME';
  const comments = {
    EASY: ['아직은 버틸 만합니다.', '지금은 꽤 사람처럼 굴 수 있어요.', '오늘은 생각보다 평화로운 편입니다.'],
    NORMAL: ['그럭저럭 굴러가는 상태예요.', '지금부터 슬슬 피곤함이 올라옵니다.', '무난하지만 오래 버티진 못합니다.'],
    HARD: ['지금부터는 의지력이 필요합니다.', '슬슬 표정 관리가 어려워질 수 있어요.', '적당히 도망칠 구실을 찾는 게 좋습니다.'],
    EXTREME: ['오늘은 거의 한계치입니다.', '지금은 건드리면 폭주할 수 있어요.', '잠깐 숨는 게 최선일 수 있습니다.']
  };

  return {
    template: 'index',
    headline: useTenScale ? `${raw}/${max}` : `${raw}`,
    subline: tier,
    comment: pick(rand, comments[tier]),
    shareText: `${title} 결과 ${useTenScale ? `${raw}/${max}` : `${raw}점`} · ${tier} · ${pick(rand, comments[tier])}`,
    accent: ratio < 0.26 ? '#22c55e' : ratio < 0.51 ? '#3b82f6' : ratio < 0.76 ? '#f97316' : '#7c3aed'
  };
}

function buildGradeResult(title, rand) {
  const grades = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D'];
  const index = Math.min(grades.length - 1, Math.floor(rand() * grades.length));
  const grade = grades[index];
  const comments = {
    S: ['오늘은 주인공 모드입니다.', '이 정도면 꽤 잘 굴러갑니다.', '지금 상태, 생각보다 괜찮아요.'],
    'A+': ['오늘은 꽤 안정적입니다.', '사람들 사이에서도 무난히 통할 타입이에요.', '지금은 제법 호감형에 가깝습니다.'],
    A: ['전체적으로 나쁘지 않습니다.', '적당히 사람답게 버티는 중입니다.', '오늘은 평균 이상입니다.'],
    'B+': ['괜찮다가도 한 번씩 흔들립니다.', '방심하면 살짝 삐끗할 수 있어요.', '오늘은 무난과 피곤 사이입니다.'],
    B: ['평균은 치는데 여유는 없습니다.', '지금은 간신히 굴러가는 중이에요.', '딱 오늘만 버티자는 느낌입니다.'],
    'C+': ['살짝 예민해 보일 수 있습니다.', '오늘은 대충 넘어가는 게 답입니다.', '조용히 있는 편이 안전합니다.'],
    C: ['지금은 컨디션이 썩 좋지 않습니다.', '괜히 나서면 피곤해질 수 있어요.', '오늘은 혼자 있는 쪽이 낫습니다.'],
    D: ['오늘은 그냥 쉬는 게 맞습니다.', '지금은 거의 시스템 점검 상태예요.', '세상과 잠깐 거리 두는 편이 좋겠습니다.']
  };

  return {
    template: 'grade',
    headline: grade,
    subline: ['S', 'A+', 'A'].includes(grade) ? '오늘은 상위권' : ['B+', 'B'].includes(grade) ? '그럭저럭 버팀' : '조용히 숨기',
    comment: pick(rand, comments[grade]),
    shareText: `${title} 결과 ${grade} · ${pick(rand, comments[grade])}`,
    accent: ['S', 'A+', 'A'].includes(grade) ? '#0ea5e9' : ['B+', 'B'].includes(grade) ? '#f59e0b' : '#64748b'
  };
}

function buildResultPayload(title, type, seedKey) {
  const next = hashString(seedKey);
  const rand = mulberry32(next());

  if (type === 'probability') return buildProbabilityResult(title, rand);
  if (type === 'index') return buildIndexResult(title, rand);
  return buildGradeResult(title, rand);
}

async function verifyRequestUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    throw new HttpError(401, '로그인이 필요합니다.');
  }
  return admin.auth().verifyIdToken(token);
}

function isFiniteInt(value) {
  return Number.isInteger(value) && Number.isFinite(value);
}

function getRewardForScore(score) {
  return Math.max(15, Math.min(120, Math.floor(score / 12)));
}

function getItemValue(itemName) {
  return ITEM_VALUES[itemName] || 0;
}

function sanitizeInventory(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => String(item || '').trim())
    .filter((item) => item && ITEM_VALUES[item] !== undefined)
    .slice(0, 5000);
}

function recalcInventoryScore(items) {
  return items.reduce((sum, item) => sum + getItemValue(item), 0);
}

function sanitizeClaimedMilestones(items) {
  if (!Array.isArray(items)) return [];
  return [...new Set(items.map(Number).filter((value) => WEEKLY_ARCADE_MILESTONES[value]))].sort((a, b) => a - b);
}

function sanitizeNickname(value) {
  return String(value || '').trim().slice(0, 10);
}

function sanitizeBio(value) {
  return String(value || '').trim().slice(0, 50);
}

exports.economy = onRequest({ cors: true, region: 'asia-northeast3' }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const decoded = await verifyRequestUser(req);
    const uid = decoded.uid;
    const isAdmin = decoded.admin === true;
    const action = String(req.body?.action || '').trim();
    const payload = req.body?.payload || {};

    if (!action) {
      throw new HttpError(400, 'action이 필요합니다.');
    }

    if (action === 'adjustBalances') {
      const targetUid = String(payload.targetUid || uid).trim() || uid;
      const pointsDelta = Number(payload.pointsDelta || 0);
      const totalScoreDelta = Number(payload.totalScoreDelta || 0);
      const reason = String(payload.reason || '수동 조정').slice(0, 80);

      if (!isFiniteInt(pointsDelta) || !isFiniteInt(totalScoreDelta)) {
        throw new HttpError(400, '정수 delta만 허용됩니다.');
      }
      if (pointsDelta === 0 && totalScoreDelta === 0) {
        throw new HttpError(400, '변경값이 없습니다.');
      }
      if (Math.abs(pointsDelta) > 1000000 || Math.abs(totalScoreDelta) > 1000000) {
        throw new HttpError(400, '변경 범위를 초과했습니다.');
      }
      if (targetUid !== uid && !isAdmin) {
        throw new HttpError(403, '권한이 없습니다.');
      }

      const userRef = db.collection('users').doc(targetUid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }

        const update = {};
        if (pointsDelta !== 0) update.points = admin.firestore.FieldValue.increment(pointsDelta);
        if (totalScoreDelta !== 0) update.totalScore = admin.firestore.FieldValue.increment(totalScoreDelta);
        tx.update(userRef, update);

        if (pointsDelta !== 0) {
          const logRef = db.collection('pointLogs').doc();
          tx.set(logRef, {
            uid: targetUid,
            type: pointsDelta >= 0 ? 'points' : 'points_spent',
            amount: pointsDelta,
            reason,
            actorUid: uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      });

      res.json({ ok: true, targetUid, pointsDelta, totalScoreDelta });
      return;
    }

    if (action === 'saveSalaryScore') {
      const gameKey = String(payload.gameKey || '').trim();
      const field = SALARY_GAME_FIELDS[gameKey];
      const score = Number(payload.score);
      const extraStats = payload.extraStats && typeof payload.extraStats === 'object' ? payload.extraStats : {};

      if (!field || !isFiniteInt(score) || score < 0 || score > 1000000) {
        throw new HttpError(400, '유효하지 않은 점수 요청입니다.');
      }

      const reward = getRewardForScore(score);
      const userRef = db.collection('users').doc(uid);
      const result = await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }

        const current = userSnap.data();
        const currentGame = current?.salaryGames?.[gameKey] || {};
        const previousBest = Number(currentGame.bestScore || 0);
        const nextBest = Math.max(previousBest, score);
        const update = {
          [`${field}.bestScore`]: nextBest,
          [`${field}.lastScore`]: score,
          [`${field}.plays`]: admin.firestore.FieldValue.increment(1),
          [`${field}.totalScore`]: admin.firestore.FieldValue.increment(score),
          points: admin.firestore.FieldValue.increment(reward)
        };

        Object.entries(extraStats).forEach(([key, value]) => {
          if (isFiniteInt(value) && value >= 0 && value <= 1000000) {
            update[`${field}.${key}`] = admin.firestore.FieldValue.increment(value);
          }
        });

        tx.update(userRef, update);

        const logRef = db.collection('pointLogs').doc();
        tx.set(logRef, {
          uid,
          type: 'points',
          amount: reward,
          reason: '월급 루팡 게임 보상',
          actorUid: uid,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
          reward,
          bestScore: nextBest,
          isNewBest: nextBest > previousBest
        };
      });

      res.json({ ok: true, ...result });
      return;
    }

    if (action === 'grantItems') {
      const items = sanitizeInventory(payload.items);
      if (!items.length) {
        throw new HttpError(400, '지급할 아이템이 없습니다.');
      }

      const scoreDelta = recalcInventoryScore(items);
      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }
        tx.update(userRef, {
          inventory: admin.firestore.FieldValue.arrayUnion(...items),
          discoveredItems: admin.firestore.FieldValue.arrayUnion(...items),
          totalScore: admin.firestore.FieldValue.increment(scoreDelta)
        });
      });

      res.json({ ok: true, items, scoreDelta });
      return;
    }

    if (action === 'replaceInventory') {
      const inventory = sanitizeInventory(payload.inventory);
      const discoveredItems = sanitizeInventory(payload.discoveredItems || inventory);
      const totalScore = recalcInventoryScore(inventory);
      const userRef = db.collection('users').doc(uid);

      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }

        tx.update(userRef, {
          inventory,
          discoveredItems,
          totalScore
        });
      });

      res.json({ ok: true, inventory, discoveredItems, totalScore });
      return;
    }

    if (action === 'recordArcadePlay') {
      const statKey = String(payload.statKey || '').trim();
      const weekKey = String(payload.weekKey || '').trim();
      const claimedMilestones = sanitizeClaimedMilestones(payload.claimedMilestones);
      if (!ARCADE_STAT_KEYS.has(statKey) || !/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) {
        throw new HttpError(400, '유효하지 않은 오락실 기록 요청입니다.');
      }

      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }

        tx.update(userRef, {
          [`arcadeStats.${statKey}`]: admin.firestore.FieldValue.increment(1),
          'arcadeWeekly.weekKey': weekKey,
          'arcadeWeekly.plays': admin.firestore.FieldValue.increment(1),
          'arcadeWeekly.claimedMilestones': claimedMilestones
        });
      });

      res.json({ ok: true, statKey, weekKey, claimedMilestones });
      return;
    }

    if (action === 'buyBoosterPack') {
      const userRef = db.collection('users').doc(uid);
      const result = await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }

        const currentPoints = Number(userSnap.data()?.points || 0);
        if (currentPoints < BOOSTER_PACK_COST) {
          throw new HttpError(400, '포인트가 부족합니다.');
        }

        tx.update(userRef, {
          points: admin.firestore.FieldValue.increment(-BOOSTER_PACK_COST),
          boosterCount: admin.firestore.FieldValue.increment(BOOSTER_PACK_AMOUNT)
        });

        const logRef = db.collection('pointLogs').doc();
        tx.set(logRef, {
          uid,
          type: 'points_spent',
          amount: -BOOSTER_PACK_COST,
          reason: '슈퍼 부스터 충전',
          actorUid: uid,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
          pointsDelta: -BOOSTER_PACK_COST,
          boosterDelta: BOOSTER_PACK_AMOUNT
        };
      });

      res.json({ ok: true, ...result });
      return;
    }

    if (action === 'consumeBooster') {
      const amount = Number(payload.amount || 1);
      if (!isFiniteInt(amount) || amount <= 0 || amount > 20) {
        throw new HttpError(400, '유효하지 않은 부스터 차감 요청입니다.');
      }

      const userRef = db.collection('users').doc(uid);
      const result = await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }

        const current = Number(userSnap.data()?.boosterCount || 0);
        if (current < amount) {
          throw new HttpError(400, '부스터 수량이 부족합니다.');
        }

        tx.update(userRef, {
          boosterCount: admin.firestore.FieldValue.increment(-amount)
        });

        return { boosterDelta: -amount };
      });

      res.json({ ok: true, ...result });
      return;
    }

    if (action === 'completeQuest') {
      const questType = String(payload.questType || '').trim();
      if (!QUEST_TYPES.has(questType)) {
        throw new HttpError(400, '유효하지 않은 퀘스트 타입입니다.');
      }

      const today = getDateKey();
      const userRef = db.collection('users').doc(uid);
      const result = await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }

        const current = userSnap.data() || {};
        let quests = current.quests || { date: today, list: { login: true, test: false, board: false } };
        if (quests.date !== today) {
          quests = { date: today, list: { login: true, test: false, board: false } };
          tx.update(userRef, { quests });
        }

        let reward = 0;
        if (questType !== 'login' && quests.list?.[questType] === false) {
          quests = {
            date: today,
            list: {
              login: true,
              test: questType === 'test' ? true : !!quests.list?.test,
              board: questType === 'board' ? true : !!quests.list?.board
            }
          };
          reward = 50;
          tx.update(userRef, {
            quests,
            points: admin.firestore.FieldValue.increment(reward)
          });

          const logRef = db.collection('pointLogs').doc();
          tx.set(logRef, {
            uid,
            type: 'points',
            amount: reward,
            reason: `일일 퀘스트 완료: ${questType}`,
            actorUid: uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        return { quests, reward };
      });

      res.json({ ok: true, ...result });
      return;
    }

    if (action === 'incrementPostCount') {
      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }
        tx.update(userRef, {
          postCount: admin.firestore.FieldValue.increment(1)
        });
      });

      res.json({ ok: true, postCountDelta: 1 });
      return;
    }

    if (action === 'changeEmoji') {
      const emoji = String(payload.emoji || '').trim();
      const price = EMOJI_PRICES[emoji];
      if (!price) {
        throw new HttpError(400, '유효하지 않은 이모지입니다.');
      }

      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        const data = userSnap.data() || {};
        if (data.emoji === emoji) throw new HttpError(400, '이미 사용 중인 이모지입니다.');
        if (Number(data.points || 0) < price) throw new HttpError(400, '포인트가 부족합니다.');
        const unlocked = Array.isArray(data.unlockedEmojis) ? [...new Set([...data.unlockedEmojis, emoji])] : [emoji];
        tx.update(userRef, {
          points: admin.firestore.FieldValue.increment(-price),
          emoji,
          unlockedEmojis: unlocked
        });
      });

      res.json({ ok: true, emoji, pointsDelta: -price });
      return;
    }

    if (action === 'changeNameColor') {
      const color = String(payload.color || '').trim();
      if (!ALLOWED_NAME_COLORS.has(color)) {
        throw new HttpError(400, '유효하지 않은 색상입니다.');
      }

      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        const data = userSnap.data() || {};
        if (data.nameColor === color) throw new HttpError(400, '이미 사용 중인 색상입니다.');
        if (Number(data.points || 0) < 1000) throw new HttpError(400, '포인트가 부족합니다.');
        tx.update(userRef, {
          points: admin.firestore.FieldValue.increment(-1000),
          nameColor: color
        });
      });

      res.json({ ok: true, color, pointsDelta: -1000 });
      return;
    }

    if (action === 'changeNickname') {
      const nickname = sanitizeNickname(payload.nickname);
      if (nickname.length < 2 || nickname.length > 10) {
        throw new HttpError(400, '닉네임은 2~10자 사이여야 합니다.');
      }

      const userRef = db.collection('users').doc(uid);
      const result = await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        const data = userSnap.data() || {};
        if (data.nickname === nickname) throw new HttpError(400, '현재 사용 중인 닉네임입니다.');
        const cost = data.nicknameChanged ? 5000 : 0;
        if (Number(data.points || 0) < cost) throw new HttpError(400, '포인트가 부족합니다.');

        const update = {
          nickname,
          nicknameChanged: true
        };
        if (cost > 0) {
          update.points = admin.firestore.FieldValue.increment(-cost);
        }
        tx.update(userRef, update);
        return { cost };
      });

      res.json({ ok: true, nickname, pointsDelta: -result.cost, nicknameChanged: true });
      return;
    }

    if (action === 'setBio') {
      const bio = sanitizeBio(payload.bio);
      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        tx.update(userRef, { bio });
      });

      res.json({ ok: true, bio });
      return;
    }

    if (action === 'adoptPet') {
      const petId = String(payload.petId || '').trim();
      const config = PET_CONFIG[petId];
      if (!config) throw new HttpError(400, '유효하지 않은 펫입니다.');

      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        const data = userSnap.data() || {};
        const unlocked = Array.isArray(data.unlockedPets) ? data.unlockedPets : [];
        if (unlocked.includes(petId)) throw new HttpError(400, '이미 보유한 펫입니다.');
        if (Number(data.points || 0) < config.price) throw new HttpError(400, '포인트가 부족합니다.');
        tx.update(userRef, {
          points: admin.firestore.FieldValue.increment(-config.price),
          unlockedPets: [...unlocked, petId],
          activePet: petId
        });
      });

      res.json({ ok: true, petId, pointsDelta: -config.price });
      return;
    }

    if (action === 'setActivePet') {
      const petId = String(payload.petId || '').trim();
      if (!PET_CONFIG[petId]) throw new HttpError(400, '유효하지 않은 펫입니다.');
      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        const unlocked = Array.isArray(userSnap.data()?.unlockedPets) ? userSnap.data().unlockedPets : [];
        if (!unlocked.includes(petId)) throw new HttpError(400, '보유하지 않은 펫입니다.');
        tx.update(userRef, { activePet: petId });
      });

      res.json({ ok: true, petId });
      return;
    }

    if (action === 'purchaseProfileStyle') {
      const styleType = String(payload.styleType || '').trim();
      const itemId = String(payload.itemId || '').trim();
      const config = PROFILE_SHOP_CONFIG[styleType];
      const item = config?.items?.[itemId];
      if (!config || !item) throw new HttpError(400, '유효하지 않은 장식 아이템입니다.');

      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        const data = userSnap.data() || {};
        if (Number(data.totalScore || 0) < item.minScore) throw new HttpError(400, '아이템 점수가 부족합니다.');
        if (Number(data.points || 0) < item.price) throw new HttpError(400, '포인트가 부족합니다.');
        const unlocked = Array.isArray(data[config.unlockedKey]) ? [...new Set([...data[config.unlockedKey], itemId])] : [itemId];
        tx.update(userRef, {
          points: admin.firestore.FieldValue.increment(-item.price),
          [config.unlockedKey]: unlocked,
          [config.activeKey]: itemId
        });
      });

      res.json({ ok: true, styleType, itemId, pointsDelta: -item.price });
      return;
    }

    if (action === 'setProfileStyle') {
      const styleType = String(payload.styleType || '').trim();
      const itemId = String(payload.itemId || '').trim();
      const config = PROFILE_SHOP_CONFIG[styleType];
      if (!config) throw new HttpError(400, '유효하지 않은 장식 타입입니다.');
      if (itemId !== config.noneValue && !config.items[itemId]) throw new HttpError(400, '유효하지 않은 장식입니다.');

      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        const data = userSnap.data() || {};
        const unlocked = Array.isArray(data[config.unlockedKey]) ? data[config.unlockedKey] : [];
        if (itemId !== config.noneValue && !unlocked.includes(itemId)) {
          throw new HttpError(400, '보유하지 않은 장식입니다.');
        }
        tx.update(userRef, {
          [config.activeKey]: itemId
        });
      });

      res.json({ ok: true, styleType, itemId });
      return;
    }

    if (action === 'claimWeeklyArcadeReward') {
      const goal = Number(payload.goal);
      const reward = WEEKLY_ARCADE_MILESTONES[goal];
      if (!reward) {
        throw new HttpError(400, '유효하지 않은 보상 단계입니다.');
      }

      const userRef = db.collection('users').doc(uid);
      const result = await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          throw new HttpError(404, '사용자를 찾을 수 없습니다.');
        }

        const weekly = userSnap.data()?.arcadeWeekly || {};
        const claimedMilestones = Array.isArray(weekly.claimedMilestones) ? weekly.claimedMilestones.map(Number) : [];
        const plays = Number(weekly.plays || 0);
        if (plays < goal || claimedMilestones.includes(goal)) {
          throw new HttpError(400, '보상 수령 조건을 만족하지 않습니다.');
        }

        const nextClaimed = [...claimedMilestones, goal].sort((a, b) => a - b);
        tx.update(userRef, {
          points: admin.firestore.FieldValue.increment(reward),
          'arcadeWeekly.claimedMilestones': nextClaimed
        });

        const logRef = db.collection('pointLogs').doc();
        tx.set(logRef, {
          uid,
          type: 'points',
          amount: reward,
          reason: `주간 오락실 보상 ${goal}`,
          actorUid: uid,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
          reward,
          weekKey: weekly.weekKey || null,
          plays,
          claimedMilestones: nextClaimed
        };
      });

      res.json({ ok: true, ...result });
      return;
    }

    if (action === 'awardReactionAuthor') {
      const postId = String(payload.postId || '').trim();
      const emoji = String(payload.emoji || '').trim();
      if (!postId || !emoji) {
        throw new HttpError(400, 'postId와 emoji가 필요합니다.');
      }

      const postRef = db.collection('posts').doc(postId);
      const rewardRef = db.collection('reactionRewards').doc(`${postId}__${uid}__${emoji}`);

      const result = await db.runTransaction(async (tx) => {
        const [postSnap, rewardSnap] = await Promise.all([tx.get(postRef), tx.get(rewardRef)]);
        if (!postSnap.exists) {
          throw new HttpError(404, '게시글을 찾을 수 없습니다.');
        }
        if (rewardSnap.exists) {
          return { rewarded: false };
        }

        const post = postSnap.data();
        const authorUid = String(post.uid || '');
        const userList = Array.isArray(post.reactions?.[emoji]) ? post.reactions[emoji] : [];
        if (!authorUid || authorUid === uid || !userList.includes(uid)) {
          return { rewarded: false };
        }

        const authorRef = db.collection('users').doc(authorUid);
        tx.update(authorRef, {
          points: admin.firestore.FieldValue.increment(1)
        });
        tx.create(rewardRef, {
          postId,
          emoji,
          actorUid: uid,
          authorUid,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const logRef = db.collection('pointLogs').doc();
        tx.set(logRef, {
          uid: authorUid,
          type: 'points',
          amount: 1,
          reason: '게시글 반응 보상',
          actorUid: uid,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return { rewarded: true, authorUid };
      });

      res.json({ ok: true, ...result });
      return;
    }

    throw new HttpError(400, '지원하지 않는 action입니다.');
  } catch (error) {
    console.error(error);
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: '요청 처리 중 오류가 발생했습니다.' });
  }
});

exports.dailyResult = onRequest({ cors: true, region: 'asia-northeast3' }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const decoded = await verifyRequestUser(req);
    const uid = decoded.uid;
    const slug = String(req.body?.slug || '').trim();

    if (!slug) {
      res.status(400).json({ error: 'slug가 필요합니다.' });
      return;
    }

    const dateKey = getDateKey();
    const resultId = `${uid}__${dateKey}__${slug}`;
    const testRef = db.collection('tests').doc(slug);
    const resultRef = db.collection('results').doc(resultId);
    const statsRef = db.collection('stats').doc(slug);

    const responsePayload = await db.runTransaction(async (tx) => {
      const testSnap = await tx.get(testRef);
      if (!testSnap.exists) {
        throw new HttpError(404, '테스트를 찾을 수 없습니다.');
      }

      const test = testSnap.data();
      if (!test.isActive || test.category !== 'daily') {
        throw new HttpError(404, '비활성 테스트입니다.');
      }

      const existing = await tx.get(resultRef);
      if (existing.exists) {
        return {
          slug,
          title: test.title,
          dateKey,
          resultPayload: existing.data().resultPayload,
          cached: true
        };
      }

      const resultPayload = buildResultPayload(test.title, test.type, `${uid}:${dateKey}:${slug}`);
      tx.create(resultRef, {
        uid,
        slug,
        dateKey,
        resultPayload,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      tx.set(statsRef, {
        slug,
        runs: admin.firestore.FieldValue.increment(1),
        likes: admin.firestore.FieldValue.increment(0)
      }, { merge: true });

      return {
        slug,
        title: test.title,
        dateKey,
        resultPayload,
        cached: false
      };
    });

    res.json(responsePayload);
  } catch (error) {
    console.error(error);
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: '결과를 만드는 중 오류가 발생했습니다.' });
  }
});
