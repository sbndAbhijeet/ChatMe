import { useEffect, useState, useRef } from 'react';
import {useParams, useNavigate, useLocation}  from "react-router-dom"
import { post_message } from "../api/chatApi";
import logo from "../assets/non-bg-logo.png";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useHistory } from '../hooks/ChatHistory';

function ChatBot() {
  const [message, setMessage] = useState("");
  const {isTyping, setIsTyping} = useHistory();
  const [displayedBotMessage, setDisplayedBotMessage] = useState("");

  const messagesContainerRef = useRef(null);

  const {history, setHistory, processUserInput, createChat, historyLoading} = useHistory();
  const { id: chat_session} = useParams();//will be in string
  const navigate = useNavigate();
  // console.log(typeof(chat_session))
  // if (historyLoading) return <div>Loading...</div>;
  const currentChat = history.find(chat => String(chat.id) === chat_session);


  // console.log(currentChat)
  const chatHistory = chat_session === "0" ? [] : currentChat?.messages ?? [];
  const location = useLocation();

  

  // Load chat messages for current session
  // useEffect(() => {
  //   const currentChat = history.find((chat) => chat.id === Number(chat_session))
  //   if(currentChat) setChatHistory(currentChat.messages)
  //   if(chat_session === "0"){
  //     setChatHistory("")
  //   }
  //   // console.log(chatHistory)
  //   // console.log(history)
  //   // console.log(chat_session)
  // },[history, chat_session])

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
    const tempId = chat_session;

    setIsTyping(true)

    setHistory(prev => 
      prev.map(chat => 
        chat.id === tempId
        ? {...chat, messages: [...chat.messages, userMessage, {sender: "bot", message: "", isLoading: true}]}
        : chat
      )
    )

    try {
      const botResponse = await processUserInput(tempId, user_msg);
      console.log(botResponse)
      const botMessage = {sender: 'bot', message: ''}

      setHistory(
        prev => 
          prev.map(chat => 
            chat.id === tempId ?
            {...chat, messages: [...chat.messages.filter(msg => !msg.isLoading), botMessage]}
            : chat
          )
        );
      
      let index = 0;
      const interval = setInterval(() => {
        setHistory(prev => prev.map(
          chat => chat.id === tempId 
          ? {
            ...chat, 
            messages: chat.messages.map((m,i) => i === chat.messages.length - 1 ?
            {...m, message: botResponse.substring(0, index+1)} : m)
          }
          : chat
        ))
        index++;
        if (index === botResponse.length) {
          clearInterval(interval);
          setIsTyping(false);

          // Now insert the full bot message into history
          setHistory(prev => prev.map(chat =>
            chat.id === tempId
              ? { ...chat, messages: [...chat.messages.slice(0, -1), { sender: 'bot', message: botResponse }] }
              : chat
          ));


        }
      }, 30);
    }
    catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
      // Replace loader with an error message
      setHistory(prev => 
        prev.map(chat => 
          chat.id === tempId ?
          {...chat, messages: [...chat.messages.filter(msg => !msg.isLoading), { sender: 'bot', message: "Sorry, something went wrong!" }]
          } : chat 
        )
      );
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const currentMessage = message;
    setMessage(""); // Clear input immediately

    if(chat_session === "0"){
      const newId = history.length > 0 ? history.length+1 : 1;
      const doc_id = await createChat(newId);
      setHistory(prev => [
        ...prev,
        {
          id: doc_id,
          title:`New Chat - ${newId}`,
          messages:[{sender: 'bot', message: currentMessage}]
        }
      ])
      navigate(`/chatbot/${String(doc_id)}`, {state: {initialMessage: currentMessage}});
    } else {
      await handleSendMessage(currentMessage);
    }
  };

  // if (!currentChat) {
  //   return <div>Loading chat...</div>; // or skeleton loader
  // }

  if (!currentChat && chat_session !== "0") {
    return (<p>Chat session not found!</p>)
  }

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
          chatHistory.map((chat, index) => {
            const isLast = index === chat.length-1;
            const isBot = chat.sender !== "user";

            return (
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
                      {isTyping && isLast && isBot ? displayedBotMessage : chat.message}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
            )
          })
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