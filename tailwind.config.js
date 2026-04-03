export default {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        alagard:    ["Alagard", "cursive"],
        alkhemikal: ["Alkhemikal", "monospace"],
        fell:       ['"IM Fell English"', "serif"],
        "8bit":     ['"8-BIT-WONDER"', "monospace"],
      },
      colors: {
        sf: {
          // backgrounds
          void:       "#0a0a0a",
          pitch:      "#0d0d0d",
          ink:        "#111111",
          // borders
          stone:      "#222222",
          ember:      "#1e1e1e",
          ash:        "#333333",
          // text scale
          smoke:      "#444444",
          dim:        "#555555",
          ghost:      "#888888",
          mist:       "#aaaaaa",
          bone:       "#f0f0f0",
          // pink accent
          "pink-bg":      "#1a0d14",
          "pink-border":  "#4a1f38",
          "pink-text":    "#f4a7c3",
          "pink-glow":    "#f4a7c344",
        },
      },
      animation: {
        marquee: "marquee 18s linear infinite",
        "marquee-slow": "marquee 28s linear infinite",
        "hue-rotate-text": "hue-rotate-text 100ms linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0%)" },
          to:   { transform: "translateX(-50%)" },
        },
        "hue-rotate-text": {
          "0%":   { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(360deg)" },
        },
      },
      dropShadow: {
        pink:     "0 0 6px #f4a7c344",
        "pink-lg": "0 0 12px #f4a7c366",
      },
    },
  },
  plugins: [],
};
