// jsonp解决跨域问题
import originJSONP from 'jsonp';

//url是请求路径，data是参数，option是jsonp一些配置参数
export default function jsonp(url,data,option) {
  url+=(url.indexOf('?')<0?'?':'&')+param(data)
  //Promise是es6的api，Promise成功后调用resolve，失败调用reject
  return new Promise((resolve,reject)=>{
    originJSONP(url,option,(err,data)=>{
      if(!err){ //成功
        resolve(data);
      }else { //失败
        reject(err);
      }
    })
  })
}

//处理参数
function param(data) {
  var url='';
  for (var key in data){
    let value=data[key]!==undefined?data[key]:'';
    //encodeURIComponent，把字符串作为 URI 组件进行编码，vlaue其中的某些字符将被十六进制的转义序列进行替换。
    url+=`&${key}=${encodeURIComponent(value)}`
  }

  //url不为空时去掉第一个&
  return url?url.substring(1):'';
}
