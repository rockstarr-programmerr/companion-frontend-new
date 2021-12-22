import { Api } from '@/api'
import { LoginReq, UpdateProfileReq } from '@/interfaces/api/account'
import { User } from '@/interfaces/user'
import { loadAccessToken, loadRefreshToken, setAccessToken, setRefreshToken } from '@/utils/auth'
import { Module } from 'vuex'
import { RootState } from './index'

declare interface AccountState {
  loggedInUser?: User;
  accessToken: string;
  refreshToken: string;
}

export const account: Module<AccountState, RootState> = {
  namespaced: true,

  state: {
    loggedInUser: undefined,
    accessToken: loadAccessToken(),
    refreshToken: loadRefreshToken()
  },

  mutations: {
    SET_LOGGED_IN_USER (state, payload: User | undefined) {
      state.loggedInUser = payload
    },

    SET_ACCESS_TOKEN (state, token: string) {
      state.accessToken = token
      setAccessToken(token)
    },

    SET_REFRESH_TOKEN (state, token: string) {
      state.refreshToken = token
      setRefreshToken(token)
    }
  },

  actions: {
    async login ({ commit }, payload: LoginReq): Promise<void> {
      const data = await Api.account.login(payload)
      commit('SET_ACCESS_TOKEN', data.access)
      commit('SET_REFRESH_TOKEN', data.refresh)
    },

    async logout ({ commit }): Promise<void> {
      commit('SET_ACCESS_TOKEN', '')
      commit('SET_REFRESH_TOKEN', '')
      commit('SET_LOGGED_IN_USER', undefined)
    },

    async refreshToken ({ commit }): Promise<void> {
      const payload = {
        refresh: loadRefreshToken()
      }
      const data = await Api.account.tokenRefresh(payload)
      commit('SET_ACCESS_TOKEN', data.access)
      commit('SET_REFRESH_TOKEN', data.refresh)
    },

    async getInfo ({ commit }): Promise<void> {
      const data = await Api.account.getMyInfo()
      commit('SET_LOGGED_IN_USER', data)
    },

    async updateProfile ({ commit }, payload: UpdateProfileReq): Promise<void> {
      const data = await Api.account.updateProfile(payload)
      commit('SET_LOGGED_IN_USER', data)
    }
  }
}
