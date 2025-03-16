import React from 'react';

function GiftDisplay({ selectedGift, isSpinningGift, winner }) {
  return (
    <div className="gift-display">
      <h3>景品</h3>
      <div className="gift-container">
        {selectedGift ? (
          <div className={`gift-card ${isSpinningGift ? 'spinning' : ''}`}>
            <div className="gift-icon">🎁</div>
            <div className="gift-name">{selectedGift.name}</div>
            <div className="gift-price">{selectedGift.price}円相当</div>
            <div className="gift-stock">残り在庫: {selectedGift.stock}個</div>
          </div>
        ) : (
          <div className="no-gift-message">
            {winner ? '景品を抽選してください' : '先に当選者を選んでください'}
          </div>
        )}
      </div>
    </div>
  );
}

export default GiftDisplay;