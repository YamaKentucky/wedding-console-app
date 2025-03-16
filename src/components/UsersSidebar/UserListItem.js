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
  completedRank
}) {
  const winningProb = calculateWinningProbability(user.step, totalUsers);
  
  // ランク1～3までは特別なクラスを追加
  const getRankIconClass = (rank) => {
    if (rank === 1) return 'rank-icon rank-icon-1';
    if (rank === 2) return 'rank-icon rank-icon-2';
    if (rank === 3) return 'rank-icon rank-icon-3';
    return 'rank-icon';
  };
  
  return (
    <div className={`user-list-item ${isCurrentUser ? 'current-user-item' : ''} ${isWinner ? 'winner-item' : ''}`}>
      <div className="user-item-header">
        {/* 謎解き達成者（step=3）の場合にランクアイコンを表示 */}
        {completedRank && (
          <div className={getRankIconClass(completedRank)}>{completedRank}</div>
        )}
        <div className="user-info">
          <div className="user-name">
            {user.sucsessID}
            {isWinner && <span className="winner-badge">当選者</span>}
          </div>
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