import { useState, useCallback } from 'react';

interface OTPVerificationResult {
  success: boolean;
  message: string;
  verificationToken?: string;
  reason?: string;
  attemptsLeft?: number;
}

interface SendOTPResult {
  success: boolean;
  message: string;
  testingKeyword?: string;
  emailSent?: boolean;
  timeLeft?: number;
}

interface UseOTPVerificationReturn {
  sendOTP: (email: string) => Promise<SendOTPResult>;
  verifyOTP: (email: string, otp: string) => Promise<OTPVerificationResult>;
  getVerificationStatus: (email: string) => Promise<{
    hasPending: boolean;
    timeLeft: number;
    attemptsLeft: number;
  }>;
  isSendingOTP: boolean;
  isVerifyingOTP: boolean;
}

export const useOTPVerification = (): UseOTPVerificationReturn => {
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const sendOTP = useCallback(async (email: string): Promise<SendOTPResult> => {
    setIsSendingOTP(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message,
          testingKeyword: data.testingKeyword,
          emailSent: data.emailSent
        };
      } else {
        return {
          success: false,
          message: data.message,
          timeLeft: data.timeLeft
        };
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again later.'
      };
    } finally {
      setIsSendingOTP(false);
    }
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string): Promise<OTPVerificationResult> => {
    setIsVerifyingOTP(true);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message,
          verificationToken: data.verificationToken
        };
      } else {
        return {
          success: false,
          message: data.message,
          reason: data.reason,
          attemptsLeft: data.attemptsLeft
        };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again later.'
      };
    } finally {
      setIsVerifyingOTP(false);
    }
  }, []);

  const getVerificationStatus = useCallback(async (email: string) => {
    try {
      const response = await fetch(`/api/verification-status/${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success) {
        return {
          hasPending: data.hasPending,
          timeLeft: data.timeLeft,
          attemptsLeft: data.attemptsLeft
        };
      } else {
        return {
          hasPending: false,
          timeLeft: 0,
          attemptsLeft: 0
        };
      }
    } catch (error) {
      console.error('Get verification status error:', error);
      return {
        hasPending: false,
        timeLeft: 0,
        attemptsLeft: 0
      };
    }
  }, []);

  return {
    sendOTP,
    verifyOTP,
    getVerificationStatus,
    isSendingOTP,
    isVerifyingOTP
  };
};
