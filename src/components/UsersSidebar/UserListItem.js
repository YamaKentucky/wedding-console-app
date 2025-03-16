import React from 'react';

function UserListItem({ 
  user, 
  isCurrentUser, 
  isWinner,
  getStepColor, 
  getStepText, 
  calculateProgress, 
  calculateWinningProbability,
  totalUsers,
  hideRank = false,
  completedRank,
  successTime
}) {
  const winningProb = calculateWinningProbability(user.step, totalUsers);
  
  // 成功時間をフォーマットする関数
  const formatSuccessTime = (timeString) => {
    if (!timeString) return null;
    
    try {
      const date = new Date(timeString);
      
      // 日本時間のフォーマット
      return new Intl.DateTimeFormat('ja-JP', { 
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (e) {
      console.error('Invalid date format:', e);
      return null;
    }
  };
  
  // ランク1～3までは特別なクラスを追加
  const getRankIconClass = (rank) => {
    if (rank === 1) return 'rank-icon rank-icon-1';
    if (rank === 2) return 'rank-icon rank-icon-2';
    if (rank === 3) return 'rank-icon rank-icon-3';
    return 'rank-icon';
  };
  
  // const formattedTime = formatSuccessTime(successTime);
  const isCompleted = user.step === 3; // 達成者かどうか
  
  return (
    <div className={`user-list-item 
      ${isCurrentUser ? 'current-user-item' : ''} 
      ${isWinner ? 'winner-item' : ''} 
      ${isCompleted ? 'completed-user' : ''}`}
    >
      <div className="user-item-header">
        {/* 謎解き達成者（step=3）の場合にランクアイコンを表示 */}
        {completedRank && (
          <div className={getRankIconClass(completedRank)}>{completedRank}</div>
        )}
        <div className="user-info">
          <div className="user-name">
            {user.sucsessID}
            {/* {isWinner && <span className="winner-badge">当選者</span>} */}
          </div>
          {/* 成功時間がある場合のみ表示 */}
          {/* {formattedTime && (
            <div className="success-time">達成: {formattedTime}</div>
          )} */}
        </div>
        <div className="winning-chance">{winningProb}%</div>
      </div>
      
      <div className="status-row">
        <div className={`status ${getStepColor(user.step)}`}>
          {getStepText(user.step)}
        </div>
      </div>
      
      <div className="user-progress">
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{ width: `${calculateProgress(user.step)}%` }}
          ></div>
        </div>
      </div>
      
      {isWinner && 
        <div className="winner-decoration">
          <span className="winner-star">★</span>
        </div>
      }
    </div>
  );
}

export default UserListItem;