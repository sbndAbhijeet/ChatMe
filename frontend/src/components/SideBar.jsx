// Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '💬', label: 'New Chat', end: true },
    { path: '/other', icon: '⚙️', label: 'Other Features' },
    // Add more items as needed
  ];

  const chatHistory = [
    { id: 1, title: 'Marketing strategy ideas' },
    { id: 2, title: 'Python code review' },
    { id: 3, title: 'Content calendar planning' },
    // Would typically come from your API/local storage
  ];

  return (
    <div className={`flex flex-col h-full bg-[#414535] text-[#F2E3BC] transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Collapse Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-3 hover:bg-[#618985]/30 flex items-center justify-center"
      >
        {isCollapsed ? '🫣': '🙂'}
      </button>

      {/* New Chat Button */}
      <Link
        to="/"
        className={`mx-2 mb-4 rounded-md hover:bg-[#618985]/30 flex items-center ${location.pathname === '/' ? 'bg-[#618985]/50' : ''}`}
      >
        <span className="p-3 text-xl">{'💬'}</span>
        {!isCollapsed && <span className="ml-2">New Chat</span>}
      </Link>

      {/* Recent Chats Section */}
      {!isCollapsed && (
        <div className="px-3 mb-4">
          <h3 className="text-xs uppercase font-semibold text-[#C19875] mb-2 px-2">Recent Chats</h3>
          <div className="space-y-1">
            {chatHistory.map(chat => (
              <Link
                key={chat.id}
                to={`/chat/${chat.id}`} // You would need to set up this route
                className="block px-3 py-2 text-sm rounded-md hover:bg-[#618985]/30 truncate"
              >
                {chat.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="mt-auto mb-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mx-2 rounded-md hover:bg-[#618985]/30 flex items-center ${location.pathname === item.path ? 'bg-[#618985]/50' : ''}`}
          >
            <span className="p-3 text-xl">{item.icon}</span>
            {!isCollapsed && <span className="ml-2">{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div className={`flex items-center p-3 border-t border-[#618985]/30 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#96BBBB] flex items-center justify-center text-[#414535] font-bold">
            U
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <div className="text-sm font-medium">User Name</div>
              <div className="text-xs text-[#C19875]">Free Plan</div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button className="text-sm hover:text-[#96BBBB]">Logout</button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;