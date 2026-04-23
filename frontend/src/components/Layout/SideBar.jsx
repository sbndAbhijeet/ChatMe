import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useHistory } from '../../hooks/GlobalChatHistory';
import {MoreVertical, Plus} from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrash, faPenToSquare, faFloppyDisk} from "@fortawesome/free-solid-svg-icons"

import { useBlog } from '../../hooks/BlogContext';
import { useNotes } from '../../hooks/NoteContext';
import { useAuth } from '../../hooks/AuthContext';


const Sidebar = ({ type }) => {
  const chatPage = type === "chat";
  const blogPage = type === "blog";
  const notePage = type === "note";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const {id} = useParams();
  const navigate = useNavigate(); // ✅ Add this
  
  // always call hooks in the same order, unconditionally
  const {history, setHistory, renameChat, deleteChatSession, isTyping} = useHistory();
  const {blogs} = useBlog();
  const {notes} = useNotes();
  const { logout, userId } = useAuth();
  
  const [showMenu, setShowMenu] = useState({menu: false, key: ""});
  const [rename, setRename] = useState({id: -1, rename: false})
  const [selectedId, setSelectedId] = useState(null);
  const [addBlog, setAddBlog] = useState(false);
  const [expandedBlogs, setExpandedBlogs] = useState({});

  const navItems = [
    { path: '/', icon: '💬', label: 'New Chat', end: true },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const renameSession = (chatId) => {
    if(rename.id !== -1 && chatId === rename.id){
      setRename({rename: !rename.rename, id: chatId})
    } else {
      setRename({rename: true, id: chatId})
    }
  }

  const handleTitle = async () => {
    setHistory(prev => 
      prev.map(chat => 
        chat.id === rename.id ? {...chat, title: rename.title} : chat
      )
    )

    await renameChat(rename.id, rename.title);
    setRename({ id: -1, rename: false, title: "" });
  }

  const deleteSession = async () => {
    console.log(`Delete-${showMenu.key}`)
    const session = showMenu.key;
    
    //Check if we're deleting the current chat
    const isDeletingCurrentChat = String(session) === String(id);
    
    console.log(history)
    const newHistory = history.filter((chat) => chat.id !== session)
    setHistory(newHistory)

    await deleteChatSession(session);
    
    // navigate away if deleting current chat
    if (isDeletingCurrentChat) {
      // Navigate to the most recent chat or new chat
      // if (newHistory.length > 0) {
      //   navigate(`/chatbot/${newHistory[newHistory.length - 1].id}`);
      // } else {
      // }
      navigate('/chatbot/0');
    }
    
    //Closing the menu
    setShowMenu({menu: false, key: ""});
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        to="/chatbot/0"
        className={`mx-2 mb-4 rounded-md hover:bg-[#618985]/30 flex items-center ${location.pathname === '/' ? 'bg-[#618985]/50' : ''}`}
      >
        <span className="p-3 text-xl">{'💬'}</span>
        {!isCollapsed && <span className="ml-2">New Chat</span>}
      </Link>
      
      <Link
        to="/blogs"
        className={`mx-2 mb-4 rounded-md hover:bg-[#618985]/30 flex items-center ${location.pathname === '/' ? 'bg-[#618985]/50' : ''}`}
      >
        <span className="p-3 text-xl">{'📝'}</span>
        {!isCollapsed && <span className="ml-2">Blogs</span>}
      </Link>

      {/* Recent Chats Section */}
      {!isCollapsed && chatPage && (
        <div className="px-3 mb-4">
          <h3 className="text-md uppercase font-semibold text-[#C19875] mb-2 px-2">Recent Chats</h3>
          <div className="space-y-1">
            {history.filter(chat => chat && chat.id).slice().reverse().map(chat => (
              <Link
                key={chat.id}
                to={`/chatbot/${chat.id}`}
                className={`block px-3 py-2 text-sm rounded-md truncate ${showMenu.key === chat.id ? 'relative group' : ""}
                  ${chat.id !== id && isTyping ? "pointer-events-none text-gray-400" : "hover:bg-[#618985]/30"} `}
                onClick={(e) => {
                  if(chat.id !== id && isTyping){
                    e.preventDefault();
                  }
                }}
              >
                <div className='flex justify-between'>
                  {rename.id === chat.id && rename.rename === true ? 
                    <input 
                      type="text" 
                      className='bg-[#618985]/30 rounded-md px-2 py-1 text-sm w-full'
                      defaultValue={chat.title}
                      onChange={(e) => setRename({...rename, title: e.target.value})}
                    /> 
                    : <p>{chat.title}</p>
                  }
                  
                  {isTyping ? 
                    <p className={`${(chat.id === id && isTyping)? "w-4 h-4 border-3 border-dashed rounded-full animate-spin border-[#96BBBB]" : ""}`}></p> 
                    : 
                    <button 
                      onClick={(e) => {
                        e.preventDefault(); // ✅ Prevent navigation
                        if(showMenu.key !== -1 && chat.id === showMenu.key){
                          setShowMenu({menu: !showMenu.menu, key: chat.id})
                        } else {
                          setShowMenu({menu: true, key: chat.id})
                        }
                      }}
                      className='p-1 hover:bg-gray-500 rounded'
                    >
                      <MoreVertical size={16} />
                    </button>
                  }
                </div>

                {(showMenu.menu && chat.id === showMenu.key) && (
                  <div className='flex' onClick={(e) => e.preventDefault()}> {/* ✅ Prevent navigation */}
                    <button
                      className="p-1 hover:cursor-pointer text-green-600"
                      onClick={(e) => {
                        e.preventDefault();
                        renameSession(chat.id);
                      }}
                    >
                      {rename.rename === true ? 
                        <FontAwesomeIcon
                          onClick={(e) => {
                            e.preventDefault();
                            handleTitle();
                          }}
                          icon={faFloppyDisk} 
                        /> 
                        : <FontAwesomeIcon icon={faPenToSquare} />
                      }
                    </button>
                    <button
                      className="p-1 hover:cursor-pointer text-red-600"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteSession();
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Blogs Section */}
      {!isCollapsed && (blogPage || notePage) && (
        <div className="px-3 mb-4">
          <h3 className="text-md uppercase font-semibold text-[#C19875] mb-2 px-2">
            Recent Blogs
          </h3>
          <div className="space-y-1">
            {blogs.map(blog => {
              const blogNotes = notes.filter(
                n => String(n.blog_id) === String(blog.blog_id)
              );
              
              return (
                <div key={blog.blog_id} className="mb-1">
                  <div
                    onClick={() =>
                      setExpandedBlogs(prev => ({
                        ...prev,
                        [blog.blog_id]: !prev[blog.blog_id]
                      }))
                    }
                    className="cursor-pointer px-3 py-2 text-sm rounded-md hover:bg-[#618985]/30 flex justify-between items-center"
                  >
                    {blog.blog_name}
                    <span className="text-xs">
                      {expandedBlogs[blog.blog_id] ? '▲' : '▼'}
                    </span>
                  </div>

                  {expandedBlogs[blog.blog_id] && (
                    <div className="ml-4 pl-2 border-l border-gray-300">
                      {blogNotes.map(note => (
                        <Link
                          key={note.note_id}
                          to={`/blogs/${blog.blog_id}/note/${note.note_id}`}
                        >
                          <div
                            className="block cursor-pointer px-3 py-2 text-sm rounded-md hover:bg-[#618985]/30"
                          >
                            {note.title}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
              <div className="text-sm font-medium">{userId ? `User-${userId.slice(-4)}` : 'User'}</div>
              <div className="text-xs text-[#C19875]">Free Plan</div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button onClick={handleLogout} className="text-sm hover:text-[#96BBBB]">Logout</button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;