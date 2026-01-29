import React from "react";
import { Outlet, useLocation, useMatch, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./SideBar";

const Layout = () => {
  const location = useLocation();
  // const parm = useParams();
  // console.log(parm) // {id: '1'}
  const chat_match = Boolean(useMatch("/chatbot/:id"));
  const blog_match = Boolean(useMatch("/blogs"));
  const note_match = Boolean(useMatch("/blogs/:id/note/:id"));
  const Page = blog_match || chat_match || note_match;

  return (
    <div className="flex flex-col min-h-screen bg-[#F2E3BC]/10">
      {!Page && <Header />}
      
      {/* Main content area with full-height sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - only shown on /chatbot and extends to bottom */}
        {Page && (
          <div className="shrink-0 bg-[#414535]">
            <Sidebar chatPage={chat_match} blogPage={blog_match} notePage={note_match}/>
          </div>
        )}
        
        {/* Main content area with scrollable content */}
        <main className="flex-1 flex flex-col overflow-auto">
          <Outlet />
          
          {/* Footer - only shown outside /chatbot */}
          {!Page && <Footer />}
        </main>
      </div>
    </div>
  );
};

export default Layout;