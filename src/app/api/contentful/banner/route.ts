import { NextResponse } from 'next/server';
import { getContentfulClient } from '@/lib/contentful';

export async function GET() {
  try {
    const client = getContentfulClient();

    // Fetch a single active advertBanner entry without depending on a custom order field.
    const entries = await client.getEntries({
      content_type: 'advertBanner',
      'fields.active': true,
      limit: 1,
    });

    const item = entries.items?.[0];
    if (!item) {
      return NextResponse.json({ data: null });
    }

    const fields: any = item.fields || {};

    // Support both `image` and `Image` field ids and also `media`.
    const imageField = fields.image ?? fields.Image ?? fields.media ?? null;

    // extract media (image or video) if available
    let media: string | null = null;
    let mediaType: 'image' | 'video' | 'unknown' | null = null;
    if (imageField && imageField.fields && imageField.fields.file) {
      const url = imageField.fields.file.url;
      if (url) {
        media = url.startsWith('http') ? url : `https:${url}`;
        const contentType = imageField.fields.file.contentType || '';
        if (contentType.startsWith('video')) mediaType = 'video';
        else if (contentType.startsWith('image')) mediaType = 'image';
        else mediaType = 'unknown';
      }
    }

    const payload = {
      id: item.sys.id,
      title: fields.title ?? '',
      subtitle: fields.subtitle ?? '',
      description: fields.description ?? '',
      media,
      mediaType,
      ctaText: fields.ctaText ?? '',
      ctaLink: fields.ctaLink ?? '',
      isActive: fields.active ?? true,
      order: fields.sortOrder ?? 0,
    };

    return NextResponse.json({ data: payload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Contentful fetch error' }, { status: 500 });
  }
}
