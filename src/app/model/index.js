const sequelize = require("../../config/db")
const Tour = require("./Tour");
const Image = require("./Image");
const Schedule = require("./Schedule");
const TourCategory = require("./TourCategory");

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Kết nối database thành công!");
        
        await sequelize.sync({ alter: true }); // Đồng bộ Model với DB
        console.log("✅ Database đã được đồng bộ!");
    } catch (error) {
        console.error("❌ Lỗi kết nối database:", error);
    }
};

module.exports = { syncDatabase, Tour, Image, Schedule, TourCategory };
