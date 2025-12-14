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
    const [showModels, setShowModels] = useState(false);
    const [selectedModel, setSelectedModel] = useState("ChatGpt");
    const {setGlobalModel, selectedTools, setSelectedTools} = useTools();

    useEffect(() => {
      setGlobalModel(modelMeta[selectedModel].value);
      console.log(modelMeta[selectedModel].value);
    },[selectedModel]);


    const tools = {
      "🌐 Web Search": 1,
        "📎 Attach File": 2,
        "📖 Research": 3,
        "🤔 Deep Thinking": 4,
        "🎤 Voice Input": 5,
    }

    const modelMeta = {
      ChatGpt: {
        value: "openai/gpt-oss-20b:free",
        logo: "/models/chatgpt.png",
        desc: "Balanced reasoning, great for most tasks",
        time: "3–5 sec"
      },
      DeepSeek: {
        value: "tngtech/deepseek-r1t2-chimera:free",
        logo: "/models/deepseek.png",
        desc: "Fast & powerful reasoning",
        time: "2–4 sec"
      },
      Mistral: {
        value: "mistralai/devstral-2512:free",
        logo: "/models/mistral.png",
        desc: "Strong for knowledge tasks",
        time: "2–3 sec"
      },
      Llamma: {
        value: "meta-llama/llama-3.3-70b-instruct:free",
        logo: "/models/meta.png",
        desc: "Excellent for conversations",
        time: "3–5 sec"
      },
      Gemini: {
        value: "google/gemma-3-27b-it:free",
        logo: "/models/gemini.png",
        desc: "Great at multilingual + logic",
        time: "2–3 sec"
      },
      Qwen: {
        value: "qwen/qwen3-coder:free",
        logo: "/models/qwen.png",
        desc: "Best for coding tasks",
        time: "1–2 sec"
      }
    };


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
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 
                        bg-white/70 backdrop-blur-md px-3 py-2 shadow-sm hover:bg-gray-300"
            >
              <img src={modelMeta[selectedModel].logo} className="w-5 h-5 rounded" />
              <span className="font-medium">{selectedModel}</span>
              <span className="text-xs text-slate-500 ml-1">Smart</span>
            </button>

            {showModels && (
              <div className="absolute bottom-12 left-0 w-72 rounded-xl border border-slate-200 
                              bg-white/70 backdrop-blur-xl shadow-2xl p-3 
                              animate-slideFade z-50">
                {Object.entries(modelMeta).map(([name, info]) => {
                  const active = selectedModel === name;

                  return (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedModel(name);
                        setShowModels(false);
                      }}
                      className={`w-full flex items-center justify-between text-left 
                                px-3 py-2 rounded-lg transition
                                ${active ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={info.logo} className="w-6 h-6 rounded" />
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-xs opacity-70">{info.desc}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full 
                            bg-slate-200 text-slate-700">
                          {info.time}
                        </span>

                        <span
                          className={`h-4 w-4 rounded-full border 
                          ${active ? "border-white bg-white" : "border-slate-400"}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>




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