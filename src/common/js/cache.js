import storage from 'good-storage';

// 保存在localstorage中的key值
const SEARCH_KEY = '_search_';
// 保存的最大数量，即可以保存多少条搜索历史
const SEARCH_MAX_LENGTH = 15;

// 最近播放
const PLAYHISTORY_KEY='_playhistory_';
// 最大数量
const PLAYHISTORY_MAX_LENGTH=200;

//我喜欢听的
const FAVORITE='_FAVORITE_';
// 我喜欢听的歌曲列表最大长度
const FAVORITE_MAX_LENGTH=200;

// 往数组插入一个值，arr是数组，val是要插入的值，compare是比较器，即用来找到2个值是否相等，maxLength是数组最大长度。这个函数作用是把要插入的值放在第一位，并且去掉重复的
function insertArray(arr, val, compare, maxLength) {
  // 查找要插入的值是否在数组中
  var index = arr.findIndex(compare);
  // 插入的值已经在数组中，并别在第一个位置
  if (index == 0) {
    return
  }
  // 要插入的值在数组中，但是不在第一个位置
  if (index > 0) {
    // 删除已经存在的值
    arr.splice(index, 1);
  }
  // 插入要插入的值
  arr.unshift(val);
  if (maxLength && arr.length > maxLength) {
    // 删除最后一个元素
    arr.pop();
  }
}

// 保存搜索历史记录，并保存到localstorage中，query是搜索记录
export const saveSearch = function (query) {
  // 获取localstorage中key为_search_的值，有就直接返回，没有就直接返回默认的[]
  let searches = storage.get(SEARCH_KEY, []);
  // 插入搜索记录
  insertArray(searches, query, (item) => {
    return item == query
  }, SEARCH_MAX_LENGTH);
  // 修改localstorage中的值
  storage.set(SEARCH_KEY, searches);
  return searches;
}

// 获取localstorage的SEARCH_KEY值
export const loadSearch=function () {
  return storage.get(SEARCH_KEY,[]);
}

// 从数组中删除一个元素
function deleteFromArray(arr,val,compare) {
  var index=arr.findIndex(compare);
  if(index>-1){
    arr.splice(index,1);
  }
}
// 删除一条搜索记录
export const deleteOne=function (query) {
  var searches=storage.get(SEARCH_KEY,[]);
  deleteFromArray(searches,query,(item)=>{return item==query})
  storage.set(SEARCH_KEY,searches);
  return searches;
}
// 删除所有搜索记录
export const deleteAll=function () {
  storage.remove(SEARCH_KEY);
  return [];
}

// 保存最近播放
export const savePlay=function (song) {
  var playHistory=storage.get(PLAYHISTORY_KEY,[]);
  insertArray(playHistory,song,(item)=>{return item.id==song.id},PLAYHISTORY_MAX_LENGTH);
  storage.set(PLAYHISTORY_KEY,playHistory);
  return playHistory;
}

// 获取最近播放
export const loadPlay=function () {
  return storage.get(PLAYHISTORY_KEY,[]);
}

// 保存我喜欢的歌曲
export const saveFavoriteSong=function (song) {
  var songs=storage.get(FAVORITE,[]);
  insertArray(songs,song,(item)=>{return item.id==song.id},FAVORITE_MAX_LENGTH);
  storage.set(FAVORITE,songs);
  return songs;
}

// 删除我喜欢听的
export const deleteFavoriteSong=function (song) {
  var songs=storage.get(FAVORITE,[]);
  deleteFromArray(songs,song,(item)=>{return item.id==song.id});
  storage.set(FAVORITE,songs);
  return songs;
}

// 获取我喜欢听的
export const loadFavoriteSongList=function () {
  return storage.get(FAVORITE,[]);
}
