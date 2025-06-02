// frontend/src/components/UserList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Để tạo link đến trang chi tiết người dùng sau này

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError('');
            try {
                // API URL của backend. /api/user/list là một API bạn cần có từ Lab 3
                // hoặc cần tạo mới nếu chưa có, và nó trả về một mảng các user objects.
                // Mỗi user object nên có _id, first_name, last_name.
                const response = await axios.get('http://localhost:8081/api/user/list', {
                    withCredentials: true, // Quan trọng: để gửi cookie session
                });
                setUsers(response.data);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError(
                    err.response?.data?.message || // Lỗi từ server nếu có (ví dụ 401 Unauthorized)
                    'Failed to load user list. You may not be authorized or the server is down.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []); // Mảng rỗng nghĩa là useEffect này chỉ chạy một lần khi component mount

    if (loading) {
        return <p>Loading user list...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    if (users.length === 0) {
        return <p>No users found.</p>;
    }

    return (
        <div>
            <h4>User List</h4>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {users.map(user => (
                    <li key={user._id} style={{ marginBottom: '8px' }}>
                        {/* Sau này, bạn sẽ tạo route và component cho UserDetails
                Ví dụ: <Link to={`/users/${user._id}`}> */}
                        <Link to={`/users/${user._id}`}>
                            {user.first_name} {user.last_name} ({user.login_name})
                        </Link>
                        {/* </Link> */}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;