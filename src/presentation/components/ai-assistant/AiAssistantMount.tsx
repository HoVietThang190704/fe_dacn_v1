"use client";

import { usePathname } from 'next/navigation';
import AiAssistantWidget from './AiAssistantWidget';

const AiAssistantMount: React.FC = () => {
  const pathname = usePathname() || '';

  if (pathname.includes('/main/livestream')) return null;

  return <AiAssistantWidget />;
};

export default AiAssistantMount;
