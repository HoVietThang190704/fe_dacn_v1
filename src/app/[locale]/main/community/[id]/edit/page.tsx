'use client';

import { useParams } from 'next/navigation';
import PostEditPage from '@/presentation/pages/PostEditPage';

const CommunityPostEditRoute = () => {
  const params = useParams() as { id?: string };
  const postId = params?.id ?? '';

  if (!postId) {
    return null;
  }

  return <PostEditPage postId={postId} />;
};

export default CommunityPostEditRoute;
