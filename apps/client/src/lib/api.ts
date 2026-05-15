const BASE_URL =
  (typeof globalThis.process !== "undefined" &&
    globalThis.process.env?.VITE_API_URL) ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

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

  const response = await fetch(`${BASE_URL}${path}`, {
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
      name ? `/api/hello?name=${encodeURIComponent(name)}` : "/api/hello"
    ),

  tasks: {
    list: (filters?: { status?: TaskStatus; limit?: number }) => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.limit) params.set("limit", String(filters.limit));

      const query = params.toString();
      return request<Task[]>(query ? `/api/tasks?${query}` : "/api/tasks");
    },
    create: (formData: FormData) =>
      request<Task>("/api/tasks", {
        method: "POST",
        body: formData,
      }),
  },

  collaborators: {
    list: () => request<Collaborator[]>("/api/collaborators"),
  },
};
