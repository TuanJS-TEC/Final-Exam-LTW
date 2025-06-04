// backend/index.js
require('dotenv').config(); //Nap bien tu moi truong
const express = require("express");
const session = require("express-session"); // thiet lap quan ly phien lam viec -VD1
const app = express();
const cors = require("cors"); //VD1
const path = require('path');

const dbConnect = require("./db/dbConnect");

dbConnect();

require("./db/userModel.js");
require("./db/photoModel.js");
// require("./db/schemaInfo.js");

const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter"); //VD1
const isAuthenticated = require("./middlewares/authMiddleware");

const corsOptions = { //dinh nghia cors
    origin: 'http://localhost:5173', // chi dinh frontend duoc truy cap
    credentials: true, //gui cookie (chua session ID) qua cac origin khac
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));//sd middlewarecorsoption
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'a_very_strong_default_secret_key_123!@#', // Nên có một secret key dự phòng mạnh
        resave: false, //Khong luu lai session neu khong co thay doi
        saveUninitialized: false, //KHong tao session cho den khi co gi do duoc luu cookie
        cookie: {
            // secure: process.env.NODE_ENV === "production", // Bật khi dùng HTTPS
            httpOnly: true,
            // sameSite: 'lax' // Hoặc 'none' nếu cần và đã có secure: true
        }
    })
);


app.use("/api/user",isAuthenticated, UserRouter);

app.use("/api/photo",isAuthenticated,PhotoRouter); //
app.use('/admin', AdminRouter); // AdminRouter chứa login/logout, thường không cần bảo vệ toàn bộ

app.get("/", (request, response) => {
    response.send({ message: "Hello from photo-sharing app API!" });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});