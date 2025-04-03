const { emailQueue } = require('../config/redis');
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

module.exports = emailQueue;
