export const translateSafely = (translate: (key: any, values?: any) => any, key: string, fallback?: string) => {
  try {
    const value = translate(key as any);
    return value && value !== key ? value : fallback ?? '';
  } catch {
    return fallback ?? '';
  }
};

export const translateWithValues = (
  translate: (key: any, values?: any) => any,
  key: string,
  values: Record<string, any>,
  fallback?: string
) => {
  try {
    const value = translate(key as any, values);
    return value && value !== key ? value : fallback ?? '';
  } catch {
    return fallback ?? '';
  }
};

export default translateSafely;
