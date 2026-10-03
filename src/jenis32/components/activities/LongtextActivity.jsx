import React, { useState, useMemo } from "react";
import Button from "@/components/Button";

// Mirrors server/jenis32/submissions.js's validateLongtext — words split on
// whitespace, length counts letters/digits only (punctuation and
// apostrophes are free), hyphens don't split a word. Kept as a duplicate
// rather than a shared import: src/ (webpack) and server/ (plain Node)
// aren't wired to share modules in this repo, and the function is small
// enough that duplication is cheaper than introducing that wiring.
function checkLongtext(value, config = {}) {
  const { maxWords, maxWordLength } = config;
  const words = value.trim().split(/\s+/).filter(Boolean);

  const tooManyWords = Boolean(maxWords && words.length > maxWords);
  const tooLongWords = maxWordLength
    ? words.filter((w) => (w.match(/[a-zA-Z0-9]/g) || []).length > maxWordLength)
    : [];

  return { words, tooManyWords, tooLongWords };
}

const LongtextActivity = ({ activity, initialValue, onSave }) => {
  const [value, setValue] = useState(initialValue ?? "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [shake, setShake] = useState(false);

  const config = activity.config ?? {};
  const { words, tooManyWords, tooLongWords } = useMemo(() => checkLongtext(value, config), [value, config]);
  const hasError = tooManyWords || tooLongWords.length > 0;
  const errorMessage = tooLongWords.length > 0
    ? (config.wordTooLongMessage || "WORD TOO BIG")
    : tooManyWords
      ? (config.tooManyWordsMessage || "TOO MANY WORD")
      : null;

  const handleChange = (e) => {
    setValue(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasError || !value.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }
    setSaving(true);
    try {
      await onSave({ textValue: value });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={handleChange}
        rows={4}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Write your answer here..."
        className={`rounded-lg bg-j32-card border px-4 py-3 text-sm text-j32-heading placeholder:text-j32-text/40 outline-none transition-colors resize-none ${
          hasError ? "border-red-400" : "border-j32-border focus:border-j32-accent"
        } ${shake ? "animate-[shake_0.3s]" : ""}`}
      />

      <div className="flex items-center justify-between text-xs text-j32-text/60">
        {config.maxWords ? (
          <span className={tooManyWords ? "text-red-400" : ""}>
            {words.length} / {config.maxWords}
          </span>
        ) : <span />}
      </div>

      {hasError && (
        <div className="text-sm font-bold uppercase tracking-wide text-red-400">
          {errorMessage}
          {tooLongWords.length > 0 && (
            <span className="block font-normal normal-case text-red-400/80 mt-1">
              Too long: {tooLongWords.join(", ")}
            </span>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" variant="primary" disabled={saving || hasError || !value.trim()} className="w-full">
        {saving ? "Saving…" : "Save and continue →"}
      </Button>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </form>
  );
};

export default LongtextActivity;
