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
  provider?: string;
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
  } = config ?? {};

  const [state, setState] = useState<EgSessionContextValue>({
    user: null,
    isReady: false,
  });

  useEffect(() => {
    let isMounted = true; // Evita memory leaks se o componente desmontar rápido

    fetch(sessionPath)
      .then(async (res) => {
        // Se a resposta for 401 ou qualquer erro, apenas retornamos null (sem redirecionar à força)
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;

        if (data && !data.error) {
          // USUÁRIO LOGADO
          const claimsToMap = data.claims || data;
          setState({
            user: mapClaims(claimsToMap),
            isReady: true, // Libera a UI
          });
        } else {
          // USUÁRIO DESLOGADO (A MÁGICA ACONTECE AQUI!)
          // Agora avisamos a UI que carregou, mas que não tem ninguém logado.
          setState({
            user: null,
            isReady: true, // Libera a UI para mostrar os botões "Entrar"
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Erro ao carregar sessão:", err);
        // EM CASO DE ERRO DE REDE, LIBERAMOS A UI TAMBÉM
        setState({ user: null, isReady: true });
      });

    return () => {
      isMounted = false;
    };
  }, [sessionPath]);

  return (
    <EgSessionContext.Provider value={state}>
      {children}
    </EgSessionContext.Provider>
  );
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
    provider: (claims.provider as string) ?? undefined,
  };
}