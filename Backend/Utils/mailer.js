require("dotenv").config();

const Brevo = require("@getbrevo/brevo");

const client = new Brevo.TransactionalEmailsApi();
client.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendResetPasswordEmail = async (email, token) => {
  try {
    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    const logoLink =
      "https://res.cloudinary.com/dsedsszhf/image/upload/v1746165075/Beyond_Man_Logo_Circle_ousnw2.png";

    const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #ffffff;">
            <div style="text-align: center;">
                <!-- Company Logo -->
                <img src="${logoLink}" alt="Company Logo" style="max-width: 150px; margin-bottom: 20px;">
            </div>
            <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
            <p style="font-size: 16px; color: #555; text-align: center;">
                We received a request to reset your password. Click the button below to set a new password.
            </p>
    
            <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" 
                   style="background-color: #4361ee; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block; font-size: 16px;">
                   Reset Password
                </a>
            </div>
    
            <p style="font-size: 14px; color: #777; text-align: center;">
                If you didn't request this, you can safely ignore this email.
            </p>
    
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
    
            <p style="font-size: 12px; color: #777; text-align: center;">
                If you're having trouble clicking the button, copy and paste this link in your browser: 
                <br>
                <a href="${resetLink}" style="color: #4361ee;">${resetLink}</a>
            </p>
    
            <p style="font-size: 12px; color: #777; text-align: center;">
                Need help? Contact our support team at <a href="mailto:beyondman.dev@gmail.com" style="color: #4361ee;">beyondman.dev@gmail.com</a>.
            </p>
        </div>
      `;

    await client.sendTransacEmail({
      sender: { name: "Beyond Man", email: "noreply@beyondman.dev" },
      to: [{ email }],
      subject: "🔒 Reset Your Password",
      htmlContent: emailTemplate,
    });
  } catch (error) {
    res.render("error.ejs", {
      message: "An error occurred while Forgot Password. Please try again.",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

const sendOTPEmail = async (email, otp) => {
  const logoLink =
    "https://res.cloudinary.com/dsedsszhf/image/upload/v1746165075/Beyond_Man_Logo_Circle_ousnw2.png";

  const emailTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #ffffff;">
      <div style="text-align: center;">
          <!-- Company Logo -->
          <img src="${logoLink}" alt="Beyond Man Logo" style="max-width: 150px; margin-bottom: 20px;">
      </div>
      
      <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
      
      <p style="font-size: 16px; color: #555; text-align: center;">
          Thank you for registering with Beyond Man! Use the OTP code below to verify your email address:
      </p>

      <!-- OTP Code Box -->
      <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              <p style="margin: 0; font-size: 14px; color: #ffffff; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Your OTP Code</p>
              <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
              </p>
          </div>
      </div>

      <p style="font-size: 14px; color: #777; text-align: center; margin: 20px 0;">
          <strong>⏱️ This code will expire in 10 minutes.</strong>
      </p>

      <p style="font-size: 14px; color: #555; text-align: center; background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #4361ee;">
          💡 <strong>Tip:</strong> Never share this OTP with anyone. Beyond Man will never ask for your OTP via phone or email.
      </p>

      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">

      <p style="font-size: 14px; color: #777; text-align: center;">
          If you didn't request this verification code, please ignore this email or contact our support team immediately.
      </p>

      <p style="font-size: 12px; color: #777; text-align: center; margin-top: 20px;">
          Need help? Contact our support team at <a href="mailto:beyondman.dev@gmail.com" style="color: #4361ee; text-decoration: none;">beyondman.dev@gmail.com</a>
      </p>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; margin: 5px 0;">
              © 2024 Beyond Man. All rights reserved.
          </p>
          <p style="font-size: 11px; color: #aaa; margin: 5px 0;">
              This is an automated message, please do not reply to this email.
          </p>
      </div>
  </div>
  `;

  await client.sendTransacEmail({
    sender: { name: "Beyond Man", email: "noreply@beyondman.dev" },
    to: [{ email }],
    subject: "Verify Your Email - OTP Code",
    htmlContent: emailTemplate,
  });
};

// Optional: Resend OTP email with different messaging
const sendResendOTPEmail = async (email, otp) => {
  const logoLink =
    "https://res.cloudinary.com/dsedsszhf/image/upload/v1746165075/Beyond_Man_Logo_Circle_ousnw2.png";

  const emailTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #ffffff;">
      <div style="text-align: center;">
          <img src="${logoLink}" alt="Beyond Man Logo" style="max-width: 150px; margin-bottom: 20px;">
      </div>
      
      <h2 style="color: #333; text-align: center;">New OTP Code Requested</h2>
      
      <p style="font-size: 16px; color: #555; text-align: center;">
          You requested a new verification code. Here's your new OTP:
      </p>

      <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              <p style="margin: 0; font-size: 14px; color: #ffffff; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Your New OTP Code</p>
              <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
              </p>
          </div>
      </div>

      <p style="font-size: 14px; color: #777; text-align: center; margin: 20px 0;">
          <strong>⏱️ This code will expire in 10 minutes.</strong>
      </p>

      <p style="font-size: 14px; color: #555; text-align: center; background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
          ⚠️ <strong>Security Alert:</strong> Your previous OTP code has been invalidated. If you didn't request a new code, please secure your account immediately.
      </p>

      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">

      <p style="font-size: 12px; color: #777; text-align: center;">
          Need help? Contact our support team at <a href="mailto:beyondman.dev@gmail.com" style="color: #4361ee; text-decoration: none;">beyondman.dev@gmail.com</a>
      </p>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; margin: 5px 0;">
              © 2024 Beyond Man. All rights reserved.
          </p>
      </div>
  </div>
  `;

  await client.sendTransacEmail({
    sender: { name: "Beyond Man", email: "noreply@beyondman.dev" },
    to: [{ email }],
    subject: "New Verification Code - Beyond Man",
    htmlContent: emailTemplate,
  });
};

module.exports = { sendOTPEmail, sendResendOTPEmail, sendResetPasswordEmail };
