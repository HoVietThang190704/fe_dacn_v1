export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain a number');
  return errors;
};

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateLoginForm = (email: string, password: string): FormValidation => {
  const errors: Record<string, string> = {};
  
  if (!email) errors.email = 'Email is required';
  else if (!validateEmail(email)) errors.email = 'Invalid email format';
  
  if (!password) errors.password = 'Password is required';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};