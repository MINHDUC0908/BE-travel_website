const { Schedule } = require("../../model");

class ScheduleController {
    async update(req, res) {
        try {
            // Tìm lịch trình cần cập nhật
            const schedule = await Schedule.findByPk(req.params.id);
            if (!schedule) {
                return res.json({
                    message: "Không tồn tại lịch trình cần chỉnh sửa"
                });
            }

            // Cập nhật activities
            await Schedule.update(
                { activities: req.body.activities },
                { where: { id: req.params.id } }  // Điều kiện để chỉ cập nhật bản ghi này
            );

            // Lấy lại bản ghi đã cập nhật
            const updatedSchedule = await Schedule.findByPk(req.params.id);
            return res.json({
                success: true,
                data: updatedSchedule
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Đã có lỗi xảy ra khi cập nhật lịch trình"
            });
        }
    }
}

module.exports = new ScheduleController();
