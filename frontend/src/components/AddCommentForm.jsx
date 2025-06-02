// frontend/src/components/AddCommentForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../hooks/useUser.jsx'; // Để kiểm tra người dùng có đăng nhập không

function AddCommentForm({ photoId, onCommentAdded }) {
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useUser(); // Lấy thông tin người dùng hiện tại

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!commentText.trim()) {
            setError('Comment cannot be empty.');
            return;
        }
        if (!currentUser) {
            setError('You must be logged in to comment.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await axios.post(
                `http://localhost:8081/api/photo/commentsOfPhoto/${photoId}`,
                { comment: commentText.trim() }, // Request body
                { withCredentials: true }
            );

            console.log('Comment added successfully:', response.data);
            setCommentText(''); // Xóa nội dung ô input sau khi gửi thành công
            if (onCommentAdded) {
                onCommentAdded(response.data); // Gọi callback để cập nhật danh sách bình luận ở PhotoDetailPage
                                               // response.data ở đây là updatedPhoto từ backend
            }
        } catch (err) {
            console.error('Failed to add comment:', err);
            setError(err.response?.data?.message || 'Failed to submit comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Chỉ hiển thị form nếu người dùng đã đăng nhập
    if (!currentUser) {
        return <p>Please log in to add a comment.</p>;
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <h4>Add your comment:</h4>
            <div>
        <textarea
            value={commentText}
            onChange={(e) => {
                setCommentText(e.target.value);
                if (error) setError(''); // Xóa lỗi khi người dùng bắt đầu nhập lại
            }}
            placeholder="Write your comment here..."
            rows="4"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
            disabled={isSubmitting}
        />
            </div>
            {error && <p style={{ color: 'red', marginTop: '0', marginBottom: '10px' }}>{error}</p>}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </button>
        </form>
    );
}

export default AddCommentForm;