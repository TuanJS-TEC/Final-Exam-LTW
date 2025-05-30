// frontend/src/App.jsx
import { useState } from 'react';
import './App.css';
import { UserProvider, useUser } from "./context/UserContext.jsx";
import LoginRegister from "./components/LoginRegister.jsx";
import TopBar from './components/TopBar'; // 1. IMPORT TopBar

function AppContent() {
    const { currentUser } = useUser();
    const [count, setCount] = useState(0); // Vẫn giữ lại state demo của Vite

    return (
        <> {/* Sử dụng Fragment vì TopBar và phần còn lại là anh em */}
            <TopBar /> {/* 2. THÊM TopBar VÀO ĐÂY */}

            <div style={{ padding: '20px' }}> {/* Thêm padding cho nội dung bên dưới TopBar */}
                {!currentUser ? (
                    <LoginRegister />
                ) : (
                    <>
                        <h1>Photo Sharing App (Frontend)</h1>
                        <hr />
                        <div>
                            <h2>Welcome, {currentUser.first_name} {currentUser.last_name}!</h2>
                            <p>(Your Login Name: {currentUser.login_name})</p>
                        </div>
                        <hr />
                        <div className="card">
                            <button onClick={() => setCount((count) => count + 1)}>
                                count is {count}
                            </button>
                            <p>
                                You are logged in! Edit <code>src/App.jsx</code> and save to test HMR.
                            </p>
                        </div>
                        <p className="read-the-docs">
                            Click on the Vite and React logos to learn more.
                        </p>
                    </>
                )}
            </div>
        </>
    );
}

function App() {
    return (
        <UserProvider>
            <AppContent />
        </UserProvider>
    );
}

export default App;