// js/store.js
import { db } from '../index.html'; // Import db instance from index.html (or app.js once migrated)
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const STORAGE_KEY_SETTINGS = 'sunofox_settings';
const STORAGE_KEY_GAMES = 'sunofox_games';
// Removed STORAGE_KEY_POSTS and STORAGE_KEY_COMMENTS as they will be in Firestore

// Helper to get collection references
const postsCol = collection(db, "posts");
const commentsCol = collection(db, "comments");

// Initial Setup & Dummy Data (for Firestore, only if collection is empty)
const initialPosts = [
  { id: 1, type: 'community', category: '잡담', title: '첫 번째 글입니다.', content: '반갑습니다.', author: '익명1', date: new Date().toISOString(), likes: 3, views: 10, authorId: 'anonymous' },
  { id: 2, type: 'community', category: '질문', title: '반응속도 게임 0.2초 가능한가요?', content: '너무 어렵네요 ㅠㅠ', author: '뉴비', date: new Date().toISOString(), likes: 5, views: 24, authorId: 'anonymous' },
  { id: 3, type: 'lounge', category: '게임', title: '슬라이드 퍼즐 공략 공유', content: '맨 윗줄부터 맞추세요.', author: '고수', date: new Date().toISOString(), likes: 12, views: 45, authorId: 'anonymous' },
  { id: 4, type: 'lounge', category: '유머', title: '개발자가 좋아하는 숫자는?', content: '0부터 시작해서 모름', author: '유머왕', date: new Date().toISOString(), likes: 20, views: 100, authorId: 'anonymous' },
];

const initialGameRecords = {
  reaction: null, // ms (lower is better)
  memory: null,   // turns (lower is better)
  rhythm: 0,      // score (higher is better)
  puzzle: null,   // seconds (lower is better)
  math: 0,        // score (higher is better)
  rps: 0,         // win streak (higher is better)
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
    let q = query(postsCol);

    if (type) {
        q = query(q, where("type", "==", type));
    }
    if (category && category !== '전체') {
        q = query(q, where("category", "==", category));
    }
    q = query(q, orderBy(orderByField, orderDirection));

    const querySnapshot = await getDocs(q);
    let posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (posts.length === 0) { // If no posts, seed initial data to Firestore
        for (const p of initialPosts) {
            await addDoc(postsCol, p);
        }
        const seededSnapshot = await getDocs(q);
        posts = seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return posts;
  },
  
  async getPost(id) {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        console.log("No such document!");
        return null;
    }
  },

  async addPost(postData) {
    const newPostRef = await addDoc(postsCol, {
      ...postData,
      date: new Date().toISOString(),
      likes: 0,
      views: 0,
      authorId: postData.authorId || 'anonymous' // Ensure authorId is saved
    });
    return { id: newPostRef.id, ...postData };
  },

  async viewPost(id) {
    const post = await this.getPost(id);
    if (post) {
      const docRef = doc(db, "posts", id);
      await updateDoc(docRef, {
        views: (post.views || 0) + 1
      });
    }
  },

  async likePost(id) {
    const post = await this.getPost(id);
    if (post) {
      const docRef = doc(db, "posts", id);
      const newLikes = (post.likes || 0) + 1;
      await updateDoc(docRef, {
        likes: newLikes
      });
      return newLikes;
    }
    return 0;
  },

  // Comments - Now using Firestore
  async getComments(postId) {
    const q = query(commentsCol, where("postId", "==", parseInt(postId)), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async addComment(commentData) {
    const newCommentRef = await addDoc(commentsCol, {
      ...commentData,
      date: new Date().toISOString(),
      authorId: commentData.authorId || 'anonymous' // Ensure authorId is saved
    });
    return { id: newCommentRef.id, ...commentData };
  }
};
