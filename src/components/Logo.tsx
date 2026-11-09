import logoUrl from '../assets/logo.svg';

/** MargDisha mark: a person walking a road towards the rising sun (path + direction). */
export function Logo({ size = 36 }: { size?: number }) {
  return <img src={logoUrl} width={size} height={size} alt="" aria-hidden="true" className="logo" />;
}
