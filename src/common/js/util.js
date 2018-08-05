// 在min和max之间的数中取一个随机数
function getRandomInt(min,max) {
  // max-min+1是为了能去到上限max，0<Math.random<1
  return Math.floor(Math.random()*(max-min+1)+min);
}


// 打乱数组
export function shuffle(arr) {
  // 复制一个新数组
  var _arr=arr.slice()
  for (var i=0;i<_arr.length;i++){
    var j=getRandomInt(0,i);
    var t=_arr[i];
    _arr[i]=_arr[j];
    _arr[j]=t;
  }
  return _arr;
}
// 函数节流，即延迟一段时间在执行要执行的函数，func是要执行的函数，即要被延迟执行的函数，delay是要延迟多久
export function debounce(func,delay) {
  var timer;
  return function (...args) {
    if(timer){
      clearTimeout(timer)
    }
    timer=setTimeout(()=>{
      // apply()方法 接收两个参数，一个是函数运行的作用域（this），另一个是参数数组。
      func.apply(this,args)
    },delay)
  }
}
