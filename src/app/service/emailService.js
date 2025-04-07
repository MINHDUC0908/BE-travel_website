const { emailQueue, contactQueue, contactRepQueue } = require('../../config/redis');

async function sendEmailQueue(to, subject, text) {
    try {
        await emailQueue.add({ to, subject, text }); // Thêm email vào hàng đợi
        console.log(`📤 Email added to queue: ${to}`);
    } catch (error) {
        console.error("❌ Error adding email to queue:", error);
    }
}


async function processEmailQueue({ name, email, phone, message }) 
{
    try {
        await contactQueue.add({ name, email, phone, message }); // Thêm email vào hàng đợi
        console.log(`📤 Email added to queue: ${email}`);
    } catch (error) {
        console.error("❌ Error processing email queue:", error);
    }
}


async function processEmailRepQueue({ email, message }) 
{
    try {
        await contactRepQueue.add({ email, message }); // Thêm email vào hàng đợi
        console.log(`📤 Email added to queue: ${email}`);
    } catch (error) {
        console.error("❌ Error processing email queue:", error);
    }
}
// async function checkQueue() {
//     const jobCounts = await emailQueue.getJobCounts();
//     console.log("📊 Hàng đợi email:", jobCounts);
// }

// checkQueue();
module.exports = { sendEmailQueue, processEmailQueue, processEmailRepQueue };
