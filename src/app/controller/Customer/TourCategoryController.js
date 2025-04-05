const { Op } = require("sequelize");
const { TourCategory, Tour, Image, Schedule } = require("../../model");
const sequelize = require("../../../config/db");


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

    async getToursByCategory(req, res) {
        try {
            const { category_id } = req.body;
    
            const tours = await Tour.findAll({
                where: { category_id },
                include: [
                    {
                        model: TourCategory,
                    },
                    {
                        model: Image,
                        attributes: ['image_url']
                    },
                    {
                        model: Schedule,
                    }
                ]
            });
    
            return res.json({
                success: true,
                data: tours
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Đã có lỗi xảy ra khi lấy danh sách tour theo danh mục"
            });
        }
    }
    async filterGetToursByCategory(req, res)
    {
        try {
            const { priceMin, priceMax, area, duration, category_id} = req.body;
            let where = {};

            if (area && Array.isArray(area) && area.length > 0) {
                where[Op.or] = area.map((item) => ({
                    area: { [Op.like]: `%${item}%` }
                }));
            }
            // if (area && Array.isArray(area) && area.length > 0) {
            //     where.area = { [Op.in]: area };
            // }              
            if (priceMin || priceMax) {
                where.adult_price = {
                    [Op.gte]: priceMin ? Number(priceMin) : 0, // Đảm bảo là số
                    [Op.lte]: priceMax ? Number(priceMax) : 1000000000,
                };
            }

            if (duration && duration !== "") {
                let minDays, maxDays;
                switch (duration) {
                    case "1-3":
                        minDays = 1;
                        maxDays = 3;
                        break;
                    case "4-7":
                        minDays = 4;
                        maxDays = 7;
                        break;
                    case "7-14":
                        minDays = 7;
                        maxDays = 14;
                        break;
                    case "14+":
                        minDays = 14;
                        maxDays = Infinity;
                        break;
                    default:
                        break;
                }
    
                if (minDays && maxDays) {
                    // Tính số ngày giữa departure_date và end_date
                    where[Op.and] = [
                        sequelize.where(
                            // để tính số ngày giữa ngày khởi hành và ngày kết thúc.
                            sequelize.fn(
                                "DATEDIFF",
                                sequelize.col("end_date"),
                                sequelize.col("departure_date")
                            ),
                            { [Op.gte]: minDays }
                        ),
                        sequelize.where(
                            sequelize.fn(
                                "DATEDIFF",
                                sequelize.col("end_date"),
                                sequelize.col("departure_date")
                            ),
                            { [Op.lte]: maxDays === Infinity ? 9999 : maxDays }
                        ),
                    ];
                }
            }
            const tours = await Tour.findAll({
                where: { ...where, category_id },
                include: [
                    {
                        model: Schedule,
                        attributes: ['id', "tour_id", 'day_number', "activities"],
                    },
                    {
                        model: Image,
                    },
                    {
                        model: TourCategory
                    }
                ]
            });
            
            // Trả về kết quả
            res.status(200).json({
                success: true,
                data: tours,
                message: "Lọc tour thành công",
            });
        } catch (error) {
            console.error("Lỗi khi lọc tour:", error);
            res.status(500).json({
                success: false,
                message: "Đã có lỗi xảy ra khi lọc tour",
                error: error.message,
            });
        }
    }
}

module.exports = new TourCategoryController()