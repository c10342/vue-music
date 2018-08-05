<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchstart"
           @touchmove.prevent="progressTouchmove"
           @touchend="progressTouchend"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import {prefixstyle} from "../../common/js/dom";

  const transform=prefixstyle('transform')
  const progressBtnWidth = 16
  export default {
    name: "process-bar",
    props:{
      // 黄色的进度条占整条进度的百分比
      percent:{
        type:Number,
        default:0
      }
    },
    created(){
      // 用于touchstart，touchmove，touchend之间数据共享
      this.touch={}
    },
    methods:{
      progressTouchstart(e){
        // 初始化触摸事件，表示正在滑动
        this.touch.initiated=true;
        // 记录点下去的x位置
        this.touch.startX=e.touches[0].pageX;
        // 黄色进度条的位置
        this.touch.left=this.$refs.progress.clientWidth;
      },
      progressTouchmove(e){
        if(!this.touch.initiated){
          return
        }
        // 移动时手指的x位置与手指刚点下去x位置的差值
        var deltaX=e.touches[0].pageX-this.touch.startX;
        // 偏移量不能大于灰色进度条的宽度也不能小于0
        var offsetX = Math.min(Math.max(0,this.touch.left+deltaX),this.$refs.progressBar.clientWidth-progressBtnWidth);
        this._offset(offsetX);
      },
      progressTouchend(){
        // 手指抬起时表示滑动结束
        this.touch.initiated=false;
        this._triggerPercent();
      },
      progressClick(e){
        // getBoundingClientRect()这个方法返回一个矩形对象，包含四个属性：left、top、right和bottom。分别表示元素各边与页面上边和左边的距离。
        var react=this.$refs.progressBar.getBoundingClientRect()
        // e.pageX点击的位置与网页边缘的距离
        var offsetWidth=e.pageX-react.left;
        this._offset(offsetWidth);
        // this._offset(e.offsetX); 当我们点击progressBtn时，e.offsetX会出现问题
        this._triggerPercent();
      },
      // 向父组件派发事件
      _triggerPercent(){
        // 黄色进度条可移动的最大范围
        var barWith=this.$refs.progressBar.clientWidth-progressBtnWidth;
        // 黄色进度条占灰色进度条的百分比
        var percent=this.$refs.progress.clientWidth/barWith;
        this.$emit('percentChange',percent);
      },
      _offset(offsetX){
        // 改变黄色进度条宽度
        this.$refs.progress.style.width=`${offsetX}px`;
        // 改变圆点的位置
        this.$refs.progressBtn.style[transform]=`translate3d(${offsetX}px,0,0)`
      }
    },
    watch:{
      percent(newpercent){
        if(newpercent>=0 && !this.touch.initiated){
          // 黄色进度条可移动的最大范围
          var barWith=this.$refs.progressBar.clientWidth-progressBtnWidth;
          // 移动的距离
          var offsetX=barWith*newpercent;
          if(offsetX>=barWith){
            offsetX=barWith;
          }
          this._offset(offsetX)
        }
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
