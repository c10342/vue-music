import Vue from 'vue'
import Router from 'vue-router'
// import Rank from '../components/rank/rank.vue'
// import Recommend from '../components/recommend/recommend.vue'
// import Singer from '../components/singer/singer.vue'
// import  Search from '../components/search/search.vue'
// import SingerDetail from '../components/singer-detail/singer-detail.vue'
// import Dics from '../components/disc/dics.vue'
// import TopList from '../components/top-list/top-list.vue';
// import UserCenter from '../components/user-center/user-center.vue';

// 路由懒加载
const Rank=(resolve)=>{
  import('../components/rank/rank.vue').then((rank) =>{
    resolve(rank)
  })
}
const Recommend=(resolve)=>{
  import('../components/recommend/recommend.vue').then((recommend) =>{
    resolve(recommend)
  })
}
const Singer=(resolve)=>{
  import('../components/singer/singer.vue').then((singer) =>{
    resolve(singer)
  })
}
const Search=(resolve)=>{
  import('../components/search/search.vue').then((search) =>{
    resolve(search)
  })
}
const SingerDetail=(resolve)=>{
  import('../components/singer-detail/singer-detail.vue').then((singerDetail) =>{
    resolve(singerDetail)
  })
}
const Dics=(resolve)=>{
  import('../components/disc/dics.vue').then((disc) =>{
    resolve(disc)
  })
}
const TopList=(resolve)=>{
  import('../components/top-list/top-list.vue').then((topList) =>{
    resolve(topList)
  })
}
const UserCenter=(resolve)=>{
  import('../components/user-center/user-center.vue').then((userCenter) =>{
    resolve(userCenter)
  })
}

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Dics
        }
      ]
    },
    {
      path: '/singer',
      name: 'singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
      children:[
        {
          path:':id',
          component:SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      name: 'rank',
      component: Rank,
      children:[
        {
          path:':id',
          component:TopList
        }
      ]
    },
    {
      path:'/user',
      name:'user',
      component:UserCenter
    }
  ]
});
