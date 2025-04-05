const { Tour, Image, Schedule, TourCategory } = require("../../model");
const { Op } = require("sequelize");
const sequelize = require("../../../config/db")

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
    async filter(req, res) {
        // Op.like: Tìm kiếm chuỗi có chứa một phần cụ thể (dùng trong tìm kiếm văn bản).
        // Op.gte (greater than or equal): Lớn hơn hoặc bằng.
        // Op.lte (less than or equal): Nhỏ hơn hoặc bằng.
        // Op.in: Kiểm tra nếu giá trị thuộc danh sách được chỉ định.
        // Op.or: Điều kiện "hoặc" giữa nhiều điều kiện khác nhau.
        // Op.and: Điều kiện "và" giữa nhiều điều kiện khác nhau.
        try {
            const {
                search, // Tìm kiếm theo tên tour hoặc điểm đến
                destination, // Điểm đến (area trong model)
                priceMin, // Giá tối thiểu
                priceMax, // Giá tối đa
                departureDate, // Ngày khởi hành (định dạng "yyyy-mm-dd")
                duration, // Thời gian tour (e.g., "1-3")
                types, // Loại tour (danh sách tên danh mục, e.g., ["Du lịch biển", "Du lịch văn hóa"])
            } = req.body;
    
            // Xây dựng query object cho Sequelize
            let where = {};
    
            // 1. Tìm kiếm theo tên tour hoặc điểm đến
            if (search) {
                where[Op.or] = [
                    { tour_name: { [Op.like]: `%${search}%` } }, // Tìm kiếm không phân biệt hoa thường
                    { area: { [Op.like]: `%${search}%` } },
                ];
            }
    
            // 2. Lọc theo điểm đến (area)
            if (destination && destination !== "") 
            {
                where.area = destination;
            }
    
            // 3. Lọc theo khoảng giá
            if (priceMin || priceMax)
            {
                where.adult_price = {};
                if (priceMin){
                    where.adult_price[Op.gte] = Number(priceMin);
                }
                if (priceMax) {
                    where.adult_price[Op.lte] = Number(priceMax);
                }
            }
    
            // 4. Lọc theo ngày khởi hành
            if (departureDate) {
                const startDate = new Date(departureDate);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1); // Lấy cả ngày đó
    
                where.departure_date = {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate,
                };
            }
    
            // 5. Lọc theo thời gian tour
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
    
            // 6. Lọc theo loại tour (dựa trên category_id)
            if (types && types.length > 0) {
                // Tìm các category_id tương ứng với tên danh mục trong types
                const categories = await TourCategory.findAll({
                    where: {
                        category_name: { [Op.in]: types }, // Op.in được sử dụng để tìm tất cả các tên danh mục có trong mảng types.
                    },
                    attributes: ["id"],
                });
    
                const categoryIds = categories.map((category) => category.id);
                where.category_id = { [Op.in]: categoryIds };
            }
    
            // Thực hiện query với Sequelize
            const tours = await Tour.findAll({
                where,
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

module.exports = new TourController()