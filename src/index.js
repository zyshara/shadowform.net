import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "@/App";

import "@/index.css";

setInterval(() => {
  if (document.title === "🖤 𝖘𝖍𝖆𝖉𝖔𝖜𝖋𝖔𝖗𝖒 🩷") {
    document.title = "🩷 𝖘𝖍𝖆𝖉𝖔𝖜𝖋𝖔𝖗𝖒 🖤";
  } else {
    document.title = "🖤 𝖘𝖍𝖆𝖉𝖔𝖜𝖋𝖔𝖗𝖒 🩷";
  }
}, 500);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
