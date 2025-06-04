// backend/db/dbLoad.js
const mongoose = require("mongoose");
require("dotenv").config();


const cs142models = require("../modelData/models.js");

const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");
const SchemaInfo = require("../db/schemaInfo.js");

const versionString = "1.0";

async function dbLoad() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Unable to connect to MongoDB Atlas!", error); // Thêm error vào log
    return; // Thoát nếu không kết nối được DB
  }

  // Xóa dữ liệu cũ
  try {
    await User.deleteMany({});
    await Photo.deleteMany({});
    await SchemaInfo.deleteMany({});
    console.log("Old data deleted successfully.");
  } catch (error) {
    console.error("Error deleting old data:", error);
    mongoose.disconnect();
    return;
  }

  // ----- Tạo Users -----
  const userObjectsFromModelData = cs142models.userListModel();
  const mapFakeIdToRealObjectId = {};

  for (const userModel of userObjectsFromModelData) {
    try {
      const userObj = await User.create({
        _id: userModel._id, // <<-- SỬ DỤNG _id TỪ DỮ LIỆU MẪU
        login_name: userModel.login_name,
        first_name: userModel.first_name,
        last_name: userModel.last_name,
        location: userModel.location,
        description: userModel.description,
        occupation: userModel.occupation,
      });
      mapFakeIdToRealObjectId[userModel._id] = userObj._id; // Lưu ObjectId thật
      // Gán ObjectId thật lại vào đối tượng user gốc từ modelData để dùng cho comments sau này
      // Điều này quan trọng nếu comment.user trong modelData là tham chiếu đến object user gốc
      const originalUserModel = cs142models.userModel(userModel._id); // Lấy lại object user gốc
      if (originalUserModel) {
        originalUserModel.db_id = userObj._id; // Gán DB ID vào một thuộc tính mới, ví dụ db_id
      }

      console.log(
          "Adding user:",
          `${userModel.first_name} ${userModel.last_name}`,
          `(login: ${userModel.login_name})`,
          "with DB ID", // Log ID thật trong DB
          userObj._id
      );
    } catch (error) {
      console.error("Error creating user:", userModel.login_name, error);
    }
  }

  // ----- Tạo Photos và Comments -----
  // Lấy toàn bộ danh sách ảnh gốc từ modelData (bao gồm cả comments đã được gán vào mỗi ảnh)
  // modelData.js của bạn đã có logic gán comments vào photos
  const photoObjectsFromModelData = cs142models.photoListModel ? cs142models.photoListModel() : [];
  // Giả sử bạn có hàm photoListModel() trả về mảng photos đầy đủ từ modelData.js
  // Nếu không, bạn cần lấy mảng `photos` trực tiếp nếu nó được export từ modelData.js.
  // Ví dụ: const photoObjectsFromModelData = cs142models.photos; (nếu photos được export)

  for (const photoModel of photoObjectsFromModelData) {
    try {
      const photoCommentsForDB = [];
      if (photoModel.comments && photoModel.comments.length > 0) {
        for (const commentModel of photoModel.comments) {
          // commentModel.user ở đây là object user gốc từ modelData
          // chúng ta cần lấy db_id (ObjectId thật) của user đó
          const commenterOriginalData = cs142models.userModel(commentModel.user._id);
          if (commenterOriginalData && commenterOriginalData.db_id) {
            photoCommentsForDB.push({
              // _id: commentModel._id, // Nếu comment cũng có _id định sẵn và bạn muốn dùng
              comment: commentModel.comment,
              date_time: commentModel.date_time,
              user: commenterOriginalData.db_id, // <<-- Dùng ObjectId thật của user đã lưu ở trên
            });
            console.log(
                "Preparing comment by user DB ID %s for photo %s",
                commenterOriginalData.db_id,
                photoModel.file_name
            );
          } else {
            console.warn(`Could not find DB ID for commenter ${commentModel.user._id} for photo ${photoModel.file_name}`);
          }
        }
      }

      const photoObj = await Photo.create({
        _id: photoModel._id, // <<-- SỬ DỤNG _id TỪ DỮ LIỆU MẪU CHO ẢNH
        file_name: photoModel.file_name,
        date_time: photoModel.date_time,
        user_id: mapFakeIdToRealObjectId[photoModel.user_id], // ObjectId thật của người đăng ảnh
        comments: photoCommentsForDB, // Mảng các comment đã chuẩn bị với user ObjectId thật
      });

      console.log(
          "Adding photo:",
          photoModel.file_name,
          "with DB ID", photoObj._id, // Log ID thật trong DB
          "of user DB ID",
          photoObj.user_id
      );
    } catch (error) {
      console.error("Error creating photo:", photoModel.file_name, error);
    }
  }

  // ----- Tạo SchemaInfo -----
  try {
    const schemaInfoObj = await SchemaInfo.create({ // Sửa tên biến để tránh trùng
      version: versionString,
    });
    console.log("SchemaInfo object created with version ", schemaInfoObj.version);
  } catch (error) {
    console.error("Error creating SchemaInfo:", error); // Sửa reportError thành error
  }

  console.log("Data loading process finished.");
  mongoose.disconnect();
}

dbLoad();