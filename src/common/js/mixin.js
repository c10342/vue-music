// 混入 (mixins) 是一种分发 Vue 组件中可复用功能的非常灵活的方式。混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被混入该组件本身的选项。
// 当组件和混入对象含有同名选项时，这些选项将以恰当的方式混合。
// 比如，数据对象在内部会进行浅合并 (一层属性深度)，在和组件的数据发生冲突时以组件数据优先。
// 同名钩子函数将混合为一个数组，因此都将被调用。另外，混入对象的钩子将在组件自身钩子之前调用。
// 这里就跟写组件一样


import {mapGetters,mapMutations,mapActions} from 'vuex';
import {playMode} from "./config";
import {shuffle} from "./util";


// 当有迷你播放器时，需要实现handlePlaylist让底部自适应，不被迷你播放器遮挡
export const playlistMixin ={
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playList)
  },
  // 组件激活的时候
  activated() {
    this.handlePlaylist(this.playList)
  },
  watch: {
    playList(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
      // 这里定义用户必须在具体组件内实现该方法，不然会报错
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin={
  computed:{
    // 返回播放模式的类，以便修改图标
    iconPlayMode(){
      return this.mode==playMode.sequence?'icon-sequence':this.mode==playMode.loop?'icon-loop':'icon-random'
    },
    ...mapGetters([
      'mode',
      'sequenceList',
      'currentSong',
      'favoriteSongList'
    ])
  },
  methods:{
    // 改变播放模式
    changeMode(){
      var playmode=(this.mode+1)%3;
      this.setPlayMode(playmode);
      var list=null;
      if(this.mode==playMode.random){
        list=shuffle(this.sequenceList)
      }else{
        list=this.sequenceList;
      }
      this.resetCurrentIndex(list);
      this.setPlayList(list)
    },
    // 重置当前播放歌曲在新的播放列表中的索引
    resetCurrentIndex(list){
      // findIndex是es6语法
      var index=list.findIndex((item)=>{
        return this.currentSong.id==item.id;
      });
      this.setCurrentIndex(index);
    },
    // 返回是否我喜欢的样式类
    getFavoriteIcon(song){
      return this.isFavorite(song)?'icon-favorite':'icon-not-favorite';
    },
    // 切换是否我喜欢的
    toggleFavorite(song){
      if(this.isFavorite(song)){
        this.deleteFavoriteSongList(song)
      }else {
        this.saveFavoriteSongList(song)
      }
    },
    // 判断是否我喜欢的
    isFavorite(song){
      var index=this.favoriteSongList.findIndex((item)=>{
        return item.id==song.id;
      });
      return index>-1;
    },
    ...mapMutations({
      setCurrentIndex:'SET_CURRENTINDEX',
      setPlayMode:'SET_MODE',
      setPlayList:'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveFavoriteSongList',
      'deleteFavoriteSongList'
    ])
  },
}


export const searchMixin={
  data(){
    return{
      // 搜索的关键字
      query:'',
      // scroll组件检测到数据变化延迟重新计算高度的时间
      refreshDelay:100
    }
  },
  methods:{
    selectItem(k){
      // 设置搜索框里面的值
      this.$refs.searchBox.setQuery(k);
    },
    // 接收子组件传递过来的数据
    onQueryChanged(query){
      this.query=query;
    },
    // 处理子组件派发出来的事件
    listBeforeScroll(){
      this.$refs.searchBox.blur();
    },
    // 保存搜索记录
    savesearchHistory(){
      this.saveSearchHistory(this.query);
    },
    // 点击下放热门搜索右边按钮
    deleteAll(){
      this.$refs.confirm.show();
    },
    // 删除所有搜索记录，可以直接简写成<confirm @confirm="deleteAllSearch"></confirm>
    clearSearchHistory(){
      this.deleteAllSearch();
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteAllSearch',
      'deleteOneSearch'
    ])
  },
  computed:{
    ...mapGetters([
      'searchHistory'
    ]),
  }
}
