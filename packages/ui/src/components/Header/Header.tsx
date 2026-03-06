"use client";

import { useEgSession, useSSOLogin } from "@easygoal/packages/auth/client";
import { BookOpen, ChevronDown, Lock, LogOut, Mail } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Logo } from "../Logo"; // Ajuste conforme seu projeto
// DEPOIS:
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
  // Configurações de Auth passadas via Props
  config: {
    ssoUrl: string;
    apiKey: string;
    docsUrl?: string;
    appUrl?: string; // URL do app principal para Settings
  };
}

// --- Componente Interno do Menu ---
function HeaderUserMenu({ config }: { config: EasyHeaderProps["config"] }) {
  const { user, isReady } = useEgSession();
  const { login, logout } = useSSOLogin({
    ssoUrl: config.ssoUrl,
    apiKey: config.apiKey,
    logoutPath: "/api/auth/signout",
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isReady) return <div className="w-8 h-8" />;

  if (!user) {
    return (
      <button
        onClick={login}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
      >
        Entrar
      </button>
    );
  }

  const isOAuthUser = user.provider && user.provider !== "email";
  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/5"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/20 overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} className="h-full w-full object-cover" alt="" />
          ) : (
            <span className="text-[10px] font-bold text-orange-500">{initials}</span>
          )}
        </div>
        <span className="hidden max-w-[120px] truncate font-medium sm:block text-white/90">
          {user.name?.split(" ")[0]}
        </span>
        <ChevronDown className={`h-4 w-4 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-white/10 bg-[#1e2536] p-1 shadow-xl">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-white/40">{user.email}</p>
          </div>

          <div className="pt-1">
            {!isOAuthUser ? (
              <>
                <Link href="/settings/email" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5" onClick={() => setIsOpen(false)}>
                  <Mail className="h-4 w-4 opacity-50" /> Alterar email
                </Link>
                <Link href="/settings/password" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5" onClick={() => setIsOpen(false)}>
                  <Lock className="h-4 w-4 opacity-50" /> Alterar senha
                </Link>
              </>
            ) : (
              <div className="px-3 py-2 text-[10px] font-bold uppercase text-white/20">via {user.provider}</div>
            )}

            <a href={config.docsUrl ?? "https://docs.easygoal.com.br"} target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5" onClick={() => setIsOpen(false)}>
              <BookOpen className="h-4 w-4 opacity-50" /> Documentação
            </a>
          </div>

          <div className="border-t border-white/5 mt-1 pt-1">
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-400/10">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Componente Principal ---
export function EasyHeader({
  logoSuffix,
  logoVariant = "dark",
  navLinks = [],
  ctaSlot,
  className,
  config
}: EasyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled ? "bg-[#0d1117]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"} ${className}`}>
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <a href="/" className="flex items-center gap-1.5 no-underline">
          <Logo variant={logoVariant} width={108} />
          {logoSuffix && (
            <div className="flex items-center gap-1 font-mono text-sm">
              <span className="text-lg opacity-20">/</span>
              <span className="opacity-40">{logoSuffix}</span>
            </div>
          )}
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map(({ label, href }) => (
            <a key={href} href={href} className="text-sm text-white/55 no-underline transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <HeaderUserMenu config={config} />
          {ctaSlot}
        </div>
      </div>
    </header>
  );
}