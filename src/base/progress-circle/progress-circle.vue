<template>
  <div class="progress-circle">
    <!--svg是网上的组件width和height分别设置他的宽和高，viewBox定义他的视图大小-->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!--迷你播放器暂停播放内层的圆-->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!--迷你播放器暂停播放外层的圆，r是圆半径，cx和cy是他的圆点坐标，stroke-dasharray是描边的距离，这里我们描边的距离是整个圆，stroke-dashoffset是描边的偏移，这里是指我们的圆形进度条，stroke-dashoffset为0是表示整个圆都描满，即歌曲播放完毕，stroke-dashoffset与stroke-dasharray的值相等，描边完全偏离出去，即歌曲刚开始播放-->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: "progress-circle",
    props:{
      // 圆的直径
      radius:{
        type:Number,
        default:100
      },
      // 圆形进度条
      percent:{
        type:Number,
        default:0
      }
    },
    data(){
      return{
        dashArray:Math.PI*100
      }
    },
    computed:{
      // 描边偏移量
      dashOffset(){
      return (1-this.percent)*this.dashArray;
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
