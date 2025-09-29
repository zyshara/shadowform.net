// index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000 

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist")));

// SSL Forwarding
app.use((req, res, next) => {
   if (req.header("x-forwarded-proto") !== "https") {
      return res.redirect(`https://${req.header("host")}${req.url}`);
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
