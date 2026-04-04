// src/main/pages/NotFound.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LINES = [
  { text: "A fatal exception 404 has occurred at 0028:C0034B53 in VXD", hi: false },
  { text: "ROUTER(01) + 00000404. The current page will be terminated.", hi: false },
  { text: "", hi: false },
  { text: "*  Press any key to terminate the current application.", hi: false },
  { text: "*  Press [CTRL]+[ALT]+[DEL] to restart your browser. You will", hi: false },
  { text: "   lose any unsaved information in all applications.", hi: false },
  { text: "", hi: false },
  { text: "stop code:  PAGE_NOT_FOUND", hi: true },
  { text: "error:      0x00000404 — route not registered", hi: true },
  { text: "", hi: false },
  { text: "press any key to continue _", hi: "accent" },
];

const CHAR_DELAY  = 14;   // ms per character
const LINE_PAUSE  = 70;   // ms pause between lines
const DIALOG_WAIT = 600;  // ms after all lines before dialog appears

const NotFound = () => {
  const navigate = useNavigate();

  // which lines have fully typed, and current line partial text
  const [doneLines,   setDoneLines]   = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [showDialog,  setShowDialog]  = useState(false);
  const [dialogDone,  setDialogDone]  = useState(false);

  useEffect(() => {
    if (currentLine >= LINES.length) {
      setTimeout(() => setShowDialog(true), DIALOG_WAIT);
      return;
    }

    const line = LINES[currentLine];

    // empty line — just push it immediately then pause
    if (line.text === "") {
      const t = setTimeout(() => {
        setDoneLines((prev) => [...prev, { text: "", hi: false }]);
        setCurrentLine((l) => l + 1);
        setCurrentText("");
      }, LINE_PAUSE);
      return () => clearTimeout(t);
    }

    // if we've finished typing this line
    if (currentText.length === line.text.length) {
      const t = setTimeout(() => {
        setDoneLines((prev) => [...prev, line]);
        setCurrentLine((l) => l + 1);
        setCurrentText("");
      }, LINE_PAUSE);
      return () => clearTimeout(t);
    }

    // type next character
    const t = setTimeout(() => {
      setCurrentText(line.text.slice(0, currentText.length + 1));
    }, CHAR_DELAY);
    return () => clearTimeout(t);
  }, [currentLine, currentText]);

  // dialog typewriter
  const dialogLines = [
    "This page does not exist or has been moved.",
    "Error: 0x00000404  PAGE_NOT_FOUND",
  ];
  const [dlDone,   setDlDone]   = useState([]);
  const [dlLine,   setDlLine]   = useState(0);
  const [dlText,   setDlText]   = useState("");

  useEffect(() => {
    if (!showDialog) return;
    if (dlLine >= dialogLines.length) { setDialogDone(true); return; }

    const line = dialogLines[dlLine];
    if (dlText.length === line.length) {
      const t = setTimeout(() => {
        setDlDone((p) => [...p, line]);
        setDlLine((l) => l + 1);
        setDlText("");
      }, LINE_PAUSE);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setDlText(line.slice(0, dlText.length + 1));
    }, CHAR_DELAY);
    return () => clearTimeout(t);
  }, [showDialog, dlLine, dlText]);

  const renderLine = (line, i) => {
    const color = line.hi === "accent"
      ? "var(--pink-text)"
      : line.hi
      ? "var(--text-body)"
      : "var(--text-dim, #3e2848)";
    return (
      <div key={i} style={{ color, minHeight: "1.2em" }}>
        {line.text}
      </div>
    );
  };

  const currentLineObj = LINES[currentLine];

  return (
    <>
      <style>{`
        .nf-key {
          background: var(--pink-text);
          color: var(--bg);
          font-size: 10px;
          font-weight: 700;
          padding: 0 5px;
          font-family: 'Alagard', monospace;
        }
        .nf-btn {
          background: var(--pink-text);
          color: var(--bg);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 16px;
          border: 1px solid var(--text-heading);
          cursor: pointer;
          font-family: 'Alagard', monospace;
          letter-spacing: .06em;
          transition: opacity 150ms;
        }
        .nf-btn:hover { opacity: .8; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .nf-cursor {
          display: inline-block;
          width: 8px;
          height: 13px;
          background: var(--text-body);
          vertical-align: middle;
          margin-left: 1px;
          animation: blink .8s step-end infinite;
        }
        .nf-cursor-pink {
          display: inline-block;
          width: 8px;
          height: 13px;
          background: var(--pink-text);
          vertical-align: middle;
          margin-left: 1px;
          animation: blink .8s step-end infinite;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .nf-dialog { animation: fadeIn 200ms ease-out; }
      `}</style>

      <div
        className="flex flex-col min-h-full"
        style={{ background: "var(--bg)" }}
      >
        <div className="flex-1 flex items-center justify-center p-8">
          <div style={{ maxWidth: 580, width: "100%" }}>

            {/* title bar */}
            <div
              style={{
                background:  "var(--pink-text)",
                color:       "var(--bg)",
                fontFamily:  "'Alagard', monospace",
                fontSize:    12,
                fontWeight:  700,
                padding:     "2px 10px",
                marginBottom: 28,
                display:     "inline-block",
                letterSpacing: ".05em",
              }}
            >
              404 — PAGE NOT FOUND 
            </div>

            {/* typed lines */}
            <div
              style={{
                fontFamily:  "'Alagard', monospace",
                fontSize:    11,
                lineHeight:  1.9,
                letterSpacing: ".02em",
              }}
            >
              {doneLines.map((line, i) => renderLine(line, i))}

              {/* currently typing line */}
              {currentLine < LINES.length && currentLineObj && (
                <div
                  style={{
                    color: currentLineObj.hi === "accent"
                      ? "var(--pink-text)"
                      : currentLineObj.hi
                      ? "var(--text-body)"
                      : "var(--text-dim, #3e2848)",
                    minHeight: "1.2em",
                  }}
                >
                  {currentText}
                  <span className="nf-cursor" />
                </div>
              )}
            </div>

            {/* divider */}
            {doneLines.length >= 7 && (
              <div
                style={{
                  height:     1,
                  background: "var(--border-soft)",
                  margin:     "20px 0",
                }}
              />
            )}

            {/* dialog box */}
            {showDialog && (
              <div
                className="nf-dialog"
                style={{ border: "1px solid var(--border-soft)", marginTop: 32 }}
              >
                {/* dialog title bar */}
                <div
                  style={{
                    background: "var(--pink-text)",
                    padding:    "3px 10px",
                    display:    "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color:       "var(--bg)",
                      fontFamily:  "'Alagard', monospace",
                      fontSize:    11,
                      fontWeight:  700,
                      letterSpacing: ".04em",
                    }}
                  >
                    shadowform.net — 404 Not Found
                  </span>
                  <span
                    style={{
                      color:      "var(--bg)",
                      fontFamily: "'Alagard', monospace",
                      fontSize:   11,
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </span>
                </div>

                {/* dialog body */}
                <div
                  style={{
                    background: "var(--bg-ticker)",
                    padding:    "18px 16px",
                    display:    "flex",
                    flexDirection: "column",
                    gap:        8,
                  }}
                >
                  <div
                    style={{
                      fontFamily:  "'Alagard', monospace",
                      fontSize:    11,
                      lineHeight:  1.75,
                      letterSpacing: ".02em",
                    }}
                  >
                    {dlDone.map((line, i) => (
                      <div
                        key={i}
                        style={{
                          color: i === 1
                            ? "var(--text-nav-inactive)"
                            : "var(--text-body)",
                        }}
                      >
                        {line}
                      </div>
                    ))}
                    {dlLine < dialogLines.length && (
                      <div
                        style={{
                          color: dlLine === 1
                            ? "var(--text-nav-inactive)"
                            : "var(--text-body)",
                        }}
                      >
                        {dlText}
                        <span className="nf-cursor-pink" />
                      </div>
                    )}
                  </div>

                  {dialogDone && (
                    <div
                      style={{ marginTop: 12, display: "flex", gap: 8 }}
                    >
                      <button
                        className="nf-btn"
                        onClick={() => navigate("/")}
                      >
                        ← go home
                      </button>
                      <button
                        className="nf-btn"
                        onClick={() => navigate(-1)}
                      >
                        go back
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
