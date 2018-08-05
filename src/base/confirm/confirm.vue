<template>
  <transition name="confirm-fade">
    <!--这里用@click.top，是防止点击子元素后会往上冒泡，触发父元素点击事件-->
    <div class="confirm" v-show="showFlag" @click.stop>
      <div class="confirm-wrapper">
        <div class="confirm-content">
          <p class="text">{{text}}</p>
          <div class="operate">
            <div class="operate-btn left" @click.stop="cancle">{{leftBtnText}}</div>
            <div class="operate-btn" @click.stop="confirm">{{rightBtnText}}</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    data(){
      return{
        showFlag:false
      }
    },
    props:{
      // 文本框内容
      text:{
        type:String,
        default:''
      },
      // 左边按钮内容
      leftBtnText:{
        type:String,
        default:'取消'
      },
      // 右边按钮内容
      rightBtnText:{
        type:String,
        default:'确定'
      }
    },
    methods:{
      // 显示对话框
      show(){
        this.showFlag=true;
      },
      // 隐藏对话框
      hide(){
        this.showFlag=false;
      },
      // 点击左边按钮
      cancle(){
        this.hide();
        this.$emit('cancle');
      },
      // 点击右边按钮
      confirm(){
        this.hide();
        this.$emit('confirm');
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .confirm
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 998
    background-color: $color-background-d
    &.confirm-fade-enter-active
      animation: confirm-fadein 0.3s
      .confirm-content
        animation: confirm-zoom 0.3s
    .confirm-wrapper
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
      z-index: 999
      .confirm-content
        width: 270px
        border-radius: 13px
        background: $color-highlight-background
        .text
          padding: 19px 15px
          line-height: 22px
          text-align: center
          font-size: $font-size-large
          color: $color-text-l
        .operate
          display: flex
          align-items: center
          text-align: center
          font-size: $font-size-large
          .operate-btn
            flex: 1
            line-height: 22px
            padding: 10px 0
            border-top: 1px solid $color-background-d
            color: $color-text-d
            &.left
              border-right: 1px solid $color-background-d

  @keyframes confirm-fadein
    0%
      opacity: 0
    100%
      opacity: 1

  @keyframes confirm-zoom
    0%
      transform: scale(0)
    50%
      transform: scale(1.1)
    100%
      transform: scale(1)
</style>
