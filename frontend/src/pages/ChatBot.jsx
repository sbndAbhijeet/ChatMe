import { useEffect, useState, useRef } from 'react';
import { post_message } from "../api/chatApi";
import logo from "../assets/non-bg-logo.png";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatBot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    // Add user message
    setChatHistory(prev => [...prev, { sender: 'user', content: message }]);
    setMessage("");
    
    // Show loading
    setIsTyping(true);
    setChatHistory(prev => [...prev, { sender: 'bot', content: "", isLoading: true }]);

    try {
      const res = await post_message(message);
      
      // Replace loading with empty message
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory.pop();
        return [...newHistory, { sender: 'bot', content: "" }];
      });

      // Typewriter effect
      let index = 0;
      const interval = setInterval(() => {
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = res.substring(0, index + 1);
          return newHistory;
        });
        index++;
        
        if (index === res.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      
    } catch (error) {
      console.error("Error:", error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory.pop();
        return [...newHistory, { sender: 'bot', content: "Sorry, something went wrong!" }];
      });
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="border-b border-[#618985]/30 p-4 shrink-0">
        <h1 className="text-2xl font-semibold text-[#414535] flex items-center">
          <img src={logo} alt="logo" className="h-8 w-8 mr-2 rounded-sm" />
          Lumin Chat
        </h1>
      </div>

      {/* Scrollable Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 120px)' }} // Adjust based on your header/input height
      >
        {chatHistory.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-[#414535]/70">
              <p className="text-xl">Hello there!</p>
              <p>How can I help you today?</p>
            </div>
          </div>
        ) : (
          chatHistory.map((chat, index) => (
            <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg p-3 max-w-3xl ${
                chat.sender === 'user' 
                  ? 'bg-[#96BBBB] text-[#414535]' 
                  : 'bg-white text-[#414535] shadow-sm'
              }`}>
                {chat.isLoading ? (
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#618985] animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-[#618985] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#618985] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : (
                  <div>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {chat.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="border-t border-[#618985]/30 p-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
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
    </div>
  );
}

export default ChatBot;