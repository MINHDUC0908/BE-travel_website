
const router = require('express').Router();
const { profileController, upload } = require('../../app/controller/Customer/ProfileController');

router.post('/update', upload.single('avatar'), profileController.updateProfile); // Cập nhật thông tin cá nhân
router.get('/historybookings', profileController.getBooking); // Lấy danh sách booking của người dùng
router.get('/ratings', profileController.getComment); // Lấy danh sách booking của người dùng

module.exports = router;