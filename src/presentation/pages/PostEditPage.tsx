'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';
import { Post } from '@/domain/entities/Post';

interface PostEditPageProps {
  postId: string;
}

interface ImagePreview {
  file: File;
  url: string;
}

export const PostEditPage: React.FC<PostEditPageProps> = ({ postId }) => {
  const t = useTranslations('postEditor');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';

  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ImagePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totalImages = useMemo(
    () => keptImages.length + newImages.length,
    [keptImages.length, newImages.length]
  );

  useEffect(() => {
    let isMounted = true;

    const loadPost = async () => {
      try {
        setIsLoading(true);
        const fetchedPost = await postCommentContainer.getPostByIdUseCase.execute(postId);
        if (!isMounted) return;
        setPost(fetchedPost);
        setContent(fetchedPost.content);
        setVisibility(fetchedPost.visibility ?? 'public');
        setKeptImages(fetchedPost.images ?? []);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Không thể tải bài viết';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  useEffect(() => {
    return () => {
      newImages.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [newImages]);

  const handleRemoveExistingImage = (url: string) => {
    setKeptImages((prev) => prev.filter((imageUrl) => imageUrl !== url));
  };

  const handleAddNewImages = (files: FileList | null) => {
    if (!files) return;

    const incomingFiles = Array.from(files);
    const availableSlots = 10 - totalImages;
    const acceptedFiles = availableSlots > 0 ? incomingFiles.slice(0, availableSlots) : [];

    const previews = acceptedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    if (incomingFiles.length > acceptedFiles.length) {
      alert(t('maxImagesWarning'));
    }

    setNewImages((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (url: string) => {
    setNewImages((prev) => {
      const next = prev.filter((item) => item.url !== url);
      const removed = prev.find((item) => item.url === url);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!content.trim()) {
      setError(t('contentRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      await postCommentContainer.updatePostUseCase.execute({
        postId,
        content: content.trim(),
        visibility,
        existingImageUrls: keptImages,
        newImages: newImages.map((item) => item.file),
      });

      setSuccess(t('success'));
      setTimeout(() => {
        router.push(`/${locale}/main/profile`);
      }, 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('error');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          type="button"
          className="px-4 py-2 bg-orange-500 text-white rounded-md"
          onClick={() => router.back()}
        >
          {t('back')}
        </button>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-xl p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm text-orange-500 hover:underline"
            >
              {t('back')}
            </button>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-600 mt-1">{t('description')}</p>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="content">
              {t('contentLabel')}
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              maxLength={10000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/10000
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('visibilityLabel')}
            </label>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as typeof visibility)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="public">{t('visibility.public')}</option>
              <option value="friends">{t('visibility.friends')}</option>
              <option value="private">{t('visibility.private')}</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-700">{t('imagesSection')}</h2>
              <span className="text-xs text-gray-500">{totalImages}/10</span>
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
                      alt="Existing image"
                      width={400}
                      height={400}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(url)}
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
                      alt="New image preview"
                      width={400}
                      height={400}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(preview.url)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalImages < 10 && (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => handleAddNewImages(event.target.files)}
                />
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{t('addImages')}</span>
                <span className="text-xs text-gray-500">{t('addImagesHint')}</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-60"
            >
              {isSubmitting ? t('updating') : t('updateButton')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditPage;
