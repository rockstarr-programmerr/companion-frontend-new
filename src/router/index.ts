import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import DashBoard from '../views/DashBoard.vue'

import Login from '../views/auth/Login.vue'

import EventCreate from '../views/event/EventCreate.vue'
import EventDetail from '../views/event/EventDetail.vue'

import { castToNumber, prefixWith } from './utils'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'DashBoard',
    component: DashBoard
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  ...prefixWith('/events', [
    {
      path: '/new',
      name: 'EventCreate',
      component: EventCreate
    },
    {
      path: '/:pk',
      name: 'EventDetail',
      component: EventDetail,
      props: castToNumber(['pk'])
    }
  ])
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

export const noAuthenRoutes = [
  'Login',
  'Register',
  'ResetPassword',
  'NewPassword'
]
