// frontend/src/components/UserDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function UserDetailPage() {
    const { userId } = useParams();

    const [userDetails, setUserDetails] = useState(null);
    const [userPhotos, setUserPhotos] = useState([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingPhotos, setLoadingPhotos] = useState(true);
    const [error, setError] = useState('');

    const fetchUserDetails = useCallback(async () => {
        if (!userId) {
            setError('User ID is missing.'); // Set lỗi vào state chung
            setLoadingUser(false);
            return;
        }
        setLoadingUser(true);
        // Không reset error ở đây ngay, để nếu fetchUserPhotos lỗi trước đó thì vẫn còn
        // setError('');
        try {
            console.log(`[UserDetailPage] Fetching details for user ID: ${userId}`);
            const response = await axios.get(`http://localhost:8081/api/user/${userId}`, {
                withCredentials: true,
            });
            setUserDetails(response.data);
            console.log("[UserDetailPage] Fetched user details:", response.data);
            setError(''); // Xóa lỗi nếu fetch user details thành công
        } catch (err) {
            console.error("[UserDetailPage] Failed to fetch user details:", err);
            setError(err.response?.data?.message || 'Failed to load user details.');
        } finally {
            setLoadingUser(false);
        }
    }, [userId]);

    const fetchUserPhotos = useCallback(async () => {
        if (!userId) {
            // Không cần set lỗi ở đây nữa vì fetchUserDetails đã làm nếu userId thiếu
            setLoadingPhotos(false);
            return;
        }
        setLoadingPhotos(true);
        // Không reset error ở đây ngay để giữ lại lỗi từ fetchUserDetails nếu có
        try {
            console.log(`[UserDetailPage] Fetching photos for user ID: ${userId}`);
            const response = await axios.get(`http://localhost:8081/api/photo/photosOfUser/${userId}`, {
                withCredentials: true,
            });
            setUserPhotos(response.data);
            console.log("[UserDetailPage] Fetched user photos:", response.data);
            // Nếu fetch user details trước đó lỗi, nhưng fetch photos thành công, có thể xóa lỗi
            // Tuy nhiên, nếu cả hai đều quan trọng, chỉ xóa lỗi khi cả hai thành công.
            // Hiện tại, nếu fetchUserDetails lỗi, error sẽ được giữ lại.
        } catch (err) {
            console.error("[UserDetailPage] Failed to fetch user photos:", err);
            // Gộp lỗi hoặc ghi đè lỗi hiện tại
            setError(prevError =>
                prevError && prevError !== 'Failed to load user details.' // Nếu lỗi trước đó là của userDetails
                    ? `${prevError}\nFailed to load photos.`
                    : (err.response?.data?.message || 'Failed to load photos.')
            );
        } finally {
            setLoadingPhotos(false);
        }
    }, [userId]);

    useEffect(() => {

        setUserDetails(null);
        setUserPhotos([]);
        setError('');
        setLoadingUser(true);
        setLoadingPhotos(true);

        fetchUserDetails();
        fetchUserPhotos();
    }, [fetchUserDetails, fetchUserPhotos]);


    if (loadingUser || loadingPhotos) {
        return <p>Loading user profile and photos...</p>;
    }


    if (error && !userDetails) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }


    if (!userDetails) {

        return <p>{error || "User not found or failed to load details."}</p>;
    }

    return (
        <div className="user-detail-container" style={{padding: '20px'}}>
            <div style={{marginBottom: '20px'}}>
                <Link to="/">
                    <button type="button" style={{padding: '8px 15px', cursor: 'pointer'}}>
                        &larr; Quay về Trang Chủ
                    </button>
                </Link>
            </div>
            <div className="user-profile-info"
                 style={{marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee'}}>
                <h2>
                    {userDetails.first_name || userDetails.login_name || "User"} {userDetails.last_name || ''}
                    <span style={{fontSize: '0.8em', color: 'gray', marginLeft: '10px'}}>
                        (@{userDetails.login_name})
                    </span>
                </h2>
                {userDetails.location && <p><strong>Địa điểm:</strong> {userDetails.location}</p>}
                {userDetails.occupation && <p><strong>Nghề nghiệp:</strong> {userDetails.occupation}</p>}
                {userDetails.description && <p><strong>Mô tả:</strong> {userDetails.description}</p>}
            </div>

            <div className="user-photos-section">
                <h3>Ảnh của {userDetails.first_name || userDetails.login_name} ({userPhotos.length}):</h3>
                {/* Nếu có lỗi chung và không có ảnh, thì có thể lỗi đó liên quan đến việc load ảnh */}
                {error && userPhotos.length === 0 && <p style={{color: 'red'}}>Lưu ý: {error}</p>}

                {userPhotos.length > 0 ? (
                    <ul style={{listStyleType: 'none', paddingLeft: 0, display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
                        {userPhotos.map((photo) => (
                            <li key={photo._id} style={{
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '10px',
                                width: 'calc(33.333% - 12px)',
                                boxSizing: 'border-box',
                                marginBottom: '15px'
                            }}>
                                <Link to={`/photos/${photo._id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                                    <p style={{
                                        margin: '0 0 8px 0',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        minHeight: '1.2em'
                                    }}>
                                        {photo.file_name}
                                    </p>
                                    {/* Phần hiển thị ảnh thumbnail (bạn đang không dùng) */}
                                    {/* <div style={{height: '150px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px'}}>
                                        <span style={{color: '#aaa'}}>Ảnh xem trước (nếu có)</span>
                                    </div> */}
                                    <p style={{margin: 0, fontSize: '0.8em', color: 'gray'}}>
                                        Ngày đăng: {new Date(photo.date_time).toLocaleDateString()}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (

                    !error && <p>Người dùng này chưa đăng tải ảnh nào.</p>
                )}
            </div>
        </div>
    );
}

export default UserDetailPage;