// js/store.js
import { db } from './firebase-init.js'; // Import db instance from new module
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit, writeBatch, setDoc, increment } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const STORAGE_KEY_SETTINGS = 'sunofox_settings';
const STORAGE_KEY_THEME_EXPLICIT = 'sunofox_theme_explicit';
const STORAGE_KEY_GAMES = 'sunofox_games';
// Removed STORAGE_KEY_POSTS and STORAGE_KEY_COMMENTS as they will be in Firestore

// Helper to get collection references
const postsCol = collection(db, "posts");
const commentsCol = collection(db, "comments");
const usersCol = collection(db, "users");

// Initial Setup & Dummy Data (for Firestore, only if collection is empty)
// Removed manual 'id' from initial posts to let Firestore assign them
const initialPosts = [
  { type: 'community', category: '공지', title: '팬페이지 이용 안내', content: '수노폭스 팬들을 위한 공식 팬페이지입니다. 최신 영상과 팬 토론을 자유롭게 이용해주세요.', author: '운영진', date: new Date().toISOString(), likes: 0, views: 0, authorId: 'system' },
  { type: 'community', category: '공지', title: '게시글 작성 규칙', content: '서로를 존중하는 대화를 부탁드립니다. 홍보/스팸/비방 글은 삭제될 수 있습니다.', author: '운영진', date: new Date().toISOString(), likes: 0, views: 0, authorId: 'system' },
  { type: 'community', category: '공지', title: '팬 토론 가이드', content: '영상별 감상 포인트, 추천 장면, 다음 주제 제안을 자유롭게 남겨주세요.', author: '운영진', date: new Date().toISOString(), likes: 0, views: 0, authorId: 'system' },
];

const dummyPostSignatures = new Set([
  '이번 OST 감정선 어땠나요?',
  '반응속도 210ms 달성!',
  '나의 OST 무드 타입 결과 공유',
  '다음 영상 아이디어 추천합니다',
]);

const initialGameRecords = {
  reaction: null, // ms (lower is better)
  memory: null,   // turns (lower is better)
  rhythm: 0,      // score (higher is better)
  puzzle: null,   // seconds (lower is better)
  math: 0,        // score (higher is better)
  rps: 0,         // win streak (higher is better)
  number: 0,      // max length (higher is better)
  typing: 0,      // wpm (higher is better)
  reflex: 0,      // score (higher is better)
  maze: 0,        // score (higher is better)
  dodge: 0,       // score (higher is better)
};

export const Store = {
  async ensureUserProfile(uid, displayName = '') {
    const userRef = doc(usersCol, uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        displayName,
        points: 0,
        tier: 'Rookie',
        lastLoginDate: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      });
    }
  },

  async getUserProfile(uid) {
    const userRef = doc(usersCol, uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) return snap.data();
    return null;
  },

  async updateUserProfile(uid, data = {}) {
    const userRef = doc(usersCol, uid);
    await setDoc(userRef, { ...data, uid }, { merge: true });
  },

  async addPoints(uid, delta, tier) {
    const userRef = doc(usersCol, uid);
    await updateDoc(userRef, {
      points: increment(delta),
      tier
    });
  },

  async addPointLog({ uid, delta, reason }) {
    const userPointsCol = collection(db, "users", uid, "points");
    await addDoc(userPointsCol, {
      delta,
      reason,
      date: new Date().toISOString()
    });
  },

  async getPointLogs(uid, limitCount = 20) {
    const userPointsCol = collection(db, "users", uid, "points");
    const q = query(userPointsCol, orderBy("date", "desc"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getLeaderboard(limitCount = 10) {
    const q = query(usersCol, orderBy("points", "desc"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  },
  // Settings
  getTheme() {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const isExplicit = localStorage.getItem(STORAGE_KEY_THEME_EXPLICIT) === '1';
    if (!saved) return 'light';
    if (saved !== 'dark' && saved !== 'light') return 'light';

    // Migrate old default-dark users who never explicitly selected a theme.
    if (!isExplicit && saved === 'dark') {
      localStorage.setItem(STORAGE_KEY_SETTINGS, 'light');
      return 'light';
    }
    return saved;
  },
  setTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY_SETTINGS, next);
    localStorage.setItem(STORAGE_KEY_THEME_EXPLICIT, '1');
  },

  // Games (Still using localStorage for now)
  getGameRecord(gameId) {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY_GAMES)) || initialGameRecords;
    return records[gameId];
  },
  saveGameRecord(gameId, score) {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY_GAMES)) || initialGameRecords;
    const current = records[gameId];
    
    let isNewRecord = false;
    if (['reaction', 'memory', 'puzzle'].includes(gameId)) {
      if (current === null || score < current) {
        records[gameId] = score;
        isNewRecord = true;
      }
    } else {
      if (score > (current || 0)) {
        records[gameId] = score;
        isNewRecord = true;
      }
    }
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(records));
    return isNewRecord;
  },
  resetGameRecords() {
    localStorage.removeItem(STORAGE_KEY_GAMES);
  },

  // Posts (Community & Lounge) - Now using Firestore
  async getPosts(type = null, category = null, orderByField = 'date', orderDirection = 'desc') {
    const useCategoryFilter = category && category !== '전체';
    const constraints = [];
    if (type) constraints.push(where('type', '==', type));
    if (useCategoryFilter) constraints.push(where('category', '==', category));
    constraints.push(orderBy(orderByField, orderDirection));
    const q = query(postsCol, ...constraints);
    const toPosts = (snapshot) => snapshot.docs.map(doc => {
      const data = doc.data();
      const legacyId = data.id;
      if (legacyId) delete data.id;
      return { id: doc.id, legacyId, ...data };
    });
    let posts = [];
    try {
      const querySnapshot = await getDocs(q);
      posts = toPosts(querySnapshot);
    } catch (error) {
      // If required composite indexes are missing, fallback to broad query.
      const fallbackSnapshot = await getDocs(query(postsCol, orderBy(orderByField, orderDirection)));
      posts = toPosts(fallbackSnapshot);
      if (type) posts = posts.filter(p => p.type === type);
      if (useCategoryFilter) posts = posts.filter(p => p.category === category);
      console.warn('Fell back to client-side filtering for posts query:', error);
    }

    if (posts.length === 0) {
      // Seed only when the entire posts collection is empty.
      const hasAnyPosts = await getDocs(query(postsCol, limit(1)));
      if (!hasAnyPosts.empty) return posts;
        console.log("Seeding initial posts...");
        for (const p of initialPosts) {
            await addDoc(postsCol, p);
        }
        // After seeding, query again to get the newly added posts with their Firestore IDs
        const seededSnapshot = await getDocs(q);
        posts = seededSnapshot.docs.map(doc => {
          const data = doc.data();
          const legacyId = data.id;
          if (legacyId) delete data.id;
          return { id: doc.id, legacyId, ...data };
        });
    }

    return posts;
  },

  async cleanupDummyPosts() {
    const snapshot = await getDocs(postsCol);
    const batch = writeBatch(db);
    let hasDeletes = false;
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.authorId === 'anonymous' || dummyPostSignatures.has(data.title)) {
        batch.delete(docSnap.ref);
        hasDeletes = true;
      }
    });
    if (hasDeletes) {
      await batch.commit();
    }
  },

  async ensureAnnouncements() {
    const snapshot = await getDocs(query(postsCol, where('category', '==', '공지')));
    const existingTitles = new Set(snapshot.docs.map(d => d.data().title));
    const missing = initialPosts.filter(p => !existingTitles.has(p.title));
    for (const p of missing) {
      await addDoc(postsCol, p);
    }
  },
  
  async getPost(id) {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        const legacyId = data.id;
        if (legacyId) delete data.id;
        return { id: docSnap.id, legacyId, ...data };
    }
    // Fallback for legacy docs that stored "id" field
    const legacyQuery = query(postsCol, where("id", "==", id), limit(1));
    const legacySnapshot = await getDocs(legacyQuery);
    if (!legacySnapshot.empty) {
        const legacyDoc = legacySnapshot.docs[0];
        const data = legacyDoc.data();
        const legacyId = data.id;
        if (legacyId) delete data.id;
        return { id: legacyDoc.id, legacyId, ...data };
    }
    console.log("No such document!", id);
    return null;
  },

  async addPost(postData) {
    const newPostRef = await addDoc(postsCol, {
      ...postData,
      date: new Date().toISOString(),
      likes: 0,
      views: 0,
    });
    return { id: newPostRef.id, ...postData };
  },

  async viewPost(id) {
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
      views: increment(1)
    });
  },

  async likePost(id) {
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
      likes: increment(1)
    });
    const updatedSnap = await getDoc(postRef);
    return updatedSnap.exists() ? (updatedSnap.data().likes || 0) : 0;
  },

  async deletePost(id) {
    const postRef = doc(db, "posts", id);
    await deleteDoc(postRef);
    // Optionally delete associated comments if they are not sub-collections
    const q = query(commentsCol, where("postId", "==", id));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db); // Use batch for multiple deletes
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    return true;
  },

  // Comments - Now using Firestore
  async getComments(postId, legacyId = null) {
    const queries = [
      query(commentsCol, where("postId", "==", postId), orderBy("date", "asc"))
    ];
    if (legacyId && legacyId !== postId) {
      queries.push(query(commentsCol, where("postId", "==", legacyId), orderBy("date", "asc")));
    }
    const snapshots = await Promise.all(queries.map(q => getDocs(q)));
    const items = new Map();
    snapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        items.set(doc.id, { id: doc.id, ...doc.data() });
      });
    });
    return Array.from(items.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  },
  
  async addComment(commentData) {
    const newCommentRef = await addDoc(commentsCol, {
      ...commentData,
      date: new Date().toISOString(),
    });
    return { id: newCommentRef.id, ...commentData };
  },

  async deleteComment(id) {
    const commentRef = doc(db, "comments", id);
    await deleteDoc(commentRef);
    return true;
  }
};
