var express=require('express');
var axios=require('axios');

var app=express()

app.use(express.static('./dist'));

app.get('/getDiscList', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  // 发送请求
  axios.get(url, {
    // 请求头，欺骗qq音乐后台，使它误认为发出请求的是https://c.y.qq.com/
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    // 请求所需要的参数,axios会自动拼接成xx=xx&yy=yy
    params: req.query
  }).then((response) => {
    // 请求成功后返回数据给前端
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
});
app.get('/getLyric', function (req, res) {
    var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
    // 发送请求
    axios.get(url, {
      // 请求头，欺骗qq音乐后台，使它误认为发出请求的是https://c.y.qq.com/
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      // 请求所需要的参数,axios会自动拼接成xx=xx&yy=yy
      params: req.query
    }).then((response) => {
      // 请求成功后返回数据给前端
      var ret = response.data
      if (typeof ret === 'string') {
        var reg = /^\w+\(({[^()]+})\)$/
        var matches = ret.match(reg)
        if (matches) {
          ret = JSON.parse(matches[1])
        }
      }
      res.json(ret)
    }).catch((e) => {
      console.log(e)
    })
  });
app.get('/getSongList',function (req,res) {
    var url='https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';
    axios.get(url,{
      headers:{
        referer:'https://c.y.qq.com/',
        host:'c.y.qq.com'
      },
      params:req.query
    }).then(response=>{
      var ret = response.data
      if (typeof ret == 'string') {
        var reg = /^\w+\(({[^()]+})\)$/
        var matches = ret.match(reg)
        if (matches) {
          ret = JSON.parse(matches[1])
        }
      }
      res.json(ret)
    }).catch(err=>{
      console.log(err)
    })
  });


app.listen(9000,'localhost',function () {
  console.log('服务器已经启动，地址是http://localhost:9000');
});
