const { emailQueue } = require('../../config/redis');

async function sendEmailQueue(to, subject, text) {
    try {
        await emailQueue.add({ to, subject, text }); // Thêm email vào hàng đợi
        console.log(`📤 Email added to queue: ${to}`);
    } catch (error) {
        console.error("❌ Error adding email to queue:", error);
    }
}
// async function checkQueue() {
//     const jobCounts = await emailQueue.getJobCounts();
//     console.log("📊 Hàng đợi email:", jobCounts);
// }

// checkQueue();
module.exports = { sendEmailQueue };
