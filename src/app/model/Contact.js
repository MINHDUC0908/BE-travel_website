const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Contact = sequelize.define("Contact", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true, // Kiểm tra định dạng email
        },
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    }, 
    isReplied: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }    
}, {
    tableName: "contacts",
    timestamps: true,
})

module.exports = Contact;