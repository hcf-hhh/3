import Vue from 'vue'
import VueRouter from 'vue-router'
import Front from '../views/Front.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Main from '../views/manage/Main'
import Device from '../views/manage/device/Device'
import Map from '../views/manage/map'
import Manager from '../views/manage/manager/Manager'
import Curve from "../views/manage/Curve"
import Warn from '../views/manage/warn/Warn'
import ManagerOpen from "@/views/manage/open/ManagerOpen";
import UserOpen from "@/views/manage/open/UserOpen";
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'front',
    component: Front
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/main',
    name: 'main',
    component: Main,
    children: [
      {
        path: '/device',
        name: 'device',
        component: Device
      },
      {
        path: '/map',
        name: 'map',
        component: Map
      },
      {
        path: '/manager',
        name: 'manager',
        component: Manager
      },
      {
        path: '/curve',
        name: 'curve',
        component: Curve
      },
      {
        path: '/warn',
        name: 'warn',
        component: Warn
      },
      {
        path: '/managerOpen',
        name: 'managerOpen',
        component: ManagerOpen
      },
      {
        path: '/userOpen',
        name: 'userOpen',
        component: UserOpen
      }
    ]
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
