interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm text-[var(--muted-foreground)]">
                    {label}
                </label>
            )}
            <input 
                className={`w-full p-3 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20 ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-[var(--destructive)]">{error}</p>
            )}
        </div>
    );
}