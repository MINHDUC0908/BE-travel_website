const { TourCategory } = require("../../model");

const createUploader = require("../../../upload/upload");
const path = require("path")

// Khởi tạo uploader với thư mục lưu ảnh
const upload = createUploader(path.join(__dirname, "../../../public/image/tourCategory"));
class TourCategoryController
{
    async index(req, res)
    {
        try {
            const tourcategories = await TourCategory.findAll({})
            return res.json({
                success: true,
                data: tourcategories
            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Đã có lỗi xảy ra khi cập nhật lịch trình"
            });
        }
    }
    async store(req, res)
    {
        try {
            if (!req.file) 
            {
                return res.status(400).json({ message: "Không có file nào được tải lên!" });
            }
            const image = await TourCategory.create({
                category_name: req.body.category_name,
                image_url: `/image/tourCategory/${req.file.filename}`
            });
            return res.status(201).json({ 
                success: true,
                message: "Tải lên thành công!", 
                image 
            });
        } catch (error) {
            console.error("Lỗi khi lưu ảnh:", error);
            return res.status(500).json({ 
                message: "Đã xảy ra lỗi khi lưu ảnh!" 
            });
        }
    }
}

module.exports = { tourCategoryController: new TourCategoryController(), upload}