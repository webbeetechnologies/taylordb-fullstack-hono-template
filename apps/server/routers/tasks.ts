import { z } from "zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createTasksRepository } from "../repositories/tasks";
import type { ServerEnv } from "../context";
import { TasksStatusOptions } from "../taylordb/types";

const statusSchema = z.enum(TasksStatusOptions);
const listQuerySchema = z.object({
  status: statusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const tasksRouter = new Hono<ServerEnv>()
  .get("/", async (c) => {
    const input = listQuerySchema.parse(c.req.query());
    const repo = createTasksRepository(c.var.queryBuilder);

    return c.json(
      await repo.list({
        status: input.status,
        limit: input.limit,
      })
    );
  })
  .post("/", async (c) => {
    const data = await c.req.formData();
    const name = String(data.get("name") ?? "").trim();
    const notes = String(data.get("notes") ?? "").trim();
    const statusRaw = String(data.get("status") ?? "").trim();
    const assigneeRaw = data.get("assignee");
    const file = data.get("attachment");

    if (!name) {
      throw new HTTPException(400, { message: "Name is required" });
    }

    if (!notes) {
      throw new HTTPException(400, { message: "Notes is required" });
    }

    const statusParse = statusSchema.safeParse(statusRaw);
    if (!statusParse.success) {
      throw new HTTPException(400, { message: `Invalid status: ${statusRaw}` });
    }

    let assignee: number[] | undefined;
    if (assigneeRaw != null && String(assigneeRaw).trim() !== "") {
      const id = Number(assigneeRaw);
      if (!Number.isFinite(id)) {
        throw new HTTPException(400, { message: "Invalid assignee" });
      }
      assignee = [id];
    }

    const qb = c.var.queryBuilder;
    const attachment =
      file instanceof File && file.size > 0
        ? await qb.uploadAttachments([{ file, name: file.name }])
        : undefined;

    const repo = createTasksRepository(qb);
    const task = await repo.create({
      name,
      notes,
      status: statusParse.data,
      ...(assignee ? { assignee } : {}),
      ...(attachment ? { attachment } : {}),
    });

    return c.json(task, 201);
  });

export const collaboratorsRouter = new Hono<ServerEnv>().get("/", async (c) => {
  const collaborators = await c.var.queryBuilder
    .selectFrom("collaborators")
    .select(["id", "name"])
    .orderBy("name", "asc")
    .limit(200)
    .execute();

  return c.json(collaborators);
});
