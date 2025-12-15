"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';
import { useAuth } from '@/shared/hooks/useAuth';
import { CommentSection } from './CommentSection';

type ApiUser = {
  id?: string;
  userName?: string;
  avatar?: string;
  userAvatar?: string;
  image?: string;
};

interface ApiPost {
  id: string;
  content?: string;
  images?: string[];
  createdAt?: string | Date;
  user?: ApiUser;
}

interface Props {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostDetailModal({ postId, isOpen, onClose }: Props) {
  useAuth();
  const tPost = useTranslations('postEditor');
  const tCommunity = useTranslations('community');
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<ApiPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (!post || !post.images || post.images.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((idx) => (idx - 1 + post!.images!.length) % post!.images!.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((idx) => (idx + 1) % post!.images!.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, post]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const p = await postCommentContainer.postRepository.getPostById(postId);
      setPost(p as ApiPost);
      setCurrentImageIndex(0);
    } catch (err) {
      console.error('Error loading post detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, loadData]);

  

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 "
        ref={overlayRef}
        onMouseDown={(e) => {
          if (e.target === overlayRef.current) {
            onClose();
          }
        }}
        style={{ touchAction: 'none' }}
    >
  <div
    className="bg-white w-full h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[100vh] sm:max-w-4xl overflow-y-auto rounded-t-lg sm:rounded-lg shadow-xl relative scrollbar-hide"
    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
  >
        <button ref={closeBtnRef} onClick={onClose} className="absolute top-3 right-3 rounded-full p-2 hover:bg-gray-100 " aria-label={tPost('close') ?? tCommunity('closeAlt') ?? 'Close'}>
          <Image src={ICONS.CROSS ?? ICONS.PLACEHOLDER} alt={tPost('close') ?? tCommunity('closeAlt') ?? 'Close'} width={20} height={20} />
        </button>

        {isLoading ? (
          <div className="p-8 text-center">{tPost('loading') ?? 'Loading...'}</div>
        ) : (
          <div className="p-4 sm:p-6 h-full flex flex-col">
            <div className="flex gap-3 items-center mb-4">
                {(() => {
                  const avatar = post?.user ? (post.user.avatar || post.user.userAvatar || post.user.image) : undefined;
                    if (avatar) {
                    return (
                      <Image
                        src={avatar}
                        alt={post?.user?.userName || (tCommunity('userFallback') ?? 'User')}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    );
                  }

                    return (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-white">
                      {post?.user?.userName?.charAt(0)?.toUpperCase() || (tCommunity('userFallback')?.charAt(0)?.toUpperCase() ?? 'U')}
                    </div>
                  );
                })()}
              <div>
                <div className="font-semibold">{post?.user?.userName || tCommunity('unknownUser')}</div>
                <div className="text-xs text-gray-500">{new Date(post?.createdAt || Date.now()).toLocaleString()}</div>
              </div>
            </div>

            <div className="mb-4">
              <p className="whitespace-pre-wrap">{post?.content}</p>
            </div>
            {post?.images && post.images.length > 0 && (
              <div className="mb-4 relative">
                <div className="w-full flex items-center justify-center bg-black/5 rounded">
                  <div className="relative w-full">
                    <div
                      className={`w-full max-h-[60vh] flex items-center justify-center relative overflow-hidden rounded ${isAnimating ? 'opacity-80' : 'opacity-100'} transition-opacity duration-300`}
                      onTouchStart={(e) => {
                        touchStartX.current = e.touches[0].clientX;
                      }}
                      onTouchEnd={(e) => {
                        const startX = touchStartX.current;
                        if (startX == null) return;
                        const endX = e.changedTouches[0].clientX;
                        const diff = startX - endX;
                        const threshold = 50;
                        if (diff > threshold) {
                          setIsAnimating(true);
                          setCurrentImageIndex((idx) => (idx + 1) % post!.images!.length);
                          setTimeout(() => setIsAnimating(false), 250);
                        } else if (diff < -threshold) {
                          setIsAnimating(true);
                          setCurrentImageIndex((idx) => (idx - 1 + post!.images!.length) % post!.images!.length);
                          setTimeout(() => setIsAnimating(false), 250);
                        }
                        touchStartX.current = null;
                      }}
                    >
                      <Image
                        key={post!.images![currentImageIndex]}
                        src={post!.images![currentImageIndex]}
                        alt={tPost('imageAlt', { index: currentImageIndex + 1 })}
                        width={1200}
                        height={800}
                        className="w-full max-h-[60vh] object-contain cursor-pointer transition-transform duration-300"
                        onClick={() => {
                          if (post!.images!.length > 1) {
                            setIsAnimating(true);
                            setCurrentImageIndex((idx) => (idx + 1) % post!.images!.length);
                            setTimeout(() => setIsAnimating(false), 250);
                          }
                        }}
                      />
                      {post!.images!.length > 1 && (
                        <button
                          onClick={() => {
                            setIsAnimating(true);
                            setCurrentImageIndex((idx) => (idx - 1 + post!.images!.length) % post!.images!.length);
                            setTimeout(() => setIsAnimating(false), 250);
                          }}
                          aria-label={tPost('prevImage') ?? 'Previous image'}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-md flex items-center justify-center"
                        >
                          <Image src={ICONS.ARROW_LEFT ?? ICONS.PLACEHOLDER} alt={tPost('prevImage') ?? 'Previous'} width={20} height={20} />
                        </button>
                      )}
                      {post!.images!.length > 1 && (
                        <button
                          onClick={() => {
                            setIsAnimating(true);
                            setCurrentImageIndex((idx) => (idx + 1) % post!.images!.length);
                            setTimeout(() => setIsAnimating(false), 250);
                          }}
                          aria-label={tPost('nextImage') ?? 'Next image'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-md flex items-center justify-center"
                        >
                          <Image src={ICONS.ARROW_RIGHT ?? ICONS.PLACEHOLDER} alt={tPost('nextImage') ?? 'Next'} width={20} height={20} />
                        </button>
                      )}

                      {post!.images!.length > 1 && (
                        <div className="absolute right-3 bottom-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {tPost('imageCount', { current: currentImageIndex + 1, max: post!.images!.length })}
                        </div>
                      )}
                    </div>
                    {post!.images!.length > 1 && (
                      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                        {post!.images!.map((src, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden border ${idx === currentImageIndex ? 'ring-2 ring-orange-400' : 'border-transparent'}`}
                          >
                            <Image src={src} alt={tPost('thumbAlt', { index: idx + 1 })} width={80} height={56} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <CommentSection postId={postId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
