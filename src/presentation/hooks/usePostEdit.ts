import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';
import { Post } from '@/domain/entities/Post';
import { POST_EDIT_CONFIG } from '@/presentation/config/postEditConfig';

interface ImagePreview {
  file: File;
  url: string;
}

export const usePostEdit = (postId: string) => {
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
        const message = err instanceof Error ? err.message : t('error');
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
  }, [postId, t]);

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
    const availableSlots = POST_EDIT_CONFIG.MAX_IMAGES - totalImages;
    const acceptedFiles = availableSlots > 0 ? incomingFiles.slice(0, availableSlots) : [];

    const previews = acceptedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    if (incomingFiles.length > acceptedFiles.length) {
      setError(t('maxImagesWarning'));
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

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
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
      }, POST_EDIT_CONFIG.REDIRECT_DELAY_MS);
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

  return {
    t,
    router,
    locale,
    post,
    content,
    setContent,
    visibility,
    setVisibility,
    keptImages,
    setKeptImages,
    newImages,
    setNewImages,
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
  } as const;
};
