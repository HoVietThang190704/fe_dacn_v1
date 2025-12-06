import React from 'react';
import { Icon } from './iconHelper';
import { ICONS } from '@/shared/constants/images';

type Props = {
  title: string;
  description?: string;
  iconName?: keyof typeof ICONS;
};

const EmptyState: React.FC<Props> = ({ title, description, iconName = 'PLACEHOLDER' }) => (
  <div className="text-center py-12">
    <div className="mx-auto mb-4">
      <Icon name={iconName} alt={title} width={64} height={64} />
    </div>
    <p className="text-gray-500">{title}</p>
    {description && <p className="text-gray-400 mt-2">{description}</p>}
  </div>
);

export default EmptyState;
