// frontend/src/context/UserContext.js
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios'; // Đảm bảo bạn đã chạy `npm install axios` trong thư mục frontend

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); // Ban đầu chưa có ai đăng nhập
    const [loading, setLoading] = useState(false);       // Để quản lý trạng thái loading khi gọi API
    const [error, setError] = useState('');               // Để hiển thị lỗi

    // Hàm xử lý đăng nhập
    const loginUser = async (loginName) => {
        setLoading(true);
        setError(''); // Xóa lỗi cũ trước khi thử đăng nhập mới
        try {
            // API URL của back-end server. Mặc định backend của bạn chạy trên port 8081.
            const response = await axios.post('http://localhost:8081/admin/login', {
                login_name: loginName
            },{
                withCredentials: true,
            });

            if (response.data) {
                setCurrentUser(response.data); // Lưu thông tin user vào state
                                               // response.data nên là { _id, login_name, first_name, ... }
                console.log('Login successful:', response.data);
                return true; // Trả về true nếu đăng nhập thành công
            } else {
                // Trường hợp response thành công nhưng không có data (ít khả năng xảy ra với API login đúng)
                setError('Login failed: No user data received.');
                setCurrentUser(null);
                return false;
            }
        } catch (err) {
            // Lấy thông báo lỗi từ server nếu có, nếu không thì dùng thông báo mặc định
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Login failed. Please check your credentials or server status.';
            setError(errorMessage);
            console.error('Login error details:', err.response ? err.response : err);
            setCurrentUser(null);
            return false; // Trả về false nếu đăng nhập thất bại
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý đăng xuất
    const logoutUser = async () => {
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:8081/admin/logout',{},{
                withCredentials: true,
            });
            setCurrentUser(null); // Xóa thông tin user khỏi state
            console.log('Logout successful');
            // Không cần trả về gì đặc biệt, hoặc có thể trả về true
            return true;
        } catch (err) {
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Logout failed. Please try again.';
            setError(errorMessage);
            console.error('Logout error details:', err.response ? err.response : err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Cung cấp các giá trị và hàm này cho các component con
    const contextValue = {
        currentUser,
        loading,
        error,
        loginUser,
        logoutUser,
        setError,       // Cung cấp hàm setError để có thể xóa lỗi từ component khác
        setCurrentUser  // Có thể hữu ích cho việc cập nhật user từ nguồn khác (ví dụ: check session khi tải app)
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

// Hook tùy chỉnh để dễ dàng sử dụng context này trong các component khác
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider. Make sure your component is a child of UserProvider in the component tree.');
    }
    return context;
};