const accessTokenKey = 'access-token'
const refreshTokenKey = 'refresh-token'

export function setAccessToken (token: string): void {
  localStorage.setItem(accessTokenKey, token)
}

export function setRefreshToken (token: string): void {
  localStorage.setItem(refreshTokenKey, token)
}

export function loadAccessToken (): string {
  return localStorage.getItem(accessTokenKey) || ''
}

export function loadRefreshToken (): string {
  return localStorage.getItem(refreshTokenKey) || ''
}

export function getAuthorizationHeaderValue (accessToken?: string): string {
  const token = accessToken || loadAccessToken()
  if (token === undefined || token === null || token === '') {
    return ''
  } else {
    return `Bearer ${token}`
  }
}

export function deleteAccessToken (): void {
  localStorage.removeItem(accessTokenKey)
}

export function deleteRefreshToken (): void {
  localStorage.removeItem(refreshTokenKey)
}

export function logout (): void {
  deleteAccessToken()
  deleteRefreshToken()
}
