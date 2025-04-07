const nodemailer = require("nodemailer");
require("dotenv").config();

// Cấu hình transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

const contact = async (name, email, phone, message) => {
    try {
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: process.env.MAIL_FROM_ADDRESS, // Gửi đến email công ty (có thể cấu hình trong biến môi trường)
            subject: `📩 Liên hệ mới từ ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                    <h2>Thông tin liên hệ mới:</h2>
                    <p><strong>Họ tên:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Số điện thoại:</strong> ${phone || 'Không cung cấp'}</p>
                    <p><strong>Nội dung:</strong></p>
                    <div style="background: #f9f9f9; padding: 10px; border-left: 3px solid #1e88e5;">
                        ${message}
                    </div>
                    <br>
                </div>
            `
        };

        // Gửi email
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email liên hệ đã được gửi về công ty: " + info.messageId);
    } catch (error) {
        console.error("❌ Gửi email thất bại:", error.message);
    }
};

const contactReplie = async( email, message) => {
    try {
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: email,
            subject: `📩 Liên hệ mới từ Travel VietNam`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                    <div style="background: #f9f9f9; padding: 10px; border-left: 3px solid #1e88e5;">
                        ${message}
                    </div>
                </div>
            `
        };
        const info = await transporter.sendMail(mailOptions)
        console.log("✅ Email liên hệ đã được gửi về khách hàng: " + info.messageId);
    } catch (error) {
        console.error("❌ Gửi email thất bại:", error.message);
    }
}

module.exports = { contact, contactReplie};
