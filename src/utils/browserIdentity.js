// ブラウザ識別のためのユーティリティ

/**
 * ブラウザフィンガープリントを生成する簡易的な関数
 * 実際のプロダクションでは、より堅牢なライブラリ（FingerprintJSなど）の使用を検討してください
 */
export const generateBrowserFingerprint = () => {
    const screen = window.screen;
    const nav = window.navigator;
    
    // ブラウザの様々な特性を組み合わせて指紋を作成
    const fingerprint = [
      nav.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      nav.language || nav.userLanguage || 'unknown',
      nav.platform,
      nav.hardwareConcurrency || 'unknown',
      nav.deviceMemory || 'unknown'
    ].join('###');
    
    // 文字列をハッシュ化
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    
    return 'browser_' + Math.abs(hash).toString(16);
  };
  
  /**
   * ブラウザのローカルストレージからユーザーIDを取得
   * 存在しない場合は新規作成
   */
  export const getBrowserUserId = () => {
    const storageKey = 'user_browser_id';
    let browserId = localStorage.getItem(storageKey);
    
    if (!browserId) {
      browserId = generateBrowserFingerprint();
      localStorage.setItem(storageKey, browserId);
    }
    
    return browserId;
  };
  
  /**
   * ユーザーとPrimaryIDの関連付けを保存
   */
  export const associateUserWithPrimaryId = (primaryId) => {
    const storageKey = 'user_primary_id';
    localStorage.setItem(storageKey, primaryId.toString());
  };
  
  /**
   * 保存されたPrimaryIDを取得
   */
  export const getSavedPrimaryId = () => {
    return localStorage.getItem('user_primary_id');
  };
  
  /**
   * ブラウザIDとユーザー関連付けをリセット
   */
  export const resetBrowserAssociation = () => {
    localStorage.removeItem('user_primary_id');
  };