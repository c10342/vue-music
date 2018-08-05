<template>
  <scroll ref="scroll"
          :data="result"
          class="suggest"
          :pullUp="pullup"
          @scrollToEnd="searchMore"
          :beforeScroll="beforeScroll"
          @beforeScroll="listBeforeScroll"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
  import {search} from "../../api/search";
  import {ERR_OK} from "../../api/config";
  import {createSong} from "../../common/js/song";
  import Scroll from '../../base/scroll/scroll.vue'
  import Loading from '../../base/loading/loading.vue'
  import Singer from '../../common/js/singer.js'
  import {mapMutations,mapActions} from 'vuex'
  import NoResult from '../../base/no-result/no-result.vue'

  const TYPE_SINGER='TYPE_SINGER';
  // 搜索多少条信息
  const perpage=20;

  export default {
    name: "suggest",
    components:{
      Scroll,
      Loading,
      NoResult
    },
    props:{
      // 是否搜索包含关键字的歌手
      showSinger:{
        type:Boolean,
        default:true
      },
      // 搜索关键字
      query:{
        type:String,
        default:''
      }
    },
    data(){
      return {
        // 请求的数据的页数
        page: 1,
        // 上拉刷新
        pullup:true,
        // 请求回来的数据
        result: [],
        // 是否有更多数据
      hasMore:true,
        // 是否监听滚动开始前事件
        beforeScroll:true
      };
    },
    methods:{
      // 第一次查找
      search(){
        if(this.query==''){
          return;
        }
        // 下拉刷新后会更改下面的数据，会导致在输入框第二次输入搜索内容时出现问题，这里要重置
        this.page=1;
        this.hasMore=true;
        this.$refs.scroll.scrollTo(0,0)
        search(this.query,this.page,this.showSinger,perpage).then(res=>{
          if(ERR_OK==res.code){
            this.result=this._genResult(res.data);
            // 检查是否还有更多数据
            this._checkMore(res.data);
          }
        })
      },
      // 上拉刷新查找
      searchMore(){
        if(!this.hasMore){
          return;
        }
        this.page++;
        search(this.query,this.page,this.showSinger,perpage).then(res=>{
          if(ERR_OK==res.code){
            // 把请求回来的数据拼接到原来的数据中
            this.result=this.result.concat(this._genResult(res.data));
            this._checkMore(res.data);
          }
        })
      },
      // 检查是否还有更多数据
      _checkMore(data){
        const song=data.song;
        if(!song.list.length || (song.curpage * perpage) >= song.totalnum){
          this.hasMore=false;
        }
      },
      // 处理请求数据
      _genResult(data){
        var ret=[];
        // 判断是否包含歌手
        if(data.zhida && data.zhida.singerid){
          // 这里添加一个{type:TYPE_SINGER}是为了方便后面判断搜索回来的是歌手还是歌曲,...{type:TYPE_SINGER}是吧原来的{type:xxx}展开并替换成{type:TYPE_SINGER}
          ret.push({...data.zhida,...{type:TYPE_SINGER}})
        }
        // 判断是否歌曲
        if(data.song){
          ret=ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      },
      // 返回歌手或者歌曲的类样式
      getIconCls(item){
        if (item.type == TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      // 返回要展示的内容
      getDisplayName(item){
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      selectItem(item){
        if(item.type==TYPE_SINGER){
          var singer=new Singer(item.singermid, item.singername);
          this.$router.push({
            path:`/search/${singer.id}`
          });
          this.setSinger(singer);
        }else{
          this.insertSong(item)
        }
        // 派发事件，用于保存搜索历史
        this.$emit('select')
      },
      _normalizeSongs(list){
        var ret=[];
        list.forEach(musicData=>{
          if(musicData.songid && musicData.albummid){
            ret.push(createSong(musicData))
          }
        })
        return ret;
      },
      // 处理子组件派发出来的事件
      listBeforeScroll(){
        this.$emit('listBeforeScroll');
      },
      refresh(){
        this.$refs.scroll.refresh();
      },
      ...mapMutations({
        setSinger:'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch:{
      query(){
        this.search()
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
