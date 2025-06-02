// frontend/src/hooks/useUser.jsx
import { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx'; // Import UserContext (object) từ file context

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        // Lỗi này xảy ra nếu bạn dùng useUser bên ngoài một UserProvider
        throw new Error('useUser must be used within a UserProvider. Make sure your component is a child of UserProvider in the component tree.');
    }
    return context;
};