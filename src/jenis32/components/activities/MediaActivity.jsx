import React, { useState } from "react";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

// fetch() can't report upload progress — only XMLHttpRequest can — so this
// bypasses AuthContext's authFetch (a fetch wrapper) for the actual upload.
function uploadWithProgress(url, formData, jwt, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error || "upload failed"));
      } catch {
        reject(new Error("upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("upload failed — check your connection"));
    xhr.send(formData);
  });
}

function isImage(mime) {
  return mime?.startsWith("image/");
}

const MediaActivity = ({ activity, initialMedia = [], initialCaption, onSave }) => {
  const { jwt, authFetch } = useAuth();
  const config = activity.config ?? {};
  const allowMultiple = Boolean(config.allowMultiple);
  const maxFiles = config.maxFiles ?? 1;
  const acceptAttr = (config.accept ?? ["image"]).map((k) => `${k}/*`).join(",");

  const [media, setMedia] = useState(initialMedia);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [caption, setCaption] = useState(initialCaption ?? "");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const remainingSlots = allowMultiple ? maxFiles - media.length : 1;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    setError(null);
    if (!allowMultiple) {
      setPendingFiles(files.slice(0, 1));
    } else {
      setPendingFiles(files.slice(0, remainingSlots));
    }
  };

  const handleRemove = async (fileId) => {
    setRemovingId(fileId);
    setError(null);
    try {
      const res = await authFetch(`/api/jenis32/submissions/${activity.slug}/media/${fileId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "could not remove file");
      setMedia(data.submission.media);
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0 && media.length === 0) {
      setError("Choose at least one file first.");
      return;
    }

    // Nothing new selected but caption-only edit, or single-file activity
    // already satisfied by existing media — just continue.
    if (pendingFiles.length === 0) {
      onSave?.(null);
      return;
    }

    setError(null);
    setProgress(0);
    try {
      const formData = new FormData();
      pendingFiles.forEach((file) => formData.append("files", file));
      if (config.caption) formData.append("caption", caption);

      const data = await uploadWithProgress(
        `/api/jenis32/submissions/${activity.slug}/media`,
        formData,
        jwt,
        setProgress
      );

      setMedia(data.submission.media);
      setPendingFiles([]);
      setProgress(null);
      onSave?.(data.submission);
    } catch (err) {
      setError(err.message);
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map((m) => (
            <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-j32-card border border-j32-border">
              {isImage(m.mime) ? (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={m.url} className="w-full h-full object-cover" muted />
              )}
              <button
                type="button"
                onClick={() => handleRemove(m.id)}
                disabled={removingId === m.id}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
                aria-label="Remove"
              >
                {removingId === m.id ? "…" : "×"}
              </button>
            </div>
          ))}
        </div>
      )}

      {remainingSlots > 0 && (
        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-j32-border px-4 py-6 text-sm text-j32-text/70 cursor-pointer hover:border-j32-accent transition-colors">
          <span>
            {pendingFiles.length > 0
              ? pendingFiles.map((f) => f.name).join(", ")
              : allowMultiple
                ? `Drag and drop or click to choose (up to ${remainingSlots} more)`
                : "Drag and drop a file here or click to choose"}
          </span>
          <input type="file" accept={acceptAttr} multiple={allowMultiple} onChange={handleFileChange} className="hidden" />
        </label>
      )}

      {config.caption && (
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption (optional)"
          className="rounded-lg bg-j32-card border border-j32-border px-4 py-3 text-sm text-j32-heading placeholder:text-j32-text/40 outline-none focus:border-j32-accent transition-colors"
        />
      )}

      {progress !== null && (
        <div className="h-1.5 rounded-full bg-j32-border overflow-hidden">
          <div className="h-full bg-j32-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">
          {error}{" "}
          {pendingFiles.length > 0 && (
            <button type="button" onClick={handleUpload} className="underline">Retry</button>
          )}
        </p>
      )}

      <Button
        type="button"
        variant="primary"
        onClick={handleUpload}
        disabled={progress !== null}
        className="w-full"
      >
        {progress !== null ? `Uploading… ${progress}%` : "Save and continue →"}
      </Button>
    </div>
  );
};

export default MediaActivity;
