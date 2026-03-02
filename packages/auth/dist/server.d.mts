import * as next_server from 'next/server';
import { NextRequest, NextResponse } from 'next/server';

interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    role_id: string | null;
    role_name: string | null;
    permissions: string[];
    is_super_admin: boolean;
    is_producer: boolean;
    producer_id: string | null;
    provider: string | null;
    phone_number: string | null;
}
interface AuthCompany {
    id: string;
    name: string;
    cnpj: string | null;
    plan: string | null;
}
interface AuthStats {
    saas_products_count: number;
    active_services_count: number;
}
interface AuthData {
    user: AuthUser;
    company: AuthCompany | null;
    stats: AuthStats | null;
}
interface CallbackConfig {
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    ssoUrl?: string;
    appUrl?: string;
    /** Server-side API key para verificar eg_token via SSO /auth/verify */
    apiKey?: string;
}
interface MiddlewareConfig {
    supabaseUrl: string;
    supabaseAnonKey: string;
}

declare function handleAuthCallback(request: NextRequest, config: CallbackConfig): Promise<NextResponse<unknown>>;

declare function createCallbackRoute(config: CallbackConfig): (request: NextRequest) => Promise<next_server.NextResponse<unknown>>;

declare function updateSession(request: NextRequest, config: MiddlewareConfig): Promise<NextResponse<unknown>>;
declare const defaultMatcherConfig: {
    matcher: string[];
};

export { type AuthCompany, type AuthData, type AuthStats, type AuthUser, type CallbackConfig, type MiddlewareConfig, createCallbackRoute, defaultMatcherConfig, handleAuthCallback, updateSession };
