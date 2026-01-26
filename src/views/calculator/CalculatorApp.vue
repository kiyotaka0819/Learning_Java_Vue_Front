<script setup>
import { ref } from 'vue'
 
const appTitle = '電卓アプリ';
const calcView = ref('');
const calcEqual = ref('0');
const calcAfter = ref(false);
const calcButton = [
  ['7', '8', '9', '/' ],
  ['4', '5', '6', '*' ],
  ['1', '2', '3', '-' ],
  ['C', '0', '=', '+' ],
];
const calcSymbol = ['+', '-', '*', '/'];
const calcNum = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// 最後に入力したものを取得する関数
const getLastBtn = () => {
  return calcView.value.slice(-1);
} 
// 計算を行う関数
const calc = () => {
  // 空の時のundefinedを阻止
  if (calcView.value === ''){
    return;
  }
  // 計算を実施
  try {
    const result = calcEqual.value = String(eval(calcView.value));
    // 計算した後に表示画面も答えを表示に切り替え
    calcEqual.value = result;
    calcView.value = result;
    calcAfter.value = true;
  } catch(e) {
    calcView.value = "エラー";
  }
}

// クリアする関数
const calcClear = () => {
  calcView.value = '';
  calcEqual.value = '0';
  calcAfter.value = false;
}
// 数字かどうか判定する関数
const isNum = (btnValue) => {
  return calcNum.includes(btnValue);
} 
// 演算子かどうか判定する関数
const isSymbol = (btnValue) => {
  return calcSymbol.includes(btnValue);
} 
// 前回の入力が四則演算子であれば重複入力を防ぐ関数
const checkIsSymbol = (btnValue) => {
  if(isSymbol(getLastBtn())){
    return true;
  }else{
    return false;
  }
}
// 四則演算子の入力を管理する関数
const symbolAfterCheck = (btnValue) => {
  // 記号じゃなければチェック不要
  if(!isSymbol(btnValue)) return false;
  // 空の時のみ四則演算子OK
  if(calcView.value === '') return true;

  // 記号の連続時には前の記号を消して新しいのに置き換える
  if(checkIsSymbol(btnValue)){
    calcView.value = calcView.value.slice(0, -1) + btnValue;
    return true;
  }
  
  return false;
}
// 入力したボタンを画面に表示する
const addDisplay = (btnValue) => {
  // クリア処理
  if(btnValue == 'C'){
    return calcClear();
  }
  // イコール処理
  else if(btnValue =='='){
    if(getLastBtn() == '='){
      if(isNum(btnValue)){
        return;
      }
      return;
    }
    else if(isSymbol(getLastBtn())){
      return;
    }else{
      calc();
    }
  }
  // 入力値チェック
  else{
    if(calcAfter.value && isNum(btnValue)){
      calcView.value = btnValue;
      calcEqual.value = '0';
      calcAfter.value = false;
    }else if(calcAfter.value && isSymbol){
      calcAfter.value = false;
      calcView.value += btnValue;
    }else if(calcView.value == '0' && isNum(btnValue)){
      calcView.value = btnValue;
    }else{
      calcView.value += btnValue;
    }
  }
}
</script>
 
<template>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
  <main>
    <div class="app-title">
      {{ appTitle }}
    </div>
    <div class="calc-total">
      <div class="calc-view">
        {{ calcView }}
      </div>
      <div class="calc-equal">
        {{ calcEqual }}
      </div>
      <div v-for="buttonArray in calcButton" class="button-container">
        <button v-for="button in buttonArray" v-on:click="addDisplay(button)" class="button-only">
          {{ button }}
        </button>
      </div>
    </div>
  </main>
</template>
 
<style scoped>
main{
  position: static;
  text-align: center;
}
.app-title{
  font-size:xx-large;
}
.calc-total{
  display: block;
  justify-items: center;

}
.calc-view{
  background-color: black;
  color: gray;
  width:280px;
  height:50px;
  font-size: 20px;
  text-align: right;
  font-family: 'orbitron',sans-serif;
}
.calc-equal{
  background-color: black;
  color: lightgreen;
  width:280px;
  height:50px;
  font-size: 40px;
  text-align: right;
  font-family: 'orbitron',sans-serif;
}
.button-container{
  display: flex;
  justify-content: center;
}
.button-only{
  font-size: 40px;
  float: left;
  width: 70px;
}
</style>