import { UserTargetPage } from '@/presentation/pages/UserTargetPage';
import type { UserProfile } from '@/presentation/viewmodels/useProfileViewModel';

type RouteParams = Promise<{ userId: string }>;
type RouteSearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  params: RouteParams;
  searchParams?: RouteSearchParams;
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

export default async function UserTargetRoute({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const fallbackProfile: Partial<UserProfile> = {
    userName: decode(toSingleValue(resolvedSearchParams?.userName)),
    email: decode(toSingleValue(resolvedSearchParams?.email)),
    avatar: decode(toSingleValue(resolvedSearchParams?.avatar)),
  };

  return <UserTargetPage userId={userId} fallbackProfile={fallbackProfile} />;
}
