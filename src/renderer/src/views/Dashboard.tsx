import type { HTMLAttributes, ReactNode } from 'react'

interface DashboardProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: ReactNode
  isDraggingFiles?: boolean
}

export function Dashboard({
  children,
  isDraggingFiles = false,
  className = '',
  ...props
}: DashboardProps) {
  return (
    <section
      className={`reference-dashboard${isDraggingFiles ? ' dragging-files' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </section>
  )
}
