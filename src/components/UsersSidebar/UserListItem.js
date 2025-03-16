import React from 'react';

function UserListItem({ 
  user, 
  isCurrentUser, 
  getStepColor, 
  getStepText, 
  calculateProgress, 
  calculateWinningProbability,
  totalUsers
}) {
  return (
    <div className={`user-list-item ${isCurrentUser ? 'current-user-item' : ''}`}>
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
            <span className="progress-chance">当選率 {calculateWinningProbability(user.step, totalUsers)}%</span>
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
  );
}

export default UserListItem;