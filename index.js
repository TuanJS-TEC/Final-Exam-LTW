// backend/index.js
require('dotenv').config();
const express = require("express");
const session = require("express-session");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");

dbConnect(); // 1. Gọi hàm kết nối cơ sở dữ liệu trước tiên

// 2. REQUIRE CÁC FILE MODEL MỘT CÁCH TƯỜNG MINH VÀ ĐÚNG THỨ TỰ
// Điều này đảm bảo Mongoose đăng ký schema "User" trước khi schema "Photo" (tham chiếu đến User) được đăng ký.
require("./db/userModel.js");   // <<-- Đảm bảo User model được đăng ký
require("./db/photoModel.js");  // <<-- Sau đó Photo model mới được đăng ký
// Nếu bạn có schemaInfoModel.js và nó không tham chiếu đến User/Photo, thứ tự của nó ít quan trọng hơn
// nhưng vẫn nên require ở đây nếu nó là một model:
// require("./db/schemaInfo.js");

// Sau khi các model đã được đăng ký, mới require các Routers
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter"); // PhotoRouter sẽ dùng PhotoModel (đã biết về User)
const AdminRouter = require("./routes/AdminRouter");
const isAuthenticated = require("./middlewares/authMiddleware");
// const CommentRouter = require("./routes/CommentRouter");

const corsOptions = {
    origin: 'http://localhost:5175', // Hoặc port frontend của bạn đang chạy
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/images', express.static('images')); // Đảm bảo dòng này có để phục vụ ảnh tĩnh

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use("/api/user", isAuthenticated, UserRouter);
app.use("/api/photo", isAuthenticated, PhotoRouter); // PhotoRouter giờ sẽ hoạt động đúng với populate
app.use('/admin', AdminRouter);

app.get("/", (request, response) => {
    response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
    console.log("server listening on port 8081");
});