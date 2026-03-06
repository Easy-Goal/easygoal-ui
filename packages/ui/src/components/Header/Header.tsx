"use client";

import { useEgSession, useSSOLogin } from "@easygoal/packages/auth/client";
import {
  ChevronDown,
  LogOut
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EasyHeaderProps } from ".";
import { Logo } from "../Logo";
import { NotificationBell } from "./NotificationBell"; // Importando o componente corrigido

// ... (Interfaces HeaderNavLink e EasyHeaderProps mantidas)

function HeaderUserMenu({ config, notifications }: {
  config: EasyHeaderProps["config"],
  notifications?: any[]
}) {
  const { user, isReady } = useEgSession();
  const { logout } = useSSOLogin({
    ssoUrl: config.ssoUrl,
    apiKey: config.apiKey,
    logoutPath: "/api/auth/signout",
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getAppUrl = (path: string) => {
    const baseUrl = config.appUrl || "https://app.easygoal.com.br";
    return `${baseUrl}${path}`;
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isReady || !user) return null;

  const isOAuthUser = user.provider && user.provider !== "email";
  const initials = user.name
    ? user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {/* Sino de Notificação Global ao lado do perfil */}
      <NotificationBell
        notifications={notifications}
        allNotificationsUrl={getAppUrl("/notifications")}
      />

      <div ref={containerRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/20 overflow-hidden shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} className="h-full w-full object-cover" alt="" />
            ) : (
              <span className="text-[10px] font-bold text-orange-500">{initials}</span>
            )}
          </div>
          <span className="hidden max-w-[100px] truncate font-medium sm:block text-white/90">
            {user.name?.split(" ")[0]}
          </span>
          <ChevronDown className={`h-4 w-4 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          /* Correção: Background sólido e z-index alto para evitar transparência */
          <div className="absolute right-0 top-full z-[100] mt-2 w-64 rounded-xl border border-white/10 bg-[#1e2536] p-1.5 shadow-2xl">
            <div className="px-3 py-3 border-b border-white/5">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-[11px] text-white/40">{user.email}</p>
            </div>
            {/* ... (Links de navegação centralizada mantidos) */}
            <div className="py-1">
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                <LogOut className="h-4 w-4" /> Sair da conta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function EasyHeader({
  logoSuffix,
  logoVariant = "dark",
  navLinks = [],
  ctaSlot,
  className,
  config,
  notifications
}: EasyHeaderProps & { notifications?: any[] }) {
  const { user, isReady } = useEgSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled ? "bg-[#0d1117]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"} ${className}`}>
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <a href="/" className="flex items-center gap-1.5 no-underline shrink-0">
          <Logo variant={logoVariant} width={108} />
          {/* Opcional: Só mostra o sufixo se a prop existir */}
          {logoSuffix && (
            <div className="flex items-center gap-1 font-mono text-sm">
              <span className="text-lg opacity-20">/</span>
              <span className="opacity-40">{logoSuffix}</span>
            </div>
          )}
        </a>

        {/* Navegação central com espaçamento corrigido */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ label, href }: { label: string, href: string }) => (
            <a key={href} href={href} className="text-sm text-white/55 no-underline transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* Lógica: Se logado, mostra Perfil + Sino. Se deslogado, mostra CTAs ativos */}
          {user ? (
            <HeaderUserMenu config={config} notifications={notifications} />
          ) : (
            isReady && ctaSlot
          )}
        </div>
      </div>
    </header>
  );
}