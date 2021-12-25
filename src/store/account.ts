import { Api } from '@/api'
import { LoginReq, UpdateProfileReq } from '@/interfaces/api/account'
import { EventInvitation, User } from '@/interfaces/user'
import { loadAccessToken, loadRefreshToken, setAccessToken, setRefreshToken } from '@/utils/auth'
import { Module } from 'vuex'
import { RootState } from './index'
import Vue from 'vue'

declare interface AccountState {
  loggedInUser?: User;
  accessToken: string;
  refreshToken: string;
  eventInvitations: EventInvitation[];
}

export const account: Module<AccountState, RootState> = {
  namespaced: true,

  state: {
    loggedInUser: undefined,
    accessToken: loadAccessToken(),
    refreshToken: loadRefreshToken(),
    eventInvitations: []
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
    },

    SET_EVENT_INVITATIONS (state, payload) {
      state.eventInvitations = payload
    },

    REMOVE_EVENT_INVITATION (state, payload) {
      state.eventInvitations = state.eventInvitations.filter(invitation => invitation.pk !== payload)
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
    },

    async getEventInvitations ({ commit, state }): Promise<void> {
      if (state.loggedInUser === undefined) return
      const res = await Vue.axios.get(state.loggedInUser.event_invitations_url, {
        params: {
          status__in: 'pending'
        }
      })
      commit('SET_EVENT_INVITATIONS', res.data.results)
    },

    async acceptEventInvitation ({ commit }, payload: EventInvitation): Promise<void> {
      await Vue.axios.post(payload.accept_invitation_url)
      commit('REMOVE_EVENT_INVITATION', payload.pk)
    },

    async declineEventInvitation ({ commit }, payload: EventInvitation): Promise<void> {
      await Vue.axios.post(payload.decline_invitation_url)
      commit('REMOVE_EVENT_INVITATION', payload.pk)
    }
  }
}
