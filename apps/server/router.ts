import { Hono } from "hono";
import { collaboratorsRouter, tasksRouter } from "./routers";
import { queryBuilderMiddleware, type ServerEnv } from "./context";

export const app = new Hono<ServerEnv>()
  .get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() })
  )
  .get("", (c) =>
    c.json({
      message: "TaylorDB API server is running!",
      health: `${new URL(c.req.url).origin}/health`,
      timestamp: new Date().toISOString(),
    })
  )
  .get("/hello", (c) => {
    const name = c.req.query("name");

    return c.json({
      message: `Hello ${name || "World"}!`,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  })
  .use("/*", queryBuilderMiddleware)
  .route("/tasks", tasksRouter)
  .route("/collaborators", collaboratorsRouter);
