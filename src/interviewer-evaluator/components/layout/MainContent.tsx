"use client";

interface MainContentProps {
  children: React.ReactNode;
  isCollapsed?: boolean;
}

export function MainContent({
  children,
  isCollapsed = false,
}: MainContentProps): React.ReactNode {
  return (
    <main
      className="flex-1 flex flex-col min-h-screen transition-all duration-300"
      style={{
        marginLeft: isCollapsed ? "0" : "var(--sidebar-width)",
        background: "var(--color-background)",
      }}
    >
      {children}
    </main>
  );
}
