import type { SVGProps } from 'react'

export type PublicIconName =
  | 'administrative'
  | 'budget'
  | 'contracts'
  | 'expense'
  | 'financial'
  | 'glossary'
  | 'institutional'
  | 'lawyers'
  | 'lgpd'
  | 'patrimony'
  | 'reports'
  | 'revenue'
  | 'rooms'
  | 'societies'

type PublicIconProps = SVGProps<SVGSVGElement> & {
  name: PublicIconName
}

const iconPaths: Record<PublicIconName, React.ReactNode> = {
  administrative: (
    <>
      <path d="M4 20h16M6 17h12M7 8h10v9H7zM5 8l7-4 7 4" />
      <path d="M10 11v3m4-3v3" />
    </>
  ),
  budget: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10m3-8.2c-.7-.6-1.6-.9-3-.9-1.7 0-2.8.8-2.8 2s1.1 1.8 2.8 2c1.7.2 2.8.8 2.8 2s-1.1 2-2.8 2c-1.4 0-2.4-.3-3.2-1" />
    </>
  ),
  contracts: (
    <>
      <path d="M7 3h8l3 3v15H7z" />
      <path d="M15 3v4h4M10 11h5m-5 3h5m-5 3h3" />
    </>
  ),
  expense: (
    <>
      <path d="M4 7l5 5 4-4 7 7" />
      <path d="M15 15h5v-5" />
    </>
  ),
  financial: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v12m3-9c-.8-.7-1.8-1-3-1-1.7 0-3 .8-3 2s1.3 1.8 3 2 3 .8 3 2-1.3 2-3 2c-1.2 0-2.3-.4-3-1" />
    </>
  ),
  glossary: (
    <>
      <path d="M5 7h6M8 4v3m-2 5c2.5-1.1 4-2.8 4.7-5M6 9c.8 1.7 2 2.9 4 3.7M14 18l3-8 3 8m-5-3h4" />
    </>
  ),
  institutional: (
    <>
      <path d="M4 20h16M6 17h12M7 8h10v9H7zM5 8l7-4 7 4" />
      <path d="M10 11h4m-4 3h4" />
    </>
  ),
  lawyers: (
    <>
      <path d="M4 20h16M7 20v-7h10v7M9 13V8h6v5" />
      <path d="M12 4v4m-2-2h4" />
    </>
  ),
  lgpd: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M10 14l2 2 4-4" />
    </>
  ),
  patrimony: (
    <>
      <path d="M4 9l8-5 8 5v11H4z" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  reports: (
    <>
      <path d="M4 20h16M6 18v-5h3v5m2 0V9h3v9m2 0V5h3v13" />
      <path d="M6 10l4-3 3 1 6-5" />
    </>
  ),
  revenue: (
    <>
      <path d="M4 15l5-5 4 4 7-7" />
      <path d="M15 7h5v5" />
    </>
  ),
  rooms: (
    <>
      <path d="M6 3h12v18H6zM9 7h6M9 11h6" />
      <circle cx="14.5" cy="16" r=".5" />
    </>
  ),
  societies: (
    <>
      <path d="M5 21V5h10v16M15 10h4v11M8 8h1m3 0h1m-5 4h1m3 0h1m-5 4h1m3 0h1" />
    </>
  ),
}

export function PublicIcon({ name, ...props }: PublicIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  )
}
