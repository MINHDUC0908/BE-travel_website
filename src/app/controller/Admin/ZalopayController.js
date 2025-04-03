const { Booking, Payment, Tour } = require("../../model");
const User = require("../../model/User");
const { sendEmailQueue } = require("../../service/emailService"); 
const { generateQRCode } = require("../../service/QrService")

class ZalopayController {
    static async zalopayReturn(req, res) {
        try {
            console.log("ZaloPay callback received:", req.query);

            const { apptransid, amount, status } = req.query;

            let booking_id = null;
            let tour_id = null;
            // Nếu apptransid tồn tại, tách lấy booking_id
            if (apptransid) {
                const transParts = apptransid.split('_'); // Tách chuỗi bằng dấu "_"
                if (transParts.length >= 2) {
                    booking_id = transParts[1]; // Phần thứ 2 là booking_id
                    tour_id = transParts[3]
                }
            }

            console.log("Extracted Booking ID:", booking_id);

            if (!booking_id) {
                console.error("Error: Booking ID not found!");
                return res.redirect('/booking/failure?payment_status=error&message=Không+tìm+thấy+Booking+ID');
            }

            if (status === '1') {
                try {
                    const booking = await Booking.findByPk(booking_id)
                    if (!booking)
                    {
                        return res.json({
                            message: "Lỗi không tìm thấy booking_id"
                        })
                    } else {
                        const user = await User.findByPk(booking.user_id)
                        console.log(user)
                        const tour = await Tour.findByPk(tour_id)
                        await Booking.update(
                            {
                                payment_status: 'paid',
                                status: 'confirmed'
                            },
                            { where: { id: booking_id } } // Thêm điều kiện where để cập nhật đúng booking
                        );
                        try {
                            await Payment.create({
                                booking_id: booking_id,
                                amount: amount,
                                payment_method: "zalopay",
                                payment_status: "completed",
                                transaction_id: apptransid,
                            })
                            const qrCodePath = await generateQRCode(booking_id);
                            await sendEmailQueue(user.email, "🎉 Xác nhận đặt tour thành công!", `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                                    <h2 style="text-align: center; color: #007bff;">🎉 Cảm ơn bạn đã đặt tour tại Travel Vietnam! 🎉</h2>
                                    <p style="font-size: 16px; color: #333;">Xin chào <b>${user.name}</b>,</p>
                                    <p style="font-size: 16px; color: #333;">Chúng tôi xin xác nhận rằng bạn đã đặt tour thành công. Dưới đây là thông tin chi tiết:</p>
                            
                                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Mã booking:</b></td>
                                            <td style="padding: 10px; border: 1px solid #ddd;">${booking_id}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Tên tour:</b></td>
                                            <td style="padding: 10px; border: 1px solid #ddd;">${tour.tour_name}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Tổng tiền:</b></td>
                                            <td style="padding: 10px; border: 1px solid #ddd;">${booking.total_price} VND</td>
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
                    return res.redirect(`http://localhost:5173/booking/success?id=${booking_id}`);
                } catch (error) {
                    console.error('Lỗi cập nhật trạng thái thanh toán:', error.message);
                }
            } else {
                try {
                    const booking = await Booking.findByPk(booking_id);
                    if (!booking) {
                        return { message: "Lỗi không tìm thấy bản ghi!!!" };
                    }
                    
                    // Lấy user trước khi xóa booking
                    const user = await User.findByPk(booking.user_id);
                    console.log(user);
                    
                    await Booking.destroy({ where: { id: booking_id } });
                    await sendEmailQueue(
                        user.email, 
                        "Xác nhận đặt tour", 
                        `
                        <p>Xin chào ${user.name},</p>
                        <p>Chúng tôi rất tiếc thông báo rằng giao dịch thanh toán cho đơn đặt tour của bạn đã <b>không thành công</b>.</p>
                        <p>Vui lòng kiểm tra lại phương thức thanh toán hoặc thử lại sau.</p>
                        <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua <a href="mailto:support@example.com">support@example.com</a>.</p>
                        <br>
                        <p>Trân trọng,</p>
                        <p>Đội ngũ hỗ trợ</p>
                        `
                    );                    
                    return res.redirect(`http://localhost:5173/payment-failed?id=${tour_id}`);
                } catch (error) {
                    console.error('Lỗi khi xóa booking:', error.message);
                    return res.status(500).json({ message: "Lỗi khi xóa booking", error: error.message });
                }
            }
        } catch (error) {
            console.error('Error processing ZaloPay return:', error);
            return res.redirect('/booking/failure?payment_status=error&message=Lỗi+xử+lý+thanh+toán');
        }
    }
}

module.exports = ZalopayController;
// const qrCodePath = await generateQRCode(bookingResult.booking_id);
//             console.log(qrCodePath)
//             if (payment_method === "offline") {
//                 await sendEmailQueue(req.user.email, "🎉 Xác nhận đặt tour thành công!", `
//                     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
//                         <h2 style="text-align: center; color: #007bff;">🎉 Cảm ơn bạn đã đặt tour tại Travel Vietnam! 🎉</h2>
//                         <p style="font-size: 16px; color: #333;">Xin chào <b>${req.user.name}</b>,</p>
//                         <p style="font-size: 16px; color: #333;">Chúng tôi xin xác nhận rằng bạn đã đặt tour thành công. Dưới đây là thông tin chi tiết:</p>
                
//                         <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//                             <tr>
//                                 <td style="padding: 10px; border: 1px solid #ddd;"><b>Mã booking:</b></td>
//                                 <td style="padding: 10px; border: 1px solid #ddd;">${bookingResult.booking_id}</td>
//                             </tr>
//                             <tr>
//                                 <td style="padding: 10px; border: 1px solid #ddd;"><b>Tên tour:</b></td>
//                                 <td style="padding: 10px; border: 1px solid #ddd;">${bookingResult.tour_id}</td>
//                             </tr>
//                             <tr>
//                                 <td style="padding: 10px; border: 1px solid #ddd;"><b>Tổng tiền:</b></td>
//                                 <td style="padding: 10px; border: 1px solid #ddd;">${bookingResult.total_price.toLocaleString()} VND</td>
//                             </tr>
//                             <tr>
//                                 <td style="padding: 10px; border: 1px solid #ddd;"><b>Trạng thái thanh toán:</b></td>
//                                 <td style="padding: 10px; border: 1px solid #ddd;"><span style="color: green;">✅ Đã thanh toán</span></td>
//                             </tr>
//                         </table>
                
//                         <p style="font-size: 16px; color: #333;">Bạn vui lòng quét mã QR dưới đây để kiểm tra thông tin đặt tour tại quầy:</p>
                
//                         <div style="text-align: center; margin: 20px 0;">
//                             <img src="cid:qrcode" alt="QR Code" style="max-width: 250px; border: 5px solid #007bff; border-radius: 10px;"/>
//                         </div>
                
//                         <p style="font-size: 16px; color: #333;">Hẹn gặp bạn trong chuyến hành trình sắp tới! 🚀</p>
//                         <hr style="border: 1px solid #ddd;">
//                         <p style="text-align: center; font-size: 14px; color: #777;">
//                             📍 Travel VietNam | Duy Trung, Duy Xuyên, Quảng Nam <br>
//                             📞 Hotline: 0386 413 805 | ✉️ Email: support@travelvietnam.com
//                         </p>
//                     </div>
//                 `, qrCodePath);
//             }