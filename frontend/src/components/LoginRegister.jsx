// frontend/src/components/LoginRegister.jsx
import React, { useState } from 'react';
import { useUser } from "../hooks/useUser.jsx"; // Đường dẫn đúng đến hook

function LoginRegister() {
    const [loginNameInput, setLoginNameInput] = useState('');
    const { loginUser, loading, error, setError } = useUser();

    const handleLogin = async (event) => {
        event.preventDefault();
        if (!loginNameInput.trim()) {
            setError('Please enter a login name.');
            return;
        }
        const success = await loginUser(loginNameInput);
        if (success) {
            console.log('LoginRegister: Login successful, currentUser should be updated.');
            setLoginNameInput('');
        } else {
            console.log('LoginRegister: Login failed.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="loginName">Login Name:</label>
                    <input
                        type="text"
                        id="loginName"
                        value={loginNameInput}
                        onChange={(e) => {
                            setLoginNameInput(e.target.value);
                            if (error) setError('');
                        }}
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default LoginRegister;