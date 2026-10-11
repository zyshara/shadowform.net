import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import GlobeSlideButton from "@/components/GlobeSlideButton";
import ArrowUpRightIcon from "@/components/ArrowUpRightIcon";
import SectionDots from "@/components/SectionDots";
import WarpedGrid from "@/components/WarpedGrid";
import GlobeRings from "@/components/GlobeRings";

// Strip HTML tags and null bytes — mirrors server-side sanitize in api/contact.js
function sanitize(val) {
  return val.replace(/\x00/g, "").replace(/<[^>]*>/g, "").trim();
}

function validate({ name, email, subject, message }) {
  if (!name || !email || !subject || !message) return "All fields are required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
  if (name.length > 200) return "Name is too long.";
  if (subject.length > 300) return "Subject is too long.";
  if (message.length > 5000) return "Message is too long (max 5000 characters).";
  return null;
}

const fieldStyle = {
  display: "block",
  width: "100%",
  background: "transparent",
  border: "1px solid rgba(164, 244, 194, 0.25)",
  borderRadius: 0,
  padding: "12px 14px",
  color: "var(--dod-white)",
  fontFamily: "'Archivo', sans-serif",
  fontStretch: "100%",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 1.5,
  outline: "none",
  transition: "border-color 200ms ease",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontFamily: "'Archivo', sans-serif",
  fontStretch: "125%",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--dod-neon-mint)",
  marginBottom: 8,
};

function Field({ label, required, children }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}{required && <span style={{ marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const Contact = () => {
  usePageTitle("Contact");
  const [form, setForm]         = useState({ name: "", email: "", subject: "", message: "" });
  const [focused, setFocused]   = useState(null);
  const [status, setStatus]     = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const focus = (key) => () => setFocused(key);
  const blur  = () => setFocused(null);
  const focusBorder = (key) => focused === key ? { borderColor: "var(--dod-neon-mint)" } : {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleaned = {
      name:    sanitize(form.name),
      email:   sanitize(form.email),
      subject: sanitize(form.subject),
      message: sanitize(form.message),
    };

    const err = validate(cleaned);
    if (err) { setErrorMsg(err); return; }

    setErrorMsg(null);
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header — matches Catalog layout */}
      <div className="border-b border-dod-lilac/50 gap-4 lg:gap-0 grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col gap-4 lg:border-r lg:border-dod-lilac/50 lg:p-16 lg:pl-0">
          <span className="text-[clamp(4.5rem,6.3vw,6rem)] text-dod-neon-mint italic font-semibold">CONTACT</span>
          <div className="text-xl text-dod-lilac">
            Fill out the form below and we'll get back to you as soon as we can.
          </div>
        </div>
        <div className="relative overflow-hidden min-h-[110px]">
          <div className="absolute inset-0 w-full h-full flex justify-center items-center">
            <img
              className="absolute object-cover"
              src="https://res.cloudinary.com/dfeyhbxeg/image/upload/f_auto,q_auto,w_1200/v1786587597/distressed_texture_c11a949095.png"
              alt=""
            />
            <GlobeRings
              size={420}
              radius={93}
              meridianCount={6}
              parallelCount={6}
              tilt={0.1}
              rotation={-10}
              strokeWidth={0.5}
              gradientFrom="#5eead4"
              gradientTo="#5eead4"
              glowColor="#b8b2d7"
              glowIntensity={14}
              showFill={true}
              fillColor="#0a0812"
              fillOpacity={1}
              rings={[
                { angle: -26, rx: 173, ry: 43, colorFrom: "#8b7cf6", colorTo: "#8b7cf6", glowColor: "#8b7cf6", glowIntensity: 5, thickness: 0.9 },
                { angle: -5, rx: 175, ry: 40, colorFrom: "#5eead4", colorTo: "#5eead4", glowColor: "#5eead4", glowIntensity: 11, thickness: 1.2 },
              ]}
              className="absolute animate-[star-hover_6s_ease-in-out_infinite]"
            />
            <WarpedGrid />
          </div>
        </div>
      </div>

      <div className="px-0 lg:px-0 pb-[100px]">
        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <SectionDots color="var(--dod-neon-mint)" size={20} />
            <div style={{
              fontFamily: "'Archivo', sans-serif",
              fontStretch: "125%",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--dod-neon-mint)",
              marginTop: 12,
            }}>
              Message Sent
            </div>
            <div style={{ fontSize: 14, color: "var(--dod-lilac)", maxWidth: 320 }}>
              Thanks for reaching out — we'll be in touch soon.
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 24 }}
          >
            <Field label="Name" required>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={set("name")}
                onFocus={focus("name")}
                onBlur={blur}
                required
                maxLength={200}
                style={{ ...fieldStyle, ...focusBorder("name") }}
              />
            </Field>

            <Field label="Email" required>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                onFocus={focus("email")}
                onBlur={blur}
                required
                style={{ ...fieldStyle, ...focusBorder("email") }}
              />
            </Field>

            <Field label="Subject" required>
              <input
                type="text"
                placeholder="What's this about?"
                value={form.subject}
                onChange={set("subject")}
                onFocus={focus("subject")}
                onBlur={blur}
                required
                maxLength={300}
                style={{ ...fieldStyle, ...focusBorder("subject") }}
              />
            </Field>

            <Field label="Message" required>
              <textarea
                placeholder="Tell us a little more about what you're looking for..."
                value={form.message}
                onChange={set("message")}
                onFocus={focus("message")}
                onBlur={blur}
                required
                rows={6}
                maxLength={5000}
                style={{ ...fieldStyle, ...focusBorder("message"), resize: "vertical" }}
              />
              <div style={{ fontSize: 11, color: "rgba(197,192,206,0.4)", textAlign: "right", marginTop: 4 }}>
                {form.message.length} / 5000
              </div>
            </Field>

            {errorMsg && (
              <div style={{ fontSize: 13, color: "var(--dod-orange)", letterSpacing: "0.03em" }}>
                {errorMsg}
              </div>
            )}

            <div>
              <GlobeSlideButton
                text={status === "submitting" ? "Sending..." : "Send Message"}
                icon={<ArrowUpRightIcon size={Math.round(18 * 1.1)} />}
                size="lg"
                thickness="thin"
                duration={520}
                labelShift={26}
                color="var(--dod-neon-mint)"
                onClick={() => {}}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
