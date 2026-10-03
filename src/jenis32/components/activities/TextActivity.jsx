import React, { useState } from "react";
import Button from "@/components/Button";

const TextActivity = ({ activity, initialValue, onSave }) => {
  const [value, setValue] = useState(initialValue ?? "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Write your answer here..."
        className="rounded-lg bg-j32-card border border-j32-border px-4 py-3 text-sm text-j32-heading placeholder:text-j32-text/40 outline-none focus:border-j32-accent transition-colors resize-none"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" variant="primary" disabled={saving || !value.trim()} className="w-full">
        {saving ? "Saving…" : "Save and continue →"}
      </Button>
    </form>
  );
};

export default TextActivity;
