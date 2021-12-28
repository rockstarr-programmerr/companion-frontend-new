import { EventDetailRes, EventListRes, EventUpdateReq, SettlementPreviewRes } from '@/interfaces/api/event'
import { Event, EventCreateReq } from '@/interfaces/event'
import { AxiosRequestConfig } from 'axios'
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
  },

  async updateEvent (pk: Event['pk'], payload: EventUpdateReq): Promise<EventDetailRes> {
    const url = replacePk(endpoints.splitTheBill.events.update, pk)
    const res = await Vue.axios.patch(url, payload)
    return res.data
  },

  async getPreviewSettlements (pk: Event['pk'], params?: AxiosRequestConfig['params']): Promise<SettlementPreviewRes> {
    const url = replacePk(endpoints.splitTheBill.events.previewSettlements, pk)
    const res = await Vue.axios.get(url, { params })
    return res.data
  },

  async settle (pk: Event['pk']): Promise<void> {
    const url = replacePk(endpoints.splitTheBill.events.settle, pk)
    await Vue.axios.post(url)
  }
}
