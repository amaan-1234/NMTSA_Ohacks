const nodemailer = require('nodemailer');

// Create a simple email service
class EmailService {
  constructor() {
    // For development, we'll use a test account
    // In production, you'd use real SMTP credentials
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'test-password'
      }
    });
  }

  async sendOTPEmail(email, otp) {
    try {
      console.log(`📧 Attempting to send OTP email to: ${email}`);
      
      // Check if we have real SMTP credentials
      const hasRealCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS && 
                                 process.env.EMAIL_USER !== 'test@example.com' && 
                                 process.env.EMAIL_PASS !== 'test-password';
      
      if (!hasRealCredentials) {
        // Development mode - just log
        console.log(`📧 OTP email would be sent to: ${email}`);
        console.log(`📧 Subject: NMTSA Account Verification Code`);
        console.log(`📧 OTP Code: ${otp}`);
        console.log(`📧 Content: Your verification code is ${otp}. This code expires in 10 minutes.`);
        console.log(`⚠️  To enable real email sending, set EMAIL_USER and EMAIL_PASS environment variables`);
        
        return { success: true, message: 'OTP email logged (development mode)' };
      }
      
      // Production mode - send real email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'NMTSA Account Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; padding: 30px; text-align: center;">
              <h1>NMTSA Account Verification</h1>
              <p>Neurologic Music Therapy Services of Arizona</p>
            </div>
            <div style="padding: 30px; background: white;">
              <h2>Your Verification Code</h2>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="color: #1e40af; font-size: 36px; margin: 0; letter-spacing: 4px;">${otp}</h1>
              </div>
              <p>Enter this code to complete your account registration.</p>
              <p><strong>This code expires in 10 minutes.</strong></p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
              <p>© 2025 NMTSA. All rights reserved.</p>
              <p>This is an automated verification email.</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent successfully to ${email}`);
      
      return { success: true, message: 'OTP email sent successfully' };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      return { success: false, message: 'Failed to send OTP email' };
    }
  }

  async sendWelcomeEmail(email) {
    try {
      console.log(`📧 Attempting to send welcome email to: ${email}`);
      
      // Check if we have real SMTP credentials
      const hasRealCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS && 
                                 process.env.EMAIL_USER !== 'test@example.com' && 
                                 process.env.EMAIL_PASS !== 'test-password';
      
      if (!hasRealCredentials) {
        // Development mode - just log
        console.log(`📧 Welcome email would be sent to: ${email}`);
        console.log(`📧 Subject: Welcome to NMTSA Newsletter!`);
        console.log(`📧 Content: Thank you for subscribing to our newsletter. You'll receive updates about new courses and CE opportunities.`);
        console.log(`⚠️  To enable real email sending, set EMAIL_USER and EMAIL_PASS environment variables`);
        
        return { success: true, message: 'Welcome email logged (development mode)' };
      }
      
      // Production mode - send real email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to NMTSA Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; padding: 30px; text-align: center;">
              <h1>Welcome to NMTSA!</h1>
              <p>Neurologic Music Therapy Services of Arizona</p>
            </div>
            <div style="padding: 30px; background: white;">
              <h2>Thank you for subscribing!</h2>
              <p>You're now part of our community and will receive:</p>
              <ul>
                <li>Updates on new courses</li>
                <li>Continuing Education opportunities</li>
                <li>Latest news from NMTSA</li>
                <li>Special offers and discounts</li>
              </ul>
              <p>We're excited to have you on board!</p>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
              <p>© 2025 NMTSA. All rights reserved.</p>
              <p>You received this email because you subscribed to our newsletter.</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully to ${email}`);
      
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, message: 'Failed to send welcome email' };
    }
  }
}

module.exports = EmailService;
