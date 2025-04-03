const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("./User");

const Booking = sequelize.define("Booking", {
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
    total_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
        defaultValue: "pending"
    },
    payment_status: {
        type: DataTypes.ENUM("unpaid", "paid", "failed"),
        defaultValue: "unpaid"
    },
    tour_code: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

// Định nghĩa quan hệ
User.hasMany(Booking, { foreignKey: "user_id", onDelete: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "user_id" });

module.exports = Booking;
