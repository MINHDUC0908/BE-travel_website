require('dotenv').config();
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generateQRCode(booking_id) {
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const qrData = `${baseUrl}/booking/${booking_id}`;
        const qrPath = path.join(__dirname, '../../public/image/qrcodes', `qr_${booking_id}.png`);

        // Đảm bảo thư mục tồn tại
        if (!fs.existsSync(path.join(__dirname, '../../public/image/qrcodes'))) {
            fs.mkdirSync(path.join(__dirname, '../../public/image/qrcodes'), { recursive: true });
        }

        await QRCode.toFile(qrPath, qrData); // Lưu mã QR thành file PNG
        return qrPath; // Trả về đường dẫn tệp QR
    } catch (err) {
        console.error("Lỗi tạo mã QR:", err);
        return null;
    }
}

module.exports = { generateQRCode };
