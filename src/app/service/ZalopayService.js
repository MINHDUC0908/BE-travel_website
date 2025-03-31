const axios = require('axios').default;
const CryptoJS = require('crypto-js'); 
const moment = require('moment');
const User = require('../model/User');
require('dotenv').config(); // Load biến môi trường từ .env

class ZalopayService
{
    static async createZalopayPatment({ amount, booking_id, tour_id, user }) {
        try {
            console.log(user)
            console.log(tour_id)
            console.log(booking_id)
            const transID = `${booking_id}_${Math.floor(Math.random() * 1000000)}_${tour_id}`;
            const order = {
                app_id       : process.env.APP_ID,
                app_trans_id : `${moment().format('YYMMDD')}_${transID}`,
                app_user     : user.email,
                app_time     : Date.now(),
                amount       : amount,
                item         : JSON.stringify([]),
                embed_data: JSON.stringify({ 
                    redirecturl: 'http://localhost:3000/api/zalopay/zalopay_return'}),                
                callback_url : 'http://localhost:5173/zalopay_return',
                description  : `Lazada - Payment for order #${booking_id}`,
                bank_code    : '',
            };
            const data = [
                process.env.APP_ID, 
                order.app_trans_id, 
                order.app_user, 
                order.amount, 
                order.app_time, 
                order.embed_data, 
                order.item,
            ].join('|');
            console.log("Embed Data Sent to ZaloPay:", order.embed_data);

            order.mac = CryptoJS.HmacSHA256(data, process.env.KEY1).toString();
            
            // Sửa lại để khớp với cách đã hoạt động
            const result = await axios.post(process.env.ZALOPAY_ENDPOINT, null, { params: order });
            
            console.log('ZaloPay API response:', result.data);
            
            return result.data;
        } catch (error) {
            console.error('Lỗi khi tạo thanh toán ZaloPay:', error);
            throw new Error('Không thể tạo thanh toán ZaloPay: ' + error.message);
        }
    }
}

module.exports = ZalopayService;