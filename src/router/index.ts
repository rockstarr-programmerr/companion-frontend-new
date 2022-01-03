import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import DashBoard from '../views/DashBoard.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'
import TermsOfService from '../views/TermsOfService.vue'

import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import ResetPassword from '../views/auth/ResetPassword.vue'
import NewPassword from '../views/auth/NewPassword.vue'

import Notifications from '../views/account/Notifications.vue'
import MyInfo from '../views/account/MyInfo.vue'
import MyInfoChangeName from '../views/account/MyInfoChangeName.vue'
import MyInfoChangePassword from '../views/account/MyInfoChangePassword.vue'
import MyInfoChangeAvatar from '../views/account/MyInfoChangeAvatar.vue'
import FbDataDeletionStatus from '../views/account/FbDataDeletionStatus.vue'

import EventCreate from '../views/event/EventCreate.vue'
import EventDetail from '../views/event/EventDetail.vue'
import EventUpdate from '../views/event/EventUpdate.vue'
import EventMembers from '../views/event/EventMembers.vue'
import EventShare from '../views/event/EventShare.vue'
import JoinWithQR from '../views/event/JoinWithQR.vue'
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
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/new-password',
    name: 'NewPassword',
    component: NewPassword
  },
  {
    path: '/qr/:pk/:token',
    name: 'JoinWithQR',
    component: JoinWithQR,
    props: true
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: TermsOfService
  },
  ...prefixWith('/account', [
    {
      path: '/notifications',
      name: 'Notifications',
      component: Notifications
    },
    {
      path: '/my-info',
      name: 'MyInfo',
      component: MyInfo
    },
    {
      path: '/change-name',
      name: 'MyInfoChangeName',
      component: MyInfoChangeName
    },
    {
      path: '/change-password',
      name: 'MyInfoChangePassword',
      component: MyInfoChangePassword
    },
    {
      path: '/change-avatar',
      name: 'MyInfoChangeAvatar',
      component: MyInfoChangeAvatar
    },
    {
      path: '/facebook-data-deletion-status',
      name: 'FbDataDeletionStatus',
      component: FbDataDeletionStatus
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
      path: '/:pk/share',
      name: 'EventShare',
      component: EventShare,
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
  'NewPassword',
  'PrivacyPolicy',
  'TermsOfService',
  'FbDataDeletionStatus'
]
