import React, { useEffect, useRef, useState } from "react";

const PixelArt = ({ src }) => {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const animRef = useRef(null);

  const drawPixelated = (ctx, img, pixelSize, grayscale) => {
    const { width, height } = canvasRef.current;
    // draw small then scale up
    const offscreen = document.createElement("canvas");
    const block = Math.max(1, Math.round(pixelSize));
    offscreen.width = Math.ceil(width / block);
    offscreen.height = Math.ceil(height / block);
    const offCtx = offscreen.getContext("2d");
    offCtx.filter = `grayscale(${grayscale})`;
    offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, width, height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const duration = 600;
      const start = performance.now();
      const startPixel = hovered ? 7 : 1;
      const endPixel = hovered ? 1 : 7;
      const startGray = hovered ? 1 : 0;
      const endGray = hovered ? 0 : 1;

      cancelAnimationFrame(animRef.current);

      const animate = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease in-out
        const pixel = startPixel + (endPixel - startPixel) * eased;
        const gray = startGray + (endGray - startGray) * eased;
        drawPixelated(ctx, img, pixel, gray);
        if (t < 1) animRef.current = requestAnimationFrame(animate);
      };

      animRef.current = requestAnimationFrame(animate);
    };
  }, [hovered, src]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={220}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", display: "block" }}
    />
  );
};

export default PixelArt;
