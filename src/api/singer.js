import jsonp from '../common/js/jsonp.js'
import {commonParams,options} from './config.js'

export function getSingerList() {
  var url='https://c.y.qq.com/v8/fcg-bin/v8.fcg';
  var data=Object.assign({},commonParams,{
    channel:'singer',
    page:'list',
    key:'all_all_all',
    pagesize:100,
    pagenum:1,
    loginUin:1376023740,
    platform:'yqq',
    needNewCode:0
  });
  return jsonp(url,data,options)
}

export function getSingerDetail(singerId) {
  var url='https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg';
  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 80,
    songstatus: 1,
    singermid: singerId
  })

  return jsonp(url, data, options)
}
