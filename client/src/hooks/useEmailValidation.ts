import { useState, useCallback, useRef } from 'react';

interface EmailValidationResult {
  isValid: boolean;
  reason: string;
  isDisposable?: boolean;
  isDeliverable?: boolean;
  hasMxRecord?: boolean;
  hasTypo?: boolean;
}

interface UseEmailValidationReturn {
  validateEmail: (email: string) => Promise<EmailValidationResult>;
  quickValidateEmail: (email: string) => Promise<EmailValidationResult>;
  isValidating: boolean;
  validationCache: Map<string, EmailValidationResult>;
}

export const useEmailValidation = (): UseEmailValidationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const validationCache = useRef(new Map<string, EmailValidationResult>());

  const validateEmail = useCallback(async (email: string): Promise<EmailValidationResult> => {
    if (!email || !email.includes('@')) {
      return {
        isValid: false,
        reason: 'Invalid email format',
        isDisposable: false,
        isDeliverable: false,
        hasMxRecord: false,
        hasTypo: false
      };
    }

    // Check cache first
    const cached = validationCache.current.get(email);
    if (cached) {
      console.log(`📧 Using cached validation for: ${email}`);
      return cached;
    }

    setIsValidating(true);
    try {
      const response = await fetch('/api/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        const result: EmailValidationResult = {
          isValid: data.validation.isValid,
          reason: data.validation.reason,
          isDisposable: data.validation.isDisposable,
          isDeliverable: data.validation.isDeliverable,
          hasMxRecord: data.validation.hasMxRecord,
          hasTypo: data.validation.hasTypo
        };

        // Cache the result
        validationCache.current.set(email, result);
        return result;
      } else {
        const result: EmailValidationResult = {
          isValid: false,
          reason: data.message || 'Validation failed',
          isDisposable: false,
          isDeliverable: false,
          hasMxRecord: false,
          hasTypo: false
        };
        return result;
      }
    } catch (error) {
      console.error('Email validation error:', error);
      const result: EmailValidationResult = {
        isValid: false,
        reason: 'Validation service unavailable',
        isDisposable: false,
        isDeliverable: false,
        hasMxRecord: false,
        hasTypo: false
      };
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const quickValidateEmail = useCallback(async (email: string): Promise<EmailValidationResult> => {
    if (!email || !email.includes('@')) {
      return {
        isValid: false,
        reason: 'Invalid email format'
      };
    }

    try {
      const response = await fetch('/api/validate-email-quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          isValid: data.validation.isValid,
          reason: data.validation.reason
        };
      } else {
        return {
          isValid: false,
          reason: data.message || 'Quick validation failed'
        };
      }
    } catch (error) {
      console.error('Quick email validation error:', error);
      return {
        isValid: false,
        reason: 'Validation service unavailable'
      };
    }
  }, []);

  return {
    validateEmail,
    quickValidateEmail,
    isValidating,
    validationCache: validationCache.current
  };
};
