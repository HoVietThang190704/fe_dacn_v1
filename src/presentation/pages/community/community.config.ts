export const COMMUNITY_CONFIG = {
  SKELETON_COUNT: 3,
  OBSERVER_ROOT_MARGIN: '100px',
  OBSERVER_THRESHOLD: 0.1,
} as const;

export type CommunityConfig = typeof COMMUNITY_CONFIG;
