// 异步操作或者是要执行多个mutations
import * as types from './mutations-type.js';
import {shuffle} from "../common/js/util";
import {playMode} from "../common/js/config";
import {saveSearch,deleteOne,deleteAll,savePlay,saveFavoriteSong,deleteFavoriteSong} from "../common/js/cache";

// 查找当前列表是否包含这首歌
function findIndex(list,song) {
  var index=list.findIndex((item)=>{
    return item.id==song.id
  })
  return index
}

// {commit,state}是vuex自动传进来的，commit用来调用mutations中的方法的，{list,index}是我们传递过来的参数,这个是点击一首歌曲播放时
export const setPlay=function({commit,state},{list,index}){
  commit(types.SET_SEQUENCELIST,list);
  // 判断是否为随机播放模式
  if(state.mode==playMode.random){
    // 把歌曲列表变成随机列表
    var randomList=shuffle(list)
    // 找到点击的歌曲在随机列表中的索引
    index=findIndex(randomList,list[index])
    // 修改歌曲播放列表
    commit(types.SET_PLAYLIST,randomList);
  }else {
    // 其他模式
    commit(types.SET_PLAYLIST,list);
  }
  commit(types.SET_CURRENTINDEX,index);
  commit(types.SET_PLAYING,true);
  commit(types.SET_FULLSCREEN,true);
}

// 这个是点击随机播放全部
export const randomPlay=function ({commit,state},{list}) {
  commit(types.SET_MODE,playMode.random);
  commit(types.SET_PLAYING,true);
  commit(types.SET_SEQUENCELIST,list)
  commit(types.SET_PLAYLIST,shuffle(list));
  commit(types.SET_FULLSCREEN,true);
  commit(types.SET_CURRENTINDEX,0);
}

// 搜索页面插入歌曲
export const insertSong=function ({commit,state},song) {
  // 这里用slice()返回一个新副本，不用会报错，因为下面的修改会改变playList，，然会影响到state.playList，但是vuex不允许在他的mutations中的函数之外修改它里面的值，这里用slice()，使得playList被修改了但不会影响到state.playList
  var playList=state.playList.slice();
  var sequenceList=state.sequenceList.slice();
  var currentIndex=state.currentIndex;

  // 修改playList
  // 记录当前歌曲
  var currentSong=playList[currentIndex];
  // 查找要插入的歌曲是否已经在播放列表中，必须在插入前进行查找，不然插入后必然存在该歌曲，这句就没意义了
  var fpIndex=findIndex(playList,song);
  // 因为要插入歌曲，所以索引+1
  currentIndex++;
  // 插入歌曲
  playList.splice(currentIndex, 0, song);
  // 如果播放列表已经存在要插入的歌曲
  if(fpIndex>-1){
    // 要插入的歌曲在已经存在歌曲的后面,即要删除前面的歌曲
    if(currentIndex>fpIndex){
      playList.splice(fpIndex,1);
      // 因为删除前面的歌曲，playList长度减1，，后面的歌曲都要前进一位，当前歌曲索引发生变化，所以要减
      currentIndex--
    }else{ //要插入的歌曲在已经存在歌曲的前面，即要删除后面的歌曲
      // 因为已经插入了一首歌，后面的歌曲位置都后退了了一位，所以要加一，这里当前索引不加一是因为当前歌曲索引没有变化
      playList.splice(fpIndex+1,1)
    }
  }

  // 修改sequenceList，跟修改playList差不多一样
  // 在sequenceList中要插入歌曲的索引位置
  var currentfsIndex=findIndex(sequenceList,currentSong)+1;
  // 查找是否要插入的歌曲是否已经存在
  var fsIndex = findIndex(sequenceList, song);
  // 插入歌曲
  sequenceList.splice(currentfsIndex,0,song);
  // 要插入的歌曲已经存在
  if(fsIndex>-1){
    // 要插入的歌曲在已经存在歌曲的后面,即要删除前面的歌曲
    if(currentfsIndex>fsIndex){
      sequenceList.splice(fsIndex,1)
    }else{ //要插入的歌曲在已经存在歌曲的前面，即要删除后面的歌曲
      // 因为已经插入了一首歌，后面的歌曲位置都后退了了一位，所以要加一
      sequenceList.splice(fsIndex+1,1)
    }
  }
  commit(types.SET_PLAYLIST,playList)
  commit(types.SET_SEQUENCELIST,sequenceList);
  commit(types.SET_CURRENTINDEX,currentIndex);
  commit(types.SET_FULLSCREEN,true);
  commit(types.SET_PLAYING,true);
}

// 保存搜索历史
export const saveSearchHistory=function ({commit,state},query) {
  commit(types.SET_SEARCHHISTORY,saveSearch(query))
}

// 删除一条搜索记录
export const deleteOneSearch=function ({commit},query) {
  commit(types.SET_SEARCHHISTORY,deleteOne(query));
}

// 删除所有搜索记录
export const deleteAllSearch=function ({commit}) {
  commit(types.SET_SEARCHHISTORY,deleteAll())
}

// 删除一首歌
export const deleteOneSong =function ({commit,state},song) {
  var playList=state.playList.slice();
  var sequenceList=state.sequenceList.slice();
  var currentIndex=state.currentIndex;
  // 查找要删除的歌曲在播放列表的索引
  var pIndex=findIndex(playList,song);
  playList.splice(pIndex,1);
  // 查找要删除的歌曲在存储顺序播放列表中的索引
  var sIndex=findIndex(sequenceList,song);
  sequenceList.splice(sIndex,1);
  // 当前播放的歌曲在删除歌曲的后面，或者当前播放的歌曲刚好是最后一首歌曲，而且删除的是最后一首歌曲
  if(currentIndex>pIndex || currentIndex==playList.length){
    currentIndex--
  }
  commit(types.SET_PLAYLIST,playList)
  commit(types.SET_SEQUENCELIST,sequenceList);
  commit(types.SET_CURRENTINDEX,currentIndex);
  // 歌曲播放列表没有歌曲
  if(!playList.length){
    // 停止播放
    commit(types.SET_PLAYING,false);
  }else{
    commit(types.SET_PLAYING,true);
  }
}

// 删除所有歌曲
export const deleteAllSong=function ({commit}) {
  commit(types.SET_PLAYLIST,[]);
  commit(types.SET_SEQUENCELIST,[]);
  commit(types.SET_PLAYING,false);
  commit(types.SET_CURRENTINDEX,-1);
}

// 保存最近播放
export const savePlayHistory=function ({commit},song) {
  commit(types.SET_PLAYHISTORY,savePlay(song))
}

// 保存我喜欢听的歌曲
export const saveFavoriteSongList=function ({commit},song) {
  commit(types.SET_FAVORITESONGLIST,saveFavoriteSong(song))
}

//删除我喜欢听的歌曲
export const deleteFavoriteSongList=function ({commit},song) {
  commit(types.SET_FAVORITESONGLIST,deleteFavoriteSong(song))
}
