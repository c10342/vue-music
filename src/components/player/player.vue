<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
    <div class="normal-player" v-show="fullScreen">
      <div class="background">
        <img width="100%" height="100%" :src="currentSong.image">
      </div>
      <div class="top">
        <div class="back" @click="back">
          <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="currentSong.singer"></h1>
        <h2 class="subtitle" v-html="currentSong.name"></h2>
      </div>
      <div class="middle"
           @touchstart.prevent="middleTouchStart"
           @touchmove.prevent="middleTouchMove"
           @touchend="middleTouchEnd"
      >
        <div class="middle-l" ref="middleL">
          <div class="cd-wrapper" ref="cdWrapper">
            <div class="cd" :class="cdCls">
              <img class="image" :src="currentSong.image">
            </div>
          </div>
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{playingLyric}}</div>
          </div>
        </div>
        <!--:data="currentLyric && currentLyric.lines" 当有歌词的时候才把currentLyric.lines传递给scroll-->
        <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
          <div class="lyric-wrapper">
            <div v-if="currentLyric">
              <p ref="lyricLine"
                 class="text"
                 :class="{'current': currentLineNum ===index}"
                 v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
            </div>
          </div>
        </scroll>
      </div>
      <div class="bottom">
        <div class="dot-wrapper">
          <span class="dot" :class="{'active':currentPage==='cd'}"></span>
          <span class="dot" :class="{'active':currentPage==='lyric'}"></span>
        </div>
        <div class="progress-wrapper">
          <span class="time time-l">{{format(currentTime)}}</span>
          <div class="progress-bar-wrapper">
            <progress-bar :percent="percent" @percentChange="percentChange"></progress-bar>
          </div>
          <span class="time time-r">{{format(currentSong.duration)}}</span>
        </div>
        <div class="operators">
          <div class="icon i-left" @click.stop="changeMode">
            <i :class="iconPlayMode"></i>
          </div>
          <div class="icon i-left" @click="prev" :class="disableCls">
            <i class="icon-prev"></i>
          </div>
          <div class="icon i-center" @click="toggleplaying" :class="disableCls">
            <i :class="normalPlayIcon"></i>
          </div>
          <div class="icon i-right"  @click="next" :class="disableCls">
            <i class="icon-next"></i>
          </div>
          <div class="icon i-right">
            <i class="icon" :class="getFavoriteIcon(currentSong)" @click.stop="toggleFavorite(currentSong)"></i>
          </div>
        </div>
      </div>
    </div>
    </transition>
    <transition name="mini">
    <div class="mini-player"v-show="!fullScreen"  @click="open">
      <div class="icon">
        <img :class="cdCls" width="40" height="40" :src="currentSong.image">
      </div>
      <div class="text">
        <h2 class="name" v-html="currentSong.name"></h2>
        <p class="desc" v-html="currentSong.singer"></p>
      </div>
      <div class="control" @click.stop="toggleplaying">
        <progress-circle :percent="percent" :radius="radius">
        <i :class="miniPlayIcon" class="icon-mini"></i>
        </progress-circle>
      </div>
      <div class="control" @click.stop="showPlayList">
        <i class="icon-playlist"></i>
      </div>
    </div>
    </transition>
    <play-list ref="playlist"></play-list>
    <!--canplay,error,timeupdate，ended，play是audio中的事件，canplay表示歌曲已经准备好了，error表示请求不到资源出现错误,timeupdate在歌曲播放时会不停的触发该事件,ended在歌曲播放完后会触发，play是当音频/视频已开始或不再暂停时-->
    <audio :src="currentSong.url" ref="audio" @play="ready" @error="error" @timeupdate="timeupdate" @ended="ended"></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations,mapActions} from 'vuex'
  import animations from 'create-keyframe-animation';
  import {prefixstyle} from "../../common/js/dom";
  import ProgressBar from '../../base/progress-bar/progress-bar.vue';
  import ProgressCircle from '../../base/progress-circle/progress-circle.vue'
  import {playMode} from '../../common/js/config.js'
  import Lyric from 'lyric-parser';
  import Scroll from '../../base/scroll/scroll.vue';
  import PlayList from '../playlist/playlist.vue';
  import {playerMixin} from "../../common/js/mixin";
  const transform=prefixstyle('transform')
  const transitionDuration=prefixstyle('transitionDuration');

  export default {
    name: "player",
    mixins:[playerMixin],
    components:{
      ProgressBar,
      ProgressCircle,
      Scroll,
      PlayList
    },
    data(){
      return {
        // 歌曲是否加载完成，用于播放器下方的下一首，上一首是否能点击
        songReady: false,
        // 歌曲是否加载完成，用于播放器下方的下一首，上一首，暂停播放是否高亮显示
        canGetSong: false,
        // 歌曲播放进度
        currentTime: 0,
        //迷你播放器的播放暂停的圆直径
        radius: 34,
        // 歌词
        currentLyric: null,
        // 当前播放到第几行歌词
        currentLineNum: 0,
        //播放器所在的页面，歌词页面或者是cd页面
        currentPage:'cd',
        // 当前正在播放的歌词
        playingLyric:''
      };
    },
    computed: {
      // 返回播放或者暂停图标
      normalPlayIcon(){
        return this.playing?'icon-pause':'icon-play'
      },
      // 返回播放或者暂停图标
      miniPlayIcon(){
        return this.playing?'icon-pause-mini':'icon-play-mini'
      },
      // 返回播放器下方的下一首，上一首，暂停播放是否高亮显示的类
      disableCls(){
        return this.canGetSong?'':'disable'
      },
      // 添加动画效果，使播放器图片旋转
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      percent(){
        return this.currentTime/this.currentSong.duration
      },
      ...mapGetters([
        'fullScreen',
        'playList',
        'playing',
        'currentIndex',
      ])
    },
    created(){
      this.touch={}
    },
    methods: {
      // 切换成迷你播放器
      back() {
        this.setFullScreen(false)
      },
      // 切换成全屏播放器
      open(){
        this.setFullScreen(true)
      },
      // el是DOM元素，done是回调函数，执行done后会自动执行钩子函数@after-enter="afterEnter"，done必须要执行，不执行，动画会没有效果
      enter(el,done){
        var {x,y,scale}=this._getPosAndScale();
        // 下面是利用create-keyframe-animation用js写css动画
        // 动画
        let animation={
          0:{
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
          60 :{
            transform: `translate3d(0,0,0) scale(1.1)`
        },
          100:{
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        // 注册动画
        animations.registerAnimation({
          name:'move', //动画名称
          animation, //动画
          parset:{  //执行动画的一些参数
            duration: 400, //执行动画的时间
            easing: 'linear' //运动方式
          }
        })
        // 运行动画，第一个参数是执行动画的DOM元素，第二个是注册了的动画名称，第三个参数是回调函数
        animations.runAnimation(this.$refs.cdWrapper,'move',done);
      },
      afterEnter(){
        // 取消注册了的动画
        animations.unregisterAnimation(this.$refs.cdWrapper,'move');
        this.$refs.cdWrapper.style.animation='';
      },
      // el是DOM元素，done是回调函数，执行done后会自动执行钩子函数@after-leave="afterLeave"，done必须要执行，不执行，动画会没有效果
      leave(el,done){
        var {x,y,scale}=this._getPosAndScale();
        // 设置离开时的过渡效果
        this.$refs.cdWrapper.style.transition='all 0.4s'
        // 全屏播放器图片移动到迷你播放器图片的位置
        this.$refs.cdWrapper.style[transform]=`translate3d(${x}px,${y}px,0) scale(${scale})`;
        // 过渡效果执行完毕后执行done
        this.$refs.cdWrapper.addEventListener('transitionend',done)
      },
      afterLeave(){
        // 清除过渡效果和动画
        this.$refs.cdWrapper.style.transition='';
        this.$refs.cdWrapper.style[transform]='';
      },
      // 播放器进行动画所需要的信息
      _getPosAndScale(){
        // 迷你播放器图片宽度
        var targerWidth=40;
        // 迷你播放器图片圆心距离屏幕左边的距离
        var paddingLeft=40;
        // 迷你播放器图片圆心距离屏幕下边的距离
        var paddingBottom=30;
        //全屏播放器图片(非圆心)距离屏幕上边的距离
        var paddingTop=80;
        // 全屏播放器图片宽度
        var width=window.innerWidth*0.8;
        //全屏图片变成迷你图片要进行缩放的比例
        var scale=targerWidth/width;
        // 全屏图片移动到迷你图片的x轴位移,x轴正方向向右,y轴正方向向下,原点和全屏图片重合
        var x= -(window.innerWidth/2-paddingLeft);
        // 全屏图片移动到迷你图片的x轴位移
        var y= window.innerHeight-paddingBottom-paddingTop-width/2;
        return{
          x,y,scale
        }
      },
      // 下一首歌
      next(){
        if(!this.songReady){
          return
        }
        // 当歌曲列表只有一首歌时，让他自动循环
        if(this.playList.length==1){
          this.loop()
          return
        }else {
          // 下一首歌
          var index =this.currentIndex+1;
          // 最后一首歌
          if(index==this.playList.length){
            index=0
          }
          this.setCurrentIndex(index);
          this.setPlaying(true)
        }
        this.songReady=false;
      },
      // 上一首歌
      prev(){
        if(!this.songReady){
          return
        }
        if(this.playList.length==1){
          this.loop();
          return;
        }else{
          var index =this.currentIndex-1;
          if(index==-1){
            index=this.playList.length-1;
          }
          this.setCurrentIndex(index);
          this.setPlaying(true)
        }
        this.songReady=false;
      },
      // 音乐资源加载完成后
      ready(){
        this.songReady=true;
        this.canGetSong=true;
        this.savePlayHistory(this.currentSong)
      },
      // 音乐资源发生错误后
      error(){
        // songReady置为true是为了能点击上一首和下一首
        this.songReady=true;
        // canGetSong置为false是为了上一首和下一首和暂停播放不高亮显示
        this.canGetSong=false;
      },
      // 获取当前歌曲播放的进度
      timeupdate(e){
        this.currentTime=e.target.currentTime;
      },
      // 处理组件派发出来的事件
      percentChange(percent){
        var currentPercent=this.currentSong.duration*percent
        // 修改歌曲播放的进度
        this.$refs.audio.currentTime=currentPercent;
        this.setPlaying(true);
        if(this.currentLyric){
          this.currentLyric.seek(currentPercent*1000)
        }
      },
      format(num){
        // 向下取整，相当于Math.floor(num/60)
        var m=num/60 |0 ;
        var s= this._pad(num%60 | 0);
        return `${m}:${s}`
      },
      // 补齐位数
      _pad(num,n=2){
        var len=num.toString().length;
        while(len<n){
          num='0'+ num;
          len++
        }
        return num
      },
      ended(){
        if(this.mode==playMode.loop){
          this.loop();
        }else{
          this.next();
        }
      },
      loop(){
        if(this.currentLyric){
          // 循环播放时让歌词回到时间为0的时间点上
          this.currentLyric.seek(0)
        }
        this.$refs.audio.currentTime=0;
        this.$refs.audio.play();
      },
      // 获取歌词
      getLyric(){
        this.currentSong.getLyric().then((res)=>{
          // 把歌词变成一个类，第一个参数是歌词，第二个参数是回调函数，每次滚动歌词的时候都会触发该函数
          this.currentLyric=new Lyric(res,this.handelLyric);
          // 当前正在播放才开始滚动歌词
          if(this.playing){
            this.currentLyric.play();
          }
        }).catch(()=>{
          // 获取不到歌词的时候，清空数据
          this.currentLyric=null;
          this.playingLyric='';
          this.currentLineNum=0
        });
      },
      // lineNum当前是第几行，txt该行的是歌词
      handelLyric({lineNum, txt}){
        this.currentLineNum=lineNum;
        // 修改当前正在播放的歌词
        this.playingLyric=txt
        // 歌词的行数大于5才开始滚动，这样保证了歌词处于中间
        if(lineNum>5){
          var el=this.$refs.lyricLine[lineNum-5]
          this.$refs.lyricList.scrollToElement(el,1000)
        }else{
          this.$refs.lyricList.scrollTo(0,0,1000)
        }
      },
      // 暂停，播放按钮
      toggleplaying(){
        // 改变vuexplaying的播放状态
        this.setPlaying(!this.playing);
        if(this.currentLyric){
          // 点击暂停按钮时让歌词也暂停
          this.currentLyric.togglePlay();
        }
      },
      middleTouchStart(e){
        this.touch.initiated=true;
        var touch=e.touches[0];
        this.touch.startX=touch.pageX;
        this.touch.startY=touch.pageY;
      },
      middleTouchMove(e){
        if(!this.touch.initiated){
          return;
        }
        var touch=e.touches[0];
        var delatx=touch.pageX-this.touch.startX;
        var delaty=touch.pageY-this.touch.startY;
        // 因为scroll组件可以向上滚动，当在y轴上的差值大于x轴上的差值是，说明是在滚动scroll组件。不是切换cd页面和歌词页面
        if(Math.abs(delaty)>Math.abs(delatx)){
          return;
        }
        // 记录歌词页面所在的位置，距离屏幕左边的位置
        var left=this.currentPage=='cd'?0:-window.innerWidth;
        // 手指移动的距离，也是歌词移动的距离，如果当前页是cd页面，手指从左向右滑，left+delatx>0,offsetWidth=0;手指从右向左滑，left+delatx<0,offsetWidth=手指滑动的距离。如果当前页是歌词页面，手指从左向右滑，left+delatx<0,offsetWidth=手指滑动的距离;手指从右向左滑，left+delatx<0,offsetWidth=-window.innerWidth-100
        var offsetWidth=Math.min(0,Math.max(-window.innerWidth-100,left+delatx));
        // 当前移动的距离占可移动最大距离的百分比
        this.touch.percent=Math.abs(offsetWidth/window.innerWidth)
        // 设置过渡
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        // 移动歌词页面
        this.$refs.lyricList.$el.style[transform]=`translate3d(${offsetWidth}px,0,0)`
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd(e){
        var offsetWidth;
        var opacity;
        if(this.currentPage=='cd'){
          // 从右向左移动的距离大于20%，切换成歌词页面
          if(this.touch.percent>0.2){
            offsetWidth=-window.innerWidth;
            opacity=0
            this.currentPage='lyric';
          }else{
            // 从左向右
            opacity=1;
            offsetWidth=0;
          }
        }else{
          // 当前页是歌词页时
          // 从左向右移动的距离小于80%，切换成cd页面
          if(this.touch.percent<0.8){
            offsetWidth=0;
            this.currentPage='cd';
            opacity=1;
          }else {
            opacity=0;
            offsetWidth=-window.innerWidth;
          }
        }
        this.$refs.lyricList.$el.style[transitionDuration] = '400ms'
        this.$refs.lyricList.$el.style[transform]=`translate3d(${offsetWidth}px,0,0)`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = '400ms'
      },
      // 显示播放列表
      showPlayList(){
        this.$refs.playlist.show();
      },
      ...mapMutations({
        setFullScreen: 'SET_FULLSCREEN',
        setPlaying:'SET_PLAYING',
        setSequenceList:'SET_SEQUENCELIST',
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch:{
      currentSong(newSong,oldSong){
        // 当在歌曲播放列表中删除掉所有歌曲后，newSong变为null，没有这个判断，后面的会继续执行，然后报错
        if(!newSong.id){
          return;
        }
        // 改变播放模式后会改变歌曲，点击暂停后再点击切换播放模式会使歌曲开始播放，我们要判断
        if(newSong.id==oldSong.id){
          return;
        }
        if(this.currentLyric){
          // Lyric可以自动滚动是因为内有定时器，但我们切换歌曲时，由于定时器没有清除，所以歌词会不断地跳动，所以这里我们要清除定时器
          this.currentLyric.stop();
        }
        // 防止快速切换歌曲时导致this.$refs.audio.play()被执行2次
        clearTimeout(this.timer);
        // 由于audio发送请求需要时间，所以我们要延迟执行
        this.timer=setTimeout(()=>{
          // 同步
          this.$refs.audio.play();
          // 异步
          this.getLyric();
        },1000);
      },
      playing(newPlay){
        // 由于audio发送请求需要时间，所以我们要延迟执行
        this.$nextTick(()=>{
          newPlay?this.$refs.audio.play():this.$refs.audio.pause();
        })
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                //暂停动画效果
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
            //设置全屏播放器进来和离开时的过渡效果
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        //设置上面标题和下面控制器进来和离开时的过渡效果
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
          //进来的初始状态和离开后的状态
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
