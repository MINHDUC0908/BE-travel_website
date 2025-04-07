const { emailQueue, contactQueue, contactRepQueue } = require('../config/redis');
const { contactReplie, contact} = require('../mail/contactMail');
const { sendEmail } = require('../mail/mailer');

emailQueue.process(async (job) => {
    const { to, subject, text, qrCodePath } = job.data;

    try {
        await sendEmail(to, subject, text, qrCodePath);
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
    }
});


contactQueue.process(async (job) => {
    const { name, email, phone, message } = job.data;

    try {
        // Gọi hàm gửi email thông báo liên hệ
        await contact(name, email, phone, message);
        console.log(`📧 Contact email sent to ${email}`);
    } catch (error) {
        console.log(`📧 Contact email sent to ${email}`);
    }
});


contactRepQueue.process(async (job) => {
    const { email, message } = job.data

    try {
        await contactReplie(email, message)
        console.log(`📧 Contact email sent to ${email}`);
    } catch (error) {
        console.log(`📧 Contact email sent to ${email}`);
    }
})
module.exports = { emailQueue, contactQueue, contactRepQueue };
