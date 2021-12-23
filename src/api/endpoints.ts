export const endpoints = {
  account: {
    users: {
      login: '/users/login/',
      tokenRefresh: '/users/token-refresh/',
      registerTeacher: '/users/register-teacher/',
      detail: '/users/<pk>/',
      changePassword: '/users/change-password/',
      emailResetPasswordLink: '/users/email-reset-password-link/',
      resetPassword: '/users/reset-password/'
    },
    me: {
      myInfo: 'users/me/info/',
      updateProfile: '/me/'
    }
  },
  splitTheBill: {
    events: {
      get: '/split-the-bill/events/'
    }
  }
}

export function replacePk (endpoint: string, pk: number): string {
  return endpoint.replace('<pk>', pk.toString())
}
