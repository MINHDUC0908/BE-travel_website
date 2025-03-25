const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db")
const Tour = require("./Tour");

const Schedule = sequelize.define("Schedule", {
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
    day_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    activities: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true
});

// Thiết lập quan hệ
Tour.hasMany(Schedule, { foreignKey: "tour_id", onDelete: "CASCADE" });
Schedule.belongsTo(Tour, { foreignKey: "tour_id" });

module.exports = Schedule;
