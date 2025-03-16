import React from 'react';
import LotteryControls from './LotteryControls';
import WinnerDisplay from './WinnerDisplay';
import GiftDisplay from './GiftDisplay';
import RecentWinners from './RecentWinners';
import UpdateStatus from './UpdateStatus';
import LotteryInfo from './LotteryInfo';
import GiftList from './GiftList';
import './LotterySection.css';

function LotterySection({
  users,
  gifts,
  winner,
  selectedGift,
  recentWinners,
  eligibleOnly,
  setEligibleOnly,
  isSpinningUser,
  isSpinningGift,
  updateStatus,
  startUserLottery,
  startGiftLottery,
  getStepText,
  getStepColor,
  // メインページでは詳細情報をを表示しない（設定ページに移動）
  showDetailsInMain = false
}) {
  return (
    <div className="lottery-section">
      {/* メイン抽選パネル */}
      <div className="panel lottery-panel">
        <h2>ラッキードロー</h2>

        <div className="lottery-content">
          <div className="lottery-row">
            {/* 当選者グループ */}
            <div className="lottery-group user-group">
              <WinnerDisplay
                winner={winner}
                isSpinningUser={isSpinningUser}
                getStepText={getStepText}
                getStepColor={getStepColor}
              />

              <div className="lottery-button-container">
                <LotteryControls
                  startUserLottery={startUserLottery}
                  startGiftLottery={startGiftLottery}
                  isSpinningUser={isSpinningUser}
                  isSpinningGift={isSpinningGift}
                  updateStatus={updateStatus}
                  winner={winner}
                  showUserButton={true}
                  showGiftButton={false}
                />
              </div>
            </div>

            {/* 景品グループ */}
            <div className="lottery-group gift-group">
              <GiftDisplay
                selectedGift={selectedGift}
                isSpinningGift={isSpinningGift}
                winner={winner}
              />

              <div className="lottery-button-container">
                <LotteryControls
                  startUserLottery={startUserLottery}
                  startGiftLottery={startGiftLottery}
                  isSpinningUser={isSpinningUser}
                  isSpinningGift={isSpinningGift}
                  updateStatus={updateStatus}
                  winner={winner}
                  showUserButton={false}
                  showGiftButton={true}
                />
              </div>
            </div>
          </div>
        </div>

        <UpdateStatus updateStatus={updateStatus} />
      </div>

      {/* 以下のパネルはshowDetailsInMainがtrueの場合のみ表示（メインページでは表示しない） */}
      {showDetailsInMain && (
        <>
          {/* 抽選結果履歴パネル */}
          {recentWinners.length > 0 && (
            <div className="panel results-panel">
              <h2>抽選結果履歴</h2>
              <RecentWinners recentWinners={recentWinners} />
            </div>
          )}

          {/* 情報パネル */}
          <div className="panel info-panel">
            <h2>抽選情報</h2>
            <LotteryInfo />
          </div>

          {/* ギフトパネル */}
          <div className="panel gifts-panel">
            <h2>景品一覧</h2>
            <GiftList gifts={gifts} />
          </div>
        </>
      )}
    </div>
  );
}

export default LotterySection;