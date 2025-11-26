import React from 'react';
import { LivestreamForm } from '../../types';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';


type Props = {
  formData: LivestreamForm;
  setFormData: React.Dispatch<React.SetStateAction<LivestreamForm>>;
};

export const ThumbnailUploader: React.FC<Props> = ({ formData, setFormData }) => {
  const t = useTranslations('livestream');

  const onFileChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev: LivestreamForm) => ({ ...prev, thumbnail: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('form.thumbnail')}</label>
      <div className="flex gap-3">
        <label className="flex-1 flex items-center justify-center px-4 py-3 gap-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition cursor-pointer bg-gray-50 hover:bg-purple-50">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          <Image src={ICONS.IMAGE} alt={t('form.uploadImage')} width={20} height={20} />
          <span className="text-sm text-gray-600">{t('form.uploadImage')}</span>
        </label>
      </div>

      <div className="mt-2">
        <input
          type="url"
          id="thumbnail"
          name="thumbnail"
          value={formData.thumbnail ?? ''}
          onChange={(e) => setFormData((prev: LivestreamForm) => ({ ...prev, thumbnail: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
          placeholder={t('form.urlPlaceholder')}
        />
      </div>

      {formData.thumbnail && (
        <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden">
          <Image src={formData.thumbnail} alt={t('form.thumbnail')} fill unoptimized className="object-cover" onError={() => {}} />
        </div>
      )}
    </div>
  );
};
