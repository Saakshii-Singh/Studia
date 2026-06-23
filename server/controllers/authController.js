const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

async function sendVerificationEmail(email, code) {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    try {
      const port = parseInt(process.env.SMTP_PORT || "465");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 5000,
        socketTimeout: 5000,
        tls: {
          rejectUnauthorized: false,
        },
           family: 4,
      });

      const mailOptions = {
        from: `"Studia Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify your Studia Account 📚",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2d9f3; border-radius: 16px; background-color: #f7f5fd;">
            <h2 style="color: #8b5cf6; text-align: center;">Welcome to Studia! 📚</h2>
            <p>Thank you for joining our community. To complete your account registration, please enter the following 6-digit verification code on the dashboard:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #130a2c; background-color: #fff; border: 2px dashed #8b5cf6; padding: 15px; margin: 20px 0; border-radius: 12px;">
              ${code}
            </div>
            <p style="color: #a69cb8; font-size: 13px; text-align: center;">This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent successfully to: ${email}`);
      return true;
    } catch (error) {
      console.error(`Error sending email to ${email}:`, error.message);
    }
  }

  // Fallback (or development helper): Log inside terminal with beautiful ANSI border
  console.log(`
┌────────────────────────────────────────────────────────┐
│  📚 STUDIA EMAIL VERIFICATION SERVICE                  │
├────────────────────────────────────────────────────────┤
│  Recipient:  \x1b[35m${email.padEnd(41)}\x1b[0m │
│  OTP Code:   \x1b[36m\x1b[1m${code}\x1b[0m (Expires in 10 minutes)     │
├────────────────────────────────────────────────────────┤
│  Copy the OTP above to verify your account in the UI.  │
└────────────────────────────────────────────────────────┘
`);
  return false;
}

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpires,
      isVerified: false
    });

    const isRealEmailSent = await sendVerificationEmail(email, verificationCode);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "studiatogether_secret_key_112233",
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        xp: user.xp,
        isVerified: user.isVerified
      },
      ...(!isRealEmailSent ? { devCode: verificationCode } : {})
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET || "studiatogether_secret_key_112233",
  { expiresIn: "7d" }
);

    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    user.isVerified = true;
    user.verificationCode = "";
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Account verified successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        xp: user.xp,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    const newCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCode = newCode;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const isRealEmailSent = await sendVerificationEmail(user.email, newCode);

    res.status(200).json({
      message: "A fresh verification code has been sent to your email.",
      ...(!isRealEmailSent ? { devCode: newCode } : {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};