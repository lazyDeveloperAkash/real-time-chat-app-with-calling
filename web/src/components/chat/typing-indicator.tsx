export function TypingIndicator() {
  return (
    <div className="flex px-3">
      <div className="bg-muted flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
