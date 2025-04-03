require('dotenv').config(); // Load biến môi trường từ .env
const crypto = require('crypto');
const moment = require('moment');
const querystring = require('querystring');
const { Booking, Payment, Tour } = require('../../model');
const User = require('../../model/User');
const { generateQRCode } = require("../../service/QrService");
const { sendEmailQueue } = require('../../service/emailService');

class VnpayController {
    constructor() {
        this.VNP_TMNCODE = process.env.VNP_TMNCODE || '';
        this.VNP_HASHSECRET = process.env.VNP_HASHSECRET || '';
        this.VNP_URL = process.env.VNP_URL || '';
        this.VNP_RETURN_URL = process.env.VNP_RETURN_URL || '';

        // Bind các phương thức để đảm bảo this luôn đúng
        this.createPaymentUrl = this.createPaymentUrl.bind(this);
        this.paymentReturn = this.paymentReturn.bind(this);
        this.generateSignature = this.generateSignature.bind(this);
        this.verifySignature = this.verifySignature.bind(this);
        this.buildPaymentUrl = this.buildPaymentUrl.bind(this);
        this.getClientIp = this.getClientIp.bind(this);
    }

    generateSignature(params, secretKey) {
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

    verifySignature(params, secretKey, receivedHash) {
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

    createPaymentUrl(req, res) {
        try {
            const { orderId, amount, orderInfo } = req.body;

            if (!orderId || !amount || !orderInfo) {
                return res.status(400).json({ 
                    message: 'Thiếu thông tin thanh toán', 
                    error: 'Missing required fields' 
                });
            }

            const vnpParams = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: this.VNP_TMNCODE,
                vnp_Amount: parseInt(amount) * 100,
                vnp_CurrCode: 'VND',
                vnp_TxnRef: orderId,
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: 'billpayment',
                vnp_Locale: 'vn',
                vnp_ReturnUrl: this.VNP_RETURN_URL,
                vnp_IpAddr: this.getClientIp(req),
                vnp_CreateDate: moment().format('YYYYMMDDHHmmss')
            };

            const secureHash = this.generateSignature(vnpParams, this.VNP_HASHSECRET);
            vnpParams.vnp_SecureHash = secureHash;

            const paymentUrl = this.buildPaymentUrl(vnpParams);

            return res.json({ 
                status: 'success', 
                paymentUrl 
            });
        } catch (error) {
            console.error('[createPayment] Error:', error);
            return res.status(500).json({ 
                message: 'Lỗi tạo URL thanh toán', 
                error: error.message 
            });
        }
    }

    buildPaymentUrl(params) {
        const encodedParams = querystring.stringify(params);
        return `${this.VNP_URL}?${encodedParams}`;
    }

    getClientIp(req) {
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
    async paymentReturn(req, res) {
        try {
            const vnpParams = { ...req.query };
            const secureHash = vnpParams.vnp_SecureHash;
            console.log(vnpParams)
            // Kiểm tra chữ ký hợp lệ
            const isValidSignature = this.verifySignature(vnpParams, this.VNP_HASHSECRET, secureHash);
            if (!isValidSignature) {
                return res.status(400).json({ 
                    message: 'Chữ ký không hợp lệ', 
                    status: false 
                });
            }
    
            const responseCode = vnpParams.vnp_ResponseCode;
            const paymentStatus = responseCode === '00';
            const txnRef = vnpParams.vnp_TxnRef;
    
            // Trích xuất booking_id từ mã đơn hàng (format: "BOOK{booking_id}_{timestamp}")
            const orderInfo = vnpParams.vnp_OrderInfo;
            const bookingId = txnRef.split('_')[0].replace('BOOK', '');
            const tourId = orderInfo.split('Tour: ')[1]; // Trích xuất tour_id từ OrderInfo
            
            if (paymentStatus) {
                try {
                    const booking = await Booking.findByPk(bookingId);
                    if (!booking) {
                        console.error(`Không tìm thấy booking với ID: ${bookingId}`);
                    } else {
                        const user = await User.findByPk(booking.user_id)

                        const tour = await Tour.findByPk(tourId)
                        // Cập nhật trạng thái thanh toán thành công
                        await Booking.update(
                            {
                                payment_status: 'paid',
                                status: 'confirmed'
                            },
                            { where: { id: bookingId } } // Thêm điều kiện where để cập nhật đúng booking
                        );
    
                        try {
                            await Payment.create({
                                booking_id: bookingId,
                                amount: vnpParams.vnp_Amount / 100,
                                payment_method: "online",
                                payment_status: "completed",
                                transaction_id: vnpParams.vnp_TransactionNo,
                            });
                            const qrCodePath = generateQRCode(bookingId)
                            await sendEmailQueue(user.email, "🎉 Xác nhận đặt tour thành công!", `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                                    <h2 style="text-align: center; color: #007bff;">🎉 Cảm ơn bạn đã đặt tour tại Travel Vietnam! 🎉</h2>
                                    <p style="font-size: 16px; color: #333;">Xin chào <b>${user.name}</b>,</p>
                                    <p style="font-size: 16px; color: #333;">Chúng tôi xin xác nhận rằng bạn đã đặt tour thành công. Dưới đây là thông tin chi tiết:</p>
                            
                                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Mã booking:</b></td>
                                            <td style="padding: 10px; border: 1px solid #ddd;">${bookingId}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Tên tour:</b></td>
                                            <td style="padding: 10px; border: 1px solid #ddd;">${tour.tour_name}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Tổng tiền:</b></td>
                                            <td style="padding: 10px; border: 1px solid #ddd;">${booking.total_price.toLocaleString()} VND</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Trạng thái thanh toán:</b></td>
                                            <td style="padding: 10px; border: 1px solid #ddd;"><span style="color: green;">✅ Đã thanh toán</span></td>
                                        </tr>
                                    </table>
                            
                                    <p style="font-size: 16px; color: #333;">Bạn vui lòng quét mã QR dưới đây để kiểm tra thông tin đặt tour tại quầy:</p>
                            
                                    <div style="text-align: center; margin: 20px 0;">
                                        <img src="cid:qrcode" alt="QR Code" style="max-width: 250px; border: 5px solid #007bff; border-radius: 10px;"/>
                                    </div>
                            
                                    <p style="font-size: 16px; color: #333;">Hẹn gặp bạn trong chuyến hành trình sắp tới! 🚀</p>
                                    <hr style="border: 1px solid #ddd;">
                                    <p style="text-align: center; font-size: 14px; color: #777;">
                                        📍 Travel VietNam | Duy Trung, Duy Xuyên, Quảng Nam <br>
                                        📞 Hotline: 0386 413 805 | ✉️ Email: support@travelvietnam.com
                                    </p>
                                </div>
                            `, qrCodePath);
                        } catch (error) {
                            console.log('Không thể ghi log giao dịch:', error.message);
                        }
                    }
                } catch (error) {
                    console.error('Lỗi cập nhật trạng thái thanh toán:', error.message);
                }
            } else {
                try {
                    const booking = await Booking.findByPk(bookingId)
                    const user = await User.findByPk(booking.user_id)

                    await Booking.destroy({ where: { id: bookingId } });
                    
                    return res.redirect(`http://localhost:5173/payment-failed?id=${tourId}`);
                } catch (error) {
                    console.error('Lỗi khi xóa booking:', error.message);
                    return res.status(500).json({ message: "Lỗi khi xóa booking", error: error.message });
                }                
            }
    
            return res.redirect(`http://localhost:5173/booking/success?id=${bookingId}`);
    
        } catch (error) {
            console.error('[paymentReturn] Error:', error);
            return res.status(500).json({ 
                message: 'Lỗi xử lý thanh toán', 
                error: error.message 
            });
        }
    }    
    // paymentReturn(req, res) {
    //     try {
    //         const vnpParams = { ...req.query };
    //         const secureHash = vnpParams.vnp_SecureHash;

    //         const isValidSignature = this.verifySignature(vnpParams, this.VNP_HASHSECRET, secureHash);

    //         if (!isValidSignature) {
    //             return res.status(400).json({ 
    //                 message: 'Chữ ký không hợp lệ', 
    //                 status: false 
    //             });
    //         }

    //         const responseCode = vnpParams.vnp_ResponseCode;
    //         const paymentStatus = responseCode === '00';

    //         return res.json({
    //             message: paymentStatus 
    //                 ? 'Thanh toán thành công' 
    //                 : `Thanh toán thất bại. Mã lỗi: ${responseCode}`,
    //             data: vnpParams,
    //             status: paymentStatus
    //         });
    //     } catch (error) {
    //         console.error('[paymentReturn] Error:', error);
    //         return res.status(500).json({ 
    //             message: 'Lỗi xử lý thanh toán', 
    //             error: error.message 
    //         });
    //     }
    // }
}

module.exports = new VnpayController();