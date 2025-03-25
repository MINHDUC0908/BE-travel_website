const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const TourCategory = require("./TourCategory");

const Tour = sequelize.define("Tour", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tour_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    area: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    adult_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    child_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    departure_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        references: {
            model: TourCategory,  // Bảng TourCategory
            key: 'id'
        },
        allowNull: false
    }
}, {
    timestamps: true
});

TourCategory.hasMany(Tour, { foreignKey: "category_id", onDelete: "CASCADE" });
Tour.belongsTo(TourCategory, { foreignKey: "category_id" });

module.exports = Tour;
