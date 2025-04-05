const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Tour = require('./Tour');
const User = require('./User');

const Rating = sequelize.define("Rating", {
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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    }
} , {
    timestamps: true
})
// Định nghĩa quan hệ
Tour.hasMany(Rating, { foreignKey: "tour_id", onDelete: "CASCADE" });
Rating.belongsTo(Tour, { foreignKey: "tour_id" });

User.hasMany(Rating, { foreignKey: "user_id", onDelete: "CASCADE" });
Rating.belongsTo(User, { foreignKey: "user_id" });

module.exports = Rating;