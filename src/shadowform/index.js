import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "@/App";

import "@/index.css";

import { swapTitleEmojis } from "@shared/utils/swapTitleEmojis";

swapTitleEmojis("🖤", "🩷", 500);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
