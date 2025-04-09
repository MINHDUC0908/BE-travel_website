const { Server } = require('socket.io');
const { Message, User } = require('../app/model');


const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173', // URL frontend React
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('Người dùng kết nối:', socket.id);

        // User gửi tin nhắn tới tất cả admin
        socket.on('userMessage', async (data) => {
            const { senderId, message } = data;

            const newMessage = await Message.create({
                senderId,
                recipientId: null, // Gửi cho tất cả admin
                message,
                isRead: false,
            });

            const admins = await User.findAll({ where: { role: 'admin' } });
            admins.forEach((admin) => {
                io.to(`user-${admin.id}`).emit('newMessage', newMessage);
            });
        });

        // Admin gửi tin nhắn tới user cụ thể
        socket.on('adminMessage', async (data) => {
            const { senderId, recipientId, message } = data;

            const newMessage = await Message.create({
                senderId,
                recipientId,
                message,
                isRead: false,
            });

            io.to(`user-${recipientId}`).emit('newMessage', newMessage);
        });

        // Tham gia room riêng
        socket.on('joinRoom', (userId) => {
            socket.join(`user-${userId}`);
            console.log(`Người dùng ${userId} tham gia room user-${userId}`);
        });

        socket.on('disconnect', () => {
            console.log('Người dùng ngắt kết nối:', socket.id);
        });
    });

    return io;
};

module.exports = initializeSocket;