// Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useHistory } from '../hooks/ChatHistory';
import {MoreVertical} from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrash, faPenToSquare, faFloppyDisk} from "@fortawesome/free-solid-svg-icons"


const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const {id} = useParams();
  const {isTyping} = useHistory();
  const [showMenu, setShowMenu] = useState({menu: false, key: ""});
  const [rename, setRename] = useState({id: -1, rename: false})
  const [selectedId, setSelectedId] = useState(null);

  const navItems = [
    { path: '/', icon: '💬', label: 'New Chat', end: true },
    { path: '/other', icon: '⚙️', label: 'Other Features' },
    // Add more items as needed
  ];

  const {history, setHistory, renameChat, deleteChatSession} = useHistory();

  //load saved chat on mount
  // useEffect(() => {
  //   const savedId = localStorage.getItem("currentChatId");
  //   if (savedId) {
  //     setSelectedId(savedId);
  //   }
  // }, []);

  // //when selectedId changes, update localStorage
  // useEffect(() => {
  //   if (selectedId) {
  //     localStorage.setItem("currentChatId", selectedId);
  //   }
  // }, [selectedId]);

  const renameSession = (chatId) => {
    if(rename.id !== -1 && chatId === rename.id){
      setRename({rename: !rename.rename, id: chatId})
    } else {
      setRename({rename: true, id: chatId})
    }
    // setRename({id: chatId, rename: !rename.rename})
    // if(rename.rename === true) console.log(rename)
  }

  const handleTitle = async () => {
    setHistory(prev => 
      prev.map(chat => 
        chat.id === rename.id ? {...chat, title: rename.title} : chat
      )
    )

    // Optionally send to backend here
    await renameChat(rename.id, rename.title);

    setRename({ id: -1, rename: false, title: "" });
    
  }

  const deleteSession = async () => {
    console.log(`Delete-${showMenu.key}`)
    const session = showMenu.key;
    console.log(history)
    const newHistory = history.filter((chat) => chat.id !== session)
    setHistory(newHistory)

    await deleteChatSession(session);
  }


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

      {/* Recent Chats Section */}
      {!isCollapsed && (
        <div className="px-3 mb-4">
          <h3 className="text-xs uppercase font-semibold text-[#C19875] mb-2 px-2">Recent Chats</h3>
          <div className="space-y-1">
            { history.filter(chat => chat && chat.id).slice().reverse().map(chat => (
              <Link
                key={chat.id}
                to={`/chatbot/${chat.id}`} // You would need to set up this route
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
                  className='bg-[#618985]/30 rounded-md px-2 py-1 text-smaw'
                  defaultValue={chat.title}
                  // value={}
                  onChange = {(e) => setRename({...rename, title: e.target.value})}
                  /> : <p>{chat.title}</p>}
                  
                  {isTyping ? <p className={`${(chat.id === id && isTyping)? "w-4 h-4 border-3 border-dashed rounded-full animate-spin border-[#96BBBB]" : ""}`}></p> : 
                  <button 
                  onClick = {() => {
                    if(showMenu.key !== -1 && chat.id === showMenu.key){
                      setShowMenu({menu: !showMenu.menu, key: chat.id})
                    } else {
                      setShowMenu({menu: true, key: chat.id})
                    }
                    
                    console.log(chat.id)}
                  }
                  className='p-1 hover:bg-gray-500 rounded'
                  >
                    <MoreVertical size={16} />
                  </button>}
                </div>

                {(showMenu.menu && chat.id === showMenu.key) && (
                  <div className='flex'>
                    <button
                      className="p-1 hover:cursor-pointer text-green-600"
                      onClick={() => renameSession(chat.id)}
                    >
                      {rename.rename === true ? 
                      <FontAwesomeIcon
                      onClick={() => handleTitle()}
                      icon={faFloppyDisk} /> : <FontAwesomeIcon icon={faPenToSquare} />}
                    </button>
                    <button
                       className="p-1 hover:cursor-pointer text-red-600"
                       onClick={() => deleteSession()}
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