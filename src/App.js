import React, { useState, useEffect } from 'react';
import { firebaseService } from './firebase';
import { getBrowserUserId, getSavedPrimaryId } from './utils/browserIdentity';
import { getStepText, getStepColor, calculateWinningProbability, calculateProgress } from './utils/lotteryUtils';

// Import components
import Header from './components/Header/Header';
import LotterySection from './components/LotterySection/LotterySection';
import UsersSidebar from './components/UsersSidebar/UsersSidebar';

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
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ pending: false, success: null });

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
    
    // チェックボックスが選択されている場合は対象ユーザーのみをフィルタリング
    const eligibleUsers = eligibleOnly
      ? users.filter(user => user.step >= 1)
      : users;
    
    if (eligibleUsers.length === 0) {
      setTimeout(() => {
        setIsSpinningUser(false);
        // 対象ユーザーなし
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
        
        // 当選者の進捗ステップを増加（Firebaseにも反映）
        if (finalWinner.step < 3) {
          const newStep = finalWinner.step + 1;
          try {
            await updateUserStep(finalWinner.id, newStep);
            
            // 当選者の状態を更新（表示用）
            setWinner({
              ...finalWinner,
              step: newStep
            });
            
            // ローカルのユーザーリストも更新
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user.id === finalWinner.id ? { ...user, step: newStep } : user
              )
            );
          } catch (error) {
            console.error('Failed to update winner step:', error);
          }
        }
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
        
        // 当選結果を履歴に追加
        const winResult = {
          user: winner,
          gift: finalGift,
          timestamp: new Date().toISOString()
        };
        setRecentWinners(prev => [winResult, ...prev].slice(0, 5));
        
        try {
          // ユーザーを当選者としてマーク
          await firebaseService.setUserAsWinner(winner.id);
          
          // ギフトの在庫を減らす
          await decreaseGiftStock(finalGift.id);
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

  return (
    <div className="App">
      <Header />
      
      <div className="app-container">
        <LotterySection
          users={users}
          gifts={gifts}
          winner={winner}
          selectedGift={selectedGift}
          recentWinners={recentWinners}
          eligibleOnly={eligibleOnly}
          setEligibleOnly={setEligibleOnly}
          isSpinningUser={isSpinningUser}
          isSpinningGift={isSpinningGift}
          updateStatus={updateStatus}
          startUserLottery={startUserLottery}
          startGiftLottery={startGiftLottery}
          getStepText={getStepText}
          getStepColor={getStepColor}
        />
        
        <UsersSidebar
          users={users}
          currentUser={currentUser}
          getStepText={getStepText}
          getStepColor={getStepColor}
          calculateProgress={calculateProgress}
          calculateWinningProbability={calculateWinningProbability}
        />
      </div>
    </div>
  );
}

export default App;