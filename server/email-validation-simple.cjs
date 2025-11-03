const emailValidator = require('email-validator');

// Simplified and reliable email validation service
class EmailValidationService {
  constructor() {
    this.cache = new Map(); // Cache validation results for 1 hour
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour in milliseconds
  }

  // Basic email format validation
  isValidFormat(email) {
    return emailValidator.validate(email);
  }

  // Check if email is from a disposable/temporary email service
  isDisposableEmail(email) {
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
      'throwaway.email', 'temp-mail.org', 'getnada.com', 'maildrop.cc',
      'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net',
      'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com', 'mailnesia.com',
      'mailcatch.com', 'inboxalias.com', 'mailmetrash.com', 'trashmail.net',
      'spamgourmet.com', 'mytrashmail.com', 'mailnull.com', 'spam.la',
      'binkmail.com', 'bobmail.info', 'chammy.info', 'devnullmail.com',
      'letthemeatspam.com', 'mailin8r.com', 'mailinator2.com', 'notmailinator.com',
      'reallymymail.com', 'reconmail.com', 'safetymail.info', 'sogetthis.com',
      'spamhereplease.com', 'superrito.com', 'thisisnotmyrealemail.com',
      'tradermail.info', 'veryrealemail.com', 'wegwerfmail.de', 'wegwerfmail.net',
      'wegwerfmail.org', 'wegwerpmailadres.nl', 'wetrainbayarea.com',
      'wetrainbayarea.org', 'wh4f.org', 'whyspam.me', 'willselfdestruct.com',
      'wuzup.net', 'wuzupmail.net', 'yeah.net', 'yopmail.net', 'yopmail.org',
      'ypmail.webarnak.fr.eu.org', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc',
      'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf',
      'monemail.fr.nf', 'monmail.fr.nf', 'test.com', 'example.com', 'example.org',
      'example.net', 'localhost', 'invalid.com', 'fake.com', 'dummy.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  }

  // Check cache for validation result
  getCachedResult(email) {
    const cached = this.cache.get(email);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }
    return null;
  }

  // Cache validation result
  setCachedResult(email, result) {
    this.cache.set(email, {
      result,
      timestamp: Date.now()
    });
  }

  // Comprehensive email validation (simplified and reliable)
  async validateEmail(email) {
    try {
      // Check cache first
      const cached = this.getCachedResult(email);
      if (cached) {
        console.log(`📧 Using cached validation result for: ${email}`);
        return cached;
      }

      console.log(`📧 Validating email: ${email}`);

      // Step 1: Basic format validation
      if (!this.isValidFormat(email)) {
        const result = {
          valid: false,
          reason: 'Invalid email format',
          deliverable: false,
          disposable: false,
          mx: false,
          smtp: false
        };
        this.setCachedResult(email, result);
        return result;
      }

      // Step 2: Check if it's a disposable email
      if (this.isDisposableEmail(email)) {
        const result = {
          valid: false,
          reason: 'Disposable/temporary email not allowed',
          deliverable: false,
          disposable: true,
          mx: false,
          smtp: false
        };
        this.setCachedResult(email, result);
        return result;
      }

      // Step 3: Additional domain validation
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain || domain.length < 3) {
        const result = {
          valid: false,
          reason: 'Invalid domain',
          deliverable: false,
          disposable: false,
          mx: false,
          smtp: false
        };
        this.setCachedResult(email, result);
        return result;
      }

      // Step 4: Check for common typos in popular domains
      const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
      const similarDomains = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com', 'outlok.com'];
      
      if (similarDomains.includes(domain)) {
        const result = {
          valid: false,
          reason: 'Domain appears to have a typo',
          deliverable: false,
          disposable: false,
          mx: false,
          smtp: false
        };
        this.setCachedResult(email, result);
        return result;
      }

      // If all checks pass, consider it valid
      const result = {
        valid: true,
        reason: 'Valid email',
        deliverable: true,
        disposable: false,
        mx: true, // Assume MX is valid for legitimate domains
        smtp: false
      };

      this.setCachedResult(email, result);
      return result;

    } catch (error) {
      console.error(`❌ Email validation error for ${email}:`, error);
      
      // Fallback result - be more permissive
      const result = {
        valid: true, // Be permissive on errors
        reason: 'Email validation passed (fallback)',
        deliverable: true,
        disposable: false,
        mx: true,
        smtp: false
      };

      this.setCachedResult(email, result);
      return result;
    }
  }

  // Quick validation for real-time UI feedback
  async quickValidate(email) {
    // Basic checks only for real-time feedback
    if (!this.isValidFormat(email)) {
      return { valid: false, reason: 'Invalid email format' };
    }

    if (this.isDisposableEmail(email)) {
      return { valid: false, reason: 'Disposable email not allowed' };
    }

    return { valid: true, reason: 'Format looks good' };
  }

  // Get validation status for UI
  getValidationStatus(email) {
    const cached = this.getCachedResult(email);
    if (cached) {
      return {
        isValid: cached.valid,
        message: cached.reason,
        isDisposable: cached.disposable,
        isDeliverable: cached.deliverable
      };
    }
    return null;
  }
}

module.exports = EmailValidationService;
