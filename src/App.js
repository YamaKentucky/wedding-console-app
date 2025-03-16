import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { firebaseService } from './firebase';
import { getBrowserUserId, getSavedPrimaryId } from './utils/browserIdentity';
import { getStepText, getStepColor, calculateWinningProbability, calculateProgress } from './utils/lotteryUtils';

// Import components
import Header from './components/Header/Header';

// Import pages
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import AnnouncementPage from './pages/AnnouncementPage';

// Import styles
import './App.css';

function App() {
  // ステート管理
  const [users, setUsers] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // 抽選関連の状態
  const [isSpinningUser, setIsSpinningUser] = useState(false);
  const [isSpinningGift, setIsSpinningGift] = useState(false);
  const [winner, setWinner] = useState(null);
  const [selectedGift, setSelectedGift] = useState(null);
  const [recentWinners, setRecentWinners] = useState([]);
  // ローカルストレージから抽選設定を読み込む（デフォルトは無効）
  const [eligibleOnly, setEligibleOnly] = useState(() => {
    const savedSetting = localStorage.getItem('eligibleOnly');
    return savedSetting !== null ? savedSetting === 'true' : false;
  });
  const [updateStatus, setUpdateStatus] = useState({ pending: false, success: null });
  
  // 表示設定の状態
  // ローカルストレージから自動スクロール設定を読み込む（デフォルトは有効）
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(() => {
    const savedSetting = localStorage.getItem('autoScrollEnabled');
    return savedSetting !== null ? savedSetting === 'true' : true;
  });

  // ブラウザID & ユーザーデータの初期化
  useEffect(() => {
    const browser_id = getBrowserUserId();
    
    setLoading(true);
    
    // Firebaseからデータを読み込みとリアルタイム監視を設定
    const initializeData = async () => {
      try {
        // ユーザーデータを取得
        const usersData = await firebaseService.getAllUsers();
        
        // データがなければ初期データをセットアップ
        if (usersData.length === 0) {
          await firebaseService.setupInitialData();
          // 初期データセットアップ後に再取得
          const initialUsers = await firebaseService.getAllUsers();
          setUsers(initialUsers);
        } else {
          setUsers(usersData);
        }

        // ギフトデータを取得
        try {
          const giftsData = await firebaseService.getAllGifts();
          setGifts(giftsData);
        } catch (giftError) {
          console.error('ギフトデータの取得エラー:', giftError);
          // ギフトデータが取得できなくても、アプリは継続する
        }
        
        // 抽選履歴を取得
        try {
          const lotteryLogs = await firebaseService.getLotteryLogs();
          if (lotteryLogs && lotteryLogs.length > 0) {
            // 最新のログを先頭に表示
            setRecentWinners(lotteryLogs.slice(0, 5));
          }
        } catch (logError) {
          console.error('抽選履歴の取得エラー:', logError);
        }
        
        // リアルタイム監視を設定
        const unsubscribe = firebaseService.watchUsersAndGifts((updatedData) => {
          console.log('Realtime update received:', updatedData);
          
          // ユーザー更新
          if (updatedData.users) {
            // 各ユーザーに表示名の最初の文字をアバターとして追加
            const usersWithAvatars = updatedData.users.map(user => ({
              ...user,
              avatar: user.sucsessID ? user.sucsessID.charAt(0) : '?',
              name: user.name || user.sucsessID // 名前フィールドがあれば使用、なければsucsessIDを使用
            }));
            
            setUsers(usersWithAvatars);
            
            // 保存されたPrimaryIDがあれば、対応するユーザーを探す
            const savedPrimaryId = getSavedPrimaryId();
            if (savedPrimaryId) {
              const matchedUser = usersWithAvatars.find(u => 
                u.primaryID?.toString() === savedPrimaryId ||
                u.browserId === browser_id
              );
              
              if (matchedUser) {
                setCurrentUser(matchedUser);
              }
            }
          }

          // ギフト更新
          if (updatedData.gifts) {
            setGifts(updatedData.gifts);
          }
          
          // 抽選ログの更新
          if (updatedData.lotteryLogs) {
            const logsArray = Object.values(updatedData.lotteryLogs);
            if (logsArray.length > 0) {
              // 最新のログを先頭に表示（最大5件）
              setRecentWinners(logsArray.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
              ).slice(0, 5));
            }
          }
        });
        
        setLoading(false);
        
        // クリーンアップ関数
        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.error('初期化エラー:', err);
        setError('初期化中にエラーが発生しました: ' + err.message);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 設定が変更されたときにローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('autoScrollEnabled', autoScrollEnabled.toString());
  }, [autoScrollEnabled]);

  useEffect(() => {
    localStorage.setItem('eligibleOnly', eligibleOnly.toString());
  }, [eligibleOnly]);

  // Firebaseでユーザーを更新する
  const updateUserStep = async (userId, newStep) => {
    try {
      setUpdateStatus({ pending: true, success: null });
      await firebaseService.updateUser(userId, { step: newStep });
      setUpdateStatus({ pending: false, success: true });
      console.log(`User step updated to ${newStep}`);
      
      return true;
    } catch (error) {
      console.error('Error updating user step:', error);
      setUpdateStatus({ pending: false, success: false });
      throw error;
    }
  };

  // ギフトの在庫を減らす
  const decreaseGiftStock = async (giftId) => {
    try {
      setUpdateStatus({ pending: true, success: null });
      const gift = gifts.find(g => g.id === giftId);
      if (gift && gift.stock > 0) {
        await firebaseService.updateGift(giftId, { stock: gift.stock - 1 });
        setUpdateStatus({ pending: false, success: true });
        console.log(`Gift stock updated for ${giftId}`);
      }
      return true;
    } catch (error) {
      console.error('Error updating gift stock:', error);
      setUpdateStatus({ pending: false, success: false });
      throw error;
    }
  };

  // 当選者を抽選する関数
const startUserLottery = () => {
  setIsSpinningUser(true);
  setWinner(null);
  setSelectedGift(null);
  
  // 設定に基づいて対象ユーザーをフィルタリング
  // さらに、すでに当選者になっているユーザーを除外する
  let eligibleUsers = eligibleOnly
    ? users.filter(user => user.step >= 1) // 謎解き参加者のみをフィルタリング
    : users; // すべてのユーザーを対象
  
  // すでに当選者になっているユーザーを除外
  eligibleUsers = eligibleUsers.filter(user => user.gift !== "True");

  console.log(`抽選対象者: ${eligibleUsers.length}人 (謎解き参加者のみ: ${eligibleOnly}, 過去当選者除外)`);
  
  if (eligibleUsers.length === 0) {
    setTimeout(() => {
      setIsSpinningUser(false);
      alert('抽選対象となるユーザーがいません');
      return;
    }, 2000);
    return;
  }
  
  // アニメーション効果：ユーザーを高速で循環表示
  let counter = 0;
  const cycleUsers = setInterval(async () => {
    const randomIndex = Math.floor(Math.random() * eligibleUsers.length);
    setWinner(eligibleUsers[randomIndex]);
    counter++;
    
    if (counter > 15) {
      clearInterval(cycleUsers);
      setIsSpinningUser(false);
      
      // 当選確率に影響を与える（進捗度が高いほど当選しやすい）
      const weightedUsers = [];
      eligibleUsers.forEach(user => {
        // ステップに応じて配列に複数回追加（重み付け）
        const weight = user.step + 1; // ステップ0でも最低1回は追加
        for (let i = 0; i < weight; i++) {
          weightedUsers.push(user);
        }
      });
      
      // 重み付けされた配列からランダムに選択
      const finalIndex = Math.floor(Math.random() * weightedUsers.length);
      const finalWinner = weightedUsers[finalIndex];
      
      setWinner(finalWinner);
      console.log(`当選者: ${finalWinner.sucsessID} (進捗度: ${finalWinner.step})`);
    }
  }, 100);
};

  // ギフトを抽選する関数
  const startGiftLottery = () => {
    if (!winner) {
      alert('先に当選者を選んでください');
      return;
    }

    setIsSpinningGift(true);
    setSelectedGift(null);

    // 在庫があるギフトのみ対象にする
    const availableGifts = gifts.filter(gift => gift.stock > 0);
    
    if (availableGifts.length === 0) {
      setTimeout(() => {
        setIsSpinningGift(false);
        alert('景品の在庫がありません');
        return;
      }, 1000);
      return;
    }

    // アニメーション効果：ギフトを高速で循環表示
    let counter = 0;
    const cycleGifts = setInterval(async () => {
      const randomIndex = Math.floor(Math.random() * availableGifts.length);
      setSelectedGift(availableGifts[randomIndex]);
      counter++;
      
      if (counter > 10) {
        clearInterval(cycleGifts);
        setIsSpinningGift(false);
        
        // 最終的なギフトを選択
        const finalGift = availableGifts[Math.floor(Math.random() * availableGifts.length)];
        setSelectedGift(finalGift);
        
        // 当選結果を生成
        const winResult = {
          user: winner,
          gift: {
            id: finalGift.id,
            name: finalGift.name,
            price: finalGift.price,
            imgKey: finalGift.imgKey // S3の画像キーを保存
          },
          timestamp: new Date().toISOString()
        };
        
        try {
          // ユーザーを当選者としてマーク
          await firebaseService.setUserAsWinner(winner.id);
          
          // ギフトの在庫を減らす
          await decreaseGiftStock(finalGift.id);
          
          // Firebaseに抽選ログを追加
          await firebaseService.addLotteryLog(winResult);
          
          // 当選結果を履歴に追加
          setRecentWinners(prev => [winResult, ...prev].slice(0, 5));
          
          console.log(`景品決定: ${finalGift.name}`);
        } catch (error) {
          console.error('Failed to update after lottery:', error);
        }
      }
    }, 100);
  };

  if (loading) {
    return <div className="container loading">データを読み込み中...</div>;
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  // 各ページに渡す共通のプロップス
  const commonProps = {
    users,
    gifts,
    winner,
    selectedGift,
    recentWinners,
    eligibleOnly,
    setEligibleOnly,
    isSpinningUser,
    isSpinningGift,
    updateStatus,
    startUserLottery,
    startGiftLottery,
    getStepText,
    getStepColor,
    calculateProgress,
    calculateWinningProbability,
    currentUser,
    autoScrollEnabled,
    setAutoScrollEnabled
  };

  return (
    <Router>
      <div className="App">
        <Header />
        
        <Routes>
          <Route 
            path="/" 
            element={<HomePage {...commonProps} />} 
          />
          <Route 
            path="/settings" 
            element={<SettingsPage {...commonProps} />} 
          />
          <Route 
            path="/announcement" 
            element={<AnnouncementPage users={users} gifts={gifts} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;