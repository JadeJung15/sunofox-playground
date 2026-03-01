import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

const projectId = 'sunofoxplayground-backend';
const rules = readFileSync(resolve('firestore.rules'), 'utf8');

let testEnv;

async function withAdminSeed(callback) {
  await testEnv.withSecurityRulesDisabled(callback);
}

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080
    }
  });
});

test.after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

test.afterEach(async () => {
  await testEnv.clearFirestore();
});

test('익명 사용자는 siteStats 증가만 가능하다', async () => {
  const guestDb = testEnv.unauthenticatedContext().firestore();

  await assertSucceeds(setDoc(doc(guestDb, 'siteStats', 'global'), { total: 1 }));
  await assertSucceeds(setDoc(doc(guestDb, 'siteStats', 'global'), { total: 2 }));
  await assertFails(setDoc(doc(guestDb, 'siteStats', 'global'), { total: 99 }));
  await assertFails(setDoc(doc(guestDb, 'siteStats', 'global'), { total: 3, extra: true }));
});

test('사용자는 초기 users 문서만 생성할 수 있고 points를 직접 올릴 수 없다', async () => {
  const userDb = testEnv.authenticatedContext('user-1').firestore();

  await assertSucceeds(setDoc(doc(userDb, 'users', 'user-1'), {
    uid: 'user-1',
    nickname: '테스터',
    originalName: 'tester',
    originalEmail: 'tester@example.com',
    emoji: '👤',
    unlockedEmojis: ['👤'],
    points: 1000,
    inventory: [],
    totalScore: 0,
    discoveredItems: [],
    activePet: 'F_NORMAL',
    unlockedPets: ['F_NORMAL'],
    nicknameChanged: false,
    lastNicknameChange: null,
    nameColor: '#333333',
    arcadeStats: {},
    arcadeWeekly: { weekKey: null, plays: 0, claimedMilestones: [] },
    quests: { date: null, list: {} },
    createdAt: new Date()
  }));

  await assertFails(updateDoc(doc(userDb, 'users', 'user-1'), { points: 2000 }));
});

test('사용자는 totalScore를 직접 수정할 수 없다', async () => {
  await withAdminSeed(async (context) => {
    await setDoc(doc(context.firestore(), 'users', 'user-2'), {
      uid: 'user-2',
      nickname: '테스터',
      originalName: 'tester',
      originalEmail: 'tester@example.com',
      emoji: '👤',
      unlockedEmojis: ['👤'],
      points: 1000,
      inventory: [],
      totalScore: 0,
      discoveredItems: [],
      activePet: 'F_NORMAL',
      unlockedPets: ['F_NORMAL'],
      nicknameChanged: false,
      lastNicknameChange: null,
      nameColor: '#333333',
      arcadeStats: {},
      arcadeWeekly: { weekKey: null, plays: 0, claimedMilestones: [] },
      quests: { date: null, list: {} },
      createdAt: new Date()
    });
  });

  const userDb = testEnv.authenticatedContext('user-2').firestore();
  await assertFails(updateDoc(doc(userDb, 'users', 'user-2'), { totalScore: 12345 }));
  await assertFails(updateDoc(doc(userDb, 'users', 'user-2'), { boosterCount: 20 }));
  await assertFails(updateDoc(doc(userDb, 'users', 'user-2'), {
    quests: { date: '2026-03-01', list: { login: true, test: true, board: true } }
  }));
  await assertFails(updateDoc(doc(userDb, 'users', 'user-2'), { nickname: '변경시도' }));
});

test('사용자는 닉네임을 최초 1회 무료로 직접 변경할 수 있다', async () => {
  await withAdminSeed(async (context) => {
    await setDoc(doc(context.firestore(), 'users', 'user-6'), {
      uid: 'user-6',
      nickname: '처음닉네임',
      originalName: 'tester',
      originalEmail: 'tester@example.com',
      emoji: '👤',
      unlockedEmojis: ['👤'],
      points: 1000,
      inventory: [],
      totalScore: 0,
      discoveredItems: [],
      activePet: 'F_NORMAL',
      unlockedPets: ['F_NORMAL'],
      nicknameChanged: false,
      lastNicknameChange: null,
      nameColor: '#333333',
      arcadeStats: {},
      arcadeWeekly: { weekKey: null, plays: 0, claimedMilestones: [] },
      quests: { date: null, list: {} },
      createdAt: new Date()
    });
  });

  const userDb = testEnv.authenticatedContext('user-6').firestore();
  await assertSucceeds(updateDoc(doc(userDb, 'users', 'user-6'), {
    nickname: '변경완료',
    nicknameChanged: true
  }));
});

test('사용자는 닉네임 재변경 시 5000포인트만 차감할 수 있다', async () => {
  await withAdminSeed(async (context) => {
    await setDoc(doc(context.firestore(), 'users', 'user-7'), {
      uid: 'user-7',
      nickname: '현재닉네임',
      originalName: 'tester',
      originalEmail: 'tester@example.com',
      emoji: '👤',
      unlockedEmojis: ['👤'],
      points: 7000,
      inventory: [],
      totalScore: 0,
      discoveredItems: [],
      activePet: 'F_NORMAL',
      unlockedPets: ['F_NORMAL'],
      nicknameChanged: true,
      lastNicknameChange: null,
      nameColor: '#333333',
      arcadeStats: {},
      arcadeWeekly: { weekKey: null, plays: 0, claimedMilestones: [] },
      quests: { date: null, list: {} },
      createdAt: new Date()
    });
  });

  const userDb = testEnv.authenticatedContext('user-7').firestore();
  await assertSucceeds(updateDoc(doc(userDb, 'users', 'user-7'), {
    nickname: '다음닉네임',
    points: 2000,
    nicknameChanged: true
  }));
  await assertFails(updateDoc(doc(userDb, 'users', 'user-7'), {
    nickname: '치트닉네임',
    points: 6999,
    nicknameChanged: true
  }));
});

test('사용자는 자기 daily result만 읽을 수 있고 생성은 불가하다', async () => {
  await withAdminSeed(async (context) => {
    await setDoc(doc(context.firestore(), 'results', 'user-3__2026-03-01__sample'), {
      uid: 'user-3',
      slug: 'sample',
      dateKey: '2026-03-01',
      resultPayload: { headline: 'A' }
    });
  });

  const ownerDb = testEnv.authenticatedContext('user-3').firestore();
  const otherDb = testEnv.authenticatedContext('user-4').firestore();

  await assertSucceeds(getDoc(doc(ownerDb, 'results', 'user-3__2026-03-01__sample')));
  await assertFails(getDoc(doc(otherDb, 'results', 'user-3__2026-03-01__sample')));
  await assertFails(setDoc(doc(ownerDb, 'results', 'new-result'), {
    uid: 'user-3',
    slug: 'sample',
    dateKey: '2026-03-01'
  }));
});

test('pointLogs는 클라이언트에서 생성할 수 없다', async () => {
  const userDb = testEnv.authenticatedContext('user-5').firestore();
  await assertFails(setDoc(doc(userDb, 'pointLogs', 'log-1'), {
    uid: 'user-5',
    type: 'points',
    amount: 10
  }));
});
