import React, { useState, useRef } from "react";
import Button from "@/components/Button";
import TextField from "@/components/TextField";

const AVATAR_TARGET_SIZE = 800;

// Center-crops to a square and downscales before upload, per gameplan's
// profile-activity notes — keeps the upload small and fast on phones.
function cropAndResizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const targetSize = Math.min(AVATAR_TARGET_SIZE, side);

      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, side, side, 0, 0, targetSize, targetSize);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("could not read that image"));
    };
    img.src = objectUrl;
  });
}

const ProfileActivity = ({ account, onSave }) => {
  const [firstName, setFirstName] = useState(account?.firstName ?? "");
  const [lastName, setLastName] = useState(account?.lastName ?? "");
  const [nickname, setNickname] = useState(account?.nickname ?? "");
  const [avatarPreview, setAvatarPreview] = useState(account?.avatar?.url ?? null);
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const cropped = await cropAndResizeImage(file);
      setAvatarDataUrl(cropped);
      setAvatarPreview(cropped);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !avatarPreview) {
      setError("First name, last name, and a profile picture are all required.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        firstName,
        lastName,
        nickname,
        ...(avatarDataUrl ? { avatarDataUrl } : {}),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-20 h-20 rounded-full bg-j32-card border border-j32-border overflow-hidden flex items-center justify-center shrink-0"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-j32-text/60">Add photo</span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-j32-accent hover:underline"
        >
          {avatarPreview ? "Change photo" : "Upload a photo"}
        </button>
      </div>

      <TextField
        id="firstName"
        label="First name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <TextField
        id="lastName"
        label="Last name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <TextField
        id="nickname"
        label="Nickname (optional)"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" variant="primary" disabled={saving} className="w-full">
        {saving ? "Saving…" : "Save and continue →"}
      </Button>
    </form>
  );
};

export default ProfileActivity;
