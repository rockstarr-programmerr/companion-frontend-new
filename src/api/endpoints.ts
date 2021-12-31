export const endpoints = {
  account: {
    users: {
      register: '/users/register/',
      login: '/users/login/',
      tokenRefresh: '/users/token-refresh/',
      registerTeacher: '/users/register-teacher/',
      detail: '/users/<pk>/',
      changePassword: '/users/change-password/',
      emailResetPasswordLink: '/users/email-reset-password-link/',
      resetPassword: '/users/reset-password/',
      search: '/users/search/'
    },
    me: {
      myInfo: '/users/me/info/',
      updateProfile: '/users/me/info/'
    }
  },
  splitTheBill: {
    events: {
      get: '/split-the-bill/events/',
      create: '/split-the-bill/events/',
      detail: '/split-the-bill/events/<pk>/',
      update: '/split-the-bill/events/<pk>/',
      delete: '/split-the-bill/events/<pk>/',
      previewSettlements: '/split-the-bill/events/<pk>/preview-settlements/',
      settle: '/split-the-bill/events/<pk>/settle/',
      joinWithQr: '/split-the-bill/events/join-with-qr/'
    },
    transactions: {
      get: '/split-the-bill/transactions/',
      create: '/split-the-bill/transactions/',
      detail: '/split-the-bill/transactions/<pk>/'
    }
  }
}

export function replacePk (endpoint: string, pk: number): string {
  return endpoint.replace('<pk>', pk.toString())
}
