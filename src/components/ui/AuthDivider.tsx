interface AuthDividerProps {
  text?: string;
  className?: string;
}

export function AuthDivider({ 
  text = "Or login with", 
  className = "" 
}: AuthDividerProps) {
  return (
    <div className={`text-center my-6 text-[var(--muted-foreground)] text-sm ${className}`}>
      {text}
    </div>
  );
}