<template>
  <transition name="slide">
    <div class="add-song" @click.stop v-show="showFlag">
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hidenAndRefresh">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" @query="onQueryChanged" placeholder="请输入歌曲"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches @switch="switchItem" :current-index="currentIndex" :switches="switches"></switches>
        <div class="list-wrapper">
          <scroll ref="songlist" :data="playHistory" v-if="currentIndex==0" class="list-scroll">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll :refreshDelay="refreshDelay" ref="searchlist" :data="searchHistory" v-if="currentIndex==1" class="list-scroll">
            <div class="list-inner">
              <search-list
                :searches="searchHistory"
                @deleteOne="deleteOneSearch"
                @select="selectsong"
              ></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest
          @select="savesearchhistory"
          :query="query"
          @listBeforeScroll="listBeforeScroll"
          ref="suggest"
        >
        </suggest>
      </div>
      <top-tip ref="toptip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
  import SearchBox from '../../base/search-box/search-box.vue';
  import Suggest from '../suggest/suggest.vue'
  import {searchMixin} from "../../common/js/mixin";
  import Switches from '../../base/switches/switches.vue';
  import Scroll from "../../base/scroll/scroll";
  import {mapGetters,mapActions} from 'vuex'
  import SongList from "../../base/song-list/song-list";
  import Song from '../../common/js/song.js'
  import SearchList from '../../base/search-list/search-list.vue';
  import TopTip from '../../base/top-tip/top-tip.vue';

  export default {
    name: "add-song",
    mixins:[searchMixin],
    components:{
      SearchList,
      SongList,
      Scroll,
      SearchBox,
      Suggest,
      Switches,
      TopTip
    },
    data(){
      return{
        // 组件是否显示
        showFlag:false,
        // 最近播放和搜索历史显示的是哪一个
        currentIndex:0,
        // 转换的名称
        switches:[
          {
            name:'最近播放'
          },
          {
            name:'搜索历史'
          }
        ]
      }
    },
    methods:{
      show(){
        this.showFlag=true;
        // 等待DOM生成
        setTimeout(()=>{
          // 组件从隐藏变显示需要让better-scroll重新计算高度
          if(this.currentIndex==0){
            this.$refs.songlist.refresh();
          }else{
            this.$refs.searchlist.refresh();
          }
        },20)
      },
      hiden(){
        this.showFlag=false;
      },
      // 隐藏和让歌曲列表重新计算高度
      hidenAndRefresh(){
        this.$emit('refresh');
        this.hiden();
      },
      // 最近播放和搜索历史显示的是哪一个
      switchItem(index){
        this.currentIndex=index;
      },
      // 点击最近播放的歌曲
      selectSong(song,index){
        // 最近播放中的第一首是正在播放的
        if(index!=0){
          // 这里new Song(song)是因为从localstorage中拿出来的不是对象我们需要new一个对象出来
          this.insertSong(new Song(song));
          this.showTip();
        }
      },
      // 在搜索列表中选择歌曲
      selectsong(query){
        // 设置输入框内容
        this.selectItem(query);
      },
      // 保存搜索记录
      savesearchhistory(){
        this.savesearchHistory();
        this.showTip();
      },
      // 显示添加歌曲成功提示
      showTip(){
        this.$refs.toptip.show();
      },
      ...mapActions([
        'insertSong'
      ])
    },
    computed:{
      ...mapGetters([
        'playHistory'
      ])
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
