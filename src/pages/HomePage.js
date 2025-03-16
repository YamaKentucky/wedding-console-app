import React from 'react';
import LotterySection from '../components/LotterySection/LotterySection';
import UsersSidebar from '../components/UsersSidebar/UsersSidebar';

function HomePage({
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
  calculateProgress,
  calculateWinningProbability,
  currentUser
}) {
  return (
    <div className="app-container">
      <LotterySection
        users={users}
        gifts={gifts}
        winner={winner}
        selectedGift={selectedGift}
        recentWinners={recentWinners}
        eligibleOnly={eligibleOnly}
        setEligibleOnly={setEligibleOnly}
        isSpinningUser={isSpinningUser}
        isSpinningGift={isSpinningGift}
        updateStatus={updateStatus}
        startUserLottery={startUserLottery}
        startGiftLottery={startGiftLottery}
        getStepText={getStepText}
        getStepColor={getStepColor}
        // 設定ページに一部のコンポーネント表示を移すため、フラグを追加
        showDetailsInMain={false}
      />
      
      <UsersSidebar
        users={users}
        currentUser={currentUser}
        getStepText={getStepText}
        getStepColor={getStepColor}
        calculateProgress={calculateProgress}
        calculateWinningProbability={calculateWinningProbability}
      />
    </div>
  );
}

export default HomePage;