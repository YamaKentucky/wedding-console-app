import React from 'react';

function LotteryControls({ 
  startUserLottery, 
  startGiftLottery, 
  isSpinningUser, 
  isSpinningGift, 
  updateStatus, 
  winner,
  showUserButton = true,
  showGiftButton = true
}) {
  return (
    <div className="lottery-buttons">
      {showUserButton && (
        <button 
          onClick={startUserLottery} 
          disabled={isSpinningUser || isSpinningGift || updateStatus.pending}
          className="submit-btn lottery-btn user-lottery-btn"
        >
          {isSpinningUser ? '当選者抽選中...' : '当選者を抽選'}
        </button>
      )}
      
      {showGiftButton && (
        <button 
          onClick={startGiftLottery} 
          disabled={!winner || isSpinningUser || isSpinningGift || updateStatus.pending}
          className="submit-btn lottery-btn gift-lottery-btn"
        >
          {isSpinningGift ? '景品抽選中...' : '景品を抽選'}
        </button>
      )}
    </div>
  );
  
  // 非表示にしたが、後で使用する可能性があるため関数は残しておく
  // <div className="eligibility-filter" style={{ display: 'none' }}>
  //   <input 
  //     type="checkbox" 
  //     id="eligibleOnly" 
  //     checked={eligibleOnly}
  //     onChange={() => setEligibleOnly(!eligibleOnly)}
  //   />
  //   <label htmlFor="eligibleOnly">謎解き挑戦者のみで抽選</label>
  // </div>
}

export default LotteryControls;