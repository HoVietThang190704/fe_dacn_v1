import { UserTargetPage } from '@/presentation/pages/UserTargetPage';
import type { UserProfile } from '@/presentation/viewmodels/useProfileViewModel';

interface PageProps {
  params: { userId: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

const toSingleValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const decode = (value?: string) => {
  if (!value) {
    return undefined;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export default function UserTargetRoute({ params, searchParams }: PageProps) {
  const userId = params.userId;

  const fallbackProfile: Partial<UserProfile> = {
    userName: decode(toSingleValue(searchParams?.userName)),
    email: decode(toSingleValue(searchParams?.email)),
    avatar: decode(toSingleValue(searchParams?.avatar)),
  };

  return <UserTargetPage userId={userId} fallbackProfile={fallbackProfile} />;
}
