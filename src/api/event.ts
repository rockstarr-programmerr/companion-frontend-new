import { EventListRes } from '@/interfaces/api/event'
import Vue from 'vue'
import { endpoints } from './endpoints'

export const event = {
  async getEvents (): Promise<EventListRes> {
    const res = await Vue.axios.get(endpoints.splitTheBill.events.get)
    return res.data
  }
}
