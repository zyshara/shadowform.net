// src/main/components/Footer.jsx

const Footer = () => (
  <footer
    className="px-7 py-[15px] flex items-center justify-center w-full height-[40px] left-0 bottom-0 lg:absolute"
  >
    {/* social links */}
    <div className="flex items-center gap-3">
      <a href="https://instagram.com/zyshara" target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-70 transition-opacity">
        <span className="font-alagard text-[12px] tracking-[0.15em]" style={{ color: "#ffffff" }}>instagram</span>
      </a>
      <span className="text-[10px]" style={{ color: "var(--text-separator)" }}>|</span>
      <a href="https://ko-fi.com/zyshara" target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-70 transition-opacity">
        <span className="font-alagard text-[12px] tracking-[0.15em]" style={{ color: "#ffffff" }}>kofi</span>
      </a>
      <span className="text-[10px]" style={{ color: "var(--text-separator)" }}>|</span>
      <a href="https://steamcommunity.com/id/zyshara" target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-70 transition-opacity">
        <span className="font-alagard text-[12px] tracking-[0.15em]" style={{ color: "#ffffff" }}>steam</span>
      </a>
    </div>
  </footer>
);

export default Footer;
