<script>
import prefectures from './prefectures.json'
import weatherMap from './weatherMap.json'
export default{
  data(){
    return{
      groupedWeather: null,
      error: null,
      selectedPrefecture: '福岡県',
      prefectures,
      clothes: null
    }
  },
  methods: {
    checkClothes(temperature ){
      if(temperature  < 0 ){
        return "アウター着用 + ヒートテック";
      }else if (temperature >= 0 && temperature < 10){
        return "アウター着用";
      }else if (temperature >= 10 && temperature < 25){
        return "長袖";
      }else {
        return "半袖";
      }
    },
    fetchWeather(){
      const pref = this.prefectures.find(p => p.name === this.selectedPrefecture);
      if(!pref) return;

      this.groupedWeather = null;
      this.error=null;

      fetch
fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pref.lat}&longitude=${pref.lon}&hourly=temperature_2m,precipitation,weathercode&timezone=Asia%2FTokyo`)
      .then(res => res.json())
      .then(data => {
        this.groupedWeather = this.groupByDate(data.hourly);
      })
      .catch(() => {
        this.error = '天気情報の取得に失敗しました'
      });
    },
    weatherText(code){
      return weatherMap[code] || '❓(不明)';
    },
groupByDate(hourly) {
  const grouped = {};
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  hourly.time.forEach((datetime, i) => {
    const dateObj = new Date(datetime);
    if (dateObj.getTime() < todayStart) return;

    const dateKey = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日(${weekDays[dateObj.getDay()]})`;

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        summary: { maxTemp: -99, minTemp: 99, totalPrecip: 0, maxPrecip: 0, tempSum: 0, count: 0 },
        details: []
      };
    }

    const temp = hourly.temperature_2m[i];
    const precip = hourly.precipitation[i];
    const s = grouped[dateKey].summary;

    s.maxTemp = Math.max(s.maxTemp, temp);
    s.minTemp = Math.min(s.minTemp, temp);
    s.totalPrecip += precip;
    s.maxPrecip = Math.max(s.maxPrecip, precip);
    s.tempSum += temp;
    s.count++;

    grouped[dateKey].details.push({
      hour: dateObj.getHours(),
      temp: temp,
      precip: precip,
      code: hourly.weathercode[i]
    });
  });

  Object.values(grouped).forEach(day => {
    // 基礎計算
    day.summary.avgTemp = (day.summary.tempSum / day.summary.count).toFixed(1);
    day.summary.totalPrecip = parseFloat(day.summary.totalPrecip).toFixed(1);

    // 【服装判定】イッチのこだわりロジック
    const month = now.getMonth() + 1;
    let targetTemp = day.summary.avgTemp;
    if (month >= 5 && month <= 9) {
      targetTemp = day.summary.maxTemp;
      day.summary.clothesNote = "※最高気温基準";
    } else if (month >= 11 || month <= 3) {
      targetTemp = day.summary.minTemp;
      day.summary.clothesNote = "※最低気温基準";
    } else {
      day.summary.clothesNote = "※平均気温基準";
    }
    day.summary.clothes = this.checkClothes(targetTemp);

    // 【傘と雨の様子】
    const mp = day.summary.maxPrecip;
    
    // 傘の判定
    if (mp === 0) {
      day.summary.umbrella = "✨ 傘なしOK";
    } else if (mp < 1.0) {
      day.summary.umbrella = "🌂 折りたたみ傘推奨";
    } else {
      day.summary.umbrella = "☔ 長傘が必要";
    }

    // 雨の強さ（ここが抜けてた！）
    if (mp === 0) {
      day.summary.precipText = "降水なし";
    } else if (mp < 2) {
      day.summary.precipText = "パラつく";
    } else if (mp < 10) {
      day.summary.precipText = "本降り";
    } else {
      day.summary.precipText = "激しい雨";
    }
  });

  return grouped;
}
  },
  mounted(){
    this.fetchWeather();
  }
}
</script>
<template>
  <div class="weather-container">
    <div v-for="(data, date) in groupedWeather" :key="date" class="day-card">
      <div class="day-header">
        <h2>{{ date }}</h2>
        
        <div class="advice-box">
          <div class="advice-item">👕 {{ data.summary.clothes }}</div>
          <div class="advice-item">{{ data.summary.umbrella }}</div>
        </div>

        <div class="summary-grid">
          <div class="summary-item">最高: <span class="max">{{ data.summary.maxTemp }}℃</span></div>
          <div class="summary-item">最低: <span class="min">{{ data.summary.minTemp }}℃</span></div>
          <div class="summary-item">雨の様子: {{ data.summary.precipText }}</div>
          <div class="summary-item">平均: {{ data.summary.avgTemp }}℃</div>
        </div>
      </div>

      <div class="hourly-scroll">
        <div v-for="h in data.details" :key="h.hour" class="hourly-item">
          <div class="time">{{ h.hour }}時</div>
          <div class="icon">{{ weatherText(h.code) }}</div>
          <div class="temp">{{ h.temp }}℃</div>
          <div v-if="h.precip > 0" class="precip-small">{{ h.precip }}mm</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.day-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
}
.max { color: #ff4d4d; font-weight: bold; }
.min { color: #4d79ff; font-weight: bold; }

.hourly-scroll {
  display: flex;
  overflow-x: auto; /* 横スクロールを許可 */
  gap: 15px;
  padding-bottom: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}
.hourly-item {
  min-width: 60px;
  text-align: center;
  flex-shrink: 0;
}
.time { font-size: 0.8rem; color: #666; }
.temp { font-weight: bold; }

.advice-box {
  display: flex;
  justify-content: space-around;
  background: #e6f7ff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 15px;
  font-weight: bold;
  border: 1px solid #91d5ff;
}
.precip-small {
  font-size: 0.7rem;
  color: #1890ff;
}
</style>