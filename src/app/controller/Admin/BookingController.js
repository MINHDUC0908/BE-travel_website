const { Booking, BookingDetail, Tour, Schedule, TourCategory, Image } = require("../../model");
const User = require("../../model/User");
const BookingService = require("../../service/BookingService");
const { sendEmailQueue } = require("../../service/emailService");
const TourBookingService = require("../../service/TourBookingService");

class BookingController {
    async index(req, res) {
        try {
            const status = req.body.status || null;
            // Nếu có status, tìm booking theo trạng thái đó
            const whereCondition = status ? { status: status } : {};
            const bookings = await Booking.findAll({
                where: whereCondition,
                include: [
                    {
                        model: User
                    },
                    {
                        model: BookingDetail,
                        include: [
                            {
                                model: Tour,
                                include: [
                                    {
                                        model: Image,
                                    },
                                    {
                                        model: Schedule,
                                    },
                                    {
                                        model: TourCategory
                                    }
                                ]
                            },
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.json({
                success: true,
                data: bookings
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    async payment_confirmation(req, res) 
    {
        try {
            const response = await BookingService.Payment_Confirmation_Service(req.body.booking_id);
            const user = await User.findByPk(response.data.user_id)
            const departureDate = response.data.BookingDetails[0].Tour.departure_date;
            const dateObj = new Date(departureDate);
            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
            console.log(user)
            if (response.data.payment_status === "paid") {
                await sendEmailQueue(user.email, "Xác nhận thanh toán thành công - Chào mừng bạn đến với hành trình!", `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="text-align: center; color: #28a745;">🎉 Thanh toán thành công - Sẵn sàng cho chuyến đi! 🎉</h2>
                        
                        <p style="font-size: 16px; color: #333;">Xin chào <b>${user.name}</b>,</p>
                        
                        <p style="font-size: 16px; color: #333;">
                            Cảm ơn bạn đã hoàn tất thanh toán cho chuyến đi cùng <b>Travel VietNam</b>! 
                            Chúng tôi rất vui mừng thông báo rằng đơn hàng của bạn đã được xác nhận thành công. 
                            Hãy chuẩn bị tinh thần cho một hành trình tuyệt vời nhé!
                        </p>
            
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Mã đơn hàng:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${response.data.tour_code}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Tên tour:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${response.data.BookingDetails[0].Tour.tour_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Ngày khởi hành:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${formattedDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Số lượng khách:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${response.data.BookingDetails[0].adults} người lớn, ${response.data.BookingDetails[0].children} trẻ em</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><b>Tổng tiền:</b></td>
                                <td style="padding: 10px; border: 1px solid #ddd; color: #28a745;"><b>${response.data.total_price.toLocaleString()} VNĐ</b></td>
                            </tr>
                        </table>
            
                        <p style="font-size: 16px; color: #333; font-weight: bold;">🌟 Điều gì tiếp theo?</p>
                        <p style="font-size: 16px; color: #333;">
                            - Vui lòng kiểm tra email thường xuyên để nhận thông tin cập nhật về chuyến đi.<br>
                            - Chuẩn bị hành lý và tinh thần để khám phá những điều thú vị cùng chúng tôi!<br>
                            - Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ qua hotline: <b>0386 413 805</b>.
                        </p>
            
                        <p style="font-size: 16px; color: #333;">Chúng tôi rất mong được đồng hành cùng bạn trong chuyến đi sắp tới! 🚀</p>
            
                        <hr style="border: 1px solid #ddd;">
                        <p style="text-align: center; font-size: 14px; color: #777;">
                            📍 Travel VietNam | Duy Trung, Duy Xuyên, Quảng Nam <br>
                            📞 Hotline: 0386 413 805 | ✉️ Email: support@travelvietnam.com
                        </p>
                    </div>
                `);
            }
            return res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }
}

module.exports = new BookingController();
