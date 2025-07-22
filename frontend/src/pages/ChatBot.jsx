import { useEffect, useState, useRef } from 'react';
import {useParams, useNavigate, useLocation}  from "react-router-dom"
import { post_message } from "../api/chatApi";
import logo from "../assets/non-bg-logo.png";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useHistory } from '../hooks/ChatHistory';

function ChatBot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const {isTyping, setIsTyping} = useHistory();
  const messagesContainerRef = useRef(null);

  const { id: chat_session} = useParams();
  const location = useLocation();
  const {history, setHistory} = useHistory();

  const navigate = useNavigate();

  // Load chat messages for current session
  useEffect(() => {
    const currentChat = history.find((chat) => chat.id === Number(chat_session))
    if(currentChat) setChatHistory(currentChat.messages)
    if(chat_session === "0"){
      setChatHistory("")
    }
    // console.log(chatHistory)
    // console.log(history)
    // console.log(chat_session)
  },[history, chat_session])

  //Effect to handle initial message after creating a new chat
  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if(initialMessage){//then coming from /chatbot/0
      handleSendMessage(initialMessage)

      //Clear state from location to prevent re-sending on refresh
      navigate(location.pathname, {replace: true, state: {}})
    }
  },[location.state, chat_session])


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }    
  }, [chatHistory]);

  const handleSendMessage = async (user_msg) => {
    const userMessage = {sender: 'user', message: user_msg};
    setChatHistory(prev => [...prev, userMessage])

    setIsTyping(true)
    setChatHistory(prev => [...prev, {sender: 'bot', message: "", isLoading: true}])

    try {
      const botResponse = await post_message(user_msg);
      const botMessage = {sender: 'bot', message: botResponse}

      setHistory(
        prevHistory => {
          return prevHistory.map(chat => {
            if(chat.id === Number(chat_session)){
              return {...chat, messages: [...chat.messages, userMessage, botMessage]}
            }
            return chat;
          })
        });

      //removing loading indicator
      setChatHistory(prev => prev.filter(msg => !msg.isLoading))

      let index = 0;
      const interval = setInterval(() => {
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].message = botResponse.substring(0, index + 1);
          return newHistory;
        });
        index++;
        if (index === botResponse.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
    }
    catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
      // Replace loader with an error message
      setChatHistory(prev => {
        const newHistory = prev.filter(msg => !msg.isLoading);
        return [...newHistory, { sender: 'bot', message: "Sorry, something went wrong!" }];
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const currentMessage = message;
    setMessage(""); // Clear input immediately

    if(chat_session === "0"){
      const newId = history.length > 0 ? history.length+1 : 1;

      const newChat = {
        id: newId,
        title: `New Chat - ${newId}`,
        messages: []
      };

      setHistory(prev => [...prev, newChat])  
      navigate(`/chatbot/${newId}`, {state: {initialMessage: currentMessage}});
    } else {
      await handleSendMessage(currentMessage)
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
                      {chat.message}
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