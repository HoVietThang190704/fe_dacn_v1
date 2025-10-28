import { LivestreamWatchPage } from '@/presentation/pages/livestream/[id]';

interface LivestreamWatchProps {
  params: {
    id: string;
  };
}

export default function LivestreamWatch({ params }: LivestreamWatchProps) {
  return <LivestreamWatchPage livestreamId={params.id} />;
}