// backend/routes/UserRouter.js
const express = require("express");
const User = require("../db/userModel"); // Đảm bảo đường dẫn này đúng
const router = express.Router();

// Route mới để lấy danh sách tất cả người dùng
// Sẽ tương ứng với API: GET /api/user/list
router.get("/list", async (request, response) => {
    try {
        // Tìm tất cả người dùng.
        // .select() để chỉ lấy các trường cần thiết, tránh lộ thông tin nhạy cảm (nếu có)
        // Sắp xếp theo last_name, sau đó là first_name cho dễ nhìn (tùy chọn)
        const users = await User.find({})
            .select("_id first_name last_name login_name") // Lấy các trường này
            .sort({ last_name: 1, first_name: 1 });

        // Trả về danh sách người dùng dưới dạng JSON
        // Quan trọng: Đảm bảo các trường trả về khớp với những gì UserList.jsx ở frontend mong đợi
        // (ví dụ: first_name, last_name, login_name, _id)
        response.status(200).json(users);

    } catch (error) {
        console.error("Error fetching user list:", error);
        response.status(500).json({ message: "Lỗi khi lấy danh sách người dùng từ cơ sở dữ liệu." });
    }
});

// Route POST /api/user/ (có thể dùng để tạo user mới - sẽ làm ở Vấn đề 4)
router.post("/", async (request, response) => {
    // Hiện tại để trống, sẽ implement sau nếu cần cho việc đăng ký
    response.status(501).send("API for creating user not implemented yet.");
});

// Route GET /api/user/:userId (để lấy thông tin một user cụ thể bằng ID - từ Lab 3)
// Bạn có thể đã có route này từ Lab 3, hoặc cần implement nó.
// Nếu route GET / của bạn dùng để lấy user theo ID thì nó phải là router.get("/:userId", ...)
// Còn nếu GET /api/user/ là để lấy danh sách thì bạn có thể dùng GET /
// Hiện tại, frontend đang gọi /api/user/list, nên route "/list" ở trên là phù hợp.

// Ví dụ, nếu bạn muốn GET /api/user/ (không có /list) cũng trả về danh sách users:
// router.get("/", async (request, response) => { ... copy logic của /list vào đây ... });
// Tuy nhiên, vì frontend đang gọi /list, chúng ta sẽ giữ route /list.

// Route GET /:id để lấy thông tin chi tiết một người dùng (từ Lab 3)
// (Quan trọng cho các Link trong UserList sau này)
router.get("/:userId", async (request, response) => {
    try {
        const userId = request.params.userId;
        const user = await User.findById(userId)
            .select("_id first_name last_name login_name location description occupation");
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }
        // Trả về thông tin user (không bao gồm password)
        response.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        // Kiểm tra nếu lỗi là do ObjectId không hợp lệ
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return response.status(400).json({ message: "Invalid user ID format" });
        }
        response.status(500).json({ message: "Error fetching user from database" });
    }
});


module.exports = router;