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

  hourly.time.forEach((datetime, i) => {
    const dateObj = new Date(datetime);

    if (dateObj.getTime() < todayStart) {
      return; 
    }

    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = weekDays[dateObj.getDay()];
    const dateKey = `${month}月${day}(${dayOfWeek})`;

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push({
      time: datetime,
      hour: dateObj.getHours(),
      temperature: hourly.temperature_2m[i],
      precipitation: hourly.precipitation[i],
      weathercode: hourly.weathercode[i]
    });
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
  <div>
    <h1>{{ selectedPrefecture }}の時間ごとの気温と降水量</h1>
    <select v-model="selectedPrefecture" @change="fetchWeather">
      <option v-for="pref in prefectures" :key="pref.name" :value="pref.name">
        {{ pref.name }}
      </option>
    </select>
    <div v-if="groupedWeather">
      <div v-for="(times,date) in groupedWeather" :key="date" style="margin-bottom: 30px;">
        <h2>{{ date }}</h2>
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%; text-align: center;">
          <thead>
            <tr>
              <th>時間</th>
              <th>天気</th>
              <th>気温</th>
              <th>服装</th>
              <th>降水量</th>
            </tr>
          </thead>
            <tbody>
              <tr v-for="item in times" :key="item.time">
                <td>{{ item.hour }}時</td>
                <td>{{ weatherText(item.weathercode )}}</td>
                <td>{{ item.temperature }}℃</td>
                <td>{{ checkClothes(item.temperature) }}</td>
                <td>{{ item.precipitation }}mm</td>
              </tr>
            </tbody>
          </table>
        </div>
     </div>
     <div v-else-if="error">
       <p style="color: red">{{ error }}</p>
      </div>
    <div v-else>
      <p>データを取得中..</p>
    </div>
  </div>
</template>

<style scoped>
body, div, select, table {
  font-family: -apple-system,BlinkMacSystemFont, "Segoe uI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    color: #333;
    background-color:#f9f9f9;
}
h1{
  text-align: center;
  margin-bottom: 30px;
  font-weight: 700;
  font-size: 2rem;
  color: #2c3e50;
}
h2{
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 15px;
  color: #34495e;
}
select{
  display: block;
  margin: 0 auto 30px auto;
  padding: 8px 15px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.3s ease;
}
select:hover, select:focus{
  border-color: #007BFF;
  outline: none;
}
table{
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8 px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0,1);
  border-radius: 8px;
  overflow: hidden;
}
th{
  background-color: #007BFF;
  color:white;
  padding: 12px 15px;
  font-weight:600;
  text-align: center;
  user-select: none;
}
td{
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #e1e4e8;
}
tbody tr:last-child td:first-child{
  border-bottom-left-radius: 8px;
}
tbody tr:last-child td:last-child{
  border-bottom-right-radius:8px;
}
tbody tr:hover{
  background-color: #e6f2ff;
  transition: background-color 0.3s ease;
}

@media(max-width: 600px){
  table, thead, tbody, th, td, tr{
    display: block;
    thead{
      display: none;
    }
    tr{
      background: #fff;
      margin-bottom: 15px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0,1);
    }
    td{
      border: none;
      padding-left: 50%;
      position: relative;
      text-align: left;
      font-size:0.9rem;
    }
    td::before{
      position: absolute;
      top: 50%;
      left: 15px;
      transform: translateY(50%);
      white-space: nowrap;
      font-weight:600;
      color: #555;
    }
    td:nth-of-type(1)::before { content: "時間"; }
    td:nth-of-type(2)::before { content: "天気"; }
    td:nth-of-type(3)::before { content: "気温"; }
    td:nth-of-type(4)::before { content: "服装"; }
    td:nth-of-type(5)::before { content: "降水量"; }
  }
}
</style>