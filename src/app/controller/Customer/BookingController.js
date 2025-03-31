const TourBookingService = require("../../service/TourBookingService");
const { sendEmailQueue } = require("../../service/emailService");


class BookingController {
    static async bookTour(req, res) {
        try {
            const { tour_id, adult_count, child_count, payment_method } = req.body;
            const user_id = req.user.id;

            // Buộc chuyển đổi loại cho số lượng hành khách
            const adults = parseInt(adult_count) || 0;
            const children = parseInt(child_count) || 0;

            // 1. Tạo booking in DB
            const bookingResult = await TourBookingService.createBookingService({
                user_id,
                tour_id,
                adult_count: adults,
                child_count: children,
                payment_method,
                req: req
            });
            console.log(bookingResult.tour)
            if (!bookingResult.success) {
                return res.status(400).json({
                    success: false,
                    message: bookingResult.message,  // Chuyển message từ bookingResult
                });
            }
    
            // 2. VNPay
            let paymentUrl = null;
            if (payment_method === "online") {
                const paymentResult = await TourBookingService.processPayment({
                    booking_id: bookingResult.booking_id,
                    total_price: bookingResult.total_price,
                    req: req,
                    tour_id: bookingResult.tour_id
                });
                
                if (paymentResult.success) {
                    paymentUrl = paymentResult.payment_url;
                } else {
                    return res.status(500).json({
                        success: false,
                        message: paymentResult.message || "Lỗi tạo URL thanh toán VNPay",
                    });
                }
            }

            // 3. Zalo pay
            let orderUrl = null;
            if (payment_method === "zalopay") {
                const paymentResult = await TourBookingService.processZalo({
                    booking_id: bookingResult.booking_id,
                    total_price: bookingResult.total_price,
                    tour_id: bookingResult.tour_id,
                    user: req.user
                });
                
                console.log('Payment result:', paymentResult);
                
                if (paymentResult.success) {
                    if (!paymentResult.payment_url) {
                        console.error('Payment result success but no payment_url');
                        return res.status(500).json({
                            success: false,
                            message: "Không nhận được URL thanh toán từ ZaloPay"
                        });
                    }
                    orderUrl = paymentResult.payment_url;
                } else {
                    return res.status(500).json({
                        success: false,
                        message: paymentResult.message || "Lỗi tạo URL thanh toán Zalopay"
                    });
                }
            }

            // 4. Kết hợp kết quả và chỉ trả về một response
            const finalPaymentUrl = payment_method === "zalopay" ? orderUrl : paymentUrl;

            // 5. Nếu thanh toán offline, gửi email ngay lập tức
            if (payment_method === "offline") {
                await sendEmailQueue(req.user.email, "Xác nhận đặt tour - Thanh toán khi nhận vé", `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="text-align: center; color: #007bff;">🎉 Xác nhận đặt tour - Thanh toán khi nhận vé 🎉</h2>
                        
                        <p style="font-size: 16px; color: #333;">Xin chào <b>${req.user.name}</b>,</p>
                        
                        <p style="font-size: 16px; color: #333;">Cảm ơn bạn đã đặt tour tại <b>Travel VietNam</b>! Dưới đây là thông tin đặt tour của bạn:</p>

                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Mã đơn hàng:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${bookingResult.booking_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Tên tour:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${bookingResult.tour.tour_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Ngày khởi hành:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${bookingResult.tour.departure_date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Số lượng khách:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${adults} người lớn, ${children} trẻ em</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Tổng tiền:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd; color: red;"><b>${bookingResult.total_price.toLocaleString()} VNĐ</b></td>
                            </tr>
                        </table>

                        <p style="font-size: 16px; color: red; font-weight: bold;">🛑 Lưu ý quan trọng:</p>
                        <p style="font-size: 16px; color: #333;">
                            Vui lòng thanh toán trực tiếp tại văn phòng trước ngày khởi hành để hoàn tất thủ tục.<br>
                            Nếu không thanh toán trước hạn, đơn hàng có thể bị <b>hủy tự động</b>.
                        </p>

                        <p style="font-size: 16px; color: #333;"><b>📍 Địa chỉ thanh toán:</b></p>
                        <p style="font-size: 16px; color: #333;">
                            Văn phòng <b>Travel VietNam</b><br>
                            <b>Duy Trung, Duy Xuyên, Quảng Nam</b><br>
                            📞 <b>Hotline hỗ trợ:</b> 0386 413 805
                        </p>

                        <p style="font-size: 16px; color: #333;">Hẹn gặp bạn trên hành trình sắp tới! 🚀</p>

                        <hr style="border: 1px solid #ddd;">
                        <p style="text-align: center; font-size: 14px; color: #777;">
                            📍 Travel VietNam | Duy Trung, Duy Xuyên, Quảng Nam <br>
                            📞 Hotline: 0386 413 805 | ✉️ Email: support@travelvietnam.com
                        </p>
                    </div>
                `);
            }
            
            // Chỉ có một return ở cuối hàm xử lý
            return res.status(200).json({
                success: true,
                message: "Đặt tour thành công",
                booking_id: bookingResult.booking_id,
                total_price: bookingResult.total_price,
                payment_url: finalPaymentUrl,
                tour_id: bookingResult.tour_id
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    static async show(req, res) {
        try {
            const user_id = req.user.id;
            const booking_id = req.params.id
            const response = await TourBookingService.showBookingService({ user_id, booking_id });
    
            return res.status(response.status).json(response);
        } catch (error) {
            console.error("Lỗi khi xử lý yêu cầu:", error);
            return res.status(500).json({ message: "Lỗi máy chủ, vui lòng thử lại sau!" });
        }
    }
}

module.exports = BookingController;