interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  className,
  ...props 
}: ButtonProps) {
  const baseStyles = "rounded-[var(--radius)] font-semibold transition-colors disabled:opacity-50";
  
  const variants = {
    primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--ring)]",
    secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)]",
    outline: "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}