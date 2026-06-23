import type { PropsWithChildren, ReactNode } from 'react'

interface AppShellProps extends PropsWithChildren {
  header?: ReactNode
  className?: string
}

export function AppShell({ children, className = '', header }: AppShellProps) {
  return (
    <main className={`min-h-screen bg-transparent px-4 py-6 md:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
        {header}
        {children}
      </div>
    </main>
  )
}
