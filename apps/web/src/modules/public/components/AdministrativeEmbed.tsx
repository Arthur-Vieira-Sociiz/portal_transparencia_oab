export const ADMINISTRATIVE_EMBED_URL = 'https://oab-transparencia.netlify.app'

type AdministrativeEmbedProps = {
  src?: string
}

export function AdministrativeEmbed({
  src = ADMINISTRATIVE_EMBED_URL,
}: AdministrativeEmbedProps = {}) {
  return (
    <iframe
      className="administrative-embed__frame"
      height="800"
      src={src}
      style={{ border: 'none' }}
      title="Quantitativo administrativo de inscritos da OAB-AL"
      width="100%"
    />
  )
}
