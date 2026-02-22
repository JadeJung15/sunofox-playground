// js/store.js
import { db } from './firebase-init.js'; // Import db instance from new module
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit, writeBatch } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const STORAGE_KEY_SETTINGS = 'sunofox_settings';
const STORAGE_KEY_GAMES = 'sunofox_games';
// Removed STORAGE_KEY_POSTS and STORAGE_KEY_COMMENTS as they will be in Firestore

// Helper to get collection references
const postsCol = collection(db, "posts");
const commentsCol = collection(db, "comments");

// Initial Setup & Dummy Data (for Firestore, only if collection is empty)
// Removed manual 'id' from initial posts to let Firestore assign them
const initialPosts = [
  { type: 'community', category: '영상', title: '이번 OST 감정선 어땠나요?', content: '클라이맥스 구간이 특히 좋았어요!', author: '팬1', date: new Date().toISOString(), likes: 8, views: 34, authorId: 'anonymous' },
  { type: 'community', category: '게임 기록', title: '반응속도 210ms 달성!', content: '다들 기록 어디까지 나오나요?', author: '뉴비', date: new Date().toISOString(), likes: 5, views: 24, authorId: 'anonymous' },
  { type: 'lounge', category: '심리테스트', title: '나의 OST 무드 타입 결과 공유', content: '저는 감성 크리에이터 나왔어요!', author: '팬2', date: new Date().toISOString(), likes: 12, views: 45, authorId: 'anonymous' },
  { type: 'lounge', category: '추천', title: '다음 영상 아이디어 추천합니다', content: '스토리텔링 OST 제작 과정 보고 싶어요.', author: '팬3', date: new Date().toISOString(), likes: 10, views: 38, authorId: 'anonymous' },
];

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
  // Settings
  getTheme() {
    return localStorage.getItem(STORAGE_KEY_SETTINGS) || 'dark';
  },
  setTheme(theme) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, theme);
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
    let q = query(postsCol, orderBy(orderByField, orderDirection));

    const useClientTypeFilter = !!type;
    const useClientCategoryFilter = category && category !== '전체';
    
    const querySnapshot = await getDocs(q);
    let posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const legacyId = data.id;
      if (legacyId) delete data.id;
      return { id: doc.id, legacyId, ...data };
    });

    if (useClientTypeFilter) {
      posts = posts.filter(p => p.type === type);
    }
    if (useClientCategoryFilter) {
      posts = posts.filter(p => p.category === category);
    }

    if (posts.length === 0) { // If no posts, seed initial data to Firestore
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
        if (useClientTypeFilter) {
          posts = posts.filter(p => p.type === type);
        }
        if (useClientCategoryFilter) {
          posts = posts.filter(p => p.category === category);
        }
    }

    return posts;
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
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentViews = postSnap.data().views || 0;
      await updateDoc(postRef, {
        views: currentViews + 1
      });
    }
  },

  async likePost(id) {
    const postRef = doc(db, "posts", id);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentLikes = postSnap.data().likes || 0;
      const newLikes = currentLikes + 1;
      await updateDoc(postRef, {
        likes: newLikes
      });
      return newLikes;
    }
    return 0;
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
