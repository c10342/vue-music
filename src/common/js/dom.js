export function addClass(el,name) {
  if(hasClassName(el,name)){
    return;
  }
  var newClass=el.className.split(' ');
  newClass.push(name);
  el.className=newClass.join(' ');
}

export function hasClassName(el,name) {
  // 正则表达式^开头，\s空格，$末尾
  var reg=new RegExp('(^|\\s)'+name+'(\\s|$)');
  return reg.test(el.className)
}

export function getData(el,name,val) {
  const prefix='data-';
  if(val){
    // 如果val有值表示要设置属性
    return el.setAttribute(prefix+name,val)
  }
  return el.getAttribute(prefix+name);
}


//创建一个div标签并获取其所有css样式
var elementStyle=document.createElement('div').style;
//返回用户正在使用的浏览器
let vender=(()=>{
  var transformName={
//谷歌浏览器
    webkit:'webkitTranform',
//IE
    ms:'msTransform',
//Opera 浏览器
    O:'OTransform',
//火狐
    Moz:'MozTransform',
//标准浏览器
    standard:'transform'
  }
  for(var key in transformName){
    if(elementStyle[transformName[key]]!=undefined){
      return key;
    }
  }
//返回false说明该浏览器不存在transform这个样式，这是不可能的，说明该浏览器有问题
  return false;
})()

//对传进来的样式名做兼容
export  function prefixstyle(styleName){
  if(vender==false){
    return false
  }
  if(vender=='standard'){
    return styleName;
  }
  return vender+styleName.charAt(0).toUpperCase()+styleName.subStr(1);
}
