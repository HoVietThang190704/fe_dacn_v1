"use client";

import { usePathname } from 'next/navigation';
import AiAssistantWidget from './AiAssistantWidget';

const AiAssistantMount: React.FC = () => {
  const pathname = usePathname() || '';
  const hiddenSegments = ['/main/livestream', '/auth/login', '/auth/register'];

  if (hiddenSegments.some((segment) => pathname.includes(segment))) return null;

  return <AiAssistantWidget />;
};

export default AiAssistantMount;
