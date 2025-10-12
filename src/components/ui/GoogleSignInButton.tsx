import Image from 'next/image';
import { Button } from './Button';

interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  text?: string;
}

export function GoogleSignInButton({ 
  onClick, 
  disabled = false, 
  isLoading = false,
  className = ""
}: GoogleSignInButtonProps) {
  return (
    <Button 
      variant="outline"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <Image 
        src="/icons/google.png"
        alt="Google"
        width={20}
        height={20}
        className="flex-shrink-0"
      />
    </Button>
  );
}