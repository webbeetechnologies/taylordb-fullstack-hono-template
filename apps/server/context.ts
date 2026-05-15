import { createQueryBuilder } from "@taylordb/query-builder";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import type { Context as HonoContext, Next } from "hono";
import type { TaylorDatabase } from "./taylordb/types";

export type QueryBuilder = ReturnType<typeof createQueryBuilder<TaylorDatabase>>;

export type ServerEnv = {
  Variables: {
    queryBuilder: QueryBuilder;
  };
};

function resolveApiKey(c: HonoContext) {
  const fromCookie = getCookie(c, "app_access_token");
  if (fromCookie) return fromCookie;

  const fromEnv = process.env.TAYLORDB_API_KEY;
  if (fromEnv) return fromEnv;

  throw new HTTPException(401, {
    message:
      "TaylorDB auth missing: sign in to set app_access_token, or set TAYLORDB_API_KEY for local server-to-server use.",
  });
}

export const createQueryBuilderForRequest = (c: HonoContext) => {
  const baseUrl = process.env.TAYLORDB_BASE_URL;
  const baseId = process.env.TAYLORDB_SERVER_ID;

  if (!baseUrl || !baseId) {
    throw new HTTPException(500, {
      message: "Missing TAYLORDB_BASE_URL or TAYLORDB_SERVER_ID",
    });
  }

  return createQueryBuilder<TaylorDatabase>({
    baseUrl,
    baseId,
    apiKey: resolveApiKey(c),
  });
};

export const queryBuilderMiddleware = async (
  c: HonoContext<ServerEnv>,
  next: Next
) => {
  c.set("queryBuilder", createQueryBuilderForRequest(c));
  await next();
};
