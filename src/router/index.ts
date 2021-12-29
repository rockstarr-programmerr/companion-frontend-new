import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import DashBoard from '../views/DashBoard.vue'

import Login from '../views/auth/Login.vue'

import Notifications from '../views/account/Notifications.vue'

import EventCreate from '../views/event/EventCreate.vue'
import EventDetail from '../views/event/EventDetail.vue'
import EventUpdate from '../views/event/EventUpdate.vue'
import EventMembers from '../views/event/EventMembers.vue'
import TransactionHistory from '../views/event/TransactionHistory.vue'
import SettlePreview from '../views/event/SettlePreview.vue'

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
  ...prefixWith('/account', [
    {
      path: '/notifications',
      name: 'Notifications',
      component: Notifications
    }
  ]),
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
    },
    {
      path: '/:pk/edit',
      name: 'EventUpdate',
      component: EventUpdate,
      props: castToNumber(['pk'])
    },
    {
      path: '/:pk/members',
      name: 'EventMembers',
      component: EventMembers,
      props: castToNumber(['pk'])
    },
    {
      path: '/:pk/transaction-history',
      name: 'TransactionHistory',
      component: TransactionHistory,
      props: castToNumber(['pk'])
    },
    {
      path: '/:pk/settle-preview',
      name: 'SettlePreview',
      component: SettlePreview,
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
