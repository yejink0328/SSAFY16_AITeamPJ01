import { createRouter, createWebHistory } from 'vue-router'
const Home = () => import('../components/Home.vue')
const BoardList = () => import('../components/BoardList.vue')
const BoardDetail = () => import('../components/BoardDetail.vue')
const BoardForm = () => import('../components/BoardForm.vue')
const Map = () => import('../components/Map.vue')

const routes = [
  { path: '/', component: Home },
  { path: '/community', component: BoardList },
  { path: '/board/:id', component: BoardDetail, props: (route) => ({ postId: route.params.id }) },
  { path: '/map', component: Map },
  {
    path: '/write',
    component: BoardForm,
    // pass mode and postId via query params as props
    props: (route) => ({ mode: route.query.mode || 'create', postId: route.query.id || null }),
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})