export interface User {
  id: string;
  email: string;
  name: string;
  // optional username coming from backend (sometimes called userName)
  userName?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: Date;
  // optional fields that exist on backend user document
  role?: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: Date;
}