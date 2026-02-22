// js/store.js

const STORAGE_KEY_SETTINGS = 'sunofox_settings';
const STORAGE_KEY_GAMES = 'sunofox_games';
const STORAGE_KEY_POSTS = 'sunofox_posts';
const STORAGE_KEY_COMMENTS = 'sunofox_comments';

// Initial Setup & Dummy Data
const initialPosts = [
  { id: 1, type: 'community', category: '잡담', title: '첫 번째 글입니다.', content: '반갑습니다.', author: '익명1', date: new Date().toISOString(), likes: 3, views: 10 },
  { id: 2, type: 'community', category: '질문', title: '반응속도 게임 0.2초 가능한가요?', content: '너무 어렵네요 ㅠㅠ', author: '뉴비', date: new Date().toISOString(), likes: 5, views: 24 },
  { id: 3, type: 'lounge', category: '게임', title: '슬라이드 퍼즐 공략 공유', content: '맨 윗줄부터 맞추세요.', author: '고수', date: new Date().toISOString(), likes: 12, views: 45 },
  { id: 4, type: 'lounge', category: '유머', title: '개발자가 좋아하는 숫자는?', content: '0부터 시작해서 모름', author: '유머왕', date: new Date().toISOString(), likes: 20, views: 100 },
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

  // Games
  getGameRecord(gameId) {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY_GAMES)) || initialGameRecords;
    return records[gameId];
  },
  saveGameRecord(gameId, score) {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY_GAMES)) || initialGameRecords;
    const current = records[gameId];
    
    let isNewRecord = false;
    // Logic: lower is better for reaction, memory, puzzle; higher is better for rhythm
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

  // Posts (Community & Lounge)
  getPosts(type = null, category = null) {
    let posts = JSON.parse(localStorage.getItem(STORAGE_KEY_POSTS));
    if (!posts) {
      posts = initialPosts;
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    }
    
    return posts.filter(p => {
      if (type && p.type !== type) return false;
      if (category && p.category !== category && category !== '전체') return false;
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  
  getPost(id) {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEY_POSTS)) || initialPosts;
    return posts.find(p => p.id === parseInt(id));
  },

  addPost(postData) {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEY_POSTS)) || initialPosts;
    const newPost = {
      id: Date.now(),
      date: new Date().toISOString(),
      likes: 0,
      views: 0,
      ...postData
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    return newPost;
  },

  viewPost(id) {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEY_POSTS)) || initialPosts;
    const postIndex = posts.findIndex(p => p.id === parseInt(id));
    if (postIndex > -1) {
      posts[postIndex].views += 1;
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    }
  },

  likePost(id) {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEY_POSTS)) || initialPosts;
    const postIndex = posts.findIndex(p => p.id === parseInt(id));
    if (postIndex > -1) {
      posts[postIndex].likes += 1;
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
      return posts[postIndex].likes;
    }
    return 0;
  },

  // Comments
  getComments(postId) {
    const allComments = JSON.parse(localStorage.getItem(STORAGE_KEY_COMMENTS)) || [];
    return allComments.filter(c => c.postId === parseInt(postId)).sort((a, b) => new Date(a.date) - new Date(b.date));
  },
  
  addComment(commentData) {
    const allComments = JSON.parse(localStorage.getItem(STORAGE_KEY_COMMENTS)) || [];
    const newComment = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...commentData
    };
    allComments.push(newComment);
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(allComments));
    return newComment;
  }
};
