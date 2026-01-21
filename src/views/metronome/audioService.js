let audioContext = null;

// AudioContextを初期化する関数
export function initAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// ビープ音を鳴らす関数
export function playBeep(frequency = 800, duration = 0.1) {
  // AudioContextがなければ初期化
  if (!audioContext) {
    initAudio();
  }
  
  // オシレーター（音を出す装置）を作成
  const oscillator = audioContext.createOscillator();
  
  // ゲインノード（音量調整）を作成
  const gainNode = audioContext.createGain();
  
  // 波形タイプを設定（sine = サイン波 = 丸い音）
  oscillator.type = 'sine';
  
  // 周波数（音の高さ）を設定
  oscillator.frequency.value = frequency;
  
  // 音量を設定（0.0〜1.0）
  gainNode.gain.value = 0.3;
  
  // 接続: オシレーター → ゲイン → スピーカー
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // 音を鳴らす
  const now = audioContext.currentTime;
  oscillator.start(now);
  oscillator.stop(now + duration); // duration秒後に停止
}