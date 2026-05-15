import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { API_PREFIX, app } from "./router.js";

const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  `${API_PREFIX}/*`,
  cors({
    origin: (origin) =>
      allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    credentials: true,
  })
);

serve(
  {
    fetch: app.fetch,
    port: Number(PORT),
  },
  (info) => {
    console.log(`🚀 Server running on http://localhost:${info.port}`);
    console.log(`📡 API: http://localhost:${info.port}${API_PREFIX}`);
  }
);
