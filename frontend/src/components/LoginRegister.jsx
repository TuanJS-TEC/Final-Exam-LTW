// frontend/src/components/LoginRegister.jsx
import React, { useState } from 'react';
import { useUser } from '../context/UserContext'; // Import useUser hook

function LoginRegister() {
    const [loginNameInput, setLoginNameInput] = useState('');
    const { loginUser, loading, error, setError } = useUser(); // Lấy hàm loginUser và các state từ context

    const handleLogin = async (event) => {
        event.preventDefault(); // Ngăn form submit theo cách truyền thống
        if (!loginNameInput.trim()) {
            setError('Please enter a login name.'); // Sử dụng setError từ context để set lỗi
            return;
        }
        const success = await loginUser(loginNameInput);
        if (success) {
            // Nếu đăng nhập thành công, App.jsx sẽ xử lý việc chuyển view
            // Ở đây không cần làm gì thêm, vì currentUser trong context đã được cập nhật
            console.log('LoginRegister: Login successful, currentUser should be updated.');
            setLoginNameInput(''); // Xóa input sau khi đăng nhập (tùy chọn)
        } else {
            // Lỗi đã được set trong hàm loginUser của context
            // và sẽ được hiển thị ở dưới
            console.log('LoginRegister: Login failed.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="loginName">Login Name:</label>
                    <input
                        type="text"
                        id="loginName"
                        value={loginNameInput}
                        onChange={(e) => {
                            setLoginNameInput(e.target.value);
                            if (error) setError(''); // Xóa lỗi khi người dùng bắt đầu nhập lại
                        }}
                        disabled={loading} // Vô hiệu hóa input khi đang loading
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {/* Hiển thị lỗi từ context */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default LoginRegister;