const { Contact, ContactReply } = require("../../model");
const { processEmailQueue, processEmailRepQueue } = require("../../service/emailService");

class ContactController
{
    async index(req, res) {
        try {
            const contacts = await Contact.findAll({
                include: [
                    {
                        model: ContactReply,
                    }
                ],
                order: [["createdAt", "DESC"]]
            });
    
            res.status(200).json({
                success: true,
                message: "Hiển thị danh sách liên hệ thành công",
                data: contacts
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách liên hệ:", error);
            res.status(500).json({ error: "Lỗi server!" });
        }
    }
    

    async sendReply(req, res) {
        try {
            const { id } = req.user;
            const { contact_id, message } = req.body;
    
            const contact = await Contact.findByPk(contact_id);
            if (!contact) {
                return res.status(404).json({ success: false, message: "Không tìm thấy thông tin liên hệ." });
            }
    
            const { email: emailReply, name } = contact;
    
            await processEmailRepQueue({ email: emailReply, message });
    
            const contactReply = await ContactReply.create({
                contact_id,
                user_id: id,
                reply_message: message
            });
            await contact.update({
                isReplied: true
            })
    
            return res.json({
                success: true,
                data: contactReply,
                message: `Đã gửi phản hồi tới ${name} thành công!`
            });
        } catch (error) {
            console.error("Lỗi khi gửi phản hồi:", error);
            return res.status(500).json({ success: false, message: "Lỗi server!" });
        }
    }    
}

module.exports = new ContactController();