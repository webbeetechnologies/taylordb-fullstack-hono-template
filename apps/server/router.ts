import { Hono } from "hono";
import { apiRouter } from "./routers";
import type { ServerEnv } from "./context";

/**
 * Single source of truth for the API path prefix on the server.
 * Client `VITE_API_URL` already includes this prefix via `API_URL` in taylordb.yml.
 */
export const API_PREFIX = "/api";

export const app = new Hono<ServerEnv>().route(API_PREFIX, apiRouter);
