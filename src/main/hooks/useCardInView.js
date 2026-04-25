// src/main/hooks/useCardInView.js
// Mobile-only scroll highlight — tracks which card's top edge most recently
// passed the viewport centre and marks it active. Module-level state acts as
// a singleton so all card registries on a given page share one scroll listener.

import { useRef, useState, useEffect } from "react";

const _registry = new Map(); // id -> { setActive, getEl }
let _activeId   = null;

const _activate = (id) => {
  if (_activeId === id) return;
  if (_activeId !== null) _registry.get(_activeId)?.setActive(false);
  _activeId = id;
  _registry.get(id)?.setActive(true);
};

const _onScroll = () => {
  if (!window.matchMedia("(max-width: 640px)").matches) return;
  const centerY = window.innerHeight * 0.5;
  let bestId  = null;
  let bestTop = -Infinity;
  for (const [id, { getEl }] of _registry) {
    const el = getEl();
    if (!el) continue;
    const { top } = el.getBoundingClientRect();
    if (top <= centerY && top > bestTop) { bestTop = top; bestId = id; }
  }
  if (bestId) _activate(bestId);
};

export const useCardInView = (id) => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    _registry.set(id, { setActive, getEl: () => ref.current });
    window.addEventListener("scroll", _onScroll, { passive: true });
    _onScroll();
    return () => {
      _registry.delete(id);
      if (_activeId === id) { _activeId = null; setActive(false); }
      if (_registry.size === 0) window.removeEventListener("scroll", _onScroll);
    };
  }, [id]);

  return { ref, active };
};
