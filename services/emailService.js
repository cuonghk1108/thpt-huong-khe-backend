import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../middleware/logger.js';

dotenv.config();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    logger.warn('Email service verification failed:', error);
  } else {
    logger.info('Email service ready');
  }
});

export class EmailService {
  // Send contact form email
  static async sendContactFormEmail(name, email, phone, subject, message) {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #0066cc;">Thông báo liên hệ mới từ website</h2>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Tên:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Điện thoại:</strong> ${phone}</p>
            <p><strong>Chủ đề:</strong> ${subject}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0066cc;">
            <p><strong>Nội dung:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Email này được gửi từ website THPT Hương Khê. 
            Hãy phản hồi trực tiếp đến ${email} hoặc gọi ${phone}.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        replyTo: email,
        subject: `[Website THPT Hương Khê] ${subject}`,
        html: htmlContent
      });

      logger.info('Contact email sent', { fromEmail: email, subject });
      return { success: true };
    } catch (error) {
      logger.error('Failed to send contact email:', error);
      throw error;
    }
  }

  // Send news notification email
  static async sendNewsNotificationEmail(recipientEmail, newsTitle, newsExcerpt, newsUrl) {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #0066cc;">📰 Tin tức mới từ THPT Hương Khê</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #0066cc; margin-top: 0;">${newsTitle}</h3>
            <p>${newsExcerpt}</p>
            <a href="${newsUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
              Đọc thêm →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Bạn nhận được email này vì bạn đã đăng ký nhận thông báo từ website THPT Hương Khê.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `[THPT Hương Khê] 📰 ${newsTitle}`,
        html: htmlContent
      });

      logger.info('News notification sent', { recipient: recipientEmail, title: newsTitle });
      return { success: true };
    } catch (error) {
      logger.error('Failed to send news notification:', error);
      throw error;
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(recipientEmail, resetToken, resetLink) {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #0066cc;">🔐 Yêu cầu đặt lại mật khẩu</h2>
          
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Admin của website THPT Hương Khê.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="color: #666; margin: 0 0 15px;">Click nút bên dưới để đặt lại mật khẩu:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Đặt lại mật khẩu
            </a>
            <p style="color: #666; margin: 15px 0 0; font-size: 12px;">
              Liên kết này có hiệu lực trong 24 giờ
            </p>
          </div>

          <p style="color: #666;">Hoặc copy và paste đường dẫn này vào trình duyệt:</p>
          <p style="background-color: #f9f9f9; padding: 10px; word-break: break-all; font-family: monospace; font-size: 12px;">
            ${resetLink}
          </p>

          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: '[THPT Hương Khê] 🔐 Yêu cầu đặt lại mật khẩu',
        html: htmlContent
      });

      logger.info('Password reset email sent', { recipient: recipientEmail });
      return { success: true };
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  // Send event notification email
  static async sendEventNotificationEmail(recipientEmail, eventTitle, eventDate, eventLocation, eventUrl) {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #0066cc;">📅 Sự kiện mới từ THPT Hương Khê</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #0066cc; margin-top: 0;">${eventTitle}</h3>
            <p style="margin: 10px 0;">
              <strong>📅 Ngày:</strong> ${new Date(eventDate).toLocaleDateString('vi-VN')}
            </p>
            <p style="margin: 10px 0;">
              <strong>📍 Địa điểm:</strong> ${eventLocation}
            </p>
            <a href="${eventUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
              Xem chi tiết →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Email này được gửi từ website chính thức của THPT Hương Khê.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `[THPT Hương Khê] 📅 Sự kiện: ${eventTitle}`,
        html: htmlContent
      });

      logger.info('Event notification sent', { recipient: recipientEmail, event: eventTitle });
      return { success: true };
    } catch (error) {
      logger.error('Failed to send event notification:', error);
      throw error;
    }
  }

  // Send bulk email
  static async sendBulkEmail(recipients, subject, htmlContent) {
    try {
      const results = {
        sent: 0,
        failed: 0,
        errors: []
      };

      for (const recipient of recipients) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipient,
            subject,
            html: htmlContent
          });
          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push({ email: recipient, error: error.message });
        }
      }

      logger.info('Bulk email sent', results);
      return results;
    } catch (error) {
      logger.error('Failed to send bulk email:', error);
      throw error;
    }
  }
}

export default EmailService;
