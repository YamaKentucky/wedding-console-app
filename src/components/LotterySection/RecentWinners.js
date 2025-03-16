import React from 'react';

function RecentWinners({ recentWinners }) {
  if (recentWinners.length === 0) {
    return null;
  }
  
  return (
    <div className="winners-list">
      {recentWinners.map((result, index) => (
        <div key={index} className="winner-list-item">
          <div className="winner-mini-avatar">{result.user.avatar}</div>
          <div className="winner-info">
            <div className="winner-mini-name">{result.user.sucsessID}</div>
            <div className="winner-mini-id">ID: {result.user.primaryID}</div>
          </div>
          <div className="winner-gift">
            <span className="gift-emoji">🎁</span>
            <span className="gift-name">{result.gift.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecentWinners;
