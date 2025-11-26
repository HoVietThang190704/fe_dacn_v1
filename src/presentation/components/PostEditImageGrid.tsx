import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { POST_EDIT_CONFIG } from '@/presentation/config/postEditConfig';
import { ICONS } from '@/shared/constants/images';

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
  t?: TranslateFn;
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
  const tHook = useTranslations('postEditor');
  const i18n = t ?? tHook;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">{i18n('imagesSection')}</h2>
        <span className="text-xs text-gray-500">
          {i18n('imageCount', { current: totalImages, max: POST_EDIT_CONFIG.MAX_IMAGES })}
        </span>
      </div>

      {keptImages.length === 0 && newImages.length === 0 && (
      <p className="text-xs text-gray-500">{i18n('noImages')}</p>
      )}

      {keptImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {keptImages.map((url) => (
            <div key={url} className="relative">
              <Image
                src={url}
                alt={i18n('existingImageAlt')}
                width={width}
                height={height}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemoveExisting(url)}
                    aria-label={i18n('removeImageAria')}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <Image
                  src={ICONS.CROSS ?? ICONS.PLACEHOLDER}
                  alt={i18n('removeImageAria')}
                  width={20}
                  height={20}
                  className="object-contain"
                />
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
                alt={i18n('newImageAlt')}
                width={width}
                height={height}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemoveNew(preview.url)}
                aria-label={i18n('removeImageAria')}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <Image
                  src={ICONS.CROSS ?? ICONS.PLACEHOLDER}
                  alt={i18n('removeImageAria')}
                  width={20}
                  height={20}
                  className="object-contain"
                />
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
          <Image
            src={ICONS.PLUS ?? ICONS.PLACEHOLDER}
            alt={i18n('addImages')}
            width={32}
            height={32}
            className="object-contain text-orange-500"
          />
          <span className="text-sm font-medium text-gray-700">{i18n('addImages')}</span>
          <span className="text-xs text-gray-500">{i18n('addImagesHint')}</span>
        </label>
      )}
    </div>
  );
};

export default PostEditImageGrid;
