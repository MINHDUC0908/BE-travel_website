const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db")
const Tour = require("./Tour");

const Image = sequelize.define("Image", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Tour,
            key: "id"
        },
        onDelete: "CASCADE"
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

// Thiết lập quan hệ
Tour.hasMany(Image, { foreignKey: "tour_id", onDelete: "CASCADE" });
Image.belongsTo(Tour, { foreignKey: "tour_id" });

module.exports = Image;
