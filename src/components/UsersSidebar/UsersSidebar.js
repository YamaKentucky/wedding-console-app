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
  
  // 謎解きを達成した人のランキングを計算（成功時間順）
  const completedRanking = useMemo(() => {
    // step = 3の人だけを抽出し、成功時間でソート
    const completedUsers = [...users]
      .filter(user => user.step === 3 && user.successTime)
      .sort((a, b) => {
        // 成功時間が早い順にソート
        const timeA = new Date(a.successTime || '9999-12-31');
        const timeB = new Date(b.successTime || '9999-12-31');
        return timeA - timeB;
      });
      
    // 順位をマップに保存 {userId: rank}
    const rankMap = {};
    completedUsers.forEach((user, index) => {
      rankMap[user.id] = index + 1;
    });
    
    return rankMap;
  }, [users]);
  
  // ユーザーをソート：
  // 1. 謎解き達成者（step=3）を成功時間順で優先表示
  // 2. 未達成者は進捗度順
  const sortedUsers = useMemo(() => {
    // 達成者（step=3かつsuccessTimeがある）と未達成者に分割
    const completed = users.filter(user => user.step === 3 && user.successTime);
    const others = users.filter(user => !(user.step === 3 && user.successTime));
    
    // 達成者を成功時間順にソート
    const sortedCompleted = [...completed].sort((a, b) => {
      const timeA = new Date(a.successTime || '9999-12-31');
      const timeB = new Date(b.successTime || '9999-12-31');
      return timeA - timeB;
    });
    
    // 未達成者を進捗（step）の降順、同一進捗内では名前順にソート
    const sortedOthers = [...others].sort((a, b) => {
      // 進捗（step）で降順ソート
      if (b.step !== a.step) {
        return b.step - a.step;
      }
      
      // 進捗が同じ場合は名前でソート（昇順）
      return a.sucsessID?.localeCompare(b.sucsessID) || 0;
    });
    
    // 達成者を先頭に、未達成者をその後ろに配置して返す
    return [...sortedCompleted, ...sortedOthers];
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
                hideRank={true}
                completedRank={user.step === 3 && user.successTime ? completedRanking[user.id] : null}
                successTime={user.successTime}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersSidebar;