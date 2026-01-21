// メトロノームの設定値
export const METRONOME_CONFIG = {
  // BPM（Beats Per Minute = 1分間の拍数）の設定
  MIN_BPM: 40,      // 最小テンポ
  MAX_BPM: 320,     // 最大テンポ
  DEFAULT_BPM: 120, // 初期値
  
  // 音の設定（Hz = ヘルツ = 周波数）
  SOUND: {
    ACCENT_FREQ: 1000,    // 強拍の周波数（高い音）
    NORMAL_FREQ: 800,     // 弱拍の周波数（低い音）
    DURATION: 0.05,       // 音の長さ（秒）
  },
  
  // 拍子の設定
  BEATS_PER_MEASURE: 4,  // 1小節の拍数（4/4拍子）
};