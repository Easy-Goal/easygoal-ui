"use client";

import { useEgSession, useSSOLogin } from "@easygoal/packages/auth/client";
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Logo } from "../Logo";
import { NotificationBell } from "./NotificationBell";

// --- Interfaces ---
export interface HeaderNavLink {
  label: string;
  href: string;
}

export interface EasyHeaderProps {
  logoSuffix?: string;
  logoVariant?: "dark" | "light";
  navLinks?: HeaderNavLink[];
  ctaSlot?: React.ReactNode;
  className?: string;
  config: {
    ssoUrl: string;
    apiKey: string;
    docsUrl?: string;
    appUrl?: string; // URL do app principal para redirecionamentos centralizados
  };
  notifications?: any[];
}

// --- Componente Interno do Menu do Usuário ---
function HeaderUserMenu({ config, notifications }: {
  config: EasyHeaderProps["config"],
  notifications?: any[]
}) {
  const { user, isReady } = useEgSession();
  const { logout } = useSSOLogin({
    ssoUrl: config.ssoUrl,
    apiKey: config.apiKey,
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper para links absolutos
  const getAppUrl = (path: string) => {
    const baseUrl = config.appUrl || "https://app.easygoal.com.br";
    return `${baseUrl}${path}`;
  };

  if (!isReady || !user) return null;

  return (
    <div className="flex items-center gap-4">
      {/* Notificações Globais */}
      <NotificationBell
        notifications={notifications}
        allNotificationsUrl={getAppUrl("/notifications")}
      />

      <div ref={containerRef} className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-2 py-1.5 transition-colors hover:bg-white/5 rounded-lg">
          <div className="h-8 w-8 rounded-full border border-orange-500/20 bg-orange-500/10 overflow-hidden shrink-0">
            <img src={user.avatarUrl ?? ""} className="h-full w-full object-cover" alt="" />
          </div>
          <span className="hidden sm:block text-white/90 text-sm font-medium">{user.name?.split(" ")[0]}</span>
          <ChevronDown className="h-4 w-4 text-white/30" />
        </button>

        {isOpen && (
          /* CORREÇÃO DE TRANSPARÊNCIA: Adicionado bg sólido e shadow pesado */
          <div className="absolute right-0 top-full z-[100] mt-2 w-64 rounded-xl border border-white/10 bg-[#1e2536] p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
            <div className="px-3 py-3 border-b border-white/5">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-[11px] text-white/40">{user.email}</p>
            </div>

            <div className="py-1">
              <a href={getAppUrl("/dashboard")} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5">
                <LayoutDashboard className="h-4 w-4 opacity-50" /> Painel Principal
              </a>
              <a href={getAppUrl("/settings/profile")} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5">
                <Settings className="h-4 w-4 opacity-50" /> Editar Perfil
              </a>
              <a href={config.docsUrl || "https://docs.easygoal.com.br"} target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5">
                <BookOpen className="h-4 w-4 opacity-50" /> Documentação
              </a>
            </div>

            <div className="border-t border-white/5 pt-1">
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-400/10">
                <LogOut className="h-4 w-4" /> Sair da conta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// --- Componente Principal EasyHeader ---
export function EasyHeader({
  logoSuffix,
  logoVariant = "dark",
  navLinks = [],
  ctaSlot,
  className,
  config,
  notifications
}: EasyHeaderProps) {
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
          {/* Lógica de sufixo opcional - só renderiza se existir */}
          {logoSuffix && (
            <div className="flex items-center gap-1 font-mono text-sm">
              <span className="text-lg opacity-20">/</span>
              <span className="opacity-40">{logoSuffix}</span>
            </div>
          )}
        </a>

        {/* Navegação centralizada com espaçamento corrigido (gap-8) */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ label, href }) => (
            <a key={href} href={href} className="text-sm text-white/55 no-underline transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* Lógica: Se logado, mostra Perfil + Sino. Se deslogado, mostra CTAs ativos via Slot */}
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