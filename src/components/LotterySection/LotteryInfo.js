import React from 'react';

function LotteryInfo() {
  return (
    <div className="lottery-info">
      <p>謎解きの進捗度に応じて当選確率が上がります。より多くの謎を解けば、当選確率が高くなります！</p>
      <div className="probability-table">
        <div className="prob-row prob-header">
          <div>進捗度</div>
          <div>当選確率</div>
        </div>
        <div className="prob-row">
          <div className="prob-status status-0">未解答</div>
          <div>基本確率</div>
        </div>
        <div className="prob-row">
          <div className="prob-status status-1">第1の謎を解明</div>
          <div>基本確率×2</div>
        </div>
        <div className="prob-row">
          <div className="prob-status status-2">第2の謎を解明</div>
          <div>基本確率×3</div>
        </div>
        <div className="prob-row">
          <div className="prob-status status-3">全ての謎を解明</div>
          <div>基本確率×4</div>
        </div>
      </div>
    </div>
  );
}

export default LotteryInfo;