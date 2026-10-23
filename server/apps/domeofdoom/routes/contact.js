import { jsonBody } from "#middleware/jsonBody.js";
// server/apps/domeofdoom/routes/contact.js
import nodemailer from "nodemailer";
import { createLogger } from "#lib/logger.js";
const log = createLogger("domeofdoom");
import { rateLimit } from "#lib/rateLimit.js";
import { sanitize } from "#lib/sanitize.js";

const TO_ADDRESS   = "frydome@domeofdoom.org";
const FROM_ADDRESS = "contact@shadowform.net";

// Lazy — only create the transporter when a request arrives so the server
// starts fine even if SMTP_USER / SMTP_PASS aren't set yet in dev.
let _transporter = null;
const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
};

// 5 submissions per IP per hour
const limit = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

export function registerContactRoutes(app) {
  app.post("/api/contact", limit, jsonBody(), async function sendContact(req, res) {
    const name    = sanitize(req.body?.name);
    const email   = sanitize(req.body?.email);
    const subject = sanitize(req.body?.subject);
    const message = sanitize(req.body?.message);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }
    if (name.length > 200 || subject.length > 300 || message.length > 5000) {
      return res.status(400).json({ error: "Input too long." });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      log.warn("sendContact", "SMTP_USER / SMTP_PASS not set — email not sent");
      return res.status(503).json({ error: "Email sending is not configured yet." });
    }

    try {
      await getTransporter().sendMail({
        from:    `"Dome of Doom Contact" <${FROM_ADDRESS}>`,
        to:      TO_ADDRESS,
        replyTo: `"${name}" <${email}>`,
        subject: `[DOD Contact] ${subject}`,
        text:    `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
        html: `
          <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p style="white-space:pre-wrap">${message}</p>
        `,
      });

      log.info("sendContact", "message sent");
      res.json({ ok: true });
    } catch (err) {
      log.error("sendContact", "smtp error", err);
      res.status(500).json({ error: "Failed to send message. Please try again." });
    }
  });
}
