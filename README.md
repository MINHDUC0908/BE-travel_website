npm install sequelize mysql2
=> Kết nối mysql

npm install --save-dev nodemon
=> cài đặt nodemon


npm install jsonwebtoken 
=> Dùng để tạo JWT

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
=> tạo key

token = header.payload.signnature

signnature: có callback là hàm async, có thể set ExpridIn verify

data + secert (signnature ) => token
token + secert ( verify ) => data
mọi token đều có thời gian sống riêng, khi tạo ra token chúng ta có thể hủy được token đó


npm install bcryptjs  
=> Hash & kiểm tra mật khẩu
npm install dotenv  
=> Load biến môi trường

npm install cors

npm install multer
=> upload ảnh

npm install cookie-parser
