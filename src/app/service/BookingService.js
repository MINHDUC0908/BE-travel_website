const { Sequelize } = require("sequelize");
const { Booking, BookingDetail, Tour, Schedule, Image } = require("../model");
const { Op } = require("sequelize");

class BookingService
{
    
    static async Payment_Confirmation_Service(booking_id) {
        try {
            if (!booking_id) {
                return {
                    success: false,
                    message: "Lỗi khi xác nhận thanh toán!!!"
                };
            }
            const currentTime = new Date();
            const reminderWindowStart = new Date(currentTime.getTime() + 47 * 60 * 60 * 1000); // 47 giờ từ hiện tại
            const reminderWindowEnd = new Date(currentTime.getTime() + 48 * 60 * 60 * 1000); // 48 giờ từ hiện tại
            console.log(reminderWindowEnd)
            console.log(reminderWindowStart)
            const booking = await Booking.findByPk(booking_id, {
                include: [
                    {
                        model: BookingDetail,
                        include: [
                            {
                                model: Tour,
                                include: [
                                    {
                                        model: Image
                                    },
                                    {
                                        model: Schedule
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }); 
            if (!booking) {
                return {
                    success: false,
                    message: "Không tìm thấy đơn đặt chỗ!"
                };
            }
            await booking.update({
                status: "confirmed",
                payment_status: "paid",
            })
            return {
                success: true,
                message: "Xác nhận thanh toán thành công",
                data: booking
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: "Đã xảy ra lỗi khi xác nhận thanh toán!"
            };
        }
    }

    static async getSoonToExpireOfflineBookings() {
        const currentTime = new Date();
        
        const soonToExpireBookings = await Booking.findAll({
            where: {
                status: 'pending',
                payment_status: 'unpaid',
            },
            include: [
                {
                    model: BookingDetail,
                    required: true,
                    include: [
                        {
                            model: Tour,
                            required: true,
                            where: {
                                departure_date: {
                                    [Op.gte]: currentTime, // Ngày khởi hành từ hiện tại trở đi
                                    [Op.lte]: new Date(currentTime.getTime() + 48 * 60 * 60 * 1000) // Trong vòng 48h tới
                                }
                            }
                        }
                    ]
                }
            ]
        });
    
        console.log("Current Time:", currentTime);
        console.log("Soon to Expire Bookings:", JSON.stringify(soonToExpireBookings, null, 2));
        return soonToExpireBookings;
    }
    static async cancelBooking(booking_id)
    {
        try {
            const booking = await Booking.findByPk(booking_id)
            if (booking)
            {
                await booking.update({
                    status: "cancelled",
                    payment_status: "failed"
                })
            }
            return {
                success: true,
                data: booking
            }
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: "Đã xảy ra lỗi khi hủy đơn hàng!"
            };
        }
    }
}

module.exports = BookingService