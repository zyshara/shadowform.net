// src/main/components/Modal.jsx
// Generic fullscreen overlay modal.
// Closes on Escape key or clicking the backdrop.
// Compose the interior freely via children.

import { useEffect } from "react";

const Modal = ({ onClose, children, maxWidth = 520 }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        background:      "rgba(6,3,9,.88)",
        zIndex:          50,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background:     "var(--bg)",
          border:         "1px solid var(--border-soft)",
          borderRadius:   4,
          width:          "100%",
          maxWidth,
          display:        "flex",
          flexDirection:  "column",
          overflow:       "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
