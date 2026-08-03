import type { ReactNode } from 'react'
import { TopBar } from './TopBar'

export function PageShell({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      <TopBar title={title} />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="hidden lg:block">
            <h1 className="text-[26px] font-semibold tracking-tight">{title}</h1>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          {action ? <div className="ml-auto">{action}</div> : null}
        </div>
        {children}
      </main>
    </>
  )
}
