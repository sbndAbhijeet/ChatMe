import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../../assets/Lumin_logo.png';
import { useAuth } from "../../hooks/AuthContext";

const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-6 py-4 bg-[#618985]">
            {/* Logo/Brand */}
            <div className="flex items-center">
                <img 
                src={logo} 
                alt="Lumin_logo" 
                className="h-14 w-24 rounded-2xl"
                
                />
                {/* <h1 className="text-2xl font-bold text-[#89cdcd] tracking-tight">Lumin</h1> */}
            </div>

            {/* Navigation */}
            <nav className="flex space-x-4">
            {isAuthenticated ? (
                <>
                    <Link
                        to="/chatbot/"
                        className="px-4 py-2 text-[#F2E3BC] hover:text-white rounded-lg transition-colors duration-200 hover:bg-[#96BBBB]/30 font-medium"
                    >
                        ChatBot
                    </Link>
                    <Link
                        to="/blogs"
                        className="px-4 py-2 text-[#F2E3BC] hover:text-white rounded-lg transition-colors duration-200 hover:bg-[#96BBBB]/30 font-medium"
                    >
                        Blogs
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-[#F2E3BC] hover:text-white rounded-lg transition-colors duration-200 hover:bg-[#96BBBB]/30 font-medium"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <Link
                        to="/login"
                        className="px-4 py-2 text-[#F2E3BC] hover:text-white rounded-lg transition-colors duration-200 hover:bg-[#96BBBB]/30 font-medium"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="px-4 py-2 bg-[#F2E3BC] text-[#414535] rounded-lg transition-colors duration-200 hover:bg-white font-semibold"
                    >
                        Register
                    </Link>
                </>
            )}
            </nav>
        </div>
        </header>
    )
}

export default Header;