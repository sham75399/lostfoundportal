const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone: phone || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        itemsLost: 0,
        itemsFound: 0,
        claimsMade: 0
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp('^' + email + '$', 'i') }
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // ✅ Get counts using Mongoose models
    const LostItem = require('../models/LostItem');
    const FoundItem = require('../models/FoundItem');
    const Claim = require('../models/Claim');
    
    const userId = user._id;

    const [lostCount, foundCount, claimsMade] = await Promise.all([
      LostItem.countDocuments({ user: userId }),
      FoundItem.countDocuments({ user: userId }),
      // ✅ ONLY count claims where user is the CLAIMANT (not owner)
      Claim.countDocuments({ claimant: userId })
    ]);

    console.log('📊 Login stats for', user.email, ':', {
      lostCount,
      foundCount,
      claimsMade
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        itemsLost: lostCount,
        itemsFound: foundCount,
        claimsMade: claimsMade
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    console.log('📝 Fetching user stats for:', req.userId);
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Get counts using Mongoose models
    const LostItem = require('../models/LostItem');
    const FoundItem = require('../models/FoundItem');
    const Claim = require('../models/Claim');
    
    const userId = user._id;

    const [lostCount, foundCount, claimsMade] = await Promise.all([
      LostItem.countDocuments({ user: userId }),
      FoundItem.countDocuments({ user: userId }),
      // ✅ ONLY count claims where user is the CLAIMANT (not owner)
      Claim.countDocuments({ claimant: userId })
    ]);

    console.log('📊 Profile stats for', user.email, ':', {
      lostCount,
      foundCount,
      claimsMade
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        itemsLost: lostCount,
        itemsFound: foundCount,
        claimsMade: claimsMade
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Forgot password - Send reset email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    console.log('📧 Forgot password request for:', email);

    const user = await User.findOne({
      email: { $regex: new RegExp('^' + email + '$', 'i') }
    });

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    console.log('✅ User found:', user.email);

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Lost & Found Portal" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request - Lost & Found Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.name}</strong>,</p>
              <p>We received a request to reset your password for your Lost & Found Portal account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>This link will expire in <strong>1 hour</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <hr>
              <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <a href="${resetUrl}" style="color: #1976d2; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Lost & Found Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Reset email sent to:', user.email);

    res.json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset email. Please try again later.'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('🔑 Reset password attempt...');

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('❌ Invalid token:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link. Please request a new one.'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ User not found for token:', decoded.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid reset link. Please request a new one.'
      });
    }

    user.password = password;
    await user.save();

    console.log('✅ Password reset successfully for:', user.email);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.avatar = avatar || user.avatar;

    await user.save();

    // ✅ Get updated counts
    const LostItem = require('../models/LostItem');
    const FoundItem = require('../models/FoundItem');
    const Claim = require('../models/Claim');
    
    const userId = user._id;

    const [lostCount, foundCount, claimsMade] = await Promise.all([
      LostItem.countDocuments({ user: userId }),
      FoundItem.countDocuments({ user: userId }),
      Claim.countDocuments({ 
        $or: [
          { claimant: userId },
          { owner: userId }
        ]
      })
    ]);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        itemsLost: lostCount,
        itemsFound: foundCount,
        claimsMade: claimsMade
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};