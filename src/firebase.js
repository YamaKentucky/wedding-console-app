// Firebase設定ファイル
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, update, onValue, get } from 'firebase/database';

// Firebaseの設定情報
const firebaseConfig = {
    apiKey: "AIzaSyAXheKu9SorK0jvsJ8sJzrllPXwWZxMKAI",
    authDomain: "pj-test-1c30f.firebaseapp.com",
    databaseURL: "https://pj-test-1c30f-default-rtdb.firebaseio.com",
    projectId: "pj-test-1c30f",
    storageBucket: "pj-test-1c30f.firebasestorage.app",
    messagingSenderId: "462050565009",
    appId: "1:462050565009:web:360f11d2ea1ae14c71d830",
    measurementId: "G-FKFZM91NXR"
  };

// Firebaseの初期化
const app = initializeApp(firebaseConfig);

// Realtime Database の初期化
const database = getDatabase(app);

// Firebase操作を行うユーティリティ関数
export const firebaseService = {
  // ユーザーデータを取得
  async getAllUsers() {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([id, userData]) => ({
          id,
          ...userData
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // ユーザーをリアルタイムで監視
  watchUsers(callback) {
    const usersRef = ref(database, 'users');
    return onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.entries(data).map(([id, userData]) => ({
          id,
          ...userData
        }));
        callback(usersArray);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error watching users:', error);
      callback([]);
    });
  },
  
  // 新しいユーザーデータを保存
  async saveUser(userId, userData) {
    try {
      const userRef = ref(database, `users/${userId}`);
      await set(userRef, userData);
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },
  
  // ユーザーデータを更新
  async updateUser(userId, updates) {
    try {
      console.log(`Updating user ${userId} with:`, updates);
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  
  // 初期データをセットアップ
  async setupInitialData() {
    try {
      const initialUsers = {
        'user1': {
          sucsessID: "KENTA",
          primaryID: 323,
          secoundaryID: 399054,
          step: 0
        },
        'user2': {
          sucsessID: "YURIKA",
          primaryID: 604,
          secoundaryID: 357464,
          step: 0
        }
      };
      
      const usersRef = ref(database, 'users');
      await set(usersRef, initialUsers);
      return true;
    } catch (error) {
      console.error('Error setting up initial data:', error);
      throw error;
    }
  }
};

export { database };