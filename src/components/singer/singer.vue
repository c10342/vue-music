<template>
  <div class="singer" ref="singer">
    <!--接收子组件派发出来的名为select事件，父组件处理函数时goToSingerDetail-->
    <list-view :data="singerlist" @select="goToSingerDetail" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getSingerList} from '../../api/singer.js';
  import {ERR_OK} from "../../api/config";
  import Singer from '../../common/js/singer.js';
  import ListView from '../../base/listview/listview.vue';
  import {mapMutations} from 'vuex'
  import {playlistMixin} from "../../common/js/mixin.js";

  var HOT_NAME='热门';
  // 热门歌手一共有10条
  var HOT_NAME_LENGTH=10;

  export default {
    name: "singer",
    mixins:[playlistMixin],
    components:{
      ListView
    },
    data() {
      return {
        // 歌手列表
        singerlist:[]
      }
    },
    created() {
      this._getSingerList();
    },
    methods: {
      // 导出修改store的行为方法，必须在methods中导出，即可在组件内使用，this.setSinger(xxx),不用该方法导出相当于this.$store.commit('SET_SINGER');
      ...mapMutations({
        setSinger:'SET_SINGER'
      }),
      goToSingerDetail(item){
        this.setSinger(item);
        this.$router.push({
          path:'/singer/'+item.id
        })
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code == ERR_OK) {
            this.singerlist=this._normalizeSinger(res.data.list);
          }
        })
      },
      // 对请求的数据进行处理
      _normalizeSinger(list){
        var map={
          hot:{
            title:HOT_NAME,
            item:[]
          }
        }
        list.forEach((item,index)=>{
          // 获取前10条数据作为热门数据
          if(index<HOT_NAME_LENGTH){
            map.hot.item.push(new Singer(item.Fsinger_mid,item.Fsinger_name))
          }
          // 获取字母
          var key=item.Findex;
          if(!map[key]){
            // 没有这个key就创建一个
            map[key]={
              title:key,
              item:[]
            }
          }
          map[key].item.push(new Singer(item.Fsinger_mid,item.Fsinger_name))
        });
        // 存储热门数据
        var hot=[];
        // 存储a-z数据
        var ret=[];
        for (var key in map){
          // 获取map中的每一个数据
          var val=map[key]
          if(val.title==HOT_NAME){ //标题是热门的
            hot.push(val);
          }else if(val.title.match(/[a-zA-Z]/)){ //标题是字母的
            ret.push(val);
          }
        }
        // 进行排序，a，b分别是相邻的2个数据
        ret.sort((a,b)=>{
          // charCodeAt(0)返回字符串第一个字符的 Unicode 编码:
          return a.title.charCodeAt(0)-b.title.charCodeAt(0)
        })
        // 将2个数组拼接成一个新的数组并返回
        return hot.concat(ret);
      },
      // 实现mixins中的handlePlaylist方法
      handlePlaylist(list){
        if(list.length>0){
          this.$refs.singer.style.bottom='60px';
          this.$refs.list.refresh();
        }
      },
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
