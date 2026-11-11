import type { SVGProps } from 'react'

export type PublicIconName =
  | 'budget'
  | 'expense'
  | 'lawyers'
  | 'patrimony'
  | 'revenue'
  | 'rooms'
  | 'societies'
  | 'subscribers'

type PublicIconProps = SVGProps<SVGSVGElement> & {
  name: PublicIconName
}

const iconPaths: Record<PublicIconName, React.ReactNode> = {
  budget: (
    <>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </>
  ),
  expense: (
    <>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </>
  ),
  lawyers: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
      <line x1="22" x2="22" y1="10" y2="16" />
    </>
  ),
  patrimony: (
    <>
      <path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <text
        fill="currentColor"
        fontSize="9"
        fontWeight="700"
        stroke="none"
        textAnchor="middle"
        x="12"
        y="18"
      >
        $
      </text>
    </>
  ),
  revenue: (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </>
  ),
  rooms: (
    <>
      <path d="M6 3h12v18H6z" />
      <path d="M4 21h16" />
      <circle cx="15" cy="12" r=".6" />
    </>
  ),
  societies: (
    <>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
    </>
  ),
  subscribers: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  )
}
