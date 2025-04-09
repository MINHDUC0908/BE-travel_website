const path = require("path");
const createUploader = require("../../../upload/upload");
const User = require("../../model/User");
const { Booking, BookingDetail, Tour, Schedule, Image } = require("../../model");
// Khởi tạo uploader với thư mục lưu ảnh
const upload = createUploader(path.join(__dirname, "../../../public/image/profileCustomer"));

class ProfileController
{
    async updateProfile(req, res) 
    {
        try {
            const userId = req.user.id; // Lấy từ middleware auth
            const { name, phone, address } = req.body;
            const avatar = req.file ? `/image/profileCustomer/${req.file.filename}` : null; // Lấy đường dẫn ảnh từ req.file

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            user.update({
                name: name || user.name,
                phone: phone || user.phone,
                address: address || user.address,
                image_url: avatar || user.image_url,
            });

            return res.json({
                success: true,
                message: 'Cập nhật thông tin cá nhân thành công',
                user: {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    address: user.address,
                    image_url: user.image_url,
                }
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin cá nhân', error });
        }
    }

    async getBooking(req, res)
    {
        try {
            const userId = req.user.id; // Lấy từ middleware auth
            const bookings = await Booking.findAll({
                where: { user_id: userId },
                include: [
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
                                        model: Schedule
                                    }
                                ]
                            }
                        ]
                    },
                ],
            })

            return res.json({
                success: true,
                message: "Lấy danh sách booking thành công",
                data: bookings,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách booking', error });
        }
    }
}

module.exports = { profileController: new ProfileController(), upload };