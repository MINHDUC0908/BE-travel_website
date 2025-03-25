const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db")

const TourCategory = sequelize.define("TourCategory", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: true });

module.exports = TourCategory;