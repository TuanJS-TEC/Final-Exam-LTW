// frontend/src/components/TopBar.jsx
import React from 'react';
import { useUser } from '../context/UserContext'; // Import useUser hook

function TopBar() {
    const { currentUser, logoutUser, loading } = useUser(); // Lấy currentUser và hàm logoutUser từ context

    const handleLogout = async () => {
        await logoutUser();
        // Sau khi logoutUser() chạy, currentUser trong context sẽ là null,
        // AppContent sẽ tự động re-render và hiển thị LoginRegister.
        // TopBar cũng sẽ re-render và hiển thị "Please Login".
    };

    return (
        <div className="top-bar" style={{
            backgroundColor: '#f0f0f0',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #ccc'
        }}>
            <div className="app-title" style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                PhotoShare
            </div>
            <div className="user-info">
                {currentUser ? (
                    <>
                        <span>Hi, {currentUser.first_name}!</span>
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            style={{ marginLeft: '10px' }}
                        >
                            {loading ? 'Logging out...' : 'Logout'}
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