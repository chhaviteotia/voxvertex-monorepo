import transporter from '../configs/nodemailer.config.js';
import { emailTemplate } from '../utils/emails/emailTemplate.js';

/**
 * Send email using nodemailer
 */
const sendEmail = async (to, subject, htmlContent, from = 'VoxVertex <noreply@voxvertex.com>') => {
  try {
    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
};

/**
 * Send email verification OTP
 */
export const sendEmailVerification = async (to, subject, htmlContent) => {
  try {
    // Generate the email body with OTP
    const emailHtml = emailTemplate(htmlContent.otp)
      .replace('[User]', htmlContent.username || 'User')
      .replace('[Your App Name]', htmlContent.appName || 'VoxVertex');

    // Send email
    const info = await sendEmail(to, subject, emailHtml);
    return info;
  } catch (error) {
    console.error('Error sending email verification:', error);
    throw error;
  }
};

