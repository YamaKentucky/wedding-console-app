import React from 'react';

function GiftDisplay({ selectedGift, isSpinningGift, winner }) {
  // S3バケット情報
  const s3Bucket = 'wedding-250505';
  const s3Region = 'ap-northeast-1'; // 日本リージョンを使用
  
  // S3画像URLを生成する関数
  const getS3ImageUrl = (imgKey) => {
    if (!imgKey) return null;
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${encodeURIComponent(imgKey)}`;
  };

  return (
    <div className="gift-display">
      <h3>景品</h3>
      <div className="gift-container">
        {selectedGift ? (
          <div className={`gift-card ${isSpinningGift ? 'spinning' : ''}`}>
            <div className="gift-icon-large">
              {selectedGift.imgKey ? (
                <img 
                  src={getS3ImageUrl(selectedGift.imgKey)} 
                  alt={selectedGift.name}
                  className="gift-image-large"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = ''; // 画像読み込みエラー時に空にする
                    e.target.classList.add('gift-image-error');
                    e.target.parentNode.innerHTML = '🎁'; // デフォルトのギフトアイコンに戻す
                  }}
                />
              ) : (
                <div className="gift-emoji-large">🎁</div>
              )}
            </div>
            <div className="gift-name">{selectedGift.name}</div>
            {/* 金額と在庫情報を削除 */}
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