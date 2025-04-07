const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Booking = require("./Booking");
const Tour = require("./Tour");

const BookingDetail = sequelize.define("BookingDetail", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    booking_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Booking,
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
    },
    adults: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    children: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    }
}, {
    timestamps: true
});

// Định nghĩa quan hệ
Booking.hasMany(BookingDetail, { foreignKey: "booking_id", onDelete: "CASCADE" });
BookingDetail.belongsTo(Booking, { foreignKey: "booking_id" });

Tour.hasMany(BookingDetail, { foreignKey: "tour_id", onDelete: "CASCADE" });
BookingDetail.belongsTo(Tour, { foreignKey: "tour_id" });

module.exports = BookingDetail;