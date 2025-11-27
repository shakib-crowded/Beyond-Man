const nodemailer = require("nodemailer");
require("dotenv").config();

const Brevo = require("@getbrevo/brevo");

const client = new Brevo.TransactionalEmailsApi();
client.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendResetEmail = async (email, token) => {
  const resetLink = `https://beyondman.dev/reset-password/${token}`;
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
    sender: { name: "Beyond Man", email: "<noreply>@beyondman.dev" },
    to: [{ email }],
    subject: "🔒 Reset Your Password",
    htmlContent: emailTemplate,
  });

  // await transporter.sendMail({
  //   from: `"Beyond Man" <${process.env.EMAIL_USER}>`,
  //   to: email,
  //   subject: "🔒 Reset Your Password",
  //   html: emailTemplate,
  // });
};

const verifyEmail = async (email, token) => {
  const verificationUrl = `https://beyondman.dev/verify/${token}`;
  const logoLink =
    "https://res.cloudinary.com/dsedsszhf/image/upload/v1746165075/Beyond_Man_Logo_Circle_ousnw2.png";

  const emailTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #ffffff;">
      <div style="text-align: center;">
          <!-- Company Logo -->
          <img src="${logoLink}" alt="Company Logo" style="max-width: 150px; margin-bottom: 20px;">
      </div>
      <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
      <p style="font-size: 16px; color: #555; text-align: center;">
          Click the button below to verify your email:
      </p>

      <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4361ee; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block; font-size: 16px;">
             Verify Email
          </a>
      </div>

      <p style="font-size: 14px; color: #777; text-align: center;">
          If you didn't request this, you can safely ignore this email.
      </p>

      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">

      <p style="font-size: 12px; color: #777; text-align: center;">
          If you're having trouble clicking the button, copy and paste this link in your browser: 
          <br>
          <a href="${verificationUrl}" style="color: #4361ee;">${verificationUrl}</a>
      </p>

      <p style="font-size: 12px; color: #777; text-align: center;">
          Need help? Contact our support team at <a href="mailto:beyondman.dev@gmail.com" style="color: #4361ee;">beyondman.dev@gmail.com</a>.
      </p>
  </div>
`;

  await transporter.sendMail({
    from: `"Beyond Man" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: emailTemplate,
  });
};

module.exports = { sendResetEmail, verifyEmail };
