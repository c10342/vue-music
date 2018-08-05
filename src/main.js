// 使用es6api
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyload from 'vue-lazyload'
import './common/stylus/index.styl'
import store from './store/index.js'

// 移动端调试工具，即在手机端可以看见在浏览器中的输出，实际上是改写了console
// import vConsole from 'vconsole';
// var vconsole=new vConsole()
// console.log('test');



Vue.config.productionTip = false
//解决移动端点击延迟300毫秒问题
fastclick.attach(document.body)

Vue.use(VueLazyload,{
  // 当图片还在加载的时候要显示的图片,使用require时webpack会帮我们去加载
  loading:require('./common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
