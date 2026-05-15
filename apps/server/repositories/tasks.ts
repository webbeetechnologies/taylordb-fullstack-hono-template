import type { createQueryBuilder } from "@taylordb/query-builder";
import type {
  Attachment,
  TableInserts,
  TaylorDatabase,
  TasksStatusOptions,
} from "../taylordb/types";

type QB = ReturnType<typeof createQueryBuilder<TaylorDatabase>>;

export type TasksListFilter = {
  status?: (typeof TasksStatusOptions)[number];
  limit?: number;
};

export type TasksCreateInput = Pick<
  TableInserts<"tasks">,
  "name" | "notes" | "status"
> &
  Partial<{
    assignee: number[];
    attachment: Attachment[];
  }>;

export function createTasksRepository(qb: QB) {
  return {
    list: (opts?: TasksListFilter) => {
      const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
      let q = qb
        .selectFrom("tasks")
        .select(["id", "name", "notes", "status", "createdAt", "updatedAt"])
        .orderBy("createdAt", "desc")
        .limit(limit);

      if (opts?.status) {
        q = q.where("status", "=", opts.status);
      }

      return q.execute();
    },

    create: (values: TasksCreateInput) =>
      qb
        .insertInto("tasks")
        .values(values)
        .returning(["id", "name", "notes", "status", "createdAt"])
        .executeTakeFirst(),
  };
}
