import logoUrl from '../assets/logo-96.png';

/** MargDisha mark: a 3D student walking the road towards the rising sun. */
export function Logo({ size = 38 }: { size?: number }) {
  return <img src={logoUrl} width={size} height={size} alt="" aria-hidden="true" className="logo" />;
}
