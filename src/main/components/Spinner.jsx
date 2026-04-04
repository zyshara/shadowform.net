// src/main/components/Spinner.jsx

const FlowerSVG = ({ size, color }) => (
  <svg
    width={size}
    height={size}
    viewBox="-1 -1 2 2"
    style={{
      color,
      animation: "flowerBreathe 2.4s ease-in-out infinite",
      transformOrigin: "50% 50%",
      flexShrink: 0,
    }}
  >
    <g fill="currentColor">
      <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" />
      <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="rotate(60)"  />
      <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="rotate(120)" />
      <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="rotate(180)" />
      <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="rotate(240)" />
      <ellipse cx="0" cy="-0.52" rx="0.22" ry="0.32" transform="rotate(300)" />
      <circle cx="0" cy="0" r="0.18" />
    </g>
  </svg>
);

const Spinner = ({
  text = "loading...",
  size = 52,
  color = "var(--pink-text)",
}) => {
  return (
    <>
      <style>{`
        @keyframes flowerBreathe {
          0%   { transform: rotate(0deg); }
          45%  { transform: rotate(180deg); }
          55%  { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="flex flex-col items-center justify-center gap-3">
        <FlowerSVG size={size} color={color} />

        {text && (
          <span
            className="font-alagard lowercase tracking-[3px] text-[13px]"
            style={{ color: "var(--text-nav-inactive)" }}
          >
            {text}
          </span>
        )}
      </div>
    </>
  );
};

export default Spinner;
