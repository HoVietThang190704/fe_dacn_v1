/**
 * Domain Entity: Banner
 * Pure business logic, no framework dependencies
 */
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  order: number;
}

export interface Promotion {
  id: string;
  title: string;
  discount: number;
  description: string;
  backgroundColor: string;
  image?: string;
  validFrom: Date;
  validTo: Date;
}
