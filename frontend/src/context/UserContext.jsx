// frontend/src/context/UserContext.jsx
import React, { createContext, useState } from 'react'; // Bỏ 'useContext' khỏi đây vì không dùng trực tiếp nữa
import axios from 'axios';

//Dinh nghia UserContext Object va UserProvider

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const loginUser = async (loginName, password) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:8081/admin/login', {
                login_name: loginName,
                password: password
            },{
                withCredentials: true,
            });

            if (response.data) {
                setCurrentUser(response.data);
                console.log('Login successful (from Context):', response.data);
                return true;
            } else {
                setError('Login failed: No user data received.');
                setCurrentUser(null);
                return false;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please check credentials or server status.';
            setError(errorMessage);
            console.error('Login error details (from Context):', err.response || err);
            setCurrentUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    };


    const logoutUser = async () => {
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:8081/admin/logout',{},{
                withCredentials: true,
            });
            setCurrentUser(null);
            console.log('Logout successful (from Context)'); // Sửa log
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Logout failed. Please try again.'; // Dùng optional chaining
            setError(errorMessage);
            console.error('Logout error details (from Context):', err.response || err); // Sửa log
            return false;
        } finally {
            setLoading(false);
        }
    };

    const contextValue = {
        currentUser,
        loading,
        error,
        loginUser,
        logoutUser,
        setError,
        setCurrentUser
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};