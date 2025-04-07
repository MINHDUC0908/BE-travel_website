const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Contact = require('./Contact');
const User = require('./User');

const ContactReply = sequelize.define('ContactReply', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    contact_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Contact,
            key: 'id'
        },
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    reply_message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'contact_replies',
    timestamps: true
});

// Thiết lập quan hệ
ContactReply.belongsTo(Contact, { foreignKey: 'contact_id' });
Contact.hasMany(ContactReply, { foreignKey: 'contact_id' });
ContactReply.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(ContactReply, { foreignKey: 'user_id' });

module.exports = ContactReply;