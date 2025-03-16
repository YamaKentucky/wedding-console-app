import React, { useState, useEffect, useRef } from 'react';
import { firebaseService } from './firebase';
import { 
  getBrowserUserId, 
  associateUserWithPrimaryId, 
  getSavedPrimaryId,
  resetBrowserAssociation 
} from './utils/browserIdentity';
import './App.css';

function App() {
  // ステート管理
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [browserId, setBrowserId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // 抽選関連の状態
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [recentWinners, setRecentWinners] = useState([]);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ pending: false, success: null });
  
  // スクロール用のref
  const usersListRef = useRef(null);

  // ブラウザID & ユーザーデータの初期化
  useEffect(() => {
    const browser_id = getBrowserUserId();
    setBrowserId(browser_id);
    
    setLoading(true);
    
    // Firebaseからデータを読み込みとリアルタイム監視を設定
    const initializeData = async () => {
      try {
        // まずFirebaseからデータを取得
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
        
        // リアルタイム監視を設定
        const unsubscribe = firebaseService.watchUsers((updatedUsers) => {
          console.log('Realtime update received:', updatedUsers);
          
          // 各ユーザーに表示名の最初の文字をアバターとして追加
          const usersWithAvatars = updatedUsers.map(user => ({
            ...user,
            avatar: user.sucsessID ? user.sucsessID.charAt(0) : '?',
            name: user.sucsessID // 一時的に表示名としてsucsessIDを使用
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
  
  // 参加者リストの自動スクロール
  useEffect(() => {
    if (!usersListRef.current || users.length <= 3) return;
    
    let animationId;
    let startTime;
    const scrollDuration = 80000; // スクロールにかける時間（ミリ秒）
    const listHeight = usersListRef.current.scrollHeight;
    
    const scrollLoop = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      
      // スクロール位置を計算
      const scrollPosition = (elapsedTime % scrollDuration) / scrollDuration * listHeight;
      
      if (usersListRef.current) {
        usersListRef.current.scrollTop = scrollPosition;
      }
      
      animationId = requestAnimationFrame(scrollLoop);
    };
    
    animationId = requestAnimationFrame(scrollLoop);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [users]);

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

  // 抽選を開始する関数
  const startLottery = () => {
    setIsSpinning(true);
    setWinner(null);
    
    // チェックボックスが選択されている場合は対象ユーザーのみをフィルタリング
    const eligibleUsers = eligibleOnly
      ? users.filter(user => user.step >= 1)
      : users;
    
    if (eligibleUsers.length === 0) {
      setTimeout(() => {
        setIsSpinning(false);
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
        setIsSpinning(false);
        
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
        setRecentWinners(prev => [finalWinner, ...prev].slice(0, 5));
        
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
  
  // 進捗ステップのテキストを取得する関数
  const getStepText = (step) => {
    switch(step) {
      case 0: return '未解答';
      case 1: return '第1の謎を解明';
      case 2: return '第2の謎を解明';
      case 3: return '全ての謎を解明';
      default: return '不明';
    }
  };
  
  // 進捗ステップの色を取得する関数
  const getStepColor = (step) => {
    switch(step) {
      case 0: return 'status-0';
      case 1: return 'status-1';
      case 2: return 'status-2';
      case 3: return 'status-3';
      default: return 'status-0';
    }
  };
  
  // 当選確率を計算する関数（進捗に応じて確率が上がる）
  const calculateWinningProbability = (step, totalUsers) => {
    const baseChance = 1 / totalUsers; // 基本の確率
    const multiplier = step + 1; // ステップに応じた倍率
    const probability = (baseChance * multiplier) * 100;
    return Math.min(probability, 100).toFixed(1); // 最大100%に制限
  };
  
  // 進捗率を計算する関数
  const calculateProgress = (step) => {
    return (step / 3) * 100;
  };

  if (loading) {
    return <div className="container loading">データを読み込み中...</div>;
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>謎解きチャレンジ抽選会</h1>
      </header>
      
      <div className="app-container">
        {/* メイン抽選セクション（中央） */}
        <div className="lottery-section">
          <div className="panel lottery-panel">
            <h2>ラッキードロー</h2>
            
            <div className="lottery-controls">
              <div className="eligibility-filter">
                <input 
                  type="checkbox" 
                  id="eligibleOnly" 
                  checked={eligibleOnly}
                  onChange={() => setEligibleOnly(!eligibleOnly)}
                />
                <label htmlFor="eligibleOnly">謎解き挑戦者のみで抽選</label>
              </div>
              
              <button 
                onClick={startLottery} 
                disabled={isSpinning || updateStatus.pending}
                className="submit-btn lottery-btn"
              >
                {isSpinning ? '抽選中...' : '抽選開始'}
              </button>
            </div>
            
            {/* 当選者表示 */}
            <div className="winner-display">
              {winner ? (
                <div className={`winner-card ${isSpinning ? 'spinning' : ''}`}>
                  <h3>当選者</h3>
                  <div className="winner-avatar">{winner.avatar}</div>
                  <div className="winner-name">{winner.sucsessID}</div>
                  <div className="winner-id">ID: {winner.primaryID}</div>
                  <div className={`status ${getStepColor(winner.step)}`}>
                    {getStepText(winner.step)}
                  </div>
                </div>
              ) : (
                <div className="no-winner-message">
                  抽選ボタンを押して当選者を選びましょう
                </div>
              )}
            </div>
            
            {/* 過去の当選者 */}
            {recentWinners.length > 0 && (
              <div className="recent-winners">
                <h3>過去の当選者</h3>
                <div className="winners-list">
                  {recentWinners.map((user, index) => (
                    <div key={`${user.id}-${index}`} className="winner-list-item">
                      <div className="winner-mini-avatar">{user.avatar}</div>
                      <div className="winner-info">
                        <div className="winner-mini-name">{user.sucsessID}</div>
                        <div className="winner-mini-id">ID: {user.primaryID}</div>
                      </div>
                      <div className={`status ${getStepColor(user.step)}`}>
                        {getStepText(user.step)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 更新ステータス表示 */}
            {updateStatus.pending && (
              <div className="update-status pending">
                データベース更新中...
              </div>
            )}
            {updateStatus.success === true && (
              <div className="update-status success">
                データベース更新完了
              </div>
            )}
            {updateStatus.success === false && (
              <div className="update-status error">
                データベース更新失敗
              </div>
            )}
            
            {/* 謎解き進捗による当選確率の説明 */}
            <div className="lottery-info">
              <h3>当選確率について</h3>
              <p>謎解きの進捗度に応じて当選確率が上がります。より多くの謎を解けば、当選確率が高くなります！</p>
              <div className="probability-table">
                <div className="prob-row prob-header">
                  <div>進捗度</div>
                  <div>当選確率</div>
                </div>
                <div className="prob-row">
                  <div className="prob-status status-0">未解答</div>
                  <div>基本確率</div>
                </div>
                <div className="prob-row">
                  <div className="prob-status status-1">第1の謎を解明</div>
                  <div>基本確率×2</div>
                </div>
                <div className="prob-row">
                  <div className="prob-status status-2">第2の謎を解明</div>
                  <div>基本確率×3</div>
                </div>
                <div className="prob-row">
                  <div className="prob-status status-3">全ての謎を解明</div>
                  <div>基本確率×4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ユーザー情報サイドバー（右側） */}
        <div className="users-sidebar">
          <div className="panel">
            <h2>参加者一覧</h2>
            
            <div className="users-list-container">
              <div className="users-list" ref={usersListRef}>
                {/* データを二回繰り返して表示することでループ効果を強化 */}
                {[...users, ...users].map((user, index) => (
                  <div key={`${user.id}-${index}`} className={`user-list-item ${currentUser && user.id === currentUser.id ? 'current-user-item' : ''}`}>
                    <div className="user-item-header">
                      <div className="user-avatar">{user.avatar}</div>
                      <div className="user-info">
                        <div className="user-name">{user.sucsessID}</div>
                        <div className="user-id">ID: {user.primaryID}</div>
                      </div>
                    </div>
                    
                    <div className="user-progress">
                      <div className="progress-header">
                        <div className={`status ${getStepColor(user.step)}`}>
                          {getStepText(user.step)}
                        </div>
                        <div className="progress-detail">
                          <span className="progress-percent">{calculateProgress(user.step).toFixed(0)}% 完了</span>
                          <span className="progress-chance">当選率 {calculateWinningProbability(user.step, users.length)}%</span>
                        </div>
                      </div>
                      
                      <div className="progress-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${calculateProgress(user.step)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;