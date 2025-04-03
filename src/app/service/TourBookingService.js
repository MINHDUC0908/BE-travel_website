const sequelize = require("../../config/db");
const { Tour, Booking, BookingDetail, Image, TourCategory, Schedule, Payment } = require("../model");
const User = require("../model/User");

const PaymentService = require("./PaymentService");
const ZalopayService = require("./ZalopayService");

class TourBookingService {
    static async showBookingService({ user_id, booking_id }) {
        try {
            if (!user_id) {
                return {
                    status: 401,
                    message: "Vui lòng đăng nhập để xem chi tiết tour"
                };
            }
    
            if (!booking_id) {
                return {
                    status: 404,
                    message: "Không tìm thấy tour!"
                };
            }
    
            const tour = await Booking.findByPk(booking_id, {
                include: [
                    {
                        model: Payment,
                        model: BookingDetail,
                        include: [
                            { 
                                model: Tour,
                                include: [
                                    Image
                                ] 
                            }
                        ]
                    }
                ]
            });
    
            if (!tour) {
                return {
                    status: 404,
                    message: "Tour không tồn tại hoặc đã bị xóa!"
                };
            }
    
            return {
                success: true,
                status: 200,
                data: tour
            };
        } catch (error) {
            console.error("Lỗi khi lấy thông tin tour:", error);
            return {
                status: 500,
                message: "Lỗi máy chủ, vui lòng thử lại sau!"
            };
        }
    }
    static async createBookingService({ user_id, tour_id, adult_count, child_count, payment_method, req }) {
        const transaction = await sequelize.transaction();
        try {
            // 🔒 Khóa hàng để đảm bảo chỉ có 1 người có thể đặt tour tại một thời điểm
            const tour = await Tour.findOne({
                where: { id: tour_id },
                lock: true,  // SELECT ... FOR UPDATE
                transaction
            });
            
            if (!tour) {
                await transaction.rollback();
                return {
                    success: false,
                    message: "Tour không tồn tại!"
                };
            }
    
            const currentDate = new Date();
            
            // Kiểm tra tour đã kết thúc chưa
            if (tour.end_date < currentDate) {
                await transaction.rollback();
                return {
                    success: false,
                    message: "Tour đã kết thúc, không thể đặt nữa!"
                };
            }
            
            // Kiểm tra tour đã bắt đầu hay chưa
            if (currentDate > tour.departure_date && currentDate < tour.end_date) {
                await transaction.rollback();
                return {
                    success: false,
                    message: "Tour đã bắt đầu, vui lòng chọn lịch trình khác hoặc chờ đợt mở đăng ký tiếp theo."
                };
            }
    
            // Kiểm tra số lượng khách đăng ký
            const totalGuests = adult_count + child_count;
            if (tour.remaining_quantity < totalGuests) {
                await transaction.rollback();
                return {
                    success: false,
                    message: `Chỉ còn ${tour.remaining_quantity} chỗ trống, vui lòng giảm số lượng hoặc chọn tour khác.`
                };
            }
            if (payment_method === "offline" && totalGuests > 2) {
                await transaction.rollback();
                return {
                    success: false,
                    message: "Phương thức thanh toán offline chỉ áp dụng cho tối đa 2 khách. Vui lòng chọn thanh toán online nếu có nhiều hơn 2 khách."
                };
            }
            const user = await User.findByPk(user_id)
            console.log(user)
            if (payment_method === "offline" && !user.isVerified)
            {
                await transaction.rollback()
                return {
                    message: "Bạn cần xác thực tài khoản khi thanh toán offline!!!"
                }
            }
            const totalPrice = (adult_count * tour.adult_price) + (child_count * tour.child_price);
            
            // Tạo booking
            const booking = await Booking.create({
                user_id,
                total_price: totalPrice,
                tour_code: "TOUR_" + Math.floor(Math.random() * 1000000),
                status: "pending",
                payment_status: "unpaid"
            }, { transaction });
            
            // Tạo booking detail
            await BookingDetail.create({
                booking_id: booking.id,
                tour_id,
                adults: adult_count,
                children: child_count,
                total_price: totalPrice
            }, { transaction });
            
            // Cập nhật số lượng còn lại của tour
            await Tour.update(
                { remaining_quantity: tour.remaining_quantity - totalGuests },
                { where: { id: tour.id }, transaction }
            );
            
            await transaction.commit();
            
            // Return booking information
            return {
                success: true,
                message: "Đặt tour thành công!",
                booking_id: booking.id,
                total_price: totalPrice,
                tour_id: tour_id,
                tour: tour,
                tour_code: booking.tour_code
            };
        } catch (error) {
            console.log("Lỗi trong backend:", error);
            await transaction.rollback();
            return {
                success: false,
                message: error.message
            };
        }
    }

    static async processPayment({ booking_id, total_price, req, tour_id }) 
    {
        try {
            const vnpayResponse = await PaymentService.createVNPayPayment({
                amount: total_price,
                booking_id: booking_id,
                req: req,
                tour_id: tour_id
            });
            
            return {
                success: true,
                payment_url: vnpayResponse.paymentUrl
            };
        } catch (error) {
            console.error("[processPayment] Error:", error);
            return {
                success: false,
                message: "Lỗi xử lý thanh toán: " + error.message
            };
        }
    }
    static async processZalo({ booking_id, total_price, tour_id, user }) {
        try {
            const zalopayResponse = await ZalopayService.createZalopayPatment({
                amount: total_price,
                booking_id: booking_id,
                tour_id: tour_id,
                user: user
            });

            return {
                success: true,
                payment_url: zalopayResponse.order_url // Đúng tên trường trả về từ API Zalopay
            };
        } catch (error) {
            console.error("[processPayment] Error:", error);
            return {
                success: false,
                message: "Lỗi xử lý thanh toán: " + error.message
            };
        }
    }
}

module.exports = TourBookingService;