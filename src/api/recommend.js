import jsonp from '../common/js/jsonp.js'
import {commonParams,options} from './config.js'
import axios from 'axios'

export function getRecommend() {
  // qq音乐
  var url='https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';

  // 拼接成一个对象
  const data=Object.assign({},commonParams,{
    g_tk:5381,
    platform: 'h5',
    uin: 0,
    format:'json',
    needNewCode: 1,
    _:1522572975899
  });
  // 返回一个Promise对象
  return jsonp(url,data,options)
}

export function getDiscList() {
  const url = '/getDiscList'
  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json',
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSongList(disstid) {
  const url = '/getSongList';

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    format: 'json'
  })

  return axios.get(url,{
    params:data
  }).then(res=>{
    return Promise.resolve(res.data)
  })
}


