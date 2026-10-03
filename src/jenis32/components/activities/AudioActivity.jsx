import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Mic from "@/components/icons/Mic";
import { useAuth } from "@/context/AuthContext";

// Don't hardcode a container — Chrome records webm/opus, Safari records
// mp4/aac. Probe what the browser actually supports and keep that.
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

function pickMimeType() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

function extensionFor(mimeType) {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const AudioActivity = ({ activity, initialMedia = [], onSave }) => {
  const { jwt } = useAuth();
  const maxSeconds = activity.config?.maxSeconds ?? 120;

  const [status, setStatus] = useState(initialMedia.length > 0 ? "done" : "idle");
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "recording" && seconds >= maxSeconds) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, status]);

  async function startRecording() {
    setError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setShowUpload(true);
      setError("Recording isn't supported in this browser — upload a file instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const recordedBlob = new Blob(chunksRef.current, { type });
        setBlob(recordedBlob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(recordedBlob);
        });
        setStatus("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      setSeconds(0);
      recorder.start();
      setStatus("recording");
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setShowUpload(true);
      setError("Microphone access was denied — upload a recording instead.");
    }
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBlob(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setStatus("recorded");
  }

  async function handleSubmit() {
    if (!blob) return;
    setSaving(true);
    setError(null);
    try {
      const mimeType = blob.type || "audio/webm";
      const ext = extensionFor(mimeType);
      const formData = new FormData();
      formData.append("file", blob, `recording.${ext}`);

      const res = await fetch(`/api/jenis32/submissions/${activity.slug}/audio`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "could not save your recording");
      onSave?.(data.submission);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {status === "done" && (
        <div className="flex flex-col gap-3">
          <audio controls src={initialMedia[0]?.url} className="w-full" />
          <button
            type="button"
            onClick={startRecording}
            className="self-start text-sm text-j32-accent hover:underline cursor-pointer"
          >
            Re-record
          </button>
        </div>
      )}

      {status === "idle" && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-j32-border bg-j32-card px-6 py-10">
          <span className="w-16 h-16 rounded-full bg-j32-bg border border-j32-border flex items-center justify-center text-j32-accent">
            <Mic size={28} />
          </span>
          <Button type="button" variant="primary" onClick={startRecording}>
            Record a message
          </Button>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="text-xs text-j32-text/60 hover:text-j32-heading cursor-pointer"
          >
            or upload a file instead
          </button>
        </div>
      )}

      {status === "recording" && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-j32-border bg-j32-card px-6 py-10">
          <span className="relative w-16 h-16 rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center text-red-400">
            <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
            <Mic size={28} />
          </span>
          <p className="text-sm text-j32-text tabular-nums">{formatTime(seconds)} / {formatTime(maxSeconds)}</p>
          <Button type="button" variant="primary" onClick={stopRecording}>
            Stop
          </Button>
        </div>
      )}

      {status === "recorded" && (
        <div className="flex flex-col gap-3">
          <audio controls src={previewUrl} className="w-full" />
          <button
            type="button"
            onClick={startRecording}
            className="self-start text-sm text-j32-text/70 hover:text-j32-heading cursor-pointer"
          >
            Re-record
          </button>
        </div>
      )}

      {(status === "idle" || status === "recorded") && showUpload && (
        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-j32-border px-4 py-6 text-sm text-j32-text/70 cursor-pointer hover:border-j32-accent transition-colors">
          <span>Choose an audio file</span>
          <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
        </label>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {status === "recorded" && (
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={saving || !blob}
          className="w-full"
        >
          {saving ? "Saving…" : "Save and continue →"}
        </Button>
      )}
    </div>
  );
};

export default AudioActivity;
