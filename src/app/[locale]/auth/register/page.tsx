import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | DACN',
  description: 'Create a new account to get started',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
