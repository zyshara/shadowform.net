// src/main/components/Ticker.jsx

const Ticker = ({ text = "shadowform" }) => {
  const repeated = Array(16).fill(`✦ ${text}`).join(" ");

  return (
    <div
      className="border-b py-[7px] px-5 overflow-hidden whitespace-nowrap"
      style={{
        background:   "var(--bg-ticker)",
        borderColor:  "var(--border-soft)",
      }}
    >
      <span
        className="inline-block font-alkhemikal text-[10px] tracking-[0.15em] whitespace-nowrap"
        style={{
          color:     "var(--text-ticker)",
          animation: "marquee 18s linear infinite",
        }}
      >
        {repeated}
      </span>
    </div>
  );
};

export default Ticker;
