// frontend/src/components/PhotoUploadModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

function PhotoUploadModal({ isOpen, onClose, onPhotoUploaded }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Vui lòng chỉ chọn file ảnh (jpeg, png, gif).');
                setSelectedFile(null);
                setPreviewUrl(null);
                return;
            }
            setSelectedFile(file);
            setError('');
            setSuccessMessage('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Vui lòng chọn một file ảnh để tải lên.');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('uploadedPhoto', selectedFile);

        try {
            console.log('Uploading file:', selectedFile.name);
            const response = await axios.post('http://localhost:8081/api/photo/new', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            setSuccessMessage(`Ảnh "${response.data.file_name}" đã tải lên thành công!`);
            console.log('Upload response:', response.data);

            if (onPhotoUploaded) {
                onPhotoUploaded(response.data);
            }

            setTimeout(() => {
                // Không reset selectedFile và previewUrl ở đây nữa, handleCloseModal sẽ làm nếu cần
                handleCloseModal(true); // true để biết là đóng sau khi thành công
            }, 1500); // Giữ lại timeout để người dùng đọc thông báo

        } catch (uploadError) {
            console.error('Lỗi khi tải ảnh:', uploadError.response || uploadError);
            setError(uploadError.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCloseModal = (uploadSuccess = false) => {
        // Chỉ reset file và preview nếu không phải đóng do upload thành công
        // Hoặc luôn reset khi đóng modal, tùy theo ý bạn muốn
        // Ở đây, chúng ta sẽ luôn reset khi modal đóng, trừ khi bạn muốn giữ lại file đã chọn nếu upload lỗi.
        setSelectedFile(null);
        setPreviewUrl(null);
        setError('');
        // Giữ lại successMessage nếu vừa upload thành công để người dùng thấy trước khi modal thực sự đóng bởi App.jsx
        // Nếu không, xóa nó đi:
        if (!uploadSuccess) {
            setSuccessMessage('');
        }
        onClose(); // Gọi hàm onClose được truyền từ App.jsx để thay đổi state isUploadModalOpen
    };

    if (!isOpen) {
        return null; // Không render gì cả nếu modal không được mở
    }

    // --- Định nghĩa CSS Styles cho Modal ---
    const modalOverlayStyle = {
        position: 'fixed', // Quan trọng: Để modal nổi lên và cố định vị trí
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.65)', // Lớp nền mờ đậm hơn một chút
        display: 'flex', // Để căn giữa nội dung modal
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050, // z-index cao để nổi lên trên các phần tử khác
    };

    const modalContentStyle = {
        backgroundColor: 'white',
        padding: '30px', // Tăng padding
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        width: '90%', // Chiều rộng tương đối
        maxWidth: '550px', // Giới hạn chiều rộng tối đa
        textAlign: 'center', // Căn giữa nội dung bên trong modal
        position: 'relative', // Cho các positioning con (nếu có)
        maxHeight: '90vh', // Giới hạn chiều cao tối đa
        overflowY: 'auto' // Thêm cuộn nếu nội dung dài
    };

    const inputStyle = {
        display: 'block',
        width: 'calc(100% - 22px)', // Trừ padding của input
        padding: '10px',
        marginBottom: '20px', // Tăng khoảng cách
        margin: '10px auto',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1em'
    };

    const buttonBaseStyle = { // Style chung cho các nút
        padding: '10px 20px',
        margin: '10px 5px',
        cursor: 'pointer',
        borderRadius: '5px',
        border: 'none',
        fontSize: '1em',
        fontWeight: '500',
        minWidth: '100px' // Chiều rộng tối thiểu cho nút
    };

    const primaryButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#007bff', // Màu xanh dương cho nút chính
        color: 'white',
    };

    const secondaryButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#6c757d', // Màu xám cho nút phụ
        color: 'white',
    };

    const imagePreviewStyle = {
        maxWidth: '100%',
        maxHeight: '250px', // Tăng chiều cao xem trước
        marginTop: '10px',
        marginBottom: '20px', // Tăng khoảng cách
        border: '1px solid #ddd',
        borderRadius: '4px'
    };
    // --- Kết thúc CSS Styles ---

    return (
        <div style={modalOverlayStyle} onClick={() => handleCloseModal()}> {/* Nhấn ra ngoài overlay để đóng */}
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}> {/* Ngăn click lan ra overlay */}
                <h2 style={{marginBottom: '25px'}}>Tải Ảnh Mới</h2>
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    style={inputStyle}
                    disabled={isUploading}
                />
                {previewUrl && selectedFile && (
                    <div style={{ margin: '15px 0' }}>
                        <p style={{margin: '0 0 8px 0', fontWeight: '500'}}>Xem trước:</p>
                        <img src={previewUrl} alt="Ảnh xem trước" style={imagePreviewStyle} />
                    </div>
                )}
                {error && <p style={{ color: 'red', marginTop: '10px', fontWeight: '500' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green', marginTop: '10px', fontWeight: '500' }}>{successMessage}</p>}
                <div style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !selectedFile}
                        style={primaryButtonStyle}
                    >
                        {isUploading ? 'Đang tải lên...' : 'Tải lên'}
                    </button>
                    <button
                        onClick={() => handleCloseModal()}
                        disabled={isUploading}
                        style={secondaryButtonStyle}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PhotoUploadModal;