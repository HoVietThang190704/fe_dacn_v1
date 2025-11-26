"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import type { UserProfile } from "@/presentation/viewmodels/useProfileViewModel";
import { usePosts } from "@/hooks/usePosts";
import { useUserProducts } from "@/hooks/useUserProducts";
import PostCard from "../components/PostCard";
import ProfileProductCard from "../components/ProfileProductCard";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfileEmptyState from "../components/profile/ProfileEmptyState";
import LoadingSpinner from "../components/profile/LoadingSpinner";
import { ICONS } from "@/shared/constants/images";

interface ProfilePageProps {
  profile: UserProfile;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile }) => {
  const t = useTranslations("profile");
  const tCommunity = useTranslations("community");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'products'>('posts');
  const canManageShopOrders = useMemo(() => profile.role === "shop_owner" || profile.role === "admin", [profile.role]);
  const manageOrdersPath = '/main/orders/manage';
  
  const {
    posts,
    isLoading,
    toggleLike,
    deletePost,
    sharePost,
  } = usePosts();

  const {
    products,
    isLoading: isLoadingProducts,
    isMutating: isMutatingProducts,
    deleteProduct: deleteUserProduct,
    toggleProductAvailability,
  } = useUserProducts(profile.id);

  const userPosts = posts.filter((post) => post.userId === profile.id);

  const handleToggleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(t("confirmDeletePost"))) return;

    try {
      await deletePost(postId);
    } catch (err) {
      console.error("Error deleting post:", err);
      alert(err instanceof Error ? err.message : t("deleteError") || "");
    }
  };

  const handleSharePost = async (originalPostId: string, content?: string) => {
    try {
      await sharePost(originalPostId, content);
    } catch (err) {
      console.error('Error sharing post:', err);
      alert(err instanceof Error ? err.message : t('sharePostError') || '');
    }
  };

  const handleEditPost = (postId: string) => {
    router.push(`/main/community/${postId}/edit`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/main/products/${productId}/edit`);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteUserProduct(productId);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err instanceof Error ? err.message : t('deleteProductError') || '');
    }
  };

  const handleToggleProductAvailability = async (productId: string, nextInStock: boolean) => {
    try {
      await toggleProductAvailability(productId, nextInStock);
    } catch (err) {
      console.error('Error updating product status:', err);
      alert(err instanceof Error ? err.message : t('updateProductStatusError') || '');
    }
  };

  const handleManageOrdersClick = () => {
    router.push(manageOrdersPath);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader profile={profile} canManageShopOrders={canManageShopOrders} onManageOrdersClick={handleManageOrdersClick} t={t} />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} postsCount={userPosts.length} productsCount={products.length} t={t} />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {isLoading && userPosts.length === 0 ? (
              <div className="text-center py-12">
                <LoadingSpinner />
              </div>
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    userId: post.userId,
                    userName: post.user?.userName || post.user?.email || t('unknownUser'),
                    userAvatar: post.user?.avatar || '',
                    userEmail: post.user?.email,
                    content: post.content,
                    images: post.images,
                    likes: post.likesCount,
                    comments: post.commentsCount,
                    shares: post.sharesCount,
                    isLiked: post.isLiked,
                    createdAt: post.createdAt,
                  }}
                  
                  onLike={() => handleToggleLike(post.id)}
                  onDelete={() => handleDeletePost(post.id)}
                  onEdit={() => handleEditPost(post.id)}
                  onShare={() => handleSharePost(post.id)}
                />
              ))
            ) : (
              <ProfileEmptyState iconSrc={ICONS.PLACEHOLDER} title={t("emptyPosts")} />
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            {isLoadingProducts && products.length === 0 ? (
              <div className="text-center py-12">
                <LoadingSpinner />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProfileProductCard
                    key={product.id}
                    product={product}
                    router={router}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onToggleAvailability={handleToggleProductAvailability}
                    isBusy={isMutatingProducts}
                  />
                ))}
              </div>
            ) : (
              <ProfileEmptyState iconSrc={ICONS.PLACEHOLDER} title={t("emptyProducts")} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
