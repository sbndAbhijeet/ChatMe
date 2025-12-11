import { useEffect, useState, useRef } from 'react';
import {useParams, useNavigate, useLocation}  from "react-router-dom"
import logo from "../assets/non-bg-logo.png";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useHistory } from '../hooks/GlobalChatHistory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCirclePlus} from "@fortawesome/free-solid-svg-icons"
import SelectedTools from "../components/SelectedTools";
import { useTools } from "../hooks/GlobalTools";

const Input = (
    {message, setMessage, handleSubmit, isTyping}
) => {
    const [toolMenu, setToolMenu] = useState(false);
    const tools = {
      "🌐 Web Search": 1,
        "📎 Attach File": 2,
        "📖 Research": 3,
        "🤔 Deep Thinking": 4,
        "🎤 Voice Input": 5,
    }

    const {selectedTools, setSelectedTools} = useTools();
    

    function handleTool(tool){
        // const val = tools[tool];
        // console.log(val);
        console.log(tool)
        setSelectedTools(prev => {
            if(prev.includes(tool)){
                //remove
                return prev.filter(t => t !== tool);
            } else {
                //add
                return [...prev, tool];
            }
        });
    }

    return (
        <div className="border-t border-[#618985]/30 p-4 shrink-0">
        <SelectedTools />
        <form onSubmit={handleSubmit} className="flex gap-2">
        <div className='relative'>
          <img 
            src="../src/assets/glitter.png" 
            alt="options" 
            className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform m-2 p-0.5 hover:bg-[#fffeb9] rounded-2xl" 
            onClick={() => setToolMenu(prev => !prev)}
          />
          {/* Dropdown Card */}
          {toolMenu && (
            <div className="absolute bottom-8 left-0 w-40 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-2 animate-fadeIn">
                {Object.entries(tools).map(([label, val]) => (
                    <button 
                    key={val}
                    type="button"
                    onClick={() => handleTool(val)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg"
                    >
                        {label}
                    </button>
                ))}
            </div>
          )}
        </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-[#618985]/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96BBBB]"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            className="bg-[#618985] text-[#F2E3BC] px-4 py-2 rounded-lg hover:bg-[#96BBBB] transition-colors disabled:opacity-50"
          >
            {isTyping ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    );
}

export default Input;