import React from 'react';

function RecentWinners({ recentWinners }) {
  // S3バケット情報
  const s3Bucket = 'wedding-250505';
  const s3Region = 'ap-northeast-1'; // 日本リージョンを使用
  
  // S3画像URLを生成する関数
  const getS3ImageUrl = (imgKey) => {
    if (!imgKey) return null;
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${encodeURIComponent(imgKey)}`;
  };

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
            <span className="gift-emoji">
              {result.gift.imgKey ? (
                <img 
                  src={getS3ImageUrl(result.gift.imgKey)} 
                  alt={result.gift.name}
                  className="gift-mini-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = ''; // 画像読み込みエラー時に空にする
                    e.target.classList.add('gift-image-error');
                    e.target.parentNode.innerHTML = '🎁'; // デフォルトのギフトアイコンに戻す
                  }}
                />
              ) : (
                '🎁'
              )}
            </span>
            <span className="gift-name">{result.gift.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecentWinners;