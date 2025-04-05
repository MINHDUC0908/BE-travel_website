const { Tour, Rating, Booking, BookingDetail, Schedule, TourCategory, Image } = require("../../model");

const path = require("path");
const createUploader = require("../../../upload/upload");
const User = require("../../model/User");
// Khởi tạo uploader với thư mục lưu ảnh
const upload = createUploader(path.join(__dirname, "../../../public/image/rating"));
class RatingController {
    async store(req, res) {
        try {
            const user_id = req.user.id; 
            const { tour_id, rating, comment } = req.body; // Lấy dữ liệu từ body request

            // Tìm BookingDetail dựa trên tour_id và user_id
            const bookingDetail = await BookingDetail.findOne({
                where: { tour_id },
                include: [{
                    model: Booking,
                    required: true, // Yêu cầu Booking phải tồn tại
                    where: { user_id } // Kiểm tra xem user đã đặt tour này chưa
                }, {
                    model: Tour, // Bao gồm thông tin Tour để kiểm tra ngày khởi hành
                    required: true
                }]
            });
            console.log(bookingDetail)
            // Nếu không tìm thấy BookingDetail, trả về lỗi
            if (!bookingDetail) {
                return res.status(400).json({
                    message: "Bạn phải đặt tour này trước khi đánh giá."
                });
            }

            // Lấy ngày hiện tại và định dạng
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

            // Kiểm tra ngày khởi hành của tour
            const departureDate = new Date(bookingDetail.Tour.departure_date).toISOString().split("T")[0];
            if (departureDate > formattedDate) {
                return res.status(400).json({
                    message: "Bạn không thể đánh giá tour trước ngày khởi hành."
                });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: "Bạn vui lòng đánh giá từ 1 đến 5."
                });
            }
            // Kiểm tra nếu user đã đánh giá tour này rồi
            const existingRating = await Rating.findOne({
                where: {
                    user_id,
                    tour_id
                }
            });
            if (existingRating) {
                return res.status(400).json({
                    message: "Bạn đã đánh giá tour này rồi."
                });
            }

            // Tạo đánh giá mới
            const newRating = await Rating.create({
                user_id,
                tour_id,
                rating,
                comment,
                image: req.file ? `/image/rating/${req.file.filename}` : null,
            });


            const ratingWithUser = await Rating.findByPk(newRating.id, {
                include: [{
                    model: User,
                    attributes: ['id', 'name']
                }]
            });
            return res.status(201).json({
                success: true,
                message: "Đánh giá tour thành công",
                data: ratingWithUser
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Đã có lỗi xảy ra khi đánh giá tour"
            });
        }
    }
    async index(req, res) {
        try {
            const { tour_id } = req.body;
    
            const ratings = await Rating.findAll({
                where: { tour_id: tour_id },
                include: [
                    {
                        model: User
                    }
                ]
            });
    
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách đánh giá thành công",
                data: ratings
            });
        } catch (error) {
            console.error("Lỗi khi lấy đánh giá:", error);
            return res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi lấy danh sách đánh giá"
            });
        }
    }
}

module.exports = { ratingController: new RatingController(), upload };