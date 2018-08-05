<template>
  <transition name="slide">
  <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script>
  import {mapGetters} from 'vuex';
  import {getSingerDetail} from "../../api/singer.js";
  import {ERR_OK} from "../../api/config.js";
  import {createSong} from "../../common/js/song.js";
  import MusicList from '../music-list/music-list.vue'

  export default {
    name: "singer-detail",
    data(){
      return {
        // 歌曲列表
        songs:[]
      }
    },
    created(){
      this._getSingerDetail()
    },
    methods:{
      _getSingerDetail(){
        //刷新歌手详情页面时没有从vuex中获取到id，返回歌手页面
        if(!this.singer.id){
          this.$router.push({
            path:'/singer'
          })
        }
        getSingerDetail(this.singer.id).then((res)=>{
          if(res.code==ERR_OK){
            this.songs=this._normalizeSongs(res.data.list);
          }
        })
      },
      // 处理数据，把数据变成我们需要的
      _normalizeSongs(list){
        var ret=[];
        list.forEach((item)=>{
          var {musicData}=item
          if (musicData.songid && musicData.albumid){
            ret.push(createSong(musicData));
          }
        });
        return ret;
      }
    },
    computed: {
      title(){
        return this.singer.name;
      },
      bgImage(){
        return this.singer.avatar;
      },
      // 导出获取仓库state的方法,名称（字符串）要与与getters中的函数名一致，必须在computed中导出，即可在组件内使用，this.singer,不用该方法导出相当于return this.$store.getters.singer或者this.$store.state.singer;
      ...mapGetters([
        'singer'
      ])
    },
    components:{
      MusicList
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
