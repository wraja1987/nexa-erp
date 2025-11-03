"use client";

export function NexaAIBar() {
  return (
    <div
      role="complementary"
      aria-label="Nexa AI Engine"
      className="fixed bottom-0 left-0 right-0 border-t bg-muted/70 backdrop-blur supports-[backdrop-filter]:bg-muted/50"
    >
      <div className="mx-auto max-w-6xl flex items-center gap-3 p-3">
        <input
          type="text"
          placeholder="Ask Nexa anything..."
          aria-label="Ask Nexa"
          className="flex-1 rounded-md border px-3 py-2 text-sm bg-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        />
        <button
          className="rounded-md bg-primary px-4 py-2 text-sm text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          aria-label="Send query to Nexa"
        >
          Send
        </button>
      </div>
    </div>
  );
}


