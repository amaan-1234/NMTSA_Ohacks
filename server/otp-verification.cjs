const crypto = require('crypto');

// OTP Verification Service
class OTPVerificationService {
  constructor() {
    this.otpStorage = new Map(); // In production, use Redis or database
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes
    this.testingKeyword = '786786'; // Fallback for development
  }

  // Generate a random 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate a verification token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Store OTP with email and expiry
  storeOTP(email, otp, verificationToken) {
    const expiryTime = Date.now() + this.otpExpiry;
    this.otpStorage.set(email, {
      otp,
      verificationToken,
      expiryTime,
      attempts: 0,
      maxAttempts: 3
    });
    
    console.log(`📧 OTP stored for ${email}: ${otp} (expires in 10 minutes)`);
    return { otp, verificationToken, expiryTime };
  }

  // Verify OTP
  verifyOTP(email, providedOTP) {
    const stored = this.otpStorage.get(email);
    
    if (!stored) {
      return { 
        success: false, 
        message: 'No OTP found for this email. Please request a new one.',
        reason: 'not_found'
      };
    }

    // Check if OTP has expired
    if (Date.now() > stored.expiryTime) {
      this.otpStorage.delete(email);
      return { 
        success: false, 
        message: 'OTP has expired. Please request a new one.',
        reason: 'expired'
      };
    }

    // Check attempt limit
    if (stored.attempts >= stored.maxAttempts) {
      this.otpStorage.delete(email);
      return { 
        success: false, 
        message: 'Too many failed attempts. Please request a new OTP.',
        reason: 'max_attempts'
      };
    }

    // Check if it's the testing keyword
    if (providedOTP === this.testingKeyword) {
      console.log(`✅ Testing keyword used for ${email}`);
      this.otpStorage.delete(email);
      return { 
        success: true, 
        message: 'Email verified successfully!',
        verificationToken: stored.verificationToken
      };
    }

    // Verify actual OTP
    if (providedOTP === stored.otp) {
      console.log(`✅ OTP verified for ${email}`);
      this.otpStorage.delete(email);
      return { 
        success: true, 
        message: 'Email verified successfully!',
        verificationToken: stored.verificationToken
      };
    } else {
      // Increment failed attempts
      stored.attempts++;
      this.otpStorage.set(email, stored);
      
      return { 
        success: false, 
        message: `Invalid OTP. ${stored.maxAttempts - stored.attempts} attempts remaining.`,
        reason: 'invalid_otp',
        attemptsLeft: stored.maxAttempts - stored.attempts
      };
    }
  }

  // Check if email has pending verification
  hasPendingVerification(email) {
    const stored = this.otpStorage.get(email);
    if (!stored) return false;
    
    // Clean up expired OTPs
    if (Date.now() > stored.expiryTime) {
      this.otpStorage.delete(email);
      return false;
    }
    
    return true;
  }

  // Get verification status
  getVerificationStatus(email) {
    const stored = this.otpStorage.get(email);
    if (!stored) {
      return { hasPending: false, timeLeft: 0 };
    }
    
    const timeLeft = Math.max(0, stored.expiryTime - Date.now());
    return { 
      hasPending: true, 
      timeLeft: Math.ceil(timeLeft / 1000), // seconds
      attemptsLeft: stored.maxAttempts - stored.attempts
    };
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [email, data] of this.otpStorage.entries()) {
      if (now > data.expiryTime) {
        this.otpStorage.delete(email);
        console.log(`🧹 Cleaned up expired OTP for ${email}`);
      }
    }
  }

  // Get testing keyword for development
  getTestingKeyword() {
    return this.testingKeyword;
  }
}

module.exports = OTPVerificationService;
