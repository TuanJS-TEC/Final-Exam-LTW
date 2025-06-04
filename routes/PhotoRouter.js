// backend/routes/PhotoRouter.js
const express = require("express");
const mongoose = require('mongoose');
const Photo = require("../db/photoModel");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// const {populate} = require("dotenv");

// --- Cấu hình Multer ---
const UPLOAD_DIR = path.join(__dirname, '..', 'images'); // Đảm bảo đường dẫn này đúng

if (!fs.existsSync(UPLOAD_DIR)) {
    try {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        console.log(`Thư mục lưu ảnh đã được tạo: ${UPLOAD_DIR}`);
    } catch (err) {
        console.error(`Lỗi khi tạo thư mục ${UPLOAD_DIR}:`, err);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        if (!file || !file.originalname) {
            return cb(new Error("Tên file gốc không hợp lệ hoặc thiếu."));
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

function checkFileTypeAndSetValidationError(req, file, cb) {
    if (!file || typeof file.originalname !== 'string' || file.originalname.trim() === '') {
        req.fileValidationError = 'Tên file không hợp lệ hoặc file không được gửi đúng cách.';
        return cb(new Error(req.fileValidationError));
    }
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        req.fileValidationError = 'Lỗi: Chỉ cho phép tải lên các định dạng ảnh: jpeg, jpg, png, gif!';
        return cb(new Error(req.fileValidationError));
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: checkFileTypeAndSetValidationError
});
// --- Kết thúc Multer ---


// API: GET /api/photo/ (Lấy danh sách tất cả ảnh)
router.get("/", async (request, response) => {
    try {
        const photos = await Photo.find({})
            .populate({ path: 'user_id', select: '_id first_name last_name login_name' })
            .sort({ date_time: -1 })
            .select('_id file_name date_time user_id');
        response.status(200).json(photos);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách ảnh:", error);
        response.status(500).json({ message: "Lỗi server khi lấy danh sách ảnh." });
    }
});

// API: POST /api/photo/new (Tải ảnh mới)
router.post("/new", (req, res, next) => {
    upload.single('uploadedPhoto')(req, res, async function (err) {
        if (err) {
            console.error("Lỗi từ Multer hoặc các hàm cấu hình của nó:", err.message);
            let friendlyMessage = err.message || "Lỗi khi xử lý file tải lên.";
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    friendlyMessage = 'Lỗi: Kích thước file quá lớn (tối đa 10MB).';
                } else { friendlyMessage = `Lỗi Multer: ${err.message}.`; }
            }
            return res.status(400).json({ message: friendlyMessage });
        }
        if (!req.session || !req.session.user || !req.session.user._id) {
            return res.status(401).json({ message: "Người dùng chưa đăng nhập hoặc session không hợp lệ." });
        }
        const loggedInUserId = req.session.user._id;
        if (!req.file) {
            return res.status(400).json({ message: "Không có file ảnh hợp lệ nào được tải lên." });
        }
        const uniqueFileName = req.file.filename;
        try {
            const newPhoto = new Photo({
                file_name: uniqueFileName, date_time: new Date(),
                user_id: loggedInUserId, comments: []
            });
            await newPhoto.save();
            const populatedPhoto = await Photo.findById(newPhoto._id)
                .populate('user_id', '_id first_name last_name login_name').exec();
            console.log(`Ảnh mới "${uniqueFileName}" (ID: ${newPhoto._id}) tải lên bởi user ${loggedInUserId}`);
            res.status(201).json(populatedPhoto);
        } catch (dbError) {
            console.error("Lỗi khi lưu ảnh vào database:", dbError);
            const filePath = path.join(UPLOAD_DIR, uniqueFileName);
            fs.unlink(filePath, (unlinkErr) => { /* ... xử lý lỗi unlink ... */ });
            res.status(500).json({ message: "Lỗi server khi lưu thông tin ảnh." });
        }
    });
});

// API: POST /api/photo/commentsOfPhoto/:photoId (Thêm bình luận)
router.post("/commentsOfPhoto/:photoId", async (request, response) => {
    const photoId = request.params.photoId;
    const { comment } = request.body;
    if (!request.session.user || !request.session.user._id) {
        return response.status(401).json({ message: "Yêu cầu đăng nhập để bình luận." });
    }
    const loggedInUserId = request.session.user._id;
    if (!mongoose.Types.ObjectId.isValid(photoId)) {
        return response.status(400).json({ message: "Định dạng ID của ảnh không hợp lệ." });
    }
    if (!comment || typeof comment !== 'string' || comment.trim() === "") {
        return response.status(400).json({ message: "Nội dung bình luận không được để trống." });
    }
    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return response.status(404).json({ message: "Không tìm thấy ảnh để bình luận." });
        }
        const newComment = { comment: comment.trim(), user_id: loggedInUserId, date_time: new Date() };
        photo.comments.push(newComment);
        await photo.save();
        const updatedPhoto = await Photo.findById(photo._id)
            .populate({ path: 'user_id', select: '_id first_name last_name login_name' })
            .populate({ path: 'comments.user_id', select: '_id first_name last_name login_name' })
            .exec();
        console.log(`Bình luận mới được thêm vào ảnh ${photoId} bởi người dùng ${loggedInUserId}`);
        response.status(201).json(updatedPhoto);
    } catch (error) {
        console.error("Lỗi khi thêm bình luận:", error);
        response.status(500).json({ message: "Lỗi server khi thêm bình luận." });
    }
});


// *** THÊM API MỚI ĐỂ LẤY ẢNH CỦA MỘT USER CỤ THỂ ***
// API endpoint: GET /api/photo/photosOfUser/:userId
router.get("/photosOfUser/:userId", async (request, response) => {
    const userId = request.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log('[Backend] PhotoRouter: Invalid user ID format for photosOfUser:', userId);
        return response.status(400).json({ message: "Định dạng ID người dùng không hợp lệ." });
    }

    try {
        console.log(`[Backend] PhotoRouter: Attempting to find photos for user ID: ${userId}`);
        // Tìm tất cả ảnh có user_id khớp, không cần populate user_id nữa vì đã biết là của user này
        // Sắp xếp theo ngày đăng mới nhất
        // Chọn các trường cần thiết cho danh sách ảnh
        const photos = await Photo.find({ user_id: userId })
            .sort({ date_time: -1 })
            .select('_id file_name date_time user_id comments') // Có thể bỏ user_id nếu không cần lặp lại
            .exec();

        if (!photos) { // Photo.find trả về mảng rỗng nếu không có, không phải null
            console.log(`[Backend] PhotoRouter: No photos found for user ID ${userId}.`);
            return response.status(200).json([]); // Trả về mảng rỗng là hợp lý
        }

        console.log(`[Backend] PhotoRouter: Found ${photos.length} photos for user ID ${userId}.`);
        response.status(200).json(photos);

    } catch (error) {
        console.error(`[Backend] PhotoRouter: Error fetching photos for user ID ${userId}:`, error);
        response.status(500).json({ message: "Lỗi server khi lấy danh sách ảnh của người dùng." });
    }
});
// *** KẾT THÚC API MỚI ***


// API: GET /api/photo/:photoId (Lấy chi tiết ảnh) - Route này nên ở cuối cùng
router.get("/:photoId", async (request, response) => {
    const photoId = request.params.photoId;
    // console.log(`[Backend] PhotoRouter: GET /${photoId} - Received request.`); // Bỏ bớt log nếu quá nhiều

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
        // console.log('[Backend] PhotoRouter: Invalid photo ID format received:', photoId);
        return response.status(400).json({ message: "Định dạng ID của ảnh không hợp lệ." });
    }
    try {
        // console.log(`[Backend] PhotoRouter: Attempting to find photo with ID: ${photoId}`);
        const photo = await Photo.findById(photoId)
            .populate({ path: 'user_id', select: '_id first_name last_name login_name' })
            .populate({ path: 'comments.user_id', select: '_id first_name last_name login_name' })
            .exec();
        if (!photo) {
            // console.log(`[Backend] PhotoRouter: Photo with ID ${photoId} NOT FOUND in database.`);
            return response.status(404).json({ message: "Không tìm thấy ảnh." });
        }
        // console.log(`[Backend] PhotoRouter: Photo with ID ${photoId} found. Sending response.`);
        response.status(200).json(photo);
    } catch (error) {
        console.error(`[Backend] PhotoRouter: Error fetching details for photo ID ${photoId}:`, error);
        if (error.name === 'StrictPopulateError') {
            console.error("[Backend] PhotoRouter: StrictPopulateError Path:", error.path);
        }
        response.status(500).json({ message: "Lỗi server khi lấy thông tin ảnh." });
    }
});

module.exports = router;