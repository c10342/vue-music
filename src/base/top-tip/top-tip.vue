<template>
  <transition name="drop">
    <div class="top-tip" v-show="showFlag" @click.stop="hiden">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
  export default {
    name: "top-tip",
    data(){
      return{
        showFlag:false
      }
    },
    props:{
      delay:{
        type:Number,
        default:2000
      }
    },
    methods:{
      show(){
        this.showFlag=true;
        // 防止多次调用show方法
        clearTimeout(this.timer);
        // 延迟几秒后消失
        this.timer=setTimeout(()=>{
          this.hiden();
        },this.delay)
      },
      hiden(){
        this.showFlag=false;
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .top-tip
    position: fixed
    top: 0
    width: 100%
    z-index: 500
    background: $color-dialog-background
    &.drop-enter-active, &.drop-leave-active
      transition: all 0.3s
    &.drop-enter, &.drop-leave-to
      transform: translate3d(0, -100%, 0)
</style>
