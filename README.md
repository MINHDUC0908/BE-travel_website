# 🚀 Express.js API – Setup và Ghi chú sử dụng

## 📦 Các Package đã cài đặt

### ✅ Kết nối Database (MySQL + Sequelize)
```bash
npm install sequelize mysql2
```
> Kết nối với MySQL sử dụng Sequelize.

---

### 🔁 Reload Server khi thay đổi mã
```bash
npm install --save-dev nodemon
```

---

### 🔐 Xác thực và Bảo mật
```bash
npm install jsonwebtoken
```
> Tạo và xác thực JWT.

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
> Tạo secret key để sử dụng trong JWT.

```bash
npm install bcryptjs
```
> Mã hoá mật khẩu và so sánh mật khẩu.

```bash
npm install dotenv
```
> Quản lý biến môi trường.

```bash
npm install cookie-parser
```
> Lưu token vào cookie.

---

### 🌐 API & Giao tiếp
```bash
npm install cors
```
> Cho phép giao tiếp giữa frontend và backend.

```bash
npm install axios
```
> Gửi HTTP requests từ client.

---

### 📩 Gửi Email
```bash
npm install nodemailer
```

---

### 📤 Upload Ảnh
```bash
npm install multer
```

---

### 💬 Chat real-time với Socket
```bash
npm install socket.io
```

---

### 📧 Hàng đợi gửi mail (Bull + Redis)
```bash
npm install bull
npm install redis
```

> Redis khởi chạy với:
```bash
redis-server --port 6380
```

---

### 📆 Tác vụ định kỳ
```bash
npm install node-cron
```
> Dùng để chạy tự động kiểm tra đơn hàng chưa thanh toán hoặc hết hạn.

---

### 📦 QR Code
```bash
npm install qrcode
```

---

### 🔐 Xác thực bằng Google
```bash
npm install passport passport-google-oauth20
```

---

## 🧱 Sequelize – Thao tác CRUD

### 🔹 Tạo dữ liệu (Create)
```js
const newUser = await User.create({
  username: "john_doe",
  email: "john@example.com",
  password: "123456",
});
console.log(newUser.toJSON());
```

### 🔹 Đọc dữ liệu (Read)
```js
const users = await User.findAll();
console.log(users.map(user => user.toJSON()));
```

---

## 🔗 Quan hệ giữa các Model

### 🔸 One-to-One
```js
User.hasOne(Profile);
Profile.belongsTo(User);
```

### 🔸 One-to-Many
```js
User.hasMany(Post);
Post.belongsTo(User);
```

### 🔸 Many-to-Many
```js
Post.belongsToMany(Tag, { through: PostTag });
Tag.belongsToMany(Post, { through: PostTag });
```

---

## 🔍 Các Query nâng cao trong Sequelize

### ✔️ Điều kiện nâng cao (OR)
```js
const users = await User.findAll({
  where: {
    [Op.or]: [{ username: "john_doe" }, { email: "john@example.com" }],
  },
});
```

### ✔️ Chọn cột cụ thể
```js
const users = await User.findAll({ attributes: ["id", "username"] });
```

### ✔️ Sắp xếp dữ liệu
```js
const users = await User.findAll({ order: [["username", "ASC"]] });
```

### ✔️ Giới hạn và phân trang
```js
const users = await User.findAll({ limit: 10, offset: 20 });
```

### ✔️ Nhóm dữ liệu (GROUP BY)
```js
const result = await Post.findAll({
  attributes: ["userId", [sequelize.fn("COUNT", sequelize.col("id")), "postCount"]],
  group: ["userId"],
});
```

---

## 🧠 SQL Functions với `sequelize.fn`

### 🔸 Tổng (SUM)
```js
const totalRevenue = await Order.findAll({
  attributes: [[sequelize.fn("SUM", sequelize.col("total_price")), "total_revenue"]],
});
```

### 🔸 Đếm (COUNT)
```js
const totalUsers = await User.findAll({
  attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "total_users"]],
});
```

### 🔸 Tính số ngày giữa 2 cột (DATEDIFF)
```js
const result = await Tour.findAll({
  attributes: [
    [sequelize.fn("DATEDIFF", sequelize.col("end_date"), sequelize.col("departure_date")), "duration"],
  ],
});
```

---

### Cơ sở dữ liệu 

### 1. Bảng users

``` sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    googleId VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'support') NOT NULL DEFAULT 'user',
    isVerified BOOLEAN DEFAULT FALSE,
    verificationToken VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT unique_email UNIQUE (email)
);
```
### 2. Bảng tourcategories

```sql
CREATE TABLE tour_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

```

### 3. Bảng tours

```sql
CREATE TABLE tours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tour_name VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    remaining_quantity INT NOT NULL,
    adult_price DECIMAL(12, 2) NOT NULL,
    child_price DECIMAL(12, 2) NOT NULL,
    departure_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    description TEXT,
    depart TEXT,
    category_id INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES tour_categories(id) ON DELETE CASCADE
);

```

### 4. Bảng images 

```sql
CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tour_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

```

### 5. Bảng schedules

```sql
CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tour_id INT NOT NULL,
    day_number INT NOT NULL,
    activities TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

```

### 6. Bảng bookings
```sql
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'failed') DEFAULT 'unpaid',
    tour_code VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 7. Bảng booking_details
```sql
CREATE TABLE booking_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    tour_id INT NOT NULL,
    adults INT NOT NULL,
    children INT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);
```

### 8. Bảng payments
```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method ENUM('online', 'offline', 'zalopay') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT unique_booking_id UNIQUE (booking_id)
);

```

### 9. Bảng contacts

```sql
CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    phone VARCHAR(255),
    isReplied BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 10. Bảng contact_replies
```sql
CREATE TABLE contact_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contact_id INT NOT NULL,
    user_id INT NOT NULL,
    reply_message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 11. Bảng favorite_tours

```sql
CREATE TABLE favorite_tours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tour_id INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_tour UNIQUE (user_id, tour_id)
);
```

### 12. Bảng ratings
```sql
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tour_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    image VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

###  13. Bảng messages
```sql
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    senderId INT NOT NULL,
    recipientId INT,
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    attachment VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE SET NULL
);
```

## 🧑‍💻 Giao diện quản trị viết bằng React

### 📍 Giao diện Trang Tour
![Giao diện Tour](public/tour.png)

---

### ➕ Giao diện Thêm Tour
![Thêm Tour](public/addtour.png)  
![Thêm Hình Ảnh](public/addimage.png)  
![Thêm Lịch Trình](public/addschedule.png)

---

### 🔎 Giao diện Chi Tiết Tour
![Chi Tiết Tour](public/showtour.png)  
![Chi Tiết 2](public/showtour1.png)

---

### 📋 Giao diện Quản lí Booking Tour
![Booking Tour](public/booktour.png)

---

### 👤 Giao diện Quản lí Người Dùng
![Quản lí User](public/user.png)

---

### 📞 Giao diện Liên Hệ
![Liên Hệ](public/contact.png)

---

### 💬 Giao diện Quản lí Tin Nhắn (Chat)
![Chat](public/chat.png)
