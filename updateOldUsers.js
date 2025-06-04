// updateOldUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./db/userModel');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB.");

        const usersToUpdate = await User.find({ password: { $exists: false } }); // Tìm user chưa có trường password

        if (usersToUpdate.length === 0) {
            console.log("No users found without a password field.");
            mongoose.disconnect();
            return;
        }

        console.log(`Found ${usersToUpdate.length} users to update.`);
        const defaultPassword = "defaultPassword123";

        for (const user of usersToUpdate) {
            user.password = defaultPassword;
            await user.save();
            console.log(`Updated password for user: ${user.login_name}`);
        }

        console.log("Finished updating passwords for old users.");
    } catch (error) {
        console.error("Error updating passwords:", error);
    } finally {
        mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

updatePasswords();