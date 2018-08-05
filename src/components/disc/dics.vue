<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songList"></music-list>
  </transition>
</template>

<script>
  import MusicList from '../music-list/music-list.vue';
  import {mapGetters} from 'vuex';
  import {getSongList} from "../../api/recommend";
  import {ERR_OK} from "../../api/config";
  import {createSong} from "../../common/js/song";

  export default {
    name: "dics",
    components: {
      MusicList
    },
    data() {
      return {
        songList: []
      }
    },
    computed: {
      title() {
        return this.disc.dissname
      },
      bgImage() {
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    },
    created() {
      this._getSongList();
    },
    methods: {
      _getSongList() {
        if(!this.disc.dissid){
          this.$router.push({
            path:'/recommend'
          });
          return;
        }
        getSongList(this.disc.dissid).then((res) => {
          if (res.code == ERR_OK) {
            this.songList=this._normalizeSongs(res.cdlist[0].songlist)
          }
        })
      },
      // 这里跟歌手详情页一样
      _normalizeSongs(list){
        var arr=[];
        list.forEach(musicData=>{
          if(musicData.songid && musicData.albummid){
            arr.push(createSong(musicData))
          }
        })
        return arr;
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
