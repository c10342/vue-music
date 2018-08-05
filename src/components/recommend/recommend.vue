<template>
  <div class="recommend" ref="recommend">
    <Scroll ref="scroll" class="recommend-content" :data="disclist">
      <!--由于better-scroll只对第一个子节点进行滚动，所以要套上一个div-->
      <div>
      <div class="slider-wrapper" v-if="recommens.length">
        <Slider>
          <div v-for="item in recommens">
            <a :href="item.linkUrl">
              <!--由于fastclick和better-scroll（click属性）会发生冲突，导致点击后不能跳转，所以我们需要在img的class中添加needsclick，这样当我们点击图片时，点击事件就不会被拦截-->
              <img class="needsclick" @load="loadImage" :src="item.picUrl">
            </a>
          </div>
        </Slider>
      </div>
      <div class="recommend-list">
        <h1 class="list-title">
          热门歌单推荐
        </h1>
        <ul>
          <li class="item" v-for="item in disclist" @click="selectItem(item)">
            <div class="icon">
              <img v-lazy="item.imgurl" alt="" width="60" height="60">
            </div>
            <div class="text">
              <!--item.creator.name和item.dissname可能会含有一些需要转义的字符，所以用v-html，他会帮我们转义-->
              <h2 class="name" v-html="item.creator.name"></h2>
              <p class="desc" v-html="item.dissname"></p>
            </div>
          </li>
        </ul>
      </div>
      </div>
      <div class="loading-container" v-show="!disclist.length">
        <loading></loading>
      </div>
    </Scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getRecommend,getDiscList} from "../../api/recommend.js";
  import {ERR_OK} from '../../api/config.js';
  import Slider from '../../base/slider/slider.vue';
  import Scroll from '../../base/scroll/scroll.vue';
  import Loading from '../../base/loading/loading.vue'
  import {playlistMixin} from "../../common/js/mixin.js";
  import {mapMutations} from 'vuex'

  export default {
    name: "recommend",
    mixins:[playlistMixin],
    components:{
      Slider,
      Scroll,
      Loading
    },
    data(){
      return {
        // 上方的轮播图
        recommens:[],
        // 下方的歌单列表
        disclist:[]
      }
    },
    created(){
      // 获取上方轮播图数据
      this._getRecommend();
      // 获取下方歌单列表数据
      this._getDiscList();
    },
    methods:{
      _getRecommend(){
        getRecommend().then((res)=>{
          // res.code==0说明获取数据成功
          if (res.code==ERR_OK){
            this.recommens=res.data.slider;
          }
        })
      },
      _getDiscList(){
        getDiscList().then((res)=>{
          if(res.code==ERR_OK){
            this.disclist=res.data.list;
          }
        })
      },
      loadImage(){
        //节流，当有一张图片加载完成后，即轮播图的高度被撑开后，就不需要强制better-scroll重新计算高度
        if(!this.checkLoad){
          // 这里是调用scroll组件里面的refresh方法
          this.$refs.scroll.refresh();
          this.checkLoad=true
        }
      },
      // 实现mixins中的handlePlaylist方法
      handlePlaylist(list){
        if(list.length>0){
          this.$refs.recommend.style.bottom='60px';
          this.$refs.scroll.refresh();
        }
      },
      selectItem(item){
        this.$router.push({
          path:`/recommend/${item.dissid}`
        });
        this.setDisc(item);
      },
      ...mapMutations({
        setDisc:'SET_DISC'
      })
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
