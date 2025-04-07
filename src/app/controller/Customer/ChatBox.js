const axios = require('axios');

class ChatBox {
    async chatBox(req, res) {
        try {
            const message = req.body.message;
            const apiKey = process.env.GEMINI_API_KEY;

            const response = await axios.post(
                'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
                {
                    contents: [
                        { parts: [{ text: message }] }
                    ]
                },
                {
                    params: {
                        key: apiKey
                    }
                }
            );

            const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ Gemini.';
            
            res.json({ data: reply });
        } catch (error) {
            console.error('Lỗi ChatBox:', error.message);
            res.status(500).json({ error: 'Đã xảy ra lỗi khi gọi API Gemini.' });
        }
    }
}

module.exports = new ChatBox();
