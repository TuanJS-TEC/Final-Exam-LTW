// frontend/src/App.jsx
import React, { useState, useEffect } from 'react'; // Đảm bảo useEffect được import
import axios from 'axios'; // Đảm bảo axios được import
import './App.css';
import { UserProvider } from "./context/UserContext.jsx";
import { useUser } from "./hooks/useUser.jsx";
import LoginRegister from "./components/LoginRegister.jsx";
import TopBar from './components/TopBar.jsx';
import UserList from './components/UserList.jsx';
import PhotoDetailPage from './components/PhotoDetailPage.jsx';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';

// --- Helper Components ---

function MainLayout() {
    const { currentUser } = useUser();
    // console.log('MainLayout - currentUser:', currentUser);
    return (
        <>
            <TopBar />
            <div style={{
                display: 'flex',
                minHeight: 'calc(100vh - 70px)' // Giả sử TopBar cao khoảng 70px
            }}>
                {currentUser && (
                    <aside style={{
                        width: '230px',
                        minWidth: '200px',
                        padding: '15px',
                        backgroundColor: '#e9ecef',
                        borderRight: '1px solid #ced4da',
                        overflowY: 'auto'
                    }}>
                        <UserList />
                    </aside>
                )}
                <main style={{
                    flexGrow: 1,
                    padding: '20px',
                    overflowY: 'auto'
                }}>
                    <Outlet />
                </main>
            </div>
        </>
    );
}

function ProtectedRoute() {
    const { currentUser, loading: userContextLoading } = useUser(); // Đổi tên biến loading để tránh trùng

    console.log('ProtectedRoute - currentUser:', currentUser, '; Context loading:', userContextLoading, '; Will redirect to login?', !currentUser && !userContextLoading);

    // Ví dụ về xử lý trạng thái loading từ context (nếu UserContext có logic này)
    // if (userContextLoading) {
    //     return <div>Checking session...</div>;
    // }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    return <MainLayout />;
}

function HomePage() {
    const { currentUser } = useUser();

    const [photos, setPhotos] = useState([]);
    const [photoListLoading, setPhotoListLoading] = useState(true);
    const [photoListError, setPhotoListError] = useState('');

    useEffect(() => {
        // Chỉ fetch ảnh nếu đã có currentUser (đã đăng nhập)
        if (currentUser) {
            const fetchPhotoList = async () => {
                setPhotoListLoading(true);
                setPhotoListError('');
                try {
                    console.log("HomePage: Fetching photo list...");
                    const response = await axios.get('http://localhost:8081/api/photo/', {
                        withCredentials: true,
                    });
                    setPhotos(response.data);
                    console.log("HomePage: Photo list fetched successfully:", response.data.length, "photos");
                } catch (err) {
                    console.error("HomePage: Failed to fetch photo list:", err);
                    setPhotoListError(
                        err.response?.data?.message ||
                        'Failed to load photos. You may not be authorized or the server is down.'
                    );
                } finally {
                    setPhotoListLoading(false);
                }
            };
            fetchPhotoList();
        } else {
            // Nếu không có currentUser (ví dụ, đang logout hoặc chưa login xong)
            // thì không fetch và đảm bảo photoListLoading là false.
            setPhotos([]); // Xóa danh sách ảnh cũ nếu có
            setPhotoListLoading(false);
        }
    }, [currentUser]); // Phụ thuộc vào currentUser để fetch lại khi user thay đổi (login/logout)

    // ProtectedRoute đã kiểm tra currentUser, nhưng kiểm tra lại ở đây không thừa
    if (!currentUser) {
        return <div>Loading user information or you are being redirected...</div>;
    }

    let photoContent;
    if (photoListLoading) {
        photoContent = <p>Loading photos...</p>;
    } else if (photoListError) {
        photoContent = <p style={{ color: 'red' }}>Error: {photoListError}</p>;
    } else if (photos.length === 0) {
        photoContent = <p>No photos available yet. Be the first to upload!</p>;
    } else {
        photoContent = (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {photos.map(photo => (
                    <li key={photo._id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
                        <Link to={`/photos/${photo._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <p style={{margin: '0 0 5px 0', fontWeight: 'bold'}}>Filename: {photo.file_name}</p>
                            <p style={{margin: '0 0 5px 0', fontSize: '0.9em'}}>
                                Uploaded by: {photo.user_id ?
                                `${photo.user_id.first_name || ''} ${photo.user_id.last_name || ''} (${photo.user_id.login_name})`
                                : 'Unknown User'}
                            </p>
                            <p style={{margin: 0, fontSize: '0.8em', color: 'gray'}}>
                                Date: {new Date(photo.date_time).toLocaleDateString()}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <>
            <h1>Photo Sharing App (Frontend) - Home</h1>
            <hr />
            <div>
                <h2>Welcome, {currentUser.first_name || currentUser.login_name || 'User'} {currentUser.last_name || ''}!</h2>
                <p>(Your Login Name: {currentUser.login_name})</p>
            </div>

            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <h3>All Photos:</h3>
                {photoContent}
            </div>
        </>
    );
}

function LoginPage() {
    const { currentUser } = useUser();
    // console.log('LoginPage - currentUser:', currentUser, '; Will redirect to home?', !!currentUser);

    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <TopBar />
            <div style={{ padding: '20px' }}>
                <LoginRegister />
            </div>
        </>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/photos/:photoId" element={<PhotoDetailPage />} />
                {/* <Route path="/users/:userId" element={<UserDetailsComponent />} /> */}
            </Route>
            <Route path="*" element={
                <MainLayout>
                    <div>
                        <h2>404 - Page Not Found</h2>
                        <p>Sorry, the page you are looking for does not exist.</p>
                        <Link to="/">Go to Homepage</Link>
                    </div>
                </MainLayout>
            } />
        </Routes>
    );
}

function App() {
    return (
        <UserProvider>
            <AppRoutes />
        </UserProvider>
    );
}

export default App;