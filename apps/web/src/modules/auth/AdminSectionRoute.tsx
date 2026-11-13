import { useParams } from 'react-router-dom'
import { AdminSectionPlaceholderPage } from './AdminSectionPlaceholderPage'

export function AdminSectionRoute() {
  const { section = 'dashboard' } = useParams()
  return <AdminSectionPlaceholderPage section={section} />
}
