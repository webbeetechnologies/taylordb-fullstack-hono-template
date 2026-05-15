/**
 * API client for the Hono backend.
 *
 * AI agents: Do NOT add an `/api` prefix to paths in this file (e.g. use `/tasks`,
 * not `/api/tasks`). `VITE_API_URL` from the environment already includes `/api`
 * (see `taylordb.yml` — client `API_URL` maps to `routing.server.url`, which is
 * the server route behind the `/api` gateway path). Local fallback below matches
 * that shape. The server mounts routes under `API_PREFIX` in `apps/server/router.ts`.
 */
const API_BASE =
  (typeof globalThis.process !== "undefined" &&
    globalThis.process.env?.VITE_API_URL) ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

export type HelloResponse = {
  message: string;
  timestamp: string;
  uptime: number;
};

export const TASK_STATUS_OPTIONS = ["Progress", "Done", "Trash"] as const;
export type TaskStatus = (typeof TASK_STATUS_OPTIONS)[number];

export type Task = {
  id: number;
  name: string;
  notes: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt?: string;
};

export type Collaborator = {
  id: number;
  name: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  const response = await fetch(`${API_BASE.replace(/\/$/, "")}${path}`, {
    ...init,
    credentials: "include",
    headers: isFormData
      ? init?.headers
      : {
          "Content-Type": "application/json",
          ...init?.headers,
        },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  hello: (name?: string) =>
    request<HelloResponse>(
      name ? `/hello?name=${encodeURIComponent(name)}` : "/hello"
    ),

  tasks: {
    list: (filters?: { status?: TaskStatus; limit?: number }) => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.limit) params.set("limit", String(filters.limit));

      const query = params.toString();
      return request<Task[]>(query ? `/tasks?${query}` : "/tasks");
    },
    create: (formData: FormData) =>
      request<Task>("/tasks", {
        method: "POST",
        body: formData,
      }),
  },

  collaborators: {
    list: () => request<Collaborator[]>("/collaborators"),
  },
};
