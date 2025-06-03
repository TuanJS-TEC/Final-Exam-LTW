// backend/index.js
require('dotenv').config();
const express = require("express");
const session = require("express-session");
const app = express();
const cors = require("cors");
const path = require('path'); // Thêm path để phục vụ static images nếu thư mục images không ở gốc

const dbConnect = require("./db/dbConnect");

dbConnect();

require("./db/userModel.js");
require("./db/photoModel.js");
// require("./db/schemaInfo.js"); // Bỏ comment nếu bạn có và sử dụng model này

const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");
const isAuthenticated = require("./middlewares/authMiddleware");

const corsOptions = {
    origin: 'http://localhost:5175', // Cập nhật port frontend của bạn nếu cần
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Đảm bảo đường dẫn đến thư mục 'images' là chính xác
// Nếu 'images' nằm cùng cấp với file index.js này (ví dụ: backend/images) thì dùng 'images'
// Nếu 'images' nằm ở gốc dự án (Final_Exam_LTW/images), và index.js ở backend/index.js,
// thì bạn cần path.join(__dirname, '..', 'images')
// Giả sử 'images' nằm cùng cấp với file index.js này:
app.use('/images', express.static(path.join(__dirname, 'images')));
// Hoặc nếu images ở gốc dự án (và index.js này đang ở trong một thư mục con như 'backend'):
// app.use('/images', express.static(path.join(__dirname, '..', 'images')));


app.use(
    session({
        secret: process.env.SESSION_SECRET || 'a_very_strong_default_secret_key_123!@#', // Nên có một secret key dự phòng mạnh
        resave: false,
        saveUninitialized: false,
        cookie: {
            // secure: process.env.NODE_ENV === "production", // Bật khi dùng HTTPS
            httpOnly: true,
            // sameSite: 'lax' // Hoặc 'none' nếu cần và đã có secure: true
        }
    })
);

// UserRouter tạm thời không dùng isAuthenticated để cho phép đăng ký
app.use("/api/user", UserRouter);
// Các router khác vẫn được bảo vệ nếu cần
app.use("/api/photo", isAuthenticated, PhotoRouter);
app.use('/admin', AdminRouter); // AdminRouter chứa login/logout, thường không cần bảo vệ toàn bộ

app.get("/", (request, response) => {
    response.send({ message: "Hello from photo-sharing app API!" });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});