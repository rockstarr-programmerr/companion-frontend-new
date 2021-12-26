import Vue from 'vue'
import Vuex from 'vuex'
import { account } from './account'
import { message } from './message'
import { event } from './event'
import { transaction } from './transaction'

Vue.use(Vuex)

export declare interface RootState {
  dummy?: string; // Just a dummy interface because we don't have root state yet
}

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    account,
    message,
    event,
    transaction
  }
})
