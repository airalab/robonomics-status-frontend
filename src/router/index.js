import Vue from 'vue'
import Router from 'vue-router'
// import Home from '@/components/Home'
// import Panel from '@/components/graph/Panel'
// import Msg from '@/components/Msg'

const Home = () => import('@/components/Home')
const Panel = () => import('@/components/graph/Panel')
const Msg = () => import('@/components/Msg')

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/graph',
      name: 'graph',
      component: Panel
    },
    {
      path: '/msg',
      name: 'msg',
      component: Msg
    }
  ]
})
