import * as types from './mutations-type.js';
// 修改state

const mutations={
  // 函数的一种写法,第一个参数是仓库state，第二个参数是我们传递进来的值
  [types.SET_SINGER](state,singer){
    state.singer=singer;
  },
  [types.SET_PLAYING](state,flag){
    state.playing=flag;
  },
  [types.SET_FULLSCREEN](state,flag){
    state.fullScreen=flag;
  },
  [types.SET_PLAYLIST](state,playlist){
    state.playList=playlist;
  },
  [types.SET_SEQUENCELIST](state,sequencelist){
    state.sequenceList=sequencelist;
  },
  [types.SET_MODE](state,mode){
    state.mode=mode;
  },
  [types.SET_CURRENTINDEX](state,currentindex){
    state.currentIndex=currentindex;
  },
  [types.SET_DISC](state,disc){
    state.disc=disc;
  },
  [types.SET_TOPLIST](state,toplist){
    state.topList=toplist;
  },
  [types.SET_SEARCHHISTORY](state,searchHistory){
    state.searchHistory=searchHistory;
  },
  [types.SET_PLAYHISTORY](state,playhsitory){
    state.playHistory=playhsitory;
  },
  [types.SET_FAVORITESONGLIST](state,songList){
    state.favoriteSongList=songList;
  }
}
export default mutations;
