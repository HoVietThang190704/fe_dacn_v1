# Contentful advertBanner content type

To manage the homepage advertisement banner (the big advertisement shown under the hero), create a content type in Contentful named `advertBanner` with the fields below.

- id: (auto)
- title: Text (short) — the main title for the banner
- subtitle: Text (short) — optional small label like "Promo" or "Announcement"
- description: Text (rich or short) — banner description
- image: Media (image) — the image to display at the right
- ctaText: Text (short) — CTA button label
- ctaLink: Text (URL) — CTA destination URL
- active: Boolean — show/hide this ad
- sortOrder: Integer — lower first
- backgroundGradient: Text — optional hex or gradient string

Usage notes:
- The FE will fetch the active banner and display the first available active entry ordered by `sortOrder`. If you need more complex behaviour (e.g., several ad placements), create `advertBanner` entries and use `location` field to decide which slot to display.

Environment variables needed locally (in `.env.local` or provided via hosting env):

- CONTENTFUL_SPACE_ID=yourSpaceId
- CONTENTFUL_ACCESS_TOKEN=yourContentDeliveryAccessToken
- CONTENTFUL_ENV=(optional, default `master`)

Notes on security and usage:
- For security, the FE uses a server-side API route (`/api/contentful/banner`) to fetch the banner from Contentful rather than exposing the access token in the browser.
- The API route uses `src/lib/contentful.ts`.
- The FE renders the top active banner; you can add more entries and use the `sortOrder` to change priority.

Deployment:
- Add the above env variables in your deployment environment (Vercel/Netlify/Platform) so the server route can access Contentful without exposing tokens.

