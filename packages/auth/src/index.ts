// ===============================
// CLIENT ENTRY (React only)
// ===============================

// Providers — Supabase-based (app com credenciais diretas)
export { AuthProvider, useAuthSession } from './providers/AuthProvider';

// Providers — eg_session-based (app sem credenciais Supabase)
export { EgSessionProvider, useEgSession } from './providers/EgSessionProvider';
export type { EgSessionUser, EgSessionConfig, EgSessionContextValue } from './providers/EgSessionProvider';

// Hooks
export { useSSOLogin } from './hooks/useSSOLogin';
export type { SSOLoginConfig } from './hooks/useSSOLogin';

// Types (seguros para client)
export type {
  AuthCompany, AuthContextValue, AuthData, AuthProviderConfig, AuthStats, AuthUser
} from './types';
