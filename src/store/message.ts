import { Module } from 'vuex'
import { RootState } from './index'

declare interface MessageState {
  show: boolean;
  text: string;
  color: string;
}

export const message: Module<MessageState, RootState> = {
  namespaced: true,

  state: {
    show: false,
    text: '',
    color: 'primary'
  },

  mutations: {
    SHOW_MESSAGE (state, text) {
      state.text = text
      state.show = true
    },

    HIDE_MESSAGE (state) {
      state.show = false
    },

    SHOW_SUCCESS (state, text) {
      state.color = 'success'
      state.show = true
    },

    SHOW_ERROR (state, text) {
      state.color = 'error'
      state.show = true
    }
  }
}
