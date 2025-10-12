interface AuthLinkProps {
  href: string;
  text: string;
  linkText: string;
  className?: string;
}

export function AuthLink({ href, text, linkText, className = "" }: AuthLinkProps) {
  return (
    <div className={`text-center text-sm text-[var(--muted-foreground)] ${className}`}>
      {text} <a href={href} className="text-[var(--shadow-color)]  hover:underline">{linkText}</a>
    </div>
  );
}