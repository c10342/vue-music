<template>
    <div ref="wraper">
      <slot></slot>
    </div>
</template>

<script>
  import BScroll from 'better-scroll'
    export default {
        name: "scroll",
      props:{
        // 1 滚动的时候会派发scroll事件，会截流。2滚动的时候实时派发scroll事件，不会截流。 3除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
        probeType:{
          type:Number,
          default:1
        },
        // 是否派发点击事件
        click:{
          type:Boolean,
          default:true,
        },
        // 父组件传递过来的数据
        data:{
          type:Array,
          default:null
        },
        // 是否监听滚动
        listenScroll:{
          type:Boolean,
          default:false
        },
        // 是否上拉刷新
        pullUp:{
          type:Boolean,
          default:false
        },
        // 是否监听滚动前的事件
        beforeScroll:{
          type:Boolean,
          default:false
        },
        // 设置重新刷新时间，因为有些组件会有动画需要时间
        refreshDelay:{
          type:Number,
          default:20
        }
      },
      mounted(){
          setTimeout(()=>{
            this._initScroll()
          },20)
      },
      methods:{
        _initScroll(){
          //DOM要生成了才能初始化better-scroll，否则会报错,
          if(!this.$refs.wraper){
            return;
          }
          this.scroll=new BScroll(this.$refs.wraper,{
            probeType:this.probeType,
            click:this.click
          })
          if(this.listenScroll){
            var that=this;
            // 监听滚动事件
            this.scroll.on('scroll', (pros) => {
              // 派发一个名为scroll的事件，即向父组件派发事件，向父组件通信
              that.$emit('scroll', pros);
            });
          }
          if(this.pullUp){ //是否上拉刷新
            // 监听是否滚动结束
            this.scroll.on('scrollEnd', () => {
              // 判断滚动的距离是否小于最大滚动距离加上50差值，负值
              if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
                // 滚动到底部就派发事件
                this.$emit('scrollToEnd')
              }
            });
          }
          if(this.beforeScroll){
            // 监听滚动开始前事件
            this.scroll.on('beforeScrollStart',()=>{
              this.$emit('beforeScroll')
            })
          }
        },
        // 启用 better-scroll，默认开启
        enable(){
          // 短路写法this.scroll存在就执行后面的
          this.scroll && this.scroll.enable();
        },
        // 禁用 better-scroll
        disable(){
          this.scroll && this.scroll.disable();
        },
        // 强制 scroll 重新计算
        refresh(){
          this.scroll && this.scroll.refresh();
        },
        // 滚动到某个位置，x,y 代表坐标，time 表示动画时间，easing 表示缓动函数
        //相当于scrollTo(arguments){
        // this.scroll && this.scroll.scrollTo(arguments)
    // }
        scrollTo(){
          this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments)
        },
        // 滚动到某个元素，el（必填）表示 dom 元素，time 表示动画时间，offsetX 和 offsetY 表示坐标偏移量，easing 表示缓动函数，这里apply第一个参数是上下文，为了保证调用方法的this和better-scroll一致，所以传入this.scroll,arguments是传递过来的所有参数
        scrollToElement(){
          this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments)
        }
      },
      watch:{
          // 监听data数据，数据名与函数名要相同,data发生变化时重新计算高度,延迟进行是因为要等DOM渲染完毕
          data(){
            setTimeout(()=>{
              this.refresh();
            },this.refreshDelay)
          }
      }
    }
</script>

<style scoped>

</style>
