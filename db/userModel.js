// backend/db/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  login_name: { type: String, required: true, unique: true },
  first_name: { type: String },
  last_name: { type: String },
  location: { type: String },
  description: { type: String },
  occupation: { type: String },
  // Mongoose tự động thêm trường _id kiểu ObjectId
});

// Đăng ký model với tên là "User" (số ít, viết hoa chữ đầu)
// và sử dụng mongoose.models để tránh lỗi OverwriteModelError trong môi trường dev với HMR
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;