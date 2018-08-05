<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChanged"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <scroll :refreshDelay="refreshDelay" ref="scroll" class="shortcut" :data="shortcut">
          <div>
            <div class="hot-key">
              <h1 class="title">热门搜索</h1>
              <ul>
                <li @click="selectItem(item.k)" class="item" v-for="item in hotKey">
                  <span>{{item.k}}</span>
                </li>
              </ul>
            </div>
            <div class="search-history" v-show="searchHistory.length">
              <h1 class="title">
                <span class="text">搜索历史</span>
                <span class="clear"  @click="deleteAll">
                <i class="icon-clear"></i>
              </span>
              </h1>
              <search-list
                @deleteOne="deleteOneSearch"
                :searches="searchHistory"
                @select="selectItem"
              ></search-list>
            </div>
          </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest
        @select="savesearchHistory"
        :query="query"
        @listBeforeScroll="listBeforeScroll"
        ref="suggest"
      ></suggest>
    </div>
    <confirm
      text="是否清空所有搜索历史"
      ref="confirm"
      @confirm="clearSearchHistory"
      right-btn-text="清空"
    ></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
  import SearchBox from '../../base/search-box/search-box.vue'
  import {getHotKey} from "../../api/search";
  import {ERR_OK} from "../../api/config";
  import Suggest from '../suggest/suggest.vue';
  import SearchList from '../../base/search-list/search-list.vue';
  import Confirm from '../../base/confirm/confirm.vue';
  import Scroll from '../../base/scroll/scroll.vue'
  import {playlistMixin,searchMixin} from "../../common/js/mixin";

  export default {
    name: "search",
    mixins:[playlistMixin,searchMixin],
    components:{
      SearchBox,
      Suggest,
      SearchList,
      Confirm,
      Scroll
    },
    created(){
      this._getHotKey();
    },
    data(){
      return{
        // 热门搜索
        hotKey:[],
      }
    },
    methods:{
      // 获取热门搜索
      _getHotKey(){
        getHotKey().then(res=>{
          if(res.code==ERR_OK){
            // 获取前10条热门搜索
            this.hotKey=res.data.hotkey.slice(0,10);
          }
        })
      },
      // 当播放列表有歌曲时，即有迷你播放器
      handlePlaylist(list){
        var bottom=list.length>0?'60px':'';
        this.$refs.shortcutWrapper.style.bottom=bottom;
        this.$refs.searchResult.style.bottom=bottom;
        this.$refs.scroll.refresh();
        this.$refs.suggest.refresh();

      },
    },
    computed:{
      // 由于scroll组件下的hotKey和searchHistory都是异步请求回来的，所以我们这里要监听这2个数据才能让scroll重新计算高度
      shortcut(){
        return this.hotKey.concat(this.searchHistory);
      }
    },
    watch:{
      query(newquery){
        // 当输入框内容为空时，即搜索列表消失
        if (!newquery){
          setTimeout(()=>{
            this.$refs.scroll.refresh();
          },20)
        }
      }
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
