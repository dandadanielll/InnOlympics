export default function NavigatorLayout({ children }: { children: React.ReactNode }) {
  // Navigation is now handled by the global Sidebar component.
  return <>{children}</>
}
