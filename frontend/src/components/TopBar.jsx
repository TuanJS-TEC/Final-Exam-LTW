// frontend/src/components/TopBar.jsx
import React from 'react';
import { useUser } from '../hooks/useUser.jsx';
import { Link } from 'react-router-dom'; // Import Link để có thể dùng cho logo

function TopBar({ onAddPhotoClick }) {
    const { currentUser, logoutUser, loading: userContextLoading } = useUser(); // Đổi tên loading để rõ ràng hơn

    const handleLogout = async () => {
        await logoutUser();
    };

    const handleInternalAddPhotoClick = () => {
        if (onAddPhotoClick) {
            onAddPhotoClick();
        } else {
            console.warn("TopBar: onAddPhotoClick prop was not provided. Modal won't open.");
        }
    };

    // --- Định nghĩa các style cho dễ quản lý ---
    const topBarStyle = {
        backgroundColor: '#2E7D32', // Một màu xanh lá cây đậm hơn (bạn có thể đổi lại #16610E nếu thích)
        color: 'white',
        padding: '15px 30px',       // <<-- TĂNG PADDING CHO TOPBAR CAO HƠN
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1B5E20' // Viền dưới đậm hơn
    };

    const appTitleStyle = {
        fontSize: '1.8em',          // <<-- TĂNG CỠ CHỮ TIÊU ĐỀ
        fontWeight: 'bold',
        textDecoration: 'none',     // Bỏ gạch chân nếu dùng Link
        color: 'white'              // Đảm bảo màu chữ cho Link
    };

    const userInfoStyle = {
        fontSize: '1em',            // Cỡ chữ cho thông tin người dùng
        display: 'flex',            // Sắp xếp các item con theo hàng ngang
        alignItems: 'center'        // Căn giữa theo chiều dọc
    };

    const buttonBaseStyle = {
        padding: '8px 15px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '10px',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
    };

    const addPhotoButtonstyle = {
        ...buttonBaseStyle,
        backgroundColor: '#4CAF50', // Màu xanh lá cho nút Add Photo
    };

    const logoutButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#f44336', // Màu đỏ cho nút Logout
    };
    // --- Kết thúc định nghĩa style ---


    return (
        <div className="top-bar" style={topBarStyle}>
            <div className="app-title">
                {/* Nếu currentUser tồn tại, PhotoShare là Link về trang chủ, ngược lại là text thường */}
                {currentUser ? (
                    <Link to="/" style={appTitleStyle}>PhotoShare</Link>
                ) : (
                    <span style={appTitleStyle}>PhotoShare</span>
                )}
            </div>
            <div className="user-info" style={userInfoStyle}>
                {currentUser ? (
                    <>
                        <span>Hi, {currentUser.first_name || currentUser.login_name || 'User'}!</span>

                        <button
                            onClick={handleInternalAddPhotoClick}
                            style={addPhotoButtonstyle}
                            // disabled={userContextLoading} // Cân nhắc có nên disable khi đang login/logout không
                        >
                            Add Photo
                        </button>

                        <button
                            onClick={handleLogout}
                            disabled={userContextLoading} // Disable khi đang xử lý logout
                            style={logoutButtonStyle}
                        >
                            {userContextLoading ? 'Logging out...' : 'Logout'}
                        </button>
                    </>
                ) : (
                    <span>Please Login</span>
                )}
            </div>
        </div>
    );
}

export default TopBar;