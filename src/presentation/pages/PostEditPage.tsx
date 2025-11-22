"use client";

import React from 'react';
import { usePostEdit } from '@/presentation/hooks/usePostEdit';
import { PostEditImageGrid } from '@/presentation/components/PostEditImageGrid';
import { POST_EDIT_CONFIG } from '@/presentation/config/postEditConfig';

interface PostEditPageProps {
  postId: string;
}

export const PostEditPage: React.FC<PostEditPageProps> = ({ postId }) => {
  const {
    t,
    post,
    content,
    setContent,
    visibility,
    setVisibility,
    keptImages,
    newImages,
    isLoading,
    isSubmitting,
    error,
    success,
    totalImages,
    handleRemoveExistingImage,
    handleAddNewImages,
    handleRemoveNewImage,
    handleSubmit,
    handleCancel,
  } = usePostEdit(postId);

  // All logic moved to usePostEdit hook

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
          onClick={handleCancel}
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
              maxLength={POST_EDIT_CONFIG.MAX_CONTENT_LENGTH}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/{POST_EDIT_CONFIG.MAX_CONTENT_LENGTH}
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
            <PostEditImageGrid
              keptImages={keptImages}
              newImages={newImages}
              totalImages={totalImages}
              onRemoveExisting={handleRemoveExistingImage}
              onRemoveNew={handleRemoveNewImage}
              onAddNewImages={handleAddNewImages}
              t={t}
            />
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
