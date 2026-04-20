// src/main/components/SocialIcons.jsx

const SocialIcons = ({ className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <a href="https://ko-fi.com/zyshara" target="_blank" rel="noreferrer" className="opacity-25 hover:opacity-50 transition-opacity">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--text-heading)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3.5h13.5a1.5 1.5 0 0 1 1.5 1.5v10.5a5.5 5.5 0 0 1-5.5 5.5H7.5A5.5 5.5 0 0 1 2 15.5V5a1.5 1.5 0 0 1 1-1.5z"/>
        <path d="M18 7h2a3 3 0 0 1 0 6h-2"/>
        <g fill="var(--text-heading)" stroke="none" transform="translate(10, 12.5)">
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(60)"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(120)"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(180)"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(240)"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(300)"/>
          <circle cx="0" cy="0" r="0.75"/>
        </g>
      </svg>
    </a>
    <span className="text-[10px]" style={{ color: "var(--text-separator)" }}>|</span>
    <a href="https://instagram.com/zyshara" target="_blank" rel="noreferrer" className="opacity-25 hover:opacity-50 transition-opacity">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--text-heading)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="17.5" cy="6.5" r="1.2" fill="var(--text-heading)" stroke="none"/>
        <g fill="var(--text-heading)" stroke="none" transform="translate(12, 12.5)">
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(60)"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(120)"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(180)"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(240)"/>
          <ellipse cx="0" cy="-2.2" rx="0.9" ry="1.35" transform="rotate(300)"/>
          <circle cx="0" cy="0" r="0.75"/>
        </g>
      </svg>
    </a>
    <span className="text-[10px]" style={{ color: "var(--text-separator)" }}>|</span>
    <a href="https://steamcommunity.com/id/zyshara" target="_blank" rel="noreferrer" className="opacity-25 hover:opacity-50 transition-opacity">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--text-heading)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M15.5 7.5 L8.5 14.5" strokeWidth="3.2" strokeLinecap="round"/>
        <circle cx="7.5" cy="15.8" r="2.4"/>
        <circle cx="7.5" cy="15.8" r="1.0" fill="var(--text-heading)" stroke="none"/>
        <circle cx="15.8" cy="7.8" r="3.8"/>
        <g fill="var(--text-heading)" stroke="none" transform="translate(15.8, 7.8)">
          <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12"/>
          <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(60)"/>
          <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(120)"/>
          <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(180)"/>
          <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(240)"/>
          <ellipse cx="0" cy="-1.85" rx="0.76" ry="1.12" transform="rotate(300)"/>
          <circle cx="0" cy="0" r="0.64"/>
        </g>
      </svg>
    </a>
  </div>
);

export default SocialIcons;
