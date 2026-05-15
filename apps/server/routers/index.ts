import { Hono } from "hono";
import { queryBuilderMiddleware, type ServerEnv } from "../context";
import { collaboratorsRouter, tasksRouter } from "./tasks";

export const apiRouter = new Hono<ServerEnv>()
  .get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() })
  )
  .get("/", (c) => {
    const healthUrl = new URL(c.req.url);
    healthUrl.pathname = `${healthUrl.pathname.replace(/\/$/, "")}/health`;

    return c.json({
      message: "TaylorDB API server is running!",
      health: healthUrl.toString(),
      timestamp: new Date().toISOString(),
    });
  })
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

export { tasksRouter, collaboratorsRouter } from "./tasks";
