import { Sparkles } from "lucide-react";
import { HelloExample, TasksExample } from "@/components/demo/examples";

export default function TRPCDemoPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto p-8 max-w-4xl">
        {/* Hero Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Type-safe API Demo
          </div>
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Hono + TaylorDB
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            REST API with TanStack Query on a modern interface
          </p>
        </header>

        {/* Demo Examples */}
        <main className="grid gap-8">
          <HelloExample />
          <TasksExample />
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Built with 💜 using Hono, TanStack Query &amp; TaylorDB</p>
        </footer>
      </div>
    </div>
  );
}
