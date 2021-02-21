import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Error404 from '../views/Error404.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import(/* webpackChunkName: "help" */ '../views/Help.vue')
  },
  {
    path: '/agenda',
    name: 'Agenda',
    component: () => import(/* webpackChunkName: "agenda" */ '../views/Agenda.vue')
  },
  {
    path: '/bug',
    name: 'Bug',
    component: () => import(/* webpackChunkName: "bug" */ '../views/Bug.vue')
  },
  {
    path: "/404",
    name: "Error404",
    component: Error404
  },
  {
    path: "*",
    name: "Error404",
    redirect: "/404"
  }
]

const router = new VueRouter({
  routes,
  mode: "history"
})

export default router
