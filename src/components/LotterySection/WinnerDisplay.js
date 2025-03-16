import React from 'react';

function WinnerDisplay({ winner, isSpinningUser, getStepText, getStepColor }) {
  return (
    <div className="winner-display">
      <h3>当選者</h3>
      <div className="winner-container">
        {winner ? (
          <div className={`winner-card ${isSpinningUser ? 'spinning' : ''}`}>
            <div className="winner-avatar">{winner.avatar}</div>
            <div className="winner-name">{winner.sucsessID}</div>
            <div className="winner-id">ID: {winner.primaryID}</div>
            <div className={`status ${getStepColor(winner.step)}`}>
              {getStepText(winner.step)}
            </div>
          </div>
        ) : (
          <div className="no-winner-message">
            抽選ボタンを押して<br/>当選者を選びましょう
          </div>
        )}
      </div>
    </div>
  );
}

export default WinnerDisplay;