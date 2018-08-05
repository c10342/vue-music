import {commonParams} from './config.js';
import axios from 'axios';

export function getLyric(mid) {
  const url='/getLyric';
  var data=Object.assign({},commonParams,{
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: +new Date(),
    // 因为后台是用res.json()返回数据的,所以我们这里要告诉他我们要的是json
    format: 'json'
  });
  return axios.get(url,{
    params:data
  }).then((res)=>{
    return Promise.resolve(res.data);
  })
}
