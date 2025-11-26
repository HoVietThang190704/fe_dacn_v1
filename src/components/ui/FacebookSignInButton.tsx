import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
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
  className = "",
  text = "Facebook"
}: FacebookSignInButtonProps) {
  return (
    <Button 
      variant="outline"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <Image 
        src={ICONS.FACEBOOK}
        alt="Facebook"
        width={20}
        height={20}
        className="flex-shrink-0"
      />
      <span className="text-sm font-medium">{text}</span>
    </Button>
  );
}