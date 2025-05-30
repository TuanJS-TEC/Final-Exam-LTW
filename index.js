require('dotenv').config();
const express = require("express");
const session = require("express-session");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");
const isAuthenticated = require("./middlewares/authMiddleware");
// const CommentRouter = require("./routes/CommentRouter");

const corsOptions = {
    origin: 'http://localhost:5176', // <<-- Đặt ĐÚNG origin của frontend của bạn
    // (Dựa theo lỗi là http://localhost:5173)
    credentials: true, // <<-- Cho phép gửi kèm cookie và các credentials khác
    optionsSuccessStatus: 200 // Một số trình duyệt cũ hơn có thể gặp vấn đề với status 204
};

dbConnect();

app.use(cors());
app.use(express.json());

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave:false,
      saveUninitialized: false,
    })
)

app.use("/api/user", isAuthenticated, UserRouter);
app.use("/api/photo", isAuthenticated, PhotoRouter);
app.use('/admin', AdminRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
