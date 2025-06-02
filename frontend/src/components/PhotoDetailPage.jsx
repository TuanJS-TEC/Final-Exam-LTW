// frontend/src/components/PhotoDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // 1. THÊM useCallback
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AddCommentForm from "./AddCommentForm.jsx"; // Bạn đã import đúng

function PhotoDetailPage() {
    const { photoId } = useParams();
    const [photoDetails, setPhotoDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 2. SỬ DỤNG useCallback cho fetchPhotoDetails
    const fetchPhotoDetails = useCallback(async () => {
        if (!photoId) {
            setError('Photo ID is missing.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            console.log(`Fetching details for photo ID: ${photoId}`);
            const response = await axios.get(`http://localhost:8081/api/photo/${photoId}`, {
                withCredentials: true,
            });
            setPhotoDetails(response.data);
            console.log("Fetched photo details:", response.data);
        } catch (err) {
            console.error("Failed to fetch photo details:", err);
            setError(
                err.response?.data?.message ||
                'Failed to load photo details. The photo may not exist, or an error occurred.'
            );
        } finally {
            setLoading(false);
        }
    }, [photoId]); // Phụ thuộc vào photoId

    useEffect(() => {
        fetchPhotoDetails();
    }, [fetchPhotoDetails]); // useEffect giờ phụ thuộc vào hàm fetchPhotoDetails đã được useCallback

    // 3. ĐỊNH NGHĨA HÀM CALLBACK ĐỂ CẬP NHẬT COMMENTS
    const handleCommentAdded = (updatedPhotoData) => {
        console.log("PhotoDetailPage: New comment added, updating photoDetails with:", updatedPhotoData);
        // Cập nhật state photoDetails với dữ liệu ảnh mới (đã bao gồm bình luận mới nhất và được populate)
        // Backend API POST /commentsOfPhoto/:photoId đã trả về updatedPhoto
        setPhotoDetails(updatedPhotoData);
    };

    if (loading && !photoDetails) { // Hiển thị loading chỉ khi chưa có dữ liệu ban đầu
        return <p>Loading photo details...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    if (!photoDetails) {
        // Nếu vẫn loading (ví dụ: khi refresh comment) thì không hiển thị "No photo details"
        // Trừ khi loading đã xong và vẫn không có photoDetails
        return !loading ? <p>No photo details found or photo does not exist.</p> : null;
    }

    const uploader = photoDetails.user_id;

    return (
        <div className="photo-detail-container">
            {/* Phần hiển thị tên file ảnh và thông tin người đăng */}
            <div className="photo-info">
                <h2>Photo Details</h2>
                <p><strong>File Name:</strong> {photoDetails.file_name || "N/A"}</p>
                <h3>
                    Uploaded by: {' '}
                    {uploader ? (
                        <Link to={`/users/${uploader._id}`}>
                            {uploader.first_name || ''} {uploader.last_name || ''} ({uploader.login_name})
                        </Link>
                    ) : (
                        'Unknown User'
                    )}
                </h3>
                <p>Uploaded on: {new Date(photoDetails.date_time).toLocaleDateString()} at {new Date(photoDetails.date_time).toLocaleTimeString()}</p>
            </div>

            <hr style={{ margin: '20px 0' }}/>

            {/* Phần hiển thị danh sách bình luận */}
            <div className="comments-section">
                <h3>Comments ({photoDetails.comments ? photoDetails.comments.length : 0}):</h3>
                {photoDetails.comments && photoDetails.comments.length > 0 ? (
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {photoDetails.comments.map((comment) => (
                            <li key={comment._id} style={{
                                marginBottom: '15px',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '10px'
                            }}>
                                <p style={{ margin: '0 0 5px 0' }}>
                                    <strong>
                                        {comment.user ? ( // API đã populate comment.user_id thành comment.user
                                            <Link to={`/users/${comment.user._id}`}>
                                                {comment.user.first_name || ''} {comment.user.last_name || ''} ({comment.user.login_name})
                                            </Link>
                                        ) : (
                                            'Anonymous'
                                        )}
                                    </strong>
                                    <span style={{fontSize: '0.8em', color: 'gray', marginLeft: '10px'}}>
                                     ({new Date(comment.date_time).toLocaleString()})
                                  </span>
                                </p>
                                <p style={{ margin: 0 }}>{comment.comment}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No comments yet. Be the first to comment!</p>
                )}
            </div>

            {/* 4. SỬ DỤNG AddCommentForm VÀ TRUYỀN PROPS */}
            <div style={{marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px'}}>
                <AddCommentForm photoId={photoId} onCommentAdded={handleCommentAdded} />
            </div>
        </div>
    );
}

export default PhotoDetailPage;