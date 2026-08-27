import cherryBlossom from "@shared/assets/images/cherry_blossom.png";

const PoweredByLogo = () => (
  <a
    href="https://shadowform.net"
    target="_blank"
    rel="noopener noreferrer"
    style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "4px", textDecoration: "none" }}
  >
    <img
      alt=""
      src={cherryBlossom}
      style={{
        width: "20px",
        filter: "drop-shadow(0 0 6px var(--powered-by-glow, #f4b2e0))",
        transform: "rotate(18deg)",
      }}
    />
    <span
      style={{
        fontFamily: "'Alagard', monospace",
        letterSpacing: "3px",
        color: "#ffffff",
        textShadow:
          "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000," +
          "0 0 6px var(--powered-by-glow, #f4b2e0), 0 0 12px var(--powered-by-glow, #f4b2e0)",
      }}
    >
      <span style={{ letterSpacing: "1px", fontSize: "8px", textShadow: "none", display: "block" }}>
        powered by
      </span>
      <span style={{ fontSize: "11px", display: "block" }}>
        shadowform.net
      </span>
    </span>
  </a>
);

export default PoweredByLogo;
