import { createClient } from 'contentful';

export function getContentfulClient() {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = process.env.CONTENTFUL_ENV || 'master';

  if (!space || !accessToken) {
    throw new Error('Missing Contentful environment variables: CONTENTFUL_SPACE_ID and/or CONTENTFUL_ACCESS_TOKEN');
  }

  return createClient({
    space,
    accessToken,
    environment,
  });
}

export type ContentfulEntry = any; // Basic typing for returned entries; map to domain model where needed
