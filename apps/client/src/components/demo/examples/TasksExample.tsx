import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileIcon, ListTodo, Plus, Upload, X } from "lucide-react";
import { api, TASK_STATUS_OPTIONS, type TaskStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DemoCard,
  EmptyState,
  InlineSpinner,
  LoadingSpinner,
  StatusBadge,
} from "@/components/demo";

const statusTone: Record<TaskStatus, "info" | "success" | "warning"> = {
  Progress: "info",
  Done: "success",
  Trash: "warning",
};

export function TasksExample() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Progress");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [assignee, setAssignee] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks", statusFilter],
    queryFn: () =>
      api.tasks.list({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 50,
      }),
  });

  const collaboratorsQuery = useQuery({
    queryKey: ["collaborators"],
    queryFn: api.collaborators.list,
  });

  const createTask = useMutation({
    mutationFn: api.tasks.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setName("");
      setNotes("");
      setStatus("Progress");
      setAssignee("");
      setAttachment(null);
    },
  });

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("notes", notes);
    formData.append("status", status);
    if (assignee) formData.append("assignee", assignee);
    if (attachment) formData.append("attachment", attachment);

    createTask.mutate(formData);
  };

  return (
    <DemoCard
      title="Tasks"
      description="TaylorDB-backed list and multipart create example"
      icon={ListTodo}
      iconColorClass="bg-accent/10 text-accent"
      glowClass="glow-accent"
    >
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Task name"
          />
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as TaskStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Task notes"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Assignee</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Optional collaborator" />
              </SelectTrigger>
              <SelectContent>
                {collaboratorsQuery.data?.map((collaborator) => (
                  <SelectItem
                    key={collaborator.id}
                    value={String(collaborator.id)}
                  >
                    {collaborator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FileField file={attachment} onChange={setAttachment} />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || !notes.trim() || createTask.isPending}
          className="w-full"
        >
          {createTask.isPending ? (
            <>
              <InlineSpinner /> Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </>
          )}
        </Button>

        {createTask.error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            {createTask.error.message}
          </div>
        )}

        {createTask.data && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Created {createTask.data.name}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Label className="shrink-0">Filter</Label>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tasks</SelectItem>
            {TASK_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tasksQuery.isLoading ? (
        <LoadingSpinner colorClass="text-accent" />
      ) : (
        <div className="space-y-3">
          {tasksQuery.data?.length === 0 && (
            <EmptyState message="No tasks found. Create one above!" />
          )}
          {tasksQuery.data?.map((task) => (
            <div
              key={task.id}
              className="item-row p-4 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{task.name}</h3>
                  <StatusBadge status={statusTone[task.status]}>
                    {task.status}
                  </StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DemoCard>
  );
}

function FileField({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label>Attachment</Label>
      {file ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
          <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="flex-1 min-w-0 text-sm font-medium truncate">
            {file.name}
          </p>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => onChange(null)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Optional attachment
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          onChange(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
    </div>
  );
}
