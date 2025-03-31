
// PaymentService.js
const crypto = require("crypto");
const moment = require("moment");
const querystring = require("querystring");
require("dotenv").config(); // Load environment variables

class PaymentService {
    static async createVNPayPayment({ amount, booking_id, req, tour_id }) {
        try {
            const tmnCode = process.env.VNP_TMNCODE;
            const secretKey = process.env.VNP_HASHSECRET;
            const vnpUrl = process.env.VNP_URL;
            const returnUrl = process.env.VNP_RETURN_URL;

            if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
                throw new Error("Chưa cấu hình đầy đủ thông tin VNPay");
            }

            // Transaction time (YYYYMMDDHHmmss)
            const createDate = moment().format("YYYYMMDDHHmmss");

            // Order ID (unique)
            const orderId = `BOOK${booking_id}_${Date.now()}`;

            // Data to send to VNPay
            const vnpParams = {
                vnp_Version: "2.1.0",
                vnp_Command: "pay",
                vnp_TmnCode: tmnCode,
                vnp_Amount: parseInt(amount) * 100, // VNPay requires amount * 100
                vnp_CurrCode: "VND",
                vnp_TxnRef: orderId,
                vnp_OrderInfo: `Thanh toán đơn hàng #${booking_id}, Tour: ${tour_id}`,
                vnp_OrderType: "billpayment",
                vnp_Locale: "vn",
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: this.getClientIp(req),
                vnp_CreateDate: createDate,
            };

            // Create secure signature
            const secureHash = this.generateSignature(vnpParams, secretKey);
            vnpParams.vnp_SecureHash = secureHash;

            // Create payment URL
            const paymentUrl = this.buildPaymentUrl(vnpUrl, vnpParams);

            return { status: "success", paymentUrl };
        } catch (error) {
            console.error("[createVNPayPayment] Error:", error);
            throw new Error("Lỗi tạo thanh toán VNPay: " + error.message);
        }
    }

    static generateSignature(params, secretKey) {
        try {
            const filteredParams = Object.fromEntries(
                Object.entries(params)
                    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            );

            const sortedKeys = Object.keys(filteredParams).sort();
            const signData = sortedKeys
                .map(key => `${key}=${encodeURIComponent(filteredParams[key]).replace(/%20/g, '+')}`)
                .join('&');

            const hmac = crypto.createHmac('sha512', secretKey);
            return hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        } catch (error) {
            console.error('[generateSignature] Error:', error);
            throw new Error('Không thể tạo chữ ký');
        }
    }

    static verifySignature(params, secretKey, receivedHash) {
        try {
            const { vnp_SecureHash, ...verifyParams } = params;
            const filteredParams = Object.fromEntries(
                Object.entries(verifyParams)
                    .filter(([key]) => key.startsWith('vnp_'))
            );

            const calculatedHash = this.generateSignature(filteredParams, secretKey);
            return calculatedHash.toLowerCase() === receivedHash.toLowerCase();
        } catch (error) {
            console.error('[verifySignature] Error:', error);
            return false;
        }
    }

    static buildPaymentUrl(baseUrl, params) {
        const encodedParams = querystring.stringify(params);
        return `${baseUrl}?${encodedParams}`;
    }

    static getClientIp(req) {
        if (!req) return '127.0.0.1';
        
        const ipSources = [
            req.headers['x-forwarded-for'],
            req.connection?.remoteAddress,
            req.socket?.remoteAddress,
            req.connection?.socket?.remoteAddress,
            '127.0.0.1'
        ];
        const ip = ipSources.find(ip => ip);
        return ip === '::1' ? '127.0.0.1' : ip;
    }
}

module.exports = PaymentService;