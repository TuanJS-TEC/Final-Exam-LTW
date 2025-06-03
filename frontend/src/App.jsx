// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { UserProvider } from "./context/UserContext.jsx";
import { useUser } from "./hooks/useUser.jsx";
import LoginRegister from "./components/LoginRegister.jsx";
import TopBar from './components/TopBar.jsx';
import UserList from './components/UserList.jsx';
import PhotoDetailPage from './components/PhotoDetailPage.jsx';
import PhotoUploadModal from './components/PhotoUploadModal.jsx'; // Đã import
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';

// --- Helper Components ---

// MainLayout nhận onAddPhotoClick để truyền cho TopBar
function MainLayout({ onAddPhotoClick }) {
    const { currentUser } = useUser();
    return (
        <>
            <TopBar onAddPhotoClick={onAddPhotoClick} />
            <div style={{
                display: 'flex',
                minHeight: 'calc(100vh - 70px)'
            }}>
                {currentUser && (
                    <aside style={{
                        width: '230px', minWidth: '200px', padding: '15px',
                        backgroundColor: '#A4CCD9', borderRight: '1px solid #ced4da',
                        overflowY: 'auto'
                    }}>
                        <UserList />
                    </aside>
                )}
                <main style={{
                    flexGrow: 1, padding: '20px', overflowY: 'auto'
                }}>
                    <Outlet />
                </main>
            </div>
        </>
    );
}

// ProtectedRoute nhận onAddPhotoClick để truyền cho MainLayout
function ProtectedRoute({ onAddPhotoClick }) {
    const { currentUser, loading: userContextLoading } = useUser();
    console.log('ProtectedRoute - currentUser:', currentUser, '; Context loading:', userContextLoading, '; Will redirect to login?', !currentUser && !userContextLoading);

    if (!currentUser && !userContextLoading) { // Chỉ redirect nếu không có user VÀ context không còn loading
        return <Navigate to="/login" replace />;
    }
    // Nếu đang loading user ban đầu, có thể hiển thị gì đó hoặc chờ
    if (userContextLoading && !currentUser) { // Ví dụ: Context đang kiểm tra session
        return <div>Checking session...</div>;
    }
    if (!currentUser) { // Fallback nếu loading xong mà vẫn không có user
        return <Navigate to="/login" replace />;
    }

    return <MainLayout onAddPhotoClick={onAddPhotoClick} />;
}

// HomePage nhận thêm photoListVersion để trigger useEffect
function HomePage({ photoListVersion }) { // <<-- NHẬN PROP MỚI
    const { currentUser } = useUser();
    const [photos, setPhotos] = useState([]);
    const [photoListLoading, setPhotoListLoading] = useState(true);
    const [photoListError, setPhotoListError] = useState('');

    useEffect(() => {
        if (currentUser) {
            const fetchPhotoList = async () => {
                setPhotoListLoading(true);
                setPhotoListError('');
                try {
                    // Thêm photoListVersion vào log để theo dõi
                    console.log(`HomePage: Fetching photo list (version: ${photoListVersion})...`);
                    const response = await axios.get('http://localhost:8081/api/photo/', { withCredentials: true });
                    setPhotos(response.data);
                    console.log("HomePage: Photo list fetched successfully:", response.data.length, "photos");
                } catch (err) {
                    console.error("HomePage: Failed to fetch photo list:", err);
                    setPhotoListError(err.response?.data?.message || 'Failed to load photos.');
                } finally {
                    setPhotoListLoading(false);
                }
            };
            fetchPhotoList();
        } else {
            setPhotos([]);
            setPhotoListLoading(false);
        }
    }, [currentUser, photoListVersion]); // <<-- THÊM photoListVersion VÀO DEPENDENCY ARRAY

    if (!currentUser) return <div>Loading user information or you are being redirected...</div>;

    let photoContent;
    if (photoListLoading) photoContent = <p>Loading photos...</p>;
    else if (photoListError) photoContent = <p style={{ color: 'red' }}>Error: {photoListError}</p>;
    else if (photos.length === 0) photoContent = <p>No photos available yet. Be the first to upload!</p>;
    else photoContent = ( <ul style={{ listStyleType: 'none', padding: 0 }}> {photos.map(photo => ( <li key={photo._id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}> <Link to={`/photos/${photo._id}`} style={{ textDecoration: 'none', color: 'inherit' }}> <p style={{margin: '0 0 5px 0', fontWeight: 'bold'}}>Filename: {photo.file_name}</p> <p style={{margin: '0 0 5px 0', fontSize: '0.9em'}}> Uploaded by: {photo.user_id ? `${photo.user_id.first_name || ''} ${photo.user_id.last_name || ''} (${photo.user_id.login_name})` : 'Unknown User'} </p> <p style={{margin: 0, fontSize: '0.8em', color: 'gray'}}> Date: {new Date(photo.date_time).toLocaleDateString()} </p> </Link> </li> ))} </ul> );

    return ( <> <h1>Photo Sharing App (Frontend) - Home</h1> <hr /> <div> <h2>Welcome, {currentUser.first_name || currentUser.login_name || 'User'} {currentUser.last_name || ''}!</h2> <p>(Your Login Name: {currentUser.login_name})</p> </div> <div style={{ marginTop: '20px', marginBottom: '20px' }}> <h3>All Photos:</h3> {photoContent} </div> </> );
}

// LoginPage nhận onAddPhotoClick để truyền cho TopBar
function LoginPage({ onAddPhotoClick }) {
    const { currentUser } = useUser();
    // console.log('LoginPage - currentUser:', currentUser, '; Will redirect to home?', !!currentUser);

    if (currentUser) {
        return <Navigate to="/" replace />;
    }
    return (
        <>
            <TopBar onAddPhotoClick={onAddPhotoClick} />
            <div style={{ padding: '20px' }}> <LoginRegister /> </div>
        </>
    );
}

// AppRoutes quản lý state và truyền hàm cho các route element
function AppRoutes() {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [photoListVersion, setPhotoListVersion] = useState(0); // <<-- STATE MỚI

    const openUploadModal = () => setIsUploadModalOpen(true);
    const closeUploadModal = () => setIsUploadModalOpen(false);

    // HÀM CALLBACK KHI ẢNH ĐƯỢC UPLOAD THÀNH CÔNG
    const handlePhotoUploaded = (newPhotoData) => {
        console.log("AppRoutes: A new photo was uploaded, triggering photo list refresh:", newPhotoData);
        setPhotoListVersion(prevVersion => prevVersion + 1); // Cập nhật version để HomePage fetch lại
        closeUploadModal(); // Đóng modal
    };

    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage onAddPhotoClick={openUploadModal} />} />
                <Route element={<ProtectedRoute onAddPhotoClick={openUploadModal} />}>
                    {/* TRUYỀN photoListVersion XUỐNG HomePage */}
                    <Route path="/" element={<HomePage photoListVersion={photoListVersion} />} />
                    <Route path="/photos/:photoId" element={<PhotoDetailPage />} />
                </Route>
                <Route path="*" element={
                    <MainLayout onAddPhotoClick={openUploadModal}>
                        <div>
                            <h2>404 - Page Not Found</h2>
                            <p>Sorry, the page you are looking for does not exist.</p>
                            <Link to="/">Go to Homepage</Link>
                        </div>
                    </MainLayout>
                } />
            </Routes>

            {/* TRUYỀN onPhotoUploaded XUỐNG MODAL */}
            {isUploadModalOpen &&
                <PhotoUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={closeUploadModal}
                    onPhotoUploaded={handlePhotoUploaded} // <<-- TRUYỀN PROP MỚI
                />}
        </>
    );
}

function App() {
    return ( <UserProvider> <AppRoutes /> </UserProvider> );
}
export default App;