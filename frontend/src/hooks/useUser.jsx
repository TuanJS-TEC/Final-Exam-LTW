// frontend/src/hooks/useUser.jsx
import { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx'; // Import UserContext (object) từ file context

// Dinh nghia custom hook useUser de tien truy cap context - Quan ly T.T Nguoi dung toan cuc

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {

        throw new Error('useUser must be used within a UserProvider. Make sure your component is a child of UserProvider in the component tree.');
    }
    return context;
};