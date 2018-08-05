<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <!--slot是vue的一个组件,是插槽，即该组件slider被外部引用后，slider中间的dom就会被插入到slot中-->
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item,index) in dots" :class="{active:currentPage==index}"></span>
    </div>
  </div>
</template>

<script>
  import {addClass} from "../../common/js/dom";
  import BScroll from 'better-scroll';

  export default {
    name: "slider",
    data(){
      return {
        dots:[],
        currentPage:0
      }
    },
    // 控制轮播图的一些参数
    props: {
      // 是否循环播放
      loop: {
        //类型
        type: Boolean,
        //默认值
        default: true
      },
      //是否自动播放
      autoPlay: {
        type: Boolean,
        default: true
      },
      click:{
        type:Boolean,
        default:true
      },
      //自动播放间隔
      interval: {
        type: Number,
        default: 4000
      }
    },
    mounted(){
      setTimeout(()=>{
        //初始化轮播图容器宽度
        this._setSliderWidth();
        //初始化轮播图下面的点
        this._initDots();
        // 开启轮播图
        this._initSlider();
        // 自动播放
        if(this.autoPlay){
          this._autoPlay();
        }
      },20);
      window.addEventListener('resize',()=>{
        // 屏幕发生改变是重新计算设置页面内容的总宽度
        this._setSliderWidth();
        // 重新刷新轮播图
        this.slider.refresh();
      });
      this.bindEvent();
    },
    methods:{
      _setSliderWidth(){
        //better-scroll横向滚动时需要有宽度才能滚动
        //this.children设置对象属性，注意与set对比
        this.children=this.$refs.sliderGroup.children;
        var width=0;
        // 获取轮播图容器宽度，即屏幕宽度
        var sliderWidth=this.$refs.slider.clientWidth;
        for (var i=0;i<this.children.length;i++){
          let child=this.children[i];
          // 为每一张图片添加类
          addClass(child,'slider-item');
          // 设置图片宽度
          child.style.width=sliderWidth+'px';
          // 总宽度
          width+=sliderWidth;
        }
        if(this.loop){
          // 无缝播放后会在前后个添加2张图片
          width+=2*sliderWidth;
        }

        // 设置页面内容的总宽度，使图片横向摆放
        this.$refs.sliderGroup.style.width=width+'px';
      },
      _initSlider(){
        //DOM要生成了才能初始化better-scroll，否则会报错,
        if(!this.$refs.slider){
          return;
        }
        this.slider=new BScroll(this.$refs.slider,{
          // 允许横向滚动
          scrollX:true,
          // 禁止纵向滚动
          scrollY:false,
          // 当快速滑动时是否开启滑动惯性
          momentum: false,
          // 该属性是给 slider 组件使用的，普通的列表滚动不需要配置
          snap: true,
          // 是否可以无缝循环轮播
          snapLoop: this.loop,
          // 用手指滑动时页面可切换的阈值，大于这个阈值可以滑动的下一页
          snapThreshold: 0.3,
          // 轮播图切换的动画时间
          snapSpeed: 400,
          click:this.click
        })
        // 滚动结束后,设置轮播点
        this.slider.on('scrollEnd',()=>{
          // 获取当前是第几张
          var pageIndex=this.slider.getCurrentPage().pageX;
          if(this.loop){
            // 无缝滚动从第二张开始(索引是1)，
            pageIndex-=1;
          }

          this.currentPage=pageIndex;
        })
      },
      _initDots(){
        this.dots=new Array(this.children.length);
      },
      _autoPlay(){
        this.timer=setInterval(()=>{
          // 获取下一张要播放的索引
          let pageIndex=this.slider.getCurrentPage().pageX+1;

          // 滚动到指定页面
          this.slider.goToPage(pageIndex,0,400);
        },this.interval);
      },
      bindEvent(){
        this.$refs.slider.addEventListener('touchstart',()=>{
          clearInterval(this.timer);
        });
        this.$refs.slider.addEventListener('touchend',()=>{
          this._autoPlay();
        });
      }
    },
    destroyed(){
      clearInterval(this.timer);
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
