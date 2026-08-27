const CompassStar = ({ size = 40, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" aria-hidden="true">
    {/* Cardinal points */}
    <path d="M30 4 L33 27 L30 30 L27 27 Z" fill={color} opacity="0.9" />
    <path d="M56 30 L33 33 L30 30 L33 27 Z" fill={color} opacity="0.9" />
    <path d="M30 56 L27 33 L30 30 L33 33 Z" fill={color} opacity="0.9" />
    <path d="M4 30 L27 27 L30 30 L27 33 Z" fill={color} opacity="0.9" />
    {/* Intercardinal points */}
    <path d="M30 4 L33.5 25 L30 28 L26.5 25 Z" fill={color} opacity="0.35" transform="rotate(45 30 30)" />
    <path d="M56 30 L35 33.5 L32 30 L35 26.5 Z" fill={color} opacity="0.35" transform="rotate(45 30 30)" />
    <path d="M30 56 L26.5 35 L30 32 L33.5 35 Z" fill={color} opacity="0.35" transform="rotate(45 30 30)" />
    <path d="M4 30 L25 26.5 L28 30 L25 33.5 Z" fill={color} opacity="0.35" transform="rotate(45 30 30)" />
    <circle cx="30" cy="30" r="2.5" fill={color} />
    <circle cx="30" cy="30" r="6" stroke={color} strokeWidth="0.6" fill="none" opacity="0.35" />
  </svg>
);

export default CompassStar;
