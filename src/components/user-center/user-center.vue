<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click.stop="goback">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :switches="switches" :current-index="currentIndex" @switch="selectItem"></switches>
      </div>
      <div class="play-btn" @click.stop="randam">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listwrapper">
        <scroll ref="favoritesonglist" :data="favoriteSongList" v-if="currentIndex==0" class="list-scroll">
          <div class="list-inner">
            <song-list :songs="favoriteSongList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <scroll ref="playlist" :data="playHistory" v-if="currentIndex==1" class="list-scroll">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultTitlt"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
  import Switches from '../../base/switches/switches.vue';
  import {mapGetters,mapActions} from 'vuex';
  import Scroll from '../../base/scroll/scroll.vue';
  import Song from "../../common/js/song.js";
  import SongList from '../../base/song-list/song-list.vue';
  import NoResult from '../../base/no-result/no-result.vue'
  import {playlistMixin} from "../../common/js/mixin";

  export default {
    name: "user-center",
    mixins:[playlistMixin],
    components:{
      Switches,
      Scroll,
      SongList,
      NoResult
    },
    data(){
      return {
        currentIndex: 0,
        switches: [
          {name: '我喜欢的'},
          {name:'最近播放'}
        ]
      };
    },
    methods:{
      // 切换我喜欢的和最近播放
      selectItem(index){
        this.currentIndex=index;
      },
      // 把当前选中的歌曲添加到播放列表
      selectSong(song){
        this.insertSong(new Song(song))
      },
      // 随机播放
      randam(){
        // 判断当前显示的是我喜欢的还是最近播放
        var list =this.currentIndex==0?this.favoriteSongList:this.playHistory;
        // 没有歌曲
        if(list.length==0){
          return;
        }
        list=list.map((item)=>{
          return new Song(item)
        });
        this.randomPlay({list});
      },
      // 实现playlistMixin中的handlePlaylist，不然会报错，让底部自适应，不被迷你播放器遮挡
      handlePlaylist(list){
        var bottom=list.length>0?'60px':'';
        this.$refs.listwrapper.style.bottom=bottom;
        this.$refs.favoritesonglist && this.$refs.favoritesonglist.refresh();
        this.$refs.playlist && this.$refs.playlist.refresh();

      },
      // 返回上一级路由
      goback(){
        this.$router.back();
      },
      ...mapActions([
        'insertSong',
        'randomPlay'
      ])
    },
    computed:{
      // 是否显示NoResult组件
      noResult(){
        if(this.currentIndex==0){
          return !this.favoriteSongList.length;
        }else{
          return !this.playHistory.length;
        }
      },
      // NoResult组件标题
      noResultTitlt(){
        if(this.currentIndex==0){
          return '暂无收藏歌曲';
        }else{
          return '你还没有听过歌曲';
        }
      },
      ...mapGetters([
        'favoriteSongList',
        'playHistory'
      ])
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
