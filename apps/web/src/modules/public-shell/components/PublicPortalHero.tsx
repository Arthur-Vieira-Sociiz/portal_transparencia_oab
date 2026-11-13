import oabAlagoasLogo from '../../../assets/Oab_alagoas_banner_azul.png'
import portalTitle from '../../../assets/Portal da Transparência_Banner_azul.png'

export function PublicPortalHero() {
  return (
    <header className="public-hero">
      <span
        aria-hidden="true"
        className="public-hero__orbit public-hero__orbit--top"
      />
      <span
        aria-hidden="true"
        className="public-hero__orbit public-hero__orbit--bottom"
      />
      <img
        alt="Portal da Transparência"
        className="public-hero__title"
        height="48"
        src={portalTitle}
        width="163"
      />
      <img
        alt="OAB Alagoas"
        className="public-hero__logo"
        height="41"
        src={oabAlagoasLogo}
        width="78"
      />
    </header>
  )
}
