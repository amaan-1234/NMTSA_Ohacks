import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useOTPVerification } from '@/hooks/useOTPVerification';

interface OTPVerificationProps {
  email: string;
  onVerificationSuccess: (verificationToken: string) => void;
  onCancel: () => void;
  testingKeyword?: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerificationSuccess,
  onCancel,
  testingKeyword
}) => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // Start with 10 minutes
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  
  const { sendOTP, verifyOTP, isSendingOTP, isVerifyingOTP } = useOTPVerification();

  // Reset timer when component mounts
  useEffect(() => {
    setTimeLeft(600); // Reset to 10 minutes when modal opens
    setAttemptsLeft(3); // Reset attempts
    setOtp(''); // Clear OTP input
    setMessage(null); // Clear any previous messages
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setMessage({ type: 'error', text: 'Please enter the verification code' });
      return;
    }

    const result = await verifyOTP(email, otp.trim());
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        onVerificationSuccess(result.verificationToken!);
      }, 1000);
    } else {
      setMessage({ type: 'error', text: result.message });
      if (result.attemptsLeft !== undefined) {
        setAttemptsLeft(result.attemptsLeft);
      }
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    const result = await sendOTP(email);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeLeft(600); // 10 minutes
      setAttemptsLeft(3);
      setOtp('');
    } else {
      setMessage({ type: 'error', text: result.message });
      if (result.timeLeft) {
        setTimeLeft(result.timeLeft);
      }
    }
  };

  // Handle input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setOtp(value);
    if (message) setMessage(null); // Clear message when user types
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Testing keyword info */}
        {testingKeyword && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Development Mode:</strong> Use <code className="bg-gray-100 px-1 rounded font-mono">{testingKeyword}</code> as the verification code.
            </AlertDescription>
          </Alert>
        )}

        {/* Status message */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* OTP Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Verification Code</label>
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={handleOtpChange}
            className="text-center text-lg tracking-widest"
            maxLength={6}
            disabled={isVerifyingOTP}
          />
        </div>

        {/* Timer and attempts */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Code expired'}
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            {attemptsLeft} attempts left
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleVerifyOTP}
            disabled={!otp || otp.length !== 6 || isVerifyingOTP || timeLeft === 0}
            className="w-full"
          >
            {isVerifyingOTP ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isSendingOTP || timeLeft > 0}
              className="flex-1"
            >
              {isSendingOTP ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isVerifyingOTP || isSendingOTP}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Help text */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Check your email inbox and spam folder for the verification code.</p>
          <p>The code expires in 10 minutes.</p>
        </div>
      </CardContent>
    </Card>
  );
};
