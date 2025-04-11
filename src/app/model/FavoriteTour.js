const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("./User");
const Tour = require("./Tour");

const FavoriteTour = sequelize.define("FavoriteTour", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id"
        },
        allowNull: false
    },
    tour_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Tour,
            key: "id"
        },
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: "favorite_tours"  // tên rõ ràng hơn
});

// Thiết lập mối quan hệ
User.belongsToMany(Tour, { through: FavoriteTour, foreignKey: "user_id", otherKey: "tour_id" });
Tour.belongsToMany(User, { through: FavoriteTour, foreignKey: "tour_id", otherKey: "user_id" });

FavoriteTour.belongsTo(User, { foreignKey: "user_id" });
FavoriteTour.belongsTo(Tour, { foreignKey: "tour_id" });

module.exports = FavoriteTour;
