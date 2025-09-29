import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

setInterval(() => {
   if (document.title === "🖤 𝖘𝖍𝖆𝖉𝖔𝖜𝖋𝖔𝖗𝖒 🩷") {
      document.title = "🩷 𝖘𝖍𝖆𝖉𝖔𝖜𝖋𝖔𝖗𝖒 🖤";
   }
   else {
      document.title = "🖤 𝖘𝖍𝖆𝖉𝖔𝖜𝖋𝖔𝖗𝖒 🩷";
   }
}, 500)

const root = createRoot(document.getElementById("root"));
root.render(<App />);
