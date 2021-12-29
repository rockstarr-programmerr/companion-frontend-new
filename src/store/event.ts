import { Api } from '@/api'
import { PaginatedRes } from '@/interfaces/api/common'
import { EventDetailRes, EventUpdateReq, RemoveMembersReq } from '@/interfaces/api/event'
import { Event, EventCreateReq } from '@/interfaces/event'
import Vue from 'vue'
import { Module } from 'vuex'
import { RootState } from './index'

declare interface EventState {
  events: Event[];
  pagination: PaginatedRes | null;
  currentEvent: Event | null;
}

export const event: Module<EventState, RootState> = {
  namespaced: true,

  state: {
    events: [],
    pagination: null,
    currentEvent: null
  },

  mutations: {
    SET_EVENTS (state, payload) {
      state.events = payload
    },

    SET_PAGINATION (state, payload) {
      state.pagination = payload
    },

    ADD_EVENT (state, payload) {
      state.events.push(payload)
    },

    SET_CURRENT_EVENT (state, payload) {
      state.currentEvent = payload
    },

    REMOVE_MEMBERS (state, payload) {
      if (state.currentEvent === null) return
      state.currentEvent.members = state.currentEvent.members.filter(m => !payload.includes(m.pk))
    }
  },

  actions: {
    async getEvents ({ commit }): Promise<void> {
      const data = await Api.event.getEvents()
      const events = data.results
      delete data.results
      commit('SET_EVENTS', events)
      commit('SET_PAGINATION', data)
    },

    async createEvent ({ commit }, payload: EventCreateReq): Promise<EventDetailRes> {
      const data = await Api.event.createEvent(payload)
      commit('ADD_EVENT', data)
      return data
    },

    async getEventDetail ({ commit }, payload: Event['pk']): Promise<void> {
      const data = await Api.event.getEventDetail(payload)
      commit('SET_CURRENT_EVENT', data)
    },

    async updateEvent ({ commit }, payload: {
      pk: Event['pk'],
      body: EventUpdateReq
    }): Promise<void> {
      const data = await Api.event.updateEvent(payload.pk, payload.body)
      commit('SET_CURRENT_EVENT', data)
    },

    async removeMembers ({ commit, state }, payload: RemoveMembersReq): Promise<void> {
      if (state.currentEvent === null) return
      await Vue.axios.post(state.currentEvent.extra_action_urls.remove_members, payload)
      commit('REMOVE_MEMBERS', payload.member_pks)
    }
  }
}
