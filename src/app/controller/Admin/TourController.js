const { Tour, Image, Schedule, TourCategory } = require("../../model");

const createUploader = require("../../../upload/upload");
const path = require("path")

// Khởi tạo uploader với thư mục lưu ảnh
const upload = createUploader(path.join(__dirname, "../../../public/image/tour"));

class TourController {
    async index(req, res)
    {
        try {
            const tours = await Tour.findAll({
                include: [
                    {
                        model: Image,  // Kết hợp bảng Image
                        attributes: ["id", "image_url"], // Chỉ lấy trường cần thiết
                    }
                ]
            })
            res.json({
                message: "Hiển thị dữ liệu thành công",
                success: true,
                data: tours,
            })
        } catch (error) {
            
        }
    }
    async store(req, res) {
        try {
            // Tạo tour mới
            const tour = await Tour.create({
                tour_name: req.body.tour_name,
                destination: req.body.destination,
                area: req.body.area,
                quantity: req.body.quantity,
                remaining_quantity: req.body.quantity,
                adult_price: req.body.adult_price,
                child_price: req.body.child_price,
                departure_date: req.body.departure_date,
                end_date: req.body.end_date,
                depart: req.body.depart,
                description: req.body.description,
                category_id: req.body.category_id
            });

            // Kiểm tra xem có file nào được upload không
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: "Không có file nào được tải lên!" });
            }

            // Lưu tất cả ảnh vào database
            const imagePromises = req.files.map((file) =>
                Image.create({
                    tour_id: tour.id,
                    image_url: `/image/tour/${file.filename}`,
                })
            );
            const images = await Promise.all(imagePromises);
            if (!req.body.itinerary) {
                return res.status(400).json({ message: "Không có lịch trình nào được gửi lên!" });
            }
            // Parse itinerary từ JSON string thành mảng
            const itinerary = JSON.parse(req.body.itinerary);
            // Kiểm tra nếu itinerary không phải là mảng hoặc rỗng
            if (!Array.isArray(itinerary) || itinerary.length === 0) {
                return res.status(400).json({ message: "Lịch trình không hợp lệ hoặc rỗng!" });
            }

            // Lưu từng ngày trong lịch trình vào database
            const schedulePromises = itinerary.map((item) =>
                Schedule.create({
                    tour_id: tour.id,
                    day_number: item.day,
                    activities: item.activities,
                })
            );
            const schedules = await Promise.all(schedulePromises);

            const tours = await Tour.findByPk(tour.id, {
                include: [
                    {
                        model: Image,
                    },
                    {
                        model: Schedule,
                    },
                ],
            })
            return res.status(200).json({
                success: true,
                message: "Thêm tour và ảnh thành công",
                data: tours,
            });
        } catch (error) {
            console.error("Lỗi khi thêm tour và ảnh:", error);
            res.status(500).json({ error: "Lỗi server!" });
        }
    }
    async show(req, res)
    {
        try {
            const tour = await Tour.findByPk(req.params.id, {
                include: [
                    {
                        model: Schedule,
                        attributes: ['id', "tour_id",'day_number', "activities"], 
                    },
                    {
                        model: Image,
                    },
                    {
                        model: TourCategory
                    }
                ],
            });            
            if (!tour) {
                return res.status(404).json({ message: "Tour not found" });
            }
            return res.status(200).json({
                success: true,
                data: tour
            })
        } catch (error) {
            console.error("Lỗi khi hiển thị tour và ảnh:", error);
            res.status(500).json({ error: "Lỗi server!" });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const tour = await Tour.findByPk(id, { 
                include: [Image, Schedule],
            });

            if (!tour) {
                return res.status(404).json({ message: "Tour không tồn tại!" });
            }
            const current = new Date();
            const departureDate = new Date(tour.departure_date);
            const endDate = new Date(tour.end_date);
            if ( current > departureDate && current < endDate) {
                return res.status(400).json({ message: "Không thể cập nhật tour đã khởi hành!" });
            }
            // Update tour information
            await tour.update({
                tour_name: req.body.tour_name || tour.tour_name,
                destination: req.body.destination || tour.destination,
                area: req.body.area || tour.area,
                quantity: req.body.quantity || tour.quantity,
                adult_price: req.body.adult_price || tour.adult_price,
                child_price: req.body.child_price || tour.child_price,
                departure_date: req.body.departure_date || tour.departure_date,
                end_date: req.body.end_date || tour.end_date,
                description: req.body.description || tour.description,
                category_id: req.body.category_id || tour.category_id
            });
            const updatedTour = await Tour.findByPk(id, { include: [Image, Schedule] });

            return res.status(200).json({
                success: true,
                message: "Cập nhật tour thành công!",
                data: updatedTour,
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật tour:", error);
            res.status(500).json({ error: "Lỗi server!" });
        }
    }
    async detroy(req, res)
    {
        try {
            const tour = await Tour.findByPk(req.params.id)
            if (!tour)
            {
                return res.json({
                    message: "Không tìm thấy tour cần xóa!!!"
                })
            }
            await tour.destroy();
            const tours = await Tour.findAll({
                include: [
                    {
                        model: Image,  // Kết hợp bảng Image
                        attributes: ["id", "image_url"], // Chỉ lấy trường cần thiết
                    }
                ]
            })
            res.json({
                message: "Xóa tour thành công",
                success: true,
                data: tours,
            })
        } catch (error) {
            
        }
    }
}

module.exports = { tourController: new TourController(), upload };

