const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require('./User');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    attachment: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'messages',
    timestamps: true,
});

// Thiết lập quan hệ
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

module.exports = Message;