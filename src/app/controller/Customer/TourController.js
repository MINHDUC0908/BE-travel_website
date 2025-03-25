const { Tour, Image, Schedule } = require("../../model");


class TourController
{
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
            });
            res.status(200).json({
                success: true,
                message: "Hiển thị tour thành công",
                data: tours
            })
        } catch (error) {
            console.error("Lỗi khi thêm tour:", error);
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
                    }
                ]
            })
            res.json({
                success: true,
                data: tour
            })
        } catch (error) {
            console.error("Lỗi khi thêm tour:", error);
            res.status(500).json({ error: "Lỗi server!" });
        }
    }
}

module.exports = new TourController()