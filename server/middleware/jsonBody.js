import express from "express";

// Each write route owns its body limit; errors keep the same JSON shape.
export function jsonBody({ limit = "100kb", tooLarge = "request is too large" } = {}) {
  const parse = express.json({ limit });
  return (req, res, next) => parse(req, res, err => {
    if (err?.type === "entity.too.large") return res.status(413).json({ error: tooLarge });
    if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "invalid JSON" });
    next(err);
  });
}
