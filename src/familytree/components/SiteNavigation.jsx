import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
export default function SiteNavigation() {
 const [open,setOpen]=useState(false); const ref=useRef(null), trigger=useRef(null); const id=useId(); const location=useLocation();
 useEffect(()=>setOpen(false),[location.pathname]);
 useEffect(()=>{
  if(!open)return;
  const outside=e=>{if(!ref.current?.contains(e.target))setOpen(false);};
  const escape=e=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open]);
 return <nav ref={ref} className="site-navigation" aria-label="Main navigation"><button ref={trigger} className="navigation-toggle" aria-label="Navigation menu" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>☰</button><div id={id} className={`navigation-links${open?' is-open':''}`}><NavLink to="/" end>Tree</NavLink><NavLink to="/gallery">Gallery</NavLink></div></nav>;
}
