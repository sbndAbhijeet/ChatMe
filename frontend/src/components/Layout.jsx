import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./SideBar";

const Layout = () => {
  const location = useLocation();
  const isChatbotPage = location.pathname === '/chatbot';

  return (
    <div className="flex flex-col min-h-screen bg-[#F2E3BC]/10">
      {!isChatbotPage && <Header />}
      
      {/* Main content area with full-height sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - only shown on /chatbot and extends to bottom */}
        {isChatbotPage && (
          <div className="shrink-0 bg-[#414535]">
            <Sidebar />
          </div>
        )}
        
        {/* Main content area with scrollable content */}
        <main className="flex-1 flex flex-col overflow-auto">
          <Outlet />
          
          {/* Footer - only shown outside /chatbot */}
          {!isChatbotPage && <Footer />}
        </main>
      </div>
    </div>
  );
};

export default Layout;