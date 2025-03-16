import React, { useEffect, useRef, useMemo } from 'react';
import UserListItem from './UserListItem';
import './UsersSidebar.css';

function UsersSidebar({ 
  users, 
  currentUser, 
  getStepText, 
  getStepColor, 
  calculateProgress, 
  calculateWinningProbability 
}) {
  const listRef = useRef(null);
  
  // ユーザーをソート：
  // 1. 進捗（step）の降順でソート
  // 2. 同一進捗内ではユーザー名（sucsessID）でソート
  // 注: 当選の有無はランキングに影響しない
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      // 進捗（step）で降順ソート
      if (b.step !== a.step) {
        return b.step - a.step;
      }
      
      // 進捗が同じ場合は名前でソート（昇順）
      return a.sucsessID?.localeCompare(b.sucsessID) || 0;
    });
  }, [users]); // usersが変更された時のみ再計算
  
  // 自動スクロール機能
  useEffect(() => {
    let autoScrollTimer;
    let scrollInterval;
    
    const startAutoScroll = () => {
      if (!listRef.current) return;
      
      const scrollContainer = listRef.current;
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      let currentPos = 0;
      
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
            startAutoScroll();
          }, 2000);
        }
      }, 50); // スクロール速度を調整（数値が小さいほど速い）
    };
    
    // 最初にスクロールを開始（少し遅延させる）
    autoScrollTimer = setTimeout(startAutoScroll, 3000);
    
    // コンポーネントのアンマウント時にタイマーとインターバルをクリア
    return () => {
      clearTimeout(autoScrollTimer);
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [sortedUsers.length]); // ユーザー数が変わった時だけ再設定
  
  return (
    <div className="users-sidebar">
      <div className="panel">
        <h2>謎解き達成ランキング</h2>
        
        <div className="users-list-container">
          <div className="users-list" ref={listRef}>
            {sortedUsers.map((user, index) => (
              <UserListItem
                key={`${user.id}`} // インデックスを除いて、IDのみで一意に識別
                user={user}
                isCurrentUser={currentUser && user.id === currentUser.id}
                isWinner={user.gift === "True"}
                getStepColor={getStepColor}
                getStepText={getStepText}
                calculateProgress={calculateProgress}
                calculateWinningProbability={calculateWinningProbability}
                totalUsers={users.length}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersSidebar;