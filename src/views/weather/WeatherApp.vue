<script>
// 外部設定データのインポート
import prefectures from './prefectures.json'
import weatherMap from './weatherMap.json'
import weatherConfig from './weatherConfig.json'

/**
 * 1. 定数・設定値の管理
 */
// デフォルトの都道府県
const DEFAULT_PREFECTURE = '福岡県';
// 気象APIのタイムゾーン
const API_TIMEZONE = 'Asia/Tokyo';

// 服装判定の季節設定
const SEASON_MONTHS = {
  // 夏：最高気温を重視
  SUMMER: { start: 5, end: 9 },
  // 冬：最低気温を重視
  WINTER: { start: 11, end: 3 },
};

// 表示構成の設定
// メインで大きく表示する日数（今日・明日）
const MAIN_DISPLAY_DAYS = 2;
// 週間リストを開始するインデックス
const WEEKLY_LIST_START = 2;
// 週間予報のアイコンに使う代表時間（正午）
const REPRESENTATIVE_HOUR = 12;

export default {
  data() {
    return {
      groupedWeather: null, // 日付ごとにパース・集計された天気データ
      error: null,          // エラーメッセージ保持
      selectedPrefecture: DEFAULT_PREFECTURE, // デフォルトの選択地点
      prefectures
    }
  },
  
  computed: {
    /**
     * 今日と明日のデータを抽出（メインセクション用）
     */
    getTodayTomorrow() {
      if (!this.groupedWeather) return {};
      const keys = Object.keys(this.groupedWeather).slice(0, MAIN_DISPLAY_DAYS);
      const result = {};
      keys.forEach(key => result[key] = this.groupedWeather[key]);
      return result;
    },
    /**
     * 明後日以降のデータを抽出（週間リスト用）
     */
    getRestOfDays() {
      if (!this.groupedWeather) return {};
      const keys = Object.keys(this.groupedWeather).slice(WEEKLY_LIST_START);
      const result = {};
      keys.forEach(key => result[key] = this.groupedWeather[key]);
      return result;
    }
  },

  methods: {
    /**
     * 設定ファイルから値に基づいたテキストを取得する関数
     */
    getConfigText(value, configArray) {
      const target = configArray.find(item => value <= item.max);
      return target ? target.text : configArray[configArray.length - 1].text;
    },

    /**
     * 気象APIからデータを取得
     */
    fetchWeather() {
      const pref = this.prefectures.find(p => p.name === this.selectedPrefecture);
      if (!pref) return;
      this.groupedWeather = null;
      this.error = null;
      // 気象APIのURL生成
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${pref.lat}&longitude=${pref.lon}&hourly=temperature_2m,precipitation,weathercode&timezone=${encodeURIComponent(API_TIMEZONE)}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          this.groupedWeather = this.groupByDate(data.hourly);
        })
        .catch(() => {
          this.error = '天気情報の取得に失敗しました'
        });
    },

    /**
     * 気象コードを日本語に変換
     */
    weatherText(code) {
      return weatherMap[code] || '❓(不明)';
    },

    /**
     * アコーディオンの開閉切り替え
     */
    toggleDay(dateKey) {
      if (this.groupedWeather[dateKey]) {
        this.groupedWeather[dateKey].isOpen = !this.groupedWeather[dateKey].isOpen;
      }
    },

    /**
     * 1時間ごとの生データを日付ごとの統計データに集約する
     */
    groupByDate(hourly) {
      // 算出データの一時保持用
      const grouped = {};
      // 実行時点の「現在時刻」を取得
      const now = new Date();
      // 現在の「月」を取得（服装アドバイスの季節判定に使用）
      const currentMonth = now.getMonth() + 1;
      
      // 今日の「0時0分」のタイムスタンプを作成
      // APIから過去のデータが送られてきた場合に、表示から除外するための基準値
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      // 数値の曜日を日本語表記に変換するためのマッピングテーブル
      const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

      // --- 1. 各データを日付別のグループに分ける ---
      hourly.time.forEach((datetime, i) => {
        const dateObj = new Date(datetime);
        
        // 基準（今日0時）より古いデータは、予報として不要なためスキップ
        if (dateObj.getTime() < todayStart) return;

        // 連想配列のキーとして使う日付文字列（例: "12月24日(水)"）を生成
        const dateKey = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日(${weekDays[dateObj.getDay()]})`;

        // その日付のデータがまだ無い場合は、初期構造を作成
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            // 1日の統計情報を保持するオブジェクト
            summary: { maxTemp: -99, minTemp: 99, totalPrecip: 0, maxPrecip: 0, tempSum: 0, count: 0 },
            // 1時間ごとの詳細リスト
            details: [],
            // 開閉状態（初期値：閉じている）
            isOpen: false 
          };
        }

        const temp = hourly.temperature_2m[i];
        const precip = hourly.precipitation[i];
        const s = grouped[dateKey].summary;

        // 統計データの更新：最高/最低気温の比較・保持
        s.maxTemp = Math.max(s.maxTemp, temp);       
        s.minTemp = Math.min(s.minTemp, temp);       
        // 降水量の積算および、最大時間降水量の保持（傘の判定用）
        s.totalPrecip += precip;                     
        s.maxPrecip = Math.max(s.maxPrecip, precip); 
        // 平均気温算出のための合計値とサンプル数をカウント
        s.tempSum += temp;                           
        s.count++;

        // 1時間ごとの生データを詳細配列へ格納
        grouped[dateKey].details.push({
          hour: dateObj.getHours(),
          temp: temp,
          precip: precip,
          code: hourly.weathercode[i]
        });
      });

      // --- 2. 各日付の集約データに基づいてアドバイスを生成 ---
      Object.values(grouped).forEach(day => {
        // 合計気温 / サンプル数 で1日の平均気温を算出（小数点第1位に整形）
        day.summary.avgTemp = (day.summary.tempSum / day.summary.count).toFixed(1);
        day.summary.totalPrecip = parseFloat(day.summary.totalPrecip).toFixed(1);

        /**
         * 【服装判定】
         * 夏は「暑さ対策」、冬は「寒さ対策」が必要になるため
         * 判定に使用する気温の基準を季節（月）によって動的に切り替える
         */
        let targetTemp = day.summary.avgTemp; // 春秋（デフォルト）は平均気温を基準にする
        if (currentMonth >= SEASON_MONTHS.SUMMER.start && currentMonth <= SEASON_MONTHS.SUMMER.end) {
          targetTemp = day.summary.maxTemp; // 夏場は「日中の最高気温」で服装を選ぶ
        } else if (currentMonth >= SEASON_MONTHS.WINTER.start || currentMonth <= SEASON_MONTHS.WINTER.end) {
          targetTemp = day.summary.minTemp; // 冬場は「朝晩の最低気温」に合わせて防寒する
        }
        
        // 基準気温をもとに、JSONからアドバイスの文字列を取得
        day.summary.clothes = this.getConfigText(targetTemp, weatherConfig.clothes);

        /**
         * 【傘・雨判定】
         * その日の「最大時間降水量」を基準にする
         */
        const mp = day.summary.maxPrecip;
        day.summary.umbrella = this.getConfigText(mp, weatherConfig.umbrella);
        day.summary.precipText = this.getConfigText(mp, weatherConfig.rainLevel);
      });

      // 最終的な日付ごとのオブジェクトを返す
      return grouped;
    }
  },
  mounted() {
    this.fetchWeather(); // コンポーネント読み込み時に天気取得を開始
  }
}
</script>

<template>
  <div class="weather-container">
    <header class="header-section">
      <div class="weather-title">
        <h1>{{ selectedPrefecture }} の天気予報</h1>
      </div>
      <div class="selector-box">
        <label class="select-label">地域切替：</label>
        <select v-model="selectedPrefecture" @change="fetchWeather">
          <option v-for="p in prefectures" :key="p.name" :value="p.name">{{ p.name }}</option>
        </select>
      </div>
    </header>

    <div v-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="!groupedWeather" class="loading">天気を取得しています...</div>

    <div v-else>
      <section class="main-forecast">
        <div v-for="(data, date, index) in getTodayTomorrow" :key="date" 
             :class="['day-card', index === 0 ? 'today-highlight' : 'tomorrow-highlight']">
          <div class="date-badge">{{ index === 0 ? '今日' : '明日' }} - {{ date }}</div>
          
          <div class="advice-box">
            <div class="advice-item">👕 {{ data.summary.clothes }}</div>
            <div class="advice-item">{{ data.summary.umbrella }}</div>
          </div>
          
          <div class="summary-grid">
            <div class="summary-item">最高 <span class="max">{{ data.summary.maxTemp }}℃</span></div>
            <div class="summary-item">最低 <span class="min">{{ data.summary.minTemp }}℃</span></div>
            <div class="summary-item">雨：{{ data.summary.precipText }}</div>
            <div class="summary-item">平均 {{ data.summary.avgTemp }}℃</div>
          </div>

          <div class="hourly-scroll">
            <div v-for="h in data.details" :key="h.hour" class="hourly-item">
              <div class="time">{{ h.hour }}時</div>
              <div class="icon">{{ weatherText(h.code) }}</div>
              <div class="temp">{{ h.temp }}℃</div>
            </div>
          </div>
        </div>
      </section>

      <section class="weekly-forecast">
        <h3 class="weekly-title">明後日以降の予報（クリックで詳細）</h3>
        <div class="weekly-list">
          <div v-for="(data, date) in getRestOfDays" :key="date" class="weekly-item-container">
            <div class="weekly-row" @click="toggleDay(date)" :class="{ 'is-active': data.isOpen }">
              <span class="weekly-date">{{ date }}</span>
              <span class="weekly-icon">{{ weatherText(data.details[12].code) }}</span>
              <div class="weekly-temp">
                <span class="max">{{ data.summary.maxTemp }}℃</span> / <span class="min">{{ data.summary.minTemp }}℃</span>
              </div>
              <span class="arrow-icon">{{ data.isOpen ? '▲' : '▼' }}</span>
            </div>

            <transition name="expand">
              <div v-if="data.isOpen" class="weekly-details">
                <div class="advice-box sub">
                  <div class="advice-item">👕 {{ data.summary.clothes }}</div>
                  <div class="advice-item">{{ data.summary.umbrella }}</div>
                </div>
                <div class="hourly-scroll">
                  <div v-for="h in data.details" :key="h.hour" class="hourly-item">
                    <div class="time">{{ h.hour }}時</div>
                    <div class="icon">{{ weatherText(h.code) }}</div>
                    <div class="temp">{{ h.temp }}℃</div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 基本スタイル */
.weather-container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.header-section { text-align: center; margin-bottom: 25px; }
.weather-title h1 { font-size: 1.6rem; color: #003a8c; margin-bottom: 10px; }

/* 選択ツール */
.selector-box { background: #f5f5f5; padding: 10px; border-radius: 12px; display: inline-block; }
.select-label { font-weight: bold; margin-right: 8px; color: #555; }
select { padding: 8px 16px; border-radius: 8px; border: 1px solid #d9d9d9; font-size: 1rem; cursor: pointer; }

/* メインカード設定 */
.day-card {
  background: white; border-radius: 20px; margin-bottom: 24px; padding: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05); text-align: center;
}
.today-highlight { border: 2px solid #91d5ff; background: #f0faff; }
.tomorrow-highlight { border: 1px solid #f0f0f0; }

.date-badge {
  display: inline-block; padding: 5px 15px; border-radius: 25px;
  background: #1890ff; color: white; font-weight: bold; margin-bottom: 18px;
}

/* アドバイスのデザイン */
.advice-box {
  display: flex; justify-content: space-around; background: white;
  border-radius: 15px; padding: 15px; margin-bottom: 20px; border: 1px solid #e6f7ff;
  font-weight: bold;
}
.advice-box.sub { background: #f9f9f9; padding: 10px; border: none; font-size: 0.9rem; margin-top: 10px; }

/* 統計グリッド */
.summary-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
  background: rgba(255,255,255,0.7); padding: 15px; border-radius: 12px; margin-bottom: 20px;
}
.max { color: #ff4d4f; font-weight: bold; }
.min { color: #1890ff; font-weight: bold; }

/* 1時間毎のスクロール */
.hourly-scroll {
  display: flex; overflow-x: auto; gap: 15px; border-top: 1px solid #f0f0f0; padding-top: 15px;
}
.hourly-item { 
  min-width: 60px;
  text-align: center;
  flex-shrink: 0;
}
.hourly-item .icon {
  font-size: 0.8rem;
  line-height: 1.2;
  display: block;
  white-space: pre-wrap;
  word-break: keep-all;
}
.time { font-size: 0.75rem; color: #888; }

/* 週間リストとアコーディオン */
.weekly-title { font-size: 1.1rem; margin: 30px 0 15px; border-left: 5px solid #1890ff; padding-left: 12px; }
.weekly-item-container { border-bottom: 1px solid #f0f0f0; }
.weekly-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px; background: white; cursor: pointer; transition: 0.2s;
}
.weekly-row:hover { background: #fafafa; }
.weekly-row.is-active { background: #f0faff; }
.weekly-date { flex: 1.5; font-size: 0.9rem; }
.weekly-icon { flex: 1; text-align: center; font-size: 1.3rem; }
.weekly-temp { flex: 1.5; text-align: right; font-size: 0.9rem; }
.arrow-icon { margin-left: 10px; color: #bfbfbf; font-size: 0.7rem; }

/* アニメーション */
.expand-enter-active, .expand-leave-active { transition: all 0.3s ease; max-height: 400px; opacity: 1; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }

.loading { text-align: center; padding: 50px; color: #1890ff; }
.error-msg { color: #ff4d4f; text-align: center; padding: 20px; font-weight: bold; }
</style>