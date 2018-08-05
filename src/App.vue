<template>
  <div>
    <m-header></m-header>
    <tab></tab>
    <!--keep-alive把路由放在内存中，在切换路由回到以前的路由是可以减少请求网络-->
    <keep-alive>
    <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
  import MHeader from './components/m-header/m-header.vue';
  import Tab from './components/tab/tab.vue';
  import Player from './components/player/player.vue'
export default {
  name: 'App',
  components:{
    MHeader,
    Tab,
    Player
  }
}
</script>

<style  scoped lang="stylus" rel="stylesheet/stylus">

</style>
