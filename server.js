// index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import history from "connect-history-api-fallback";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000 

app.use(history());

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "public")));

// SSL Forwarding
app.use((req, res, next) => {
   const host = req.header("host");
   const proto = req.header("x-forwarded-proto");

   if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
      return next();
   }

   if (proto !== "https" || host === "www.shadowform.net") {
      return res.redirect(302, `https://shadowform.net${req.url}`);
   }

   return next();
});

// Redirect all requests to 
app.use((req, res, next) => {
   if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
      return next();
   } else {
      res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
      res.header("Expires", "-1");
      res.header("Pragma", "no-cache");
      return next();
   }
});

// Home
app.get("/", (req, res) => {
   return res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(port, () => {
   console.log(`Server listening on http://localhost:${port}`);
});
