import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';

type IconName = keyof typeof ICONS;

interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: IconName | null;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, alt = '', width = 20, height = 20, className = '', ...rest }) => {
  const src = name ? ICONS[name] : ICONS.PLACEHOLDER;
  if (!src) return <div style={{ width, height }} className={className} {...rest} />;

  return (
    <Image src={src} alt={alt} width={width} height={height} className={className} unoptimized />
  );
};

export default Icon;
