const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Booking = require("./Booking");

const Payment = sequelize.define("Payment", {
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
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.ENUM("online", "offline", "zalopay"),
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM("pending", "completed", "failed"),
        defaultValue: "pending"
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

// Định nghĩa quan hệ
Booking.hasOne(Payment, { foreignKey: "booking_id", onDelete: "CASCADE" });
Payment.belongsTo(Booking, { foreignKey: "booking_id" });

module.exports = Payment;
