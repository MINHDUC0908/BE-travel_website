const { Op } = require('sequelize');
const { Message, User } = require('../../model');


exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ middleware auth

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId },
                    { recipientId: userId },
                    { recipientId: null }, // Tin nhắn từ user gửi cho tất cả admin
                ],
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name'] },
                { model: User, as: 'recipient', attributes: ['id', 'name'] },
            ],
            order: [['createdAt', 'ASC']],
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy tin nhắn', error });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { message, recipientId } = req.body;
        const senderId = req.user.id;
        const role = req.user.role;

        let newMessage;
        if (role === 'user') {
            newMessage = await Message.create({
                senderId,
                recipientId: null,
                message,
                isRead: false,
            });
        } else if (role === 'admin') {
            if (!recipientId) {
                return res.status(400).json({ message: 'Vui lòng cung cấp ID người nhận' });
            }
            newMessage = await Message.create({
                senderId,
                recipientId,
                message,
                isRead: false,
            });
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi gửi tin nhắn', error });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id; // ID của người dùng hiện tại (user hoặc admin)

        // Tìm thông tin user để kiểm tra vai trò
        const currentUser = await User.findByPk(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Tìm tin nhắn
        const message = await Message.findOne({
            where: { id: messageId },
        });

        if (!message) {
            return res.status(404).json({ message: "Tin nhắn không tồn tại" });
        }

        // Kiểm tra quyền đánh dấu "đã đọc"
        const isAdmin = currentUser.role === "admin"; // Giả sử có trường role trong User
        const isRecipient = message.recipientId === userId;
        const isAdminMessage = message.recipientId === null && message.senderId !== userId;

        // Logic kiểm tra:
        // - User: Chỉ đánh dấu nếu là recipientId
        // - Admin: Đánh dấu nếu tin nhắn có recipientId là null (từ user gửi) hoặc gửi tới admin
        if (!isAdmin && !isRecipient) {
            return res.status(403).json({ message: "Bạn không có quyền đánh dấu tin nhắn này" });
        }
        if (isAdmin && !isRecipient && !isAdminMessage) {
            return res.status(403).json({ message: "Bạn không có quyền đánh dấu tin nhắn này" });
        }

        // Đánh dấu tin nhắn là "đã đọc"
        if (!message.isRead) {
            message.isRead = true;
            await message.save();
        }

        res.status(200).json({ message: "Tin nhắn đã được đánh dấu là đã đọc" });
    } catch (error) {
        console.error("Lỗi khi đánh dấu tin nhắn:", error);
        res.status(500).json({ message: "Lỗi server khi đánh dấu tin nhắn", error });
    }
};