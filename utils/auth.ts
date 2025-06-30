// utils/auth.ts
import { Alert } from 'react-native';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AuthError {
  code: string;
  message: string;
  longMessage?: string;
  meta?: Record<string, any>;
}

// Enhanced validation utilities
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Full name is required');
  } else {
    if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.push('Name can only contain letters and spaces');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Enhanced error handling for Clerk
export const handleClerkError = (error: any): AuthError => {
  console.error('Clerk error:', JSON.stringify(error, null, 2));
  
  // Default error
  let authError: AuthError = {
    code: 'unknown_error',
    message: 'An unexpected error occurred. Please try again.',
  };
  
  if (error?.errors && error.errors[0]) {
    const clerkError = error.errors[0];
    
    switch (clerkError.code) {
      case 'form_identifier_exists':
        authError = {
          code: 'email_exists',
          message: 'An account with this email already exists.',
          longMessage: 'Please try logging in instead, or use a different email address.',
        };
        break;
        
      case 'form_password_incorrect':
        authError = {
          code: 'invalid_credentials',
          message: 'Invalid email or password.',
          longMessage: 'Please check your credentials and try again.',
        };
        break;
        
      case 'form_identifier_not_found':
        authError = {
          code: 'account_not_found',
          message: 'No account found with this email.',
          longMessage: 'Please check your email or create a new account.',
        };
        break;
        
      case 'verification_invalid':
        authError = {
          code: 'invalid_verification',
          message: 'Invalid verification code.',
          longMessage: 'Please check the code and try again, or request a new one.',
        };
        break;
        
      case 'verification_expired':
        authError = {
          code: 'expired_verification',
          message: 'Verification code has expired.',
          longMessage: 'Please request a new verification code.',
        };
        break;
        
      case 'too_many_requests':
        authError = {
          code: 'rate_limit',
          message: 'Too many attempts. Please try again later.',
          longMessage: 'Please wait a few minutes before trying again.',
        };
        break;
        
      default:
        authError = {
          code: clerkError.code || 'unknown_error',
          message: clerkError.message || 'An error occurred. Please try again.',
        };
    }
  }
  
  return authError;
};

// Secure alert helper
export const showSecureAlert = (title: string, message: string, longMessage?: string) => {
  Alert.alert(
    title,
    longMessage || message,
    [
      {
        text: 'OK',
        style: 'default',
      },
    ],
    {
      cancelable: true,
    }
  );
};

// Biometric authentication helper (if you want to add biometric support)
export const isBiometricSupported = async (): Promise<boolean> => {
  // This would require react-native-biometrics or similar library
  // Placeholder implementation
  return false;
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number> = new Map();
  private timestamps: Map<string, number> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  canAttempt(key: string): boolean {
    const now = Date.now();
    const lastAttempt = this.timestamps.get(key) || 0;
    
    // Reset if window has passed
    if (now - lastAttempt > this.windowMs) {
      this.attempts.delete(key);
      this.timestamps.delete(key);
    }
    
    const attempts = this.attempts.get(key) || 0;
    return attempts < this.maxAttempts;
  }
  
  recordAttempt(key: string): void {
    const attempts = this.attempts.get(key) || 0;
    this.attempts.set(key, attempts + 1);
    this.timestamps.set(key, Date.now());
  }
  
  getRemainingAttempts(key: string): number {
    const attempts = this.attempts.get(key) || 0;
    return Math.max(0, this.maxAttempts - attempts);
  }
  
  getTimeUntilReset(key: string): number {
    const lastAttempt = this.timestamps.get(key) || 0;
    const now = Date.now();
    return Math.max(0, this.windowMs - (now - lastAttempt));
  }
}

// Security utilities
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isStrongPassword = (password: string): boolean => {
  return validatePassword(password).isValid;
};

// Network security check
export const isSecureConnection = (): boolean => {
  // In a real app, you might want to check if running on HTTPS
  return process.env.NODE_ENV === 'production';
};

// Session management
export interface SessionInfo {
  isExpired: boolean;
  expiresAt?: Date;
  remainingTime?: number;
}

export const getSessionInfo = (session: any): SessionInfo => {
  if (!session) {
    return { isExpired: true };
  }
  
  const now = new Date();
  const expiresAt = session.expireAt ? new Date(session.expireAt) : null;
  
  if (expiresAt && now > expiresAt) {
    return { isExpired: true, expiresAt };
  }
  
  const remainingTime = expiresAt ? expiresAt.getTime() - now.getTime() : null;
  
  return {
    isExpired: false,
    expiresAt: expiresAt || undefined,
    remainingTime: remainingTime || undefined,
  };
};