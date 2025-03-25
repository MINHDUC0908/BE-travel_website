const { Image } = require("../../model");
const fs = require("fs");
const path = require("path");
const createUploader = require("../../../upload/upload");
// Khởi tạo uploader với thư mục lưu ảnh
const upload = createUploader(path.join(__dirname, "../../../public/image/tour"));

class ImageController {
    async delete(req, res) {
        try {
            const image = await Image.findByPk(req.params.id);
            if (!image) {
                return res.json({
                    message: "Không tồn tại ảnh cần xóa"
                });
            }
            // Xác định đường dẫn tệp ảnh từ `image.image_url`
            const imagePath = path.join(__dirname, "../../../public", image.image_url);

            // Kiểm tra xem tệp ảnh có tồn tại trên hệ thống không
            if (fs.existsSync(imagePath)) {
                // Xóa tệp ảnh khỏi hệ thống
                fs.unlinkSync(imagePath);
            } else {
                return res.json({
                    message: "Ảnh không tồn tại trên hệ thống"
                });
            }

            // Xóa bản ghi ảnh trong cơ sở dữ liệu
            await Image.destroy({ where: { id: req.params.id } });
            return res.json({
                message: "Ảnh đã được xóa thành công"
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Đã có lỗi xảy ra khi xóa ảnh"
            });
        }
    }
    async store(req, res) {
        try {
            if (!req.file) 
            {
                return res.status(400).json({ message: "Không có file nào được tải lên!" });
            }
    

            const image = await Image.create({
                tour_id: req.body.tour_id,
                image_url: `/image/tour/${req.file.filename}`
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

module.exports = { imageController: new ImageController(), upload};
