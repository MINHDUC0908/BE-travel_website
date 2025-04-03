const nodemailer = require("nodemailer");
const fs = require('fs');
require("dotenv").config();

// Cấu hình transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // TLS sử dụng `false`
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

// Hàm gửi email với file đính kèm
const sendEmail = async (to, subject, text, attachmentPath) => {
    try {
        // Kiểm tra xem tệp đính kèm có tồn tại hay không
        if (attachmentPath && !fs.existsSync(attachmentPath)) {
            throw new Error(`Tệp đính kèm không tồn tại: ${attachmentPath}`);
        }

        const info = await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: to,
            subject: subject,
            html: text,
            attachments: attachmentPath ? [
                {
                    filename: 'qr_code.png',
                    path: attachmentPath,
                    cid: "qrcode" // Đảm bảo khớp với cid trong HTML
                }
            ] : []
        });
        console.log("✅ Email sent successfully: " + info.messageId);
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error; // Ném lỗi để emailQueue xử lý
    }
};

// Hàm gửi email xác thực
const sendVerificationEmail = async (to, verificationToken) => {
    try {
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: to,
            subject: 'Xác thực email của bạn',
            html: `
                <p>Vui lòng nhấp vào liên kết dưới đây để xác thực email của bạn:</p>
                <a href="http://localhost:5173/verify-email/${verificationToken}">Xác thực email</a>
            `
        };
        console.log("Gửi mail thành công!!!")
        // Gửi email
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Verification email sent successfully: " + info.messageId);
    } catch (error) {
        console.error("❌ Error sending verification email:", error);
        throw error;
    }
};
module.exports = { sendEmail, sendVerificationEmail };