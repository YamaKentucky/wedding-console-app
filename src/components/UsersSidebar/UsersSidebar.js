import React, { useEffect, useRef, useMemo } from 'react';
import UserListItem from './UserListItem';
import './UsersSidebar.css';

function UsersSidebar({ 
  users, 
  currentUser, 
  getStepText, 
  getStepColor, 
  calculateProgress, 
  calculateWinningProbability,
  autoScrollEnabled
}) {
  const listRef = useRef(null);
  
  // 謎解きを達成した人のランキングを計算
  const completedRanking = useMemo(() => {
    // step = 3の人だけを抽出し、名前でソート
    const completedUsers = [...users]
      .filter(user => user.step === 3)
      .sort((a, b) => a.sucsessID?.localeCompare(b.sucsessID) || 0);
      
    // 順位をマップに保存 {userId: rank}
    const rankMap = {};
    completedUsers.forEach((user, index) => {
      rankMap[user.id] = index + 1;
    });
    
    return rankMap;
  }, [users]);
  
  // ユーザーをソート：
  // 1. 進捗（step）の降順でソート
  // 2. 同一進捗内ではユーザー名（sucsessID）でソート
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      // 進捗（step）で降順ソート
      if (b.step !== a.step) {
        return b.step - a.step;
      }
      
      // 進捗が同じ場合は名前でソート（昇順）
      return a.sucsessID?.localeCompare(b.sucsessID) || 0;
    });
  }, [users]);
  
  // 自動スクロール機能
  useEffect(() => {
    let autoScrollTimer;
    let scrollInterval;
    
    const startAutoScroll = () => {
      if (!listRef.current || !autoScrollEnabled) return;
      
      const scrollContainer = listRef.current;
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      let currentPos = scrollContainer.scrollTop || 0;
      
      // スクロールが必要ない場合はスクロールしない
      if (scrollHeight <= clientHeight) return;
      
      scrollInterval = setInterval(() => {
        // 少しずつスクロール
        currentPos += 1;
        scrollContainer.scrollTop = currentPos;
        
        // 最下部に到達したら最上部に戻る
        if (currentPos >= (scrollHeight - clientHeight)) {
          currentPos = 0;
          
          // スムーズな遷移のために一時停止
          clearInterval(scrollInterval);
          setTimeout(() => {
            scrollContainer.scrollTop = 0;
            if (autoScrollEnabled) {
              startAutoScroll();
            }
          }, 2000);
        }
      }, 50); // スクロール速度を調整（数値が小さいほど速い）
    };
    
    // 自動スクロールが有効な場合のみスクロールを開始
    if (autoScrollEnabled) {
      // 最初にスクロールを開始（少し遅延させる）
      autoScrollTimer = setTimeout(startAutoScroll, 3000);
    }
    
    // コンポーネントのアンマウント時またはautoScrollEnabledが変更された時にタイマーとインターバルをクリア
    return () => {
      clearTimeout(autoScrollTimer);
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [sortedUsers.length, autoScrollEnabled]);
  
  return (
    <div className="users-sidebar">
      <div className="panel">
        <h2>謎解きチャレンジ参加者</h2>
        
        <div className="users-list-container">
          <div className={`users-list ${!autoScrollEnabled ? 'manual-scroll' : ''}`} ref={listRef}>
            {sortedUsers.map((user) => (
              <UserListItem
                key={`${user.id}`}
                user={user}
                isCurrentUser={currentUser && user.id === currentUser.id}
                isWinner={user.gift === "True"}
                getStepColor={getStepColor}
                getStepText={getStepText}
                calculateProgress={calculateProgress}
                calculateWinningProbability={calculateWinningProbability}
                totalUsers={users.length}
                hideRank={true} // 通常のランキングは非表示
                completedRank={user.step === 3 ? completedRanking[user.id] : null} // 達成者のみランクを表示
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersSidebar;