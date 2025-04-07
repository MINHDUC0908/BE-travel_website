const { Contact } = require("../../model");
const { processEmailQueue } = require("../../service/emailService");

class ContactController 
{
    async getContactDetails(req, res) 
    {
        try {
            const { name, email, phone, message } = req.body;
            console.log(name, email, phone, message);
            if (!name || !email || !phone || !message) {
                return res.status(400).json({ message: "Thiếu thông tin!" });
            }
            // Gửi email thông báo
            await processEmailQueue({ name, email, phone, message });
            await Contact.create({
                name,
                email,
                phone,
                message,
            });
            return res.status(200).json({
                success: true,
                message: "Thông tin liên hệ của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.",
            });
        } catch (error) {
            console.error("Lỗi khi gửi thông tin liên hệ:", error);
            return res.status(500).json({ message: "Lỗi server!" });
        }
    }
}

module.exports = new ContactController();