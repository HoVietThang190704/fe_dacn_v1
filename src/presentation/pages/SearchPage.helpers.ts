export type HighlightSegment = {
  value: string;
  isMatch: boolean;
};

export const buildHighlightSegments = (text: string, keyword: string): HighlightSegment[] => {
  if (!keyword) {
    return [{ value: text, isMatch: false }];
  }

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexp = new RegExp(escaped, 'gi');
  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regexp.exec(text)) !== null) {
    const [matchedValue] = match;
    const matchIndex = match.index;
    if (lastIndex < matchIndex) {
      segments.push({ value: text.slice(lastIndex, matchIndex), isMatch: false });
    }
    segments.push({ value: matchedValue, isMatch: true });
    lastIndex = matchIndex + matchedValue.length;
  }

  if (lastIndex < text.length) {
    segments.push({ value: text.slice(lastIndex), isMatch: false });
  }

  if (segments.length === 0) {
    return [{ value: text, isMatch: false }];
  }

  return segments;
};
