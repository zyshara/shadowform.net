// src/main/components/Ticker.jsx
// Scrolling marquee that shows the current page name

const Ticker = ({ text = "shadowform" }) => {
  const repeated = Array(16).fill(`✦ ${text}`).join(" ");

  return (
    <div className="bg-[#0d0d0d] border-b border-[#1e1e1e] py-[7px] px-5 overflow-hidden whitespace-nowrap">
      <span
        className="inline-block font-alkhemikal text-[10px] text-[#444] tracking-[0.15em] whitespace-nowrap"
        style={{ animation: "marquee 18s linear infinite" }}
      >
        {repeated}
      </span>
    </div>
  );
};

export default Ticker;
