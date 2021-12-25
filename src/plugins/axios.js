'use strict'

import Vue from 'vue'
import axios from 'axios'
import Store from '@/store'
import router from '@/router'
import { getAuthorizationHeaderValue, loadAccessToken, loadRefreshToken } from '@/utils/auth'
import { status, assertErrCode } from '@/utils/status-codes'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const config = {
  baseURL: process.env.VUE_APP_API_ROOT,
  timeout: 60 * 1000, // Timeout
  headers: {
    common: {
      'Content-Type': 'application/json',
      'Accept-Language': 'vi'
    }
  }
}

const _axios = axios.create(config)

_axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    if (
      config.noAuthorization === undefined ||
      config.noAuthorization === false
    ) {
      setAuthenticationHeader(config.headers.common)
    }
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    return response
  },
  handleResponseError
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Plugin.install = function (Vue, options) {
  Vue.axios = _axios
  window.axios = _axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get () {
        return _axios
      }
    },
    $axios: {
      get () {
        return _axios
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin

function setAuthenticationHeader (headers) {
  const accessToken = getAuthorizationHeaderValue()
  if (accessToken !== '') {
    headers.Authorization = accessToken
  } else {
    delete headers.Authorization
  }
}

function handleResponseError (error) {
  /* eslint-disable prefer-promise-reject-errors */

  if (error.response === undefined) {
    return Promise.reject(error)
  }

  if (isNotFound(error)) {
    router.push({ name: 'Http404' })
    return Promise.reject() // Will not display unexpected error message to user
  }

  if (isUnauthorized(error)) {
    /* eslint-disable brace-style */

    if (isLoginRoute()) {
      return Promise.reject(error)
    }

    else if (noToken()) {
      goToLogin()
      return Promise.reject() // Will not display unexpected error message to user
    }

    else if (refreshTokenNotValid(error)) {
      Store.dispatch('account/logout')
      goToLogin()
      const isExpectedError = assertErrCode(error, status.HTTP_401_UNAUTHORIZED)
      if (isExpectedError) {
        return Promise.reject() // Will not display unexpected error message to user
      }
      else {
        return Promise.reject(error) // Will display unexpected error message to user
      }
    }

    else if (userInactiveOrNotFound(error)) {
      Store.dispatch('account/logout')
      goToLogin()
      return Promise.reject(error)
    }

    else {
      const response = tryAgainAfterRefreshingToken(error)
      return Promise.resolve(response)
    }
  }

  return Promise.reject(error)
}

function isLoginRoute () {
  if (router.options !== undefined && router.options.routes !== undefined) {
    const loginRoute = router.options.routes.find(route => route.name === 'Login')
    return (
      loginRoute !== undefined &&
      location.pathname === loginRoute.path
    )
  }
  return false
}

function goToLogin () {
  // If user is already at signin page, no need to redirect
  if (isLoginRoute()) {
    return
  }

  // If user is at some other page, redirect them to signin page
  const next = `${window.location.pathname}${window.location.search}`
  router.push({
    name: 'Login',
    query: {
      next
    }
  })
}

function isUnauthorized (error) {
  return assertErrCode(error, status.HTTP_401_UNAUTHORIZED)
}

function isNotFound (error) {
  return assertErrCode(error, status.HTTP_404_NOT_FOUND)
}

function refreshTokenNotValid (error) {
  return (
    error.response.data.code === 'token_not_valid' &&
    error.response.data.messages === undefined
  )
}

function userInactiveOrNotFound (error) {
  return (
    error.response.data.code === 'user_inactive' ||
    error.response.data.code === 'user_not_found'
  )
}

function noToken () {
  return loadAccessToken() === '' || loadRefreshToken() === ''
}

async function tryAgainAfterRefreshingToken (error) {
  await Store.dispatch('account/refreshToken')
  setAuthenticationHeader(error.config.headers)
  const response = await _axios.request(error.config)
  return response
}
