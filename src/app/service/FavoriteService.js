const { Tour, FavoriteTour, Image, Schedule } = require("../model");


class FavoriteTourService
{
    static async getAll(userId)
    {
        try {
            if (!userId) 
            {
                return {
                    message: "Vui lòng đăng nhập để xem tour yêu thích!",
                    success: false,
                }
            }

            const favoriteTours = await FavoriteTour.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: Tour,
                        include: [
                            {
                                model: Image,
                            },
                            {
                                model: Schedule,
                            }
                        ]
                    }
                ],
            });

            return {
                success: true,
                message: "Lấy danh sách tour yêu thích thành công",
                data: favoriteTours
            };
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tour yêu thích:", error);
            return {
                success: false,
                message: "Lỗi máy chủ, vui lòng thử lại sau!"
            };
        }
    }

    static async delete(favoriteId) {
        try {
            const favoriteTour = await FavoriteTour.findByPk(favoriteId);
            console.log("favoriteTour", favoriteId);
            console.error("favoriteTour", favoriteTour);
            if (!favoriteTour) {
                return {
                    message: "Không tìm thấy tour yêu thích!",
                    success: false,
                };
            }  
            // Xóa bản ghi tour yêu thích
            await favoriteTour.destroy(); 
    
            return {
                message: "Xóa tour yêu thích thành công!",
                success: true,
            };
        } catch (error) {
            console.error("Lỗi khi xóa tour yêu thích:", error);
            return {
                message: "Lỗi máy chủ, vui lòng thử lại sau!",
                success: false,
            };
        }
    }
    
    static async store(userId, tourId) 
    {
        try {
            if (!userId) 
            {
                return {
                    message: "Vui lòng đăng nhập để thêm tour yêu thích!",
                    success: false,
                }
            }

            if (!tourId) 
            {
                return {
                    message: "Không tìm thấy tour yêu thích!",
                    success: false,
                }
            }

            const existingFavorite = await FavoriteTour.findOne({
                where: {
                    user_id: userId,
                    tour_id: tourId
                }
            });
            if (existingFavorite) 
            {
                return {
                    message: "Tour đã được yêu thích trước đó!",
                    success: false,
                }
            }
            const favorite_tours = await FavoriteTour.create({
                user_id: userId,
                tour_id: tourId
            })

            return {
                success: true,
                message: "Thêm tour yêu thích thành công",
                data: favorite_tours
            }
        } catch (error) {
            console.error("Lỗi khi thêm tour yêu thích:", error);
            return {
                success: false,
                message: "Lỗi máy chủ, vui lòng thử lại sau!"
            };
        }
    }
}

module.exports = FavoriteTourService;