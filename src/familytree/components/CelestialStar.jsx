import { useId } from "react";
export default function CelestialStar({ small = false }) {
  const id = useId();
  return <svg className={small ? "celestial-star small" : "celestial-star"} viewBox="0 0 47 52" fill="none" aria-hidden="true">
    <defs>
      <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.25"/></filter>
      <g id={`${id}-shape`}>
        <path d="M23.5 11.1 25.1 21.7 23.5 24.7 21.9 21.7Z"/>
        <path d="M23.5 40.6 21.9 30.0 23.5 27.0 25.1 30.0Z"/>
        <path d="M8.6 25.9 19.4 24.3 22.5 25.9 19.4 27.5Z"/>
        <path d="M38.4 25.9 27.6 27.5 24.5 25.9 27.6 24.3Z"/>
        <path d="M16.9 19.3 21.2 22.1 22.6 24.3 20.3 23.0Z" opacity=".75"/>
        <path d="M30.1 19.3 26.7 23.0 24.4 24.3 25.8 22.1Z" opacity=".75"/>
        <path d="M16.9 32.5 20.3 28.8 22.6 27.5 21.2 29.7Z" opacity=".75"/>
        <path d="M30.1 32.5 25.8 29.7 24.4 27.5 26.7 28.8Z" opacity=".75"/>
        <circle cx="23.5" cy="25.9" r="3.25" fill="#171421" stroke="#C48CCF" strokeWidth="1.1"/>
        <circle cx="23.5" cy="7.3" r=".95"/><circle cx="23.5" cy="44.5" r=".95"/>
      </g>
    </defs>
    <use href={`#${id}-shape`} fill="#C48CCF" opacity=".65" filter={`url(#${id}-glow)`}/>
    <use href={`#${id}-shape`} fill="#BE8AC9"/>
  </svg>;
}

