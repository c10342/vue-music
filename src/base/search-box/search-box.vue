<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="input" class="box" :placeholder="placeholder" v-model="query"/>
    <i v-show="query" class="icon-dismiss" @click="clear"></i>
  </div>
</template>

<script>
  import {debounce} from "../../common/js/util";

  export default {
    name: "search-box",
    props:{
      // 占位符
      placeholder:{
        type:String,
        default:'搜索歌曲，歌手'
      }
    },
    data(){
      return{
        // 搜索关键字
        query:''
      }
    },
    created(){
      // 监听query的变化,这里不写在watch中是因为要进行函数节流，这样可以让用户在输入框中输入后延迟一段时间在发送请求，使得不用频繁发送请求
      this.$watch('query',debounce((newQuery)=>{
        this.$emit('query',newQuery)
      },400))
    },
    methods:{
      clear(){
        this.query = '';
      },
      setQuery(query){
        this.query=query;
      },
      blur(){
        // 这里是让输入框失去焦点,目的是因为移动端在输入框中输入内容是，键盘会弹起来，输入框失去焦点时会使键盘收起来
        this.$refs.input.blur();
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 22px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
