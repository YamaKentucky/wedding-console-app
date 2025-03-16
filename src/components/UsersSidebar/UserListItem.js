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
  rank
}) {
  const winningProb = calculateWinningProbability(user.step, totalUsers);
  
  return (
    <div className={`user-list-item ${isCurrentUser ? 'current-user-item' : ''} ${isWinner ? 'winner-item' : ''}`}>
      <div className="user-item-header">
        <div className="user-rank">{rank}</div>
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