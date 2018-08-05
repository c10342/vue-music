import {getLyric} from "../../api/song";
import {ERR_OK} from "../../api/config";
import {Base64} from 'js-base64'

export default class Song{
  // id:歌曲的id，mid:歌曲的mid,singer:歌曲的歌手，name:歌曲的名称，album:专辑名称，duration:歌曲长度，image:图片地址，url:歌曲路径
  constructor({id,mid,singer,name,album,duration,image,url}){
    this.id=id;
    this.mid=mid;
    this.singer=singer;
    this.name=name;
    this.album=album;
    this.duration=duration;
    this.image=image;
    this.url=url;
  }
  getLyric(){
    if(this.lyric){
      return Promise.resolve(this.lyric)
    }
    return new Promise((resolve,reject)=>{
      getLyric(this.mid)
      .then((res)=>{
        if(res.retcode==ERR_OK){
          // 解析字符编码
          this.lyric=Base64.decode(res.lyric);
          resolve(this.lyric)
        }else {
          reject('no lyric');
        }
      })
    })
  }
}

// 工厂实例
export function createSong(musicData) {
  return new Song({
    id:musicData.songid,
    mid:musicData.songmid,
    singer:filterSingerName(musicData.singer),
    name:musicData.songname,
    album:musicData.albumname,
    duration:musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=38`
  })
}


// 一首歌有多个歌手，拼接成xxx/yyy
export function filterSingerName(singerName) {
  var ret=[];
  if(!singerName){
    return '';
  }
  singerName.forEach((item)=>{
    ret.push(item.name)
  })
  return ret.join('/');
}
