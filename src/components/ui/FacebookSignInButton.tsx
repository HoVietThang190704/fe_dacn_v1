import Image from 'next/image';
import { Button } from './Button';

interface FacebookSignInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  text?: string;
}

export function FacebookSignInButton({ 
  onClick, 
  disabled = false, 
  isLoading = false,
  className = ""
}: FacebookSignInButtonProps) {
  return (
    <Button 
      variant="outline"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <Image 
        src="/icons/facebook.png"
        alt="Facebook"
        width={20}
        height={20}
        className="flex-shrink-0"
      />
    </Button>
  );
}