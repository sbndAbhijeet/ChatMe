import { createContext, useContext, useEffect, useState } from "react";
import { getHistory, postMessage, renameTitle, create_new_chat, deleteChat, getOngoingChat } from "../api/chatDocs";

export const ChatHistoryContext = createContext(null);

export const useHistory = () => {
    return useContext(ChatHistoryContext);
}

export const ChatHistoryProvider = (props) => {

    const [history, setHistory] = useState([]);
    // Would typically come from your API/local storage
    const [isTyping, setIsTyping] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const {data, error} = await getHistory();
        if(error){
            alert("Error in Fetching data: "+error)
            return;
        }
        // Don't set history until data is ready
        if (data) setHistory(data);
        else setHistory(history);
    }


    // const updateOngoingChat = (docId, data) => {
    //     const chatData = history.find(
    //         item => item._id === docId
    //     )
    // }

    const processUserInput = async (docId, msg, tools, model) => {
        // Add the user's message to history immediately
        // setHistory(prev =>
        //     prev.map(chat =>
        //         chat.id === docId
        //             ? { ...chat, messages: [...chat.messages, { sender: "user", text: msg }] }
        //             : chat
        //     )
        // );

        const { data, error } = await postMessage(docId, msg, tools, model);
        if (error) return;

        // Add AI reply when it arrives
        // setHistory(prev =>
        //     prev.map(chat =>
        //         chat.id === docId
        //             ? { ...chat, messages: [...chat.messages, { sender: "bot", text: data.reply }] }
        //             : chat
        //     )
        // );
        return data.reply;
    };


    const createChat = async (chatId) => {
        const {data, error} = await create_new_chat(chatId);
        if(error){
            alert("Error in creating new chat: "+error)
            return;
        }
        fetchHistory();
        return data.id;
    }

    const renameChat = async (docId, title) => {
        const {data, error} = await renameTitle(docId, title);
        if(error){
            alert("Error in renaming chat: "+error)
            return;
        }
        fetchHistory();
        return data;
    }

    const deleteChatSession = async (docId) => {
        const {data, error} = await deleteChat(docId);
        if(error){
            alert("Error in deleting chat: "+error)
            return;
        }
        fetchHistory();
        return data;
    }
    

    return (
        <ChatHistoryContext.Provider 
        value= {{
            history,
            setHistory,
            isTyping, 
            setIsTyping, 
            fetchHistory, 
            processUserInput, 
            createChat, 
            renameChat, 
            deleteChatSession,
            setHistoryLoading
        }}
        >
            {props.children}
        </ChatHistoryContext.Provider>
    )
}


//Example
/*
{ 
            id: 1,
            title: 'Marketing strategy ideas',
            messages: [
            { 
            sender: "user",
            message: "Can you tell me some Stratergies of marketing"
            },
            {
            sender: "bot",
            message: "Sure Here are some marketing stratergies: **Know  Your Audience**, **Content is King**, **Build Relations**."
            }
        ]
        },
        { 
        id: 2,
        title: 'Python code review',
        messages: [
            {
            sender: "user",
            message: "def sum (a, b) -> int: return a+b is my code correct"
            },
            {
            sender: "bot",
            message: "No, your code is not correct. While it will likely appear to work in many cases, the is operator is not meant for comparing numerical values for equality. It's for checking object identity (whether two variables point to the same object in memory)."
            }
        ]  
        },
        { 
        id: 3,
        title: 'Favourite Cricketer Sachin',
        messages: [
            {
            sender: "user",
            message: "I am fan of Sachin Can you tell about him"
            },
            {
            sender: "bot",
            message: " Okay, here's a short summary of Sachin Tendulkar:Sachin Tendulkar is widely regarded as one of the greatest cricketers of all time. An Indian icon, he holds numerous batting records, including the most runs in both Test and One Day International (ODI) cricket. He's the only player to have scored 100 international centuries. Known for his incredible technique, dedication, and sportsmanship, Sachin is a national hero in India and an inspiration to millions. He retired from international cricket in 2013 after a remarkable 24-year career."
            }
        ]
        },
*/