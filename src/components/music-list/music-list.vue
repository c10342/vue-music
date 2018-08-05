<template>
  <div class="music-list" ref="musicList">
    <div class="back" @click="goBack">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="image">
      <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter"></div>
    </div>

    <!--用于跟随歌曲列表滚动时滚动-->
    <!--这里不能该scroll组件的高度是因为滚动时又同时改变高度会出现问题，所以我们用一个背景层‘.bg-layer’利用z-index的层级关系使他在scroll下面，背景图上面，scroll滚动时把背景层同时移动-->
    <div class="bg-layer" ref="layer"></div>
    <scroll :data="songs" class="list" ref="list" :probe-type="probeType" :listen-scroll="listenScroll" @scroll="scroll">
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="selectItem" :rank="rank"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import Scroll from '../../base/scroll/scroll.vue';
  import SongList from '../../base/song-list/song-list.vue'
  import {prefixstyle} from '../../common/js/dom.js'
  import Loading from '../../base/loading/loading.vue'
  import {mapActions} from 'vuex'
  import {playlistMixin} from "../../common/js/mixin.js";

  // 做兼容
  const transform = prefixstyle('transform');
  // 顶部返回元素的高度
  const RESERVED_HEIGHT=40;
  export default {
    name: "music-list",
    mixins:[playlistMixin],
    components:{
      Scroll,
      SongList,
      Loading
    },
    data(){
      return {
        // 歌曲列表在y轴滚动的距离
        scrollY:0
      }
    },
    props: {
      // 下方的音乐列表
      songs: {
        type: Array,
        default: []
      },
      // 上方的背景图片
      bgImage: {
        type: String,
        default: ''
      },
      // 上方的标题
      title: {
        type: String,
        default:''
      },
      rank:{
        type:Boolean,
        default:false
      }
    },
    created(){
      this.listenScroll=true;
      this.probeType=3;
    },
    mounted(){
      // 获取图片的高度
      this.imageHeight=this.$refs.image.clientHeight;

      // 元素this.$refs.layer往上移动的最小距离，往上移动是负数，下移是正数
      this.minTransalteY=-this.imageHeight+RESERVED_HEIGHT;

      // this.$refs.list得到的是vue组件，this.$refs.list.$el得到的是vue组件下的子元素。
      //1、clientHeight网页(内容)可见区域高：document.body.clientHeight 即页面浏览器中可以看到内容的这个区域的高度，一般是最后一个工具条以下到状态栏以上的这个区域，与页面内容无关。注意：IE、Opera 认为 scrollHeight 是网页内容实际高度，可以小于 clientHeight。2、offsetHeight网页可见区域高：document.body.offsetHeight (包括边线的宽)
      this.$refs.list.$el.style.top=`${this.imageHeight}px`;
    },
    methods:{
      // 处理scroll派发出来的事件
      scroll(pros){
        // 得到better-scroll在y轴滚动的距离，不动时pros.y=0，在顶端往下拉时pros.y为正数，其他情况都为负数
        this.scrollY=pros.y;
      },
      // 返回歌手列表
      goBack(){
        this.$router.back();
      },
      // 处理子组件派发出来的事件，这里主要是修改vuex的state
      selectItem(item,index){
        this.setPlay({
          list:this.songs,
          index
        })
      },
      random(){
        this.randomPlay({
          list:this.songs
        })
      },
      // 实现mixins中的handlePlaylist方法
      handlePlaylist(list){
        if(list.length>0){
          this.$refs.list.$el.style.bottom='60px';
          this.$refs.list.refresh();
        }
      },
      // 导出actions里面的方法，必须在methods中导出，参数是数组，名称要与actions中的方法名一样
      ...mapActions([
        'setPlay',
        'randomPlay'
      ])
    },
    watch:{
      scrollY(newY){
        // 层级的初始值
        var zIndex=0;
        // 放大或缩小的初始值
        var scale=1;
        // 放大或缩小的百分比
        var percent=Math.abs(newY/this.imageHeight);
        if(newY>0){
          // 放大的倍数
          scale=1+percent;
          // 让放大后的图片可以遮住scroll组件
          zIndex=10;
        }

        // 元素this.$refs.layer往上滚动的距离，Math.max是取出2个数中的最大数，this.minTransalteY,newY都是负数
        var translateY=Math.max(this.minTransalteY,newY)
        this.$refs.layer.style[transform]=`translate3d(0,${translateY}px,0)`;

        // 当滚动的距离大于最小的移动距离时，newY和this.minTransalteY都是负数，即，背景层this.$refs.layer已经移动到最顶端时
        if(newY<this.minTransalteY){
          // 由于我们在最开始的样式是height为0，paddingTop是70%，所以才能达到上下3:7的布局，这事我们要把paddingTop设为0，height设为返回按钮元素的高度，把zIndex设为10，才能遮挡住文字
          this.$refs.image.style.paddingTop='0';
          this.$refs.image.style.height=`${RESERVED_HEIGHT}px`;
          zIndex=10;
          // 背景层滚动到最顶端时隐藏随机播放按钮
          this.$refs.playBtn.style.display='none';
        }else{
          // 背景层this.$refs.layer还没有移动到最顶端时，恢复原来的样式
          this.$refs.image.style.paddingTop='70%';
          this.$refs.image.style.height='0';
          // 显示随机播放按钮
          this.$refs.playBtn.style.display='';
        }
        this.$refs.image.style[transform] = `scale(${scale})`;
        this.$refs.image.style.zIndex=zIndex;
      }
    },
    computed:{
      bgStyle(){
        return `background-image:url(${this.bgImage})`
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
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
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
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
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
