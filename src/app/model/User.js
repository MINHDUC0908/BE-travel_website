const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../../config/db");

const User = sequelize.define("User", {
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
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Bỏ validator cho confirmPassword vì sẽ xử lý ở controller
    confirmPassword: {
        type: DataTypes.VIRTUAL, // Không lưu vào database
        allowNull: true, // Đổi thành true để không bắt buộc phải có giá trị
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user'
    }
}, {
    tableName: "users",
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed("password")) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Kiểm tra mật khẩu khi đăng nhập
User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = User;