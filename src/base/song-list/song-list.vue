<template>
  <div class="song-list">
    <ul>
      <li v-for="(song,index) in songs"  class="item" @click="selectItem(song,index)">
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)">{{getRankText(index)}}</span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: "song-list",
    props:{
      // 歌曲信息列表
      songs:{
        type:Array,
        default:[]
      },
      // 是否出现星级
      rank:{
        type:Boolean,
        default:false
      }
    },
    methods:{
      // 歌曲描述信息
      getDesc(song){
        return `${song.singer}·${song.album}`;
      },
      // 向父组件派发事件，传递点击的是第几首歌
      selectItem(item,index){
        this.$emit('select',item,index);
      },
      // 返回星级的样式类
      getRankCls(index){
        if(index<=2){
          return `icon icon${index}`
        }else{
          return 'text'
        }
      },
      // 返回星级的内容
      getRankText(index){
        if(index>2){
          return index+1
        }
      }
    },
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>
