import { Api } from '@/api'
import { PaginatedRes } from '@/interfaces/api/common'
import { EventDetailRes } from '@/interfaces/api/event'
import { Event, EventCreateReq } from '@/interfaces/event'
import { Module } from 'vuex'
import { RootState } from './index'

declare interface EventState {
  events: Event[];
  pagination: PaginatedRes | null;
}

export const event: Module<EventState, RootState> = {
  namespaced: true,

  state: {
    events: [],
    pagination: null
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
    }
  }
}
