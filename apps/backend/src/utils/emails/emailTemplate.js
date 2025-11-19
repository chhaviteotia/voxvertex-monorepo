/**
 * Email Templates
 * HTML templates for various email types
 */

/**
 * Email verification template with OTP
 */
export const emailTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 30px;
      background-color: #f9f9f9;
    }
    .otp-box {
      background-color: #ff6600;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
    <p>Thank you for signing up! Use the OTP below to verify your email address:</p>
    
    <div class="otp-box">
      ${otp}
    </div>
    
    <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
    
    <div class="footer">
      <p>© VoxVertex - All rights reserved</p>
    </div>
  </div>
</body>
</html>
`;

