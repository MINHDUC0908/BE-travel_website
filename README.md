npm install sequelize mysql2
=> Kết nối mysql

npm install --save-dev nodemon
=> cài đặt nodemon


npm install jsonwebtoken 
=> Dùng để tạo JWT

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
=> tạo key

<!-- token = header.payload.signnature

signnature: có callback là hàm async, có thể set ExpridIn verify

data + secert (signnature ) => token
token + secert ( verify ) => data
mọi token đều có thời gian sống riêng, khi tạo ra token chúng ta có thể hủy được token đó -->


npm install bcryptjs  
=> Hash & kiểm tra mật khẩu
npm install dotenv  
=> Load biến môi trường

npm install cors

npm install multer
=> upload ảnh

npm install cookie-parser
=> Lưu token vào cookie

npm install nodemailer
=> Gửi mail


npm install bull 

npm install redis


npm install socket.io 

=> chat socket

node src/app/service/emailService.js => kiểm tra hàng đợi 

C:\Users\NITRO 5>redis-server --port 6380
[5784] 30 Mar 22:04:33.480 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
[5784] 30 Mar 22:04:33.480 # Redis version=5.0.14.1, bits=64, commit=ec77f72d, modified=0, pid=5784, just started
[5784] 30 Mar 22:04:33.480 # Configuration loaded
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 5.0.14.1 (ec77f72d/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6380
 |    `-._   `._    /     _.-'    |     PID: 5784
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           http://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

[5784] 30 Mar 22:04:33.484 # Server initialized
[5784] 30 Mar 22:04:33.484 * Ready to accept connections



npm install qrcode
=> Tạo mã qr


npm install node-cron
=> Sử dụng node-cron để chạy một tác vụ định kỳ (ví dụ: mỗi giờ hoặc mỗi ngày) kiểm tra các đơn hàng offline chưa thanh toán và quá hạn.



npm install passport passport-google-oauth20
=> Đăng nhập bằng gg




4. Thao tác CRUD với Sequelize

4.1. Tạo dữ liệu (CREATE)

    const newUser = await User.create({
        username: "john_doe",
        email: "john@example.com",
        password: "123456",
    });
    console.log(newUser.toJSON());

4.2. Lấy dữ liệu (READ)

    const users = await User.findAll();
    console.log(users.map(user => user.toJSON()));

5. Quan hệ giữa các Model

5.1. One-to-One (1-1)
    User.hasOne(Profile);
    Profile.belongsTo(User);
5.2. One-to-Many (1-N)
    User.hasMany(Post);
    Post.belongsTo(User);
5.3. Many-to-Many (N-N)
    Post.belongsToMany(Tag, { through: PostTag });
    Tag.belongsToMany(Post, { through: PostTag });

6. Các Query nâng cao trong Sequelize

6.1. Điều kiện nâng cao
    const users = await User.findAll({
        where: {
            [Op.or]: [{ username: "john_doe" }, { email: "john@example.com" }],
        },
    });

6.2. Chọn cột cụ thể
    const users = await User.findAll({ attributes: ["id", "username"] });

6.3. Sắp xếp dữ liệu
    const users = await User.findAll({ order: [["username", "ASC"]] });

6.4. Giới hạn và phân trang
    const users = await User.findAll({ limit: 10, offset: 20 });

6.5. Nhóm dữ liệu (GROUP BY)
    const result = await Post.findAll({
        attributes: ["userId", [sequelize.fn("COUNT", sequelize.col("id")), "postCount"]],
        group: ["userId"],
    });

7. Sử dụng sequelize.fn với SQL Functions

7.1. Dùng SUM() để tính tổng
    const totalRevenue = await Order.findAll({
        attributes: [[sequelize.fn("SUM", sequelize.col("total_price")), "total_revenue"]],
    });

7.2. Đếm số lượng (COUNT())
    const totalUsers = await User.findAll({
        attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "total_users"]],
    });

7.3. Dùng DATEDIFF() để tính số ngày giữa hai cột
    const result = await Tour.findAll({
        attributes: [
            [sequelize.fn("DATEDIFF", sequelize.col("end_date"), sequelize.col("departure_date")), "duration"],
        ],
    });
