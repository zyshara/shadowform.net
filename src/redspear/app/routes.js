// src/redspear/app/routes.js
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("epk", "routes/epk.jsx"),
  route("*", "routes/not-found.jsx"),
];
