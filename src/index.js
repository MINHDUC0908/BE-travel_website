// 1️⃣ Import thư viện và cấu hình
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser"); // Import cookie-parser
const sequelize = require("./config/db"); // Kết nối MySQL
const { syncDatabase } = require("./app/model"); // Đồng bộ database
const router = require("./router"); // Import router
require("dotenv").config();
require('./queues/emailQueue'); // Khởi động hàng đợi email
require('./app/cronJobs/cronJobs'); // Khởi động cron job

const app = express();
const PORT = 3000;

// Cấu hình body-parser để xử lý request lớn
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 2️⃣ Cấu hình Middleware
app.use(cookieParser()); // Middleware xử lý cookies
app.use(cors({
    origin: "http://localhost:5173", // Thay bằng URL frontend của bạn
    credentials: true, // Cho phép gửi cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3️⃣ Cấu hình thư mục static (chứa ảnh, tài nguyên tĩnh)
app.use(express.static("public")); 
app.use("/image/tour", express.static(path.join(__dirname, "public/image/tour")));
app.use("/image/tourCategory", express.static(path.join(__dirname, "public/image/tourCategory")));
app.use("/image/qrcodes", express.static(path.join(__dirname, "public/image/qrcodes")));
console.log("📂 Serving static files from:", path.join(__dirname, "public/image/tour"));

// 4️⃣ Kết nối Database
sequelize.sync({ force: false }) // force: false để tránh mất dữ liệu
    .then(() => console.log("✅ Bảng đã được đồng bộ với MySQL"))
    .catch((err) => console.error("❌ Lỗi đồng bộ:", err));

syncDatabase(); // Chạy hàm đồng bộ database nếu cần

// 5️⃣ Khởi tạo routes
router(app);

// 6️⃣ Chạy server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

// const sendMail = require("./mail/mailer");
// sendMail("duclvm.23itb@vku.udn.vn", "Hello!", "This is a test email.");
app.get("/check-cookie", (req, res) => {
    console.log("Cookies received:", req.cookies); // Log toàn bộ cookies nhận được
    if (req.cookies.refreshToken) {
        res.json({ message: "Có refreshToken", refreshToken: req.cookies.refreshToken });
    } else {
        res.json({ message: "Không có refreshToken" });
    }
});
