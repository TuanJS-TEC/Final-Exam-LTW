// backend/db/userModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Cau truc nguoi dung
const userSchema = new mongoose.Schema({
  login_name: { type: String, required: true, unique: true }, //vd1
  first_name: { type: String,required: true },
  last_name: { type: String,required: true },
  location: { type: String },
  description: { type: String },
  occupation: { type: String },
  password: { type: String,required: true },
  // Mongoose tự động thêm trường _id kiểu ObjectId
});

//Bam mk truoc khi luu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") && !this.isNew) {
    return next();
  }

  try{
    const saltRounds = 10; // vong lap salt cang cao cang an toan - cham
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch(error) {
    next(error);
  }
});


const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;