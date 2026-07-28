// src/main/components/VoidFrame.jsx
// Umbral wisps portrait frame — experimental, adapted from a standalone HTML mock.

import { useEffect, useRef, useState } from "react";

const VERT_SRC = `#version 300 es
  const vec2 pos[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  void main() { gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0); }`;

const FRAG_SRC = `#version 300 es
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  out vec4 fragColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      total += amp * noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return total;
  }
  void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec2 p = uv;
    p.x *= uRes.x / uRes.y;

    float speed = 0.045;
    float detail = 3.2;
    float force = 0.9;
    float shift = 0.5;

    vec2 flow = vec2(p.x, p.y - uTime * speed) * detail;
    float ns_a = fbm(flow);
    float ns_b = force * fbm(flow + ns_a + uTime * 0.5) - shift;
    float ins = fbm(vec2(ns_b, ns_a));
    float smoke = clamp(ins + shift, 0.0, 1.0);

    float edgeJitter = (ns_a - 0.5) * 0.35;
    float fadeLow = 0.12 + edgeJitter;
    float fadeHigh = 0.70 + edgeJitter;
    float verticalFade = 1.0 - smoothstep(fadeLow, fadeHigh, uv.y);

    vec3 deep = vec3(0.043, 0.027, 0.09);
    vec3 mid  = vec3(0.28, 0.12, 0.42);
    vec3 hi   = vec3(0.94, 0.63, 0.75);

    vec3 color = mix(deep, mid, smoke);
    color = mix(color, hi, pow(smoke, 3.0) * 0.6);

    float topThreshold = mix(0.35, 0.92, clamp(uv.y, 0.0, 1.0));
    float alpha = smoothstep(topThreshold, 0.97, smoke) * 0.9 * verticalFade;
    fragColor = vec4(color, alpha);
  }`;

const VoidFrame = ({ size = 180, children }) => {
  const canvasRef = useRef(null);
  const [debugMsg, setDebugMsg] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const showDebug = (msg) => {
      console.error("[void-frame smoke]", msg);
      setDebugMsg(msg);
    };

    let gl;
    try {
      gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    } catch (e) {
      showDebug("getContext threw: " + e.message);
      return;
    }
    if (!gl) {
      showDebug('getContext("webgl2") returned null — WebGL2 unsupported or blocked here');
      return;
    }

    const compile = (type, src, label) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        showDebug(label + " shader compile error: " + gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC, "vertex");
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC, "fragment");
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      showDebug("program link error: " + gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uRes = gl.getUniformLocation(program, "uRes");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const start = Date.now();
    let rafId;
    const frame = () => {
      resize();
      gl.uniform1f(uTime, (Date.now() - start) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(frame);
    };
    frame();

    console.log("[void-frame smoke] WebGL2 initialized OK, rendering.");

    return () => {
      cancelAnimationFrame(rafId);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="void-frame flex-shrink-0" style={{ width: size, height: size }}>
      <style>{`
        .void-frame { position: relative; }

        .void-frame .avatar {
          position: absolute; inset: 0; z-index: 3;
          border-radius: 0px;
          overflow: hidden;
          opacity: 0.7;
          box-shadow: inset 0 0 0 3px #0b0910;
        }
        .void-frame .avatar img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        .void-frame .void-glow {
          position: absolute; inset: -26px; z-index: 1;
          background: radial-gradient(circle, #6b2fa3 0%, transparent 70%);
          filter: blur(16px); opacity: 0.55;
          animation: void-pulse 4s ease-in-out infinite;
        }

        .void-frame .void-frame-svg {
          position: absolute; inset: 0; z-index: 2; overflow: visible;
          filter: drop-shadow(0px 0px 8px rgba(255,255,255,0.06));
        }

        .void-frame .voidmote {
          position: absolute; width: 5px; height: 5px; border-radius: 50%; z-index: 4;
          background: #bfa0da; box-shadow: 0 0 6px 2px #502578;
          animation: void-inpull 3s ease-in infinite;
        }

        .void-frame .smoke-canvas {
          position: absolute; inset: 0; z-index: 5; width: 100%; height: 100%;
          opacity: 0.6; pointer-events: none;
        }

        .void-frame .gl-debug {
          position: absolute; z-index: 9; bottom: 2px; left: 2px; right: 2px;
          font: 9px/1.3 monospace; color: #ff8a8a; background: rgba(0,0,0,0.6);
          padding: 3px 5px; border-radius: 3px; pointer-events: none;
          word-break: break-word;
        }

        @keyframes void-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.94); }
          50% { opacity: 0.65; transform: scale(1.05); }
        }
        @keyframes void-inpull {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          15% { opacity: 1; }
          88% { opacity: 0.7; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.15); opacity: 0; }
        }
      `}</style>

      <div className="void-glow" />

      <svg className="void-frame-svg" viewBox="0 0 180 180">
        <defs>
          <filter id="void-frame-jag" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="noise">
              <animate attributeName="baseFrequency" values="0.05;0.06;0.05" dur="7s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="17" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <rect x="-9" y="-9" width="198" height="198" fill="#050308" filter="url(#void-frame-jag)" />
      </svg>

      <div className="voidmote" style={{ top: "-8px", left: "40px", "--dx": "50px", "--dy": "98px", animationDelay: "0s" }} />
      <div className="voidmote" style={{ top: "30px", left: "196px", "--dx": "-106px", "--dy": "60px", animationDelay: "-0.5s" }} />
      <div className="voidmote" style={{ top: "190px", left: "130px", "--dx": "-40px", "--dy": "-100px", animationDelay: "-1s" }} />
      <div className="voidmote" style={{ top: "150px", left: "-10px", "--dx": "100px", "--dy": "-60px", animationDelay: "-1.5s" }} />
      <div className="voidmote" style={{ top: "-6px", left: "150px", "--dx": "-60px", "--dy": "96px", animationDelay: "-2s" }} />
      <div className="voidmote" style={{ top: "170px", left: "20px", "--dx": "70px", "--dy": "-80px", animationDelay: "-2.5s" }} />

      <div className="avatar">{children}</div>
      <canvas ref={canvasRef} className="smoke-canvas" />
      {debugMsg && <div className="gl-debug">{`WebGL2: ${debugMsg}`}</div>}
    </div>
  );
};

export default VoidFrame;
