'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface EgSessionUser {
  id: string;
  email: string | undefined;
  name: string | null;
  avatarUrl: string | null;
  isProducer: boolean;
  companyName: string | null;
  rankName: string | null;
  planSlug: string | null;
}

export interface EgSessionContextValue {
  user: EgSessionUser | null;
  isReady: boolean;
}

export interface EgSessionConfig {
  sessionPath?: string
  ssoUrl?: string
  apiKey?: string
}

const EgSessionContext = createContext<EgSessionContextValue>({
  user: null,
  isReady: false,
});

export function useEgSession(): EgSessionContextValue {
  return useContext(EgSessionContext);
}

interface EgSessionProviderProps {
  children: ReactNode;
  config?: EgSessionConfig;
}

/**
 * Provider para apps que usam o fluxo SSO sem credenciais Supabase direta.
 * Lê a sessão via `eg_session` cookie através do endpoint `/api/auth/session`.
 *
 * Uso:
 * ```tsx
 * // layout.tsx
 * import { EgSessionProvider } from '@easygoal/packages/auth/client';
 *
 * export default function RootLayout({ children }) {
 *   return <EgSessionProvider>{children}</EgSessionProvider>;
 * }
 * ```
 *
 * Em qualquer componente filho:
 * ```tsx
 * const { user, isReady } = useEgSession();
 * ```
 */
export function EgSessionProvider({ children, config }: EgSessionProviderProps) {

  const {
    sessionPath = '/api/auth/session',
    ssoUrl,
    apiKey
  } = config ?? {}

  const [state, setState] = useState<EgSessionContextValue>({
    user: null,
    isReady: false,
  })

  useEffect(() => {
    fetch(sessionPath)
      .then((res) => res.json())
      .then((data) => {
        if (!data && ssoUrl) {
          const url = new URL(`${ssoUrl}/auth/login`)

          if (apiKey) {
            url.searchParams.set("api_key", apiKey)
          }

          url.searchParams.set(
            "redirect_to",
            window.location.href
          )

          window.location.href = url.toString()
          return
        }

        setState({
          user: data ? mapClaims(data) : null,
          isReady: true,
        })
      })
      .catch(() => {
        setState({ user: null, isReady: true })
      })

  }, [sessionPath, ssoUrl, apiKey])

  return (
    <EgSessionContext.Provider value={state}>
      {children}
    </EgSessionContext.Provider>
  )
}

function mapClaims(claims: Record<string, unknown>): EgSessionUser {
  return {
    id: String(claims.sub ?? ''),
    email: claims.email as string | undefined,
    name: (claims.name as string) ?? null,
    avatarUrl: (claims.avatar_url as string) ?? null,
    isProducer: claims.is_producer === true,
    companyName: (claims.company_name as string) ?? null,
    rankName: (claims.rank_name as string) ?? null,
    planSlug: (claims.plan_slug as string) ?? null,
  };
}
