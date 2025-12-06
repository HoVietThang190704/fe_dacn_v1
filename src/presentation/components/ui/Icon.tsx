import Image from 'next/image';
import React from 'react';
import { ICONS } from '@/shared/constants/images';

type IconProps = {
  name?: keyof typeof ICONS | string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  unoptimized?: boolean;
};

const Icon: React.FC<IconProps> = ({ name, src, alt = '', width = 20, height = 20, className = '', unoptimized = true }) => {
  const resolved = src || (name ? (ICONS as Record<string, string>)[name] : undefined);
  if (!resolved) return null;
  // prefer <Image /> which fits the existing codebase
  return <Image src={resolved} alt={alt || name || ''} width={width} height={height} className={className} unoptimized={unoptimized} />;
};

export default Icon;
