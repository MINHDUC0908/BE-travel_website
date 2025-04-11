const FavoriteTourService = require("../../service/FavoriteService");

class FavoriteTourController
{
    async getAll(req, res)
    {
        try {
            const userId = req.user.id; // Lấy thông tin người dùng từ middleware auth
            const favoriteTours = await FavoriteTourService.getAll(userId);
            return res.json({
                success: favoriteTours.success,
                message: favoriteTours.message,
                data: favoriteTours.data, // Trả về danh sách tour yêu thích
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tour yêu thích:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ, vui lòng thử lại sau!"
            });
        }
    }

    async delete(req, res)
    {
        try {
            const favoriteId = req.params.id; // Lấy ID tour yêu thích từ request params
            console.log("favoriteId", favoriteId);
            const favoriteTour = await FavoriteTourService.delete(favoriteId); 

            if (!favoriteTour.success) {
                return res.status(400).json({
                    success: false,
                    message: favoriteTour.message, 
                });
            }
            return res.json({
                success: favoriteTour.success,
                message: favoriteTour.message,
                data: favoriteTour.data, // Trả về dữ liệu tour yêu thích đã xóa
            });
        } catch (error) {
            console.error("Lỗi khi xóa tour yêu thích:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ, vui lòng thử lại sau!"
            });
        }
    }
    async store(req, res)
    {
        try {
            const user = req.user.id; // Lấy thông tin người dùng từ middleware auth
            const tourId = req.body.tour_id; // Lấy ID tour từ request body
            const favoriteTour = await FavoriteTourService.store(user, tourId); 

            if (!favoriteTour.success) {
                return res.status(400).json({
                    success: false,
                    message: favoriteTour.message, 
                });
            }
            return res.json({
                success: favoriteTour.success,
                message: favoriteTour.message,
                data: favoriteTour.data, // Trả về dữ liệu tour yêu thích đã thêm
            });
        } catch (error) {
            console.error("Lỗi khi thêm tour yêu thích:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ, vui lòng thử lại sau!"
            });
        }
    }
}

module.exports = new FavoriteTourController();