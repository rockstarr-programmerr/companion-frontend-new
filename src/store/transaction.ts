import { Api } from "@/api";
import { TransactionCreateReq, TransactionDetailRes } from "@/interfaces/api/transaction";
import { Transaction } from "@/interfaces/transaction";
import { Module } from "vuex";
import { RootState } from "./index";

declare interface TransactionState {
  transactions: Transaction[];
}

export const transaction: Module<TransactionState, RootState> = {
  namespaced: true,

  state: {
    transactions: []
  },

  mutations: {
    ADD_TRANSACTION (state, payload) {
      state.transactions.push(payload)
    }
  },

  actions: {
    async createTransaction ({ commit }, payload: TransactionCreateReq): Promise<TransactionDetailRes> {
      const data = await Api.transaction.create(payload)
      commit('ADD_TRANSACTION', data)
      return data
    }
  }
}
