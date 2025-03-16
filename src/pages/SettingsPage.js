import React, { useState, useEffect } from 'react';
import RecentWinners from '../components/LotterySection/RecentWinners';
import LotteryInfo from '../components/LotterySection/LotteryInfo';
import GiftList from '../components/LotterySection/GiftList';
import './SettingsPage.css';

// タブの種類を定義
const TABS = {
  RESULTS: 'results',
  INFO: 'info',
  GIFTS: 'gifts',
  DISPLAY: 'display'  // 表示設定タブ
};

function SettingsPage({
  gifts,
  recentWinners,
  autoScrollEnabled, 
  setAutoScrollEnabled,
  eligibleOnly,       // 謎解き参加者のみを抽選に含めるかどうかの設定
  setEligibleOnly     // 設定を変更する関数
}) {
  // 現在選択されているタブ (初期値: 抽選結果)
  const [activeTab, setActiveTab] = useState(TABS.RESULTS);
  // タブ切り替えアニメーション用
  const [isAnimating, setIsAnimating] = useState(false);

  // タブ切り替え関数
  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveTab(tab);
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 200);
    }
  };

  // URLハッシュからタブを設定（例: #gifts でギフトタブを開く）
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'info') {
      setActiveTab(TABS.INFO);
    } else if (hash === 'gifts') {
      setActiveTab(TABS.GIFTS);
    } else if (hash === 'display') {
      setActiveTab(TABS.DISPLAY);
    } else {
      setActiveTab(TABS.RESULTS); // デフォルトまたは #results
    }
  }, []);

  // タブ変更時にURLのハッシュを更新
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // 自動スクロールの切り替え
  const toggleAutoScroll = () => {
    setAutoScrollEnabled(!autoScrollEnabled);
    // ローカルストレージに設定を保存
    localStorage.setItem('autoScrollEnabled', (!autoScrollEnabled).toString());
  };

  // 謎解き参加者フィルタの切り替え
  const toggleEligibleOnly = () => {
    setEligibleOnly(!eligibleOnly);
    // ローカルストレージに設定を保存
    localStorage.setItem('eligibleOnly', (!eligibleOnly).toString());
  };

  return (
    <div className="settings-container">
      <div className="settings-main-panel panel">
        {/* タブナビゲーション */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === TABS.RESULTS ? 'active' : ''}`}
            onClick={() => handleTabChange(TABS.RESULTS)}
            data-tab="results"
          >
            <i className="tab-icon results-icon">📋</i>
            抽選結果履歴
          </button>
          <button 
            className={`tab-button ${activeTab === TABS.INFO ? 'active' : ''}`}
            onClick={() => handleTabChange(TABS.INFO)}
            data-tab="info"
          >
            <i className="tab-icon info-icon">ℹ️</i>
            抽選情報
          </button>
          <button 
            className={`tab-button ${activeTab === TABS.GIFTS ? 'active' : ''}`}
            onClick={() => handleTabChange(TABS.GIFTS)}
            data-tab="gifts"
          >
            <i className="tab-icon gifts-icon">🎁</i>
            景品一覧
          </button>
          <button 
            className={`tab-button ${activeTab === TABS.DISPLAY ? 'active' : ''}`}
            onClick={() => handleTabChange(TABS.DISPLAY)}
            data-tab="display"
          >
            <i className="tab-icon display-icon">⚙️</i>
            表示設定
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className={`tab-content ${isAnimating ? 'animating' : ''}`}>
          {/* 抽選結果履歴タブ */}
          {activeTab === TABS.RESULTS && (
            <div className="tab-pane results-pane">
              <h2>抽選結果履歴</h2>
              {recentWinners.length > 0 ? (
                <RecentWinners recentWinners={recentWinners} />
              ) : (
                <div className="no-data-message">
                  まだ抽選結果がありません。抽選画面で当選者と景品を選んで抽選を行ってください。
                </div>
              )}
            </div>
          )}

          {/* 抽選情報タブ */}
          {activeTab === TABS.INFO && (
            <div className="tab-pane info-pane">
              <h2>抽選情報</h2>
              <LotteryInfo />
              
              <div className="info-additional">
                <h3>抽選の仕組みについて</h3>
                <p>
                  本システムでは、謎解きの進捗度に応じて当選確率が変動します。
                  より多くの謎を解き明かした参加者ほど、当選しやすくなる仕組みです。
                </p>
                <p>
                  当選者は自動的に「当選者」としてマークされ、参加者リストでも特別に表示されます。
                  抽選結果は自動的に記録され、このページで履歴を確認することができます。
                </p>
              </div>
            </div>
          )}

          {/* 景品一覧タブ */}
          {activeTab === TABS.GIFTS && (
            <div className="tab-pane gifts-pane">
              <h2>景品一覧</h2>
              {gifts.length > 0 ? (
                <>
                  <GiftList gifts={gifts} />
                  
                  {/* 景品の在庫状況サマリー */}
                  <div className="gift-summary">
                    <h3>在庫状況サマリー</h3>
                    <div className="summary-item">
                      <span>景品種類数:</span>
                      <span>{gifts.length}</span>
                    </div>
                    <div className="summary-item">
                      <span>合計在庫数:</span>
                      <span>{gifts.reduce((sum, gift) => sum + gift.stock, 0)}個</span>
                    </div>
                    <div className="summary-item">
                      <span>合計価値:</span>
                      <span>{gifts.reduce((sum, gift) => sum + (gift.price * gift.stock), 0).toLocaleString()}円</span>
                    </div>
                  </div>
                  
                  <div className="gift-note">
                    <p><strong>注意:</strong> 景品は抽選が行われると自動的に在庫が減少します。在庫が0になった景品は抽選対象から除外されます。</p>
                  </div>
                </>
              ) : (
                <div className="no-data-message">
                  景品データがありません
                </div>
              )}
            </div>
          )}

          {/* 表示設定タブ */}
          {activeTab === TABS.DISPLAY && (
            <div className="tab-pane display-pane">
              <h2>表示設定</h2>
              
              <div className="settings-section">
                <h3>ユーザーランキング表示</h3>
                
                <div className="setting-item">
                  <div className="setting-description">
                    <h4>自動スクロール</h4>
                    <p>ユーザーランキングを自動的にスクロールするかどうかを設定します。オフにすると、手動でスクロールできます。</p>
                  </div>
                  
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={autoScrollEnabled} 
                        onChange={toggleAutoScroll}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="toggle-status">
                      {autoScrollEnabled ? '有効' : '無効'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>抽選設定</h3>
                
                <div className="setting-item">
                  <div className="setting-description">
                    <h4>謎解き参加者のみ抽選対象</h4>
                    <p>謎解きに参加している方（進捗度が1以上のユーザー）のみを抽選対象とするかどうかを設定します。</p>
                  </div>
                  
                  <div className="setting-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={eligibleOnly} 
                        onChange={toggleEligibleOnly}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="toggle-status">
                      {eligibleOnly ? '有効' : '無効'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;