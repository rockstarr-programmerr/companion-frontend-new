import { TransactionCreateReq, TransactionDetailRes, TransactionListRes } from "@/interfaces/api/transaction";
import { AxiosRequestConfig } from "axios";
import Vue from "vue";
import { endpoints } from "./endpoints";

export const transaction = {
  async get (params?: AxiosRequestConfig['params']): Promise<TransactionListRes> {
    const res = await Vue.axios.get(endpoints.splitTheBill.transactions.get, {
      params
    })
    return res.data
  },

  async create (payload: TransactionCreateReq): Promise<TransactionDetailRes> {
    const res = await Vue.axios.post(endpoints.splitTheBill.transactions.create, payload)
    return res.data
  }
}
