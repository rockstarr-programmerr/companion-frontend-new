import { TransactionCreateReq, TransactionDetailRes } from "@/interfaces/api/transaction";
import Vue from "vue";
import { endpoints } from "./endpoints";

export const transaction = {
  async create (payload: TransactionCreateReq): Promise<TransactionDetailRes> {
    const res = await Vue.axios.post(endpoints.splitTheBill.transactions.create, payload)
    return res.data
  }
}
