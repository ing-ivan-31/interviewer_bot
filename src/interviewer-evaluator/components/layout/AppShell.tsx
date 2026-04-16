"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps): React.ReactNode {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = (): void => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-background)" }}>
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggleSidebar} />
      <MainContent isCollapsed={isSidebarCollapsed}>{children}</MainContent>
    </div>
  );
}
