import React from 'react';

function GiftList({ gifts }) {
  // S3バケット情報
  const s3Bucket = 'wedding-250505';
  const s3Region = 'ap-northeast-1'; // 日本リージョンを使用
  
  // S3画像URLを生成する関数
  const getS3ImageUrl = (imgKey) => {
    if (!imgKey) return null;
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${encodeURIComponent(imgKey)}`;
  };

  return (
    <div className="gift-list">
      {gifts.map(gift => (
        <div key={gift.id} className="gift-list-item">
          <div className="gift-list-icon-large">
            {gift.imgKey ? (
              <img 
                src={getS3ImageUrl(gift.imgKey)} 
                alt={gift.name}
                className="gift-list-image-large"
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
          <div className="gift-list-name">{gift.name}</div>
          {/* 金額と在庫情報を削除 */}
        </div>
      ))}
    </div>
  );
}

export default GiftList;