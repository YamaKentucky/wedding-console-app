import React, { useState, useEffect, useMemo } from 'react';
import './AnnouncementPage.css';
import { firebaseService } from '../firebase';

function AnnouncementPage({ users, gifts }) {
  // 発表のステップ（0: 初期状態, 1: 3位発表, 2: 2位発表, 3: 1位発表, 4: すべて表示）
  const [step, setStep] = useState(0);
  // アニメーション用の状態
  const [animating, setAnimating] = useState(false);

  // 謎解きを達成したユーザーのランキングを計算（成功時間順）
  const topRankedUsers = useMemo(() => {
    // step = 3の人だけを抽出し、成功時間でソート
    const completedUsers = [...users]
      .filter(user => user.step === 3 && user.successTime)
      .sort((a, b) => {
        // 成功時間が早い順にソート
        const timeA = new Date(a.successTime || '9999-12-31');
        const timeB = new Date(b.successTime || '9999-12-31');
        return timeA - timeB;
      });
      
    // 上位3名を返す
    return completedUsers.slice(0, 3);
  }, [users]);

  // ランク別のギフト
  const rankGifts = useMemo(() => {
    // available giftsを取得
    const availableGifts = gifts.filter(gift => gift.stock > 0);
    
    // 仮のギフト割り当て（実際のアプリでは管理画面で設定する機能が必要かもしれません）
    return {
      1: availableGifts.length > 0 ? availableGifts[0] : null, // 1位のギフト
      2: availableGifts.length > 1 ? availableGifts[1] : null, // 2位のギフト
      3: availableGifts.length > 2 ? availableGifts[2] : null, // 3位のギフト
    };
  }, [gifts]);

  // 次のステップに進む
  const nextStep = () => {
    if (step < 4) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setAnimating(false);
      }, 500);
    }
  };

  // 最初からやり直す
  const resetAnnouncement = () => {
    setAnimating(true);
    setTimeout(() => {
      setStep(0);
      setAnimating(false);
    }, 500);
  };

  // S3バケット情報
  const s3Bucket = 'wedding-250505';
  const s3Region = 'ap-northeast-1';
  
  // S3画像URLを生成する関数
  const getS3ImageUrl = (imgKey) => {
    if (!imgKey) return null;
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${encodeURIComponent(imgKey)}`;
  };

  // ランクに応じたユーザーを取得
  const getUserByRank = (rank) => {
    return topRankedUsers.length >= rank ? topRankedUsers[rank - 1] : null;
  };

  // 成功時間をフォーマットする関数
  const formatSuccessTime = (timeString) => {
    if (!timeString) return "時間不明";
    
    try {
      const date = new Date(timeString);
      
      // 日本時間のフォーマット
      return new Intl.DateTimeFormat('ja-JP', { 
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (e) {
      console.error('Invalid date format:', e);
      return "時間不明";
    }
  };

  // ランク別に表示するコンポーネント
  const renderRankSection = (rank) => {
    const user = getUserByRank(rank);
    const gift = rankGifts[rank];
    
    if (!user) {
      return (
        <div className={`rank-section rank-${rank}`}>
          <div className="rank-info">
            <div className={`rank-badge rank-${rank}`}>{rank}</div>
            <div className="rank-details">
              <h3>該当者なし</h3>
              <p>謎解きを完了したユーザーがいません</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`rank-section rank-${rank} revealed`}>
        <div className="rank-info">
          <div className={`rank-badge rank-${rank}`}>{rank}</div>
          <div className="rank-details">
            <h3>{user.sucsessID}</h3>
            <p className="completion-time">達成時間: {formatSuccessTime(user.successTime)}</p>
          </div>
        </div>
        
        <div className="gift-info">
          <div className="gift-icon">
            {gift && gift.imgKey ? (
              <img 
                src={getS3ImageUrl(gift.imgKey)} 
                alt={gift.name}
                className="gift-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                  e.target.classList.add('gift-image-error');
                  e.target.parentNode.innerHTML = '🎁';
                }}
              />
            ) : (
              <div className="gift-emoji">🎁</div>
            )}
          </div>
          <div className="gift-details">
            <h4>景品: {gift ? gift.name : "未設定"}</h4>
            {gift && <p className="gift-price">価格: {gift.price.toLocaleString()}円</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="announcement-container">
      <div className="panel announcement-panel">
        <h2>謎解きチャレンジ 結果発表</h2>
        
        <div className={`announcement-content ${animating ? 'animating' : ''}`}>
          {step === 0 ? (
            <div className="announcement-intro">
              <h3>謎解きチャレンジの結果発表を行います</h3>
              <p>ボタンを押して、ランキング発表を始めましょう！</p>
              <div className="trophy-icon">🏆</div>
            </div>
          ) : (
            <div className="rankings-container">
              {step === 1 && renderRankSection(3)} {/* 3位のみ表示 */}
              {step === 2 && renderRankSection(2)} {/* 2位のみ表示 */}
              {step === 3 && renderRankSection(1)} {/* 1位のみ表示 */}
              {step === 4 && (
                <div className="final-announcement">
                  <h3>結果発表終了</h3>
                  <p>おめでとうございます！全ての結果発表が完了しました。</p>
                  <p>上位入賞者の皆様、謎解きチャレンジへの参加ありがとうございました。</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="announcement-controls">
          {step < 4 ? (
            <button className="submit-btn announcement-btn" onClick={nextStep} disabled={animating}>
              {step === 0 ? '結果発表を開始' : step === 3 ? '発表を終了' : '次の順位を発表'}
            </button>
          ) : (
            <button className="submit-btn reset-btn" onClick={resetAnnouncement} disabled={animating}>
              最初からやり直す
            </button>
          )}
        </div>
        
        {topRankedUsers.length === 0 && (
          <div className="no-data-message" style={{ marginTop: '2rem' }}>
            まだ謎解きを完了したユーザーがいません。
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnouncementPage;