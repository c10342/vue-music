<template>
  <!--
  probeType派发滚动事件，不节流
  listenScroll注册滚动监听事件
  @scroll="scroll"接收scroll组件派发出来的scroll事件，处理函数是scroll，即子组件向父组件通信
  -->
  <scroll :data="data"
          class="listview"
          ref="scrollContent"
          :probeType='probeType'
          @scroll="scroll"
          :listenScroll="listenScroll"
  >
    <ul>
      <li class="list-group" v-for="group in data" ref="scrollItem">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li class="list-group-item" v-for="item in group.item"  @click="selectItem(item)">
            <img v-lazy="item.avatar" alt="" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!--@touchmove.stop.prevent可以阻止冒泡和浏览器原生的滚动，stop和prevent是vue自带的标识-->
    <div class="list-shortcut needsclick" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item,index) in shoreCutList" class="item" :data-index="index" :class="{'current':currentIndex==index}">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="showTitle" ref="fixed">
      <h2 class="fixed-title">{{showTitle}}</h2>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
  import Scroll from '../scroll/scroll.vue';
  import {getData} from '../../common/js/dom.js';
  import Loading from '../loading/loading.vue'
  // 右侧导航栏每个字母的高度
  const HEIGHT=18;
  // 每个标题的高度
  const TITLE_HEIGHT=30;
  export default {
    name: "listview",
    components:{
      Scroll,
      Loading
    },
    data(){
      return {
        // 在y轴滚动的距离
        scrollY:-1,
        // 当前在哪一个歌手分组上
        currentIndex:0,
        // 分组区块与固定标题的差值，用于让下一个要固定的标题吧现在的标题往上顶
        diff:0
      }
    },
    props: {
      // 父组件传递过来的歌手信息数据
      data: {
        type: Array,
        default: []
      }
    },
    created(){
      // 这里不再data或者props中创建touch={}，是因为在data或者props中创建vue会为他他们创建一个get和set方法，并且可以再watch和computed中计算和检测他们的值变化，直接用this.touch={}是不能·计算和检测值变化，我们这里不需要检测和计算touch，所以直接用this.touch创建。
      this.touch={};
      this.probeType=3;
      this.listenScroll = true;
      // 歌手列表的高度，存储每个分组距离最顶端的距离
      this.listenHeight = [];
    },
    methods:{
      selectItem(item){
        // 派发事件，向父组件通信
        this.$emit('select',item);
      },
      onShortcutTouchStart(e){
        // 得到我们点击的是元素的下标索引
        var index=getData(e.target,'index');
        // 获取第一个按下去的手指
        var fistTouch=e.touches[0];
        // 获取按下去的y值
        this.touch.y1=fistTouch.pageY;
        // 记录按下去的是第几个锚点
        this.touch.index=index;
        // 滚动到指定元素
        this._scrollTo(index)
      },
      // 在右侧导航栏滑动时，是歌手列表也能滑动
      onShortcutTouchMove(e){
        var fistTouch=e.touches[0];
        this.touch.y2=fistTouch.pageY;
        // 移动后相差几个锚点数量
        var delta=(this.touch.y2-this.touch.y1) / HEIGHT | 0;
        // 得到当前移动到第几个锚点
        var index=parseInt(this.touch.index)+delta;
        this._scrollTo(index);
      },
      _scrollTo(index){
        // 由于点击事件是注册在父容器上，所以当我们点击的地方不是A-Z时，index是null
        if(index==null){
          return;
        }
        // 滚动时，由于是通过滚动的距离除每个DOM的高度算出index，但是超出右侧导航时会令index小于0或者大于导航的个数
        if(index<0){
          index=0
        }else if(index>this.listenHeight.length-2){
          index=this.listenHeight.length-2
        }
        // 由于点击时没有触发scrollY的变化，所以我们要手动设置
        this.scrollY=-this.listenHeight[index];
        // 滚动到指定的元素
        this.$refs.scrollContent.scrollToElement(this.$refs.scrollItem[index],0)
      },
      // 处理scroll子组件派发过来的事件
      scroll(p){
        this.scrollY=p.y;
      },
      // 计算高度
      _calculateHeight(){
        var height=0;
        // 一开始高度为0
        this.listenHeight.push(height);
        for (var i=0;i<this.$refs.scrollItem.length;i++){
          // 获取DOM的高度
          var h=this.$refs.scrollItem[i].clientHeight;
          height+=h;
          this.listenHeight.push(height);
        }
      },
      refresh(){
        this.$refs.scrollContent.refresh();
      }
    },
    computed:{
      shoreCutList(){
        // 获取title的第一个字
        return this.data.map((group)=>{
          return group.title.substr(0,1);
        })
      },
      // 固定标题
      showTitle(){
        // 当在顶端是返回空字符
        if(this.scrollY>0){
          return '';
        }
        return this.data[this.currentIndex]?this.data[this.currentIndex].title:'';
      }
    },
    watch:{
      data(){
        // data发生变化时重新计算每个分组距离最顶端的距离
        setTimeout(()=>{
          this._calculateHeight()
        },20)
      },
      // scrollY发生变化时，即发生滚动
      scrollY(newY){
        // 当滚动到顶部时，newY大于0
        if(newY>0){
          this.currentIndex=0;
          return;
        }
        // 在中间滚动时，this.listenHeight.length-1是因为listHeight比右边快速列表多一。
        for (var i=0;i<this.listenHeight.length-1;i++){
          // 上限，分组的顶端,相当于上一个分组的下限
          var h1=this.listenHeight[i];
          // 下限，分组的下端，相当于下一个分组的上限
          var h2=this.listenHeight[i+1];
          // !h2说明不是最后一个分组，即不是z，-newY因为滚动时为负值，这里要用正数比较
          if(-newY>=h1 && -newY<h2){
            this.currentIndex=i;
            // 相当于减newY，因为newY是负值
            this.diff=h2+newY;
            return;
          }
          // 当滚动到底部时，切-newY大于最后一个元素上限
          this.currentIndex=this.listenHeight.length-2;
        }
      },
      diff(newval){
        // 标题要往上滚动的距离
        var fixedTop=(newval >0 && newval <TITLE_HEIGHT)?newval-TITLE_HEIGHT:0;
        // 这里不能用fixedTop==0判断，因为为0后返回，translate3d(0,${fixedTop}px,0)中的fixedTop一直都是0之前的值，不能归0返回原位，这里只有fixedTop和this.fixedTop都为0时才能相等，这里是为了节流
        if(fixedTop==this.fixedTop){
          return
        }
        this.fixedTop=fixedTop;
        this.$refs.fixed.style.transform=`translate3d(0,${fixedTop}px,0)`;
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: -2px
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>

