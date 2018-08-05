<template>
  <div class="search-list" v-show="searches.length">
    <transition-group name="list" tag="ul">
      <li :key="item" @click="selectItem(item)" class="search-item" v-for="item in searches">
        <span class="text">{{item}}</span>
        <span class="icon">
          <i class="icon-delete"  @click.stop="selectDeleteItem(item)"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script>
  export default {
    name: "search-list",
    props:{
      searches:{
        type:Array,
        default:[]
      }
    },
    methods:{
      selectDeleteItem(item){
        this.$emit('deleteOne',item);
      },
      selectItem(item){
        this.$emit('select',item);
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .search-list
    .search-item
      display: flex
      align-items: center
      height: 40px
      overflow: hidden
      &.list-enter-active, &.list-leave-active
        transition: all 0.1s
      &.list-enter, &.list-leave-to
        height: 0
      .text
        flex: 1
        color: $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size: $font-size-small
          color: $color-text-d
</style>
