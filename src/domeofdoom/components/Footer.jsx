// src/domeofdoom/components/Footer.jsx

import { Link } from "react-router-dom";
import { LOGO_URL } from "@/tokens";

const FooterColumn = ({ title, children }) => (
  <div>
    <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">{title}</div>
    <div className="flex flex-col gap-2.5 text-[14px] font-semibold">{children}</div>
  </div>
);

const linkClass = "transition-colors hover:text-[var(--dod-accent)]";

const Footer = () => (
  <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 border-t border-white/10 px-10 py-[50px] sm:grid-cols-4">
    <div className="col-span-2 sm:col-span-1">
      <img src={LOGO_URL} alt="Dome of Doom" className="mb-3.5 h-11 w-auto" />
      <div className="max-w-[220px] text-[13px] leading-relaxed text-white/45">
        © DOMEOFDOOM 2026, All Rights Reserved
      </div>
      <div className="max-w-[220px] text-[13px] leading-relaxed text-white/45">
        Powered By Shadowform
      </div>
    </div>

    <FooterColumn title="Label">
      <Link to="/" className={linkClass}>Home</Link>
      <Link to="/about" className={linkClass}>About</Link>
      <Link to="/discography" className={linkClass}>Discography</Link>
      <Link to="/roster" className={linkClass}>Roster</Link>
    </FooterColumn>

    <FooterColumn title="More">
      <Link to="/shows" className={linkClass}>Shows</Link>
      <Link to="/merch" className={linkClass}>Merch</Link>
      <Link to="/contact" className={linkClass}>Contact</Link>
    </FooterColumn>

    <FooterColumn title="Follow">
      <a href="https://domeofdoom.bandcamp.com" target="_blank" rel="noreferrer" className={linkClass}>Bandcamp</a>
      <a href="https://www.instagram.com/domeofdoom" target="_blank" rel="noreferrer" className={linkClass}>Instagram</a>
      <a href="https://x.com/domeofdoom" target="_blank" rel="noreferrer" className={linkClass}>X</a>
      <a href="https://www.youtube.com/domeofdoomrecords" target="_blank" rel="noreferrer" className={linkClass}>YouTube</a>
    </FooterColumn>
  </div>
);

export default Footer;
