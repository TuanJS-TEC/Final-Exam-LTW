// routes/AdminRouter.js
const express = require('express');
const router = express.Router();
const User = require('../db/userModel');
const bcrypt = require('bcryptjs');

// POST /admin/login - xu ly logic dang nhap - tao session
router.post('/login', async (req, res) => {

    const { login_name, password } = req.body;


    if (!login_name || !password) {
        console.log('Login failed: login_name or password not provided.');
        return res.status(400).json({ message: 'Tên đăng nhập và mật khẩu là bắt buộc.' });
    }

    try {

        const user = await User.findOne({ login_name: login_name });


        if (!user) {
            console.log(`Login attempt failed: User with login_name "${login_name}" not found`);
            // Trả về thông báo chung chung để tăng bảo mật
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }

        // 4. So sánh mật khẩu người dùng gửi lên với mật khẩu đã băm trong DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`Login attempt failed: Incorrect password for user "${login_name}"`);

            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }


        req.session.user = { // Tao doi tuong session cho user
            _id: user._id,
            login_name: user.login_name,
            first_name: user.first_name,
            last_name: user.last_name,
        };

        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ message: 'Lỗi server khi lưu session.' });
            }
            console.log(`User ${user.login_name} is logged in. Session created.`);

            res.status(200).json({
                _id: user._id,
                login_name: user.login_name,
                first_name: user.first_name,
                last_name: user.last_name,
            });
        });

    } catch (err) {
        console.error('Error during login process: ', err);
        res.status(500).json({ message: 'Lỗi server trong quá trình đăng nhập.' });
    }
});

// POST /admin/logout - huy session - xoa cookie
router.post('/logout', (req, res) => {
    if (req.session && req.session.user) {
        const loggedInUser = req.session.user.login_name;
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Logout failed due to server error.' });
            }
            res.clearCookie('connect.sid'); // yeu cau trinh duyet xoa cookie
            console.log(`User ${loggedInUser} logged out successfully. Session destroyed.`);
            return res.status(200).json({ message: 'Đăng xuất thành công.' });
        });
    } else {
        console.log('Logout attempt failed: No active session found.');
        return res.status(400).json({ message: 'Bạn hiện chưa đăng nhập.' });
    }
});

module.exports = router;