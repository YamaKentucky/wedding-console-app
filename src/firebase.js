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

// チャタリング防止のためのデバウンス関数
const debounce = (callback, delay = 300) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
      timeoutId = null;
    }, delay);
  };
};

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
  
  // ギフトデータを取得
  async getAllGifts() {
    try {
      const giftsRef = ref(database, 'gifts');
      const snapshot = await get(giftsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([id, giftData]) => ({
          id,
          ...giftData
        }));
      }
      
      // ギフトデータがなければ初期データをセットアップ
      await this.setupInitialGifts();
      const initialSnapshot = await get(giftsRef);
      
      if (initialSnapshot.exists()) {
        const data = initialSnapshot.val();
        return Object.entries(data).map(([id, giftData]) => ({
          id,
          ...giftData
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching gifts:', error);
      throw error;
    }
  },
  
  // ユーザーとギフトをリアルタイムで監視（チャタリング対策あり）
  watchUsersAndGifts(callback) {
    const rootRef = ref(database);
    
    // デバウンスされたコールバック関数
    const debouncedCallback = debounce((result) => {
      callback(result);
    }, 300); // 300ms間に複数の更新があった場合、最後の更新のみを処理
    
    return onValue(rootRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const result = {};
        
        // ユーザーデータがあれば処理
        if (data.users) {
          result.users = Object.entries(data.users).map(([id, userData]) => ({
            id,
            ...userData
          }));
        }
        
        // ギフトデータがあれば処理
        if (data.gifts) {
          result.gifts = Object.entries(data.gifts).map(([id, giftData]) => ({
            id,
            ...giftData
          }));
        }
        
        debouncedCallback(result);
      } else {
        debouncedCallback({});
      }
    }, (error) => {
      console.error('Error watching data:', error);
      debouncedCallback({});
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
  
  // 新しいギフトデータを保存
  async saveGift(giftId, giftData) {
    try {
      const giftRef = ref(database, `gifts/${giftId}`);
      await set(giftRef, giftData);
      return true;
    } catch (error) {
      console.error('Error saving gift:', error);
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
  
  // ギフトデータを更新
  async updateGift(giftId, updates) {
    try {
      console.log(`Updating gift ${giftId} with:`, updates);
      const giftRef = ref(database, `gifts/${giftId}`);
      await update(giftRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating gift:', error);
      throw error;
    }
  },
  
  // ユーザーを当選者に設定する
  async setUserAsWinner(userId) {
    try {
      console.log(`Setting user ${userId} as winner`);
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, { gift: "True" });
      return true;
    } catch (error) {
      console.error('Error setting user as winner:', error);
      throw error;
    }
  },
  
  // ユーザーの当選ステータスをリセットする
  async resetUserWinnerStatus(userId) {
    try {
      console.log(`Resetting winner status for user ${userId}`);
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, { gift: null });
      return true;
    } catch (error) {
      console.error('Error resetting winner status:', error);
      throw error;
    }
  },
  
  // 初期ユーザーデータをセットアップ
  async setupInitialData() {
    try {
      const initialUsers = {
        'user001': {
          name: "テストユーザー1",
          sucsessID: "ユーザー1",
          primaryID: 101,
          secoundaryID: 10001,
          step: 0,
          gift: null
        },
        'user002': {
          name: "テストユーザー2",
          sucsessID: "ユーザー2",
          primaryID: 102,
          secoundaryID: 10002,
          step: 1,
          gift: null
        },
        'user003': {
          name: "テストユーザー3",
          sucsessID: "ユーザー3",
          primaryID: 103,
          secoundaryID: 10003,
          step: 2,
          gift: null
        },
        'user004': {
          name: "当選者テスト",
          sucsessID: "当選者",
          primaryID: 104,
          secoundaryID: 10004,
          step: 3,
          gift: "True"
        }
      };
      
      const usersRef = ref(database, 'users');
      await set(usersRef, initialUsers);
      return true;
    } catch (error) {
      console.error('Error setting up initial data:', error);
      throw error;
    }
  },
  
  // 初期ギフトデータをセットアップ
  async setupInitialGifts() {
    try {
      const initialGifts = {
        'gift001': {
          name: "スタバお菓子",
          price: 1000,
          stock: 10
        },
        'gift002': {
          name: "柔軟剤",
          price: 200,
          stock: 10
        },
        'gift003': {
          name: "お肉",
          price: 300,
          stock: 10
        }
      };
      
      const giftsRef = ref(database, 'gifts');
      await set(giftsRef, initialGifts);
      return true;
    } catch (error) {
      console.error('Error setting up initial gifts:', error);
      throw error;
    }
  }
};

export { database };