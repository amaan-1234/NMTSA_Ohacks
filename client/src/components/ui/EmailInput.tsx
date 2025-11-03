import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useEmailValidation } from '@/hooks/useEmailValidation';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showValidation?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your email",
  disabled = false,
  showValidation = true,
  onValidationChange,
  className = ""
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    reason: string;
    isDisposable?: boolean;
    isDeliverable?: boolean;
  } | null>(null);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  
  const { quickValidateEmail } = useEmailValidation();

  // Debounced validation
  useEffect(() => {
    if (!value || !showValidation) {
      setValidationResult(null);
      setShowValidationMessage(false);
      onValidationChange?.(true); // Default to valid if no validation
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = await quickValidateEmail(value);
        setValidationResult(result);
        setShowValidationMessage(true);
        onValidationChange?.(result.isValid);
      } catch (error) {
        console.error('Validation error:', error);
        setValidationResult({
          isValid: false,
          reason: 'Validation failed'
        });
        setShowValidationMessage(true);
        onValidationChange?.(false);
      } finally {
        setIsValidating(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [value, showValidation, quickValidateEmail, onValidationChange]);

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (!showValidationMessage || !validationResult) {
      return null;
    }

    if (validationResult.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getValidationMessage = () => {
    if (!showValidationMessage || !validationResult) {
      return null;
    }

    if (validationResult.isValid) {
      return (
        <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
          <CheckCircle className="h-3 w-3" />
          {validationResult.reason}
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
          <XCircle className="h-3 w-3" />
          {validationResult.reason}
        </div>
      );
    }
  };

  const getInputBorderColor = () => {
    if (!showValidationMessage || !validationResult) {
      return "";
    }
    
    if (validationResult.isValid) {
      return "border-green-500 focus:border-green-500";
    } else {
      return "border-red-500 focus:border-red-500";
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="relative">
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-8 ${getInputBorderColor()}`}
        />
        {showValidation && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>
      {showValidation && getValidationMessage()}
    </div>
  );
};
