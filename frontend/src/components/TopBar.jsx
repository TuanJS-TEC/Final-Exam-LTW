// frontend/src/components/TopBar.jsx
import React from 'react';
import { useUser } from '../hooks/useUser.jsx'; // Đảm bảo đường dẫn đúng
// import { Link } from 'react-router-dom'; // Có thể cần Link nếu nút Add Photo điều hướng đến trang khác

function TopBar() {
    const { currentUser, logoutUser, loading } = useUser();

    const handleLogout = async () => {
        await logoutUser();
    };

    const handleAddPhotoClick = () => {
        // Bước đầu, chỉ log ra console. Sau này sẽ mở form upload.
        console.log('Add Photo button clicked!');
        // Ví dụ: setIsUploadModalOpen(true); // Nếu bạn dùng modal
    };

    return (
        <div className="top-bar" style={{
            backgroundColor: '#16610E',
            color: 'white',
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
                        <span>Hi, {currentUser.first_name || currentUser.login_name}!</span>

                        {/* NÚT "ADD PHOTO" MỚI */}
                        <button
                            onClick={handleAddPhotoClick}
                            style={{ marginLeft: '10px', marginRight: '10px' }}
                            disabled={loading} // Có thể không cần disable nút này khi đang logout
                        >
                            Add Photo
                        </button>
                        {/* KẾT THÚC NÚT "ADD PHOTO" */}

                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            // style={{ marginLeft: '10px' }} // Đã có marginRight ở nút Add Photo
                        >
                            {loading && AddCommentForm.isSubmitting /* Sửa lại điều kiện này nếu cần */ ? 'Processing...' : 'Logout'}
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