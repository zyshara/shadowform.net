export default function FadeIn({ children, duration = 350, className = "", style = {} }) {
  return <div className={className} style={{ animation: `sf-page-reveal ${duration}ms ease-out`, ...style }}>{children}</div>;
}
