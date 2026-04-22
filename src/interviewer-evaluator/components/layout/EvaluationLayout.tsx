"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface EvaluationLayoutProps {
  children: ReactNode;
}

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";
const DESKTOP_BREAKPOINT = 768;

export function EvaluationLayout({
  children,
}: EvaluationLayoutProps): React.ReactNode {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);

    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setSidebarCollapsed(stored === "true");
    } else {
      // Default: collapsed on mobile/tablet, visible on desktop
      setSidebarCollapsed(window.innerWidth < 1024);
    }
  }, []);

  // Persist sidebar state
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, mounted]);

  const toggleSidebar = useCallback((): void => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileMenu = useCallback((): void => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback((): void => {
    setIsMobileMenuOpen(false);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = (): void => {
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      if (desktop) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--color-background)" }}
    >
      <Navbar onMenuClick={toggleMobileMenu} showMenuButton={true} />

      <div
        className="flex flex-1 overflow-hidden"
        style={{ paddingTop: "var(--header-height)" }}
      >
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            showHeader={false}
            hasNavbar={true}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30 md:hidden"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                top: "var(--header-height)",
              }}
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            {/* Sidebar */}
            <div
              className="fixed left-0 z-40 md:hidden animate-slide-in"
              style={{
                width: "var(--sidebar-width)",
                top: "var(--header-height)",
                height: "calc(100vh - var(--header-height))",
              }}
            >
              <Sidebar
                isCollapsed={false}
                onToggle={closeMobileMenu}
                showHeader={false}
                hasNavbar={true}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <main
          className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        >
          {children}
        </main>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
