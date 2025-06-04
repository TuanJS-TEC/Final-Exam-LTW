// frontend/src/components/LoginRegister.jsx
import React, { useState } from 'react';
import { useUser } from "../hooks/useUser.jsx";
import axios from 'axios';

// --- CSS Styles (Inline) ---
const containerStyle = {
    maxWidth: '450px',
    margin: '50px auto',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    borderRadius: '10px',
    backgroundColor: '#075B5E',
};

const formGroupStyle = {
    marginBottom: '18px',
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px', // Tăng một chút khoảng cách cho dễ thở hơn
    fontWeight: '600',
    color: '#FFE6E1', // <<-- SỬA MÀU CHỮ LABEL ĐẬM HƠN (Xám đậm)
    fontSize: '14px',
};

const inputStyle = {
    width: '100%',
    padding: '12px', // Tăng padding cho input cao hơn
    border: '1px solid #cccccc', // Viền đậm hơn một chút
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontSize: '16px',
    color: '#9FC87E',
};

const buttonStyle = {};
const toggleFormButtonStyle = {};
const errorStyle = {};
const successStyle = {};
const titleStyle = {};
// --- Kết thúc CSS Styles ---


function LoginRegister() {
    // --- State cho Đăng Nhập ---
    const [loginNameInput, setLoginNameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const { loginUser, loading: loginLoading, error: loginError, setError: setLoginError } = useUser();

    // --- State cho Đăng Ký ---
    const [regLoginName, setRegLoginName] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regLocation, setRegLocation] = useState('');
    const [regDescription, setRegDescription] = useState('');
    const [regOccupation, setRegOccupation] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [regError, setRegError] = useState('');
    const [regSuccessMessage, setRegSuccessMessage] = useState('');

    const [isLoginView, setIsLoginView] = useState(true);

    const handleLoginSubmit = async (event) => { /* ... code handleLoginSubmit của bạn giữ nguyên ... */ };
    const handleRegisterSubmit = async (event) => { /* ... code handleRegisterSubmit của bạn giữ nguyên ... */ };
    // (Mình sẽ copy lại code của handleLoginSubmit và handleRegisterSubmit từ phiên bản trước cho đầy đủ)

    const handleLoginSubmitFull = async (event) => {
        event.preventDefault();
        setLoginError('');
        if (!loginNameInput.trim()) {
            setLoginError('Vui lòng nhập Tên đăng nhập.');
            return;
        }
        if (!passwordInput) {
            setLoginError('Vui lòng nhập Mật khẩu.');
            return;
        }
        const success = await loginUser(loginNameInput.trim(), passwordInput);
        if (success) {
            console.log('LoginRegister: Đăng nhập thành công.');
            setLoginNameInput('');
            setPasswordInput('');
        } else {
            console.log('LoginRegister: Đăng nhập thất bại.');
            setPasswordInput('');
        }
    };

    const handleRegisterSubmitFull = async (event) => {
        event.preventDefault();
        setRegError('');
        setRegSuccessMessage('');
        if (!regLoginName.trim() || !regPassword || !regFirstName.trim() || !regLastName.trim()) {
            setRegError('Vui lòng điền đầy đủ: Tên đăng nhập, Mật khẩu, Tên, Họ.');
            return;
        }
        if (regPassword !== regPasswordConfirm) {
            setRegError('Mật khẩu và Xác nhận mật khẩu không khớp.');
            return;
        }
        if (regPassword.length < 6) {
            setRegError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        setRegLoading(true);
        try {
            const registrationData = {
                login_name: regLoginName.trim(), password: regPassword,
                first_name: regFirstName.trim(), last_name: regLastName.trim(),
                location: regLocation.trim(), description: regDescription.trim(),
                occupation: regOccupation.trim()
            };
            const response = await axios.post('http://localhost:8081/api/user/', registrationData);
            setRegSuccessMessage(response.data.message || 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
            setRegLoginName(''); setRegPassword(''); setRegPasswordConfirm('');
            setRegFirstName(''); setRegLastName(''); setRegLocation('');
            setRegDescription(''); setRegOccupation('');
        } catch (err) {
            setRegError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            {isLoginView ? (
                // --- FORM ĐĂNG NHẬP ---
                <>
                    <h2 style={titleStyle}>Đăng Nhập</h2>
                    <form onSubmit={handleLoginSubmitFull}> {/* Sử dụng tên hàm mới */}
                        <div style={formGroupStyle}>
                            <label htmlFor="loginName" style={labelStyle}>Tên đăng nhập:</label>
                            <input type="text" id="loginName" value={loginNameInput}
                                   onChange={(e) => { setLoginNameInput(e.target.value); if (loginError) setLoginError(''); }}
                                   disabled={loginLoading} style={inputStyle} placeholder="Nhập tên đăng nhập" />
                        </div>
                        <div style={formGroupStyle}>
                            <label htmlFor="loginPassword" style={labelStyle}>Mật khẩu:</label>
                            <input type="password" id="loginPassword" value={passwordInput}
                                   onChange={(e) => { setPasswordInput(e.target.value); if (loginError) setLoginError(''); }}
                                   disabled={loginLoading} style={inputStyle} placeholder="Nhập mật khẩu" />
                        </div>
                        <button type="submit" disabled={loginLoading} style={buttonStyle}>
                            {loginLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>
                    {loginError && <p style={errorStyle}>{loginError}</p>}
                    <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#EFE4D2' }}>
                        Chưa có tài khoản?{' '}
                        <button onClick={() => { setIsLoginView(false); setLoginError(''); setRegError(''); setRegSuccessMessage(''); }} style={toggleFormButtonStyle}>
                            Đăng ký ngay
                        </button>
                    </p>
                </>
            ) : (
                // --- FORM ĐĂNG KÝ ---
                <>
                    <h2 style={titleStyle}>Đăng Ký Tài Khoản Mới</h2>
                    <form onSubmit={handleRegisterSubmitFull}> {/* Sử dụng tên hàm mới */}
                        {/* Tên đăng nhập (Đăng ký) */}
                        <div style={formGroupStyle}>
                            <label htmlFor="regLoginName" style={labelStyle}>Tên đăng nhập (*):</label>
                            <input type="text" id="regLoginName" value={regLoginName}
                                   onChange={(e) => {setRegLoginName(e.target.value); if(regError) setRegError(''); if(regSuccessMessage) setRegSuccessMessage('');}}
                                   disabled={regLoading} style={inputStyle} placeholder="Tên bạn muốn dùng để đăng nhập"/>
                        </div>
                        {/* Mật khẩu (Đăng ký) */}
                        <div style={formGroupStyle}>
                            <label htmlFor="regPassword" style={labelStyle}>Mật khẩu (*):</label>
                            <input type="password" id="regPassword" value={regPassword}
                                   onChange={(e) => {setRegPassword(e.target.value); if(regError) setRegError('');}}
                                   disabled={regLoading} style={inputStyle} placeholder="Ít nhất 6 ký tự"/>
                        </div>
                        {/* Xác nhận Mật khẩu (Đăng ký) */}
                        <div style={formGroupStyle}>
                            <label htmlFor="regPasswordConfirm" style={labelStyle}>Xác nhận mật khẩu (*):</label>
                            <input type="password" id="regPasswordConfirm" value={regPasswordConfirm}
                                   onChange={(e) => {setRegPasswordConfirm(e.target.value); if(regError) setRegError('');}}
                                   disabled={regLoading} style={inputStyle} placeholder="Nhập lại mật khẩu"/>
                        </div>
                        {/* Tên (Đăng ký) */}
                        <div style={formGroupStyle}>
                            <label htmlFor="regFirstName" style={labelStyle}>Tên (*):</label>
                            <input type="text" id="regFirstName" value={regFirstName}
                                   onChange={(e) => {setRegFirstName(e.target.value); if(regError) setRegError('');}}
                                   disabled={regLoading} style={inputStyle} />
                        </div>
                        {/* Họ (Đăng ký) */}
                        <div style={formGroupStyle}>
                            <label htmlFor="regLastName" style={labelStyle}>Họ (*):</label>
                            <input type="text" id="regLastName" value={regLastName}
                                   onChange={(e) => {setRegLastName(e.target.value); if(regError) setRegError('');}}
                                   disabled={regLoading} style={inputStyle} />
                        </div>
                        {/* Các trường tùy chọn */}
                        <div style={formGroupStyle}>
                            <label htmlFor="regLocation" style={labelStyle}>Địa điểm:</label>
                            <input type="text" id="regLocation" value={regLocation} onChange={(e) => setRegLocation(e.target.value)} disabled={regLoading} style={inputStyle} />
                        </div>
                        <div style={formGroupStyle}>
                            <label htmlFor="regDescription" style={labelStyle}>Mô tả:</label>
                            <textarea id="regDescription" value={regDescription} onChange={(e) => setRegDescription(e.target.value)} rows="3" disabled={regLoading} style={inputStyle} />
                        </div>
                        <div style={formGroupStyle}>
                            <label htmlFor="regOccupation" style={labelStyle}>Nghề nghiệp:</label>
                            <input type="text" id="regOccupation" value={regOccupation} onChange={(e) => setRegOccupation(e.target.value)} disabled={regLoading} style={inputStyle} />
                        </div>
                        <button type="submit" disabled={regLoading} style={buttonStyle}>
                            {regLoading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </form>
                    {regError && <p style={errorStyle}>{regError}</p>}
                    {regSuccessMessage && <p style={successStyle}>{regSuccessMessage}</p>}
                    <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#4A5568' }}>
                        Đã có tài khoản?{' '}
                        <button onClick={() => { setIsLoginView(true); setLoginError(''); setRegError(''); setRegSuccessMessage(''); }} style={toggleFormButtonStyle}>
                            Đăng nhập
                        </button>
                    </p>
                </>
            )}
        </div>
    );
}

export default LoginRegister;