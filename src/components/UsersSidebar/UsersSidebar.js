import React from 'react';
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
  // CSSマーキーアニメーション用に、データを2セット用意
  const displayUsers = [...users, ...users];
  
  return (
    <div className="users-sidebar">
      <div className="panel">
        <h2>参加者一覧</h2>
        
        <div className="users-list-container">
          <div className="users-list">
            {displayUsers.map((user, index) => (
              <UserListItem
                key={`${user.id}-${index}`}
                user={user}
                isCurrentUser={currentUser && user.id === currentUser.id}
                getStepColor={getStepColor}
                getStepText={getStepText}
                calculateProgress={calculateProgress}
                calculateWinningProbability={calculateWinningProbability}
                totalUsers={users.length}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersSidebar;