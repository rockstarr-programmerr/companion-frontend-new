import { EventDetailRes, EventListRes } from '@/interfaces/api/event'
import { Event, EventCreateReq } from '@/interfaces/event'
import Vue from 'vue'
import { endpoints, replacePk } from './endpoints'

export const event = {
  async getEvents (): Promise<EventListRes> {
    const res = await Vue.axios.get(endpoints.splitTheBill.events.get)
    return res.data
  },

  async createEvent (payload: EventCreateReq): Promise<EventDetailRes> {
    const res = await Vue.axios.post(endpoints.splitTheBill.events.create, payload)
    return res.data
  },

  async getEventDetail (pk: Event['pk']): Promise<EventDetailRes> {
    const url = replacePk(endpoints.splitTheBill.events.detail, pk)
    const res = await Vue.axios.get(url)
    return res.data
  }
}
