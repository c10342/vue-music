import {playMode} from '../common/js/config.js'
import {loadSearch,loadPlay,loadFavoriteSongList} from "../common/js/cache";

// 仓库
const state = {
  // 歌手信息
  singer: {},
  // 播放器是否在播放
  playing: false,
  // 是否全屏，即显示全屏播放器还是迷你播放器
  fullScreen: false,
  // 歌曲播放列表
  playList: [],
  // 存储顺序播放列表,副本
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前播放的是第几首歌
  currentIndex: -1,
  // 推荐页面的专辑
  disc: {},
  topList: {},
  // 搜索历史,刷新后从localstore获取初值
  searchHistory: loadSearch(),
  // 播放历史，最近播放
  playHistory:loadPlay(),
  // 我喜欢的歌曲列表
  favoriteSongList:loadFavoriteSongList()
};
export default state;
