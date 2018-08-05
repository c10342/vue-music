<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script>
  import MusicList from '../music-list/music-list.vue';
  import {mapGetters} from 'vuex';
  import {getMusicList} from "../../api/rank";
  import {ERR_OK} from "../../api/config";
  import {createSong} from "../../common/js/song";

  export default {
    name: "top-list",
    components:{
      MusicList
    },
    computed:{
      title(){
        return this.topList.topTitle;
      },
      bgImage(){
        if(this.songs.length){
          return this.songs[0].image;
        }
        return ''
      },
      ...mapGetters([
        'topList'
      ])
    },
    created(){
      this._getMusicList()
    },
    data(){
      return {
        songs:[],
        rank:true
      }
    },
    methods:{
      _getMusicList(){
        if(!this.topList.id){
          this.$router.push({
            path:'/rank'
          })
        }
        getMusicList(this.topList.id).then(res=>{
          if(res.code==ERR_OK){
            this.songs=this._normalizeSongs(res.songlist);
          }
        })
      },
      _normalizeSongs(list){
        var arr=[];
        list.forEach(item=>{
          var musicData=item.data;
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
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
