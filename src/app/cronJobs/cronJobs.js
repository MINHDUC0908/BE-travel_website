const cron = require('node-cron');
const BookingService = require('../service/BookingService');
const { sendEmailQueue } = require('../service/emailService');
const User = require('../model/User');

// cron.schedule('*/10 * * * * *', async ()
// cron.schedule('0 * * * *', async () 
// Cron job chạy mỗi giờ để kiểm tra
cron.schedule('0 * * * *', async ()  => { // Chạy mỗi 10 giây để test, có thể đổi thành '0 * * * *' để chạy mỗi giờ
    try {
        const soonToExpireBookings = await BookingService.getSoonToExpireOfflineBookings();
        
        for (const booking of soonToExpireBookings) {
            if (booking.BookingDetails.length > 0) {
                const departureDate = booking.BookingDetails[0].Tour.departure_date;
                const hoursUntilDeparture = (departureDate - new Date()) / (1000 * 60 * 60);

                // Chỉ hủy khi còn dưới 48h trước ngày khởi hành
                if (hoursUntilDeparture <= 48) {
                    await BookingService.cancelBooking(booking.id);
                    const user = await User.findByPk(booking.user_id);

                    await sendEmailQueue(user.email, "Đơn hàng của bạn đã bị hủy tự động", `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h2 style="text-align: center; color: #dc3545;">❌ Đơn hàng của bạn đã bị hủy ❌</h2>
                            <p>Xin chào <b>${user.name}</b>,</p>
                            <p>Đơn hàng <b>${booking.tour_code}</b> của bạn đã bị hủy tự động do chưa được thanh toán trước 48 giờ so với thời gian khởi hành (${departureDate.toLocaleString()}).</p>
                            <p>Nếu bạn vẫn muốn tham gia tour, vui lòng đặt lại tại website hoặc liên hệ qua hotline: <b>0386 413 805</b>.</p>
                            <p>Cảm ơn bạn đã quan tâm đến <b>Travel VietNam</b>!</p>
                            <hr style="border: 1px solid #ddd;">
                            <p style="text-align: center; font-size: 14px; color: #777;">
                                📍 Travel VietNam | Duy Trung, Duy Xuyên, Quảng Nam <br>
                                📞 Hotline: 0386 413 805 | ✉️ Email: support@travelvietnam.com
                            </p>
                        </div>
                    `);
                    
                    console.log(`Đã hủy đơn hàng ${booking.tour_code} do chưa thanh toán trước 48h so với khởi hành ${departureDate}`);
                }
            }
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra đơn hàng sắp hết hạn thanh toán:', error);
    }
});