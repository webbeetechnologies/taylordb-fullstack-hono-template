import { Hono } from "hono";
import { collaboratorsRouter, tasksRouter } from "./routers";
import { queryBuilderMiddleware, type ServerEnv } from "./context";

export const app = new Hono<ServerEnv>()
  .get("/api/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() })
  )
  .get("/api", (c) =>
    c.json({
      message: "TaylorDB API server is running!",
      health: `${new URL(c.req.url).origin}/api/health`,
      timestamp: new Date().toISOString(),
    })
  )
  .get("/api/hello", (c) => {
    const name = c.req.query("name");

    return c.json({
      message: `Hello ${name || "World"}!`,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  })
  .use("/api/*", queryBuilderMiddleware)
  .route("/api/tasks", tasksRouter)
  .route("/api/collaborators", collaboratorsRouter);
