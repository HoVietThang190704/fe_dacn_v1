import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';

export const getIconPath = (key: keyof typeof ICONS): string => {
  const path = ICONS[key];
  if (!path) {
    throw new Error(`ICON NOT FOUND: ${String(key)}`);
  }

  return path;
};

export const Icon = ({
  name,
  alt,
  width = 16,
  height = 16,
}: {
  name: keyof typeof ICONS;
  alt?: string;
  width?: number;
  height?: number;
}) => {
  const src = getIconPath(name);
  return <Image src={src} alt={alt ?? name} width={width} height={height} />;
};
