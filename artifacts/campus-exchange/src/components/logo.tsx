export function PredicLogo({ size = 32 }: { size?: number }) {
  const id = "lg";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f0c29" />
          <stop offset="50%" stopColor="#302b63" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={`${id}bar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx="10" fill={`url(#${id}bg)`} />

      {/* Bar 1 (shortest) */}
      <rect x="7" y="24" width="5" height="9" rx="1.5" fill={`url(#${id}bar)`} opacity="0.6" />
      {/* Bar 2 (medium) */}
      <rect x="14" y="19" width="5" height="14" rx="1.5" fill={`url(#${id}bar)`} opacity="0.8" />
      {/* Bar 3 (tallest) */}
      <rect x="21" y="13" width="5" height="20" rx="1.5" fill={`url(#${id}bar)`} />

      {/* Arrow shaft */}
      <path
        d="M29.5 7 L35 7"
        stroke="#f0abfc"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arrow up */}
      <path
        d="M29.5 7 L29.5 12.5"
        stroke="#f0abfc"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arrow head pointing up-right */}
      <path
        d="M30 7 L35 7 L35 12"
        stroke="#f0abfc"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
