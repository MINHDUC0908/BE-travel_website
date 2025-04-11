
const router = require('express').Router();
const favoriteController = require('../../app/controller/Customer/FavoriteController');

router.get('/', favoriteController.getAll); // Lấy danh sách tour yêu thích của người dùng
router.post('/store', favoriteController.store); // Thêm tour yêu thích
router.delete('/delete/:id', favoriteController.delete); // Thêm tour yêu thích

module.exports = router;