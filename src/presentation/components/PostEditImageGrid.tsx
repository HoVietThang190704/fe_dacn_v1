import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { POST_EDIT_CONFIG } from '@/presentation/config/postEditConfig';

interface ImagePreview {
  file: File;
  url: string;
}

type TranslateFn = ReturnType<typeof useTranslations>;

interface Props {
  keptImages: string[];
  newImages: ImagePreview[];
  totalImages: number;
  onRemoveExisting: (url: string) => void;
  onRemoveNew: (url: string) => void;
  onAddNewImages: (files: FileList | null) => void;
  t: TranslateFn;
}

export const PostEditImageGrid: React.FC<Props> = ({
  keptImages,
  newImages,
  totalImages,
  onRemoveExisting,
  onRemoveNew,
  onAddNewImages,
  t,
}) => {
  const { width, height } = POST_EDIT_CONFIG.IMAGE_PREVIEW_SIZE;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">{t('imagesSection')}</h2>
        <span className="text-xs text-gray-500">{totalImages}/{POST_EDIT_CONFIG.MAX_IMAGES}</span>
      </div>

      {keptImages.length === 0 && newImages.length === 0 && (
      <p className="text-xs text-gray-500">{t('noImages')}</p>
      )}

      {keptImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {keptImages.map((url) => (
            <div key={url} className="relative">
              <Image
                src={url}
                alt={t('existingImageAlt')}
                width={width}
                height={height}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemoveExisting(url)}
                    aria-label={t('removeImageAria')}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {newImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {newImages.map((preview) => (
            <div key={preview.url} className="relative">
              <Image
                src={preview.url}
                alt={t('newImageAlt')}
                width={width}
                height={height}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemoveNew(preview.url)}
                aria-label={t('removeImageAria')}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {totalImages < POST_EDIT_CONFIG.MAX_IMAGES && (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => onAddNewImages(event.target.files)}
          />
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium text-gray-700">{t('addImages')}</span>
          <span className="text-xs text-gray-500">{t('addImagesHint')}</span>
        </label>
      )}
    </div>
  );
};

export default PostEditImageGrid;
