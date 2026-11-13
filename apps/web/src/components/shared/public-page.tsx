import type { ComponentProps, ReactNode } from 'react'
import type { TransparencyDocument } from '@oab-transparencia/contracts'
import { cn } from '@/lib/utils'

type PublicPageStateProps = {
  children: ReactNode
  kind?: 'loading' | 'error' | 'empty'
}

export function PublicPageState({
  children,
  kind = 'loading',
}: PublicPageStateProps) {
  return (
    <p
      className={cn('public-page-state', `public-page-state--${kind}`)}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  )
}

type PublicSectionHeaderProps = {
  description?: ReactNode
  id: string
  title: string
}

export function PublicSectionHeader({
  description,
  id,
  title,
}: PublicSectionHeaderProps) {
  return (
    <header className="public-section-header">
      <h2 className="public-section-title" id={id}>
        {title}
      </h2>
      {description ? (
        <div className="public-section-header__description">{description}</div>
      ) : null}
    </header>
  )
}

export function PublicFilters({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('public-filters', className)} {...props} />
}

type PublicSelectFieldProps = ComponentProps<'select'> & {
  containerClassName?: string
  label: string
}

export function PublicSelectField({
  children,
  className,
  containerClassName,
  id,
  label,
  ...props
}: PublicSelectFieldProps) {
  return (
    <label className={cn('public-filter', containerClassName)} htmlFor={id}>
      <span>{label}</span>
      <select
        className={cn('public-filter__select', className)}
        id={id}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5M12 15V3" />
    </svg>
  )
}

type PublicDownloadLinkProps = {
  className?: string
  document: TransparencyDocument
}

export function PublicDownloadLink({
  className,
  document,
}: PublicDownloadLinkProps) {
  return (
    <a
      className={cn('public-download-link', className)}
      href={document.url}
      rel="noreferrer"
      target="_blank"
    >
      <DownloadIcon />
      {document.title}
    </a>
  )
}

export function PublicTableScroll({
  className,
  ...props
}: ComponentProps<'div'>) {
  return <div className={cn('public-table-scroll', className)} {...props} />
}
