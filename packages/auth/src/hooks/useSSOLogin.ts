'use client';

import { useCallback } from 'react';

export interface SSOLoginConfig {
  ssoUrl: string;
  apiKey: string;
  callbackPath?: string;
  next?: string;
  logoutPath?: string;
  redirectAfterLogout?: string;
}

export function useSSOLogin(config: SSOLoginConfig) {
  const login = useCallback(() => {

    const url = new URL(`${config.ssoUrl}/auth/login`)

    if (config.apiKey) {
      url.searchParams.set("api_key", config.apiKey)
    }

    url.searchParams.set(
      "redirect_to",
      window.location.href
    )

    window.location.href = url.toString()

  }, [config])

  const logout = useCallback(() => {

    localStorage.clear()

    const url = new URL(`${config.ssoUrl}/auth/signout`)

    url.searchParams.set(
      "redirect_to",
      window.location.origin
    )

    window.location.href = url.toString()

  }, [config])

  return { login, logout }
}