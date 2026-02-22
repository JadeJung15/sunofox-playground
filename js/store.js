// js/store.js
import { db } from './firebase-init.js'; // Import db instance from new module
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const STORAGE_KEY_SETTINGS = 'sunofox_settings';
const STORAGE_KEY_GAMES = 'sunofox_games';
// Removed STORAGE_KEY_POSTS and STORAGE_KEY_COMMENTS as they will be in Firestore

// Helper to get collection references
const postsCol = collection(db, "posts");
const commentsCol = collection(db, "comments");

// Initial Setup & Dummy Data (for Firestore, only if collection is empty)
// Removed manual 'id' from initial posts to let Firestore assign them
const initialPosts = [
  { type: 'community', category: '잡담', title: '첫 번째 글입니다.', content: '반갑습니다.', author: '익명1', date: new Date().toISOString(), likes: 3, views: 10, authorId: 'anonymous' },
  { type: 'community', category: '질문', title: '반응속도 게임 0.2초 가능한가요?', content: '너무 어렵네요 ㅠㅠ', author: '뉴비', date: new Date().toISOString(), likes: 5, views: 24, authorId: 'anonymous' },
  { type: 'lounge', category: '게임', title: '슬라이드 퍼즐 공략 공유', content: '맨 윗줄부터 맞추세요.', author: '고수', date: new Date().toISOString(), likes: 12, views: 45, authorId: 'anonymous' },
  { type: 'lounge', category: '유머', title: '개발자가 좋아하는 숫자는?', content: '0부터 시작해서 모름', author: '유머왕', date: new Date().toISOString(), likes: 20, views: 100, authorId: 'anonymous' },
];

const initialGameRecords = {
  reaction: null, // ms (lower is better)
  memory: null,   // turns (lower is better)
  rhythm: 0,      // score (higher is better)
  puzzle: null,   // seconds (lower is better)
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

    if (type) {
        q = query(q, where("type", "==", type));
    }
    if (category && category !== '전체') {
        q = query(q, where("category", "==", category));
    }
    
    const querySnapshot = await getDocs(q);
    let posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (posts.length === 0) { // If no posts, seed initial data to Firestore
        console.log("Seeding initial posts...");
        for (const p of initialPosts) {
            await addDoc(postsCol, p);
        }
        // After seeding, query again to get the newly added posts with their Firestore IDs
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
        console.log("No such document!", id); // Log the missing ID
        return null;
    }
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
    const batch = db.batch(); // Use batch for multiple deletes
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    return true;
  },

  // Comments - Now using Firestore
  async getComments(postId) {
    const q = query(commentsCol, where("postId", "==", postId), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
