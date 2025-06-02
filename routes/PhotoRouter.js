// backend/routes/PhotoRouter.js
const express = require("express");
const mongoose = require('mongoose');
const Photo = require("../db/photoModel");
// User model không cần import trực tiếp nếu ref đã đúng trong schema
// const User = require("../db/userModel");
const router = express.Router();

// API endpoint: GET /api/photo/  (Lấy danh sách TẤT CẢ ảnh)
router.get("/", async (request, response) => {
    try {
        const photos = await Photo.find({})
            .populate({
                path: 'user_id',
                select: '_id first_name last_name login_name'
            })
            .sort({ date_time: -1 })
            .select('_id file_name date_time user_id comments'); // Bao gồm cả comments nếu muốn hiển thị số lượng comments
        response.status(200).json(photos);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách ảnh:", error);
        response.status(500).json({ message: "Lỗi server khi lấy danh sách ảnh." });
    }
});

// API endpoint: POST /api/photo/ (Tạo ảnh mới - Vấn đề 3: Tải ảnh lên)
router.post("/", async (request, response) => {
    // Logic cho việc tải ảnh lên sẽ được thêm ở Vấn đề 3
    response.status(501).send("API tạo ảnh mới chưa được triển khai.");
});

// API endpoint: POST /api/photo/commentsOfPhoto/:photoId
// Thêm một bình luận mới vào ảnh
router.post("/commentsOfPhoto/:photoId", async (request, response) => {
    const photoId = request.params.photoId;
    const { comment } = request.body; // Lấy nội dung bình luận từ body

    // Middleware isAuthenticated đã kiểm tra đăng nhập, nhưng có thể kiểm tra session lại nếu muốn thêm an toàn
    if (!request.session || !request.session.user || !request.session.user._id) {
        // Dòng này thường không cần thiết nếu isAuthenticated hoạt động đúng
        return response.status(401).json({ message: "Yêu cầu đăng nhập để bình luận." });
    }
    const loggedInUserId = request.session.user._id;

    // Kiểm tra photoId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(photoId)) {
        console.log('Thêm bình luận: Định dạng ID ảnh không hợp lệ:', photoId);
        return response.status(400).json({ message: "Định dạng ID của ảnh không hợp lệ." });
    }

    // Kiểm tra nội dung bình luận có rỗng không
    if (!comment || typeof comment !== 'string' || comment.trim() === "") {
        console.log('Thêm bình luận: Nội dung bình luận bị rỗng.');
        return response.status(400).json({ message: "Nội dung bình luận không được để trống." });
    }

    try {
        const photo = await Photo.findById(photoId);

        if (!photo) {
            console.log("Thêm bình luận: Không tìm thấy ảnh với ID:", photoId);
            return response.status(404).json({ message: "Không tìm thấy ảnh để bình luận." });
        }

        const newComment = {
            comment: comment.trim(),
            user_id: loggedInUserId,
            date_time: new Date()
            // _id cho comment sẽ được Mongoose tự tạo
        };

        photo.comments.push(newComment);
        await photo.save();

        // Populate lại toàn bộ ảnh để có thông tin user cho bình luận mới nhất
        const updatedPhoto = await Photo.findById(photo._id) // Sử dụng photo._id đã lấy được
            .populate({ path: 'user_id', select: '_id first_name last_name login_name' })
            .populate({ path: 'comments.user_id', select: '_id first_name last_name login_name' })
            .exec();

        console.log(`Bình luận mới được thêm vào ảnh ${photoId} bởi người dùng ${loggedInUserId}`);
        response.status(201).json(updatedPhoto); // Trả về ảnh đã cập nhật với bình luận mới

    } catch (error) {
        console.error("Lỗi khi thêm bình luận:", error);
        response.status(500).json({ message: "Lỗi server khi thêm bình luận." });
    }
});

// API endpoint: GET /api/photo/:photoId
// Lấy thông tin chi tiết của một ảnh (đặt sau các route cụ thể hơn nếu có)
router.get("/:photoId", async (request, response) => {
    const photoId = request.params.photoId;

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
        console.log('Lấy chi tiết ảnh: Định dạng ID ảnh không hợp lệ:', photoId);
        return response.status(400).json({ message: "Định dạng ID của ảnh không hợp lệ." });
    }

    try {
        const photo = await Photo.findById(photoId)
            .populate({
                path: 'user_id',
                select: '_id first_name last_name login_name'
            })
            .populate({
                path: 'comments.user_id',
                select: '_id first_name last_name login_name'
            })
            .exec();

        if (!photo) {
            console.log("Lấy chi tiết ảnh: Không tìm thấy ảnh với ID:", photoId);
            return response.status(404).json({ message: "Không tìm thấy ảnh." });
        }
        response.status(200).json(photo);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin ảnh chi tiết:", error);
        if (error.name === 'StrictPopulateError') {
            console.error("Lỗi StrictPopulate Path:", error.path);
        }
        response.status(500).json({ message: "Lỗi server khi lấy thông tin ảnh." });
    }
});

module.exports = router;