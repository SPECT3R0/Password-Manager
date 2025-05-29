import DOMPurify from 'dompurify';

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!PASSWORD_REGEX.test(password)) {
    errors.push(
      'Password must contain at least 8 characters, one uppercase letter, ' +
      'one lowercase letter, one number, and one special character'
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!EMAIL_REGEX.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!USERNAME_REGEX.test(username)) {
    errors.push('Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const validatePasswordEntry = (entry: {
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (!entry.title.trim()) {
    errors.push('Title is required');
  }
  
  if (!entry.username.trim()) {
    errors.push('Username is required');
  }
  
  if (!entry.password) {
    errors.push('Password is required');
  }
  
  if (entry.website && !entry.website.startsWith('http://') && !entry.website.startsWith('https://')) {
    errors.push('Website must start with http:// or https://');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 