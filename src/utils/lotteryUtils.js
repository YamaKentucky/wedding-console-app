// 進捗ステップのテキストを取得する関数
export const getStepText = (step) => {
    switch(step) {
      case 0: return '未解答';
      case 1: return '第1の謎を解明';
      case 2: return '第2の謎を解明';
      case 3: return '全ての謎を解明';
      default: return '不明';
    }
  };
  
  // 進捗ステップの色を取得する関数
  export const getStepColor = (step) => {
    switch(step) {
      case 0: return 'status-0';
      case 1: return 'status-1';
      case 2: return 'status-2';
      case 3: return 'status-3';
      default: return 'status-0';
    }
  };
  
  // 当選確率を計算する関数（進捗に応じて確率が上がる）
  export const calculateWinningProbability = (step, totalUsers) => {
    const baseChance = 1 / totalUsers; // 基本の確率
    const multiplier = step + 1; // ステップに応じた倍率
    const probability = (baseChance * multiplier) * 100;
    return Math.min(probability, 100).toFixed(1); // 最大100%に制限
  };
  
  // 進捗率を計算する関数
  export const calculateProgress = (step) => {
    return (step / 3) * 100;
  };