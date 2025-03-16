import React from 'react';

function GiftList({ gifts }) {
  return (
    <div className="gift-list">
      {gifts.map(gift => (
        <div key={gift.id} className="gift-list-item">
          <div className="gift-list-icon">🎁</div>
          <div className="gift-list-info">
            <div className="gift-list-name">{gift.name}</div>
            <div className="gift-list-price">{gift.price}円相当</div>
          </div>
          <div className={`gift-list-stock ${gift.stock <= 0 ? 'out-of-stock' : ''}`}>
            残り{gift.stock}個
          </div>
        </div>
      ))}
    </div>
  );
}

export default GiftList;