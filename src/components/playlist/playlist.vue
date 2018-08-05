<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hiden">
      <!--这里用@click.top，是防止点击子元素后会往上冒泡，触发父元素点击事件-->
      <div class="list-wrapper" @click.top>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconPlayMode" @click.stop="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click.stop="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <scroll ref="scroll" :data="sequenceList" class="list-content">
          <!--tag="ul"是把transition-group渲染成ul标签-->
          <transition-group ref="list" name="list" tag="ul">
            <!--添加transition-group后必须为每一个li添加一个key进行唯一标识-->
            <li :key="index" ref="listItem" class="item" v-for="(item,index) in sequenceList" @click.stop="selectItem(item,index)">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like">
                <i class="icon-not-favorite"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click.stop="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click.top="hiden">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" @confirm="deleteAll" text="是否清空播放列表" right-btn-text="清空"></confirm>
      <add-song ref="addsong" @refresh="refresh"></add-song>
    </div>
  </transition>
</template>

<script>
  import {mapGetters,mapMutations,mapActions} from 'vuex';
  import {playMode} from "../../common/js/config";
  import Confirm from '../../base/confirm/confirm.vue'
  import Scroll from '../../base/scroll/scroll.vue';
  import {playerMixin} from "../../common/js/mixin";
  import AddSong from '../add-song/add-song.vue'

  export default {
    name: "playlist",
    mixins:[playerMixin],
    components:{
      Scroll,
      Confirm,
      AddSong
    },
    data(){
      return {
        showFlag:false
      }
    },
    methods:{
      // 显示播放列表
      show(){
        this.showFlag=true;
        // 显示歌曲列表后让better-scroll重新计算高度
        setTimeout(()=>{
          this.$refs.scroll.refresh();
          this.scrollToCurrentSong(this.currentSong);
        },20)
      },
      // 隐藏播放列表
      hiden(){
        this.showFlag=false;
      },
      // 返回当前正在播放歌曲样式类
      getCurrentIcon(item){
        if(item.id==this.currentSong.id){
          return 'icon-play';
        }
        return '';
      },
      // 把当前歌曲变为点击的歌曲
      selectItem(item,index){
        if(this.mode==playMode.random){
          // 这里用playList而不用sequenceList是因为歌曲播放列表显示是顺序列表，而现在是随机播放，playList和sequenceList的当前播放歌曲index不一样
          index=this.playList.findIndex((song)=>{
            return song.id==item.id;
          })
        }
        this.setCurrentIndex(index);
        this.setPlaying(true);
      },
      // 让当前播放的歌曲滚动到第一的位置
      scrollToCurrentSong(currentSong){
        // 这里用sequenceList而不用playList是因为歌曲播放列表显示的使顺序播放的列表
        var index=this.sequenceList.findIndex((song)=>{
          return song.id==currentSong.id;
        });
        this.$refs.scroll.scrollToElement(this.$refs.listItem[index],300)
      },
      // 删除一首歌
      deleteOne(item){
        this.deleteOneSong(item);
        // 当删掉所有歌曲时，隐藏歌曲列表
        if(!this.playList.length){
          this.hiden();
        }
      },
      // 删除所有歌曲
      deleteAll(){
        this.deleteAllSong();
        this.hiden();
      },
      // 显示对话框
      showConfirm(){
        this.$refs.confirm.show();
      },
      addSong(){
        this.$refs.addsong.show();
      },
      refresh(){
        this.$refs.scroll.refresh();
        this.scrollToCurrentSong(this.currentSong)
      },
      ...mapMutations({
        setCurrentIndex:'SET_CURRENTINDEX',
        setPlaying:'SET_PLAYING'
      }),
      ...mapActions([
        'deleteOneSong',
        'deleteAllSong'
      ])
    },
    watch:{
      currentSong(newSong,oldSong){
        // 歌曲播放列表没有显示，或者歌曲没有变化
        if(!this.showFlag || newSong.id==oldSong){
          return;
        }
        setTimeout(()=>{
          this.scrollToCurrentSong(newSong);
        },20);
      }
    },
    computed:{
      modeText(){
        return this.mode==playMode.sequence?'顺序播放':this.mode==playMode.random?'随机播放':'单曲循环';
      },
      ...mapGetters([
        'sequenceList',
        'currentSong',
        'mode',
        'playList'
      ])
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
