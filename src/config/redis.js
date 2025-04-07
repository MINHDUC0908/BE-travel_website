const Queue = require('bull');

const emailQueue = new Queue('emailQueue', {
    redis: { host: '127.0.0.1', port: 6380 }
});

// Tạo hàng đợi cho việc gửi email liên hệ
const contactQueue = new Queue('contactQueue', {
    redis: { host: '127.0.0.1', port: 6380 } // Cấu hình kết nối Redis
});


const contactRepQueue = new Queue('contactRepQueue', {
    redis: { host: '127.0.0.1', port: 6380 } // Cấu hình kết nối Redis
});
module.exports = { emailQueue, contactQueue, contactRepQueue };
