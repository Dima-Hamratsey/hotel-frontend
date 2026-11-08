/** Логотип: гори під вечірньою зорею. */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#14213d" />
      <path d="M8 48 L25 24 L33 35 L40 27 L56 48 Z" fill="#c9a24b" />
      <path d="M25 24 L29.5 30.5 L25 29 L21 31 Z" fill="#f3e2b3" />
      <circle cx="46" cy="16" r="5" fill="#f3e2b3" />
    </svg>
  );
}
