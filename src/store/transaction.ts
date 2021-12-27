import { Api } from "@/api";
import { PaginatedRes } from "@/interfaces/api/common";
import { TransactionCreateReq, TransactionDetailRes, TransactionListRes } from "@/interfaces/api/transaction";
import { Transaction } from "@/interfaces/transaction";
import { AxiosRequestConfig } from "axios";
import Vue from "vue";
import { Module } from "vuex";
import { RootState } from "./index";

declare interface TransactionState {
  transactions: Transaction[];
  pagination: PaginatedRes | null;
}

export const transaction: Module<TransactionState, RootState> = {
  namespaced: true,

  state: {
    transactions: [],
    pagination: null
  },

  mutations: {
    SET_TRANSACTIONS (state, payload) {
      state.transactions = payload
    },

    ADD_TRANSACTION (state, payload) {
      state.transactions.push(payload)
    },

    SET_PAGINATION (state, payload) {
      state.pagination = payload
    }
  },

  actions: {
    async getTransactions ({ commit }, payload: {
      params?: AxiosRequestConfig['params'],
      url?: string;
  }): Promise<void> {
      const { params, url } = payload
      let data!: TransactionListRes

      if (params !== undefined) {
        data = await Api.transaction.get(params)
      } else if (url !== undefined) {
        const res = await Vue.axios.get(url)
        data = res.data
      } else {
        throw Error('Either `params` or `url` must be defined.')
      }

      commit('SET_TRANSACTIONS', data.results)
      delete data.results
      commit('SET_PAGINATION', data)
    },

    async createTransaction ({ commit }, payload: TransactionCreateReq): Promise<TransactionDetailRes> {
      const data = await Api.transaction.create(payload)
      commit('ADD_TRANSACTION', data)
      return data
    }
  }
}
