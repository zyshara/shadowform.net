// src/domeofdoom/components/ParallaxHero.jsx
//
// Full-width layered parallax background. Layers are stacked back-to-front
// (index 0 farthest) and each gets a "lag" — how much it's held back from
// the page's normal 1x scroll speed. A far layer needs a lag close to 1 so
// it nearly cancels out the container's own scroll motion and appears to
// hang back in the distance; a near layer needs a lag close to 0 so it
// keeps pace with the page and reads as close to the viewer.
//
// Each layer is sized taller than its container (and anchored to the
// bottom) so there's real image to slide into view as it translates down —
// a layer sized to exactly fill the container has nothing behind it, so it
// just opens an empty gap at the top the moment it moves, which reads as
// the layer abruptly vanishing rather than drifting.

import { useEffect, useRef } from "react";

// Caps how much scroll counts toward the effect — past this the hero has
// already scrolled out of view, so there's no reason to keep translating
// layers further (and it keeps the max offset small enough to stay inside
// each layer's buffer height).
const MAX_SCROLL_PX = 500;

const LAYERS = [
  { src: "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785392409/layer_0_d90b3fc4c6.png", lag: 0.3 },
  { src: "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785392409/layer_1_697dae5646.png", lag: 0.22 },
  { src: "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785392409/layer_2_cd79c9fe2f.png", lag: 0.14 },
  { src: "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1785392414/layer_3_116d508229.png", lag: 0.06 },
];

const ParallaxHero = () => {
  const layerRefs = useRef([]);

  // Polls scrollY every frame instead of listening for "scroll" — scroll
  // events aren't guaranteed to fire on every scroll update in every browser
  // (some mobile browsers throttle/skip them during momentum scrolling), so
  // reading the value directly each frame is more robust than event-driven.
  useEffect(() => {
    let frameId;

    const tick = () => {
      const y = Math.min(window.scrollY, MAX_SCROLL_PX);
      LAYERS.forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (el) el.style.transform = `translate3d(0, ${y * layer.lag}px, 0)`;
      });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden lg:mb-[-400px]">
      {LAYERS.map((layer, i) => (
        <img
          key={layer.src}
          ref={(el) => (layerRefs.current[i] = el)}
          src={layer.src}
          alt=""
          className="absolute inset-x-0 bottom-0 h-[135%] w-full object-cover object-bottom will-change-transform"
        />
      ))}
    </div>
  );
};

export default ParallaxHero;
