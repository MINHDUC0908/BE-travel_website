const { TourCategory, Tour } = require("../../model");


class TourCategoryController
{
    async index(req, res)
    {
        try {
            const tourCategories = await TourCategory.findAll({
                include: [
                    {
                        model: Tour
                    }
                ]
            })
            res.json({
                success: true,
                data: tourCategories
            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Đã có lỗi xảy ra khi cập nhật lịch trình"
            });
        }
    }
}

module.exports = new TourCategoryController()