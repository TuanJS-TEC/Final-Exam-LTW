// backend/routes/UserRouter.js
const express = require("express");
const mongoose = require('mongoose'); // Cần cho ObjectId.isValid
const User = require("../db/userModel");
const router = express.Router();

router.post("/", async (request, response) => {
    const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

    if (!login_name || !password || !first_name || !last_name) {
        return response.status(400).json({
            message: "Vui lòng cung cấp đầy đủ Tên đăng nhập, Mật khẩu, Tên, và Họ."
        });
    }

    if (password.length < 6) {
        return response.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
    }

    try {
        const existingUser = await User.findOne({ login_name: login_name });
        if (existingUser) {
            return response.status(400).json({ message: "Tên đăng nhập này đã được sử dụng." });
        }

        const newUser = new User({
            login_name,
            password,
            first_name,
            last_name,
            location: location || "",
            description: description || "",
            occupation: occupation || ""
        });

        await newUser.save();

        const userToReturn = {
            _id: newUser._id,
            login_name: newUser.login_name,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            location: newUser.location,
            description: newUser.description,
            occupation: newUser.occupation
        };

        console.log("Người dùng mới đã tạo:", userToReturn.login_name);
        response.status(201).json({ message: "Đăng ký tài khoản thành công!", user: userToReturn });

    } catch (error) {
        console.error("Lỗi khi tạo người dùng mới:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return response.status(400).json({ message: messages.join(', ') });
        }
        response.status(500).json({ message: "Lỗi server khi đăng ký người dùng." });
    }
});

router.get("/list", async (request, response) => {
    try {
        const users = await User.find({})
            .select("_id first_name last_name login_name")
            .sort({ last_name: 1, first_name: 1 });
        response.status(200).json(users);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        response.status(500).json({ message: "Lỗi khi lấy danh sách người dùng từ cơ sở dữ liệu." });
    }
});

router.get("/:userId", async (request, response) => {
    try {
        const userId = request.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).json({ message: "Định dạng ID người dùng không hợp lệ." });
        }
        const user = await User.findById(userId)
            .select("_id first_name last_name login_name location description occupation");
        if (!user) {
            return response.status(404).json({ message: "Không tìm thấy người dùng." });
        }
        response.status(200).json(user);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return response.status(400).json({ message: "Định dạng ID người dùng không hợp lệ." });
        }
        response.status(500).json({ message: "Lỗi server khi lấy thông tin người dùng." });
    }
});

module.exports = router;