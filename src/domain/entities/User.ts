export interface UserAddress {
  province?: string;
  district?: string;
  commune?: string;
  street?: string;
  detail?: string;
}

export interface User {
  id: string;
  email: string;
  userName?: string;
  phone?: string;
  avatar?: string;
  address?: UserAddress | null;
  role?: string;
  isVerified?: boolean;
  dateOfBirth?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  locked?: boolean;
}

export interface UpdateUserDto {
  userName?: string;
  phone?: string;
  dateOfBirth?: string | null;
  avatar?: string | null;
  address?: UserAddress | null;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}